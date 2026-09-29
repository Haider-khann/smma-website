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

export default function ContentManager({
  campaignId,
  projectId,
  contents,
}: {
  campaignId: string;
  projectId: string;
  contents: Content[];
}) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '',
    caption: '',
    hashtags: '',
    platform: '',
    mediaUrl: '',
    scheduledAt: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function reset() {
    setForm({ title: '', caption: '', hashtags: '', platform: '', mediaUrl: '', scheduledAt: '' });
    setEditingId(null);
    setShowForm(false);
    setError('');
  }

  function startEdit(c: Content) {
    setForm({
      title: c.title || '',
      caption: c.caption || '',
      hashtags: c.hashtags || '',
      platform: c.platform || '',
      mediaUrl: c.mediaUrl || '',
      scheduledAt: c.scheduledAt ? new Date(c.scheduledAt).toISOString().slice(0, 16) : '',
    });
    setEditingId(c.id);
    setShowForm(true);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);

    const url = editingId ? '/api/staff/content/' + editingId : '/api/staff/content';
    const method = editingId ? 'PATCH' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId,
        campaignId,
        title: form.title || null,
        caption: form.caption || null,
        hashtags: form.hashtags || null,
        platform: form.platform || null,
        mediaUrl: form.mediaUrl || null,
        scheduledAt: form.scheduledAt || null,
      }),
    });

    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error || 'Failed');
      return;
    }
    reset();
    router.refresh();
  }

  async function submitForApproval(contentId: string) {
    await fetch('/api/staff/content/' + contentId, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'CLIENT_REVIEW' }),
    });
    router.refresh();
  }

  async function duplicateContent(contentId: string) {
    const res = await fetch('/api/staff/content/' + contentId + '/duplicate', { method: 'POST' });
    if (res.ok) router.refresh();
  }

  async function deleteContent(contentId: string) {
    if (!confirm('Delete this content?')) return;
    const res = await fetch('/api/staff/content/' + contentId, { method: 'DELETE' });
    if (res.ok) router.refresh();
  }

  return (
    <div>
      <div className='flex justify-between items-center mb-4'>
        <h2 className='text-xl font-bold'>Content ({contents.length})</h2>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm'>
            + Add Content
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={submit} className='bg-white p-5 rounded-lg shadow-sm border border-gray-100 mb-4'>
          {error && <div className='bg-red-100 text-red-700 p-3 rounded mb-3 text-sm'>{error}</div>}
          <div className='mb-3'>
            <label className='block text-sm font-medium mb-1'>Title</label>
            <input type='text' value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder='e.g. Product launch post' className='w-full border border-gray-300 rounded px-3 py-2' />
          </div>
          <div className='mb-3'>
            <label className='block text-sm font-medium mb-1'>Caption</label>
            <textarea value={form.caption} onChange={(e) => setForm({ ...form, caption: e.target.value })} rows={4} placeholder='Write your post caption...' className='w-full border border-gray-300 rounded px-3 py-2' />
          </div>
          <div className='mb-3'>
            <label className='block text-sm font-medium mb-1'>Hashtags</label>
            <input type='text' value={form.hashtags} onChange={(e) => setForm({ ...form, hashtags: e.target.value })} placeholder='#fashion #style #karachi' className='w-full border border-gray-300 rounded px-3 py-2' />
          </div>
          <div className='grid grid-cols-2 gap-3 mb-3'>
            <div>
              <label className='block text-sm font-medium mb-1'>Platform</label>
              <select value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })} className='w-full border border-gray-300 rounded px-3 py-2'>
                <option value=''>Select...</option>
                <option value='Facebook'>Facebook</option>
                <option value='Instagram'>Instagram</option>
                <option value='TikTok'>TikTok</option>
                <option value='LinkedIn'>LinkedIn</option>
              </select>
            </div>
            <div>
              <label className='block text-sm font-medium mb-1'>Scheduled At</label>
              <input type='datetime-local' value={form.scheduledAt} onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })} className='w-full border border-gray-300 rounded px-3 py-2' />
            </div>
          </div>
          <div className='mb-3'>
            <label className='block text-sm font-medium mb-1'>Media URL (image/video)</label>
            <input type='url' value={form.mediaUrl} onChange={(e) => setForm({ ...form, mediaUrl: e.target.value })} placeholder='https://example.com/image.jpg' className='w-full border border-gray-300 rounded px-3 py-2' />
          </div>
          <div className='flex gap-2'>
            <button type='submit' disabled={saving} className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 text-sm'>
              {saving ? 'Saving...' : editingId ? 'Update Content' : 'Create Content'}
            </button>
            <button type='button' onClick={reset} className='border border-gray-300 px-4 py-2 rounded hover:bg-gray-50 text-sm'>Cancel</button>
          </div>
        </form>
      )}

      {contents.length === 0 ? (
        <div className='bg-white p-8 rounded-lg shadow-sm border border-gray-100 text-center text-gray-500'>
          No content yet. Click Add Content to create your first post.
        </div>
      ) : (
        <div className='space-y-3'>
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
                <img src={c.mediaUrl} alt={c.title || 'Content'} className='w-full max-w-md h-40 object-cover rounded mb-3' />
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
                  <p className='text-xs text-orange-700 font-medium uppercase mb-1'>Client Feedback</p>
                  <p className='text-sm text-orange-900'>{c.feedback}</p>
                </div>
              )}
              <div className='flex gap-2 flex-wrap'>
                {c.status === 'DRAFT' && (
                  <button onClick={() => submitForApproval(c.id)} className='text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded hover:bg-purple-200'>Submit for Client Review</button>
                )}
                {c.status === 'REVISION_REQUESTED' && (
                  <button onClick={() => submitForApproval(c.id)} className='text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded hover:bg-purple-200'>Resubmit for Review</button>
                )}
                <button onClick={() => startEdit(c)} className='text-xs text-blue-600 hover:underline'>Edit</button>
                <button onClick={() => duplicateContent(c.id)} className='text-xs text-slate-600 hover:underline'>Duplicate</button>
                <button onClick={() => deleteContent(c.id)} className='text-xs text-red-600 hover:underline'>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}