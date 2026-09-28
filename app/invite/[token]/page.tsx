import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import Logo from '@/components/Logo';
import AcceptForm from './AcceptForm';

export default async function AcceptInvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const invitation = await prisma.invitation.findUnique({
    where: { token },
  });

  if (!invitation) {
    return (
      <div className='min-h-screen flex items-center justify-center p-6 bg-slate-50'>
        <div className='max-w-md w-full text-center'>
          <Link href='/' className='flex justify-center mb-8'>
            <Logo size={48} />
          </Link>
          <div className='bg-white p-8 rounded-2xl shadow-xl border border-slate-200'>
            <div className='w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-5'>
              <svg width='28' height='28' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' className='text-red-600'>
                <path d='M12 9v4M12 17h.01M12 22a10 10 0 100-20 10 10 0 000 20z' strokeLinecap='round' strokeLinejoin='round' />
              </svg>
            </div>
            <h1 className='text-xl font-semibold text-slate-900 mb-2'>Invalid invitation</h1>
            <p className='text-sm text-slate-500 mb-6'>
              This invitation link is invalid or has been removed. Please contact your administrator for a new link.
            </p>
            <Link href='/' className='inline-block px-5 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors'>
              Go to homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (invitation.accepted) {
    return (
      <div className='min-h-screen flex items-center justify-center p-6 bg-slate-50'>
        <div className='max-w-md w-full text-center'>
          <Link href='/' className='flex justify-center mb-8'>
            <Logo size={48} />
          </Link>
          <div className='bg-white p-8 rounded-2xl shadow-xl border border-slate-200'>
            <div className='w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5'>
              <svg width='28' height='28' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' className='text-emerald-600'>
                <path d='M20 6L9 17l-5-5' strokeLinecap='round' strokeLinejoin='round' />
              </svg>
            </div>
            <h1 className='text-xl font-semibold text-slate-900 mb-2'>Invitation already used</h1>
            <p className='text-sm text-slate-500 mb-6'>
              This invitation has already been accepted. Sign in with your credentials to continue.
            </p>
            <Link href='/login' className='inline-block px-5 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors'>
              Sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (invitation.expiresAt < new Date()) {
    return (
      <div className='min-h-screen flex items-center justify-center p-6 bg-slate-50'>
        <div className='max-w-md w-full text-center'>
          <Link href='/' className='flex justify-center mb-8'>
            <Logo size={48} />
          </Link>
          <div className='bg-white p-8 rounded-2xl shadow-xl border border-slate-200'>
            <div className='w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-5'>
              <svg width='28' height='28' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' className='text-amber-600'>
                <path d='M12 22a10 10 0 100-20 10 10 0 000 20zM12 6v6l4 2' strokeLinecap='round' strokeLinejoin='round' />
              </svg>
            </div>
            <h1 className='text-xl font-semibold text-slate-900 mb-2'>Invitation expired</h1>
            <p className='text-sm text-slate-500 mb-6'>
              This invitation has expired. Please contact your administrator for a new link.
            </p>
            <Link href='/' className='inline-block px-5 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors'>
              Go to homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen flex items-center justify-center p-6 bg-slate-50'>
      <div className='max-w-md w-full'>
        <Link href='/' className='flex justify-center mb-8'>
          <Logo size={48} />
        </Link>
        <AcceptForm token={token} name={invitation.name} email={invitation.email} />
      </div>
    </div>
  );
}