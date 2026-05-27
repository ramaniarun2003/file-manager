'use client';
import { useState } from 'react';
import { API_BASE } from '@drive/constants';

export function useDownloader() {
  const [downloadingKey, setDownloadingKey] = useState<string | null>(null);

  const handleDownload = async (key: string) => {
    try {
      setDownloadingKey(key);
      const w = window.open('', '_blank');
      const r = await fetch(`${API_BASE}/get-download-url?key=${encodeURIComponent(key)}`);
      const d = await r.json();
      if (w) w.location.href = d.downloadUrl;
    } catch (e) {
      console.error(e);
    } finally {
      setDownloadingKey(null);
    }
  };

  return { downloadingKey, handleDownload };
}