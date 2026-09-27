'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Notification = {
  id: string;
  title: string;
  body: string | null;
  link: string | null;
  read: boolean;
  createdAt: string;
};

export default function NotificationsList({
  initialNotifications,
}: {
  initialNotifications: Notification[];
}) {
  const router = useRouter();
  const [notifications, setNotifications] = useState(initialNotifications);

  async function markRead(id: string, link: string | null) {
    await fetch('/api/notifications/' + id, { method: 'PATCH' });
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    if (link) {
      router.push(link);
    } else {
      router.refresh();
    }
  }

  async function markAllRead() {
    await fetch('/api/notifications', { method: 'POST' });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    router.refresh();
  }

  async function deleteNotif(id: string) {
    await fetch('/api/notifications/' + id, { method: 'DELETE' });
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    router.refresh();
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (notifications.length === 0) {
    return (
      <div className='bg-white p-12 rounded-lg shadow-sm border border-gray-100 text-center text-gray-500'>
        No notifications yet.
      </div>
    );
  }

  return (
    <div>
      <div className='flex justify-between items-center mb-4'>
        <p className='text-sm text-gray-600'>{unreadCount} unread</p>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className='text-sm text-blue-600 hover:underline'>
            Mark all as read
          </button>
        )}
      </div>

      <div className='space-y-2'>
        {notifications.map((n) => (
          <div
            key={n.id}
            className={(n.read ? 'bg-white' : 'bg-blue-50 border-blue-200') + ' p-4 rounded-lg shadow-sm border border-gray-100 flex justify-between gap-3'}
          >
            <div className='flex-1 min-w-0'>
              <div className='flex items-center gap-2 mb-1'>
                {!n.read && <span className='w-2 h-2 bg-blue-600 rounded-full'></span>}
                <p className={(n.read ? 'font-normal' : 'font-semibold') + ' text-sm'}>{n.title}</p>
              </div>
              {n.body && <p className='text-sm text-gray-600 mb-1'>{n.body}</p>}
              <p className='text-xs text-gray-400'>{new Date(n.createdAt).toLocaleString()}</p>
            </div>
            <div className='flex flex-col gap-1 items-end'>
              <button onClick={() => markRead(n.id, n.link)} className='text-xs text-blue-600 hover:underline whitespace-nowrap'>
                {n.read ? 'View' : 'Open'}
              </button>
              <button onClick={() => deleteNotif(n.id)} className='text-xs text-red-500 hover:underline'>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}