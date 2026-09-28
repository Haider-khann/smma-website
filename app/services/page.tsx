import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import PublicNav from '@/components/PublicNav';

export default async function PublicServicesPage() {
  const services = await prisma.service.findMany({
    where: { active: true },
    orderBy: { createdAt: 'desc' },
  });

  const categories = Array.from(
    new Set(services.map((s) => s.category).filter(Boolean))
  ) as string[];

  return (
    <div className='min-h-screen bg-white overflow-x-hidden'>
      <PublicNav />

      {/* HERO - no overlapping elements */}
      <section className='relative overflow-hidden bg-slate-950 py-16 md:py-20'>
        <div className='absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-slate-950 to-violet-900/30'></div>
        <div className='absolute -top-20 -right-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl'></div>
        <div className='absolute -bottom-20 -left-20 w-80 h-80 bg-violet-500/20 rounded-full blur-3xl'></div>

        <div className='relative max-w-7xl mx-auto px-4 md:px-6'>
          <div className='max-w-3xl'>
            <div className='text-sm font-medium text-indigo-400 uppercase tracking-wider mb-3'>Services</div>
            <h1 className='text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-5 tracking-tight leading-[1.1]'>
              What we <span className='gradient-text'>deliver.</span>
            </h1>
            <p className='text-base md:text-lg text-slate-400 leading-relaxed max-w-2xl'>
              A complete suite of social media marketing services, from strategy to execution.
            </p>
          </div>
        </div>
      </section>

      {/* FILTERS - clean, no negative margin */}
      {categories.length > 0 && (
        <section className='border-b border-slate-200 bg-slate-50/50'>
          <div className='max-w-7xl mx-auto px-4 md:px-6 py-6'>
            <div className='flex gap-2 overflow-x-auto pb-2'>
              <span className='px-4 py-2 rounded-lg text-sm font-medium bg-slate-900 text-white whitespace-nowrap flex-shrink-0'>
                All
              </span>
              {categories.map((cat) => (
                <span
                  key={cat}
                  className='px-4 py-2 rounded-lg text-sm font-medium text-slate-600 bg-white border border-slate-200 hover:border-slate-300 whitespace-nowrap cursor-pointer transition-colors flex-shrink-0'
                >
                  {cat}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* SERVICES GRID */}
      <section className='max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-16'>
        {services.length === 0 ? (
          <div className='bg-slate-50 border border-slate-200 p-12 md:p-16 rounded-2xl text-center text-slate-500'>
            No services available yet. Check back soon.
          </div>
        ) : (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6'>
            {services.map((s) => (
              <div
                key={s.id}
                className='group relative p-5 md:p-6 rounded-2xl border border-slate-200 bg-white hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-100/50 hover-lift flex flex-col'
              >
                {s.image && (
                  <div className='relative w-full h-40 rounded-xl overflow-hidden mb-4 bg-slate-100 flex-shrink-0'>
                    <img src={s.image} alt={s.name} className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-700' />
                    <div className='absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent'></div>
                    {s.category && (
                      <span className='absolute top-3 left-3 text-xs font-medium text-white bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/30'>
                        {s.category}
                      </span>
                    )}
                  </div>
                )}

                <h3 className='text-base md:text-lg font-semibold text-slate-900 mb-2 tracking-tight'>{s.name}</h3>
                <p className='text-sm text-slate-600 line-clamp-3 mb-4 leading-relaxed flex-1'>{s.description}</p>

                <div className='flex items-end justify-between pt-4 border-t border-slate-100 mt-auto'>
                  <div>
                    <div className='text-xl md:text-2xl font-bold text-slate-900'>${s.price}</div>
                    <div className='text-xs text-slate-500 mt-0.5'>{s.duration} days</div>
                  </div>
                  <Link
                    href='/register'
                    className='inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors'
                  >
                    Get started →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className='relative overflow-hidden bg-slate-950 py-16 md:py-20'>
        <div className='absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-slate-950 to-violet-900/30'></div>
        <div className='absolute -top-20 -right-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl'></div>
        <div className='relative max-w-3xl mx-auto px-4 md:px-6 text-center'>
          <h2 className='text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4 tracking-tight'>
            Need something custom?
          </h2>
          <p className='text-slate-400 mb-8 leading-relaxed'>
            Create a free account and request a custom quote tailored to your brand.
          </p>
          <Link
            href='/register'
            className='inline-flex items-center gap-2 px-6 md:px-7 py-3 rounded-lg bg-white text-slate-900 font-medium hover:bg-slate-100 transition-all'
          >
            Get started →
          </Link>
        </div>
      </section>
    </div>
  );
}