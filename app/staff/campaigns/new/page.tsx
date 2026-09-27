'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Project = { id: string; title: string };

export default function NewCampaignPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [form, setForm] = useState({
    projectId: '',
    name: '',
    objective: '',
    platform: '',
    targetAudience: '',
    budget: '',
    startDate: '',
    endDate: '',
    status: 'DRAFT',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/staff/projects').then((r) => r.json()).then((d) => {
      setProjects(d.projects || []);
      if (d.projects && d.projects.length > 0) {
        setForm((prev) => ({ ...prev, projectId: d.projects[0].id }));
      }
    }).catch(() => {});
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await fetch('/api/staff/campaigns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId: form.projectId,
        name: form.name,
        objective: form.objective || undefined,
        platform: form.platform || undefined,
        targetAudience: form.targetAudience || undefined,
        budget: form.budget ? parseFloat(form.budget) : undefined,
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
        status: form.status,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || 'Something went wrong');
      return;
    }
    router.push('/staff/campaigns');
    router.refresh();
  }

  return (
    <div>
      <div className='mb-6'>
        <Link href='/staff/campaigns' className='text-blue-600 hover:underline text-sm'>Back to Campaigns</Link>
        <h1 className='text-3xl font-bold mt-2'>Create Campaign</h1>
      </div>

      <form onSubmit={onSubmit} className='bg-white p-6 rounded-lg shadow-sm border border-gray-100 max-w-2xl'>
        {error && <div className='bg-red-100 text-red-700 p-3 rounded mb-4 text-sm'>{error}</div>}

        <div className='mb-4'>
          <label className='block text-sm font-medium mb-1'>Project *</label>
          <select value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })} required className='w-full border border-gray-300 rounded px-3 py-2'>
            <option value=''>Select a project...</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
        </div>

        <div className='mb-4'>
          <label className='block text-sm font-medium mb-1'>Campaign Name *</label>
          <input type='text' value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder='e.g. October Instagram Push' className='w-full border border-gray-300 rounded px-3 py-2' />
        </div>

        <div className='mb-4'>
          <label className='block text-sm font-medium mb-1'>Objective</label>
          <textarea value={form.objective} onChange={(e) => setForm({ ...form, objective: e.target.value })} rows={3} placeholder='e.g. Increase brand awareness and engagement' className='w-full border border-gray-300 rounded px-3 py-2' />
        </div>

        <div className='grid grid-cols-2 gap-4 mb-4'>
          <div>
            <label className='block text-sm font-medium mb-1'>Platform</label>
            <select value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })} className='w-full border border-gray-300 rounded px-3 py-2'>
              <option value=''>Select...</option>
              <option value='Facebook'>Facebook</option>
              <option value='Instagram'>Instagram</option>
              <option value='TikTok'>TikTok</option>
              <option value='LinkedIn'>LinkedIn</option>
              <option value='YouTube'>YouTube</option>
            </select>
          </div>
          <div>
            <label className='block text-sm font-medium mb-1'>Budget (USD)</label>
            <input type='number' step='0.01' min='0' value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} className='w-full border border-gray-300 rounded px-3 py-2' />
          </div>
        </div>

        <div className='mb-4'>
          <label className='block text-sm font-medium mb-1'>Target Audience</label>
          <input type='text' value={form.targetAudience} onChange={(e) => setForm({ ...form, targetAudience: e.target.value })} placeholder='e.g. Women 18-35 in Karachi' className='w-full border border-gray-300 rounded px-3 py-2' />
        </div>

        <div className='grid grid-cols-2 gap-4 mb-4'>
          <div>
            <label className='block text-sm font-medium mb-1'>Start Date</label>
            <input type='date' value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className='w-full border border-gray-300 rounded px-3 py-2' />
          </div>
          <div>
            <label className='block text-sm font-medium mb-1'>End Date</label>
            <input type='date' value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className='w-full border border-gray-300 rounded px-3 py-2' />
          </div>
        </div>

        <div className='mb-6'>
          <label className='block text-sm font-medium mb-1'>Status</label>
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className='w-full border border-gray-300 rounded px-3 py-2'>
            <option value='DRAFT'>DRAFT</option>
            <option value='ACTIVE'>ACTIVE</option>
            <option value='PAUSED'>PAUSED</option>
            <option value='COMPLETED'>COMPLETED</option>
          </select>
        </div>

        <div className='flex gap-3'>
          <button type='submit' disabled={loading} className='bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50'>
            {loading ? 'Creating...' : 'Create Campaign'}
          </button>
          <Link href='/staff/campaigns' className='px-6 py-2 rounded border border-gray-300 hover:bg-gray-50'>Cancel</Link>
        </div>
      </form>
    </div>
  );
}