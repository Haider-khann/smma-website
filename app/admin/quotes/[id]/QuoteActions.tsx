'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function QuoteActions({ quoteId }: { quoteId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState('');

  async function sendAction(action: 'APPROVE' | 'REJECT') {
    setLoading(action);
    const res = await fetch('/api/admin/quotes/' + quoteId, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });
    if (res.ok) {
      router.refresh();
    } else {
      alert('Failed. Please try again.');
    }
    setLoading('');
  }

  return (
    <div className='bg-blue-50 border border-blue-200 p-4 rounded-lg'>
      <p className='text-sm text-blue-800 mb-3'>This request is pending. Approve to start working on a proposal.</p>
      <div className='flex gap-3'>
        <button
          onClick={() => sendAction('APPROVE')}
          disabled={!!loading}
          className='bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50'
        >
          {loading === 'APPROVE' ? 'Approving...' : 'Approve Request'}
        </button>
        <button
          onClick={() => sendAction('REJECT')}
          disabled={!!loading}
          className='bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50'
        >
          {loading === 'REJECT' ? 'Rejecting...' : 'Reject Request'}
        </button>
      </div>
    </div>
  );
}