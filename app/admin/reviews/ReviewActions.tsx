'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Review = {
  id: string;
  rating: number;
  comment: string;
  approved: boolean;
  createdAt: string;
  client: { id: string; name: string | null; email: string };
};

export default function ReviewActions({ reviews }: { reviews: Review[] }) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState('');

  async function sendAction(id: string, action: 'APPROVE' | 'REJECT') {
    setLoadingId(id);
    const res = await fetch('/api/admin/reviews/' + id, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });
    setLoadingId('');
    if (res.ok) {
      router.refresh();
    } else {
      alert('Failed');
    }
  }

  async function deleteReview(id: string) {
    if (!confirm('Delete this review permanently?')) return;
    const res = await fetch('/api/admin/reviews/' + id, { method: 'DELETE' });
    if (res.ok) router.refresh();
  }

  if (reviews.length === 0) {
    return (
      <div className='bg-white p-12 rounded-lg shadow-sm border border-gray-100 text-center text-gray-500'>
        No reviews yet.
      </div>
    );
  }

  return (
    <div className='space-y-3'>
      {reviews.map((r) => (
        <div key={r.id} className='bg-white p-5 rounded-lg shadow-sm border border-gray-100'>
          <div className='flex justify-between items-start mb-2'>
            <div>
              <div className='flex items-center gap-2 mb-1'>
                <span className='text-yellow-500 text-lg'>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                <span className='text-xs text-gray-500'>{r.rating}/5</span>
                <span className={(r.approved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700') + ' px-2 py-0.5 rounded text-xs font-medium'}>
                  {r.approved ? 'Approved' : 'Pending'}
                </span>
              </div>
              <p className='text-xs text-gray-500'>By {r.client.name} ({r.client.email}) on {new Date(r.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          <p className='text-gray-700 mt-2 mb-4'>{r.comment}</p>
          <div className='flex gap-2 pt-3 border-t border-gray-100 flex-wrap'>
            {!r.approved ? (
              <button
                onClick={() => sendAction(r.id, 'APPROVE')}
                disabled={loadingId === r.id}
                className='bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 text-sm'
              >
                {loadingId === r.id ? 'Processing...' : 'Approve'}
              </button>
            ) : (
              <button
                onClick={() => sendAction(r.id, 'REJECT')}
                disabled={loadingId === r.id}
                className='bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 disabled:opacity-50 text-sm'
              >
                {loadingId === r.id ? 'Processing...' : 'Unapprove'}
              </button>
            )}
            <button onClick={() => deleteReview(r.id)} className='text-red-600 hover:underline text-sm px-4 py-2'>Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
}