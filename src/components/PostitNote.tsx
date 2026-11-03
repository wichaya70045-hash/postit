'use client';

import React from 'react';
import { Note } from '@/types/note';
import { SvgStrokes } from './SvgStrokes';
import { HeartHandshake, Trash2 } from 'lucide-react';

interface PostitNoteProps {
  note: Note;
  onClick?: () => void;
  isAbsolute?: boolean;
  zIndex?: number;
  onDragStart?: (e: React.DragEvent) => void;
  className?: string;
  isFalling?: boolean;
  isAdmin?: boolean;
  onAdminDelete?: (id: string) => void;
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
  isAdmin = false,
  onAdminDelete,
}) => {
  const totalReactions =
    (note.reaction_counts?.heart || 0) +
    (note.reaction_counts?.hug || 0) +
    (note.reaction_counts?.sparkle || 0) +
    (note.reaction_counts?.cheer || 0) +
    (note.reaction_counts?.idea || 0);

  const textLength = note.body ? note.body.length : 0;
  let textSizeClass = 'text-[11px] sm:text-xs md:text-sm leading-snug sm:leading-relaxed';
  if (textLength > 180) {
    textSizeClass = 'text-[9px] sm:text-[10px] md:text-xs leading-tight sm:leading-normal';
  } else if (textLength > 90) {
    textSizeClass = 'text-[10px] sm:text-xs md:text-sm leading-snug sm:leading-relaxed';
  } else if (textLength < 40) {
    textSizeClass = 'text-xs sm:text-sm md:text-base font-medium leading-snug sm:leading-relaxed';
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
      className={`group cursor-pointer transition-all duration-200 active:scale-95 hover:scale-[1.03] hover:!z-50 rounded-md p-2 sm:p-3 md:p-3.5 postit-shadow flex flex-col justify-between aspect-square select-none overflow-hidden border border-black/10 ${
        isAbsolute ? 'w-[122px] xs:w-[138px] sm:w-[175px] md:w-[210px]' : 'w-full'
      } ${isFalling ? 'animate-paper-fall' : ''} ${className}`}
    >
      {/* Decorative Washi Tape on top */}
      <div
        className="absolute -top-1 sm:-top-1.5 left-1/2 -translate-x-1/2 w-8 sm:w-12 md:w-14 h-2 sm:h-3 backdrop-blur-[1px] rotate-[-2deg] rounded-xs shadow-xs pointer-events-none opacity-85"
        style={{ backgroundColor: 'rgba(255, 255, 255, 0.45)' }}
      />

      {/* Admin Quick Delete Button */}
      {isAdmin && onAdminDelete && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (window.confirm('คุณเป็นครูเวร (Admin): ต้องการลบโพสต์อิทแผ่นนี้ใช่หรือไม่?')) {
              onAdminDelete(note.id);
            }
          }}
          className="absolute top-1 left-1 z-30 p-1 sm:p-1.5 bg-rose-600/90 hover:bg-rose-600 text-white rounded-md shadow-md active:scale-90 transition-all opacity-85 group-hover:opacity-100"
          title="ลบโพสต์นี้ (Admin)"
          aria-label="ลบโพสต์แผ่นนี้"
        >
          <Trash2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
        </button>
      )}

      {/* Header: Relative Time */}
      <div className="flex items-center justify-end text-[8px] sm:text-[10px] text-stone-700/80 mb-0.5 sm:mb-1 z-10 font-sans">
        <span className="tracking-tight">{formatRelativeTime(note.created_at)}</span>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center overflow-hidden my-0.5 sm:my-1">
        {note.kind === 'text' ? (
          <p
            className={`postit-handwriting text-stone-900 text-center break-words w-full line-clamp-5 sm:line-clamp-6 ${textSizeClass}`}
          >
            {note.body}
          </p>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center">
            <SvgStrokes strokes={note.strokes || []} />
            {note.caption && (
              <p className="text-[9px] sm:text-[11px] text-stone-800 postit-handwriting truncate w-full text-center mt-0.5 sm:mt-1">
                {note.caption}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Crisis help banner if flagged */}
      {note.risk_flag && (
        <div className="bg-amber-100/95 border border-amber-300 text-amber-900 rounded px-1 py-0.2 sm:px-1.5 sm:py-0.5 text-[8px] sm:text-[10px] flex items-center justify-center gap-1 mb-0.5 sm:mb-1 font-medium font-sans">
          <HeartHandshake className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-700 shrink-0" />
          <span className="truncate">โทร 1323 ได้เสมอ</span>
        </div>
      )}

      {/* Footer: Reactions summary */}
      <div className="flex items-center justify-between pt-0.5 sm:pt-1 border-t border-black/10 text-stone-800 text-[9px] sm:text-xs font-sans">
        <div className="flex items-center gap-0.5 sm:gap-1 flex-wrap">
          {note.reaction_counts?.heart > 0 && (
            <span className="flex items-center text-[8px] sm:text-[10px] bg-white/60 px-1 py-0.2 rounded-full font-medium">
              🤍 {note.reaction_counts.heart}
            </span>
          )}
          {note.reaction_counts?.hug > 0 && (
            <span className="flex items-center text-[8px] sm:text-[10px] bg-white/60 px-1 py-0.2 rounded-full font-medium">
              🫂 {note.reaction_counts.hug}
            </span>
          )}
          {note.reaction_counts?.sparkle > 0 && (
            <span className="flex items-center text-[8px] sm:text-[10px] bg-white/60 px-1 py-0.2 rounded-full font-medium">
              ✨ {note.reaction_counts.sparkle}
            </span>
          )}
          {note.reaction_counts?.cheer > 0 && (
            <span className="flex items-center text-[8px] sm:text-[10px] bg-white/60 px-1 py-0.2 rounded-full font-medium">
              ✌️ {note.reaction_counts.cheer}
            </span>
          )}
          {note.reaction_counts?.idea > 0 && (
            <span className="flex items-center text-[8px] sm:text-[10px] bg-white/60 px-1 py-0.2 rounded-full font-medium">
              💡 {note.reaction_counts.idea}
            </span>
          )}
        </div>
        {totalReactions === 0 && (
          <span className="text-[8px] sm:text-[10px] text-stone-600/70 italic">แตะส่งใจ</span>
        )}
      </div>
    </div>
  );
};
