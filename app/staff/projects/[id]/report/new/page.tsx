'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

export default function NewReportPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const now = new Date();
  const defaultMonth = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');

  const [form, setForm] = useState({
    month: defaultMonth,
    postCount: '0',
    followerGrowth: '0',
    engagement: '0',
    notes: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await fetch('/api/staff/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId,
        month: form.month,
        postCount: parseInt(form.postCount) || 0,
        followerGrowth: parseInt(form.followerGrowth) || 0,
        engagement: parseInt(form.engagement) || 0,
        notes: form.notes || null,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || 'Something went wrong');
      return;
    }

    router.push('/staff/projects/' + projectId);
    router.refresh();
  }

  return (
    <div>
      <div className='mb-6'>
        <Link href={'/staff/projects/' + projectId} className='text-blue-600 hover:underline text-sm'>Back to Project</Link>
        <h1 className='text-3xl font-bold mt-2'>Create Monthly Report</h1>
      </div>

      <form onSubmit={onSubmit} className='bg-white p-6 rounded-lg shadow-sm border border-gray-100 max-w-2xl'>
        {error && <div className='bg-red-100 text-red-700 p-3 rounded mb-4 text-sm'>{error}</div>}

        <div className='mb-4'>
          <label className='block text-sm font-medium mb-1'>Month *</label>
          <input type='month' value={form.month} onChange={(e) => setForm({ ...form, month: e.target.value })} required className='w-full border border-gray-300 rounded px-3 py-2' />
        </div>

        <div className='grid grid-cols-3 gap-4 mb-4'>
          <div>
            <label className='block text-sm font-medium mb-1'>Posts Published</label>
            <input type='number' min='0' value={form.postCount} onChange={(e) => setForm({ ...form, postCount: e.target.value })} className='w-full border border-gray-300 rounded px-3 py-2' />
          </div>
          <div>
            <label className='block text-sm font-medium mb-1'>Follower Growth</label>
            <input type='number' value={form.followerGrowth} onChange={(e) => setForm({ ...form, followerGrowth: e.target.value })} className='w-full border border-gray-300 rounded px-3 py-2' />
          </div>
          <div>
            <label className='block text-sm font-medium mb-1'>Engagement</label>
            <input type='number' min='0' value={form.engagement} onChange={(e) => setForm({ ...form, engagement: e.target.value })} className='w-full border border-gray-300 rounded px-3 py-2' />
          </div>
        </div>

        <div className='mb-6'>
          <label className='block text-sm font-medium mb-1'>Notes</label>
          <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={5} placeholder='Highlights, learnings, next steps...' className='w-full border border-gray-300 rounded px-3 py-2' />
        </div>

        <div className='flex gap-3'>
          <button type='submit' disabled={loading} className='bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50'>
            {loading ? 'Creating...' : 'Create Report'}
          </button>
          <Link href={'/staff/projects/' + projectId} className='px-6 py-2 rounded border border-gray-300 hover:bg-gray-50'>Cancel</Link>
        </div>
      </form>
    </div>
  );
}