import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const proposal = await prisma.proposal.findUnique({
    where: { id },
    include: {
      quoteRequest: {
        include: {
          client: { select: { id: true, name: true, email: true } },
          services: { include: { service: true } },
        },
      },
      createdBy: { select: { name: true, email: true } },
    },
  });

  if (!proposal) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ proposal });
}
