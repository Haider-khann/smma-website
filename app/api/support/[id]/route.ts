import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { notify } from '@/lib/notify';

const patchSchema = z.object({
  action: z.enum(['REPLY', 'STATUS', 'ESCALATE']).optional(),
  body: z.string().min(1).optional(),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']).optional(),
  escalateReason: z.string().max(500).optional(),
});

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const role = (session.user as any).role;

  const ticket = await prisma.supportTicket.findUnique({
    where: { id },
    include: {
      client: { select: { id: true, name: true, email: true } },
      replies: {
        include: { author: { select: { id: true, name: true, role: true } } },
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!ticket) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (role === 'CLIENT' && ticket.clientId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return NextResponse.json({ ticket });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const role = (session.user as any).role;

  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const ticket = await prisma.supportTicket.findUnique({ where: { id } });
    if (!ticket) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (role === 'CLIENT' && ticket.clientId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { action, body: replyBody, status, escalateReason } = parsed.data;

    if (action === 'REPLY' && replyBody) {
      await prisma.supportReply.create({
        data: { ticketId: id, authorId: session.user.id, body: replyBody },
      });

      if (role === 'ADMIN') {
        await notify({
          userId: ticket.clientId,
          title: 'Admin replied to your ticket',
          body: ticket.subject,
          link: '/dashboard/support/' + id,
        });
        if (ticket.status === 'OPEN') {
          await prisma.supportTicket.update({
            where: { id },
            data: { status: 'IN_PROGRESS' },
          });
        }
      } else {
        const admins = await prisma.user.findMany({
          where: { role: 'ADMIN' },
          select: { id: true },
        });
        for (const admin of admins) {
          await notify({
            userId: admin.id,
            title: 'Client replied to ticket',
            body: ticket.subject,
            link: '/admin/support/' + id,
          });
        }
      }
      return NextResponse.json({ success: true });
    }

    if (action === 'STATUS' && status) {
      if (role !== 'ADMIN') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      await prisma.supportTicket.update({ where: { id }, data: { status } });
      await notify({
        userId: ticket.clientId,
        title: 'Support ticket ' + status.toLowerCase(),
        body: ticket.subject,
        link: '/dashboard/support/' + id,
      });
      return NextResponse.json({ success: true });
    }

    if (action === 'ESCALATE') {
      await prisma.supportTicket.update({
        where: { id },
        data: { escalated: true, escalatedBy: session.user.id, priority: 'URGENT', status: 'OPEN' },
      });

      if (escalateReason) {
        await prisma.supportReply.create({
          data: {
            ticketId: id,
            authorId: session.user.id,
            body: 'ESCALATED: ' + escalateReason,
          },
        });
      }

      const admins = await prisma.user.findMany({
        where: { role: 'ADMIN' },
        select: { id: true },
      });
      for (const admin of admins) {
        await notify({
          userId: admin.id,
          title: 'Ticket escalated',
          body: ticket.subject,
          link: '/admin/support/' + id,
        });
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Support action error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}