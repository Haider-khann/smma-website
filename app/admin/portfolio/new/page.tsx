'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewPortfolioPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    image: '',
    projectDate: new Date().toISOString().split('T')[0],
    active: true,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await fetch('/api/admin/portfolio', {
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

    router.push('/admin/portfolio');
    router.refresh();
  }

  return (
    <div>
      <div className='mb-6'>
        <Link href='/admin/portfolio' className='text-blue-600 hover:underline text-sm'>
          Back to Portfolio
        </Link>
        <h1 className='text-3xl font-bold mt-2'>Add Portfolio Project</h1>
      </div>

      <form onSubmit={onSubmit} className='bg-white p-6 rounded-lg shadow-sm border border-gray-100 max-w-2xl'>
        {error && (
          <div className='bg-red-100 text-red-700 p-3 rounded mb-4 text-sm'>{error}</div>
        )}

        <div className='mb-4'>
          <label className='block text-sm font-medium mb-1'>Project Title *</label>
          <input
            type='text'
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
            className='w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500'
          />
        </div>

        <div className='mb-4'>
          <label className='block text-sm font-medium mb-1'>Description *</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
            rows={4}
            className='w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500'
          />
        </div>

        <div className='grid grid-cols-2 gap-4 mb-4'>
          <div>
            <label className='block text-sm font-medium mb-1'>Category *</label>
            <input
              type='text'
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              required
              className='w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500'
            />
          </div>
          <div>
            <label className='block text-sm font-medium mb-1'>Project Date *</label>
            <input
              type='date'
              value={form.projectDate}
              onChange={(e) => setForm({ ...form, projectDate: e.target.value })}
              required
              className='w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500'
            />
          </div>
        </div>

        <div className='mb-4'>
          <label className='block text-sm font-medium mb-1'>Image URL *</label>
          <input
            type='url'
            value={form.image}
            onChange={(e) => setForm({ ...form, image: e.target.value })}
            required
            className='w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500'
            placeholder='https://example.com/image.jpg'
          />
        </div>

        <div className='mb-6 flex items-center gap-2'>
          <input
            type='checkbox'
            id='active'
            checked={form.active}
            onChange={(e) => setForm({ ...form, active: e.target.checked })}
            className='w-4 h-4'
          />
          <label htmlFor='active' className='text-sm'>Active</label>
        </div>

        <div className='flex gap-3'>
          <button
            type='submit'
            disabled={loading}
            className='bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50'
          >
            {loading ? 'Creating...' : 'Create Project'}
          </button>
          <Link
            href='/admin/portfolio'
            className='px-6 py-2 rounded border border-gray-300 hover:bg-gray-50'
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
