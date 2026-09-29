import { prisma } from '@/lib/prisma';
import TimesheetReview from './TimesheetReview';

export default async function AdminTimesheetsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const status = params.status || 'PENDING';

  const where: any = {};
  if (status !== 'ALL') where.status = status;

  const [entries, pendingCount, approvedCount, rejectedCount] = await Promise.all([
    prisma.timesheet.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, title: true } },
        reviewedBy: { select: { id: true, name: true } },
      },
      orderBy: { date: 'desc' },
      take: 200,
    }),
    prisma.timesheet.count({ where: { status: 'PENDING' } }),
    prisma.timesheet.count({ where: { status: 'APPROVED' } }),
    prisma.timesheet.count({ where: { status: 'REJECTED' } }),
  ]);

  const forUI = entries.map((e) => ({
    id: e.id,
    hours: e.hours,
    date: e.date.toISOString(),
    description: e.description,
    status: e.status,
    reviewNotes: e.reviewNotes,
    user: e.user,
    project: e.project,
    reviewedBy: e.reviewedBy,
  }));

  return (
    <div className='p-6 md:p-8 max-w-6xl mx-auto'>
      <div className='mb-8'>
        <h1 className='text-2xl md:text-3xl font-bold text-slate-900 tracking-tight'>Timesheets</h1>
        <p className='text-slate-500 mt-1 text-sm'>Review and approve staff work hours.</p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-8'>
        <div className='bg-amber-50 border border-amber-100 p-5 rounded-2xl card-elevated'>
          <p className='text-xs text-amber-700 uppercase tracking-wider font-medium mb-2'>Pending</p>
          <p className='text-3xl font-bold text-amber-700 tracking-tight'>{pendingCount}</p>
        </div>
        <div className='bg-emerald-50 border border-emerald-100 p-5 rounded-2xl card-elevated'>
          <p className='text-xs text-emerald-700 uppercase tracking-wider font-medium mb-2'>Approved</p>
          <p className='text-3xl font-bold text-emerald-700 tracking-tight'>{approvedCount}</p>
        </div>
        <div className='bg-red-50 border border-red-100 p-5 rounded-2xl card-elevated'>
          <p className='text-xs text-red-700 uppercase tracking-wider font-medium mb-2'>Rejected</p>
          <p className='text-3xl font-bold text-red-700 tracking-tight'>{rejectedCount}</p>
        </div>
      </div>

      <TimesheetReview entries={forUI} currentStatus={status} />
    </div>
  );
}