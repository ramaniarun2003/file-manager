'use client';
import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { T } from '@drive/typography';
import { FolderCard } from '@components/FolderCard';
import { Sidebar } from '@components/Sidebar';
import { NewFolderModal } from '@components/NewFolderModal';
import { UploadQueue } from '@components/UploadQueue';
import { DropZone } from '@components/DropZone';
import { FileGrid } from '@components/FileGrid';
import { FileList } from '@components/FileList';
import { UploadIcon, ListViewIcon, GridViewIcon, MenuIcon } from '@components/NavIcons';
import { useFiles } from '@drive/hooks/useFiles';
import { useUploader } from '@drive/hooks/useUploader';
import { useDownloader } from '@drive/hooks/useDownloader';
import { useFolderCreator } from '@drive/hooks/useFolderCreator';

export default function FileManager() {
  const [isDragging, setIsDragging] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { files, folders, currentFolder, loadingFiles, navigateToFolder } = useFiles();
const { uploadItems, isUploading, handleFiles, startUpload, setUploadItems } = useUploader(currentFolder);  const { downloadingKey, handleDownload } = useDownloader();
  const { showNewFolder, setShowNewFolder, newFolderName, setNewFolderName, creatingFolder, createFolder } = useFolderCreator(currentFolder);

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
  };

  const dragProps = {
    onDragOver: (e: DragEvent) => { e.preventDefault(); setIsDragging(true); },
    onDragLeave: () => setIsDragging(false),
    onDrop: handleDrop,
  };

  const navigate = (name: string) => { navigateToFolder(name); setUploadItems([]); };

  return (
    <main className="min-h-screen bg-white flex" style={{ color: '#222', fontFamily: 'system-ui, sans-serif' }}>

      <Sidebar
        folders={folders}
        currentFolder={currentFolder}
        onNavigate={navigate}
        onNewFolder={() => setShowNewFolder(true)}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 md:ml-56 flex flex-col min-h-screen">
        <header className="flex items-center justify-between md:justify-end px-4 md:px-8 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden text-gray-500 p-1">
            <MenuIcon />
          </button>
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 select-none"
            style={{ fontSize: '12px', fontWeight: 500, fontFamily: 'system-ui, sans-serif', letterSpacing: '0.05em' }}>
            A
          </div>
        </header>

        <div className="flex-1 px-4 md:px-8 py-6 md:py-8">
          <h1 style={{ ...T.pageTitle, marginBottom: '32px' }}>
            {currentFolder || 'Welcome, Arun'}
          </h1>

          {showNewFolder && (
            <NewFolderModal
              value={newFolderName}
              creating={creatingFolder}
              onChange={setNewFolderName}
              onCreate={createFolder}
              onCancel={() => { setShowNewFolder(false); setNewFolderName(''); }}
            />
          )}

          {uploadItems.length > 0 && (
            <UploadQueue
              items={uploadItems}
              uploading={isUploading}
              onUpload={startUpload}
              onClear={() => setUploadItems([])}
            />
          )}

          {folders.length > 0 && (
            <section className="mb-8">
              <p style={{ ...T.sectionLabel, marginBottom: '14px' }}>Folders</p>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3">
                {folders.map((f, i) => (
                  <FolderCard key={f.key} name={f.name} index={i} onClick={() => navigate(f.name)} />
                ))}
              </div>
            </section>
          )}

          <section>
            {(files.length > 0 || !loadingFiles) && (
              <div className="flex items-center justify-between mb-4">
                <p style={T.sectionLabel}>Files</p>
                <div className="flex items-center gap-3">
                  <button onClick={() => inputRef.current?.click()}
                    className="text-blue-400 hover:text-blue-500 flex items-center gap-1 transition-colors"
                    style={T.actionLink}>
                    <UploadIcon /> Upload
                  </button>
                  <button onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded transition-colors ${viewMode === 'list' ? 'text-gray-700' : 'text-gray-300 hover:text-gray-500'}`}>
                    <ListViewIcon />
                  </button>
                  <button onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded transition-colors ${viewMode === 'grid' ? 'text-gray-700' : 'text-gray-300 hover:text-gray-500'}`}>
                    <GridViewIcon />
                  </button>
                </div>
              </div>
            )}

            {loadingFiles ? (
              <p style={{ ...T.listMeta, textAlign: 'center', padding: '64px 0' }}>Loading…</p>
            ) : files.length === 0 && folders.length === 0 ? (
              <DropZone isDragging={isDragging} {...dragProps} onClick={() => inputRef.current?.click()} />
            ) : viewMode === 'grid' ? (
              <FileGrid
                files={files}
                downloadingKey={downloadingKey}
                isDragging={isDragging}
                onDownload={handleDownload}
                onUploadClick={() => inputRef.current?.click()}
                {...dragProps}
              />
            ) : (
              <FileList files={files} downloadingKey={downloadingKey} onDownload={handleDownload} />
            )}
          </section>
        </div>
      </div>

      <input ref={inputRef} type="file" multiple className="hidden"
        onChange={(e: ChangeEvent<HTMLInputElement>) => { if (e.target.files?.length) handleFiles(e.target.files); }} />
    </main>
  );
}