'use client';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { API_BASE, CHUNK_SIZE } from '@drive/constants';
import { UploadItem } from '@drive/types';
import { formatBytes, isLargeFile } from '@drive/utils';

export function useUploader(currentFolder: string) {
  const [uploadItems, setUploadItems] = useState<UploadItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const queryClient = useQueryClient();

  const updateItem = (itemIndex: number, updates: Partial<UploadItem>) =>
    setUploadItems(prevItems => prevItems.map((item, index) => index === itemIndex ? { ...item, ...updates } : item));

  const handleFiles = (fileList: FileList) =>
    setUploadItems(Array.from(fileList).map(file => ({ file, progress: 0, speed: '', status: 'queued' })));

  const uploadRegular = async (file: File, itemIndex: number) => {
    const startTime = Date.now();
    const uploadUrlResponse = await fetch(`${API_BASE}/get-upload-url`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename: file.name, contentType: file.type || 'application/octet-stream', folder: currentFolder }),
    });
    if (!uploadUrlResponse.ok) throw new Error(`API ${uploadUrlResponse.status}`);
    const { uploadUrl } = await uploadUrlResponse.json();
    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', uploadUrl);
      xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
      xhr.upload.onprogress = (progressEvent) => {
        if (!progressEvent.lengthComputable) return;
        updateItem(itemIndex, {
          progress: Math.round(progressEvent.loaded / progressEvent.total * 100),
          speed: formatBytes(progressEvent.loaded / ((Date.now() - startTime) / 1000)) + '/s'
        });
      };
      xhr.onload = () => xhr.status < 300 ? resolve() : reject(new Error(`S3 ${xhr.status}`));
      xhr.onerror = () => reject(new Error('Network'));
      xhr.send(file);
    });
  };

  const uploadMultipart = async (file: File, itemIndex: number) => {
    const startTime = Date.now();
    const createMultipartResponse = await fetch(`${API_BASE}/create-multipart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename: file.name, contentType: file.type || 'application/octet-stream', folder: currentFolder }),
    });
    if (!createMultipartResponse.ok) throw new Error('create-multipart failed');
    const { uploadId, key } = await createMultipartResponse.json();

    const partCount = Math.ceil(file.size / CHUNK_SIZE);
    const partUrlsResponse = await fetch(`${API_BASE}/get-part-urls`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, uploadId, partCount }),
    });
    if (!partUrlsResponse.ok) throw new Error('get-part-urls failed');
    const { urls } = await partUrlsResponse.json();

    const parts: { PartNumber: number; ETag: string }[] = [];
    let totalUploaded = 0;
    for (let i = 0; i < partCount; i++) {
      const chunk = file.slice(i * CHUNK_SIZE, Math.min((i + 1) * CHUNK_SIZE, file.size));
      const etag = await new Promise<string>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', urls[i]);
        xhr.upload.onprogress = (progressEvent) => {
          if (!progressEvent.lengthComputable) return;
          const totalUploadedSoFar = totalUploaded + progressEvent.loaded;
          updateItem(itemIndex, {
            progress: Math.round(totalUploadedSoFar / file.size * 100),
            speed: formatBytes(totalUploadedSoFar / ((Date.now() - startTime) / 1000)) + '/s'
          });
        };
        xhr.onload = () => {
          if (xhr.status < 300) { totalUploaded += chunk.size; resolve(xhr.getResponseHeader('ETag') || ''); }
          else reject(new Error(`Part ${i + 1}`));
        };
        xhr.onerror = () => reject(new Error(`Network error on part ${i + 1}`));
        xhr.send(chunk);
      });
      parts.push({ PartNumber: i + 1, ETag: etag });
    }

    const completeResponse = await fetch(`${API_BASE}/complete-multipart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, uploadId, parts }),
    });
    if (!completeResponse.ok) throw new Error('complete-multipart failed');
  };

  const startUpload = async () => {
    if (!uploadItems.length) return;
    setIsUploading(true);
    await Promise.all(uploadItems.map(async (uploadItem, itemIndex) => {
      try {
        updateItem(itemIndex, { status: 'uploading' });
        if (isLargeFile(uploadItem.file.size)) await uploadMultipart(uploadItem.file, itemIndex);
        else await uploadRegular(uploadItem.file, itemIndex);
        updateItem(itemIndex, { status: 'done', progress: 100 });
      } catch (error) {
        updateItem(itemIndex, { status: 'error', error: error instanceof Error ? error.message : 'Error' });
      }
    }));
    setIsUploading(false);
    queryClient.invalidateQueries({ queryKey: ['files', currentFolder] });
  };

  return { uploadItems, isUploading, handleFiles, startUpload, setUploadItems };
}