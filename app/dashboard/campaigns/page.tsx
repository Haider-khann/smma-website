import Link from 'next/link';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  ACTIVE: 'bg-blue-100 text-blue-700',
  PAUSED: 'bg-orange-100 text-orange-700',
  COMPLETED: 'bg-green-100 text-green-700',
  ARCHIVED: 'bg-gray-200 text-gray-600',
};

export default async function ClientCampaignsPage() {
  const session = await auth();
  if (!session?.user) return null;

  const campaigns = await prisma.campaign.findMany({
    where: { project: { clientId: session.user.id } },
    include: {
      project: { select: { id: true, title: true } },
      contents: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  const pendingReview = campaigns.reduce(
    (sum, c) => sum + c.contents.filter((x) => x.status === 'CLIENT_REVIEW').length,
    0
  );

  return (
    <div>
      <div className='mb-6'>
        <h1 className='text-3xl font-bold'>Campaigns</h1>
        <p className='text-gray-600 mt-1'>View your marketing campaigns and approve content.</p>
      </div>

      {pendingReview > 0 && (
        <div className='bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6'>
          <p className='text-yellow-800 font-medium'>
            You have {pendingReview} content piece(s) awaiting your approval.
          </p>
        </div>
      )}

      {campaigns.length === 0 ? (
        <div className='bg-white p-12 rounded-lg shadow-sm border border-gray-100 text-center text-gray-500'>
          No campaigns yet. Your SMM will create them soon.
        </div>
      ) : (
        <div className='space-y-3'>
          {campaigns.map((c) => {
            const needsReview = c.contents.filter((x) => x.status === 'CLIENT_REVIEW').length;
            return (
              <Link
                key={c.id}
                href={'/dashboard/campaigns/' + c.id}
                className='block bg-white p-5 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow'
              >
                <div className='flex justify-between items-start mb-2'>
                  <h3 className='text-lg font-semibold'>{c.name}</h3>
                  <span className={(statusColors[c.status] || 'bg-gray-100 text-gray-600') + ' px-2 py-1 rounded text-xs font-medium'}>
                    {c.status}
                  </span>
                </div>
                <p className='text-sm text-gray-600 mb-2'>Project: {c.project.title}</p>
                {c.objective && (
                  <p className='text-sm text-gray-600 line-clamp-1 mb-3'>{c.objective}</p>
                )}
                <div className='flex gap-4 text-xs text-gray-500'>
                  <span>Total content: {c.contents.length}</span>
                  {needsReview > 0 && (
                    <span className='text-yellow-600 font-medium'>{needsReview} awaiting your review</span>
                  )}
                  {c.platform && <span>Platform: {c.platform}</span>}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}