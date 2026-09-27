'use client';

import { useState, useEffect } from 'react';

type FileItem = {
  id: string;
  name: string;
  url: string;
  size: number | null;
  mimeType: string | null;
  createdAt: string;
  uploader: { name: string | null; role: string };
};

export default function FileManager({ projectId }: { projectId: string }) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    const res = await fetch('/api/files?projectId=' + projectId);
    const data = await res.json();
    setFiles(data.files || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [projectId]);

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('projectId', projectId);

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    setUploading(false);
    if (!res.ok) {
      setError(data.error || 'Upload failed');
      return;
    }
    e.target.value = '';
    load();
  }

  function formatSize(bytes: number | null) {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  return (
    <div className='bg-white p-5 rounded-lg shadow-sm border border-gray-100'>
      <div className='flex justify-between items-center mb-4'>
        <h2 className='font-semibold'>Project Files ({files.length})</h2>
        <label className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm cursor-pointer'>
          {uploading ? 'Uploading...' : '+ Upload File'}
          <input type='file' onChange={onUpload} disabled={uploading} className='hidden' />
        </label>
      </div>

      {error && <div className='bg-red-100 text-red-700 p-3 rounded mb-3 text-sm'>{error}</div>}

      {loading ? (
        <p className='text-sm text-gray-500'>Loading files...</p>
      ) : files.length === 0 ? (
        <p className='text-sm text-gray-500'>No files uploaded yet.</p>
      ) : (
        <div className='divide-y divide-gray-100'>
          {files.map((f) => (
            <div key={f.id} className='py-3 flex justify-between items-center gap-3'>
              <div className='flex-1 min-w-0'>
                <p className='text-sm font-medium truncate'>{f.name}</p>
                <p className='text-xs text-gray-500'>
                  {formatSize(f.size)} | Uploaded by {f.uploader.name || 'Unknown'} ({f.uploader.role}) | {new Date(f.createdAt).toLocaleDateString()}
                </p>
              </div>
              <a href={f.url} download={f.name} target='_blank' rel='noopener noreferrer' className='text-xs text-blue-600 hover:underline whitespace-nowrap'>Download</a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}