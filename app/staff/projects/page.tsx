import Link from 'next/link';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  ACTIVE: 'bg-blue-100 text-blue-700',
  PAUSED: 'bg-orange-100 text-orange-700',
  COMPLETED: 'bg-green-100 text-green-700',
};

export default async function StaffProjectsPage() {
  const session = await auth();
  if (!session?.user) return null;

  const projects = await prisma.project.findMany({
    where: { smmId: session.user.id },
    include: {
      client: { select: { id: true, name: true, email: true } },
      tasks: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div>
      <div className='mb-6'>
        <h1 className='text-3xl font-bold'>My Projects</h1>
        <p className='text-gray-600 mt-1'>Projects assigned to you.</p>
      </div>

      {projects.length === 0 ? (
        <div className='bg-white p-12 rounded-lg shadow-sm border border-gray-100 text-center text-gray-500'>
          No projects assigned to you yet.
        </div>
      ) : (
        <div className='space-y-3'>
          {projects.map((p) => (
            <Link
              key={p.id}
              href={'/staff/projects/' + p.id}
              className='block bg-white p-5 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow'
            >
              <div className='flex justify-between items-start mb-2'>
                <h3 className='text-lg font-semibold'>{p.title}</h3>
                <span className={(statusColors[p.status] || 'bg-gray-100 text-gray-600') + ' px-2 py-1 rounded text-xs font-medium'}>
                  {p.status}
                </span>
              </div>
              <p className='text-sm text-gray-600 mb-3'>Client: {p.client.name}</p>
              <div className='flex items-center gap-4 mb-3'>
                <div className='flex-1'>
                  <div className='flex justify-between text-xs text-gray-500 mb-1'>
                    <span>Progress</span>
                    <span>{p.progress}%</span>
                  </div>
                  <div className='w-full bg-gray-200 rounded-full h-2'>
                    <div className='bg-blue-600 h-2 rounded-full' style={{ width: p.progress + '%' }}></div>
                  </div>
                </div>
              </div>
              <div className='flex gap-4 text-xs text-gray-500'>
                <span>Stage: {p.currentStage || 'Not set'}</span>
                {p.deadline && <span>Deadline: {new Date(p.deadline).toLocaleDateString()}</span>}
                <span>Tasks: {p.tasks.length}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}