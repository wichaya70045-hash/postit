'use client';

import React from 'react';
import { Note } from '@/types/note';
import { SvgStrokes } from './SvgStrokes';
import { HeartHandshake } from 'lucide-react';

interface PostitNoteProps {
  note: Note;
  onClick?: () => void;
  isAbsolute?: boolean;
  zIndex?: number;
  onDragStart?: (e: React.DragEvent) => void;
  className?: string;
  isFalling?: boolean;
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diffSec < 60) return 'เมื่อสักครู่';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} น. ที่แล้ว`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} ชม. ที่แล้ว`;
  return `${Math.floor(diffSec / 86400)} วันที่แล้ว`;
}

export const PostitNote: React.FC<PostitNoteProps> = ({
  note,
  onClick,
  isAbsolute = false,
  zIndex,
  onDragStart,
  className = '',
  isFalling = false,
}) => {
  const totalReactions =
    (note.reaction_counts?.heart || 0) +
    (note.reaction_counts?.hug || 0) +
    (note.reaction_counts?.sparkle || 0) +
    (note.reaction_counts?.cheer || 0) +
    (note.reaction_counts?.idea || 0);

  const textLength = note.body ? note.body.length : 0;
  let textSizeClass = 'text-base leading-relaxed';
  if (textLength > 180) {
    textSizeClass = 'text-xs leading-normal';
  } else if (textLength > 90) {
    textSizeClass = 'text-sm leading-relaxed';
  } else if (textLength < 40) {
    textSizeClass = 'text-lg font-medium leading-relaxed';
  }

  const noteColor = note.color || '#fef08a';

  const absoluteStyle: React.CSSProperties = isAbsolute
    ? {
        position: 'absolute',
        left: `${note.posX}%`,
        top: `${note.posY}%`,
        transform: `rotate(${note.rotation}deg)`,
        backgroundColor: noteColor,
        zIndex: zIndex ?? 10,
      }
    : {
        transform: `rotate(${note.rotation}deg)`,
        backgroundColor: noteColor,
      };

  return (
    <div
      onClick={isFalling ? undefined : onClick}
      draggable={Boolean(onDragStart && !isFalling)}
      onDragStart={isFalling ? undefined : onDragStart}
      role="button"
      tabIndex={0}
      style={absoluteStyle}
      className={`group cursor-pointer transition-all duration-200 active:scale-95 hover:scale-[1.03] hover:!z-50 rounded-md p-3.5 postit-shadow flex flex-col justify-between aspect-square select-none overflow-hidden border border-black/10 ${
        isAbsolute ? 'w-[180px] sm:w-[210px] md:w-[230px]' : 'w-full'
      } ${isFalling ? 'animate-paper-fall' : ''} ${className}`}
    >
      {/* Decorative Washi Tape on top */}
      <div
        className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-12 sm:w-14 h-3 sm:h-3.5 backdrop-blur-[1px] rotate-[-2deg] rounded-xs shadow-xs pointer-events-none opacity-85"
        style={{ backgroundColor: 'rgba(255, 255, 255, 0.45)' }}
      />

      {/* Header: Relative Time */}
      <div className="flex items-center justify-end text-[10px] text-stone-700/80 mb-1 z-10 font-sans">
        <span className="tracking-tight">{formatRelativeTime(note.created_at)}</span>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center overflow-hidden my-1">
        {note.kind === 'text' ? (
          <p
            className={`postit-handwriting text-stone-900 text-center break-words w-full line-clamp-6 ${textSizeClass}`}
          >
            {note.body}
          </p>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center">
            <SvgStrokes strokes={note.strokes || []} />
            {note.caption && (
              <p className="text-[11px] text-stone-800 postit-handwriting truncate w-full text-center mt-1">
                {note.caption}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Crisis help banner if flagged */}
      {note.risk_flag && (
        <div className="bg-amber-100/95 border border-amber-300 text-amber-900 rounded px-1.5 py-0.5 text-[10px] flex items-center justify-center gap-1 mb-1 font-medium font-sans">
          <HeartHandshake className="w-3 h-3 text-amber-700 shrink-0" />
          <span>มีคนพร้อมรับฟังเสมอ (1323)</span>
        </div>
      )}

      {/* Footer: Reactions summary */}
      <div className="flex items-center justify-between pt-1 border-t border-black/10 text-stone-800 text-xs font-sans">
        <div className="flex items-center gap-1 flex-wrap">
          {note.reaction_counts?.heart > 0 && (
            <span className="flex items-center text-[10px] bg-white/60 px-1 py-0.2 rounded-full font-medium">
              🤍 {note.reaction_counts.heart}
            </span>
          )}
          {note.reaction_counts?.hug > 0 && (
            <span className="flex items-center text-[10px] bg-white/60 px-1 py-0.2 rounded-full font-medium">
              🫂 {note.reaction_counts.hug}
            </span>
          )}
          {note.reaction_counts?.sparkle > 0 && (
            <span className="flex items-center text-[10px] bg-white/60 px-1 py-0.2 rounded-full font-medium">
              ✨ {note.reaction_counts.sparkle}
            </span>
          )}
          {note.reaction_counts?.cheer > 0 && (
            <span className="flex items-center text-[10px] bg-white/60 px-1 py-0.2 rounded-full font-medium">
              ✌️ {note.reaction_counts.cheer}
            </span>
          )}
          {note.reaction_counts?.idea > 0 && (
            <span className="flex items-center text-[10px] bg-white/60 px-1 py-0.2 rounded-full font-medium">
              💡 {note.reaction_counts.idea}
            </span>
          )}
        </div>
        {totalReactions === 0 && (
          <span className="text-[10px] text-stone-600/70 italic">แตะเพื่อส่งใจ</span>
        )}
      </div>
    </div>
  );
};
