'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  dueDate: string | null;
  assignee: { id: string; name: string | null } | null;
};

export default function TaskManager({
  projectId,
  tasks,
}: {
  projectId: string;
  tasks: Task[];
}) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', description: '', dueDate: '', status: 'PENDING' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function resetForm() {
    setForm({ title: '', description: '', dueDate: '', status: 'PENDING' });
    setEditingId(null);
    setShowForm(false);
    setError('');
  }

  function startEdit(task: Task) {
    setForm({
      title: task.title,
      description: task.description || '',
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      status: task.status,
    });
    setEditingId(task.id);
    setShowForm(true);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);

    const url = editingId
      ? '/api/staff/tasks/' + editingId
      : '/api/staff/tasks';
    const method = editingId ? 'PATCH' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId,
        title: form.title,
        description: form.description || null,
        dueDate: form.dueDate || null,
        status: form.status,
      }),
    });

    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error || 'Failed');
      return;
    }
    resetForm();
    router.refresh();
  }

  async function updateStatus(taskId: string, status: string) {
    await fetch('/api/staff/tasks/' + taskId, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    router.refresh();
  }

  async function deleteTask(taskId: string) {
    if (!confirm('Delete this task?')) return;
    const res = await fetch('/api/staff/tasks/' + taskId, { method: 'DELETE' });
    if (res.ok) router.refresh();
  }

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    IN_PROGRESS: 'bg-blue-100 text-blue-700',
    DONE: 'bg-green-100 text-green-700',
  };

  return (
    <div>
      <div className='flex justify-between items-center mb-4'>
        <h2 className='text-xl font-bold'>Tasks ({tasks.length})</h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm'
          >
            + Add Task
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={submit} className='bg-white p-5 rounded-lg shadow-sm border border-gray-100 mb-4'>
          {error && <div className='bg-red-100 text-red-700 p-3 rounded mb-3 text-sm'>{error}</div>}
          <div className='mb-3'>
            <label className='block text-sm font-medium mb-1'>Title *</label>
            <input type='text' value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className='w-full border border-gray-300 rounded px-3 py-2' />
          </div>
          <div className='mb-3'>
            <label className='block text-sm font-medium mb-1'>Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className='w-full border border-gray-300 rounded px-3 py-2' />
          </div>
          <div className='grid grid-cols-2 gap-3 mb-3'>
            <div>
              <label className='block text-sm font-medium mb-1'>Due Date</label>
              <input type='date' value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className='w-full border border-gray-300 rounded px-3 py-2' />
            </div>
            <div>
              <label className='block text-sm font-medium mb-1'>Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className='w-full border border-gray-300 rounded px-3 py-2'>
                <option value='PENDING'>PENDING</option>
                <option value='IN_PROGRESS'>IN_PROGRESS</option>
                <option value='DONE'>DONE</option>
              </select>
            </div>
          </div>
          <div className='flex gap-2'>
            <button type='submit' disabled={saving} className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 text-sm'>
              {saving ? 'Saving...' : editingId ? 'Update Task' : 'Create Task'}
            </button>
            <button type='button' onClick={resetForm} className='border border-gray-300 px-4 py-2 rounded hover:bg-gray-50 text-sm'>Cancel</button>
          </div>
        </form>
      )}

      {tasks.length === 0 ? (
        <div className='bg-white p-8 rounded-lg shadow-sm border border-gray-100 text-center text-gray-500'>
          No tasks yet. Click Add Task to create one.
        </div>
      ) : (
        <div className='space-y-2'>
          {tasks.map((task) => (
            <div key={task.id} className='bg-white p-4 rounded-lg shadow-sm border border-gray-100'>
              <div className='flex justify-between items-start mb-2'>
                <div className='flex-1'>
                  <p className='font-medium'>{task.title}</p>
                  {task.description && <p className='text-sm text-gray-600 mt-1'>{task.description}</p>}
                  {task.dueDate && (
                    <p className='text-xs text-gray-500 mt-1'>Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                  )}
                </div>
                <span className={(statusColors[task.status] || 'bg-gray-100 text-gray-600') + ' px-2 py-1 rounded text-xs font-medium'}>
                  {task.status}
                </span>
              </div>
              <div className='flex gap-2 mt-3 flex-wrap'>
                {task.status === 'PENDING' && (
                  <button onClick={() => updateStatus(task.id, 'IN_PROGRESS')} className='text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200'>Start</button>
                )}
                {task.status === 'IN_PROGRESS' && (
                  <button onClick={() => updateStatus(task.id, 'DONE')} className='text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200'>Mark Done</button>
                )}
                <button onClick={() => startEdit(task)} className='text-xs text-blue-600 hover:underline'>Edit</button>
                <button onClick={() => deleteTask(task.id)} className='text-xs text-red-600 hover:underline'>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}