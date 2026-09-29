import Link from 'next/link';
import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import ContentManager from './ContentManager';
import CampaignActions from './CampaignActions';

const statusColors: Record<string, string> = {
  DRAFT: 'bg-slate-100 text-slate-700',
  ACTIVE: 'bg-blue-100 text-blue-700',
  PAUSED: 'bg-orange-100 text-orange-700',
  COMPLETED: 'bg-emerald-100 text-emerald-700',
  ARCHIVED: 'bg-slate-200 text-slate-600',
};

export default async function CampaignDetailPage({
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
      project: { select: { id: true, title: true, smmId: true } },
      contents: { orderBy: { createdAt: 'desc' } },
    },
  });

  if (!campaign || campaign.project.smmId !== session.user.id) notFound();

  const contentsForManager = campaign.contents.map((c) => ({
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
    <div className='p-6 md:p-8 max-w-5xl mx-auto'>
      <Link href='/staff/campaigns' className='text-indigo-600 hover:text-indigo-700 text-sm font-medium'>
        ← Back to campaigns
      </Link>

      <div className='mt-6 mb-8'>
        <div className='flex justify-between items-start mb-3 gap-4 flex-wrap'>
          <div>
            <h1 className='text-2xl md:text-3xl font-bold text-slate-900 tracking-tight'>{campaign.name}</h1>
            <p className='text-slate-500 mt-1 text-sm'>Project: {campaign.project.title}</p>
          </div>
          <span className={(statusColors[campaign.status] || 'bg-slate-100 text-slate-600') + ' px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider'}>
            {campaign.status}
          </span>
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-5 mb-8'>
        <div className='bg-white p-5 rounded-xl border border-slate-200 shadow-sm'>
          <h2 className='font-semibold text-slate-900 mb-4 text-sm uppercase tracking-wider'>Campaign Details</h2>
          <div className='space-y-3 text-sm'>
            <div className='flex justify-between'>
              <span className='text-slate-500'>Platform</span>
              <span className='font-medium text-slate-900'>{campaign.platform || 'Not set'}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-slate-500'>Budget</span>
              <span className='font-medium text-slate-900'>{campaign.budget ? '$' + campaign.budget : 'Not set'}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-slate-500'>Start</span>
              <span className='font-medium text-slate-900'>{campaign.startDate ? new Date(campaign.startDate).toLocaleDateString() : 'Not set'}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-slate-500'>End</span>
              <span className='font-medium text-slate-900'>{campaign.endDate ? new Date(campaign.endDate).toLocaleDateString() : 'Not set'}</span>
            </div>
          </div>
        </div>

        <div className='bg-white p-5 rounded-xl border border-slate-200 shadow-sm'>
          <h2 className='font-semibold text-slate-900 mb-4 text-sm uppercase tracking-wider'>Objective</h2>
          <p className='text-sm text-slate-700 leading-relaxed'>{campaign.objective || 'No objective set.'}</p>
          {campaign.targetAudience && (
            <div className='mt-4 pt-4 border-t border-slate-100'>
              <p className='text-xs text-slate-500 uppercase tracking-wider mb-1'>Target Audience</p>
              <p className='text-sm text-slate-900'>{campaign.targetAudience}</p>
            </div>
          )}
        </div>
      </div>

      <div className='mb-8'>
        <CampaignActions campaignId={campaign.id} currentStatus={campaign.status} />
      </div>

      <ContentManager
        campaignId={campaign.id}
        projectId={campaign.project.id}
        contents={contentsForManager}
      />
    </div>
  );
}