import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const actionSchema = z.object({
  action: z.enum(['APPROVE', 'REJECT']),
});

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const quote = await prisma.quoteRequest.findUnique({
    where: { id },
    include: {
      client: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          clientProfile: true,
        },
      },
      services: { include: { service: true } },
      proposals: {
        include: { createdBy: { select: { name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!quote) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ quote });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = actionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const status = parsed.data.action === 'APPROVE' ? 'APPROVED' : 'REJECTED';
    const quote = await prisma.quoteRequest.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ quote });
  } catch (error) {
    console.error('Quote action error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
