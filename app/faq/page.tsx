import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export default async function PublicFAQPage() {
  const faqs = await prisma.fAQ.findMany({ orderBy: { order: 'asc' } });

  return (
    <div className='min-h-screen bg-gray-50'>
      <header className='bg-white border-b border-gray-200'>
        <div className='max-w-6xl mx-auto px-6 py-4 flex justify-between items-center'>
          <Link href='/' className='text-xl font-bold'>SMMA</Link>
          <nav className='flex gap-6 text-sm'>
            <Link href='/' className='hover:text-blue-600'>Home</Link>
            <Link href='/services' className='hover:text-blue-600'>Services</Link>
            <Link href='/packages' className='hover:text-blue-600'>Packages</Link>
            <Link href='/portfolio' className='hover:text-blue-600'>Portfolio</Link>
            <Link href='/faq' className='text-blue-600 font-medium'>FAQ</Link>
            <Link href='/login' className='hover:text-blue-600'>Login</Link>
          </nav>
        </div>
      </header>

      <main className='max-w-3xl mx-auto px-6 py-12'>
        <h1 className='text-4xl font-bold mb-2'>Frequently Asked Questions</h1>
        <p className='text-gray-600 mb-8'>Answers to common questions.</p>

        {faqs.length === 0 ? (
          <div className='bg-white p-12 rounded-lg shadow-sm text-center text-gray-500'>
            No FAQs available yet.
          </div>
        ) : (
          <div className='space-y-3'>
            {faqs.map((faq) => (
              <details
                key={faq.id}
                className='bg-white rounded-lg shadow-sm border border-gray-100 p-5 group'
              >
                <summary className='font-semibold cursor-pointer list-none flex justify-between items-center'>
                  {faq.question}
                  <span className='text-gray-400 group-open:rotate-180 transition-transform'>▾</span>
                </summary>
                <p className='text-gray-600 mt-3 pl-1'>{faq.answer}</p>
              </details>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
