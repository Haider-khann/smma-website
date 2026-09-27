import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import ProjectManagePanel from './ProjectManagePanel';
import FileManager from '@/components/FileManager';

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  ACTIVE: 'bg-blue-100 text-blue-700',
  PAUSED: 'bg-orange-100 text-orange-700',
  COMPLETED: 'bg-green-100 text-green-700',
};

export default async function AdminProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      client: { include: { clientProfile: true } },
      smm: { select: { id: true, name: true, email: true } },
      tasks: {
        include: { assignee: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
      },
      services: { include: { service: true } },
    },
  });

  if (!project) notFound();

  const smms = await prisma.user.findMany({
    where: { role: 'SMM' },
    select: { id: true, name: true, email: true },
  });

  return (
    <div className='max-w-5xl'>
      <Link href='/admin/projects' className='text-blue-600 hover:underline text-sm'>Back to Projects</Link>

      <div className='mt-4 mb-6'>
        <div className='flex justify-between items-start mb-2'>
          <h1 className='text-3xl font-bold'>{project.title}</h1>
          <span className={(statusColors[project.status] || 'bg-gray-100 text-gray-600') + ' px-3 py-1 rounded text-sm font-medium'}>
            {project.status}
          </span>
        </div>
        <p className='text-gray-600'>{project.description}</p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-8'>
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

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-8'>
        <div className='bg-white p-5 rounded-lg shadow-sm border border-gray-100'>
          <h2 className='font-semibold mb-3'>Client</h2>
          <div className='space-y-1 text-sm'>
            <p><span className='text-gray-500'>Name:</span> {project.client.name}</p>
            <p><span className='text-gray-500'>Email:</span> {project.client.email}</p>
            {project.client.phone && <p><span className='text-gray-500'>Phone:</span> {project.client.phone}</p>}
            {project.client.clientProfile?.businessName && (
              <p><span className='text-gray-500'>Business:</span> {project.client.clientProfile.businessName}</p>
            )}
          </div>
        </div>

        <div className='bg-white p-5 rounded-lg shadow-sm border border-gray-100'>
          <h2 className='font-semibold mb-3'>Assigned Services</h2>
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

      <ProjectManagePanel
        projectId={project.id}
        initialSmmId={project.smm?.id || ''}
        initialStatus={project.status}
        initialProgress={project.progress}
        initialStage={project.currentStage || ''}
        initialStartDate={project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : ''}
        initialDeadline={project.deadline ? new Date(project.deadline).toISOString().split('T')[0] : ''}
        smms={smms}
      />

      {project.tasks.length > 0 && (
        <div className='mt-8'>
          <h2 className='text-xl font-bold mb-4'>Tasks</h2>
          <div className='bg-white rounded-lg shadow-sm border border-gray-100 divide-y divide-gray-100'>
            {project.tasks.map((task) => (
              <div key={task.id} className='p-4'>
                <div className='flex justify-between items-start'>
                  <div>
                    <p className='font-medium'>{task.title}</p>
                    {task.description && <p className='text-sm text-gray-600 mt-1'>{task.description}</p>}
                    <p className='text-xs text-gray-500 mt-1'>
                      Assigned to: {task.assignee?.name || 'Unassigned'}
                    </p>
                  </div>
                  <span className='text-xs font-medium text-gray-500'>{task.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className='mt-8'>
        <FileManager projectId={project.id} />
      </div>
    </div>
  );
}