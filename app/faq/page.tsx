import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import PublicNav from '@/components/PublicNav';

export default async function PublicFAQPage() {
  const faqs = await prisma.fAQ.findMany({ orderBy: { order: 'asc' } });

  return (
    <div className='min-h-screen bg-white overflow-x-hidden'>
      <PublicNav />

      <section className='relative overflow-hidden bg-slate-950 py-16 md:py-20'>
        <div className='absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-slate-950 to-violet-900/30'></div>
        <div className='absolute -top-20 -right-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl'></div>
        <div className='absolute -bottom-20 -left-20 w-80 h-80 bg-violet-500/20 rounded-full blur-3xl'></div>

        <div className='relative max-w-7xl mx-auto px-4 md:px-6'>
          <div className='max-w-3xl'>
            <div className='text-sm font-medium text-indigo-400 uppercase tracking-wider mb-3'>FAQ</div>
            <h1 className='text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-5 tracking-tight leading-[1.1]'>
              Questions, <span className='gradient-text'>answered.</span>
            </h1>
            <p className='text-base md:text-lg text-slate-400 leading-relaxed max-w-2xl'>
              Everything you need to know about working with Omega.
            </p>
          </div>
        </div>
      </section>

      <section className='max-w-3xl mx-auto px-4 md:px-6 py-12 md:py-16'>
        {faqs.length === 0 ? (
          <div className='bg-slate-50 border border-slate-200 p-12 md:p-16 rounded-2xl text-center text-slate-500'>
            No FAQs available yet.
          </div>
        ) : (
          <div className='space-y-3'>
            {faqs.map((faq) => (
              <details
                key={faq.id}
                className='group bg-white rounded-2xl border border-slate-200 hover:border-indigo-200 transition-colors open:border-indigo-300 open:shadow-lg open:shadow-indigo-100/50'
              >
                <summary className='flex items-center justify-between cursor-pointer list-none gap-4 p-5 md:p-6'>
                  <span className='font-semibold text-slate-900 tracking-tight pr-4'>{faq.question}</span>
                  <div className='w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 group-open:bg-indigo-600 group-open:rotate-180 transition-all duration-300'>
                    <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' className='text-slate-600 group-open:text-white transition-colors'>
                      <path d='M6 9l6 6 6-6' strokeLinecap='round' strokeLinejoin='round' />
                    </svg>
                  </div>
                </summary>
                <div className='px-5 md:px-6 pb-5 md:pb-6 text-slate-600 leading-relaxed text-sm md:text-base border-t border-slate-100 pt-4'>
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        )}
      </section>

      <section className='relative overflow-hidden bg-slate-950 py-16 md:py-20'>
        <div className='absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-slate-950 to-violet-900/30'></div>
        <div className='absolute -top-20 -right-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl'></div>
        <div className='relative max-w-3xl mx-auto px-4 md:px-6 text-center'>
          <h2 className='text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4 tracking-tight'>
            Still have questions?
          </h2>
          <p className='text-slate-400 mb-8 leading-relaxed'>
            Create a free account and reach out. We will get back to you shortly.
          </p>
          <Link
            href='/register'
            className='inline-flex items-center gap-2 px-6 md:px-7 py-3 rounded-lg bg-white text-slate-900 font-medium hover:bg-slate-100 transition-all'
          >
            Get in touch →
          </Link>
        </div>
      </section>
    </div>
  );
}