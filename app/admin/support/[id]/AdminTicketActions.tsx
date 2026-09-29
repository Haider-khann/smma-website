import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminTicketActions({ ticketId, currentStatus }: { ticketId: string; currentStatus: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function updateStatus(status: string) {
    setLoading(true);
    await fetch('/api/support/' + ticketId, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'STATUS', status }),
    });
    setLoading(false);
    router.refresh();
  }

  const statuses = [
    { value: 'OPEN', label: 'Open', color: 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100' },
    { value: 'IN_PROGRESS', label: 'In Progress', color: 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100' },
    { value: 'RESOLVED', label: 'Resolved', color: 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100' },
    { value: 'CLOSED', label: 'Closed', color: 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100' },
  ];

  return (
    <div className='bg-white rounded-2xl border border-slate-200 p-4'>
      <p className='text-xs text-slate-500 uppercase tracking-wider font-medium mb-3'>Set status</p>
      <div className='flex gap-2 flex-wrap'>
        {statuses.map((s) => (
          <button key={s.value} onClick={() => updateStatus(s.value)} disabled={loading || currentStatus === s.value} className={'px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors disabled:opacity-40 ' + s.color}>
            {currentStatus === s.value ? '✓ ' : ''}{s.label}
          </button>
        ))}
      </div>
    </div>
  );
}