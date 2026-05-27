'use client';
import { T } from '../typography';

export function NewFolderModal({ value, creating, onChange, onCreate, onCancel }: {
  value: string;
  creating: boolean;
  onChange: (v: string) => void;
  onCreate: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 max-w-sm" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
      <p style={{ ...T.modalTitle, marginBottom: '4px' }}>New folder</p>
      <p style={{ ...T.modalSub, marginBottom: '16px' }}>Give your folder a name</p>
      <input autoFocus type="text" placeholder="e.g. Vacation 2026" value={value}
        onChange={e => onChange(e.target.value)} onKeyDown={e => e.key === 'Enter' && onCreate()}
        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl mb-4 outline-none focus:border-blue-300"
        style={{ fontSize: '13px', fontFamily: 'system-ui, sans-serif', fontWeight: 400, color: '#222' }} />
      <div className="flex gap-3 justify-end">
        <button onClick={onCancel}
          className="px-4 py-2 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50"
          style={{ fontSize: '12.5px', fontFamily: 'system-ui, sans-serif', fontWeight: 400 }}>
          Cancel
        </button>
        <button onClick={onCreate} disabled={creating || !value.trim()}
          className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-40 transition-colors"
          style={{ fontSize: '12.5px', fontFamily: 'system-ui, sans-serif', fontWeight: 400 }}>
          {creating ? 'Creating…' : 'Create'}
        </button>
      </div>
    </div>
  );
}