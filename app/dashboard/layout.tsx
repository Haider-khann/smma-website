import Link from 'next/link';
import { auth, signOut } from '@/lib/auth';
import { redirect } from 'next/navigation';
import SidebarLink from '@/components/SidebarLink';
import Icon from '@/components/Icon';

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect('/login');
  if ((session.user as any).role !== 'CLIENT') {
    if ((session.user as any).role === 'ADMIN') redirect('/admin');
    if ((session.user as any).role === 'SMM') redirect('/staff');
  }

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: 'dashboard' as const },
    { href: '/dashboard/notifications', label: 'Notifications', icon: 'bell' as const },
    { href: '/dashboard/quotes', label: 'My Quotes', icon: 'quote' as const },
    { href: '/dashboard/projects', label: 'Projects', icon: 'folder' as const },
    { href: '/dashboard/campaigns', label: 'Campaigns', icon: 'megaphone' as const },
    { href: '/dashboard/messages', label: 'Messages', icon: 'mail' as const },
    { href: '/dashboard/reports', label: 'Reports', icon: 'chart' as const },
    { href: '/dashboard/invoices', label: 'Invoices', icon: 'invoice' as const },
    { href: '/dashboard/reviews', label: 'Reviews', icon: 'star' as const },
  ];

  return (
    <div className='min-h-screen flex bg-slate-100'>
      <aside className='w-64 m-3 mr-0 rounded-2xl bg-slate-900 flex flex-col relative overflow-hidden sidebar-elevated'>
        <div className='absolute -top-20 -right-20 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none'></div>
        <div className='absolute bottom-0 -left-20 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl pointer-events-none'></div>

        <div className='relative h-16 px-5 flex items-center border-b border-white/5'>
          <Link href='/dashboard' className='flex items-center gap-2.5 group'>
            <div className='w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 via-violet-500 to-indigo-700 flex items-center justify-center shadow-lg shadow-indigo-500/40 ring-1 ring-white/10 group-hover:scale-105 transition-transform'>
              <span className='text-white font-bold text-base'>Ω</span>
            </div>
            <div className='leading-tight'>
              <div className='font-semibold text-white text-sm'>Omega</div>
              <div className='text-[10px] text-slate-500 uppercase tracking-wider'>Client</div>
            </div>
          </Link>
        </div>

        <nav className='relative flex-1 p-3 space-y-0.5 overflow-y-auto'>
          {navItems.map((item) => (
            <SidebarLink key={item.href} href={item.href} label={item.label} icon={item.icon} />
          ))}
        </nav>

        <div className='relative p-3 border-t border-white/5'>
          <div className='flex items-center gap-2.5 px-2 py-2 mb-1'>
            <div className='w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 ring-2 ring-white/10 shadow-lg'>
              {session.user.name?.charAt(0).toUpperCase() || 'C'}
            </div>
            <div className='flex-1 min-w-0'>
              <div className='text-xs font-medium text-white truncate'>{session.user.name}</div>
              <div className='text-[10px] text-slate-500 truncate'>{session.user.email}</div>
            </div>
          </div>
          <form
            action={async () => {
              'use server';
              await signOut({ redirectTo: '/login' });
            }}
          >
            <button className='w-full text-left px-3 py-2 rounded-lg text-slate-400 hover:bg-white/5 hover:text-red-400 text-sm flex items-center gap-3 transition-all hover:translate-x-0.5'>
              <Icon name='logout' size={18} />
              <span>Sign out</span>
            </button>
          </form>
        </div>
      </aside>
      <main className='flex-1 overflow-x-auto'>{children}</main>
    </div>
  );
}