import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import PublicNav from '@/components/PublicNav';

export default async function PublicPackagesPage() {
  const packages = await prisma.package.findMany({
    where: { active: true },
    include: { features: true },
    orderBy: { price: 'asc' },
  });

  const midIndex = Math.floor(packages.length / 2);

  return (
    <div className='min-h-screen bg-white overflow-x-hidden'>
      <PublicNav />

      {/* HERO */}
      <section className='relative overflow-hidden bg-slate-950 py-16 md:py-20'>
        <div className='absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-slate-950 to-violet-900/30'></div>
        <div className='absolute -top-20 -right-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl'></div>
        <div className='absolute -bottom-20 -left-20 w-80 h-80 bg-violet-500/20 rounded-full blur-3xl'></div>

        <div className='relative max-w-7xl mx-auto px-4 md:px-6'>
          <div className='max-w-3xl'>
            <div className='text-sm font-medium text-indigo-400 uppercase tracking-wider mb-3'>Pricing</div>
            <h1 className='text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-5 tracking-tight leading-[1.1]'>
              Plans that <span className='gradient-text'>scale with you.</span>
            </h1>
            <p className='text-base md:text-lg text-slate-400 leading-relaxed max-w-2xl'>
              Transparent pricing. No hidden fees. Cancel anytime.
            </p>
          </div>
        </div>
      </section>

      {/* PACKAGES GRID */}
      <section className='max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-16'>
        {packages.length === 0 ? (
          <div className='bg-slate-50 border border-slate-200 p-12 md:p-16 rounded-2xl text-center text-slate-500'>
            No packages available yet. Check back soon.
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6'>
            {packages.map((pkg, i) => {
              const isFeatured = i === midIndex && packages.length >= 3;
              return (
                <div
                  key={pkg.id}
                  className={`relative rounded-2xl bg-white flex flex-col ${isFeatured ? 'border-2 border-indigo-500 shadow-2xl shadow-indigo-200/50' : 'border border-slate-200 shadow-md shadow-slate-100'}`}
                >
                  {isFeatured && (
                    <div className='absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-semibold tracking-wide uppercase whitespace-nowrap z-10'>
                      Popular
                    </div>
                  )}

                  <div className='p-6 md:p-7 pt-8'>
                    <h3 className='text-lg md:text-xl font-bold text-slate-900 mb-2 tracking-tight'>{pkg.name}</h3>
                    {pkg.description && (
                      <p className='text-sm text-slate-600 leading-relaxed mb-5 min-h-[40px]'>{pkg.description}</p>
                    )}

                    <div className='mb-6 pb-6 border-b border-slate-100'>
                      <div className='flex items-baseline gap-1.5'>
                        <span className='text-3xl md:text-4xl font-bold text-slate-900 tracking-tight'>${pkg.price}</span>
                        <span className='text-slate-500 text-sm'>/{pkg.duration}d</span>
                      </div>
                    </div>

                    <ul className='space-y-2.5 mb-6 flex-1'>
                      {pkg.features.map((f) => (
                        <li key={f.id} className='flex items-start gap-2.5 text-sm text-slate-700'>
                          <div className='w-4 h-4 rounded-full bg-indigo-50 flex items-center justify-center flex-shrink-0 mt-0.5'>
                            <svg width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='3' className='text-indigo-600'>
                              <path d='M20 6L9 17l-5-5' strokeLinecap='round' strokeLinejoin='round' />
                            </svg>
                          </div>
                          <span className='leading-snug'>{f.feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Link
                      href='/register'
                      className={`block text-center py-2.5 rounded-lg text-sm font-medium transition-all mt-auto ${isFeatured ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-700 hover:to-violet-700 shadow-md shadow-indigo-500/20' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
                    >
                      Choose {pkg.name}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className='bg-slate-50 border-t border-slate-200 py-16 md:py-20'>
        <div className='max-w-3xl mx-auto px-4 md:px-6 text-center'>
          <h2 className='text-2xl md:text-3xl font-bold text-slate-900 mb-4 tracking-tight'>
            Not sure which plan fits?
          </h2>
          <p className='text-slate-600 mb-8 leading-relaxed'>
            Create a free account and request a custom quote. Our team will help you choose.
          </p>
          <Link
            href='/register'
            className='inline-flex items-center gap-2 px-6 md:px-7 py-3 rounded-lg bg-slate-900 text-white font-medium hover:bg-slate-800 transition-all'
          >
            Get custom quote →
          </Link>
        </div>
      </section>
    </div>
  );
}