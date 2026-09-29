'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CampaignActions({
  campaignId,
  currentStatus,
}: {
  campaignId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState('');
  const [message, setMessage] = useState('');

  async function handleArchive() {
    if (!confirm('Archive this campaign? It will be hidden from active views but can be restored later.')) return;
    setLoading('archive');
    setMessage('');

    const res = await fetch('/api/staff/campaigns/' + campaignId + '/archive', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'ARCHIVE' }),
    });

    setLoading('');
    if (res.ok) {
      setMessage('Campaign archived successfully');
      router.refresh();
    } else {
      setMessage('Failed to archive');
    }
  }

  async function handleRestore() {
    setLoading('restore');
    setMessage('');

    const res = await fetch('/api/staff/campaigns/' + campaignId + '/archive', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'RESTORE' }),
    });

    setLoading('');
    if (res.ok) {
      setMessage('Campaign restored');
      router.refresh();
    } else {
      setMessage('Failed to restore');
    }
  }

  function handleExport() {
    window.location.href = '/api/staff/campaigns/' + campaignId + '/export';
  }

  const isArchived = currentStatus === 'ARCHIVED';

  return (
    <div className='bg-white rounded-xl border border-slate-200 p-5'>
      <div className='flex items-center justify-between mb-3'>
        <h3 className='font-semibold text-slate-900 text-sm'>Campaign Actions</h3>
        {message && (
          <span className={message.includes('success') || message.includes('restored') ? 'text-xs text-emerald-600' : 'text-xs text-red-600'}>
            {message}
          </span>
        )}
      </div>

      <div className='flex flex-wrap gap-2'>
        <button
          onClick={handleExport}
          className='inline-flex items-center gap-2 text-sm px-3 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors'
        >
          <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
            <path d='M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3' strokeLinecap='round' strokeLinejoin='round' />
          </svg>
          Export CSV
        </button>

        {!isArchived ? (
          <button
            onClick={handleArchive}
            disabled={loading === 'archive'}
            className='inline-flex items-center gap-2 text-sm px-3 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700 disabled:opacity-50 transition-colors'
          >
            <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
              <path d='M21 8v13H3V8M1 3h22v5H1zM10 12h4' strokeLinecap='round' strokeLinejoin='round' />
            </svg>
            {loading === 'archive' ? 'Archiving...' : 'Archive'}
          </button>
        ) : (
          <button
            onClick={handleRestore}
            disabled={loading === 'restore'}
            className='inline-flex items-center gap-2 text-sm px-3 py-2 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 disabled:opacity-50 transition-colors'
          >
            <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
              <path d='M3 12a9 9 0 019-9 9.75 9.75 0 016.74 2.74L21 8M21 3v5h-5M21 12a9 9 0 01-9 9 9.75 9.75 0 01-6.74-2.74L3 16M8 16H3v5' strokeLinecap='round' strokeLinejoin='round' />
            </svg>
            {loading === 'restore' ? 'Restoring...' : 'Restore'}
          </button>
        )}
      </div>

      <p className='text-xs text-slate-500 mt-3'>
        Export campaign data as CSV. Archive to hide from active views.
      </p>
    </div>
  );
}