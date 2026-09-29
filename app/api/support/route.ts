import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { notify } from '@/lib/notify';

const createSchema = z.object({
  subject: z.string().min(3).max(200),
  body: z.string().min(10),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).default('NORMAL'),
  category: z.string().max(50).optional(),
});

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const role = (session.user as any).role;
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');

  const where: any = {};
  if (role === 'CLIENT') {
    where.clientId = session.user.id;
  } else if (role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (status && status !== 'ALL') where.status = status;

  const tickets = await prisma.supportTicket.findMany({
    where,
    include: {
      client: { select: { id: true, name: true, email: true } },
      _count: { select: { replies: true } },
    },
    orderBy: [{ escalated: 'desc' }, { createdAt: 'desc' }],
  });

  return NextResponse.json({ tickets });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'CLIENT') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const ticket = await prisma.supportTicket.create({
      data: {
        clientId: session.user.id,
        subject: parsed.data.subject,
        body: parsed.data.body,
        priority: parsed.data.priority,
        category: parsed.data.category || null,
        status: 'OPEN',
      },
    });

    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true },
    });
    for (const admin of admins) {
      await notify({
        userId: admin.id,
        title: 'New Support Ticket',
        body: parsed.data.subject,
        link: '/admin/support/' + ticket.id,
      });
    }

    return NextResponse.json({ ticket }, { status: 201 });
  } catch (error) {
    console.error('Create ticket error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}