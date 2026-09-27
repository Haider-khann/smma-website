import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export default async function ServicesListPage() {
  const services = await prisma.service.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-3xl font-bold'>Services</h1>
        <Link
          href='/admin/services/new'
          className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700'
        >
          + Add Service
        </Link>
      </div>

      {services.length === 0 ? (
        <div className='bg-white p-8 rounded-lg shadow-sm border border-gray-100 text-center'>
          <p className='text-gray-500 mb-4'>No services yet.</p>
          <Link href='/admin/services/new' className='text-blue-600 hover:underline'>
            Create your first service
          </Link>
        </div>
      ) : (
        <div className='bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden'>
          <table className='w-full'>
            <thead className='bg-gray-50 border-b border-gray-200'>
              <tr>
                <th className='text-left px-6 py-3 text-sm font-medium text-gray-600'>Name</th>
                <th className='text-left px-6 py-3 text-sm font-medium text-gray-600'>Category</th>
                <th className='text-left px-6 py-3 text-sm font-medium text-gray-600'>Price</th>
                <th className='text-left px-6 py-3 text-sm font-medium text-gray-600'>Duration</th>
                <th className='text-left px-6 py-3 text-sm font-medium text-gray-600'>Status</th>
                <th className='text-right px-6 py-3 text-sm font-medium text-gray-600'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {services.map((s) => (
                <tr key={s.id} className='border-b border-gray-100 last:border-0'>
                  <td className='px-6 py-4 font-medium'>{s.name}</td>
                  <td className='px-6 py-4 text-gray-600'>{s.category || '—'}</td>
                  <td className='px-6 py-4'>${s.price}</td>
                  <td className='px-6 py-4 text-gray-600'>{s.duration} days</td>
                  <td className='px-6 py-4'>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${s.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}
                    >
                      {s.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className='px-6 py-4 text-right'>
                    <Link
                      href={`/admin/services/${s.id}/edit`}
                      className='text-blue-600 hover:underline text-sm'
                    >
                      Edit
                    </Link>
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
