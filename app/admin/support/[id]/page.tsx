import Link from 'next/link';
import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import TicketChat from '@/components/TicketChat';
import AdminTicketActions from './AdminTicketActions';

export default async function AdminTicketPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) return null;

  const { id } = await params;
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

  if (!ticket) notFound();

  const replies = ticket.replies.map((r) => ({
    id: r.id,
    body: r.body,
    createdAt: r.createdAt.toISOString(),
    author: r.author,
  }));

  return (
    <div className='p-6 md:p-8 max-w-4xl mx-auto'>
      <Link href='/admin/support' className='text-indigo-600 hover:text-indigo-700 text-sm font-medium'>← Back to support tickets</Link>

      <div className='mt-6 mb-6'>
        <h1 className='text-2xl font-bold text-slate-900 tracking-tight mb-2'>{ticket.subject}</h1>
        <p className='text-sm text-slate-500'>From {ticket.client.name} ({ticket.client.email})</p>
        <div className='flex gap-2 flex-wrap mt-3'>
          {ticket.escalated && <span className='bg-red-600 text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider'>Escalated</span>}
          <span className='bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider'>{ticket.status.replace('_', ' ')}</span>
          <span className='bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider'>{ticket.priority}</span>
          {ticket.category && <span className='bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider'>{ticket.category}</span>}
        </div>
      </div>

      <div className='mb-6'>
        <AdminTicketActions ticketId={ticket.id} currentStatus={ticket.status} />
      </div>

      <TicketChat
        ticketId={ticket.id}
        initialReplies={replies}
        initialBody={ticket.body}
        status={ticket.status}
        userRole='ADMIN'
        myUserId={session.user.id}
      />
    </div>
  );
}