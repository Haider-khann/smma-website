import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export default async function PackagesListPage() {
  const packages = await prisma.package.findMany({
    include: { features: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-3xl font-bold'>Packages</h1>
        <Link
          href='/admin/packages/new'
          className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700'
        >
          + Add Package
        </Link>
      </div>

      {packages.length === 0 ? (
        <div className='bg-white p-8 rounded-lg shadow-sm border border-gray-100 text-center'>
          <p className='text-gray-500 mb-4'>No packages yet.</p>
          <Link href='/admin/packages/new' className='text-blue-600 hover:underline'>
            Create your first package
          </Link>
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {packages.map((pkg) => (
            <div key={pkg.id} className='bg-white p-5 rounded-lg shadow-sm border border-gray-100'>
              <div className='flex justify-between items-start mb-2'>
                <h3 className='text-lg font-bold'>{pkg.name}</h3>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${pkg.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}
                >
                  {pkg.active ? 'Active' : 'Inactive'}
                </span>
              </div>
              {pkg.description && (
                <p className='text-sm text-gray-600 mb-3'>{pkg.description}</p>
              )}
              <p className='text-2xl font-bold text-blue-600 mb-1'>${pkg.price}</p>
              <p className='text-xs text-gray-500 mb-3'>{pkg.duration} days</p>
              <ul className='text-sm text-gray-600 mb-4 space-y-1'>
                {pkg.features.slice(0, 3).map((f) => (
                  <li key={f.id}>- {f.feature}</li>
                ))}
                {pkg.features.length > 3 && (
                  <li className='text-gray-400'>+ {pkg.features.length - 3} more</li>
                )}
              </ul>
              <Link
                href={`/admin/packages/${pkg.id}/edit`}
                className='text-blue-600 hover:underline text-sm'
              >
                Edit
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
