'use client';

import { useState, useEffect, useRef } from 'react';

type Message = {
  id: string;
  body: string;
  attachmentUrl: string | null;
  createdAt: string;
  senderId: string;
  sender: { id: string; name: string | null; role: string };
};

type OtherUser = { id: string; name: string | null; email: string; role: string } | null;

export default function ChatWindow({
  otherUserId,
  myUserId,
}: {
  otherUserId: string;
  myUserId: string;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [otherUser, setOtherUser] = useState<OtherUser>(null);
  const [body, setBody] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  async function load() {
    const res = await fetch('/api/messages/' + otherUserId);
    const data = await res.json();
    setMessages(data.messages || []);
    setOtherUser(data.otherUser || null);
    setLoading(false);
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [otherUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim() && !file) return;
    setError('');
    setSending(true);

    let attachmentUrl: string | null = null;

    if (file) {
      const fd = new FormData();
      fd.append('file', file);
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: fd,
      });
      if (!uploadRes.ok) {
        setError('File upload failed');
        setSending(false);
        return;
      }
      const uploadData = await uploadRes.json();
      attachmentUrl = uploadData.file?.url || null;
    }

    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        receiverId: otherUserId,
        body: body || '(attachment)',
        attachmentUrl,
      }),
    });

    setSending(false);
    if (res.ok) {
      setBody('');
      setFile(null);
      await load();
    } else {
      const data = await res.json();
      setError(data.error || 'Failed to send');
    }
  }

  return (
    <div className='bg-white rounded-lg shadow-sm border border-gray-100 flex flex-col h-[calc(100vh-200px)]'>
      <div className='p-4 border-b border-gray-200'>
        <h2 className='font-semibold'>{otherUser?.name || 'Conversation'}</h2>
        <p className='text-xs text-gray-500'>{otherUser?.email}</p>
      </div>

      <div className='flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50'>
        {loading ? (
          <p className='text-sm text-gray-500 text-center'>Loading messages...</p>
        ) : messages.length === 0 ? (
          <p className='text-sm text-gray-500 text-center'>No messages yet. Start the conversation!</p>
        ) : (
          messages.map((m) => {
            const isMine = m.senderId === myUserId;
            return (
              <div key={m.id} className={isMine ? 'flex justify-end' : 'flex justify-start'}>
                <div className={(isMine ? 'bg-blue-600 text-white' : 'bg-white text-gray-900 border border-gray-200') + ' rounded-lg px-4 py-2 max-w-md'}>
                  <p className='text-xs opacity-75 mb-1'>{m.sender.name || 'Unknown'}</p>
                  <p className='text-sm whitespace-pre-wrap'>{m.body}</p>
                  {m.attachmentUrl && (
                    <a href={m.attachmentUrl} download target='_blank' rel='noopener noreferrer' className='block mt-2 text-xs underline'>
                      Download attachment
                    </a>
                  )}
                  <p className='text-xs opacity-60 mt-1'>{new Date(m.createdAt).toLocaleString()}</p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={send} className='p-4 border-t border-gray-200'>
        {error && <div className='bg-red-100 text-red-700 p-2 rounded mb-2 text-sm'>{error}</div>}
        {file && (
          <div className='bg-blue-50 text-blue-700 p-2 rounded mb-2 text-sm flex justify-between'>
            <span>Attached: {file.name}</span>
            <button type='button' onClick={() => setFile(null)} className='text-red-600 hover:underline'>Remove</button>
          </div>
        )}
        <div className='flex gap-2'>
          <input
            type='text'
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder='Type your message...'
            className='flex-1 border border-gray-300 rounded px-3 py-2'
          />
          <label className='cursor-pointer border border-gray-300 rounded px-3 py-2 hover:bg-gray-50 text-sm flex items-center'>
            📎
            <input type='file' onChange={(e) => setFile(e.target.files?.[0] || null)} className='hidden' />
          </label>
          <button type='submit' disabled={sending} className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 text-sm'>
            {sending ? 'Sending...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
}