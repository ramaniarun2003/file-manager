'use client';
import { useState } from 'react';
import { API_BASE } from '@drive/constants';

export function useFolderCreator(onDone: () => void) {
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [creatingFolder, setCreatingFolder] = useState(false);

  const createFolder = async () => {
    if (!newFolderName.trim()) return;
    try {
      setCreatingFolder(true);
      const r = await fetch(`${API_BASE}/create-folder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folderName: newFolderName.trim() }),
      });
      if (!r.ok) throw new Error('Failed');
      setNewFolderName('');
      setShowNewFolder(false);
      onDone();
    } catch (e) {
      console.error(e);
    } finally {
      setCreatingFolder(false);
    }
  };

  return { showNewFolder, setShowNewFolder, newFolderName, setNewFolderName, creatingFolder, createFolder };
}