'use client';
import { T } from '@drive/typography';
import { S3File } from '@drive/types';
import { formatBytes, formatDate, getThumbBg } from '@drive/utils';
import { FileThumbIcon } from '@components/FileThumbIcon';

export function FileList({ files, downloadingKey, onDownload }: {
  files: S3File[];
  downloadingKey: string | null;
  onDownload: (key: string) => void;
}) {
  return (
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
            <button onClick={() => onDownload(f.key)} disabled={downloadingKey === f.key}
              className="opacity-0 group-hover:opacity-100 px-3 py-1.5 border border-gray-200 text-gray-400 rounded-lg hover:bg-gray-100 transition-all disabled:opacity-40"
              style={{ fontSize: '11.5px', fontFamily: 'system-ui, sans-serif', fontWeight: 400 }}>
              {downloadingKey === f.key ? 'Getting link…' : 'Download'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}