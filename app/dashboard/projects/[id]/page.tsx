import Link from 'next/link';
import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import FileManager from '@/components/FileManager';

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  ACTIVE: 'bg-blue-100 text-blue-700',
  PAUSED: 'bg-orange-100 text-orange-700',
  COMPLETED: 'bg-green-100 text-green-700',
};

const STAGES = ['Planning', 'Content Creation', 'Content Review', 'Publishing', 'Reporting', 'Completed'];

export default async function ClientProjectDetailPage({
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
      smm: { select: { id: true, name: true, email: true } },
      tasks: {
        include: { assignee: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
      },
      services: { include: { service: true } },
    },
  });

  if (!project || project.clientId !== session.user.id) notFound();

  const currentStageIndex = project.currentStage
    ? STAGES.indexOf(project.currentStage)
    : -1;

  return (
    <div className='max-w-4xl'>
      <Link href='/dashboard/projects' className='text-blue-600 hover:underline text-sm'>Back to My Projects</Link>

      <div className='mt-4 mb-6'>
        <div className='flex justify-between items-start mb-2'>
          <h1 className='text-3xl font-bold'>{project.title}</h1>
          <span className={(statusColors[project.status] || 'bg-gray-100 text-gray-600') + ' px-3 py-1 rounded text-sm font-medium'}>
            {project.status}
          </span>
        </div>
        {project.description && (
          <p className='text-gray-600'>{project.description}</p>
        )}
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
        <div className='bg-white p-4 rounded-lg shadow-sm border border-gray-100'>
          <p className='text-xs text-gray-500 uppercase mb-1'>Progress</p>
          <p className='text-2xl font-bold'>{project.progress}%</p>
          <div className='w-full bg-gray-200 rounded-full h-2 mt-2'>
            <div className='bg-blue-600 h-2 rounded-full' style={{ width: project.progress + '%' }}></div>
          </div>
        </div>
        <div className='bg-white p-4 rounded-lg shadow-sm border border-gray-100'>
          <p className='text-xs text-gray-500 uppercase mb-1'>Deadline</p>
          <p className='text-lg font-medium'>
            {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'Not set'}
          </p>
        </div>
        <div className='bg-white p-4 rounded-lg shadow-sm border border-gray-100'>
          <p className='text-xs text-gray-500 uppercase mb-1'>Current Stage</p>
          <p className='text-lg font-medium'>{project.currentStage || 'Not set'}</p>
        </div>
      </div>

      <div className='bg-white p-5 rounded-lg shadow-sm border border-gray-100 mb-6'>
        <h2 className='font-semibold mb-4'>Project Stages</h2>
        <div className='space-y-2'>
          {STAGES.map((stage, idx) => {
            const isCompleted = currentStageIndex > -1 && idx < currentStageIndex;
            const isCurrent = idx === currentStageIndex;
            const isPending = idx > currentStageIndex;
            return (
              <div key={stage} className='flex items-center gap-3'>
                <div className={(isCompleted ? 'bg-green-500' : isCurrent ? 'bg-blue-500' : 'bg-gray-300') + ' w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold'}>
                  {isCompleted ? '✓' : idx + 1}
                </div>
                <div className='flex-1'>
                  <p className={(isCompleted || isCurrent ? 'font-medium' : 'text-gray-500') + ' text-sm'}>
                    {stage}
                    {isCurrent && <span className='ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded'>Current</span>}
                    {isCompleted && <span className='ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded'>Completed</span>}
                    {isPending && <span className='ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded'>Pending</span>}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
        <div className='bg-white p-5 rounded-lg shadow-sm border border-gray-100'>
          <h2 className='font-semibold mb-3'>Project Manager</h2>
          {project.smm ? (
            <div className='space-y-1 text-sm'>
              <p><span className='text-gray-500'>Name:</span> {project.smm.name}</p>
              <p><span className='text-gray-500'>Email:</span> {project.smm.email}</p>
            </div>
          ) : (
            <p className='text-sm text-gray-500'>Not assigned yet.</p>
          )}
        </div>

        <div className='bg-white p-5 rounded-lg shadow-sm border border-gray-100'>
          <h2 className='font-semibold mb-3'>Services</h2>
          {project.services.length === 0 ? (
            <p className='text-sm text-gray-500'>No services linked.</p>
          ) : (
            <div className='flex flex-wrap gap-2'>
              {project.services.map((ps) => (
                <span key={ps.id} className='bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm'>
                  {ps.service.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div>
        <h2 className='text-xl font-bold mb-4'>Tasks ({project.tasks.length})</h2>
        {project.tasks.length === 0 ? (
          <div className='bg-white p-8 rounded-lg shadow-sm border border-gray-100 text-center text-gray-500'>
            No tasks created yet.
          </div>
        ) : (
          <div className='bg-white rounded-lg shadow-sm border border-gray-100 divide-y divide-gray-100'>
            {project.tasks.map((task) => (
              <div key={task.id} className='p-4'>
                <div className='flex justify-between items-start'>
                  <div>
                    <p className='font-medium'>{task.title}</p>
                    {task.description && <p className='text-sm text-gray-600 mt-1'>{task.description}</p>}
                    <p className='text-xs text-gray-500 mt-1'>Assigned to: {task.assignee?.name || 'Unassigned'}</p>
                  </div>
                  <span className='text-xs font-medium text-gray-500 px-2 py-1 bg-gray-100 rounded'>{task.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className='mt-6'>
        <FileManager projectId={project.id} />
      </div>
    </div>
  );
}