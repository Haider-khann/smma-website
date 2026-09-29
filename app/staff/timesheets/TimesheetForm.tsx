'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Project = { id: string; title: string };

export default function TimesheetForm({ projects }: { projects: Project[] }) {
  const router = useRouter();
  const today = new Date().toISOString().split('T')[0];

  const [form, setForm] = useState({
    projectId: '',
    hours: '1',
    date: today,
    description: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setSaving(true);

    const res = await fetch('/api/staff/timesheets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId: form.projectId || null,
        hours: parseFloat(form.hours),
        date: form.date,
        description: form.description || undefined,
      }),
    });

    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setError(data.error || 'Failed');
      return;
    }

    setSuccess(true);
    setForm({ ...form, hours: '1', description: '' });
    router.refresh();
    setTimeout(() => setSuccess(false), 3000);
  }

  return (
    <form onSubmit={submit} className='bg-white p-6 rounded-2xl border border-slate-200 shadow-sm'>
      <h2 className='font-semibold text-slate-900 mb-4 text-sm uppercase tracking-wider'>Log Hours</h2>
      {error && <div className='bg-red-50 border border-red-200 text-red-800 px-4 py-2.5 rounded-lg mb-4 text-sm'>{error}</div>}
      {success && <div className='bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2.5 rounded-lg mb-4 text-sm'>Entry logged successfully.</div>}

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
        <div>
          <label className='block text-sm font-medium text-slate-700 mb-1.5'>Date</label>
          <input type='date' value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required className='w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500' />
        </div>
        <div>
          <label className='block text-sm font-medium text-slate-700 mb-1.5'>Hours</label>
          <input type='number' step='0.5' min='0.5' max='24' value={form.hours} onChange={(e) => setForm({ ...form, hours: e.target.value })} required className='w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500' />
        </div>
      </div>

      <div className='mb-4'>
        <label className='block text-sm font-medium text-slate-700 mb-1.5'>Project <span className='text-slate-400 font-normal'>(optional)</span></label>
        <select value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })} className='w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'>
          <option value=''>No project</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.title}</option>
          ))}
        </select>
      </div>

      <div className='mb-4'>
        <label className='block text-sm font-medium text-slate-700 mb-1.5'>Description <span className='text-slate-400 font-normal'>(optional)</span></label>
        <input type='text' value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder='e.g. Content creation for October' className='w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500' />
      </div>

      <button type='submit' disabled={saving} className='bg-slate-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 disabled:opacity-50 transition-colors btn-3d'>
        {saving ? 'Logging...' : 'Log Hours'}
      </button>
    </form>
  );
}