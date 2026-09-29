'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Reply = {
  id: string;
  body: string;
  createdAt: string;
  author: { id: string; name: string | null; role: string };
};

export default function TicketChat({
  ticketId,
  initialReplies,
  initialBody,
  status,
  userRole,
  myUserId,
}: {
  ticketId: string;
  initialReplies: Reply[];
  initialBody: string;
  status: string;
  userRole: 'CLIENT' | 'ADMIN';
  myUserId: string;
}) {
  const router = useRouter();
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [escalating, setEscalating] = useState(false);
  const [escalateReason, setEscalateReason] = useState('');

  async function sendReply(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setSending(true);
    setError('');

    const res = await fetch('/api/support/' + ticketId, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'REPLY', body }),
    });

    setSending(false);
    if (res.ok) {
      setBody('');
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || 'Failed');
    }
  }

  async function escalate() {
    setSending(true);
    await fetch('/api/support/' + ticketId, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'ESCALATE', escalateReason }),
    });
    setSending(false);
    setEscalating(false);
    setEscalateReason('');
    router.refresh();
  }

  const canReply = status !== 'CLOSED' && status !== 'RESOLVED';

  return (
    <div>
      <div className='bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-6'>
        <p className='text-xs text-slate-500 mb-2'>Original message</p>
        <p className='text-sm text-slate-800 whitespace-pre-wrap'>{initialBody}</p>
      </div>

      {initialReplies.length > 0 && (
        <div className='space-y-3 mb-6'>
          {initialReplies.map((r) => {
            const isMine = r.author.id === myUserId;
            const isAdmin = r.author.role === 'ADMIN';
            const isEscalation = r.body.startsWith('ESCALATED:');
            return (
              <div key={r.id} className={isMine ? 'flex justify-end' : 'flex justify-start'}>
                <div className={(isEscalation ? 'bg-red-50 border-red-200' : isMine ? 'bg-slate-900 text-white' : isAdmin ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-200') + ' rounded-2xl px-4 py-3 max-w-[85%] border'}>
                  <p className={(isMine && !isEscalation ? 'text-white/70' : 'text-slate-500') + ' text-[10px] font-medium uppercase tracking-wider mb-1'}>
                    {r.author.name} {isAdmin && '(Admin)'}
                  </p>
                  <p className={(isMine && !isEscalation ? 'text-white' : 'text-slate-800') + ' text-sm whitespace-pre-wrap'}>{r.body}</p>
                  <p className={(isMine && !isEscalation ? 'text-white/50' : 'text-slate-400') + ' text-[10px] mt-2'}>
                    {new Date(r.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {canReply ? (
        <form onSubmit={sendReply} className='bg-white rounded-2xl border border-slate-200 p-5'>
          {error && <div className='bg-red-50 border border-red-200 text-red-800 px-3 py-2 rounded-lg mb-3 text-sm'>{error}</div>}
          <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4} placeholder='Type your reply...' className='w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 mb-3' />
          <div className='flex gap-2 flex-wrap'>
            <button type='submit' disabled={sending || !body.trim()} className='bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 disabled:opacity-50 transition-colors btn-3d'>
              {sending ? 'Sending...' : 'Send reply'}
            </button>
            {userRole === 'CLIENT' && !escalating && (
              <button type='button' onClick={() => setEscalating(true)} className='border border-orange-200 text-orange-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-50 transition-colors'>
                Escalate to admin
              </button>
            )}
          </div>

          {escalating && (
            <div className='mt-4 p-4 rounded-lg bg-orange-50 border border-orange-200'>
              <p className='text-xs text-orange-700 font-medium mb-2'>Escalation reason</p>
              <input type='text' value={escalateReason} onChange={(e) => setEscalateReason(e.target.value)} maxLength={500} placeholder='Why does this need urgent admin attention?' className='w-full border border-orange-200 rounded-lg px-3 py-2 text-sm mb-3 bg-white' />
              <div className='flex gap-2'>
                <button type='button' onClick={escalate} disabled={sending} className='bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-700 disabled:opacity-50'>Confirm</button>
                <button type='button' onClick={() => { setEscalating(false); setEscalateReason(''); }} className='border border-slate-200 text-slate-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50'>Cancel</button>
              </div>
            </div>
          )}
        </form>
      ) : (
        <div className='bg-slate-50 border border-slate-200 rounded-2xl p-5 text-center text-slate-500 text-sm'>
          This ticket is {status.toLowerCase()}.
        </div>
      )}
    </div>
  );
}