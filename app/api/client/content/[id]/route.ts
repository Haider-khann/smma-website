import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const actionSchema = z.object({
  action: z.enum(['APPROVE', 'REQUEST_CHANGES']),
  feedback: z.string().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'CLIENT') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = actionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const content = await prisma.content.findUnique({
      where: { id },
      include: { project: true },
    });

    if (!content || content.project.clientId !== session.user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const { action, feedback } = parsed.data;
    const newStatus = action === 'APPROVE' ? 'APPROVED' : 'REVISION_REQUESTED';

    const updated = await prisma.content.update({
      where: { id },
      data: {
        status: newStatus,
        feedback: feedback || content.feedback,
      },
    });

    return NextResponse.json({ content: updated });
  } catch (error) {
    console.error('Client content action error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}