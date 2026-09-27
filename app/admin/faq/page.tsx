import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export default async function FAQListPage() {
  const faqs = await prisma.fAQ.findMany({ orderBy: { order: 'asc' } });

  return (
    <div>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-3xl font-bold'>FAQ</h1>
        <Link
          href='/admin/faq/new'
          className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700'
        >
          + Add FAQ
        </Link>
      </div>

      {faqs.length === 0 ? (
        <div className='bg-white p-8 rounded-lg shadow-sm border border-gray-100 text-center'>
          <p className='text-gray-500 mb-4'>No FAQs yet.</p>
          <Link href='/admin/faq/new' className='text-blue-600 hover:underline'>
            Add your first FAQ
          </Link>
        </div>
      ) : (
        <div className='bg-white rounded-lg shadow-sm border border-gray-100 divide-y divide-gray-100'>
          {faqs.map((faq) => (
            <div key={faq.id} className='p-5'>
              <div className='flex justify-between items-start mb-2'>
                <h3 className='font-semibold'>{faq.question}</h3>
                <Link
                  href={`/admin/faq/${faq.id}/edit`}
                  className='text-blue-600 hover:underline text-sm ml-4'
                >
                  Edit
                </Link>
              </div>
              <p className='text-sm text-gray-600'>{faq.answer}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
