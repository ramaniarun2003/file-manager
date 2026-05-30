'use client';
import { Folder } from '@drive/types';
import { T } from '@drive/typography';
import { FOLDER_STROKES } from '@drive/constants';
import { CloudIcon, HomeIcon, DriveIcon, NewFolderIcon, FolderSidebarIcon } from '@components/NavIcons';

export function Sidebar({ folders, currentFolder, onNavigate, onNewFolder, isOpen, onClose }: {
  folders: Folder[];
  currentFolder: string;
  onNavigate: (name: string) => void;
  onNewFolder: () => void;
  isOpen: boolean;
  onClose: () => void;
}) {
  const handleNav = (name: string) => { onNavigate(name); onClose(); };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 bg-black/30 z-30" onClick={onClose} />
      )}

      <aside className={`w-56 bg-white border-r border-gray-100 flex flex-col fixed inset-y-0 left-0 py-6 px-3 z-40 transition-transform md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="flex items-center gap-2.5 px-3 mb-8">
          <CloudIcon />
          <span style={T.brand}>Arun's drive</span>
        </div>

        <button onClick={() => { onNewFolder(); onClose(); }}
          className="flex items-center gap-2 mx-2 mb-6 px-4 py-2 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-all"
          style={T.sidebarAction}>
          <NewFolderIcon />
          New folder
        </button>

        <button onClick={() => handleNav('')}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg w-full text-left mb-0.5 transition-colors ${currentFolder === '' ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:bg-gray-50'}`}
          style={T.navItem}>
          <HomeIcon />
          Home
        </button>

        <button onClick={() => handleNav('')}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:bg-gray-50 w-full text-left mb-5 transition-colors"
          style={T.navItem}>
          <DriveIcon />
          My Drive
        </button>

        {folders.length > 0 && (
          <div className="flex flex-col gap-0.5 overflow-y-auto">
            {folders.map((f, i) => (
              <button key={f.key} onClick={() => handleNav(f.name)}
                className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg w-full text-left transition-colors ${currentFolder === f.name ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:bg-gray-50'}`}
                style={T.navItem}>
                <FolderSidebarIcon color={FOLDER_STROKES[i % FOLDER_STROKES.length]} />
                <span className="truncate">{f.name}</span>
              </button>
            ))}
          </div>
        )}
      </aside>
    </>
  );
}