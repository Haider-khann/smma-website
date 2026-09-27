'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

export default function EditServicePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
    category: '',
    image: '',
    active: true,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/services/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.service) {
          const s = data.service;
          setForm({
            name: s.name,
            description: s.description,
            price: String(s.price),
            duration: String(s.duration),
            category: s.category || '',
            image: s.image || '',
            active: s.active,
          });
        }
        setLoading(false);
      });
  }, [id]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);

    const res = await fetch(`/api/admin/services/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        price: parseFloat(form.price),
        duration: parseInt(form.duration),
        image: form.image || null,
        category: form.category || null,
      }),
    });

    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setError(data.error || 'Something went wrong');
      return;
    }

    router.push('/admin/services');
    router.refresh();
  }

  async function onDelete() {
    if (!confirm('Are you sure you want to delete this service?')) return;

    const res = await fetch(`/api/admin/services/${id}`, { method: 'DELETE' });
    if (res.ok) {
      router.push('/admin/services');
      router.refresh();
    }
  }

  if (loading) {
    return <div className='p-8 text-gray-500'>Loading...</div>;
  }

  return (
    <div>
      <div className='mb-6'>
        <Link href='/admin/services' className='text-blue-600 hover:underline text-sm'>
          ← Back to Services
        </Link>
        <h1 className='text-3xl font-bold mt-2'>Edit Service</h1>
      </div>

      <form onSubmit={onSubmit} className='bg-white p-6 rounded-lg shadow-sm border border-gray-100 max-w-2xl'>
        {error && (
          <div className='bg-red-100 text-red-700 p-3 rounded mb-4 text-sm'>{error}</div>
        )}

        <div className='mb-4'>
          <label className='block text-sm font-medium mb-1'>Service Name *</label>
          <input
            type='text'
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
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
            <label className='block text-sm font-medium mb-1'>Price (USD) *</label>
            <input
              type='number'
              step='0.01'
              min='0'
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              required
              className='w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500'
            />
          </div>
          <div>
            <label className='block text-sm font-medium mb-1'>Duration (days) *</label>
            <input
              type='number'
              min='1'
              value={form.duration}
              onChange={(e) => setForm({ ...form, duration: e.target.value })}
              required
              className='w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500'
            />
          </div>
        </div>

        <div className='mb-4'>
          <label className='block text-sm font-medium mb-1'>Category</label>
          <input
            type='text'
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className='w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500'
          />
        </div>

        <div className='mb-4'>
          <label className='block text-sm font-medium mb-1'>Image URL</label>
          <input
            type='text'
            value={form.image}
            onChange={(e) => setForm({ ...form, image: e.target.value })}
            className='w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500'
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

        <div className='flex gap-3 justify-between'>
          <div className='flex gap-3'>
            <button
              type='submit'
              disabled={saving}
              className='bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50'
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <Link
              href='/admin/services'
              className='px-6 py-2 rounded border border-gray-300 hover:bg-gray-50'
            >
              Cancel
            </Link>
          </div>
          <button
            type='button'
            onClick={onDelete}
            className='bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700'
          >
            Delete
          </button>
        </div>
      </form>
    </div>
  );
}
