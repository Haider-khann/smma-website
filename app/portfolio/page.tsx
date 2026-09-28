import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import PublicNav from '@/components/PublicNav';

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
    <div className='min-h-screen bg-white overflow-x-hidden'>
      <PublicNav />

      <section className='relative overflow-hidden bg-slate-950 py-16 md:py-20'>
        <div className='absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-slate-950 to-violet-900/30'></div>
        <div className='absolute -top-20 -right-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl'></div>
        <div className='absolute -bottom-20 -left-20 w-80 h-80 bg-violet-500/20 rounded-full blur-3xl'></div>

        <div className='relative max-w-7xl mx-auto px-4 md:px-6'>
          <div className='max-w-3xl'>
            <div className='text-sm font-medium text-indigo-400 uppercase tracking-wider mb-3'>Portfolio</div>
            <h1 className='text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-5 tracking-tight leading-[1.1]'>
              Work we are <span className='gradient-text'>proud of.</span>
            </h1>
            <p className='text-base md:text-lg text-slate-400 leading-relaxed max-w-2xl'>
              A selection of projects delivered for our clients.
            </p>
          </div>
        </div>
      </section>

      <section className='border-b border-slate-200 bg-slate-50/50'>
        <div className='max-w-7xl mx-auto px-4 md:px-6 py-6'>
          <form method='get' className='flex gap-3 flex-wrap items-center'>
            <div className='flex-1 min-w-[200px] relative'>
              <input
                type='text'
                name='q'
                defaultValue={q || ''}
                placeholder='Search projects...'
                className='w-full border border-slate-200 rounded-lg pl-10 pr-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition'
              />
              <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400'>
                <path d='M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.35-4.35' strokeLinecap='round' strokeLinejoin='round' />
              </svg>
            </div>
            <select name='category' defaultValue={category || ''} className='border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500'>
              <option value=''>All categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <button className='bg-slate-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors'>
              Filter
            </button>
            {(category || q) && (
              <Link href='/portfolio' className='text-sm text-indigo-600 font-medium hover:text-indigo-700'>
                Clear
              </Link>
            )}
          </form>
        </div>
      </section>

      <section className='max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-16'>
        {items.length === 0 ? (
          <div className='bg-slate-50 border border-slate-200 p-12 md:p-16 rounded-2xl text-center text-slate-500'>
            No projects found.
          </div>
        ) : (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6'>
            {items.map((item) => (
              <div
                key={item.id}
                className='group relative overflow-hidden rounded-2xl border border-slate-200 bg-white hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-100/50 transition-all'
              >
                <div className='aspect-[4/3] overflow-hidden bg-slate-100 relative'>
                  <img src={item.image} alt={item.title} className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-700' />
                  <div className='absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
                  <div className='absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
                    <p className='text-white text-xs md:text-sm line-clamp-2 leading-relaxed'>{item.description}</p>
                  </div>
                </div>
                <div className='p-4 md:p-5'>
                  <div className='flex items-center justify-between mb-2 gap-2'>
                    <span className='text-xs font-medium text-indigo-600 uppercase tracking-wider truncate'>{item.category}</span>
                    <span className='text-xs text-slate-400 whitespace-nowrap'>
                      {new Date(item.projectDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <h3 className='font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors tracking-tight line-clamp-1'>
                    {item.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}