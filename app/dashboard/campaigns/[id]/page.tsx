import Link from 'next/link';
import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import ContentApproval from './ContentApproval';

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  ACTIVE: 'bg-blue-100 text-blue-700',
  PAUSED: 'bg-orange-100 text-orange-700',
  COMPLETED: 'bg-green-100 text-green-700',
  ARCHIVED: 'bg-gray-200 text-gray-600',
};

export default async function ClientCampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) return null;

  const { id } = await params;
  const campaign = await prisma.campaign.findUnique({
    where: { id },
    include: {
      project: { select: { id: true, title: true, clientId: true, smm: { select: { name: true, email: true } } } },
      contents: { orderBy: { createdAt: 'desc' } },
    },
  });

  if (!campaign || campaign.project.clientId !== session.user.id) notFound();

  const contentsForApproval = campaign.contents.map((c) => ({
    id: c.id,
    title: c.title,
    caption: c.caption,
    hashtags: c.hashtags,
    platform: c.platform,
    mediaUrl: c.mediaUrl,
    scheduledAt: c.scheduledAt ? c.scheduledAt.toISOString() : null,
    status: c.status,
    feedback: c.feedback,
  }));

  return (
    <div className='max-w-4xl'>
      <Link href='/dashboard/campaigns' className='text-blue-600 hover:underline text-sm'>Back to Campaigns</Link>

      <div className='mt-4 mb-6'>
        <div className='flex justify-between items-start mb-2'>
          <h1 className='text-3xl font-bold'>{campaign.name}</h1>
          <span className={(statusColors[campaign.status] || 'bg-gray-100 text-gray-600') + ' px-3 py-1 rounded text-sm font-medium'}>
            {campaign.status}
          </span>
        </div>
        <p className='text-gray-600'>Project: {campaign.project.title}</p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-8'>
        <div className='bg-white p-5 rounded-lg shadow-sm border border-gray-100'>
          <h2 className='font-semibold mb-3'>Details</h2>
          <div className='space-y-2 text-sm'>
            <p><span className='text-gray-500'>Platform:</span> {campaign.platform || 'Not set'}</p>
            <p><span className='text-gray-500'>Budget:</span> {campaign.budget ? '$' + campaign.budget : 'Not set'}</p>
            <p><span className='text-gray-500'>Start:</span> {campaign.startDate ? new Date(campaign.startDate).toLocaleDateString() : 'Not set'}</p>
            <p><span className='text-gray-500'>End:</span> {campaign.endDate ? new Date(campaign.endDate).toLocaleDateString() : 'Not set'}</p>
          </div>
        </div>

        <div className='bg-white p-5 rounded-lg shadow-sm border border-gray-100'>
          <h2 className='font-semibold mb-3'>Objective</h2>
          <p className='text-sm text-gray-700'>{campaign.objective || 'No objective set.'}</p>
          {campaign.project.smm && (
            <div className='mt-3 pt-3 border-t border-gray-100'>
              <p className='text-xs text-gray-500 uppercase'>Managed by</p>
              <p className='text-sm'>{campaign.project.smm.name}</p>
            </div>
          )}
        </div>
      </div>

      <ContentApproval contents={contentsForApproval} />
    </div>
  );
}