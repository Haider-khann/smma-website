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
  const q = searchParams.get('q');

  const where: any = {};
  if (status) where.status = status;
  if (q) {
    where.OR = [
      { title: { contains: q } },
      { description: { contains: q } },
    ];
  }

  const projects = await prisma.project.findMany({
    where,
    include: {
      client: { select: { id: true, name: true, email: true } },
      smm: { select: { id: true, name: true, email: true } },
      tasks: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ projects });
}