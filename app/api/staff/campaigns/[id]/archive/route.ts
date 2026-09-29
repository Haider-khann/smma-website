import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const schema = z.object({
  action: z.enum(['ARCHIVE', 'RESTORE']),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'SMM') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const existing = await prisma.campaign.findUnique({
      where: { id },
      include: { project: true },
    });
    if (!existing || existing.project.smmId !== session.user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const newStatus = parsed.data.action === 'ARCHIVE' ? 'ARCHIVED' : 'DRAFT';

    const campaign = await prisma.campaign.update({
      where: { id },
      data: { status: newStatus },
    });

    return NextResponse.json({ campaign });
  } catch (error) {
    console.error('Archive campaign error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}