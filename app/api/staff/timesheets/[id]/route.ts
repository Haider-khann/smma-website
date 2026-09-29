import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'SMM') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const entry = await prisma.timesheet.findUnique({ where: { id } });

  if (!entry || entry.userId !== session.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  if (entry.status === 'APPROVED') {
    return NextResponse.json({ error: 'Cannot delete approved entries' }, { status: 403 });
  }

  await prisma.timesheet.delete({ where: { id } });
  return NextResponse.json({ success: true });
}