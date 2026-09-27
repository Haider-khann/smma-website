import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import Link from 'next/link';

export default async function ClientDashboard() {
  const session = await auth();
  if (!session?.user) return null;

  const [quoteCount, projectCount, proposalCount, invoiceCount] = await Promise.all([
    prisma.quoteRequest.count({ where: { clientId: session.user.id } }),
    prisma.project.count({ where: { clientId: session.user.id } }),
    prisma.proposal.count({
      where: {
        quoteRequest: { clientId: session.user.id },
        status: 'PROPOSAL_SENT',
      },
    }),
    prisma.invoice.count({ where: { clientId: session.user.id } }),
  ]);

  const stats = [
    { label: 'Quote Requests', value: quoteCount, color: 'bg-blue-50 text-blue-700', href: '/dashboard/quotes' },
    { label: 'Pending Proposals', value: proposalCount, color: 'bg-yellow-50 text-yellow-700', href: '/dashboard/quotes' },
    { label: 'My Projects', value: projectCount, color: 'bg-green-50 text-green-700', href: '/dashboard/projects' },
    { label: 'Invoices', value: invoiceCount, color: 'bg-purple-50 text-purple-700', href: '/dashboard/invoices' },
  ];

  return (
    <div>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold'>Welcome, {session.user.name}</h1>
        <p className='text-gray-600 mt-1'>Here is a quick overview of your account.</p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8'>
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className={`block p-6 rounded-lg shadow-sm border border-gray-100 ${stat.color} hover:scale-105 transition-transform`}
          >
            <p className='text-sm font-medium opacity-80'>{stat.label}</p>
            <p className='text-3xl font-bold mt-2'>{stat.value}</p>
          </Link>
        ))}
      </div>

      <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-100'>
        <h2 className='text-lg font-semibold mb-3'>Quick Actions</h2>
        <div className='flex gap-3 flex-wrap'>
          <Link
            href='/dashboard/quotes/new'
            className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700'
          >
            + Request a Quote
          </Link>
          <Link
            href='/services'
            className='border border-gray-300 px-4 py-2 rounded hover:bg-gray-50'
          >
            Browse Services
          </Link>
          <Link
            href='/packages'
            className='border border-gray-300 px-4 py-2 rounded hover:bg-gray-50'
          >
            View Packages
          </Link>
        </div>
      </div>
    </div>
  );
}
