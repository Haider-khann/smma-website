'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ProposalActions({ proposalId }: { proposalId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState('');
  const [showNote, setShowNote] = useState(false);
  const [note, setNote] = useState('');

  async function sendAction(action: 'ACCEPT' | 'REJECT' | 'REQUEST_CHANGES') {
    setLoading(action);
    const res = await fetch(`/api/client/proposals/${proposalId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, note: note || undefined }),
    });
    if (res.ok) {
      router.refresh();
    } else {
      alert('Failed. Please try again.');
    }
    setLoading('');
  }

  return (
    <div className='pt-4 border-t border-gray-100'>
      {!showNote ? (
        <div className='flex gap-2 flex-wrap'>
          <button
            onClick={() => sendAction('ACCEPT')}
            disabled={!!loading}
            className='bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 text-sm'
          >
            {loading === 'ACCEPT' ? 'Accepting...' : 'Accept Proposal'}
          </button>
          <button
            onClick={() => setShowNote(true)}
            className='bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 text-sm'
          >
            Request Changes
          </button>
          <button
            onClick={() => sendAction('REJECT')}
            disabled={!!loading}
            className='bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50 text-sm'
          >
            {loading === 'REJECT' ? 'Rejecting...' : 'Reject'}
          </button>
        </div>
      ) : (
        <div>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder='Describe the changes you want...'
            className='w-full border border-gray-300 rounded px-3 py-2 mb-3 text-sm'
          />
          <div className='flex gap-2'>
            <button
              onClick={() => sendAction('REQUEST_CHANGES')}
              disabled={!!loading}
              className='bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 text-sm disabled:opacity-50'
            >
              {loading === 'REQUEST_CHANGES' ? 'Sending...' : 'Send Feedback'}
            </button>
            <button
              onClick={() => {
                setShowNote(false);
                setNote('');
              }}
              className='border border-gray-300 px-4 py-2 rounded hover:bg-gray-50 text-sm'
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
