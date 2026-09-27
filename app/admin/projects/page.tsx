import Link from 'next/link';
import { prisma } from '@/lib/prisma';

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  ACTIVE: 'bg-blue-100 text-blue-700',
  PAUSED: 'bg-orange-100 text-orange-700',
  COMPLETED: 'bg-green-100 text-green-700',
};

export default async function AdminProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const params = await searchParams;
  const status = params.status;
  const q = params.q;

  const where: any = {};
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
      client: { select: { id: true, name: true, email: true } },
      smm: { select: { id: true, name: true, email: true } },
      tasks: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  const statuses = ['PENDING', 'ACTIVE', 'PAUSED', 'COMPLETED'];

  return (
    <div>
      <div className='flex justify-between items-center mb-6'>
        <div>
          <h1 className='text-3xl font-bold'>Projects</h1>
          <p className='text-gray-600 mt-1'>Manage all client projects.</p>
        </div>
      </div>

      <form method='get' className='bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-6 flex gap-3 flex-wrap items-center'>
        <input
          type='text'
          name='q'
          defaultValue={q || ''}
          placeholder='Search by title or description...'
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
          <Link href='/admin/projects' className='text-blue-600 hover:underline text-sm'>Clear</Link>
        )}
      </form>

      {projects.length === 0 ? (
        <div className='bg-white p-12 rounded-lg shadow-sm border border-gray-100 text-center text-gray-500'>
          No projects found. Projects are created automatically when a client accepts a proposal.
        </div>
      ) : (
        <div className='bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden'>
          <table className='w-full'>
            <thead className='bg-gray-50 border-b border-gray-200'>
              <tr>
                <th className='text-left px-6 py-3 text-sm font-medium text-gray-600'>Title</th>
                <th className='text-left px-6 py-3 text-sm font-medium text-gray-600'>Client</th>
                <th className='text-left px-6 py-3 text-sm font-medium text-gray-600'>SMM</th>
                <th className='text-left px-6 py-3 text-sm font-medium text-gray-600'>Status</th>
                <th className='text-left px-6 py-3 text-sm font-medium text-gray-600'>Progress</th>
                <th className='text-left px-6 py-3 text-sm font-medium text-gray-600'>Deadline</th>
                <th className='text-right px-6 py-3 text-sm font-medium text-gray-600'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p.id} className='border-b border-gray-100 last:border-0'>
                  <td className='px-6 py-4 font-medium'>{p.title}</td>
                  <td className='px-6 py-4 text-gray-600'>
                    <p>{p.client.name || 'Unknown'}</p>
                    <p className='text-xs text-gray-400'>{p.client.email}</p>
                  </td>
                  <td className='px-6 py-4 text-gray-600'>
                    {p.smm ? (
                      <span>{p.smm.name}</span>
                    ) : (
                      <span className='text-xs text-orange-600 font-medium'>Not assigned</span>
                    )}
                  </td>
                  <td className='px-6 py-4'>
                    <span className={(statusColors[p.status] || 'bg-gray-100 text-gray-600') + ' px-2 py-1 rounded text-xs font-medium'}>
                      {p.status}
                    </span>
                  </td>
                  <td className='px-6 py-4'>
                    <div className='flex items-center gap-2'>
                      <div className='w-16 bg-gray-200 rounded-full h-2'>
                        <div className='bg-blue-600 h-2 rounded-full' style={{ width: p.progress + '%' }}></div>
                      </div>
                      <span className='text-xs text-gray-600'>{p.progress}%</span>
                    </div>
                  </td>
                  <td className='px-6 py-4 text-gray-600 text-sm'>
                    {p.deadline ? new Date(p.deadline).toLocaleDateString() : '-'}
                  </td>
                  <td className='px-6 py-4 text-right'>
                    <Link href={'/admin/projects/' + p.id} className='text-blue-600 hover:underline text-sm'>Manage</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}