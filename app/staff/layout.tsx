import Link from 'next/link';
import { auth, signOut } from '@/lib/auth';
import { redirect } from 'next/navigation';
import SidebarLink from '@/components/SidebarLink';
import Icon from '@/components/Icon';

export default async function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect('/login');
  if ((session.user as any).role !== 'SMM') {
    if ((session.user as any).role === 'ADMIN') redirect('/admin');
    if ((session.user as any).role === 'CLIENT') redirect('/dashboard');
  }

  const navItems = [
    { href: '/staff', label: 'Dashboard', icon: 'dashboard' as const },
    { href: '/staff/notifications', label: 'Notifications', icon: 'bell' as const },
    { href: '/staff/projects', label: 'My Projects', icon: 'folder' as const },
    { href: '/staff/tasks', label: 'Tasks', icon: 'task' as const },
    { href: '/staff/campaigns', label: 'Campaigns', icon: 'megaphone' as const },
    { href: '/staff/content', label: 'Content', icon: 'palette' as const },
    { href: '/staff/messages', label: 'Messages', icon: 'mail' as const },
    { href: '/staff/reports', label: 'Reports', icon: 'chart' as const },
    { href: '/staff/timesheets', label: 'Timesheets', icon: 'invoice' as const },
    { href: '/staff/analytics', label: 'Analytics', icon: 'chart' as const },
  ];

  return (
    <div className='min-h-screen flex bg-slate-100'>
      <aside className='w-64 m-3 mr-0 rounded-2xl bg-slate-900 flex flex-col relative overflow-hidden sidebar-elevated'>
        <div className='absolute -top-20 -right-20 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none'></div>
        <div className='absolute bottom-0 -left-20 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl pointer-events-none'></div>

        <div className='relative h-16 px-5 flex items-center border-b border-white/5'>
          <Link href='/staff' className='flex items-center gap-2.5 group'>
            <div className='w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 via-violet-500 to-indigo-700 flex items-center justify-center shadow-lg shadow-indigo-500/40 ring-1 ring-white/10 group-hover:scale-105 transition-transform'>
              <span className='text-white font-bold text-base'>Ω</span>
            </div>
            <div className='leading-tight'>
              <div className='font-semibold text-white text-sm'>Omega</div>
              <div className='text-[10px] text-slate-500 uppercase tracking-wider'>Staff</div>
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
              {session.user.name?.charAt(0).toUpperCase() || 'S'}
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