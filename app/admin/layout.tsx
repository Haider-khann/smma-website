import Link from 'next/link';
import { requireAdmin } from '@/lib/admin-guard';
import { signOut } from '@/lib/auth';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();

  const navItems = [
    { href: '/admin', label: 'Dashboard' },
    { href: '/admin/notifications', label: 'Notifications' },
    { href: '/admin/quotes', label: 'Quote Requests' },
    { href: '/admin/projects', label: 'Projects' },
    { href: '/admin/campaigns', label: 'Campaigns' },
    { href: '/admin/reports', label: 'Reports' },
    { href: '/admin/invoices', label: 'Invoices' },
    { href: '/admin/reviews', label: 'Reviews' },
    { href: '/admin/services', label: 'Services' },
    { href: '/admin/packages', label: 'Packages' },
    { href: '/admin/portfolio', label: 'Portfolio' },
    { href: '/admin/faq', label: 'FAQ' },
  ];

  return (
    <div className='min-h-screen flex bg-gray-50'>
      <aside className='w-64 bg-white border-r border-gray-200 p-4 flex flex-col'>
        <h1 className='text-xl font-bold mb-6 px-2'>SMMA Admin</h1>
        <nav className='space-y-1 flex-1 overflow-y-auto'>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className='block px-3 py-2 rounded hover:bg-blue-50 text-gray-700 hover:text-blue-700 text-sm'
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className='mt-8 pt-4 border-t border-gray-200'>
          <p className='text-xs text-gray-500 px-2 mb-2 truncate'>{session.user.email}</p>
          <form
            action={async () => {
              'use server';
              await signOut({ redirectTo: '/login' });
            }}
          >
            <button className='w-full text-left px-3 py-2 rounded text-red-600 hover:bg-red-50 text-sm'>
              Logout
            </button>
          </form>
        </div>
      </aside>
      <main className='flex-1 p-8'>{children}</main>
    </div>
  );
}