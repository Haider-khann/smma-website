import Link from 'next/link';
import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import StaffProjectPanel from './StaffProjectPanel';
import TaskManager from './TaskManager';
import FileManager from '@/components/FileManager';

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  ACTIVE: 'bg-blue-100 text-blue-700',
  PAUSED: 'bg-orange-100 text-orange-700',
  COMPLETED: 'bg-green-100 text-green-700',
};

export default async function StaffProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) return null;

  const { id } = await params;
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      client: { select: { id: true, name: true, email: true } },
      tasks: {
        include: { assignee: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!project || project.smmId !== session.user.id) notFound();

  const tasksForManager = project.tasks.map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    status: t.status,
    dueDate: t.dueDate ? t.dueDate.toISOString() : null,
    assignee: t.assignee ? { id: t.assignee.id, name: t.assignee.name } : null,
  }));

  return (
    <div className='max-w-5xl'>
      <Link href='/staff/projects' className='text-blue-600 hover:underline text-sm'>Back to My Projects</Link>

      <div className='mt-4 mb-6'>
        <div className='flex justify-between items-start mb-2'>
          <h1 className='text-3xl font-bold'>{project.title}</h1>
          <span className={(statusColors[project.status] || 'bg-gray-100 text-gray-600') + ' px-3 py-1 rounded text-sm font-medium'}>
            {project.status}
          </span>
        </div>
        {project.description && <p className='text-gray-600'>{project.description}</p>}
      </div>

      <div className='bg-white p-5 rounded-lg shadow-sm border border-gray-100 mb-6'>
        <h2 className='font-semibold mb-3'>Client Information</h2>
        <div className='space-y-1 text-sm'>
          <p><span className='text-gray-500'>Name:</span> {project.client.name}</p>
          <p><span className='text-gray-500'>Email:</span> {project.client.email}</p>
        </div>
      </div>

      <StaffProjectPanel
        projectId={project.id}
        initialProgress={project.progress}
        initialStage={project.currentStage || ''}
        initialStatus={project.status}
        initialObjectives={project.objectives || ''}
      />

      <div className='mt-8'>
        <Link
          href={'/staff/projects/' + project.id + '/report/new'}
          className='inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm'
        >
          + Create Monthly Report
        </Link>
      </div>

      <div className='mt-8'>
        <TaskManager projectId={project.id} tasks={tasksForManager} />
      </div>

      <div className='mt-8'>
        <FileManager projectId={project.id} />
      </div>
    </div>
  );
}