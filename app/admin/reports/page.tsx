import { prisma } from '@/lib/prisma';

export default async function AdminReportsPage() {
  const reports = await prisma.report.findMany({
    include: {
      project: {
        select: {
          id: true,
          title: true,
          client: { select: { name: true } },
          smm: { select: { name: true } },
        },
      },
      createdBy: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div>
      <div className='mb-6'>
        <h1 className='text-3xl font-bold'>Reports</h1>
        <p className='text-gray-600 mt-1'>All monthly reports across the agency.</p>
      </div>

      {reports.length === 0 ? (
        <div className='bg-white p-12 rounded-lg shadow-sm border border-gray-100 text-center text-gray-500'>
          No reports created yet.
        </div>
      ) : (
        <div className='bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden'>
          <table className='w-full'>
            <thead className='bg-gray-50 border-b border-gray-200'>
              <tr>
                <th className='text-left px-6 py-3 text-sm font-medium text-gray-600'>Month</th>
                <th className='text-left px-6 py-3 text-sm font-medium text-gray-600'>Project</th>
                <th className='text-left px-6 py-3 text-sm font-medium text-gray-600'>Client</th>
                <th className='text-left px-6 py-3 text-sm font-medium text-gray-600'>Posts</th>
                <th className='text-left px-6 py-3 text-sm font-medium text-gray-600'>Followers</th>
                <th className='text-left px-6 py-3 text-sm font-medium text-gray-600'>Engagement</th>
                <th className='text-left px-6 py-3 text-sm font-medium text-gray-600'>Created By</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r.id} className='border-b border-gray-100 last:border-0'>
                  <td className='px-6 py-4 font-medium'>{r.month}</td>
                  <td className='px-6 py-4 text-gray-600'>{r.project.title}</td>
                  <td className='px-6 py-4 text-gray-600'>{r.project.client.name}</td>
                  <td className='px-6 py-4'>{r.postCount}</td>
                  <td className='px-6 py-4 text-green-600 font-medium'>+{r.followerGrowth}</td>
                  <td className='px-6 py-4 text-purple-600 font-medium'>{r.engagement}</td>
                  <td className='px-6 py-4 text-gray-600 text-sm'>{r.createdBy.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}