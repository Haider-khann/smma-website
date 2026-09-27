'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

export default function EditFAQPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const [form, setForm] = useState({ question: '', answer: '', order: '0' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/faq/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.faq) {
          setForm({
            question: data.faq.question,
            answer: data.faq.answer,
            order: String(data.faq.order),
          });
        }
        setLoading(false);
      });
  }, [id]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);

    const res = await fetch(`/api/admin/faq/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, order: parseInt(form.order) }),
    });

    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setError(data.error || 'Something went wrong');
      return;
    }

    router.push('/admin/faq');
    router.refresh();
  }

  async function onDelete() {
    if (!confirm('Delete this FAQ?')) return;
    const res = await fetch(`/api/admin/faq/${id}`, { method: 'DELETE' });
    if (res.ok) {
      router.push('/admin/faq');
      router.refresh();
    }
  }

  if (loading) return <div className='p-8 text-gray-500'>Loading...</div>;

  return (
    <div>
      <div className='mb-6'>
        <Link href='/admin/faq' className='text-blue-600 hover:underline text-sm'>
          Back to FAQ
        </Link>
        <h1 className='text-3xl font-bold mt-2'>Edit FAQ</h1>
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
              href='/admin/faq'
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
