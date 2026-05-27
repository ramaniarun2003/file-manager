import React from 'react';
import VideoIcon from '../assets/icons/video.svg';
import AudioIcon from '../assets/icons/audio.svg';
import ImageIcon from '../assets/icons/image.svg';
import PdfIcon from '../assets/icons/pdf.svg';
import SpreadsheetIcon from '../assets/icons/spreadsheet.svg';
import DocumentIcon from '../assets/icons/document.svg';
import FileIcon from '../assets/icons/file.svg';

type SvgComponent = React.FC<React.SVGProps<SVGSVGElement>>;

const EXT_MAP: Record<string, SvgComponent> = {
  mp4: VideoIcon as SvgComponent, mov: VideoIcon as SvgComponent, avi: VideoIcon as SvgComponent,
  mkv: VideoIcon as SvgComponent, webm: VideoIcon as SvgComponent,
  mp3: AudioIcon as SvgComponent, wav: AudioIcon as SvgComponent, ogg: AudioIcon as SvgComponent,
  aac: AudioIcon as SvgComponent, m4a: AudioIcon as SvgComponent,
  jpg: ImageIcon as SvgComponent, jpeg: ImageIcon as SvgComponent, png: ImageIcon as SvgComponent,
  gif: ImageIcon as SvgComponent, webp: ImageIcon as SvgComponent, heic: ImageIcon as SvgComponent,
  pdf: PdfIcon as SvgComponent,
  xlsx: SpreadsheetIcon as SvgComponent, xls: SpreadsheetIcon as SvgComponent, csv: SpreadsheetIcon as SvgComponent,
  docx: DocumentIcon as SvgComponent, doc: DocumentIcon as SvgComponent,
};

export function FileThumbIcon({ filename, size = 48 }: { filename: string; size?: number }) {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  const Icon = EXT_MAP[ext] || (FileIcon as SvgComponent);
  return <Icon width={size} height={size} />;
}