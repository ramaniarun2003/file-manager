'use client';
import { DragEvent } from 'react';
import { S3File } from '@drive/types';
import { LazyFileCard } from '@components/LazyFileCard';
import { DropZone } from '@components/DropZone';

export function FileGrid({ files, downloadingKey, isDragging, onDownload, onDragOver, onDragLeave, onDrop, onUploadClick }: {
  files: S3File[];
  downloadingKey: string | null;
  isDragging: boolean;
  onDownload: (key: string) => void;
  onDragOver: (e: DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: DragEvent) => void;
  onUploadClick: () => void;
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 items-start">
      {files.map(f => (
        <LazyFileCard key={f.key} f={f} downloadingKey={downloadingKey} onDownload={onDownload} />
      ))}
      <DropZone compact isDragging={isDragging} onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop} onClick={onUploadClick} />
    </div>
  );
}