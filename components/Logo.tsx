export default function Logo({
  size = 40,
  showText = true,
  variant = 'light',
}: {
  size?: number;
  showText?: boolean;
  variant?: 'light' | 'dark';
}) {
  const textColor = variant === 'dark' ? 'text-white' : 'text-slate-900';
  const subColor = variant === 'dark' ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className='flex items-center gap-3'>
      {/* 3D Omega Mark */}
      <div
        className='relative flex items-center justify-center'
        style={{ width: size, height: size }}
      >
        {/* Glow behind */}
        <div className='absolute inset-0 rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-cyan-500 blur-md opacity-60'></div>

        {/* Main box */}
        <div className='relative w-full h-full rounded-xl bg-gradient-to-br from-indigo-600 via-violet-600 to-indigo-800 flex items-center justify-center shadow-lg overflow-hidden'>
          {/* Highlight */}
          <div className='absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent'></div>

          {/* Omega symbol */}
          <svg
            width={size * 0.55}
            height={size * 0.55}
            viewBox='0 0 24 24'
            fill='none'
            className='relative text-white drop-shadow-lg'
            style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
          >
            <path
              d='M12 3C7.03 3 3 7.03 3 12c0 3.5 1.85 6.55 4.65 8.28V22h2v-2.2c.72.13 1.53.2 2.35.2s1.63-.07 2.35-.2V22h2v-1.72C19.15 18.55 21 15.5 21 12c0-4.97-4.03-9-9-9zm0 2c3.86 0 7 3.14 7 7s-3.14 7-7 7-7-3.14-7-7 3.14-7 7-7z'
              fill='currentColor'
            />
          </svg>
        </div>
      </div>

      {showText && (
        <div className='leading-tight'>
          <div className={`font-bold tracking-tight ${textColor}`} style={{ fontSize: size * 0.5 }}>
            Omega
          </div>
          <div className={`text-xs tracking-wider uppercase ${subColor}`} style={{ fontSize: size * 0.22 }}>
            Work Management
          </div>
        </div>
      )}
    </div>
  );
}