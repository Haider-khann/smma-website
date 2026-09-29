import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function StaffAnalyticsPage() {
  const session = await auth();
  if (!session?.user) return null;

  const contents = await prisma.content.findMany({
    where: { project: { smmId: session.user.id } },
    include: { project: { select: { title: true } } },
  });

  const totalContent = contents.length;
  const approved = contents.filter((c) => c.status === 'APPROVED').length;
  const awaitingReview = contents.filter((c) => c.status === 'CLIENT_REVIEW').length;
  const revisionRequested = contents.filter((c) => c.status === 'REVISION_REQUESTED').length;
  const draft = contents.filter((c) => c.status === 'DRAFT').length;

  const approvalRate = totalContent > 0 ? Math.round((approved / totalContent) * 100) : 0;

  const byPlatform: Record<string, number> = {};
  for (const c of contents) {
    const p = c.platform || 'Unspecified';
    byPlatform[p] = (byPlatform[p] || 0) + 1;
  }

  const byProject: Record<string, number> = {};
  for (const c of contents) {
    const p = c.project.title;
    byProject[p] = (byProject[p] || 0) + 1;
  }

  return (
    <div className='p-6 md:p-8 max-w-6xl mx-auto'>
      <div className='mb-8'>
        <h1 className='text-2xl md:text-3xl font-bold text-slate-900 tracking-tight'>Content Analytics</h1>
        <p className='text-slate-500 mt-1 text-sm'>Your content performance overview.</p>
      </div>

      <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-8'>
        <div className='bg-white p-5 rounded-2xl border border-slate-200 card-elevated'>
          <p className='text-xs text-slate-500 uppercase tracking-wider font-medium mb-2'>Total</p>
          <p className='text-3xl font-bold text-slate-900 tracking-tight'>{totalContent}</p>
        </div>
        <div className='bg-emerald-50 p-5 rounded-2xl border border-emerald-100 card-elevated'>
          <p className='text-xs text-emerald-700 uppercase tracking-wider font-medium mb-2'>Approved</p>
          <p className='text-3xl font-bold text-emerald-700 tracking-tight'>{approved}</p>
        </div>
        <div className='bg-violet-50 p-5 rounded-2xl border border-violet-100 card-elevated'>
          <p className='text-xs text-violet-700 uppercase tracking-wider font-medium mb-2'>In Review</p>
          <p className='text-3xl font-bold text-violet-700 tracking-tight'>{awaitingReview}</p>
        </div>
        <div className='bg-orange-50 p-5 rounded-2xl border border-orange-100 card-elevated'>
          <p className='text-xs text-orange-700 uppercase tracking-wider font-medium mb-2'>Needs Fix</p>
          <p className='text-3xl font-bold text-orange-700 tracking-tight'>{revisionRequested}</p>
        </div>
      </div>

      <div className='bg-white p-6 rounded-2xl border border-slate-200 mb-8 card-elevated'>
        <h2 className='font-semibold text-slate-900 mb-4 text-sm uppercase tracking-wider'>Approval Rate</h2>
        <div className='flex items-center gap-4'>
          <div className='flex-1 bg-slate-100 rounded-full h-3 overflow-hidden'>
            <div className='bg-gradient-to-r from-indigo-500 to-violet-600 h-3 rounded-full transition-all' style={{ width: approvalRate + '%' }}></div>
          </div>
          <span className='text-2xl font-bold text-slate-900 tracking-tight min-w-[60px] text-right'>{approvalRate}%</span>
        </div>
        <p className='text-xs text-slate-500 mt-3'>{approved} approved out of {totalContent} total</p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
        <div className='bg-white p-6 rounded-2xl border border-slate-200 card-elevated'>
          <h2 className='font-semibold text-slate-900 mb-4 text-sm uppercase tracking-wider'>By Platform</h2>
          {Object.keys(byPlatform).length === 0 ? (
            <p className='text-sm text-slate-500'>No content yet.</p>
          ) : (
            <div className='space-y-3'>
              {Object.entries(byPlatform).map(([platform, count]) => (
                <div key={platform} className='flex justify-between items-center text-sm'>
                  <span className='text-slate-700'>{platform}</span>
                  <span className='font-semibold text-slate-900'>{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className='bg-white p-6 rounded-2xl border border-slate-200 card-elevated'>
          <h2 className='font-semibold text-slate-900 mb-4 text-sm uppercase tracking-wider'>By Project</h2>
          {Object.keys(byProject).length === 0 ? (
            <p className='text-sm text-slate-500'>No content yet.</p>
          ) : (
            <div className='space-y-3'>
              {Object.entries(byProject).map(([project, count]) => (
                <div key={project} className='flex justify-between items-center text-sm'>
                  <span className='text-slate-700 truncate'>{project}</span>
                  <span className='font-semibold text-slate-900 flex-shrink-0 ml-3'>{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}