'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
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
    <div className='min-h-screen flex items-center justify-center bg-gray-50 p-4'>
      <form onSubmit={onSubmit} className='bg-white p-8 rounded-lg shadow-md w-full max-w-md'>
        <h1 className='text-2xl font-bold mb-6 text-center'>Create Account</h1>

        {error && (
          <div className='bg-red-100 text-red-700 p-3 rounded mb-4 text-sm'>{error}</div>
        )}

        <input
          type='text'
          placeholder='Full Name'
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
          className='w-full border border-gray-300 rounded px-3 py-2 mb-3 focus:outline-none focus:border-blue-500'
        />

        <input
          type='email'
          placeholder='Email'
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
          className='w-full border border-gray-300 rounded px-3 py-2 mb-3 focus:outline-none focus:border-blue-500'
        />

        <input
          type='text'
          placeholder='Phone (optional)'
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className='w-full border border-gray-300 rounded px-3 py-2 mb-3 focus:outline-none focus:border-blue-500'
        />

        <input
          type='password'
          placeholder='Password (min 8 characters)'
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
          minLength={8}
          className='w-full border border-gray-300 rounded px-3 py-2 mb-4 focus:outline-none focus:border-blue-500'
        />

        <button
          type='submit'
          disabled={loading}
          className='w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50'
        >
          {loading ? 'Creating account...' : 'Register'}
        </button>

        <p className='text-center text-sm mt-4 text-gray-600'>
          Already have an account?{' '}
          <Link href='/login' className='text-blue-600 hover:underline'>Login</Link>
        </p>
      </form>
    </div>
  );
}