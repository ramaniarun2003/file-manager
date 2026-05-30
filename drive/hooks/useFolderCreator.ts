'use client';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { API_BASE } from '@drive/constants';

export function useFolderCreator(currentFolder: string) {
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [creatingFolder, setCreatingFolder] = useState(false);
  const queryClient = useQueryClient();

  const createFolder = async () => {
    if (!newFolderName.trim()) return;
    try {
      setCreatingFolder(true);
      const createFolderResponse = await fetch(`${API_BASE}/create-folder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folderName: newFolderName.trim() }),
      });
      if (!createFolderResponse.ok) throw new Error('Failed to create folder');
      setNewFolderName('');
      setShowNewFolder(false);
      queryClient.invalidateQueries({ queryKey: ['files', currentFolder] });
    } catch (error) {
      console.error(error);
    } finally {
      setCreatingFolder(false);
    }
  };

  return { showNewFolder, setShowNewFolder, newFolderName, setNewFolderName, creatingFolder, createFolder };
}