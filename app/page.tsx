import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import Logo from '@/components/Logo';

export default async function HomePage() {
  const [services, packages, portfolio, reviews] = await Promise.all([
    prisma.service.findMany({ where: { active: true }, take: 6 }),
    prisma.package.findMany({ where: { active: true }, include: { features: true }, take: 3 }),
    prisma.portfolio.findMany({ where: { active: true }, take: 6, orderBy: { projectDate: 'desc' } }),
    prisma.review.findMany({
      where: { approved: true },
      include: { client: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 6,
    }),
  ]);

  return (
    <div className='min-h-screen bg-white overflow-x-hidden'>
      {/* Navbar */}
      <header className='fixed top-0 inset-x-0 z-50 glass border-b border-slate-200/50'>
        <div className='max-w-7xl mx-auto px-6 h-16 flex items-center justify-between'>
          <Link href='/'><Logo size={36} /></Link>
          <nav className='hidden md:flex items-center gap-8 text-sm font-medium text-slate-600'>
            <Link href='/services' className='hover:text-slate-900 transition-colors'>Services</Link>
            <Link href='/packages' className='hover:text-slate-900 transition-colors'>Packages</Link>
            <Link href='/portfolio' className='hover:text-slate-900 transition-colors'>Portfolio</Link>
            <Link href='/faq' className='hover:text-slate-900 transition-colors'>FAQ</Link>
          </nav>
          <div className='flex items-center gap-3'>
            <Link href='/login' className='text-sm font-medium text-slate-600 hover:text-slate-900 px-4 py-2 transition-colors'>
              Sign in
            </Link>
            <Link href='/register' className='text-sm font-medium bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors'>
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className='relative pt-32 pb-24 lg:pt-40 lg:pb-32 overflow-hidden'>
        {/* Background gradient */}
        <div className='absolute inset-0 bg-slate-950'></div>
        <div className='absolute inset-0 bg-gradient-to-br from-indigo-900/50 via-slate-950 to-violet-900/40 animate-gradient' style={{ backgroundSize: '200% 200%' }}></div>

        {/* Floating orbs */}
        <div className='absolute top-1/4 -left-20 w-96 h-96 bg-indigo-500/30 rounded-full blur-3xl animate-float'></div>
        <div className='absolute bottom-1/4 -right-20 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl animate-float' style={{ animationDelay: '2s' }}></div>
        <div className='absolute top-1/2 left-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-float' style={{ animationDelay: '4s' }}></div>

        <div className='relative max-w-7xl mx-auto px-6'>
          <div className='text-center max-w-4xl mx-auto'>
            {/* Badge */}
            <div className='inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-300 text-xs font-medium mb-8 animate-fade-in-up backdrop-blur-sm'>
              <span className='w-2 h-2 rounded-full bg-emerald-400 animate-pulse'></span>
              Now accepting new clients
            </div>

            <h1 className='text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight animate-fade-in-up delay-100 leading-[1.05]'>
              Manage your agency,<br />
              <span className='gradient-text'>elegantly.</span>
            </h1>

            <p className='text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 animate-fade-in-up delay-200 leading-relaxed'>
              Omega brings clients, projects, campaigns, content approvals, and invoicing into one refined workspace — designed for modern social media marketing teams.
            </p>

            <div className='flex items-center justify-center gap-4 flex-wrap animate-fade-in-up delay-300'>
              <Link href='/register' className='group relative px-6 py-3 rounded-lg bg-white text-slate-900 font-medium hover:bg-slate-100 transition-all flex items-center gap-2'>
                Get started free
                <span className='group-hover:translate-x-0.5 transition-transform'>→</span>
              </Link>
              <Link href='/services' className='px-6 py-3 rounded-lg bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-all backdrop-blur-sm'>
                Explore services
              </Link>
            </div>

            {/* Stats */}
            <div className='mt-20 grid grid-cols-3 gap-8 max-w-2xl mx-auto animate-fade-in-up delay-500'>
              {[
                { value: '3', label: 'Roles integrated' },
                { value: '15+', label: 'Core modules' },
                { value: '100%', label: 'Custom-built' },
              ].map((stat, i) => (
                <div key={i} className='text-center'>
                  <div className='text-3xl md:text-4xl font-bold text-white mb-1'>{stat.value}</div>
                  <div className='text-xs md:text-sm text-slate-500 uppercase tracking-wider'>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      {services.length > 0 && (
        <section className='py-24 bg-white'>
          <div className='max-w-7xl mx-auto px-6'>
            <div className='max-w-2xl mb-16'>
              <div className='text-sm font-medium text-indigo-600 uppercase tracking-wider mb-3'>Services</div>
              <h2 className='text-4xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight'>
                Everything your brand needs
              </h2>
              <p className='text-lg text-slate-600 leading-relaxed'>
                From strategy to execution, we handle every aspect of your social presence.
              </p>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {services.map((s, i) => (
                <Link
                  key={s.id}
                  href='/services'
                  className={`group relative p-6 rounded-2xl border border-slate-200 bg-white hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-100/50 hover-lift animate-fade-in-up delay-${(i % 3) * 100}`}
                >
                  <div className='w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform'>
                    <div className='w-3 h-3 rounded-full bg-white'></div>
                  </div>
                  <h3 className='text-lg font-semibold text-slate-900 mb-2'>{s.name}</h3>
                  <p className='text-sm text-slate-600 line-clamp-2 mb-4 leading-relaxed'>{s.description}</p>
                  <div className='flex items-center justify-between pt-4 border-t border-slate-100'>
                    <span className='text-lg font-bold text-slate-900'>${s.price}</span>
                    <span className='text-xs text-slate-500'>{s.duration} days</span>
                  </div>
                </Link>
              ))}
            </div>

            <div className='mt-12 text-center'>
              <Link href='/services' className='inline-flex items-center gap-2 text-indigo-600 font-medium hover:text-indigo-700 transition-colors'>
                View all services <span>→</span>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Packages */}
      {packages.length > 0 && (
        <section className='py-24 bg-slate-50'>
          <div className='max-w-7xl mx-auto px-6'>
            <div className='max-w-2xl mb-16'>
              <div className='text-sm font-medium text-indigo-600 uppercase tracking-wider mb-3'>Pricing</div>
              <h2 className='text-4xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight'>
                Simple, transparent pricing
              </h2>
              <p className='text-lg text-slate-600 leading-relaxed'>
                Choose the plan that fits your growth stage.
              </p>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
              {packages.map((p, i) => (
                <div
                  key={p.id}
                  className={`relative p-8 rounded-2xl border bg-white hover-lift animate-fade-in-up delay-${i * 100} ${i === 1 ? 'border-indigo-500 shadow-xl shadow-indigo-100 ring-1 ring-indigo-500' : 'border-slate-200'}`}
                >
                  {i === 1 && (
                    <div className='absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-indigo-600 text-white text-xs font-medium'>
                      Popular
                    </div>
                  )}
                  <h3 className='text-xl font-bold text-slate-900 mb-2'>{p.name}</h3>
                  {p.description && <p className='text-sm text-slate-600 mb-6 leading-relaxed'>{p.description}</p>}
                  <div className='mb-6'>
                    <span className='text-4xl font-bold text-slate-900'>${p.price}</span>
                    <span className='text-slate-500 text-sm'>/{p.duration}d</span>
                  </div>
                  <ul className='space-y-2.5 mb-8'>
                    {p.features.slice(0, 5).map((f) => (
                      <li key={f.id} className='flex items-start gap-2 text-sm text-slate-700'>
                        <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' className='text-indigo-600 flex-shrink-0 mt-0.5'>
                          <path d='M20 6L9 17l-5-5' strokeLinecap='round' strokeLinejoin='round' />
                        </svg>
                        <span>{f.feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href='/packages' className={`block text-center py-3 rounded-lg font-medium transition-colors ${i === 1 ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-slate-900 text-white hover:bg-slate-800'}`}>
                    View package
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Portfolio */}
      {portfolio.length > 0 && (
        <section className='py-24 bg-white'>
          <div className='max-w-7xl mx-auto px-6'>
            <div className='flex items-end justify-between mb-16 flex-wrap gap-4'>
              <div className='max-w-2xl'>
                <div className='text-sm font-medium text-indigo-600 uppercase tracking-wider mb-3'>Our work</div>
                <h2 className='text-4xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight'>
                  Recent projects
                </h2>
                <p className='text-lg text-slate-600 leading-relaxed'>
                  A glimpse of what we have delivered.
                </p>
              </div>
              <Link href='/portfolio' className='text-indigo-600 font-medium hover:text-indigo-700 transition-colors'>
                View all →
              </Link>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {portfolio.map((p, i) => (
                <Link
                  key={p.id}
                  href='/portfolio'
                  className={`group relative overflow-hidden rounded-2xl border border-slate-200 hover-lift animate-fade-in-up delay-${(i % 3) * 100}`}
                >
                  <div className='aspect-[4/3] overflow-hidden bg-slate-100'>
                    <img
                      src={p.image}
                      alt={p.title}
                      className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-700'
                    />
                  </div>
                  <div className='p-5'>
                    <div className='text-xs font-medium text-indigo-600 uppercase tracking-wider mb-1'>{p.category}</div>
                    <h3 className='font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors'>{p.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      {reviews.length > 0 && (
        <section className='py-24 bg-slate-50'>
          <div className='max-w-7xl mx-auto px-6'>
            <div className='max-w-2xl mb-16'>
              <div className='text-sm font-medium text-indigo-600 uppercase tracking-wider mb-3'>Testimonials</div>
              <h2 className='text-4xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight'>
                What clients say
              </h2>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {reviews.map((r, i) => (
                <div
                  key={r.id}
                  className={`p-6 rounded-2xl bg-white border border-slate-200 animate-fade-in-up delay-${(i % 3) * 100}`}
                >
                  <div className='flex gap-0.5 mb-4 text-amber-400'>
                    {[1,2,3,4,5].map((n) => (
                      <svg key={n} width='16' height='16' viewBox='0 0 24 24' fill={n <= r.rating ? 'currentColor' : 'none'} stroke='currentColor' strokeWidth='1.5'>
                        <path d='M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' />
                      </svg>
                    ))}
                  </div>
                  <p className='text-slate-700 mb-6 leading-relaxed'>&ldquo;{r.comment}&rdquo;</p>
                  <div className='flex items-center gap-3 pt-4 border-t border-slate-100'>
                    <div className='w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-semibold text-sm'>
                      {r.client.name?.charAt(0).toUpperCase() || 'C'}
                    </div>
                    <div>
                      <div className='text-sm font-medium text-slate-900'>{r.client.name || 'Client'}</div>
                      <div className='text-xs text-slate-500'>Verified client</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className='py-24 bg-slate-950 relative overflow-hidden'>
        <div className='absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-slate-950 to-violet-900/30 animate-gradient' style={{ backgroundSize: '200% 200%' }}></div>
        <div className='absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-float'></div>
        <div className='absolute bottom-0 right-1/4 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl animate-float' style={{ animationDelay: '3s' }}></div>

        <div className='relative max-w-4xl mx-auto px-6 text-center'>
          <h2 className='text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight'>
            Ready to elevate your brand?
          </h2>
          <p className='text-lg text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed'>
            Join Omega and experience a modern approach to agency management.
          </p>
          <Link href='/register' className='inline-flex items-center gap-2 px-8 py-3.5 rounded-lg bg-white text-slate-900 font-medium hover:bg-slate-100 transition-all'>
            Create free account
            <span>→</span>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className='bg-slate-950 border-t border-slate-800/50 py-16 text-slate-400'>
        <div className='max-w-7xl mx-auto px-6'>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-8 mb-12'>
            <div className='md:col-span-2'>
              <Logo size={40} variant='dark' />
              <p className='text-sm mt-4 max-w-sm leading-relaxed'>
                A modern workspace for social media marketing agencies. Streamline operations, delight clients.
              </p>
            </div>
            <div>
              <h4 className='text-white font-medium mb-3 text-sm'>Product</h4>
              <div className='flex flex-col gap-2 text-sm'>
                <Link href='/services' className='hover:text-white transition-colors'>Services</Link>
                <Link href='/packages' className='hover:text-white transition-colors'>Packages</Link>
                <Link href='/portfolio' className='hover:text-white transition-colors'>Portfolio</Link>
                <Link href='/faq' className='hover:text-white transition-colors'>FAQ</Link>
              </div>
            </div>
            <div>
              <h4 className='text-white font-medium mb-3 text-sm'>Account</h4>
              <div className='flex flex-col gap-2 text-sm'>
                <Link href='/register' className='hover:text-white transition-colors'>Sign up</Link>
                <Link href='/login' className='hover:text-white transition-colors'>Sign in</Link>
              </div>
            </div>
          </div>
          <div className='pt-8 border-t border-slate-800/50 flex flex-col md:flex-row justify-between items-center gap-4 text-xs'>
            <div>© 2026 Omega Work Management. All rights reserved.</div>
            <div className='flex gap-6'>
              <span>Privacy</span>
              <span>Terms</span>
              <span>Contact</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}