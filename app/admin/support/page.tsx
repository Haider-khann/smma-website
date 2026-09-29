import Link from 'next/link';
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

export default async function AdminSupportPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const status = params.status || 'ALL';

  const where: any = {};
  if (status !== 'ALL') where.status = status;

  const [tickets, openCount, inProgressCount, resolvedCount, escalatedCount] = await Promise.all([
    prisma.supportTicket.findMany({
      where,
      include: {
        client: { select: { id: true, name: true, email: true } },
        _count: { select: { replies: true } },
      },
      orderBy: [{ escalated: 'desc' }, { createdAt: 'desc' }],
      take: 100,
    }),
    prisma.supportTicket.count({ where: { status: 'OPEN' } }),
    prisma.supportTicket.count({ where: { status: 'IN_PROGRESS' } }),
    prisma.supportTicket.count({ where: { status: 'RESOLVED' } }),
    prisma.supportTicket.count({ where: { escalated: true, status: { not: 'RESOLVED' } } }),
  ]);

  const tabs = [
    { value: 'ALL', label: 'All' },
    { value: 'OPEN', label: 'Open' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'RESOLVED', label: 'Resolved' },
    { value: 'CLOSED', label: 'Closed' },
  ];

  return (
    <div className='p-6 md:p-8 max-w-6xl mx-auto'>
      <div className='mb-8'>
        <h1 className='text-2xl md:text-3xl font-bold text-slate-900 tracking-tight'>Support Tickets</h1>
        <p className='text-slate-500 mt-1 text-sm'>Manage client support requests.</p>
      </div>

      <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-8'>
        <div className='bg-blue-50 border border-blue-100 p-4 rounded-xl'>
          <p className='text-xs text-blue-700 uppercase tracking-wider font-medium mb-1'>Open</p>
          <p className='text-2xl font-bold text-blue-700'>{openCount}</p>
        </div>
        <div className='bg-amber-50 border border-amber-100 p-4 rounded-xl'>
          <p className='text-xs text-amber-700 uppercase tracking-wider font-medium mb-1'>In Progress</p>
          <p className='text-2xl font-bold text-amber-700'>{inProgressCount}</p>
        </div>
        <div className='bg-emerald-50 border border-emerald-100 p-4 rounded-xl'>
          <p className='text-xs text-emerald-700 uppercase tracking-wider font-medium mb-1'>Resolved</p>
          <p className='text-2xl font-bold text-emerald-700'>{resolvedCount}</p>
        </div>
        <div className='bg-red-50 border border-red-100 p-4 rounded-xl'>
          <p className='text-xs text-red-700 uppercase tracking-wider font-medium mb-1'>Escalated</p>
          <p className='text-2xl font-bold text-red-700'>{escalatedCount}</p>
        </div>
      </div>

      <div className='flex gap-1 mb-6 border-b border-slate-200 overflow-x-auto'>
        {tabs.map((t) => (
          <Link key={t.value} href={'/admin/support?status=' + t.value} className={'px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap border-b-2 ' + (status === t.value ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-900')}>{t.label}</Link>
        ))}
      </div>

      {tickets.length === 0 ? (
        <div className='bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-500'>No tickets found.</div>
      ) : (
        <div className='space-y-3'>
          {tickets.map((t) => (
            <Link key={t.id} href={'/admin/support/' + t.id} className='block bg-white p-5 rounded-2xl border border-slate-200 hover:border-indigo-200 card-elevated'>
              <div className='flex justify-between items-start gap-4 flex-wrap mb-2'>
                <div className='flex-1 min-w-0'>
                  <div className='flex items-center gap-2 mb-1 flex-wrap'>
                    {t.escalated && <span className='bg-red-600 text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider'>Escalated</span>}
                    <h3 className='font-semibold text-slate-900 truncate'>{t.subject}</h3>
                  </div>
                  <p className='text-xs text-slate-500'>{t.client.name} ({t.client.email}) · {new Date(t.createdAt).toLocaleDateString()}</p>
                </div>
                <div className='flex gap-2 flex-shrink-0'>
                  <span className={(priorityColors[t.priority] || 'bg-slate-100 text-slate-600') + ' px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider'}>{t.priority}</span>
                  <span className={(statusColors[t.status] || 'bg-slate-100 text-slate-600') + ' px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider'}>{t.status.replace('_', ' ')}</span>
                </div>
              </div>
              <p className='text-sm text-slate-600 line-clamp-2 mb-2'>{t.body}</p>
              <div className='text-xs text-slate-500 pt-2 border-t border-slate-100'>{t._count.replies} repl{t._count.replies !== 1 ? 'ies' : 'y'}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}