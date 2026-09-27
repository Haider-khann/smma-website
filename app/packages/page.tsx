import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export default async function PublicPackagesPage() {
  const packages = await prisma.package.findMany({
    where: { active: true },
    include: { features: true },
    orderBy: { price: 'asc' },
  });

  return (
    <div className='min-h-screen bg-gray-50'>
      <header className='bg-white border-b border-gray-200'>
        <div className='max-w-6xl mx-auto px-6 py-4 flex justify-between items-center'>
          <Link href='/' className='text-xl font-bold'>SMMA</Link>
          <nav className='flex gap-6 text-sm'>
            <Link href='/' className='hover:text-blue-600'>Home</Link>
            <Link href='/services' className='hover:text-blue-600'>Services</Link>
            <Link href='/packages' className='text-blue-600 font-medium'>Packages</Link>
            <Link href='/portfolio' className='hover:text-blue-600'>Portfolio</Link>
            <Link href='/login' className='hover:text-blue-600'>Login</Link>
          </nav>
        </div>
      </header>

      <main className='max-w-6xl mx-auto px-6 py-12'>
        <h1 className='text-4xl font-bold mb-2'>Pricing Packages</h1>
        <p className='text-gray-600 mb-12'>Choose the package that fits your business needs.</p>

        {packages.length === 0 ? (
          <div className='bg-white p-12 rounded-lg shadow-sm text-center text-gray-500'>
            No packages available yet. Check back soon!
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className='bg-white rounded-lg shadow-sm border border-gray-100 p-6 flex flex-col'
              >
                <h3 className='text-xl font-bold mb-2'>{pkg.name}</h3>
                {pkg.description && (
                  <p className='text-sm text-gray-600 mb-4'>{pkg.description}</p>
                )}
                <div className='mb-6'>
                  <span className='text-4xl font-bold text-blue-600'>${pkg.price}</span>
                  <span className='text-sm text-gray-500 ml-2'>/ {pkg.duration} days</span>
                </div>
                <ul className='space-y-2 mb-6 flex-1'>
                  {pkg.features.map((f) => (
                    <li key={f.id} className='flex items-start text-sm text-gray-700'>
                      <span className='text-green-500 mr-2'>✓</span>
                      {f.feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href='/register'
                  className='bg-blue-600 text-white text-center px-4 py-2 rounded hover:bg-blue-700'
                >
                  Choose Package
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
