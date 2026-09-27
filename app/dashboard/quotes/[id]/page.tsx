import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ProposalActions from './ProposalActions';

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-blue-100 text-blue-700',
  REJECTED: 'bg-red-100 text-red-700',
  PROPOSAL_SENT: 'bg-purple-100 text-purple-700',
  ACCEPTED: 'bg-green-100 text-green-700',
  CHANGES_REQUESTED: 'bg-orange-100 text-orange-700',
};

export default async function QuoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return null;

  const { id } = await params;
  const quote = await prisma.quoteRequest.findUnique({
    where: { id },
    include: {
      services: { include: { service: true } },
      proposals: {
        include: { createdBy: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!quote || quote.clientId !== session.user.id) notFound();

  return (
    <div className='max-w-4xl'>
      <Link href='/dashboard/quotes' className='text-blue-600 hover:underline text-sm'>Back to My Quotes</Link>

      <div className='mt-4 mb-8'>
        <div className='flex justify-between items-start mb-2'>
          <h1 className='text-3xl font-bold'>{quote.title}</h1>
          <span className={statusColors[quote.status] || 'bg-gray-100 text-gray-600' + ' px-3 py-1 rounded text-sm font-medium'}>
            {quote.status.replace(/_/g, ' ')}
          </span>
        </div>
        <p className='text-gray-600 mb-4'>{quote.description}</p>

        <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-sm'>
          <div>
            <p className='text-gray-500 text-xs uppercase'>Budget</p>
            <p className='font-medium'>{quote.budget ? '$' + quote.budget : 'Not specified'}</p>
          </div>
          <div>
            <p className='text-gray-500 text-xs uppercase'>Deadline</p>
            <p className='font-medium'>{quote.deadline ? new Date(quote.deadline).toLocaleDateString() : 'Not specified'}</p>
          </div>
          <div>
            <p className='text-gray-500 text-xs uppercase'>Submitted</p>
            <p className='font-medium'>{new Date(quote.createdAt).toLocaleDateString()}</p>
          </div>
          <div>
            <p className='text-gray-500 text-xs uppercase'>Proposals</p>
            <p className='font-medium'>{quote.proposals.length}</p>
          </div>
        </div>
      </div>

      {quote.services.length > 0 && (
        <div className='bg-white p-5 rounded-lg shadow-sm border border-gray-100 mb-8'>
          <h2 className='font-semibold mb-3'>Requested Services</h2>
          <div className='flex flex-wrap gap-2'>
            {quote.services.map((qs) => (
              <span key={qs.id} className='bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm'>{qs.service.name}</span>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className='text-xl font-bold mb-4'>Proposals</h2>
        {quote.proposals.length === 0 ? (
          <div className='bg-white p-8 rounded-lg shadow-sm border border-gray-100 text-center text-gray-500'>No proposals yet. Our team will send you a proposal soon.</div>
        ) : (
          <div className='space-y-4'>
            {quote.proposals.map((proposal) => (
              <div key={proposal.id} className='bg-white p-6 rounded-lg shadow-sm border border-gray-100'>
                <div className='flex justify-between items-start mb-3'>
                  <div>
                    <p className='text-2xl font-bold text-blue-600'>{'$' + proposal.price}</p>
                    <p className='text-sm text-gray-500'>Duration: {proposal.duration} days</p>
                  </div>
                  <span className={statusColors[proposal.status] || 'bg-gray-100 text-gray-600' + ' px-2 py-1 rounded text-xs font-medium'}>
                    {proposal.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <p className='text-gray-700 whitespace-pre-wrap mb-4'>{proposal.description}</p>
                <p className='text-xs text-gray-500 mb-4'>From: {proposal.createdBy.name || 'SMMA Team'} on {new Date(proposal.createdAt).toLocaleDateString()}</p>
                {proposal.status === 'PROPOSAL_SENT' && <ProposalActions proposalId={proposal.id} />}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}