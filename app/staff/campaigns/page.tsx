import Link from 'next/link';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const statusColors: Record<string, string> = {
  DRAFT: 'bg-slate-100 text-slate-700',
  ACTIVE: 'bg-blue-100 text-blue-700',
  PAUSED: 'bg-orange-100 text-orange-700',
  COMPLETED: 'bg-emerald-100 text-emerald-700',
  ARCHIVED: 'bg-slate-200 text-slate-600',
};

export default async function StaffCampaignsPage() {
  const session = await auth();
  if (!session?.user) return null;

  const campaigns = await prisma.campaign.findMany({
    where: { project: { smmId: session.user.id } },
    include: {
      project: { select: { id: true, title: true } },
      contents: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  const active = campaigns.filter((c) => c.status !== 'ARCHIVED');
  const archived = campaigns.filter((c) => c.status === 'ARCHIVED');

  return (
    <div className='p-6 md:p-8 max-w-6xl mx-auto'>
      <div className='flex justify-between items-center mb-8 flex-wrap gap-4'>
        <div>
          <h1 className='text-2xl md:text-3xl font-bold text-slate-900 tracking-tight'>Campaigns</h1>
          <p className='text-slate-500 mt-1 text-sm'>Manage your marketing campaigns.</p>
        </div>
        <Link href='/staff/campaigns/new' className='bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors btn-3d'>
          + New campaign
        </Link>
      </div>

      {active.length === 0 ? (
        <div className='bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-500'>
          No active campaigns. Create one to get started.
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10'>
          {active.map((c) => (
            <Link
              key={c.id}
              href={'/staff/campaigns/' + c.id}
              className='block bg-white p-6 rounded-2xl border border-slate-200 hover:border-indigo-200 card-elevated'
            >
              <div className='flex justify-between items-start mb-3 gap-3'>
                <h3 className='text-lg font-semibold text-slate-900 tracking-tight line-clamp-1'>{c.name}</h3>
                <span className={(statusColors[c.status] || 'bg-slate-100 text-slate-600') + ' px-2 py-0.5 rounded text-xs font-medium flex-shrink-0'}>
                  {c.status}
                </span>
              </div>
              <p className='text-sm text-slate-500 mb-4 truncate'>{c.project.title}</p>
              {c.platform && (
                <p className='text-xs text-slate-400 mb-2 uppercase tracking-wider'>Platform: {c.platform}</p>
              )}
              {c.objective && (
                <p className='text-sm text-slate-600 line-clamp-2 mb-4 leading-relaxed'>{c.objective}</p>
              )}
              <div className='flex justify-between text-xs text-slate-500 pt-4 border-t border-slate-100 mt-auto'>
                <span>{c.contents.length} content piece{c.contents.length !== 1 ? 's' : ''}</span>
                <span>{c.budget ? '$' + c.budget : 'No budget'}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {archived.length > 0 && (
        <div className='mt-10'>
          <h2 className='text-lg font-semibold text-slate-900 mb-4'>Archived ({archived.length})</h2>
          <div className='space-y-2'>
            {archived.map((c) => (
              <Link
                key={c.id}
                href={'/staff/campaigns/' + c.id}
                className='block bg-white px-5 py-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors'
              >
                <div className='flex justify-between items-center gap-4'>
                  <div className='min-w-0 flex-1'>
                    <p className='text-sm font-medium text-slate-700 truncate'>{c.name}</p>
                    <p className='text-xs text-slate-500 truncate'>{c.project.title}</p>
                  </div>
                  <span className='text-xs text-slate-500 flex-shrink-0'>
                    {c.contents.length} content
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}