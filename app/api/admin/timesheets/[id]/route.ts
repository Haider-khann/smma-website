import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { notify } from '@/lib/notify';

const schema = z.object({
  action: z.enum(['APPROVE', 'REJECT']),
  notes: z.string().max(500).optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const existing = await prisma.timesheet.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const newStatus = parsed.data.action === 'APPROVE' ? 'APPROVED' : 'REJECTED';

    const entry = await prisma.timesheet.update({
      where: { id },
      data: {
        status: newStatus,
        reviewedById: session.user.id,
        reviewedAt: new Date(),
        reviewNotes: parsed.data.notes || null,
      },
    });

    await notify({
      userId: existing.userId,
      title: 'Timesheet ' + (newStatus === 'APPROVED' ? 'approved' : 'rejected'),
      body: existing.hours + 'h on ' + new Date(existing.date).toLocaleDateString() + (parsed.data.notes ? ' — ' + parsed.data.notes : ''),
      link: '/staff/timesheets',
    });

    return NextResponse.json({ entry });
  } catch (error) {
    console.error('Timesheet review error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}