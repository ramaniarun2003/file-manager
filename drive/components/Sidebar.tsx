'use client';
import { Folder } from '@drive/types';
import { T } from '@drive/typography';
import { CloudIcon, HomeIcon, DriveIcon, NewFolderIcon, FolderSidebarIcon } from '@components/NavIcons';

function CollapseIcon({ collapsed }: { collapsed: boolean }) {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
      style={{ transform: collapsed ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
    </svg>
  );
}

export function Sidebar({ folders, currentFolder, onNavigate, onNewFolder, isOpen, onClose, collapsed, onToggleCollapse }: {
  folders: Folder[];
  currentFolder: string;
  onNavigate: (name: string) => void;
  onNewFolder: () => void;
  isOpen: boolean;
  onClose: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}) {
  const handleNav = (name: string) => { onNavigate(name); onClose(); };
  const hide = collapsed ? 'md:hidden' : '';
  const center = collapsed ? 'md:justify-center' : '';

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 bg-black/40 z-30" onClick={onClose} />
      )}

      <aside className={`w-56 ${collapsed ? 'md:w-16' : 'md:w-56'} bg-[#1C2B2B] flex flex-col fixed inset-y-0 left-0 py-6 px-3 z-40 transition-all md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        {/* Header — cloud logo doubles as expand toggle when collapsed */}
        <div className={`flex items-center gap-2.5 px-3 pb-4 mb-3 border-b border-[#2A3D3D] ${collapsed ? 'md:justify-center md:px-0' : ''}`}>
          <button
            onClick={onToggleCollapse}
            className={`text-[#2EA89A] hover:text-[#3FBFA9] transition-colors ${collapsed ? 'md:cursor-pointer' : 'md:cursor-default md:pointer-events-none'}`}
            aria-label={collapsed ? 'Expand sidebar' : "Arun's drive"}>
            <CloudIcon />
          </button>
          <span style={T.brand} className={`text-[#EAF0EF] ${hide}`}>Arun's drive</span>
          <button onClick={onToggleCollapse}
            className={`hidden md:flex ml-auto text-[#7B9491] hover:text-[#EAF0EF] transition-colors ${hide}`}
            aria-label="Collapse sidebar">
            <CollapseIcon collapsed={collapsed} />
          </button>
        </div>

        {/* New folder */}
        <button onClick={() => { onNewFolder(); onClose(); }}
          className={`flex items-center gap-2 mx-2 mb-6 px-4 py-2 border border-[#2A3D3D] rounded-xl text-[#7B9491] hover:bg-white/[0.04] hover:text-[#EAF0EF] transition-all ${collapsed ? 'md:justify-center md:px-0 md:mx-0' : ''}`}
          style={T.sidebarAction} aria-label="New folder">
          <NewFolderIcon />
          <span className={hide}>New folder</span>
        </button>

        {/* Home */}
        <button onClick={() => handleNav('')}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg w-full text-left mb-0.5 border-r-2 transition-colors ${center} ${
            currentFolder === ''
              ? 'bg-[#2EA89A]/10 text-[#2EA89A] border-[#2EA89A]'
              : 'text-[#7B9491] border-transparent hover:bg-white/[0.04] hover:text-[#EAF0EF]'
          }`}
          style={T.navItem} title={collapsed ? 'Home' : undefined}>
          <HomeIcon />
          <span className={hide}>Home</span>
        </button>

        {/* My Drive */}
        <button onClick={() => handleNav('')}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-[#7B9491] border-r-2 border-transparent hover:bg-white/[0.04] hover:text-[#EAF0EF] w-full text-left mb-5 transition-colors ${center}`}
          style={T.navItem} title={collapsed ? 'My Drive' : undefined}>
          <DriveIcon />
          <span className={hide}>My Drive</span>
        </button>

        {/* Folders */}
        {folders.length > 0 && (
          <>
            <div className={`px-3 pb-1.5 text-[10px] tracking-[1.2px] uppercase text-[#4A6360] font-sans ${hide}`}>
              Folders
            </div>
            <div className="flex flex-col gap-0.5 overflow-y-auto">
              {folders.map((f) => (
                <button key={f.key} onClick={() => handleNav(f.name)}
                  className={`group flex items-center gap-2.5 px-3 py-1.5 rounded-lg w-full text-left border-r-2 transition-colors ${center} ${
                    currentFolder === f.name
                      ? 'bg-[#2EA89A]/10 text-[#2EA89A] border-[#2EA89A]'
                      : 'text-[#7B9491] border-transparent hover:bg-white/[0.04] hover:text-[#EAF0EF]'
                  }`}
                  style={T.navItem} title={collapsed ? f.name : undefined}>
                  <span className="text-[#7B9491] group-hover:text-[#2EA89A] group-hover:[filter:drop-shadow(0_0_5px_#2EA89A)] transition-[filter,color] duration-150">
                    <FolderSidebarIcon name={f.name} />
                  </span>
                  <span className={`truncate ${hide}`}>{f.name}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </aside>
    </>
  );
}