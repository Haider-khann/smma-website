'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type StaffMember = {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  createdAt: string;
  _count: { projectsManaged: number; tasksAssigned: number };
};

type Invitation = {
  id: string;
  name: string;
  email: string;
  token: string;
  expiresAt: string;
  createdAt: string;
};

export default function StaffManager({
  initialStaff,
  initialInvitations,
}: {
  initialStaff: StaffMember[];
  initialInvitations: Invitation[];
}) {
  const router = useRouter();
  const [staff, setStaff] = useState(initialStaff);
  const [invitations, setInvitations] = useState(initialInvitations);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function invite(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const res = await fetch('/api/admin/staff', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || 'Something went wrong');
      return;
    }

    setSuccess('Invitation created for ' + data.invitation.email + '. Copy the link below and share it.');
    setInvitations([data.invitation, ...invitations]);
    setForm({ name: '', email: '' });
    router.refresh();
  }

  async function cancelInvitation(id: string) {
    if (!confirm('Cancel this invitation?')) return;
    const res = await fetch('/api/admin/staff/' + id, { method: 'DELETE' });
    if (res.ok) {
      setInvitations(invitations.filter((i) => i.id !== id));
      router.refresh();
    }
  }

  async function deleteStaff(id: string, name: string) {
    if (!confirm('Delete ' + name + ' permanently? Their projects will become unassigned.')) return;
    const res = await fetch('/api/admin/staff/' + id, { method: 'DELETE' });
    if (res.ok) {
      setStaff(staff.filter((s) => s.id !== id));
      router.refresh();
    } else {
      alert('Failed to delete');
    }
  }

  function getInviteLink(token: string) {
    if (typeof window === 'undefined') return '/invite/' + token;
    return window.location.origin + '/invite/' + token;
  }

  function copyInviteLink(inv: Invitation) {
    const url = getInviteLink(inv.token);
    navigator.clipboard.writeText(url);
    setCopiedId(inv.id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <div className='space-y-8'>
      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <div>
          <div className='mb-4'>
            <h2 className='text-lg font-semibold text-slate-900'>Pending invitations</h2>
            <p className='text-sm text-slate-500 mt-0.5'>{invitations.length} awaiting acceptance</p>
          </div>

          <div className='bg-white rounded-xl border border-slate-200 divide-y divide-slate-100'>
            {invitations.map((inv) => {
              const link = getInviteLink(inv.token);
              const isExpired = new Date(inv.expiresAt) < new Date();
              return (
                <div key={inv.id} className='p-4 md:p-5'>
                  <div className='flex items-start justify-between gap-4 flex-wrap'>
                    <div className='flex-1 min-w-[200px]'>
                      <div className='flex items-center gap-2 mb-1 flex-wrap'>
                        <p className='font-medium text-slate-900'>{inv.name}</p>
                        <span className={(isExpired ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700') + ' px-2 py-0.5 rounded text-xs font-medium'}>
                          {isExpired ? 'Expired' : 'Pending'}
                        </span>
                      </div>
                      <p className='text-sm text-slate-500'>{inv.email}</p>
                      <p className='text-xs text-slate-400 mt-1'>
                        Expires {new Date(inv.expiresAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className='flex gap-2 flex-wrap'>
                      <button
                        onClick={() => copyInviteLink(inv)}
                        disabled={isExpired}
                        className='text-sm px-3 py-1.5 rounded-md bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                      >
                        {copiedId === inv.id ? '✓ Copied' : 'Copy link'}
                      </button>
                      <button
                        onClick={() => cancelInvitation(inv.id)}
                        className='text-sm px-3 py-1.5 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-red-600 transition-colors'
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                  <div className='mt-3 p-3 rounded-md bg-slate-50 border border-slate-200'>
                    <p className='text-xs text-slate-500 mb-1 font-mono uppercase tracking-wide'>Invitation link</p>
                    <p className='text-xs text-slate-700 break-all font-mono'>{link}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Active Staff */}
      <div>
        <div className='flex items-center justify-between mb-4 flex-wrap gap-3'>
          <div>
            <h2 className='text-lg font-semibold text-slate-900'>Active staff</h2>
            <p className='text-sm text-slate-500 mt-0.5'>{staff.length} team member(s)</p>
          </div>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className='bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors'
            >
              + Invite staff
            </button>
          )}
        </div>

        {showForm && (
          <form onSubmit={invite} className='bg-white rounded-xl border border-slate-200 p-5 md:p-6 mb-4'>
            <h3 className='font-semibold text-slate-900 mb-4'>Invite new staff member</h3>
            {error && (
              <div className='bg-red-50 border border-red-200 text-red-800 px-4 py-2.5 rounded-lg mb-4 text-sm'>{error}</div>
            )}

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
              <div>
                <label className='block text-sm font-medium text-slate-700 mb-1.5'>Full name</label>
                <input
                  type='text'
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  placeholder='John Doe'
                  className='w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-slate-700 mb-1.5'>Email</label>
                <input
                  type='email'
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  placeholder='smm@example.com'
                  className='w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
                />
              </div>
            </div>

            <div className='flex gap-2'>
              <button
                type='submit'
                disabled={loading}
                className='bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 disabled:opacity-50 transition-colors'
              >
                {loading ? 'Creating...' : 'Create invitation'}
              </button>
              <button
                type='button'
                onClick={() => { setShowForm(false); setError(''); }}
                className='px-4 py-2 rounded-lg text-sm font-medium border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors'
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {success && (
          <div className='bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg mb-4 text-sm'>{success}</div>
        )}

        {staff.length === 0 ? (
          <div className='bg-white rounded-xl border border-slate-200 p-12 text-center'>
            <p className='text-slate-500'>No staff members yet. Invite someone to get started.</p>
          </div>
        ) : (
          <div className='bg-white rounded-xl border border-slate-200 overflow-hidden'>
            <div className='overflow-x-auto'>
              <table className='w-full min-w-[600px]'>
                <thead className='bg-slate-50 border-b border-slate-200'>
                  <tr>
                    <th className='text-left px-5 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider'>Staff</th>
                    <th className='text-left px-5 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider'>Contact</th>
                    <th className='text-left px-5 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider'>Projects</th>
                    <th className='text-left px-5 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider'>Tasks</th>
                    <th className='text-left px-5 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider'>Joined</th>
                    <th className='text-right px-5 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider'></th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-slate-100'>
                  {staff.map((s) => (
                    <tr key={s.id} className='hover:bg-slate-50/50 transition-colors'>
                      <td className='px-5 py-3.5'>
                        <div className='flex items-center gap-3'>
                          <div className='w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-semibold text-xs flex-shrink-0'>
                            {s.name?.charAt(0).toUpperCase() || 'S'}
                          </div>
                          <p className='text-sm font-medium text-slate-900'>{s.name || 'Unnamed'}</p>
                        </div>
                      </td>
                      <td className='px-5 py-3.5'>
                        <p className='text-sm text-slate-700'>{s.email}</p>
                        {s.phone && <p className='text-xs text-slate-500'>{s.phone}</p>}
                      </td>
                      <td className='px-5 py-3.5 text-sm text-slate-700'>{s._count.projectsManaged}</td>
                      <td className='px-5 py-3.5 text-sm text-slate-700'>{s._count.tasksAssigned}</td>
                      <td className='px-5 py-3.5 text-sm text-slate-500'>
                        {new Date(s.createdAt).toLocaleDateString()}
                      </td>
                      <td className='px-5 py-3.5 text-right'>
                        <button
                          onClick={() => deleteStaff(s.id, s.name || s.email)}
                          className='text-xs text-red-600 hover:underline font-medium'
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}