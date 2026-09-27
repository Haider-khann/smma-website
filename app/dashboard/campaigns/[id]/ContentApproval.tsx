'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Content = {
  id: string;
  title: string | null;
  caption: string | null;
  hashtags: string | null;
  platform: string | null;
  mediaUrl: string | null;
  scheduledAt: string | null;
  status: string;
  feedback: string | null;
};

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  INTERNAL_REVIEW: 'bg-yellow-100 text-yellow-700',
  CLIENT_REVIEW: 'bg-purple-100 text-purple-700',
  APPROVED: 'bg-green-100 text-green-700',
  REVISION_REQUESTED: 'bg-orange-100 text-orange-700',
};

export default function ContentApproval({ contents }: { contents: Content[] }) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState('');
  const [feedbackId, setFeedbackId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');

  async function sendAction(contentId: string, action: 'APPROVE' | 'REQUEST_CHANGES', note?: string) {
    setLoadingId(contentId);
    const res = await fetch('/api/client/content/' + contentId, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, feedback: note || undefined }),
    });
    setLoadingId('');
    if (res.ok) {
      setFeedbackId(null);
      setFeedback('');
      router.refresh();
    } else {
      alert('Failed. Please try again.');
    }
  }

  const awaiting = contents.filter((c) => c.status === 'CLIENT_REVIEW').length;

  return (
    <div>
      <div className='flex justify-between items-center mb-4'>
        <h2 className='text-xl font-bold'>Content ({contents.length})</h2>
        {awaiting > 0 && (
          <span className='text-sm bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-medium'>
            {awaiting} awaiting your approval
          </span>
        )}
      </div>

      {contents.length === 0 ? (
        <div className='bg-white p-8 rounded-lg shadow-sm border border-gray-100 text-center text-gray-500'>
          No content in this campaign yet.
        </div>
      ) : (
        <div className='space-y-4'>
          {contents.map((c) => (
            <div key={c.id} className='bg-white p-5 rounded-lg shadow-sm border border-gray-100'>
              <div className='flex justify-between items-start mb-3'>
                <div className='flex-1'>
                  <div className='flex items-center gap-2 mb-2'>
                    <h3 className='font-semibold'>{c.title || 'Untitled'}</h3>
                    <span className={(statusColors[c.status] || 'bg-gray-100 text-gray-600') + ' px-2 py-0.5 rounded text-xs font-medium'}>
                      {c.status.replace('_', ' ')}
                    </span>
                  </div>
                  {c.platform && <p className='text-xs text-gray-500'>Platform: {c.platform}</p>}
                  {c.scheduledAt && <p className='text-xs text-gray-500'>Scheduled: {new Date(c.scheduledAt).toLocaleString()}</p>}
                </div>
              </div>

              {c.mediaUrl && (
                <img src={c.mediaUrl} alt={c.title || 'Content'} className='w-full max-w-md h-48 object-cover rounded mb-3' />
              )}

              {c.caption && (
                <div className='bg-gray-50 p-3 rounded mb-3'>
                  <p className='text-xs text-gray-500 uppercase mb-1'>Caption</p>
                  <p className='text-sm whitespace-pre-wrap'>{c.caption}</p>
                </div>
              )}

              {c.hashtags && (
                <p className='text-sm text-blue-600 mb-3'>{c.hashtags}</p>
              )}

              {c.feedback && (
                <div className='bg-orange-50 border border-orange-200 p-3 rounded mb-3'>
                  <p className='text-xs text-orange-700 font-medium uppercase mb-1'>Your Feedback</p>
                  <p className='text-sm text-orange-900'>{c.feedback}</p>
                </div>
              )}

              {c.status === 'CLIENT_REVIEW' && (
                <div className='pt-3 border-t border-gray-100'>
                  {feedbackId !== c.id ? (
                    <div className='flex gap-2 flex-wrap'>
                      <button
                        onClick={() => sendAction(c.id, 'APPROVE')}
                        disabled={!!loadingId}
                        className='bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 text-sm'
                      >
                        {loadingId === c.id ? 'Processing...' : 'Approve'}
                      </button>
                      <button
                        onClick={() => { setFeedbackId(c.id); setFeedback(''); }}
                        className='bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 text-sm'
                      >
                        Request Changes
                      </button>
                    </div>
                  ) : (
                    <div>
                      <textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        rows={3}
                        placeholder='What changes do you want?'
                        className='w-full border border-gray-300 rounded px-3 py-2 mb-3 text-sm'
                      />
                      <div className='flex gap-2'>
                        <button
                          onClick={() => sendAction(c.id, 'REQUEST_CHANGES', feedback)}
                          disabled={!!loadingId || !feedback.trim()}
                          className='bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 disabled:opacity-50 text-sm'
                        >
                          {loadingId === c.id ? 'Sending...' : 'Send Feedback'}
                        </button>
                        <button
                          onClick={() => { setFeedbackId(null); setFeedback(''); }}
                          className='border border-gray-300 px-4 py-2 rounded hover:bg-gray-50 text-sm'
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}