import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notify } from '@/lib/notify';
import { z } from 'zod';

const quoteSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().min(10),
  budget: z.number().positive().optional(),
  deadline: z.string().optional(),
  serviceIds: z.array(z.string()).default([]),
});

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  const role = (session.user as any).role;
  if (role !== 'CLIENT') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const quotes = await prisma.quoteRequest.findMany({
    where: { clientId: session.user.id },
    include: {
      services: { include: { service: true } },
      proposals: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ quotes });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  const role = (session.user as any).role;
  if (role !== 'CLIENT') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = quoteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { serviceIds, deadline, ...rest } = parsed.data;

    const quote = await prisma.quoteRequest.create({
      data: {
        ...rest,
        clientId: session.user.id,
        deadline: deadline ? new Date(deadline) : null,
        services: {
          create: serviceIds.map((sid) => ({ serviceId: sid })),
        },
      },
      include: {
        services: { include: { service: true } },
      },
    });

    const adminList = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true },
    });
    for (const admin of adminList) {
      await notify({
        userId: admin.id,
        title: 'New Quote Request',
        body: quote.title,
        link: '/admin/quotes/' + quote.id,
      });
    }

    return NextResponse.json({ quote }, { status: 201 });
  } catch (error) {
    console.error('Create quote error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}