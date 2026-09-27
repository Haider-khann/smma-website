import Link from 'next/link';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function ClientMessagesPage() {
  const session = await auth();
  if (!session?.user) return null;

  const myId = session.user.id;

  const sent = await prisma.message.findMany({
    where: { senderId: myId },
    select: { receiverId: true },
  });
  const received = await prisma.message.findMany({
    where: { receiverId: myId },
    select: { senderId: true },
  });

  const contactIds = Array.from(new Set([
    ...sent.map((m) => m.receiverId),
    ...received.map((m) => m.senderId),
  ]));

  const conversations = await Promise.all(
    contactIds.map(async (cid) => {
      const contact = await prisma.user.findUnique({
        where: { id: cid },
        select: { id: true, name: true, email: true, role: true },
      });
      const lastMessage = await prisma.message.findFirst({
        where: {
          OR: [
            { senderId: myId, receiverId: cid },
            { senderId: cid, receiverId: myId },
          ],
        },
        orderBy: { createdAt: 'desc' },
      });
      const unread = await prisma.message.count({
        where: { senderId: cid, receiverId: myId, readAt: null },
      });
      return { contact, lastMessage, unread };
    })
  );

  conversations.sort((a, b) => {
    const aTime = a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt).getTime() : 0;
    const bTime = b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt).getTime() : 0;
    return bTime - aTime;
  });

  return (
    <div>
      <div className='mb-6'>
        <h1 className='text-3xl font-bold'>Messages</h1>
        <p className='text-gray-600 mt-1'>Chat with your project manager.</p>
      </div>

      {conversations.length === 0 ? (
        <div className='bg-white p-12 rounded-lg shadow-sm border border-gray-100 text-center text-gray-500'>
          No conversations yet. Messages from your assigned project manager will appear here.
        </div>
      ) : (
        <div className='space-y-2'>
          {conversations.map((c) => (
            <Link
              key={c.contact!.id}
              href={'/dashboard/messages/' + c.contact!.id}
              className='block bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow'
            >
              <div className='flex justify-between items-start mb-1'>
                <div>
                  <p className='font-medium'>{c.contact!.name}</p>
                  <p className='text-xs text-gray-500'>{c.contact!.email} · {c.contact!.role}</p>
                </div>
                {c.unread > 0 && (
                  <span className='bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full'>{c.unread}</span>
                )}
              </div>
              {c.lastMessage && (
                <p className='text-sm text-gray-600 truncate'>{c.lastMessage.body}</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}