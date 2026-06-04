'use client';

const chip = 'w-[22px] h-[22px]';

function CakeIcon() {
  return (
    <svg className={chip} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 21h16M5 21v-7a2 2 0 012-2h10a2 2 0 012 2v7M3 12h18M12 8.5V5m0 0l-1.5 1M12 5l1.5 1" />
    </svg>
  );
}
function SunIcon() {
  return (
    <svg className={chip} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v2m0 14v2m9-9h-2M5 12H3m14.36-6.36l-1.42 1.42M6.34 17.66l-1.42 1.42m0-13.5l1.42 1.42m11.32 11.32l1.42 1.42M12 8a4 4 0 100 8 4 4 0 000-8z" />
    </svg>
  );
}
function BuildingIcon() {
  return (
    <svg className={chip} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 21V5a1 1 0 011-1h6a1 1 0 011 1v16M12 21V9a1 1 0 011-1h6a1 1 0 011 1v12M3 21h18M7 8h2M7 12h2M7 16h2M15 12h2M15 16h2" />
    </svg>
  );
}
function MountainIcon() {
  return (
    <svg className={chip} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 19l5.5-11 3 5.5L15 7l6 12H3z" />
    </svg>
  );
}
function PlaneIcon() {
  return (
    <svg className={chip} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
    </svg>
  );
}
function PlainFolderIcon() {
  return (
    <svg className={chip} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
    </svg>
  );
}

function pickFolderIcon(name: string) {
  const n = name.toLowerCase();
  if (n.includes('birthday') || n.includes('bday')) return CakeIcon;
  if (n.includes('california') || n.includes('beach')) return SunIcon;
  if (n.includes('chicago') || n.includes('city')) return BuildingIcon;
  if (n.includes('duluth') || n.includes('mountain') || n.includes('hike')) return MountainIcon;
  if (n.includes('india') || n.includes('trip') || n.includes('travel')) return PlaneIcon;
  return PlainFolderIcon;
}

export function FolderCard({ name, count, index, onClick }: { name: string; count?: number; index: number; onClick: () => void }) {
  const Icon = pickFolderIcon(name);
  return (
    <button
      onClick={onClick}
      className="group flex flex-col items-center gap-2.5 w-full px-2.5 py-4 bg-white border border-[#DCE6E4] rounded-2xl hover:border-[#2EA89A] hover:-translate-y-0.5 transition-all"
    >
      <span className="w-11 h-11 rounded-xl bg-[#E4EEEC] flex items-center justify-center text-[#1D8276] group-hover:[filter:drop-shadow(0_0_5px_#2EA89A)] transition-[filter] duration-150">
        <Icon />
      </span>
      <span
        className="text-center text-[#1C2B2B] leading-tight line-clamp-2"
        style={{ fontFamily: 'Georgia, serif', fontSize: '12.5px', fontWeight: 400 }}
      >
        {name}
      </span>
      {count != null && (
        <span style={{ fontSize: '10.5px', color: '#A3B8B5' }}>{count} files</span>
      )}
    </button>
  );
}