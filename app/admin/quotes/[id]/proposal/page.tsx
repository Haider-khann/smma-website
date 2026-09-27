'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

export default function CreateProposalPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [form, setForm] = useState({ price: '', duration: '', description: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await fetch('/api/admin/proposals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        quoteRequestId: id,
        price: parseFloat(form.price),
        duration: parseInt(form.duration),
        description: form.description,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || 'Something went wrong');
      return;
    }

    router.push('/admin/quotes/' + id);
    router.refresh();
  }

  return (
    <div>
      <div className='mb-6'>
        <Link href={'/admin/quotes/' + id} className='text-blue-600 hover:underline text-sm'>Back to Request</Link>
        <h1 className='text-3xl font-bold mt-2'>Create Proposal</h1>
        <p className='text-gray-600 mt-1'>Send a detailed proposal to the client.</p>
      </div>

      <form onSubmit={onSubmit} className='bg-white p-6 rounded-lg shadow-sm border border-gray-100 max-w-2xl'>
        {error && <div className='bg-red-100 text-red-700 p-3 rounded mb-4 text-sm'>{error}</div>}

        <div className='grid grid-cols-2 gap-4 mb-4'>
          <div>
            <label className='block text-sm font-medium mb-1'>Price (USD) *</label>
            <input type='number' step='0.01' min='0' value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required className='w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500' placeholder='1000' />
          </div>
          <div>
            <label className='block text-sm font-medium mb-1'>Duration (days) *</label>
            <input type='number' min='1' value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} required className='w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500' placeholder='30' />
          </div>
        </div>

        <div className='mb-6'>
          <label className='block text-sm font-medium mb-1'>Proposal Description *</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required rows={8} className='w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500' placeholder='Describe what is included, timeline, deliverables, terms...' />
        </div>

        <div className='flex gap-3'>
          <button type='submit' disabled={loading} className='bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50'>
            {loading ? 'Sending...' : 'Send Proposal'}
          </button>
          <Link href={'/admin/quotes/' + id} className='px-6 py-2 rounded border border-gray-300 hover:bg-gray-50'>Cancel</Link>
        </div>
      </form>
    </div>
  );
}