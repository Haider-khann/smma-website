import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export default async function PortfolioListPage() {
  const items = await prisma.portfolio.findMany({
    orderBy: { projectDate: 'desc' },
  });

  return (
    <div>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-3xl font-bold'>Portfolio</h1>
        <Link
          href='/admin/portfolio/new'
          className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700'
        >
          + Add Project
        </Link>
      </div>

      {items.length === 0 ? (
        <div className='bg-white p-8 rounded-lg shadow-sm border border-gray-100 text-center'>
          <p className='text-gray-500 mb-4'>No portfolio items yet.</p>
          <Link href='/admin/portfolio/new' className='text-blue-600 hover:underline'>
            Add your first project
          </Link>
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {items.map((item) => (
            <div key={item.id} className='bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden'>
              <img src={item.image} alt={item.title} className='w-full h-40 object-cover' />
              <div className='p-4'>
                <div className='flex justify-between items-start mb-2'>
                  <span className='text-xs text-blue-600 font-medium uppercase'>{item.category}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium ${item.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}
                  >
                    {item.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <h3 className='font-bold mb-1'>{item.title}</h3>
                <p className='text-sm text-gray-600 line-clamp-2 mb-3'>{item.description}</p>
                <Link
                  href={`/admin/portfolio/${item.id}/edit`}
                  className='text-blue-600 hover:underline text-sm'
                >
                  Edit
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
