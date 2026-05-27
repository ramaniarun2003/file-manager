'use client';
import { useState } from 'react';
import { API_BASE, CHUNK_SIZE } from '@drive/constants';
import { UploadItem } from '@drive/types';
import { formatBytes, isLargeFile } from '@drive/utils';

export function useUploader(currentFolder: string, onDone: () => void) {
  const [uploadItems, setUploadItems] = useState<UploadItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const updateItem = (i: number, u: Partial<UploadItem>) =>
    setUploadItems(p => p.map((x, j) => j === i ? { ...x, ...u } : x));

  const handleFiles = (fl: FileList) =>
    setUploadItems(Array.from(fl).map(f => ({ file: f, progress: 0, speed: '', status: 'queued' })));

  const uploadRegular = async (file: File, idx: number) => {
    const t0 = Date.now();
    const r = await fetch(`${API_BASE}/get-upload-url`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename: file.name, contentType: file.type || 'application/octet-stream', folder: currentFolder }),
    });
    if (!r.ok) throw new Error(`API ${r.status}`);
    const { uploadUrl } = await r.json();
    await new Promise<void>((res, rej) => {
      const x = new XMLHttpRequest();
      x.open('PUT', uploadUrl);
      x.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
      x.upload.onprogress = e => {
        if (!e.lengthComputable) return;
        updateItem(idx, { progress: Math.round(e.loaded / e.total * 100), speed: formatBytes(e.loaded / ((Date.now() - t0) / 1000)) + '/s' });
      };
      x.onload = () => x.status < 300 ? res() : rej(new Error(`S3 ${x.status}`));
      x.onerror = () => rej(new Error('Network'));
      x.send(file);
    });
  };

  const uploadMultipart = async (file: File, idx: number) => {
    const t0 = Date.now();
    const cr = await fetch(`${API_BASE}/create-multipart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename: file.name, contentType: file.type || 'application/octet-stream', folder: currentFolder }),
    });
    if (!cr.ok) throw new Error('create-multipart failed');
    const { uploadId, key } = await cr.json();

    const pc = Math.ceil(file.size / CHUNK_SIZE);
    const ur = await fetch(`${API_BASE}/get-part-urls`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, uploadId, partCount: pc }),
    });
    if (!ur.ok) throw new Error('get-part-urls failed');
    const { urls } = await ur.json();

    const parts: { PartNumber: number; ETag: string }[] = [];
    let uploaded = 0;
    for (let i = 0; i < pc; i++) {
      const chunk = file.slice(i * CHUNK_SIZE, Math.min((i + 1) * CHUNK_SIZE, file.size));
      const etag = await new Promise<string>((res, rej) => {
        const x = new XMLHttpRequest();
        x.open('PUT', urls[i]);
        x.upload.onprogress = e => {
          if (!e.lengthComputable) return;
          const tot = uploaded + e.loaded;
          updateItem(idx, { progress: Math.round(tot / file.size * 100), speed: formatBytes(tot / ((Date.now() - t0) / 1000)) + '/s' });
        };
        x.onload = () => {
          if (x.status < 300) { uploaded += chunk.size; res(x.getResponseHeader('ETag') || ''); }
          else rej(new Error(`Part ${i + 1}`));
        };
        x.onerror = () => rej(new Error(`Net part ${i + 1}`));
        x.send(chunk);
      });
      parts.push({ PartNumber: i + 1, ETag: etag });
    }

    const comp = await fetch(`${API_BASE}/complete-multipart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, uploadId, parts }),
    });
    if (!comp.ok) throw new Error('complete-multipart failed');
  };

  const startUpload = async () => {
    if (!uploadItems.length) return;
    setIsUploading(true);
    await Promise.all(uploadItems.map(async (item, i) => {
      try {
        updateItem(i, { status: 'uploading' });
        if (isLargeFile(item.file.size)) await uploadMultipart(item.file, i);
        else await uploadRegular(item.file, i);
        updateItem(i, { status: 'done', progress: 100 });
      } catch (e) {
        updateItem(i, { status: 'error', error: e instanceof Error ? e.message : 'Error' });
      }
    }));
    setIsUploading(false);
    onDone();
  };

  return { uploadItems, isUploading, handleFiles, startUpload, setUploadItems };
}