export interface S3File { key: string; filename: string; size: number; lastModified: string; }
export interface Folder { key: string; name: string; }
export interface UploadItem { file: File; progress: number; speed: string; status: 'queued' | 'uploading' | 'done' | 'error'; error?: string; }