import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const invitation = await prisma.invitation.findUnique({ where: { id } });
    if (invitation) {
      await prisma.invitation.delete({ where: { id } });
      return NextResponse.json({ success: true, type: 'invitation' });
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (user && user.role === 'SMM') {
      await prisma.user.delete({ where: { id } });
      return NextResponse.json({ success: true, type: 'user' });
    }

    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  } catch (error) {
    console.error('Delete staff error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}