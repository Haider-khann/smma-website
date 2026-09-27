import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import NotificationsList from '@/components/NotificationsList';

export default async function StaffNotificationsPage() {
  const session = await auth();
  if (!session?.user) return null;

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  const forUI = notifications.map((n) => ({
    id: n.id,
    title: n.title,
    body: n.body,
    link: n.link,
    read: n.read,
    createdAt: n.createdAt.toISOString(),
  }));

  return (
    <div className='max-w-3xl'>
      <div className='mb-6'>
        <h1 className='text-3xl font-bold'>Notifications</h1>
        <p className='text-gray-600 mt-1'>Task and project updates.</p>
      </div>
      <NotificationsList initialNotifications={forUI} />
    </div>
  );
}