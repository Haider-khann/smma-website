import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  PAID: 'bg-green-100 text-green-700',
  OVERDUE: 'bg-red-100 text-red-700',
};

export default async function ClientInvoicesPage() {
  const session = await auth();
  if (!session?.user) return null;

  const invoices = await prisma.invoice.findMany({
    where: { clientId: session.user.id },
    include: { project: { select: { id: true, title: true } } },
    orderBy: { createdAt: 'desc' },
  });

  const total = invoices.reduce((s, i) => s + i.amount, 0);
  const pending = invoices.filter((i) => i.status === 'PENDING').reduce((s, i) => s + i.amount, 0);
  const paid = invoices.filter((i) => i.status === 'PAID').reduce((s, i) => s + i.amount, 0);

  return (
    <div>
      <div className='mb-6'>
        <h1 className='text-3xl font-bold'>Invoices</h1>
        <p className='text-gray-600 mt-1'>View your billing history.</p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
        <div className='bg-white p-5 rounded-lg shadow-sm border border-gray-100'>
          <p className='text-xs text-gray-500 uppercase mb-1'>Total Billed</p>
          <p className='text-2xl font-bold'>${total.toFixed(2)}</p>
        </div>
        <div className='bg-yellow-50 p-5 rounded-lg'>
          <p className='text-xs text-yellow-700 uppercase mb-1'>Pending</p>
          <p className='text-2xl font-bold text-yellow-700'>${pending.toFixed(2)}</p>
        </div>
        <div className='bg-green-50 p-5 rounded-lg'>
          <p className='text-xs text-green-700 uppercase mb-1'>Paid</p>
          <p className='text-2xl font-bold text-green-700'>${paid.toFixed(2)}</p>
        </div>
      </div>

      {invoices.length === 0 ? (
        <div className='bg-white p-12 rounded-lg shadow-sm border border-gray-100 text-center text-gray-500'>
          No invoices yet.
        </div>
      ) : (
        <div className='bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden'>
          <table className='w-full'>
            <thead className='bg-gray-50 border-b border-gray-200'>
              <tr>
                <th className='text-left px-6 py-3 text-sm font-medium text-gray-600'>Invoice ID</th>
                <th className='text-left px-6 py-3 text-sm font-medium text-gray-600'>Project</th>
                <th className='text-left px-6 py-3 text-sm font-medium text-gray-600'>Amount</th>
                <th className='text-left px-6 py-3 text-sm font-medium text-gray-600'>Issued</th>
                <th className='text-left px-6 py-3 text-sm font-medium text-gray-600'>Due</th>
                <th className='text-left px-6 py-3 text-sm font-medium text-gray-600'>Status</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className='border-b border-gray-100 last:border-0'>
                  <td className='px-6 py-4 font-mono text-xs text-gray-600'>#{inv.id.slice(-8).toUpperCase()}</td>
                  <td className='px-6 py-4'>{inv.project?.title || '-'}</td>
                  <td className='px-6 py-4 font-medium'>${inv.amount.toFixed(2)}</td>
                  <td className='px-6 py-4 text-gray-600 text-sm'>{new Date(inv.issueDate).toLocaleDateString()}</td>
                  <td className='px-6 py-4 text-gray-600 text-sm'>{new Date(inv.dueDate).toLocaleDateString()}</td>
                  <td className='px-6 py-4'>
                    <span className={(statusColors[inv.status] || 'bg-gray-100 text-gray-600') + ' px-2 py-1 rounded text-xs font-medium'}>
                      {inv.status}
                    </span>
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