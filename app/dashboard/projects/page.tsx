import Link from 'next/link';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  ACTIVE: 'bg-blue-100 text-blue-700',
  PAUSED: 'bg-orange-100 text-orange-700',
  COMPLETED: 'bg-green-100 text-green-700',
};

export default async function ClientProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const session = await auth();
  if (!session?.user) return null;

  const params = await searchParams;
  const status = params.status;
  const q = params.q;

  const where: any = { clientId: session.user.id };
  if (status) where.status = status;
  if (q) {
    where.OR = [
      { title: { contains: q } },
      { description: { contains: q } },
    ];
  }

  const projects = await prisma.project.findMany({
    where,
    include: {
      smm: { select: { id: true, name: true, email: true } },
      tasks: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  const statuses = ['PENDING', 'ACTIVE', 'PAUSED', 'COMPLETED'];

  return (
    <div>
      <div className='mb-6'>
        <h1 className='text-3xl font-bold'>My Projects</h1>
        <p className='text-gray-600 mt-1'>Track your ongoing and completed projects.</p>
      </div>

      <form method='get' className='bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-6 flex gap-3 flex-wrap items-center'>
        <input
          type='text'
          name='q'
          defaultValue={q || ''}
          placeholder='Search projects...'
          className='border border-gray-300 rounded px-3 py-2 flex-1 min-w-[200px]'
        />
        <select name='status' defaultValue={status || ''} className='border border-gray-300 rounded px-3 py-2'>
          <option value=''>All Statuses</option>
          {statuses.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <button className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700'>Filter</button>
        {(status || q) && (
          <Link href='/dashboard/projects' className='text-blue-600 hover:underline text-sm'>Clear</Link>
        )}
      </form>

      {projects.length === 0 ? (
        <div className='bg-white p-12 rounded-lg shadow-sm border border-gray-100 text-center text-gray-500'>
          <p className='mb-4'>No projects found.</p>
          <Link href='/dashboard/quotes' className='text-blue-600 hover:underline'>
            View your quote requests
          </Link>
        </div>
      ) : (
        <div className='space-y-3'>
          {projects.map((p) => (
            <Link
              key={p.id}
              href={'/dashboard/projects/' + p.id}
              className='block bg-white p-5 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow'
            >
              <div className='flex justify-between items-start mb-2'>
                <h3 className='text-lg font-semibold'>{p.title}</h3>
                <span className={(statusColors[p.status] || 'bg-gray-100 text-gray-600') + ' px-2 py-1 rounded text-xs font-medium'}>
                  {p.status}
                </span>
              </div>
              {p.description && (
                <p className='text-sm text-gray-600 line-clamp-2 mb-3'>{p.description}</p>
              )}
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
                <span>Assigned to: {p.smm?.name || 'Not assigned'}</span>
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