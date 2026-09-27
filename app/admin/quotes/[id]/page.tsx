import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import QuoteActions from './QuoteActions';

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-blue-100 text-blue-700',
  REJECTED: 'bg-red-100 text-red-700',
  PROPOSAL_SENT: 'bg-purple-100 text-purple-700',
  ACCEPTED: 'bg-green-100 text-green-700',
  CHANGES_REQUESTED: 'bg-orange-100 text-orange-700',
};

export default async function AdminQuoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const quote = await prisma.quoteRequest.findUnique({
    where: { id },
    include: {
      client: {
        include: { clientProfile: true },
      },
      services: { include: { service: true } },
      proposals: {
        include: { createdBy: { select: { name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!quote) notFound();

  return (
    <div className='max-w-5xl'>
      <Link href='/admin/quotes' className='text-blue-600 hover:underline text-sm'>Back to Quotes</Link>

      <div className='mt-4 mb-6'>
        <div className='flex justify-between items-start mb-2'>
          <h1 className='text-3xl font-bold'>{quote.title}</h1>
          <span className={(statusColors[quote.status] || 'bg-gray-100 text-gray-600') + ' px-3 py-1 rounded text-sm font-medium'}>
            {quote.status.replace(/_/g, ' ')}
          </span>
        </div>
        <p className='text-gray-600 whitespace-pre-wrap'>{quote.description}</p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-8'>
        <div className='bg-white p-5 rounded-lg shadow-sm border border-gray-100'>
          <h2 className='font-semibold mb-3'>Client Information</h2>
          <div className='space-y-1 text-sm'>
            <p><span className='text-gray-500'>Name:</span> {quote.client.name}</p>
            <p><span className='text-gray-500'>Email:</span> {quote.client.email}</p>
            {quote.client.phone && <p><span className='text-gray-500'>Phone:</span> {quote.client.phone}</p>}
            {quote.client.clientProfile?.businessName && (
              <p><span className='text-gray-500'>Business:</span> {quote.client.clientProfile.businessName}</p>
            )}
            {quote.client.clientProfile?.businessCategory && (
              <p><span className='text-gray-500'>Category:</span> {quote.client.clientProfile.businessCategory}</p>
            )}
          </div>
        </div>

        <div className='bg-white p-5 rounded-lg shadow-sm border border-gray-100'>
          <h2 className='font-semibold mb-3'>Request Details</h2>
          <div className='space-y-1 text-sm'>
            <p><span className='text-gray-500'>Budget:</span> {quote.budget ? '$' + quote.budget : 'Not specified'}</p>
            <p><span className='text-gray-500'>Deadline:</span> {quote.deadline ? new Date(quote.deadline).toLocaleDateString() : 'Not specified'}</p>
            <p><span className='text-gray-500'>Submitted:</span> {new Date(quote.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {quote.services.length > 0 && (
        <div className='bg-white p-5 rounded-lg shadow-sm border border-gray-100 mb-8'>
          <h2 className='font-semibold mb-3'>Requested Services</h2>
          <div className='flex flex-wrap gap-2'>
            {quote.services.map((qs) => (
              <span key={qs.id} className='bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm'>
                {qs.service.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {quote.status === 'PENDING' && <QuoteActions quoteId={quote.id} />}

      <div className='mt-8'>
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-xl font-bold'>Proposals</h2>
          {quote.status === 'APPROVED' && (
            <Link
              href={'/admin/quotes/' + quote.id + '/proposal'}
              className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700'
            >
              + Create Proposal
            </Link>
          )}
        </div>

        {quote.proposals.length === 0 ? (
          <div className='bg-white p-8 rounded-lg shadow-sm border border-gray-100 text-center text-gray-500'>
            {quote.status === 'APPROVED'
              ? 'No proposals yet. Create one to send to the client.'
              : 'Approve the request to create a proposal.'}
          </div>
        ) : (
          <div className='space-y-4'>
            {quote.proposals.map((proposal) => (
              <div key={proposal.id} className='bg-white p-5 rounded-lg shadow-sm border border-gray-100'>
                <div className='flex justify-between items-start mb-2'>
                  <div>
                    <p className='text-2xl font-bold text-blue-600'>{'$' + proposal.price}</p>
                    <p className='text-sm text-gray-500'>Duration: {proposal.duration} days</p>
                  </div>
                  <span className={(statusColors[proposal.status] || 'bg-gray-100 text-gray-600') + ' px-2 py-1 rounded text-xs font-medium'}>
                    {proposal.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <p className='text-gray-700 whitespace-pre-wrap mb-3'>{proposal.description}</p>
                <p className='text-xs text-gray-500'>
                  From: {proposal.createdBy.name || 'Admin'} on {new Date(proposal.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}