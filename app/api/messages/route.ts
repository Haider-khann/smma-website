import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notify } from '@/lib/notify';
import { z } from 'zod';

const messageSchema = z.object({
  receiverId: z.string().min(1),
  body: z.string().min(1),
  attachmentUrl: z.string().nullable().optional(),
  projectId: z.string().nullable().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;

  const sent = await prisma.message.findMany({
    where: { senderId: userId },
    select: { receiverId: true },
  });
  const received = await prisma.message.findMany({
    where: { receiverId: userId },
    select: { senderId: true },
  });

  const contactIds = new Set<string>();
  sent.forEach((m) => contactIds.add(m.receiverId));
  received.forEach((m) => contactIds.add(m.senderId));

  const contacts = await prisma.user.findMany({
    where: { id: { in: Array.from(contactIds) } },
    select: { id: true, name: true, email: true, role: true },
  });

  const conversations = await Promise.all(
    contacts.map(async (c) => {
      const lastMessage = await prisma.message.findFirst({
        where: {
          OR: [
            { senderId: userId, receiverId: c.id },
            { senderId: c.id, receiverId: userId },
          ],
        },
        orderBy: { createdAt: 'desc' },
      });
      const unread = await prisma.message.count({
        where: { senderId: c.id, receiverId: userId, readAt: null },
      });
      return { contact: c, lastMessage, unread };
    })
  );

  conversations.sort((a, b) => {
    const aTime = a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt).getTime() : 0;
    const bTime = b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt).getTime() : 0;
    return bTime - aTime;
  });

  return NextResponse.json({ conversations });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = messageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const message = await prisma.message.create({
      data: {
        senderId: session.user.id,
        receiverId: parsed.data.receiverId,
        body: parsed.data.body,
        attachmentUrl: parsed.data.attachmentUrl || null,
        projectId: parsed.data.projectId || null,
      },
      include: {
        sender: { select: { id: true, name: true, email: true, role: true } },
        receiver: { select: { id: true, name: true, email: true, role: true } },
      },
    });

    const role = (session.user as any).role;
    const link = role === 'CLIENT'
      ? '/staff/messages/' + session.user.id
      : '/dashboard/messages/' + session.user.id;

    await notify({
      userId: parsed.data.receiverId,
      title: 'New Message',
      body: parsed.data.body.slice(0, 80),
      link,
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error('Send message error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}