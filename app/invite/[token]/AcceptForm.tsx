'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Props = {
  token: string;
  name: string;
  email: string;
};

export default function AcceptForm({ token, name, email }: Props) {
  const router = useRouter();
  const [form, setForm] = useState({ password: '', confirm: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirm) {
      setError('Passwords do not match');
      return;
    }

    if (form.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    const res = await fetch('/api/staff/accept-invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token,
        password: form.password,
        phone: form.phone || undefined,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || 'Something went wrong');
      return;
    }

    router.push('/login?registered=1');
  }

  return (
    <div className='bg-white p-8 rounded-2xl shadow-xl border border-slate-200'>
      <h1 className='text-2xl font-semibold text-slate-900 mb-1 tracking-tight'>Welcome, {name}</h1>
      <p className='text-sm text-slate-500 mb-8'>
        Set your password to activate your staff account.
      </p>

      <div className='bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 mb-6'>
        <p className='text-xs text-slate-500 uppercase tracking-wide mb-0.5'>Your email</p>
        <p className='text-sm text-slate-900 font-medium'>{email}</p>
      </div>

      {error && (
        <div className='bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6 text-sm'>
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} className='space-y-5'>
        <div>
          <label className='block text-sm font-medium text-slate-700 mb-1.5'>Password</label>
          <input
            type='password'
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            minLength={8}
            placeholder='At least 8 characters'
            className='w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-slate-700 mb-1.5'>Confirm password</label>
          <input
            type='password'
            value={form.confirm}
            onChange={(e) => setForm({ ...form, confirm: e.target.value })}
            required
            minLength={8}
            placeholder='Re-enter password'
            className='w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-slate-700 mb-1.5'>
            Phone <span className='text-slate-400 font-normal'>(optional)</span>
          </label>
          <input
            type='text'
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder='03001234567'
            className='w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
          />
        </div>

        <button
          type='submit'
          disabled={loading}
          className='w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white py-2.5 rounded-lg text-sm font-medium hover:from-indigo-700 hover:to-violet-700 disabled:opacity-50 transition-all shadow-lg shadow-indigo-500/20'
        >
          {loading ? 'Activating account...' : 'Activate account'}
        </button>
      </form>

      <p className='text-center text-sm text-slate-500 mt-8'>
        Already have an account?{' '}
        <Link href='/login' className='text-indigo-600 font-medium hover:text-indigo-700'>
          Sign in
        </Link>
      </p>
    </div>
  );
}