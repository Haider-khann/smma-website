'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

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
    <div className='min-h-screen flex items-center justify-center bg-gray-50 p-4'>
      <form onSubmit={onSubmit} className='bg-white p-8 rounded-lg shadow-md w-full max-w-md'>
        <h1 className='text-2xl font-bold mb-6 text-center'>Login</h1>

        {registered && (
          <div className='bg-green-100 text-green-700 p-3 rounded mb-4 text-sm'>
            Account created! Please log in.
          </div>
        )}

        {error && (
          <div className='bg-red-100 text-red-700 p-3 rounded mb-4 text-sm'>{error}</div>
        )}

        <input
          type='email'
          placeholder='Email'
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
          className='w-full border border-gray-300 rounded px-3 py-2 mb-3 focus:outline-none focus:border-blue-500'
        />

        <input
          type='password'
          placeholder='Password'
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
          className='w-full border border-gray-300 rounded px-3 py-2 mb-4 focus:outline-none focus:border-blue-500'
        />

        <button
          type='submit'
          disabled={loading}
          className='w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50'
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <p className='text-center text-sm mt-4 text-gray-600'>
          Don't have an account?{' '}
          <Link href='/register' className='text-blue-600 hover:underline'>Register</Link>
        </p>
      </form>
    </div>
  );
}