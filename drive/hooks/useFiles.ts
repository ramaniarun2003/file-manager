'use client';
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { API_BASE } from '@drive/constants';
import { S3File, Folder } from '@drive/types';

const fetchFiles = async (folder = '') => {
  const url = folder
    ? `${API_BASE}/list-files?folder=${encodeURIComponent(folder)}`
    : `${API_BASE}/list-files`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch files');
  return res.json();
};

export function useFiles() {
  const [currentFolder, setCurrentFolder] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['files', currentFolder],
    queryFn: () => fetchFiles(currentFolder),
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });

  const navigateToFolder = (name: string) => {
    setCurrentFolder(name);
  };

  const refetch = () => {
    queryClient.invalidateQueries({ queryKey: ['files', currentFolder] });
  };

  return {
    files: (data?.files ?? []) as S3File[],
    folders: (data?.folders ?? []) as Folder[],
    currentFolder,
    loadingFiles: isLoading,
    fetchFiles: refetch,
    navigateToFolder,
  };
}