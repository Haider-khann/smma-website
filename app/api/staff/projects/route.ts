import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'SMM') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const projects = await prisma.project.findMany({
    where: { smmId: session.user.id },
    select: { id: true, title: true, status: true },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ projects });
}