'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ReviewForm() {
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    const res = await fetch('/api/client/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating, comment }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || 'Something went wrong');
      return;
    }

    setSuccess(true);
    setComment('');
    setRating(5);
    router.refresh();
  }

  return (
    <form onSubmit={submit} className='bg-white p-6 rounded-lg shadow-sm border border-gray-100'>
      <h2 className='text-lg font-semibold mb-4'>Submit a Review</h2>
      {error && <div className='bg-red-100 text-red-700 p-3 rounded mb-3 text-sm'>{error}</div>}
      {success && <div className='bg-green-100 text-green-700 p-3 rounded mb-3 text-sm'>Review submitted! Pending admin approval.</div>}

      <div className='mb-4'>
        <label className='block text-sm font-medium mb-2'>Rating</label>
        <div className='flex gap-1'>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type='button'
              onClick={() => setRating(n)}
              className={(n <= rating ? 'text-yellow-500' : 'text-gray-300') + ' text-3xl transition-colors'}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <div className='mb-4'>
        <label className='block text-sm font-medium mb-1'>Your Review</label>
        <textarea value={comment} onChange={(e) => setComment(e.target.value)} required rows={4} placeholder='Tell us about your experience...' className='w-full border border-gray-300 rounded px-3 py-2' />
      </div>

      <button type='submit' disabled={loading} className='bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50'>
        {loading ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
}