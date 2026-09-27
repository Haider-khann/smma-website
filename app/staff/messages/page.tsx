import Link from 'next/link';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function StaffMessagesPage() {
  const session = await auth();
  if (!session?.user) return null;

  const myId = session.user.id;

  // SMM chats with clients of assigned projects
  const assignedProjects = await prisma.project.findMany({
    where: { smmId: myId },
    select: { clientId: true },
  });
  const clientIds = Array.from(new Set(assignedProjects.map((p) => p.clientId)));

  const clients = await prisma.user.findMany({
    where: { id: { in: clientIds } },
    select: { id: true, name: true, email: true, role: true },
  });

  const conversations = await Promise.all(
    clients.map(async (c) => {
      const lastMessage = await prisma.message.findFirst({
        where: {
          OR: [
            { senderId: myId, receiverId: c.id },
            { senderId: c.id, receiverId: myId },
          ],
        },
        orderBy: { createdAt: 'desc' },
      });
      const unread = await prisma.message.count({
        where: { senderId: c.id, receiverId: myId, readAt: null },
      });
      return { contact: c, lastMessage, unread };
    })
  );

  return (
    <div>
      <div className='mb-6'>
        <h1 className='text-3xl font-bold'>Messages</h1>
        <p className='text-gray-600 mt-1'>Chat with your assigned clients.</p>
      </div>

      {conversations.length === 0 ? (
        <div className='bg-white p-12 rounded-lg shadow-sm border border-gray-100 text-center text-gray-500'>
          No clients assigned yet.
        </div>
      ) : (
        <div className='space-y-2'>
          {conversations.map((c) => (
            <Link
              key={c.contact.id}
              href={'/staff/messages/' + c.contact.id}
              className='block bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow'
            >
              <div className='flex justify-between items-start mb-1'>
                <div>
                  <p className='font-medium'>{c.contact.name}</p>
                  <p className='text-xs text-gray-500'>{c.contact.email}</p>
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