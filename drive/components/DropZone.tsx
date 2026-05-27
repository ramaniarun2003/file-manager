'use client';
import { DragEvent } from 'react';
import { T } from '@drive/typography';
import { EmptyUploadIcon } from '@components/NavIcons';

export function DropZone({ isDragging, onDragOver, onDragLeave, onDrop, onClick, compact = false }: {
  isDragging: boolean;
  onDragOver: (e: DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: DragEvent) => void;
  onClick: () => void;
  compact?: boolean;
}) {
  const base = `border border-dashed rounded-xl cursor-pointer transition-colors flex flex-col items-center justify-center gap-2 ${isDragging ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`;
  return compact ? (
    <div onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop} onClick={onClick}
      className={base} style={{ minHeight: '148px' }}>
      <EmptyUploadIcon size={6} />
      <p style={{ ...T.listMeta, color: '#d0d0d0', textAlign: 'center' }}>Drop or click</p>
    </div>
  ) : (
    <div onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop} onClick={onClick}
      className={`${base} rounded-2xl p-16`}>
      <EmptyUploadIcon size={10} />
      <p style={{ ...T.listMeta, color: '#c0c0c0' }}>Drop files here or click to upload</p>
    </div>
  );
}