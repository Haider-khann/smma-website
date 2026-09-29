import Link from 'next/link';
import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import TicketChat from '@/components/TicketChat';

const statusColors: Record<string, string> = {
  OPEN: 'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-amber-100 text-amber-700',
  RESOLVED: 'bg-emerald-100 text-emerald-700',
  CLOSED: 'bg-slate-100 text-slate-600',
};

export default async function ClientTicketPage({
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
      replies: {
        include: { author: { select: { id: true, name: true, role: true } } },
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!ticket || ticket.clientId !== session.user.id) notFound();

  const replies = ticket.replies.map((r) => ({
    id: r.id,
    body: r.body,
    createdAt: r.createdAt.toISOString(),
    author: r.author,
  }));

  return (
    <div className='p-6 md:p-8 max-w-4xl mx-auto'>
      <Link href='/dashboard/support' className='text-indigo-600 hover:text-indigo-700 text-sm font-medium'>← Back to support</Link>

      <div className='mt-6 mb-6'>
        <h1 className='text-2xl font-bold text-slate-900 tracking-tight mb-3'>{ticket.subject}</h1>
        <div className='flex gap-2 flex-wrap'>
          <span className={(statusColors[ticket.status] || 'bg-slate-100 text-slate-600') + ' px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider'}>{ticket.status.replace('_', ' ')}</span>
          <span className='bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider'>{ticket.priority} PRIORITY</span>
          {ticket.category && <span className='bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider'>{ticket.category}</span>}
        </div>
      </div>

      <TicketChat
        ticketId={ticket.id}
        initialReplies={replies}
        initialBody={ticket.body}
        status={ticket.status}
        userRole='CLIENT'
        myUserId={session.user.id}
      />
    </div>
  );
}