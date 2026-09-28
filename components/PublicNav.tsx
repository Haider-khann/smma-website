import Link from 'next/link';
import Logo from './Logo';

export default function PublicNav() {
  const links = [
    { href: '/services', label: 'Services' },
    { href: '/packages', label: 'Packages' },
    { href: '/portfolio', label: 'Portfolio' },
    { href: '/faq', label: 'FAQ' },
  ];

  return (
    <header className='sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/60'>
      <div className='max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between'>
        <Link href='/' className='flex-shrink-0'>
          <Logo size={32} />
        </Link>

        <nav className='hidden md:flex items-center gap-8 text-sm font-medium text-slate-600'>
          {links.map((l) => (
            <Link key={l.href} href={l.href} className='hover:text-slate-900 transition-colors relative group'>
              {l.label}
              <span className='absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-500 to-violet-500 group-hover:w-full transition-all duration-300'></span>
            </Link>
          ))}
        </nav>

        <div className='flex items-center gap-2 md:gap-3 flex-shrink-0'>
          <Link href='/login' className='text-sm font-medium text-slate-600 hover:text-slate-900 px-2 md:px-4 py-2 transition-colors'>
            Sign in
          </Link>
          <Link href='/register' className='text-sm font-medium bg-slate-900 text-white px-3 md:px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors'>
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}