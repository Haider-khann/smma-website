import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export default async function PublicPortfolioPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const params = await searchParams;
  const category = params.category;
  const q = params.q;

  const where: any = { active: true };
  if (category) where.category = category;
  if (q) {
    where.OR = [
      { title: { contains: q } },
      { description: { contains: q } },
    ];
  }

  const items = await prisma.portfolio.findMany({
    where,
    orderBy: { projectDate: 'desc' },
  });

  const allItems = await prisma.portfolio.findMany({
    where: { active: true },
    select: { category: true },
  });
  const categories = Array.from(new Set(allItems.map((i) => i.category)));

  return (
    <div className='min-h-screen bg-gray-50'>
      <header className='bg-white border-b border-gray-200'>
        <div className='max-w-6xl mx-auto px-6 py-4 flex justify-between items-center'>
          <Link href='/' className='text-xl font-bold'>SMMA</Link>
          <nav className='flex gap-6 text-sm'>
            <Link href='/' className='hover:text-blue-600'>Home</Link>
            <Link href='/services' className='hover:text-blue-600'>Services</Link>
            <Link href='/packages' className='hover:text-blue-600'>Packages</Link>
            <Link href='/portfolio' className='text-blue-600 font-medium'>Portfolio</Link>
            <Link href='/faq' className='hover:text-blue-600'>FAQ</Link>
            <Link href='/login' className='hover:text-blue-600'>Login</Link>
          </nav>
        </div>
      </header>

      <main className='max-w-6xl mx-auto px-6 py-12'>
        <h1 className='text-4xl font-bold mb-2'>Our Portfolio</h1>
        <p className='text-gray-600 mb-8'>Projects we are proud of.</p>

        <form method='get' className='mb-8 flex gap-3 flex-wrap'>
          <input
            type='text'
            name='q'
            defaultValue={q || ''}
            placeholder='Search projects...'
            className='border border-gray-300 rounded px-3 py-2 flex-1 min-w-[200px]'
          />
          <select
            name='category'
            defaultValue={category || ''}
            className='border border-gray-300 rounded px-3 py-2'
          >
            <option value=''>All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <button className='bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700'>
            Filter
          </button>
        </form>

        {items.length === 0 ? (
          <div className='bg-white p-12 rounded-lg shadow-sm text-center text-gray-500'>
            No projects found.
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {items.map((item) => (
              <div
                key={item.id}
                className='bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow'
              >
                <img src={item.image} alt={item.title} className='w-full h-48 object-cover' />
                <div className='p-5'>
                  <span className='text-xs text-blue-600 font-medium uppercase tracking-wide'>
                    {item.category}
                  </span>
                  <h3 className='text-lg font-bold mt-1 mb-2'>{item.title}</h3>
                  <p className='text-sm text-gray-600 line-clamp-3'>{item.description}</p>
                  <p className='text-xs text-gray-400 mt-3'>
                    {new Date(item.projectDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
