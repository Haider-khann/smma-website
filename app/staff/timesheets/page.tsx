import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import TimesheetForm from './TimesheetForm';

const statusColors: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  APPROVED: 'bg-emerald-100 text-emerald-700',
  REJECTED: 'bg-red-100 text-red-700',
};

export default async function StaffTimesheetsPage() {
  const session = await auth();
  if (!session?.user) return null;

  const [entries, projects] = await Promise.all([
    prisma.timesheet.findMany({
      where: { userId: session.user.id },
      include: {
        project: { select: { id: true, title: true } },
        reviewedBy: { select: { name: true } },
      },
      orderBy: { date: 'desc' },
      take: 50,
    }),
    prisma.project.findMany({
      where: { smmId: session.user.id },
      select: { id: true, title: true },
    }),
  ]);

  const approvedHours = entries.filter((e) => e.status === 'APPROVED').reduce((s, e) => s + e.hours, 0);
  const pendingHours = entries.filter((e) => e.status === 'PENDING').reduce((s, e) => s + e.hours, 0);

  const thisMonthApproved = entries
    .filter((e) => {
      if (e.status !== 'APPROVED') return false;
      const d = new Date(e.date);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((s, e) => s + e.hours, 0);

  return (
    <div className='p-6 md:p-8 max-w-6xl mx-auto'>
      <div className='mb-8'>
        <h1 className='text-2xl md:text-3xl font-bold text-slate-900 tracking-tight'>Timesheets</h1>
        <p className='text-slate-500 mt-1 text-sm'>Log and track your work hours. Entries need admin approval.</p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-8'>
        <div className='bg-gradient-to-br from-indigo-500 to-violet-600 p-6 rounded-2xl text-white shadow-xl shadow-indigo-500/20 card-elevated'>
          <p className='text-xs text-white/70 uppercase tracking-wider font-medium mb-2'>Approved This Month</p>
          <p className='text-4xl font-bold tracking-tight'>{thisMonthApproved.toFixed(1)}h</p>
        </div>
        <div className='bg-white p-6 rounded-2xl border border-slate-200 shadow-sm card-elevated'>
          <p className='text-xs text-slate-500 uppercase tracking-wider font-medium mb-2'>Approved Total</p>
          <p className='text-4xl font-bold text-emerald-600 tracking-tight'>{approvedHours.toFixed(1)}h</p>
        </div>
        <div className='bg-white p-6 rounded-2xl border border-slate-200 shadow-sm card-elevated'>
          <p className='text-xs text-slate-500 uppercase tracking-wider font-medium mb-2'>Pending Approval</p>
          <p className='text-4xl font-bold text-amber-600 tracking-tight'>{pendingHours.toFixed(1)}h</p>
        </div>
      </div>

      <div className='mb-8'>
        <TimesheetForm projects={projects} />
      </div>

      <h2 className='text-lg font-semibold text-slate-900 mb-4'>Recent Entries</h2>
      {entries.length === 0 ? (
        <div className='bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-500'>
          No entries yet. Log your first hours above.
        </div>
      ) : (
        <div className='bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden'>
          {entries.map((e) => (
            <div key={e.id} className='p-4 md:p-5 hover:bg-slate-50/50 transition-colors'>
              <div className='flex justify-between items-start gap-4 mb-2'>
                <div className='flex-1 min-w-0'>
                  <p className='font-medium text-slate-900 text-sm'>
                    {new Date(e.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                  {e.project && (
                    <p className='text-xs text-indigo-600 font-medium mt-0.5'>{e.project.title}</p>
                  )}
                  {e.description && (
                    <p className='text-sm text-slate-600 mt-1'>{e.description}</p>
                  )}
                </div>
                <div className='flex flex-col items-end gap-1 flex-shrink-0'>
                  <span className='text-base font-bold text-slate-900'>{e.hours}h</span>
                  <span className={(statusColors[e.status] || 'bg-slate-100 text-slate-600') + ' px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider'}>
                    {e.status}
                  </span>
                </div>
              </div>

              {e.status === 'REJECTED' && e.reviewNotes && (
                <div className='bg-red-50 border border-red-100 px-3 py-2 rounded-lg mt-2'>
                  <p className='text-xs text-red-700'><span className='font-semibold'>Rejected:</span> {e.reviewNotes}</p>
                </div>
              )}

              {e.status === 'APPROVED' && e.reviewedBy && (
                <p className='text-[10px] text-slate-400 mt-2'>
                  Approved by {e.reviewedBy.name}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}