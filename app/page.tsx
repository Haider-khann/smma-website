import Link from 'next/link';
import { prisma } from '@/lib/prisma';

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
    <div className='min-h-screen bg-white'>
      <header className='bg-white border-b border-gray-200 sticky top-0 z-10'>
        <div className='max-w-6xl mx-auto px-6 py-4 flex justify-between items-center'>
          <Link href='/' className='text-xl font-bold'>SMMA</Link>
          <nav className='flex gap-6 text-sm'>
            <Link href='/services' className='hover:text-blue-600'>Services</Link>
            <Link href='/packages' className='hover:text-blue-600'>Packages</Link>
            <Link href='/portfolio' className='hover:text-blue-600'>Portfolio</Link>
            <Link href='/faq' className='hover:text-blue-600'>FAQ</Link>
            <Link href='/login' className='hover:text-blue-600'>Login</Link>
          </nav>
        </div>
      </header>

      <section className='bg-gradient-to-br from-blue-600 to-purple-700 text-white'>
        <div className='max-w-6xl mx-auto px-6 py-24 text-center'>
          <h1 className='text-5xl font-bold mb-4'>Grow Your Brand on Social Media</h1>
          <p className='text-xl opacity-90 mb-8 max-w-2xl mx-auto'>
            Full-service social media marketing. Content, ads, and analytics — all in one place.
          </p>
          <div className='flex gap-4 justify-center flex-wrap'>
            <Link href='/register' className='bg-white text-blue-700 px-8 py-3 rounded-lg font-medium hover:bg-gray-100'>
              Get Started
            </Link>
            <Link href='/services' className='border border-white/50 px-8 py-3 rounded-lg font-medium hover:bg-white/10'>
              View Services
            </Link>
          </div>
        </div>
      </section>

      {services.length > 0 && (
        <section className='max-w-6xl mx-auto px-6 py-20'>
          <h2 className='text-3xl font-bold text-center mb-2'>Our Services</h2>
          <p className='text-gray-600 text-center mb-10'>What we can do for your brand.</p>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {services.map((s) => (
              <Link
                key={s.id}
                href='/services'
                className='bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow'
              >
                <h3 className='font-bold text-lg mb-2'>{s.name}</h3>
                <p className='text-sm text-gray-600 line-clamp-2 mb-4'>{s.description}</p>
                <p className='text-xl font-bold text-blue-600'>${s.price}</p>
              </Link>
            ))}
          </div>
          <div className='text-center mt-8'>
            <Link href='/services' className='text-blue-600 hover:underline font-medium'>
              View all services →
            </Link>
          </div>
        </section>
      )}

      {packages.length > 0 && (
        <section className='bg-gray-50 py-20'>
          <div className='max-w-6xl mx-auto px-6'>
            <h2 className='text-3xl font-bold text-center mb-2'>Pricing Packages</h2>
            <p className='text-gray-600 text-center mb-10'>Choose the plan that fits your needs.</p>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
              {packages.map((p) => (
                <div key={p.id} className='bg-white p-6 rounded-lg shadow-sm border border-gray-100'>
                  <h3 className='font-bold text-lg mb-2'>{p.name}</h3>
                  {p.description && <p className='text-sm text-gray-600 mb-4'>{p.description}</p>}
                  <p className='text-3xl font-bold text-blue-600 mb-4'>${p.price}<span className='text-sm text-gray-500 font-normal'>/{p.duration}d</span></p>
                  <Link href='/packages' className='block text-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700'>
                    View Package
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {portfolio.length > 0 && (
        <section className='max-w-6xl mx-auto px-6 py-20'>
          <h2 className='text-3xl font-bold text-center mb-2'>Our Work</h2>
          <p className='text-gray-600 text-center mb-10'>Recent projects we are proud of.</p>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            {portfolio.map((p) => (
              <Link key={p.id} href='/portfolio' className='block bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow'>
                <img src={p.image} alt={p.title} className='w-full h-48 object-cover' />
                <div className='p-4'>
                  <span className='text-xs text-blue-600 font-medium uppercase'>{p.category}</span>
                  <h3 className='font-bold mt-1'>{p.title}</h3>
                </div>
              </Link>
            ))}
          </div>
          <div className='text-center mt-8'>
            <Link href='/portfolio' className='text-blue-600 hover:underline font-medium'>
              View full portfolio →
            </Link>
          </div>
        </section>
      )}

      {reviews.length > 0 && (
        <section className='bg-gray-50 py-20'>
          <div className='max-w-6xl mx-auto px-6'>
            <h2 className='text-3xl font-bold text-center mb-2'>What Our Clients Say</h2>
            <p className='text-gray-600 text-center mb-10'>Real feedback from real clients.</p>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {reviews.map((r) => (
                <div key={r.id} className='bg-white p-6 rounded-lg shadow-sm border border-gray-100'>
                  <div className='text-yellow-500 text-lg mb-3'>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                  <p className='text-gray-700 mb-4'>&ldquo;{r.comment}&rdquo;</p>
                  <p className='text-sm font-medium text-gray-500'>— {r.client.name || 'Client'}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className='bg-blue-600 text-white py-16'>
        <div className='max-w-4xl mx-auto px-6 text-center'>
          <h2 className='text-3xl font-bold mb-4'>Ready to grow?</h2>
          <p className='text-lg opacity-90 mb-8'>Get in touch with our team today.</p>
          <Link href='/register' className='bg-white text-blue-700 px-8 py-3 rounded-lg font-medium hover:bg-gray-100'>
            Create Free Account
          </Link>
        </div>
      </section>

      <footer className='bg-gray-900 text-gray-400 py-12'>
        <div className='max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8'>
          <div>
            <h3 className='text-white font-bold mb-3'>SMMA</h3>
            <p className='text-sm'>Social Media Marketing Agency</p>
          </div>
          <div>
            <h4 className='text-white font-medium mb-3'>Quick Links</h4>
            <div className='flex flex-col gap-1 text-sm'>
              <Link href='/services' className='hover:text-white'>Services</Link>
              <Link href='/packages' className='hover:text-white'>Packages</Link>
              <Link href='/portfolio' className='hover:text-white'>Portfolio</Link>
              <Link href='/faq' className='hover:text-white'>FAQ</Link>
            </div>
          </div>
          <div>
            <h4 className='text-white font-medium mb-3'>Get Started</h4>
            <div className='flex flex-col gap-1 text-sm'>
              <Link href='/register' className='hover:text-white'>Sign Up</Link>
              <Link href='/login' className='hover:text-white'>Login</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}