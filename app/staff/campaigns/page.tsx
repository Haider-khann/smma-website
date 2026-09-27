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

  return (
    <div>
      <div className='flex justify-between items-center mb-6'>
        <div>
          <h1 className='text-3xl font-bold'>Campaigns</h1>
          <p className='text-gray-600 mt-1'>Manage your marketing campaigns.</p>
        </div>
        <Link href='/staff/campaigns/new' className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700'>
          + New Campaign
        </Link>
      </div>

      {campaigns.length === 0 ? (
        <div className='bg-white p-12 rounded-lg shadow-sm border border-gray-100 text-center text-gray-500'>
          No campaigns yet. Create one to get started.
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {campaigns.map((c) => (
            <Link
              key={c.id}
              href={'/staff/campaigns/' + c.id}
              className='block bg-white p-5 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow'
            >
              <div className='flex justify-between items-start mb-2'>
                <h3 className='text-lg font-bold'>{c.name}</h3>
                <span className={(statusColors[c.status] || 'bg-gray-100 text-gray-600') + ' px-2 py-1 rounded text-xs font-medium'}>
                  {c.status}
                </span>
              </div>
              <p className='text-sm text-gray-600 mb-3'>{c.project.title}</p>
              {c.platform && (
                <p className='text-xs text-gray-500 mb-2'>Platform: {c.platform}</p>
              )}
              {c.objective && (
                <p className='text-sm text-gray-600 line-clamp-2 mb-3'>{c.objective}</p>
              )}
              <div className='flex justify-between text-xs text-gray-500 pt-3 border-t border-gray-100'>
                <span>{c.contents.length} content piece(s)</span>
                <span>{c.budget ? '$' + c.budget : 'No budget'}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}