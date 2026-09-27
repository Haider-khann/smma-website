import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export default async function PublicServicesPage() {
  const services = await prisma.service.findMany({
    where: { active: true },
    orderBy: { createdAt: 'desc' },
  });

  const categories = Array.from(
    new Set(services.map((s) => s.category).filter(Boolean))
  ) as string[];

  return (
    <div className='min-h-screen bg-gray-50'>
      <header className='bg-white border-b border-gray-200'>
        <div className='max-w-6xl mx-auto px-6 py-4 flex justify-between items-center'>
          <Link href='/' className='text-xl font-bold'>SMMA</Link>
          <nav className='flex gap-6 text-sm'>
            <Link href='/' className='hover:text-blue-600'>Home</Link>
            <Link href='/services' className='text-blue-600 font-medium'>Services</Link>
            <Link href='/portfolio' className='hover:text-blue-600'>Portfolio</Link>
            <Link href='/login' className='hover:text-blue-600'>Login</Link>
          </nav>
        </div>
      </header>

      <main className='max-w-6xl mx-auto px-6 py-12'>
        <h1 className='text-4xl font-bold mb-2'>Our Services</h1>
        <p className='text-gray-600 mb-8'>Explore what we offer to grow your brand.</p>

        {categories.length > 0 && (
          <div className='flex gap-2 mb-8 flex-wrap'>
            {categories.map((cat) => (
              <span
                key={cat}
                className='bg-white border border-gray-200 px-3 py-1 rounded-full text-sm text-gray-700'
              >
                {cat}
              </span>
            ))}
          </div>
        )}

        {services.length === 0 ? (
          <div className='bg-white p-12 rounded-lg shadow-sm text-center text-gray-500'>
            No services available yet. Check back soon!
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols2- lg:grid-cols-3 gap-6'>
            {services.map((s) => (
              <div
                key={s.id}
                className='bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow'
              >
                {s.image && (
                  <img src={s.image} alt={s.name} className='w-full h-40 object-cover' />
                )}
                <div className='p-5'>
                  {s.category && (
                    <span className='text-xs text-blue-600 font-medium uppercase tracking-wide'>
                      {s.category}
                    </span>
                  )}
                  <h3 className='text-lg font-bold mt-1 mb-2'>{s.name}</h3>
                  <p className='text-gray-600 text-sm mb-4 line-clamp-3'>{s.description}</p>
                  <div className='flex justify-between items-center pt-3 border-t border-gray-100'>
                    <div>
                      <p className='text-2xl font-bold text-blue-600'>${s.price}</p>
                      <p className='text-xs text-gray-500'>{s.duration} days</p>
                    </div>
                    <Link
                      href='/register'
                      className='bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700'
                    >
                      Get Started
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
