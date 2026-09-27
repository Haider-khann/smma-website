import Link from 'next/link';
import { prisma } from '@/lib/prisma';

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-blue-100 text-blue-700',
  REJECTED: 'bg-red-100 text-red-700',
  PROPOSAL_SENT: 'bg-purple-100 text-purple-700',
  ACCEPTED: 'bg-green-100 text-green-700',
  CHANGES_REQUESTED: 'bg-orange-100 text-orange-700',
};

export default async function AdminQuotesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const params = await searchParams;
  const status = params.status;
  const q = params.q;

  const where: any = {};
  if (status) where.status = status;
  if (q) {
    where.OR = [
      { title: { contains: q } },
      { description: { contains: q } },
    ];
  }

  const quotes = await prisma.quoteRequest.findMany({
    where,
    include: {
      client: { select: { id: true, name: true, email: true } },
      services: { include: { service: true } },
      proposals: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  const statuses = ['PENDING', 'APPROVED', 'REJECTED', 'PROPOSAL_SENT', 'ACCEPTED', 'CHANGES_REQUESTED'];

  return (
    <div>
      <div className='mb-6'>
        <h1 className='text-3xl font-bold'>Quote Requests</h1>
        <p className='text-gray-600 mt-1'>Manage client quote requests and send proposals.</p>
      </div>

      <form method='get' className='bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-6 flex gap-3 flex-wrap items-center'>
        <input
          type='text'
          name='q'
          defaultValue={q || ''}
          placeholder='Search by title or description...'
          className='border border-gray-300 rounded px-3 py-2 flex-1 min-w-[200px]'
        />
        <select name='status' defaultValue={status || ''} className='border border-gray-300 rounded px-3 py-2'>
          <option value=''>All Statuses</option>
          {statuses.map((s) => (
            <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
          ))}
        </select>
        <button className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700'>Filter</button>
        {(status || q) && (
          <Link href='/admin/quotes' className='text-blue-600 hover:underline text-sm'>Clear</Link>
        )}
      </form>

      {quotes.length === 0 ? (
        <div className='bg-white p-12 rounded-lg shadow-sm border border-gray-100 text-center text-gray-500'>
          No quote requests found.
        </div>
      ) : (
        <div className='bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden'>
          <table className='w-full'>
            <thead className='bg-gray-50 border-b border-gray-200'>
              <tr>
                <th className='text-left px-6 py-3 text-sm font-medium text-gray-600'>Title</th>
                <th className='text-left px-6 py-3 text-sm font-medium text-gray-600'>Client</th>
                <th className='text-left px-6 py-3 text-sm font-medium text-gray-600'>Budget</th>
                <th className='text-left px-6 py-3 text-sm font-medium text-gray-600'>Status</th>
                <th className='text-left px-6 py-3 text-sm font-medium text-gray-600'>Proposals</th>
                <th className='text-left px-6 py-3 text-sm font-medium text-gray-600'>Submitted</th>
                <th className='text-right px-6 py-3 text-sm font-medium text-gray-600'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {quotes.map((quote) => (
                <tr key={quote.id} className='border-b border-gray-100 last:border-0'>
                  <td className='px-6 py-4 font-medium'>{quote.title}</td>
                  <td className='px-6 py-4 text-gray-600'>
                    <p>{quote.client.name || 'Unknown'}</p>
                    <p className='text-xs text-gray-400'>{quote.client.email}</p>
                  </td>
                  <td className='px-6 py-4'>{quote.budget ? '$' + quote.budget : '-'}</td>
                  <td className='px-6 py-4'>
                    <span className={(statusColors[quote.status] || 'bg-gray-100 text-gray-600') + ' px-2 py-1 rounded text-xs font-medium'}>
                      {quote.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className='px-6 py-4 text-gray-600'>{quote.proposals.length}</td>
                  <td className='px-6 py-4 text-gray-600 text-sm'>{new Date(quote.createdAt).toLocaleDateString()}</td>
                  <td className='px-6 py-4 text-right'>
                    <Link href={'/admin/quotes/' + quote.id} className='text-blue-600 hover:underline text-sm'>View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}