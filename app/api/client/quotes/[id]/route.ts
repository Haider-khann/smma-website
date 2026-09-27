import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'CLIENT') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const quote = await prisma.quoteRequest.findUnique({
    where: { id },
    include: {
      services: { include: { service: true } },
      proposals: {
        include: { createdBy: { select: { name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!quote || quote.clientId !== session.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ quote });
}
