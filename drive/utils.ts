export function formatBytes(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1048576) return `${(b / 1024).toFixed(1)} KB`;
  if (b < 1073741824) return `${(b / 1048576).toFixed(1)} MB`;
  return `${(b / 1073741824).toFixed(2)} GB`;
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function getThumbBg(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext)) return 'bg-gray-900';
  if (['mp3', 'wav', 'ogg', 'aac', 'm4a'].includes(ext)) return 'bg-purple-950';
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic'].includes(ext)) return 'bg-blue-50';
  if (ext === 'pdf') return 'bg-red-50';
  if (['xlsx', 'xls', 'csv'].includes(ext)) return 'bg-green-50';
  if (['docx', 'doc'].includes(ext)) return 'bg-blue-50';
  return 'bg-gray-100';
}

export function isPreviewable(filename: string): boolean {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'mov', 'webm'].includes(ext);
}

export function isVideo(filename: string): boolean {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  return ['mp4', 'mov', 'webm'].includes(ext);
}

export function isLargeFile(size: number) { return size > 10 * 1024 * 1024; }