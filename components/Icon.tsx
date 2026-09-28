type IconName =
  | 'dashboard'
  | 'bell'
  | 'quote'
  | 'folder'
  | 'megaphone'
  | 'chart'
  | 'invoice'
  | 'star'
  | 'users'
  | 'settings'
  | 'package'
  | 'image'
  | 'help'
  | 'mail'
  | 'task'
  | 'palette'
  | 'logout'
  | 'user'
  | 'search'
  | 'plus'
  | 'check';

export default function Icon({ name, size = 18, className = '' }: { name: IconName; size?: number; className?: string }) {
  const paths: Record<IconName, JSX.Element> = {
    dashboard: (
      <path d='M3 3h7v7H3V3zm11 0h7v7h-7V3zm0 11h7v7h-7v-7zM3 14h7v7H3v-7z' strokeLinecap='round' strokeLinejoin='round' />
    ),
    bell: (
      <path d='M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0' strokeLinecap='round' strokeLinejoin='round' />
    ),
    quote: (
      <path d='M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z' strokeLinecap='round' strokeLinejoin='round' />
    ),
    folder: (
      <path d='M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z' strokeLinecap='round' strokeLinejoin='round' />
    ),
    megaphone: (
      <path d='M3 11l18-5v12L3 14v-3zM11.6 16.8a3 3 0 11-5.8-1.6' strokeLinecap='round' strokeLinejoin='round' />
    ),
    chart: (
      <path d='M3 3v18h18M18 17V9M13 17V5M8 17v-3' strokeLinecap='round' strokeLinejoin='round' />
    ),
    invoice: (
      <path d='M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8' strokeLinecap='round' strokeLinejoin='round' />
    ),
    star: (
      <path d='M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' strokeLinecap='round' strokeLinejoin='round' />
    ),
    users: (
      <path d='M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75' strokeLinecap='round' strokeLinejoin='round' />
    ),
    settings: (
      <path d='M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z' strokeLinecap='round' strokeLinejoin='round' />
    ),
    package: (
      <path d='M16.5 9.4L7.55 4.24M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16zM3.27 6.96L12 12.01l8.73-5.05M12 22.08V12' strokeLinecap='round' strokeLinejoin='round' />
    ),
    image: (
      <path d='M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zM8.5 10a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM21 15l-5-5L5 21' strokeLinecap='round' strokeLinejoin='round' />
    ),
    help: (
      <path d='M12 22a10 10 0 100-20 10 10 0 000 20zM9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01' strokeLinecap='round' strokeLinejoin='round' />
    ),
    mail: (
      <path d='M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6' strokeLinecap='round' strokeLinejoin='round' />
    ),
    task: (
      <path d='M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11' strokeLinecap='round' strokeLinejoin='round' />
    ),
    palette: (
      <path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c1.1 0 2-.9 2-2v-.5c0-.28.22-.5.5-.5H16c3.31 0 6-2.69 6-6 0-5.52-4.48-10-10-10zM6.5 13a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM9.5 9a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM14.5 9a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM17.5 13a1.5 1.5 0 100-3 1.5 1.5 0 000 3z' strokeLinecap='round' strokeLinejoin='round' />
    ),
    logout: (
      <path d='M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9' strokeLinecap='round' strokeLinejoin='round' />
    ),
    user: (
      <path d='M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z' strokeLinecap='round' strokeLinejoin='round' />
    ),
    search: (
      <path d='M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.35-4.35' strokeLinecap='round' strokeLinejoin='round' />
    ),
    plus: (
      <path d='M12 5v14M5 12h14' strokeLinecap='round' strokeLinejoin='round' />
    ),
    check: (
      <path d='M20 6L9 17l-5-5' strokeLinecap='round' strokeLinejoin='round' />
    ),
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      className={className}
      aria-hidden='true'
    >
      {paths[name]}
    </svg>
  );
}