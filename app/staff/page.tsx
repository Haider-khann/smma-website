import Link from 'next/link';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function StaffDashboard() {
  const session = await auth();
  if (!session?.user) return null;

  const [assignedProjects, totalTasks, inProgressTasks, doneTasks] = await Promise.all([
    prisma.project.count({ where: { smmId: session.user.id } }),
    prisma.task.count({ where: { project: { smmId: session.user.id } } }),
    prisma.task.count({ where: { project: { smmId: session.user.id }, status: 'IN_PROGRESS' } }),
    prisma.task.count({ where: { project: { smmId: session.user.id }, status: 'DONE' } }),
  ]);

  const stats = [
    { label: 'Assigned Projects', value: assignedProjects, color: 'bg-blue-50 text-blue-700', href: '/staff/projects' },
    { label: 'Total Tasks', value: totalTasks, color: 'bg-purple-50 text-purple-700', href: '/staff/tasks' },
    { label: 'In Progress', value: inProgressTasks, color: 'bg-yellow-50 text-yellow-700', href: '/staff/tasks' },
    { label: 'Completed', value: doneTasks, color: 'bg-green-50 text-green-700', href: '/staff/tasks' },
  ];

  return (
    <div>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold'>Welcome, {session.user.name}</h1>
        <p className='text-gray-600 mt-1'>Your assigned projects and tasks overview.</p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8'>
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className={(stat.color) + ' block p-6 rounded-lg shadow-sm border border-gray-100 hover:scale-105 transition-transform'}
          >
            <p className='text-sm font-medium opacity-80'>{stat.label}</p>
            <p className='text-3xl font-bold mt-2'>{stat.value}</p>
          </Link>
        ))}
      </div>

      <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-100'>
        <h2 className='text-lg font-semibold mb-3'>Quick Actions</h2>
        <Link href='/staff/projects' className='inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700'>
          View My Projects
        </Link>
      </div>
    </div>
  );
}