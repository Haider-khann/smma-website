'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewTicketPage() {
  const router = useRouter();
  const [form, setForm] = useState({ subject: '', body: '', priority: 'NORMAL', category: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await fetch('/api/support', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) { setError(data.error || 'Something went wrong'); return; }
    router.push('/dashboard/support/' + data.ticket.id);
  }

  return (
    <div className='p-6 md:p-8 max-w-2xl mx-auto'>
      <div className='mb-8'>
        <Link href='/dashboard/support' className='text-indigo-600 hover:text-indigo-700 text-sm font-medium'>← Back to support</Link>
        <h1 className='text-2xl md:text-3xl font-bold text-slate-900 tracking-tight mt-4'>New support ticket</h1>
        <p className='text-slate-500 mt-1 text-sm'>Describe your issue and we will get back to you.</p>
      </div>

      <form onSubmit={onSubmit} className='bg-white p-6 rounded-2xl border border-slate-200 shadow-sm'>
        {error && <div className='bg-red-50 border border-red-200 text-red-800 px-4 py-2.5 rounded-lg mb-4 text-sm'>{error}</div>}

        <div className='mb-5'>
          <label className='block text-sm font-medium text-slate-700 mb-1.5'>Subject</label>
          <input type='text' value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required minLength={3} maxLength={200} placeholder='Brief summary of your issue' className='w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500' />
        </div>

        <div className='grid grid-cols-2 gap-4 mb-5'>
          <div>
            <label className='block text-sm font-medium text-slate-700 mb-1.5'>Priority</label>
            <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className='w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'>
              <option value='LOW'>Low</option>
              <option value='NORMAL'>Normal</option>
              <option value='HIGH'>High</option>
              <option value='URGENT'>Urgent</option>
            </select>
          </div>
          <div>
            <label className='block text-sm font-medium text-slate-700 mb-1.5'>Category (optional)</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className='w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'>
              <option value=''>Select category</option>
              <option value='Billing'>Billing</option>
              <option value='Technical'>Technical</option>
              <option value='Content'>Content</option>
              <option value='Project'>Project</option>
              <option value='Other'>Other</option>
            </select>
          </div>
        </div>

        <div className='mb-6'>
          <label className='block text-sm font-medium text-slate-700 mb-1.5'>Description</label>
          <textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} required minLength={10} rows={6} placeholder='Describe your issue in detail...' className='w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500' />
        </div>

        <div className='flex gap-3'>
          <button type='submit' disabled={loading} className='bg-slate-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 disabled:opacity-50 transition-colors btn-3d'>
            {loading ? 'Submitting...' : 'Submit ticket'}
          </button>
          <Link href='/dashboard/support' className='px-5 py-2.5 rounded-lg text-sm font-medium border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors'>Cancel</Link>
        </div>
      </form>
    </div>
  );
}