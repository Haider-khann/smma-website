import { prisma } from '@/lib/prisma';

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  ACTIVE: 'bg-blue-100 text-blue-700',
  PAUSED: 'bg-orange-100 text-orange-700',
  COMPLETED: 'bg-green-100 text-green-700',
  ARCHIVED: 'bg-gray-200 text-gray-600',
};

export default async function AdminCampaignsPage() {
  const campaigns = await prisma.campaign.findMany({
    include: {
      project: {
        select: {
          id: true,
          title: true,
          client: { select: { name: true, email: true } },
          smm: { select: { name: true, email: true } },
        },
      },
      contents: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div>
      <div className='mb-6'>
        <h1 className='text-3xl font-bold'>Campaigns</h1>
        <p className='text-gray-600 mt-1'>View all marketing campaigns across the agency.</p>
      </div>

      {campaigns.length === 0 ? (
        <div className='bg-white p-12 rounded-lg shadow-sm border border-gray-100 text-center text-gray-500'>
          No campaigns created yet.
        </div>
      ) : (
        <div className='bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden'>
          <table className='w-full'>
            <thead className='bg-gray-50 border-b border-gray-200'>
              <tr>
                <th className='text-left px-6 py-3 text-sm font-medium text-gray-600'>Campaign</th>
                <th className='text-left px-6 py-3 text-sm font-medium text-gray-600'>Project</th>
                <th className='text-left px-6 py-3 text-sm font-medium text-gray-600'>Client</th>
                <th className='text-left px-6 py-3 text-sm font-medium text-gray-600'>SMM</th>
                <th className='text-left px-6 py-3 text-sm font-medium text-gray-600'>Status</th>
                <th className='text-left px-6 py-3 text-sm font-medium text-gray-600'>Content</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => (
                <tr key={c.id} className='border-b border-gray-100 last:border-0'>
                  <td className='px-6 py-4 font-medium'>{c.name}</td>
                  <td className='px-6 py-4 text-gray-600'>{c.project.title}</td>
                  <td className='px-6 py-4 text-gray-600'>{c.project.client.name}</td>
                  <td className='px-6 py-4 text-gray-600'>{c.project.smm?.name || 'Unassigned'}</td>
                  <td className='px-6 py-4'>
                    <span className={(statusColors[c.status] || 'bg-gray-100 text-gray-600') + ' px-2 py-1 rounded text-xs font-medium'}>
                      {c.status}
                    </span>
                  </td>
                  <td className='px-6 py-4 text-gray-600'>{c.contents.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}