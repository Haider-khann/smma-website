import Link from 'next/link';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  INTERNAL_REVIEW: 'bg-yellow-100 text-yellow-700',
  CLIENT_REVIEW: 'bg-purple-100 text-purple-700',
  APPROVED: 'bg-green-100 text-green-700',
  REVISION_REQUESTED: 'bg-orange-100 text-orange-700',
};

export default async function StaffContentPage() {
  const session = await auth();
  if (!session?.user) return null;

  const contents = await prisma.content.findMany({
    where: { project: { smmId: session.user.id } },
    include: {
      project: { select: { id: true, title: true } },
      campaign: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const counts = {
    draft: contents.filter((c) => c.status === 'DRAFT').length,
    review: contents.filter((c) => c.status === 'CLIENT_REVIEW').length,
    approved: contents.filter((c) => c.status === 'APPROVED').length,
    revision: contents.filter((c) => c.status === 'REVISION_REQUESTED').length,
  };

  return (
    <div>
      <div className='mb-6'>
        <h1 className='text-3xl font-bold'>All Content</h1>
        <p className='text-gray-600 mt-1'>All content across your campaigns.</p>
      </div>

      <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-6'>
        <div className='bg-gray-50 text-gray-700 p-4 rounded-lg'>
          <p className='text-xs font-medium uppercase opacity-80'>Draft</p>
          <p className='text-2xl font-bold'>{counts.draft}</p>
        </div>
        <div className='bg-purple-50 text-purple-700 p-4 rounded-lg'>
          <p className='text-xs font-medium uppercase opacity-80'>In Review</p>
          <p className='text-2xl font-bold'>{counts.review}</p>
        </div>
        <div className='bg-green-50 text-green-700 p-4 rounded-lg'>
          <p className='text-xs font-medium uppercase opacity-80'>Approved</p>
          <p className='text-2xl font-bold'>{counts.approved}</p>
        </div>
        <div className='bg-orange-50 text-orange-700 p-4 rounded-lg'>
          <p className='text-xs font-medium uppercase opacity-80'>Needs Revision</p>
          <p className='text-2xl font-bold'>{counts.revision}</p>
        </div>
      </div>

      {contents.length === 0 ? (
        <div className='bg-white p-12 rounded-lg shadow-sm border border-gray-100 text-center text-gray-500'>
          No content yet. Create content from a campaign page.
        </div>
      ) : (
        <div className='space-y-2'>
          {contents.map((c) => (
            <Link
              key={c.id}
              href={c.campaign ? '/staff/campaigns/' + c.campaign.id : '/staff/projects/' + c.project.id}
              className='block bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow'
            >
              <div className='flex justify-between items-start'>
                <div className='flex-1'>
                  <div className='flex items-center gap-2 mb-1'>
                    <p className='font-medium'>{c.title || 'Untitled'}</p>
                    <span className={(statusColors[c.status] || 'bg-gray-100 text-gray-600') + ' px-2 py-0.5 rounded text-xs font-medium'}>
                      {c.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className='text-xs text-gray-500'>
                    Project: {c.project.title}
                    {c.campaign && ' | Campaign: ' + c.campaign.name}
                  </p>
                  {c.platform && <p className='text-xs text-gray-500 mt-1'>Platform: {c.platform}</p>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}