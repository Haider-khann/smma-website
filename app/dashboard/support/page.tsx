import Link from 'next/link';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const statusColors: Record<string, string> = {
  OPEN: 'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-amber-100 text-amber-700',
  RESOLVED: 'bg-emerald-100 text-emerald-700',
  CLOSED: 'bg-slate-100 text-slate-600',
};

const priorityColors: Record<string, string> = {
  LOW: 'bg-slate-100 text-slate-600',
  NORMAL: 'bg-blue-100 text-blue-700',
  HIGH: 'bg-orange-100 text-orange-700',
  URGENT: 'bg-red-100 text-red-700',
};

export default async function ClientSupportPage() {
  const session = await auth();
  if (!session?.user) return null;

  const tickets = await prisma.supportTicket.findMany({
    where: { clientId: session.user.id },
    include: { _count: { select: { replies: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className='p-6 md:p-8 max-w-5xl mx-auto'>
      <div className='flex justify-between items-center mb-8 flex-wrap gap-4'>
        <div>
          <h1 className='text-2xl md:text-3xl font-bold text-slate-900 tracking-tight'>Support</h1>
          <p className='text-slate-500 mt-1 text-sm'>Get help from our team.</p>
        </div>
        <Link href='/dashboard/support/new' className='bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors btn-3d'>
          + New ticket
        </Link>
      </div>

      {tickets.length === 0 ? (
        <div className='bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-500'>
          No support tickets yet. Create one if you need help.
        </div>
      ) : (
        <div className='space-y-3'>
          {tickets.map((t) => (
            <Link key={t.id} href={'/dashboard/support/' + t.id} className='block bg-white p-5 rounded-2xl border border-slate-200 hover:border-indigo-200 card-elevated'>
              <div className='flex justify-between items-start gap-4 flex-wrap mb-2'>
                <h3 className='font-semibold text-slate-900 truncate flex-1 min-w-0'>{t.subject}</h3>
                <div className='flex gap-2 flex-shrink-0'>
                  <span className={(priorityColors[t.priority] || 'bg-slate-100 text-slate-600') + ' px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider'}>{t.priority}</span>
                  <span className={(statusColors[t.status] || 'bg-slate-100 text-slate-600') + ' px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider'}>{t.status.replace('_', ' ')}</span>
                </div>
              </div>
              <p className='text-sm text-slate-600 line-clamp-2 mb-2'>{t.body}</p>
              <div className='flex justify-between text-xs text-slate-500 pt-2 border-t border-slate-100'>
                <span>{t._count.replies} repl{t._count.replies !== 1 ? 'ies' : 'y'}</span>
                <span>{new Date(t.createdAt).toLocaleDateString()}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}