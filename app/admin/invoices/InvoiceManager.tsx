'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Client = { id: string; name: string | null; email: string };
type Project = { id: string; title: string; clientId: string };
type Invoice = {
  id: string;
  amount: number;
  status: string;
  issueDate: string;
  dueDate: string;
  client: { id: string; name: string | null; email: string };
  project: { id: string; title: string } | null;
};

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  PAID: 'bg-green-100 text-green-700',
  OVERDUE: 'bg-red-100 text-red-700',
};

export default function InvoiceManager({
  invoices,
  clients,
  projects,
}: {
  invoices: Invoice[];
  clients: Client[];
  projects: Project[];
}) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    clientId: '',
    projectId: '',
    amount: '',
    dueDate: '',
    items: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const filteredProjects = form.clientId
    ? projects.filter((p) => p.clientId === form.clientId)
    : [];

  async function createInvoice(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);

    const res = await fetch('/api/admin/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId: form.clientId,
        projectId: form.projectId || null,
        amount: parseFloat(form.amount),
        dueDate: form.dueDate,
        items: form.items || null,
      }),
    });

    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setError(data.error || 'Failed');
      return;
    }

    setShowForm(false);
    setForm({ clientId: '', projectId: '', amount: '', dueDate: '', items: '' });
    router.refresh();
  }

  async function updateStatus(invoiceId: string, status: string) {
    await fetch('/api/admin/invoices/' + invoiceId, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    router.refresh();
  }

  return (
    <div>
      <div className='flex justify-end mb-4'>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700'>
            + Create Invoice
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={createInvoice} className='bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-6 max-w-2xl'>
          <h2 className='font-semibold mb-4'>Create Invoice</h2>
          {error && <div className='bg-red-100 text-red-700 p-3 rounded mb-3 text-sm'>{error}</div>}

          <div className='mb-3'>
            <label className='block text-sm font-medium mb-1'>Client *</label>
            <select value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value, projectId: '' })} required className='w-full border border-gray-300 rounded px-3 py-2'>
              <option value=''>Select client...</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
              ))}
            </select>
          </div>

          <div className='mb-3'>
            <label className='block text-sm font-medium mb-1'>Project (optional)</label>
            <select value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })} className='w-full border border-gray-300 rounded px-3 py-2'>
              <option value=''>No project</option>
              {filteredProjects.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>

          <div className='grid grid-cols-2 gap-3 mb-3'>
            <div>
              <label className='block text-sm font-medium mb-1'>Amount (USD) *</label>
              <input type='number' step='0.01' min='0' value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required className='w-full border border-gray-300 rounded px-3 py-2' />
            </div>
            <div>
              <label className='block text-sm font-medium mb-1'>Due Date *</label>
              <input type='date' value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} required className='w-full border border-gray-300 rounded px-3 py-2' />
            </div>
          </div>

          <div className='mb-4'>
            <label className='block text-sm font-medium mb-1'>Items / Description</label>
            <textarea value={form.items} onChange={(e) => setForm({ ...form, items: e.target.value })} rows={3} placeholder='e.g. Monthly social media management fee' className='w-full border border-gray-300 rounded px-3 py-2' />
          </div>

          <div className='flex gap-2'>
            <button type='submit' disabled={saving} className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50'>
              {saving ? 'Creating...' : 'Create Invoice'}
            </button>
            <button type='button' onClick={() => setShowForm(false)} className='border border-gray-300 px-4 py-2 rounded hover:bg-gray-50'>Cancel</button>
          </div>
        </form>
      )}

      {invoices.length === 0 ? (
        <div className='bg-white p-12 rounded-lg shadow-sm border border-gray-100 text-center text-gray-500'>
          No invoices yet.
        </div>
      ) : (
        <div className='bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden'>
          <table className='w-full'>
            <thead className='bg-gray-50 border-b border-gray-200'>
              <tr>
                <th className='text-left px-6 py-3 text-sm font-medium text-gray-600'>ID</th>
                <th className='text-left px-6 py-3 text-sm font-medium text-gray-600'>Client</th>
                <th className='text-left px-6 py-3 text-sm font-medium text-gray-600'>Project</th>
                <th className='text-left px-6 py-3 text-sm font-medium text-gray-600'>Amount</th>
                <th className='text-left px-6 py-3 text-sm font-medium text-gray-600'>Due</th>
                <th className='text-left px-6 py-3 text-sm font-medium text-gray-600'>Status</th>
                <th className='text-right px-6 py-3 text-sm font-medium text-gray-600'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className='border-b border-gray-100 last:border-0'>
                  <td className='px-6 py-4 font-mono text-xs text-gray-600'>#{inv.id.slice(-8).toUpperCase()}</td>
                  <td className='px-6 py-4'>{inv.client.name}</td>
                  <td className='px-6 py-4 text-gray-600'>{inv.project?.title || '-'}</td>
                  <td className='px-6 py-4 font-medium'>${inv.amount.toFixed(2)}</td>
                  <td className='px-6 py-4 text-gray-600 text-sm'>{new Date(inv.dueDate).toLocaleDateString()}</td>
                  <td className='px-6 py-4'>
                    <span className={(statusColors[inv.status] || 'bg-gray-100 text-gray-600') + ' px-2 py-1 rounded text-xs font-medium'}>
                      {inv.status}
                    </span>
                  </td>
                  <td className='px-6 py-4 text-right'>
                    {inv.status !== 'PAID' && (
                      <button onClick={() => updateStatus(inv.id, 'PAID')} className='text-xs text-green-600 hover:underline mr-2'>Mark Paid</button>
                    )}
                    {inv.status !== 'PENDING' && (
                      <button onClick={() => updateStatus(inv.id, 'PENDING')} className='text-xs text-yellow-600 hover:underline'>Mark Pending</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}