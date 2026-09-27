import Link from 'next/link';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  DONE: 'bg-green-100 text-green-700',
};

export default async function StaffTasksPage() {
  const session = await auth();
  if (!session?.user) return null;

  const tasks = await prisma.task.findMany({
    where: { project: { smmId: session.user.id } },
    include: {
      project: { select: { id: true, title: true } },
      assignee: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const pending = tasks.filter((t) => t.status === 'PENDING').length;
  const inProgress = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const done = tasks.filter((t) => t.status === 'DONE').length;

  return (
    <div>
      <div className='mb-6'>
        <h1 className='text-3xl font-bold'>My Tasks</h1>
        <p className='text-gray-600 mt-1'>All tasks across your assigned projects.</p>
      </div>

      <div className='grid grid-cols-3 gap-4 mb-6'>
        <div className='bg-yellow-50 text-yellow-700 p-4 rounded-lg'>
          <p className='text-xs font-medium uppercase opacity-80'>Pending</p>
          <p className='text-2xl font-bold'>{pending}</p>
        </div>
        <div className='bg-blue-50 text-blue-700 p-4 rounded-lg'>
          <p className='text-xs font-medium uppercase opacity-80'>In Progress</p>
          <p className='text-2xl font-bold'>{inProgress}</p>
        </div>
        <div className='bg-green-50 text-green-700 p-4 rounded-lg'>
          <p className='text-xs font-medium uppercase opacity-80'>Done</p>
          <p className='text-2xl font-bold'>{done}</p>
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className='bg-white p-12 rounded-lg shadow-sm border border-gray-100 text-center text-gray-500'>
          No tasks yet. Create tasks from your project pages.
        </div>
      ) : (
        <div className='space-y-2'>
          {tasks.map((task) => (
            <Link
              key={task.id}
              href={'/staff/projects/' + task.project.id}
              className='block bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow'
            >
              <div className='flex justify-between items-start mb-2'>
                <div className='flex-1'>
                  <p className='font-medium'>{task.title}</p>
                  <p className='text-xs text-gray-500 mt-1'>Project: {task.project.title}</p>
                  {task.description && (
                    <p className='text-sm text-gray-600 mt-1 line-clamp-1'>{task.description}</p>
                  )}
                </div>
                <span className={(statusColors[task.status] || 'bg-gray-100 text-gray-600') + ' px-2 py-1 rounded text-xs font-medium'}>
                  {task.status.replace('_', ' ')}
                </span>
              </div>
              <div className='flex gap-3 text-xs text-gray-500'>
                <span>Assigned to: {task.assignee?.name || 'Unassigned'}</span>
                {task.dueDate && <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}