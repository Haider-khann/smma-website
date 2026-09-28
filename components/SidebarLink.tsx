'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Icon from './Icon';

type IconName = Parameters<typeof Icon>[0]['name'];

export default function SidebarLink({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: IconName;
}) {
  const pathname = usePathname();

  const isDashboard = href === '/dashboard' || href === '/admin' || href === '/staff';
  const active = isDashboard
    ? pathname === href
    : pathname === href || pathname.startsWith(href + '/');

  return (
    <Link
      href={href}
      className={
        'group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ' +
        'sidebar-link-hover ' +
        (active
          ? 'bg-gradient-to-r from-indigo-500/20 to-violet-500/10 text-white sidebar-link-active'
          : 'text-slate-400 hover:bg-white/5 hover:text-white')
      }
    >
      {active && (
        <span className='absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-indigo-400 to-violet-500 rounded-r-full shadow-lg shadow-indigo-500/50'></span>
      )}
      <span className={active ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}>
        <Icon name={icon} size={18} className='icon-scale' />
      </span>
      <span>{label}</span>
      {active && (
        <span className='ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-lg shadow-indigo-400/50'></span>
      )}
    </Link>
  );
}