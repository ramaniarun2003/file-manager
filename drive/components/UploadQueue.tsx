'use client';
import { UploadItem } from '../types';
import { T } from '../typography';
import { FileThumbIcon } from './FileThumbIcon';

export function UploadQueue({ items, uploading, onUpload, onClear }: {
  items: UploadItem[];
  uploading: boolean;
  onUpload: () => void;
  onClear: () => void;
}) {
  const allDone = items.every(i => i.status === 'done' || i.status === 'error');
  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden mb-6">
      <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
        <p style={T.uploadCount}>{items.length} file{items.length > 1 ? 's' : ''} selected</p>
        {allDone
          ? <button onClick={onClear} className="px-3 py-1.5 border border-gray-200 text-gray-500 rounded-lg hover:bg-gray-50" style={{ fontSize: '11.5px', fontFamily: 'system-ui, sans-serif', fontWeight: 400 }}>Clear</button>
          : <button onClick={onUpload} disabled={uploading} className="px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-40" style={{ fontSize: '11.5px', fontFamily: 'system-ui, sans-serif', fontWeight: 400 }}>
              {uploading ? 'Uploading…' : `Upload ${items.length} file${items.length > 1 ? 's' : ''}`}
            </button>
        }
      </div>
      <div className="divide-y divide-gray-50">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-3 px-5 py-3">
            <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
              <FileThumbIcon filename={item.file.name} size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p style={T.uploadFilename}>{item.file.name}</p>
              {(item.status === 'uploading' || item.status === 'done') && (
                <div className="w-full bg-gray-100 rounded-full mt-1.5" style={{ height: '2px' }}>
                  <div className={`rounded-full transition-all ${item.status === 'done' ? 'bg-green-400' : 'bg-blue-400'}`}
                    style={{ height: '2px', width: `${item.progress}%` }} />
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
  );
}