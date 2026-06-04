'use client';
import { useEffect, useRef, useState } from 'react';
import { API_BASE } from '@drive/constants';
import { T } from '@drive/typography';
import { S3File } from '@drive/types';
import { formatBytes, formatDate, getThumbBg, isPreviewable, isVideo } from '@drive/utils';
import { FileThumbIcon } from '@components/FileThumbIcon';
import { DownloadIcon } from '@components/NavIcons';

export function LazyFileCard({ f, downloadingKey, onDownload }: {
  f: S3File;
  downloadingKey: string | null;
  onDownload: (key: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [thumbUrl, setThumbUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!isPreviewable(f.filename)) return;
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      obs.disconnect();
      fetch(`${API_BASE}/get-download-url?key=${encodeURIComponent(f.key)}`)
        .then(r => r.json())
        .then(d => setThumbUrl(d.downloadUrl))
        .catch(console.error);
    }, { rootMargin: '100px' });
    obs.observe(el);
    return () => obs.disconnect();
  }, [f.key, f.filename]);

  return (
    <div ref={ref}
      className="bg-white border border-[#DCE6E4] rounded-xl overflow-hidden hover:border-[#2EA89A] transition-all group cursor-pointer"
      style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      <div className={`h-32 flex items-center justify-center relative overflow-hidden ${getThumbBg(f.filename)}`}>
        {isPreviewable(f.filename) && thumbUrl ? (
          isVideo(f.filename) ? (
            <video src={thumbUrl} className="w-full h-full object-cover" preload="metadata" muted playsInline
              onLoadedMetadata={e => { e.currentTarget.currentTime = 1; }} />
          ) : (
            <img src={thumbUrl} alt={f.filename} className="w-full h-full object-cover" />
          )
        ) : (
          <FileThumbIcon filename={f.filename} size={44} />
        )}
        <div className="absolute bottom-2 right-2 bg-black/50 rounded px-1.5 py-0.5">
          <span style={{ ...T.badge, color: 'white' }}>{formatBytes(f.size)}</span>
        </div>
      </div>
      <div className="px-3 py-2.5 border-t border-[#EAF1F0] flex items-start justify-between gap-1">
        <div className="min-w-0 flex-1">
          <p style={T.filename}>{f.filename}</p>
          <p style={T.filemeta}>{formatDate(f.lastModified)}</p>
        </div>
        <button onClick={() => onDownload(f.key)} disabled={downloadingKey === f.key}
          className="p-1.5 text-[#1D8276] hover:bg-[#E4EEEC] rounded-lg transition-all flex-shrink-0 mt-0.5 disabled:opacity-40"
          aria-label="Download">
          <DownloadIcon />
        </button>
      </div>
    </div>
  );
}