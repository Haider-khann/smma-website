'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewFAQPage() {
  const router = useRouter();
  const [form, setForm] = useState({ question: '', answer: '', order: '0' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await fetch('/api/admin/faq', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, order: parseInt(form.order) }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || 'Something went wrong');
      return;
    }

    router.push('/admin/faq');
    router.refresh();
  }

  return (
    <div>
      <div className='mb-6'>
        <Link href='/admin/faq' className='text-blue-600 hover:underline text-sm'>
          Back to FAQ
        </Link>
        <h1 className='text-3xl font-bold mt-2'>Add FAQ</h1>
      </div>

      <form onSubmit={onSubmit} className='bg-white p-6 rounded-lg shadow-sm border border-gray-100 max-w-2xl'>
        {error && (
          <div className='bg-red-100 text-red-700 p-3 rounded mb-4 text-sm'>{error}</div>
        )}

        <div className='mb-4'>
          <label className='block text-sm font-medium mb-1'>Question *</label>
          <input
            type='text'
            value={form.question}
            onChange={(e) => setForm({ ...form, question: e.target.value })}
            required
            className='w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500'
          />
        </div>

        <div className='mb-4'>
          <label className='block text-sm font-medium mb-1'>Answer *</label>
          <textarea
            value={form.answer}
            onChange={(e) => setForm({ ...form, answer: e.target.value })}
            required
            rows={5}
            className='w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500'
          />
        </div>

        <div className='mb-6'>
          <label className='block text-sm font-medium mb-1'>Order</label>
          <input
            type='number'
            value={form.order}
            onChange={(e) => setForm({ ...form, order: e.target.value })}
            className='w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500'
          />
        </div>

        <div className='flex gap-3'>
          <button
            type='submit'
            disabled={loading}
            className='bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50'
          >
            {loading ? 'Creating...' : 'Create FAQ'}
          </button>
          <Link
            href='/admin/faq'
            className='px-6 py-2 rounded border border-gray-300 hover:bg-gray-50'
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
