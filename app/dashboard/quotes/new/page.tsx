'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Service = { id: string; name: string; category: string | null; price: number };

export default function NewQuotePage() {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [form, setForm] = useState({ title: '', description: '', budget: '', deadline: '' });
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/services').then((r) => r.json()).then((d) => setServices(d.services || [])).catch(() => {});
  }, []);

  function toggleService(id: string) {
    setSelected((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await fetch('/api/client/quotes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: form.title,
        description: form.description,
        budget: form.budget ? parseFloat(form.budget) : undefined,
        deadline: form.deadline || undefined,
        serviceIds: selected,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error || 'Something went wrong'); return; }
    router.push('/dashboard/quotes');
    router.refresh();
  }

  return (
    <div>
      <div className='mb-6'>
        <Link href='/dashboard/quotes' className='text-blue-600 hover:underline text-sm'>Back to My Quotes</Link>
        <h1 className='text-3xl font-bold mt-2'>Submit Quote Request</h1>
      </div>

      <form onSubmit={onSubmit} className='bg-white p-6 rounded-lg shadow-sm border border-gray-100 max-w-3xl'>
        {error && <div className='bg-red-100 text-red-700 p-3 rounded mb-4 text-sm'>{error}</div>}

        <div className='mb-4'>
          <label className='block text-sm font-medium mb-1'>Project Title *</label>
          <input type='text' value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required placeholder='e.g. Instagram marketing for my clothing brand' className='w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500' />
        </div>

        <div className='mb-4'>
          <label className='block text-sm font-medium mb-1'>Project Description *</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required rows={5} placeholder='Describe your project goals...' className='w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500' />
        </div>

        <div className='grid grid-cols-2 gap-4 mb-4'>
          <div>
            <label className='block text-sm font-medium mb-1'>Budget (USD)</label>
            <input type='number' step='0.01' min='0' value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} placeholder='Optional' className='w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500' />
          </div>
          <div>
            <label className='block text-sm font-medium mb-1'>Desired Deadline</label>
            <input type='date' value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} className='w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500' />
          </div>
        </div>

        <div className='mb-6'>
          <label className='block text-sm font-medium mb-2'>Select Services</label>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto border border-gray-200 rounded p-3'>
            {services.length === 0 ? (
              <p className='text-sm text-gray-500'>Loading services...</p>
            ) : (
              services.map((s) => (
                <label key={s.id} className={selected.includes(s.id) ? 'flex items-start gap-2 p-2 rounded cursor-pointer bg-blue-50 border border-blue-200' : 'flex items-start gap-2 p-2 rounded cursor-pointer hover:bg-gray-50 border border-transparent'}>
                  <input type='checkbox' checked={selected.includes(s.id)} onChange={() => toggleService(s.id)} className='mt-1' />
                  <div className='flex-1'>
                    <p className='text-sm font-medium'>{s.name}</p>
                    {s.category && <p className='text-xs text-gray-500'>{s.category} - ${s.price}</p>}
                  </div>
                </label>
              ))
            )}
          </div>
          <p className='text-xs text-gray-500 mt-2'>{selected.length} service(s) selected</p>
        </div>

        <div className='flex gap-3'>
          <button type='submit' disabled={loading} className='bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50'>
            {loading ? 'Submitting...' : 'Submit Request'}
          </button>
          <Link href='/dashboard/quotes' className='px-6 py-2 rounded border border-gray-300 hover:bg-gray-50'>Cancel</Link>
        </div>
      </form>
    </div>
  );
}