'use client';
import { useState, useRef, DragEvent, ChangeEvent, useEffect } from 'react';

const API_BASE = 'https://2zhsad3hab.execute-api.us-east-1.amazonaws.com/prod';
const CHUNK_SIZE = 10 * 1024 * 1024;

const FOLDER_FILLS = ['#E8EEF7','#E4F0ED','#EEEEE8','#F5F0E8','#EAF0F0','#F0EDE8','#EDF0F5','#F2EEE8','#E8EDF2','#EEF0E8'];
const FOLDER_STROKES = ['#B5C9E0','#8BB8A4','#A8A89E','#B8A88A','#8ABABA','#C0A880','#8090B0','#907850','#6888B0','#789060'];
const FOLDER_TEXT_COLORS = ['#2D4E7A','#1E5C46','#3A3A30','#4A3818','#1A4A4A','#5A3E20','#2A3A60','#4A3018','#1E3A60','#2A4020'];

const T = {
  pageTitle: { fontFamily: 'Georgia, serif', fontSize: '24px', fontWeight: 400, color: '#1a1a1a', letterSpacing: '-0.01em' } as React.CSSProperties,
  brand: { fontFamily: 'Georgia, serif', fontSize: '14px', fontWeight: 400, color: '#1a1a1a', letterSpacing: '0.02em' } as React.CSSProperties,
  sectionLabel: { fontFamily: 'system-ui, sans-serif', fontSize: '10px', fontWeight: 400, letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: '#b0b0b0' },
  navItem: { fontFamily: 'system-ui, sans-serif', fontSize: '13px', fontWeight: 400, letterSpacing: '0.01em' } as React.CSSProperties,
  sidebarAction: { fontFamily: 'system-ui, sans-serif', fontSize: '13px', fontWeight: 400, letterSpacing: '0.02em' } as React.CSSProperties,
  filename: { fontFamily: 'system-ui, sans-serif', fontSize: '11.5px', fontWeight: 500, color: '#222', letterSpacing: '0.005em', lineHeight: '1.3', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const },
  filemeta: { fontFamily: 'system-ui, sans-serif', fontSize: '10.5px', fontWeight: 400, color: '#b0b0b0', letterSpacing: '0.02em', marginTop: '2px' },
  listFilename: { fontFamily: 'system-ui, sans-serif', fontSize: '13px', fontWeight: 400, color: '#222', letterSpacing: '0.005em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const },
  listMeta: { fontFamily: 'system-ui, sans-serif', fontSize: '11px', fontWeight: 400, color: '#b0b0b0', letterSpacing: '0.02em' },
  uploadFilename: { fontFamily: 'system-ui, sans-serif', fontSize: '12.5px', fontWeight: 400, color: '#222', letterSpacing: '0.005em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const },
  modalTitle: { fontFamily: 'Georgia, serif', fontSize: '16px', fontWeight: 400, color: '#1a1a1a', letterSpacing: '0.01em' } as React.CSSProperties,
  modalSub: { fontFamily: 'system-ui, sans-serif', fontSize: '12px', fontWeight: 400, color: '#b0b0b0', letterSpacing: '0.02em' } as React.CSSProperties,
  uploadCount: { fontFamily: 'system-ui, sans-serif', fontSize: '12px', fontWeight: 400, color: '#444', letterSpacing: '0.02em' } as React.CSSProperties,
  actionLink: { fontFamily: 'system-ui, sans-serif', fontSize: '11.5px', fontWeight: 400, letterSpacing: '0.04em' } as React.CSSProperties,
  badge: { fontFamily: 'system-ui, sans-serif', fontSize: '10px', fontWeight: 500, letterSpacing: '0.01em' } as React.CSSProperties,
};

interface S3File { key: string; filename: string; size: number; lastModified: string; }
interface Folder { key: string; name: string; }
interface UploadItem { file: File; progress: number; speed: string; status: 'queued' | 'uploading' | 'done' | 'error'; error?: string; }

function formatBytes(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1048576) return `${(b / 1024).toFixed(1)} KB`;
  if (b < 1073741824) return `${(b / 1048576).toFixed(1)} MB`;
  return `${(b / 1073741824).toFixed(2)} GB`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function FileThumbIcon({ filename, size = 48 }: { filename: string; size?: number }) {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  const s = size;
  if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext))
    return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="#d4a574" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="2.18"/><path d="M7 2v20M17 2v20M2 12h20M2 7h5M2 17h5M17 7h5M17 17h5"/></svg>;
  if (['mp3', 'wav', 'ogg', 'aac', 'm4a'].includes(ext))
    return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>;
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic'].includes(ext))
    return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>;
  if (ext === 'pdf')
    return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M9 15v-4"/><path d="M12 15v-6"/><path d="M15 15v-2"/></svg>;
  if (['xlsx', 'xls', 'csv'].includes(ext))
    return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>;
  if (['docx', 'doc'].includes(ext))
    return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>;
  return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
}

