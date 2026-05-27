'use client';
import { useState, useEffect } from 'react';
import { API_BASE } from '@drive/constants';
import { S3File, Folder } from '@drive/types';

export function useFiles() {
  const [files, setFiles] = useState<S3File[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [currentFolder, setCurrentFolder] = useState('');
  const [loadingFiles, setLoadingFiles] = useState(true);

  const fetchFiles = async (folder = '') => {
    try {
      setLoadingFiles(true);
      const url = folder
        ? `${API_BASE}/list-files?folder=${encodeURIComponent(folder)}`
        : `${API_BASE}/list-files`;
      const res = await fetch(url);
      const data = await res.json();
      setFiles(data.files || []);
      setFolders(data.folders || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingFiles(false);
    }
  };

  useEffect(() => { fetchFiles(''); }, []);

  const navigateToFolder = (name: string) => {
    setCurrentFolder(name);
    fetchFiles(name);
  };

  return { files, folders, currentFolder, loadingFiles, fetchFiles, navigateToFolder };
}