import Link from 'next/link';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function StaffReportsPage() {
  const session = await auth();
  if (!session?.user) return null;

  const reports = await prisma.report.findMany({
    where: { createdById: session.user.id },
    include: { project: { select: { id: true, title: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div>
      <div className='mb-6'>
        <h1 className='text-3xl font-bold'>Monthly Reports</h1>
        <p className='text-gray-600 mt-1'>Performance reports for your projects.</p>
      </div>

      {reports.length === 0 ? (
        <div className='bg-white p-12 rounded-lg shadow-sm border border-gray-100 text-center text-gray-500'>
          No reports yet. Create reports from your project pages.
        </div>
      ) : (
        <div className='space-y-3'>
          {reports.map((r) => (
            <Link
              key={r.id}
              href={'/staff/reports/' + r.id}
              className='block bg-white p-5 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow'
            >
              <div className='flex justify-between items-start mb-2'>
                <h3 className='text-lg font-semibold'>{r.month}</h3>
                <span className='text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded'>{r.project.title}</span>
              </div>
              <div className='grid grid-cols-3 gap-4 mt-3 text-sm'>
                <div>
                  <p className='text-xs text-gray-500 uppercase'>Posts</p>
                  <p className='text-lg font-bold text-blue-600'>{r.postCount}</p>
                </div>
                <div>
                  <p className='text-xs text-gray-500 uppercase'>Followers</p>
                  <p className='text-lg font-bold text-green-600'>+{r.followerGrowth}</p>
                </div>
                <div>
                  <p className='text-xs text-gray-500 uppercase'>Engagement</p>
                  <p className='text-lg font-bold text-purple-600'>{r.engagement}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}