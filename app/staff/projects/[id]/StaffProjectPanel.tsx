'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function StaffProjectPanel({
  projectId,
  initialProgress,
  initialStage,
  initialStatus,
  initialObjectives,
}: {
  projectId: string;
  initialProgress: number;
  initialStage: string;
  initialStatus: string;
  initialObjectives: string;
}) {
  const router = useRouter();
  const [progress, setProgress] = useState(initialProgress);
  const [stage, setStage] = useState(initialStage);
  const [status, setStatus] = useState(initialStatus);
  const [objectives, setObjectives] = useState(initialObjectives);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  async function save() {
    setSaving(true);
    setMessage('');
    const res = await fetch('/api/staff/projects/' + projectId, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ progress, currentStage: stage, status, objectives }),
    });
    setSaving(false);
    if (res.ok) {
      setMessage('Saved successfully');
      router.refresh();
    } else {
      setMessage('Failed to save');
    }
  }

  return (
    <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-100'>
      <h2 className='text-lg font-semibold mb-4'>Update Progress</h2>
      {message && (
        <div className={message.includes('success') ? 'bg-green-100 text-green-700 p-3 rounded mb-4 text-sm' : 'bg-red-100 text-red-700 p-3 rounded mb-4 text-sm'}>
          {message}
        </div>
      )}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
        <div>
          <label className='block text-sm font-medium mb-1'>Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className='w-full border border-gray-300 rounded px-3 py-2'>
            <option value='PENDING'>PENDING</option>
            <option value='ACTIVE'>ACTIVE</option>
            <option value='PAUSED'>PAUSED</option>
            <option value='COMPLETED'>COMPLETED</option>
          </select>
        </div>
        <div>
          <label className='block text-sm font-medium mb-1'>Current Stage</label>
          <input type='text' value={stage} onChange={(e) => setStage(e.target.value)} className='w-full border border-gray-300 rounded px-3 py-2' />
        </div>
        <div className='md:col-span-2'>
          <label className='block text-sm font-medium mb-1'>Progress ({progress}%)</label>
          <input type='range' min='0' max='100' value={progress} onChange={(e) => setProgress(parseInt(e.target.value))} className='w-full' />
        </div>
        <div className='md:col-span-2'>
          <label className='block text-sm font-medium mb-1'>Project Objectives</label>
          <textarea value={objectives} onChange={(e) => setObjectives(e.target.value)} rows={4} placeholder='e.g. Achieve 10K followers, 5% engagement rate, 20 posts/month...' className='w-full border border-gray-300 rounded px-3 py-2' />
        </div>
      </div>
      <button onClick={save} disabled={saving} className='bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50'>
        {saving ? 'Saving...' : 'Save Progress'}
      </button>
    </div>
  );
}