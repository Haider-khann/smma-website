import Link from 'next/link';
import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function ClientReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) return null;

  const { id } = await params;
  const report = await prisma.report.findUnique({
    where: { id },
    include: {
      project: { select: { id: true, title: true, clientId: true } },
      createdBy: { select: { name: true, email: true } },
    },
  });

  if (!report || report.project.clientId !== session.user.id) notFound();

  return (
    <div className='max-w-3xl'>
      <Link href='/dashboard/reports' className='text-blue-600 hover:underline text-sm'>Back to Reports</Link>

      <div className='mt-4 mb-6'>
        <h1 className='text-3xl font-bold'>{report.month} Report</h1>
        <p className='text-gray-600 mt-1'>Project: {report.project.title}</p>
        <p className='text-xs text-gray-500 mt-1'>Prepared by {report.createdBy.name} on {new Date(report.createdAt).toLocaleDateString()}</p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
        <div className='bg-blue-50 p-5 rounded-lg'>
          <p className='text-xs text-blue-700 uppercase font-medium mb-1'>Posts Published</p>
          <p className='text-3xl font-bold text-blue-700'>{report.postCount}</p>
        </div>
        <div className='bg-green-50 p-5 rounded-lg'>
          <p className='text-xs text-green-700 uppercase font-medium mb-1'>Follower Growth</p>
          <p className='text-3xl font-bold text-green-700'>+{report.followerGrowth}</p>
        </div>
        <div className='bg-purple-50 p-5 rounded-lg'>
          <p className='text-xs text-purple-700 uppercase font-medium mb-1'>Engagement</p>
          <p className='text-3xl font-bold text-purple-700'>{report.engagement}</p>
        </div>
      </div>

      {report.notes && (
        <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-100'>
          <h2 className='font-semibold mb-3'>Notes</h2>
          <p className='text-gray-700 whitespace-pre-wrap'>{report.notes}</p>
        </div>
      )}
    </div>
  );
}