function getThumbBg(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext)) return 'bg-gray-900';
  if (['mp3', 'wav', 'ogg', 'aac', 'm4a'].includes(ext)) return 'bg-purple-950';
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic'].includes(ext)) return 'bg-blue-50';
  if (ext === 'pdf') return 'bg-red-50';
  if (['xlsx', 'xls', 'csv'].includes(ext)) return 'bg-green-50';
  if (['docx', 'doc'].includes(ext)) return 'bg-blue-50';
  return 'bg-gray-100';
}

function isPreviewable(filename: string): boolean {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'mov', 'webm'].includes(ext);
}

function isVideo(filename: string): boolean {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  return ['mp4', 'mov', 'webm'].includes(ext);
}

function FolderCard({ name, index, onClick }: { name: string; index: number; onClick: () => void }) {
  const fill = FOLDER_FILLS[index % FOLDER_FILLS.length];
  const stroke = FOLDER_STROKES[index % FOLDER_STROKES.length];
  const textColor = FOLDER_TEXT_COLORS[index % FOLDER_TEXT_COLORS.length];
  const label = name.length > 16 ? name.slice(0, 15) + '…' : name;
  return (
    <button onClick={onClick} className="hover:opacity-75 transition-opacity cursor-pointer bg-transparent border-0 p-0 w-full">
      <svg width="100%" viewBox="0 0 110 82" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="9" width="106" height="71" rx="7" fill={stroke}/>
        <path d="M5 9 Q5 6 8 6 L36 6 Q41 6 43 9 L43 15 L5 15 Z" fill={stroke}/>
        <rect x="0" y="15" width="108" height="65" rx="7" fill={fill} stroke={stroke} strokeWidth="0.8"/>
        <text x="54" y="54" textAnchor="middle" fontSize="10" fill={textColor} fontWeight="400"
          fontFamily="Georgia, serif" letterSpacing="0.4">{label}</text>
      </svg>
    </button>
  );
}

function isLargeFile(size: number) { return size > 10 * 1024 * 1024; }

