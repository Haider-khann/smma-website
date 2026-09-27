import { prisma } from '@/lib/prisma';

export async function notify({
  userId,
  title,
  body,
  link,
}: {
  userId: string;
  title: string;
  body?: string;
  link?: string;
}) {
  try {
    await prisma.notification.create({
      data: {
        userId,
        title,
        body: body || null,
        link: link || null,
      },
    });
  } catch (error) {
    console.error('Notify error:', error);
  }
}

export async function notifyMany({
  userIds,
  title,
  body,
  link,
}: {
  userIds: string[];
  title: string;
  body?: string;
  link?: string;
}) {
  try {
    await prisma.notification.createMany({
      data: userIds.map((userId) => ({
        userId,
        title,
        body: body || null,
        link: link || null,
      })),
    });
  } catch (error) {
    console.error('Notify many error:', error);
  }
}