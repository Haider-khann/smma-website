'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/Logo';
import Icon from '@/components/Icon';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get('registered');

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await signIn('credentials', {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError('Invalid email or password');
      return;
    }

    router.push('/dashboard');
    router.refresh();
  }

  return (
    <div className='min-h-screen flex bg-slate-950'>
      {/* Left Panel */}
      <div className='hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12 text-white'>
        <div className='absolute inset-0 bg-gradient-to-br from-indigo-900/60 via-slate-950 to-violet-900/40 animate-gradient' style={{ backgroundSize: '200% 200%' }}></div>
        <div className='absolute top-1/4 -left-20 w-96 h-96 bg-indigo-500/30 rounded-full blur-3xl animate-float'></div>
        <div className='absolute bottom-1/4 -right-20 w-96 h-96 bg-violet-500/30 rounded-full blur-3xl animate-float' style={{ animationDelay: '2s' }}></div>

        <div className='relative'>
          <Link href='/'><Logo size={44} variant='dark' /></Link>
        </div>

        <div className='relative max-w-md'>
          <h2 className='text-4xl font-bold leading-tight mb-4 tracking-tight'>
            Welcome back to<br />
            <span className='gradient-text'>Omega.</span>
          </h2>
          <p className='text-slate-400 leading-relaxed mb-10'>
            Your workspace for managing clients, projects, and everything in between.
          </p>

          <div className='space-y-4'>
            {[
              { icon: 'quote' as const, text: 'Manage client relationships' },
              { icon: 'check' as const, text: 'Streamline content approvals' },
              { icon: 'chart' as const, text: 'Track project progress' },
              { icon: 'invoice' as const, text: 'Handle invoicing and reports' },
            ].map((item, i) => (
              <div key={i} className='flex items-center gap-3 text-sm text-slate-300 animate-fade-in-up' style={{ animationDelay: (i * 100 + 200) + 'ms' }}>
                <div className='w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-sm'>
                  <Icon name={item.icon} size={16} className='text-indigo-400' />
                </div>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className='relative text-xs text-slate-500'>
          © 2026 Omega Work Management
        </div>
      </div>

      {/* Right Panel */}
      <div className='flex-1 flex items-center justify-center p-6 lg:p-12 bg-slate-50'>
        <div className='w-full max-w-sm animate-fade-in-up'>
          <div className='lg:hidden flex justify-center mb-8'>
            <Link href='/'><Logo size={44} /></Link>
          </div>

          <h1 className='text-2xl font-semibold text-slate-900 mb-1 tracking-tight'>Sign in</h1>
          <p className='text-sm text-slate-500 mb-8'>Welcome back. Enter your details below.</p>

          {registered && (
            <div className='bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg mb-6 text-sm flex items-center gap-2 animate-fade-in'>
              <Icon name='check' size={16} className='text-emerald-600' />
              <span>Account created. Please sign in.</span>
            </div>
          )}

          {error && (
            <div className='bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6 text-sm animate-fade-in'>
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className='space-y-5'>
            <div>
              <label className='block text-sm font-medium text-slate-700 mb-1.5'>Email</label>
              <input
                type='email'
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                placeholder='you@example.com'
                className='w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-slate-700 mb-1.5'>Password</label>
              <input
                type='password'
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                placeholder='••••••••'
                className='w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition'
              />
            </div>

            <button
              type='submit'
              disabled={loading}
              className='w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white py-2.5 rounded-lg text-sm font-medium hover:from-indigo-700 hover:to-violet-700 disabled:opacity-50 transition-all shadow-lg shadow-indigo-500/20'
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className='text-center text-sm text-slate-500 mt-8'>
            Don't have an account?{' '}
            <Link href='/register' className='text-indigo-600 font-medium hover:text-indigo-700'>
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}