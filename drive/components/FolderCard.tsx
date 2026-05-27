import { FOLDER_FILLS, FOLDER_STROKES, FOLDER_TEXT_COLORS } from '../constants';

export function FolderCard({ name, index, onClick }: { name: string; index: number; onClick: () => void }) {
  const fill = FOLDER_FILLS[index % FOLDER_FILLS.length];
  const stroke = FOLDER_STROKES[index % FOLDER_STROKES.length];
  const textColor = FOLDER_TEXT_COLORS[index % FOLDER_TEXT_COLORS.length];
  const label = name.length > 16 ? name.slice(0, 15) + '…' : name;
  return (
    <button onClick={onClick} className="hover:opacity-75 transition-opacity cursor-pointer bg-transparent border-0 p-0 w-full">
      <svg width="100%" viewBox="0 0 110 82" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="9" width="106" height="71" rx="7" fill={stroke}/>
        <path d="M5 9 Q5 6 8 6 L36 6 Q41 6 43 9 L43 15 L5 15 Z" fill={stroke}/>
        <rect x="0" y="15" width="108" height="65" rx="7" fill={fill} stroke={stroke} strokeWidth="0.8"/>
        <text x="54" y="54" textAnchor="middle" fontSize="10" fill={textColor} fontWeight="400"
          fontFamily="Georgia, serif" letterSpacing="0.4">{label}</text>
      </svg>
    </button>
  );
}