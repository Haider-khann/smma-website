import Link from 'next/link';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-blue-100 text-blue-700',
  REJECTED: 'bg-red-100 text-red-700',
  PROPOSAL_SENT: 'bg-purple-100 text-purple-700',
  ACCEPTED: 'bg-green-100 text-green-700',
  CHANGES_REQUESTED: 'bg-orange-100 text-orange-700',
};

export default async function ClientQuotesPage() {
  const session = await auth();
  if (!session?.user) return null;

  const quotes = await prisma.quoteRequest.findMany({
    where: { clientId: session.user.id },
    include: {
      services: { include: { service: true } },
      proposals: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div>
      <div className='flex justify-between items-center mb-6'>
        <div>
          <h1 className='text-3xl font-bold'>My Quote Requests</h1>
          <p className='text-gray-600 mt-1'>Track your requests and proposals.</p>
        </div>
        <Link
          href='/dashboard/quotes/new'
          className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700'
        >
          + New Request
        </Link>
      </div>

      {quotes.length === 0 ? (
        <div className='bg-white p-12 rounded-lg shadow-sm border border-gray-100 text-center'>
          <p className='text-gray-500 mb-4'>You have not submitted any quote requests yet.</p>
          <Link href='/dashboard/quotes/new' className='text-blue-600 hover:underline'>
            Submit your first request
          </Link>
        </div>
      ) : (
        <div className='space-y-3'>
          {quotes.map((quote) => (
            <Link
              key={quote.id}
              href={`/dashboard/quotes/${quote.id}`}
              className='block bg-white p-5 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow'
            >
              <div className='flex justify-between items-start mb-2'>
                <h3 className='text-lg font-semibold'>{quote.title}</h3>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${statusColors[quote.status] || 'bg-gray-100 text-gray-600'}`}
                >
                  {quote.status.replace(/_/g, ' ')}
                </span>
              </div>
              <p className='text-sm text-gray-600 line-clamp-2 mb-3'>{quote.description}</p>
              <div className='flex gap-4 text-xs text-gray-500'>
                <span>Budget: {quote.budget ? '\$' + quote.budget : 'Not specified'}</span>
                <span>Services: {quote.services.length}</span>
                {quote.proposals.length > 0 && (
                  <span className='text-purple-600 font-medium'>
                    {quote.proposals.length} proposal(s)
                  </span>
                )}
                <span>Submitted: {new Date(quote.createdAt).toLocaleDateString()}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
