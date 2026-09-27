import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { userId } = await params;
  const myId = session.user.id;

  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: myId, receiverId: userId },
        { senderId: userId, receiverId: myId },
      ],
    },
    include: {
      sender: { select: { id: true, name: true, email: true, role: true } },
    },
    orderBy: { createdAt: 'asc' },
  });

  // Mark unread messages as read
  await prisma.message.updateMany({
    where: {
      senderId: userId,
      receiverId: myId,
      readAt: null,
    },
    data: { readAt: new Date() },
  });

  const otherUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true },
  });

  return NextResponse.json({ messages, otherUser });
}