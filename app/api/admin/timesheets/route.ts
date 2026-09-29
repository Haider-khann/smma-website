import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');

  const where: any = {};
  if (status && status !== 'ALL') where.status = status;

  const entries = await prisma.timesheet.findMany({
    where,
    include: {
      user: { select: { id: true, name: true, email: true } },
      project: { select: { id: true, title: true } },
      reviewedBy: { select: { id: true, name: true } },
    },
    orderBy: { date: 'desc' },
    take: 200,
  });

  return NextResponse.json({ entries });
}