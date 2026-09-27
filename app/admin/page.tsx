import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function AdminDashboard() {
  const [clientCount, serviceCount, packageCount, activeProjects] = await Promise.all([
    prisma.user.count({ where: { role: 'CLIENT' } }),
    prisma.service.count(),
    prisma.package.count(),
    prisma.project.count({ where: { status: 'ACTIVE' } }),
  ]);

  const stats = [
    { label: 'Total Clients', value: clientCount, color: 'bg-blue-50 text-blue-700', href: null },
    { label: 'Services', value: serviceCount, color: 'bg-purple-50 text-purple-700', href: '/admin/services' },
    { label: 'Packages', value: packageCount, color: 'bg-green-50 text-green-700', href: '/admin/packages' },
    { label: 'Active Projects', value: activeProjects, color: 'bg-orange-50 text-orange-700', href: null },
  ];

  return (
    <div>
      <h1 className='text-3xl font-bold mb-6'>Admin Dashboard</h1>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        {stats.map((stat) => {
          const card = (
            <div className={`	-6 rounded-lg shadow-sm border border-gray-100 ${stat.color}`}>
              <p className='text-sm font-medium opacity-80'>{stat.label}</p>
              <p className='text-3xl font-bold mt-2'>{stat.value}</p>
            </div>
          );
          return stat.href ? (
            <Link key={stat.label} href={stat.href} className='hover:scale-ice-105 transition-transform'>
              {card}
            </Link>
          ) : (
            <div key={stat.label}>{card}</div>
          );
        })}
      </div>

      <div className='mt-8 bg-white p-6 rounded-lg shadow-sm border border-gray-100'>
        <h2 className='text-lg font-semibold mb-3'>Quick Actions</h2>
        <div className='flex gap-3 flex-wrap'>
          <Link href='/admin/services/new' className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700'>
            + Add Service
          </Link>
          <Link href='/admin/packages/new' className='bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700'>
            + Add Package
          </Link>
          <Link href='/admin/portfolio/new' className='bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700'>
            + Add Portfolio
          </Link>
        </div>
      </div>
    </div>
  );
}
