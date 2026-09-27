import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const actionSchema = z.object({
  action: z.enum(['ACCEPT', 'REJECT', 'REQUEST_CHANGES']),
  note: z.string().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'CLIENT') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = actionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const proposal = await prisma.proposal.findUnique({
      where: { id },
      include: { quoteRequest: true },
    });

    if (!proposal || proposal.quoteRequest.clientId !== session.user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const { action, note } = parsed.data;

    let status: 'ACCEPTED' | 'REJECTED' | 'CHANGES_REQUESTED';
    if (action === 'ACCEPT') status = 'ACCEPTED';
    else if (action === 'REJECT') status = 'REJECTED';
    else status = 'CHANGES_REQUESTED';

    await prisma.proposal.update({
      where: { id },
      data: {
        status,
        description: note ? proposal.description + '\n\n--- Client feedback: ' + note : proposal.description,
      },
    });

    await prisma.quoteRequest.update({
      where: { id: proposal.quoteRequestId },
      data: { status },
    });

    if (action === 'ACCEPT') {
      await prisma.project.create({
        data: {
          title: proposal.quoteRequest.title,
          description: proposal.quoteRequest.description,
          clientId: session.user.id,
          quoteRequestId: proposal.quoteRequestId,
          status: 'PENDING',
        },
      });
    }

    return NextResponse.json({ success: true, status });
  } catch (error) {
    console.error('Proposal action error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