export default function FileManager() {
  const [uploadItems, setUploadItems] = useState<UploadItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<S3File[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [currentFolder, setCurrentFolder] = useState('');
  const [loadingFiles, setLoadingFiles] = useState(true);
  const [downloadingKey, setDownloadingKey] = useState<string | null>(null);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [thumbUrls, setThumbUrls] = useState<Record<string, string>>({});
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchFiles = async (folder = '') => {
    try {
      setLoadingFiles(true);
      const url = folder ? `${API_BASE}/list-files?folder=${encodeURIComponent(folder)}` : `${API_BASE}/list-files`;
      const res = await fetch(url);
      const data = await res.json();
      setFiles(data.files || []);
      setFolders(data.folders || []);
    } catch (err) { console.error(err); }
    finally { setLoadingFiles(false); }
  };

  useEffect(() => { fetchFiles(''); }, []);

  useEffect(() => {
    files.forEach(f => {
      if (isPreviewable(f.filename) && !thumbUrls[f.key]) fetchThumb(f.key);
    });
  }, [files]);

  const fetchThumb = async (key: string) => {
    try {
      const r = await fetch(`${API_BASE}/get-download-url?key=${encodeURIComponent(key)}`);
      const d = await r.json();
      setThumbUrls(prev => ({ ...prev, [key]: d.downloadUrl }));
    } catch (e) { console.error(e); }
  };

  const navigateToFolder = (name: string) => { setCurrentFolder(name); fetchFiles(name); setUploadItems([]); setThumbUrls({}); };
  const handleFiles = (fl: FileList) => setUploadItems(Array.from(fl).map(f => ({ file: f, progress: 0, speed: '', status: 'queued' })));
  const handleDrop = (e: DragEvent) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files); };
  const updateItem = (i: number, u: Partial<UploadItem>) => setUploadItems(p => p.map((x, j) => j === i ? { ...x, ...u } : x));

  const uploadRegular = async (file: File, idx: number) => {
    const t0 = Date.now();
    const r = await fetch(`${API_BASE}/get-upload-url`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ filename: file.name, contentType: file.type || 'application/octet-stream', folder: currentFolder }) });
    if (!r.ok) throw new Error(`API ${r.status}`);
    const { uploadUrl } = await r.json();
    await new Promise<void>((res, rej) => {
      const x = new XMLHttpRequest(); x.open('PUT', uploadUrl); x.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
      x.upload.onprogress = e => { if (!e.lengthComputable) return; updateItem(idx, { progress: Math.round(e.loaded / e.total * 100), speed: formatBytes(e.loaded / ((Date.now() - t0) / 1000)) + '/s' }); };
      x.onload = () => x.status < 300 ? res() : rej(new Error(`S3 ${x.status}`)); x.onerror = () => rej(new Error('Network')); x.send(file);
    });
  };

  const uploadMultipart = async (file: File, idx: number) => {
    const t0 = Date.now();
    const cr = await fetch(`${API_BASE}/create-multipart`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ filename: file.name, contentType: file.type || 'application/octet-stream', folder: currentFolder }) });
    if (!cr.ok) throw new Error('create-multipart failed');
    const { uploadId, key } = await cr.json();
    const pc = Math.ceil(file.size / CHUNK_SIZE);
    const ur = await fetch(`${API_BASE}/get-part-urls`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key, uploadId, partCount: pc }) });
    if (!ur.ok) throw new Error('get-part-urls failed');
    const { urls } = await ur.json();
    const parts: { PartNumber: number; ETag: string }[] = [];
    let uploaded = 0;
    for (let i = 0; i < pc; i++) {
      const chunk = file.slice(i * CHUNK_SIZE, Math.min((i + 1) * CHUNK_SIZE, file.size));
      const etag = await new Promise<string>((res, rej) => {
        const x = new XMLHttpRequest(); x.open('PUT', urls[i]);
        x.upload.onprogress = e => { if (!e.lengthComputable) return; const tot = uploaded + e.loaded; updateItem(idx, { progress: Math.round(tot / file.size * 100), speed: formatBytes(tot / ((Date.now() - t0) / 1000)) + '/s' }); };
        x.onload = () => { if (x.status < 300) { uploaded += chunk.size; res(x.getResponseHeader('ETag') || ''); } else rej(new Error(`Part ${i + 1}`)); };
        x.onerror = () => rej(new Error(`Net part ${i + 1}`)); x.send(chunk);
      });
      parts.push({ PartNumber: i + 1, ETag: etag });
    }
    const comp = await fetch(`${API_BASE}/complete-multipart`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key, uploadId, parts }) });
    if (!comp.ok) throw new Error('complete-multipart failed');
  };

  const startUpload = async () => {
    if (!uploadItems.length) return;
    setIsUploading(true);
    await Promise.all(uploadItems.map(async (item, i) => {
      try { updateItem(i, { status: 'uploading' }); if (isLargeFile(item.file.size)) await uploadMultipart(item.file, i); else await uploadRegular(item.file, i); updateItem(i, { status: 'done', progress: 100 }); }
      catch (e) { updateItem(i, { status: 'error', error: e instanceof Error ? e.message : 'Error' }); }
    }));
    setIsUploading(false);
    fetchFiles(currentFolder);
  };

  const handleDownload = async (key: string) => {
    try { setDownloadingKey(key); const w = window.open('', '_blank'); const r = await fetch(`${API_BASE}/get-download-url?key=${encodeURIComponent(key)}`); const d = await r.json(); if (w) w.location.href = d.downloadUrl; }
    catch (e) { console.error(e); } finally { setDownloadingKey(null); }
  };

  const createFolder = async () => {
    if (!newFolderName.trim()) return;
    try { setCreatingFolder(true); const r = await fetch(`${API_BASE}/create-folder`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ folderName: newFolderName.trim() }) }); if (!r.ok) throw new Error('Failed'); setNewFolderName(''); setShowNewFolder(false); fetchFiles(currentFolder); }
    catch (e) { console.error(e); } finally { setCreatingFolder(false); }
  };

  const allDone = uploadItems.length > 0 && uploadItems.every(i => i.status === 'done' || i.status === 'error');

  return (
    <main className="min-h-screen bg-white flex" style={{ color: '#222', fontFamily: 'system-ui, sans-serif' }}>

      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-gray-100 flex flex-col fixed inset-y-0 left-0 py-6 px-3 z-20">

        {/* Brand */}
        <div className="flex items-center gap-2.5 px-3 mb-8">
          <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
          </svg>
          <span style={T.brand}>Arun's drive</span>
        </div>

        {/* New folder */}
        <button onClick={() => setShowNewFolder(true)}
          className="flex items-center gap-2 mx-2 mb-6 px-4 py-2 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-all"
          style={T.sidebarAction}>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>
          New folder
        </button>

        {/* Nav */}
        <button onClick={() => navigateToFolder('')}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg w-full text-left mb-0.5 transition-colors ${currentFolder === '' ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:bg-gray-50'}`}
          style={T.navItem}>
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
          Home
        </button>

        <button onClick={() => navigateToFolder('')}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:bg-gray-50 w-full text-left mb-5 transition-colors"
          style={T.navItem}>
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" /></svg>
          My Drive
        </button>

        {/* Folder list */}
        {folders.length > 0 && (
          <div className="flex flex-col gap-0.5">
            {folders.map((f, i) => (
              <button key={f.key} onClick={() => navigateToFolder(f.name)}
                className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg w-full text-left transition-colors ${currentFolder === f.name ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:bg-gray-50'}`}
                style={T.navItem}>
                <svg className="w-3.5 h-3.5 flex-shrink-0" style={{ color: FOLDER_STROKES[i % FOLDER_STROKES.length] }} fill="currentColor" viewBox="0 0 24 24">
                  <path d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
                </svg>
                <span className="truncate">{f.name}</span>
              </button>
            ))}
          </div>
        )}
      </aside>

      {/* Main */}
      <div className="flex-1 ml-56 flex flex-col min-h-screen">

        {/* Header */}
        <header className="flex items-center justify-end px-8 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 select-none"
            style={{ fontSize: '12px', fontWeight: 500, fontFamily: 'system-ui, sans-serif', letterSpacing: '0.05em' }}>A</div>
        </header>

        <div className="flex-1 px-8 py-8">

          {/* Page title */}
          <h1 style={{ ...T.pageTitle, marginBottom: '32px' }}>
            {currentFolder || 'Welcome, Arun'}
          </h1>

          {/* New folder modal */}
          {showNewFolder && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 max-w-sm" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
              <p style={{ ...T.modalTitle, marginBottom: '4px' }}>New folder</p>
              <p style={{ ...T.modalSub, marginBottom: '16px' }}>Give your folder a name</p>
              <input autoFocus type="text" placeholder="e.g. Vacation 2026" value={newFolderName}
                onChange={e => setNewFolderName(e.target.value)} onKeyDown={e => e.key === 'Enter' && createFolder()}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl mb-4 outline-none focus:border-blue-300"
                style={{ fontSize: '13px', fontFamily: 'system-ui, sans-serif', fontWeight: 400, color: '#222' }} />
              <div className="flex gap-3 justify-end">
                <button onClick={() => { setShowNewFolder(false); setNewFolderName(''); }}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50"
                  style={{ fontSize: '12.5px', fontFamily: 'system-ui, sans-serif', fontWeight: 400 }}>Cancel</button>
                <button onClick={createFolder} disabled={creatingFolder || !newFolderName.trim()}
                  className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-40 transition-colors"
                  style={{ fontSize: '12.5px', fontFamily: 'system-ui, sans-serif', fontWeight: 400 }}>
                  {creatingFolder ? 'Creating…' : 'Create'}
                </button>
              </div>
            </div>
          )}

          {/* Upload queue */}
          {uploadItems.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden mb-6">
              <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                <p style={T.uploadCount}>{uploadItems.length} file{uploadItems.length > 1 ? 's' : ''} selected</p>
                {allDone
                  ? <button onClick={() => setUploadItems([])} className="px-3 py-1.5 border border-gray-200 text-gray-500 rounded-lg hover:bg-gray-50" style={{ fontSize: '11.5px', fontFamily: 'system-ui, sans-serif', fontWeight: 400 }}>Clear</button>
                  : <button onClick={startUpload} disabled={isUploading} className="px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-40" style={{ fontSize: '11.5px', fontFamily: 'system-ui, sans-serif', fontWeight: 400 }}>
                      {isUploading ? 'Uploading…' : `Upload ${uploadItems.length} file${uploadItems.length > 1 ? 's' : ''}`}
                    </button>
                }
              </div>
              <div className="divide-y divide-gray-50">
                {uploadItems.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 px-5 py-3">
                    <div className="w-8 h-8 flex items-center justify-center flex-shrink-0"><FileThumbIcon filename={item.file.name} size={18} /></div>
                    <div className="flex-1 min-w-0">
                      <p style={T.uploadFilename}>{item.file.name}</p>
                      {(item.status === 'uploading' || item.status === 'done') && (
                        <div className="w-full bg-gray-100 rounded-full mt-1.5" style={{ height: '2px' }}>
                          <div className={`rounded-full transition-all ${item.status === 'done' ? 'bg-green-400' : 'bg-blue-400'}`} style={{ height: '2px', width: `${item.progress}%` }} />
                        </div>
                      )}
                    </div>
                    <span style={{ ...T.badge, minWidth: '40px', textAlign: 'right' }}>
                      {item.status === 'queued' && <span style={{ color: '#c0c0c0' }}>Queued</span>}
                      {item.status === 'uploading' && <span style={{ color: '#60a5fa' }}>{item.progress}%</span>}
                      {item.status === 'done' && <span style={{ color: '#4ade80' }}>Done</span>}
                      {item.status === 'error' && <span style={{ color: '#f87171' }}>Failed</span>}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Folders */}
          {folders.length > 0 && (
            <section className="mb-8">
              <p style={{ ...T.sectionLabel, marginBottom: '14px' }}>Folders</p>
              <div className="grid grid-cols-5 sm:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3">
                {folders.map((f, i) => (
                  <FolderCard key={f.key} name={f.name} index={i} onClick={() => navigateToFolder(f.name)} />
                ))}
              </div>
            </section>
          )}

          {/* Files */}
          <section>
            {(files.length > 0 || !loadingFiles) && (
              <div className="flex items-center justify-between mb-4">
                <p style={T.sectionLabel}>Files</p>
                <div className="flex items-center gap-3">
                  <button onClick={() => inputRef.current?.click()}
                    className="text-blue-400 hover:text-blue-500 flex items-center gap-1 transition-colors"
                    style={T.actionLink}>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                    Upload
                  </button>
                  <button onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded transition-colors ${viewMode === 'list' ? 'text-gray-700' : 'text-gray-300 hover:text-gray-500'}`}>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                  </button>
                  <button onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded transition-colors ${viewMode === 'grid' ? 'text-gray-700' : 'text-gray-300 hover:text-gray-500'}`}>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                  </button>
                </div>
              </div>
            )}

            {loadingFiles ? (
              <p style={{ ...T.listMeta, textAlign: 'center', padding: '64px 0' }}>Loading…</p>
            ) : files.length === 0 && folders.length === 0 ? (
              <div onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)} onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                className={`border border-dashed rounded-2xl p-16 flex flex-col items-center gap-3 cursor-pointer transition-colors ${isDragging ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <svg className="w-10 h-10 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                <p style={{ ...T.listMeta, color: '#c0c0c0' }}>Drop files here or click to upload</p>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {files.map(f => (
                  <div key={f.key} className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:border-gray-200 transition-all group cursor-pointer" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                    <div className={`h-32 flex items-center justify-center relative overflow-hidden ${getThumbBg(f.filename)}`}>
                      {isPreviewable(f.filename) && thumbUrls[f.key] ? (
                        isVideo(f.filename) ? (
                          <video src={thumbUrls[f.key]} className="w-full h-full object-cover" preload="metadata" muted playsInline
                            onLoadedMetadata={(e) => { e.currentTarget.currentTime = 1; }} />
                        ) : (
                          <img src={thumbUrls[f.key]} alt={f.filename} className="w-full h-full object-cover" />
                        )
                      ) : (
                        <FileThumbIcon filename={f.filename} size={44} />
                      )}
                      <div className="absolute bottom-2 right-2 bg-black/50 rounded px-1.5 py-0.5">
                        <span style={{ ...T.badge, color: 'white' }}>{formatBytes(f.size)}</span>
                      </div>
                    </div>
                    <div className="px-3 py-2.5 border-t border-gray-50 flex items-start justify-between gap-1">
                      <div className="min-w-0 flex-1">
                        <p style={T.filename}>{f.filename}</p>
                        <p style={T.filemeta}>{formatDate(f.lastModified)}</p>
                      </div>
                      <button onClick={() => handleDownload(f.key)} disabled={downloadingKey === f.key}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 rounded-lg transition-all flex-shrink-0 mt-0.5">
                        <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
                <div onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)} onDrop={handleDrop}
                  onClick={() => inputRef.current?.click()}
                  className={`border border-dashed rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors ${isDragging ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                  style={{ minHeight: '148px' }}>
                  <svg className="w-6 h-6 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                  <p style={{ ...T.listMeta, color: '#d0d0d0', textAlign: 'center' }}>Drop or click</p>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-gray-100 rounded-xl overflow-hidden" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                <div className="divide-y divide-gray-50">
                  {files.map(f => (
                    <div key={f.key} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50 transition-colors group">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${getThumbBg(f.filename)}`}>
                        <FileThumbIcon filename={f.filename} size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p style={T.listFilename}>{f.filename}</p>
                        <p style={T.listMeta}>{formatBytes(f.size)} · {formatDate(f.lastModified)}</p>
                      </div>
                      <button onClick={() => handleDownload(f.key)} disabled={downloadingKey === f.key}
                        className="opacity-0 group-hover:opacity-100 px-3 py-1.5 border border-gray-200 text-gray-400 rounded-lg hover:bg-gray-100 transition-all disabled:opacity-40"
                        style={{ fontSize: '11.5px', fontFamily: 'system-ui, sans-serif', fontWeight: 400 }}>
                        {downloadingKey === f.key ? 'Getting link…' : 'Download'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>
      </div>

      <input ref={inputRef} type="file" multiple className="hidden"
        onChange={(e: ChangeEvent<HTMLInputElement>) => { if (e.target.files?.length) handleFiles(e.target.files); }} />
    </main>
  );
}