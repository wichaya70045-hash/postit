'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export type WallId = 'front' | 'right' | 'back' | 'left';

export interface WallInfo {
  id: WallId;
  name: string;
  icon: string;
  sub: string;
}

export const CLASSROOM_WALLS: WallInfo[] = [
  { id: 'front', name: 'ด้านหน้า', icon: '🏫', sub: 'กระดานหน้าห้อง & โพสต์อิท' },
  { id: 'right', name: 'ด้านขวา', icon: '🚪', sub: 'ประตูห้องเรียน & ทางเดิน' },
  { id: 'back', name: 'ด้านหลัง', icon: '📌', sub: 'บอร์ดหลังห้อง & ฟีเจอร์ใหม่' },
  { id: 'left', name: 'ด้านซ้าย', icon: '🪟', sub: 'หน้าต่างห้องเรียน & วิว' },
];

interface EdgeNavButtonsProps {
  currentWall: WallId;
  onRotateLeft: () => void;
  onRotateRight: () => void;
}

export const EdgeNavButtons: React.FC<EdgeNavButtonsProps> = ({
  currentWall,
  onRotateLeft,
  onRotateRight,
}) => {
  const currentIndex = CLASSROOM_WALLS.findIndex((w) => w.id === currentWall);
  const leftWall = CLASSROOM_WALLS[(currentIndex - 1 + CLASSROOM_WALLS.length) % CLASSROOM_WALLS.length];
  const rightWall = CLASSROOM_WALLS[(currentIndex + 1) % CLASSROOM_WALLS.length];

  return (
    <>
      {/* Left Edge Screen Navigation Button */}
      <aside aria-label="แถบเปลี่ยนมุมมองด้านซ้าย" className="fixed left-2 sm:left-4 top-1/2 -translate-y-1/2 z-40 select-none pointer-events-auto">
        <button
          type="button"
          onClick={onRotateLeft}
          className="group relative flex items-center justify-center p-2.5 sm:p-3 rounded-2xl bg-gradient-to-r from-[#533114] to-[#6c411c] text-amber-100 shadow-[0_8px_24px_rgba(0,0,0,0.45)] border-2 border-amber-500/60 hover:border-amber-300 hover:scale-110 active:scale-95 transition-all duration-200 backdrop-blur-md"
          title={`หันไปทางซ้าย: ${leftWall.name} (${leftWall.sub})`}
          aria-label={`หันไปทางซ้าย ดู${leftWall.name}`}
        >
          <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7 text-amber-200 group-hover:text-white transition-colors" />

          {/* Floating Pill Label on Hover / Active */}
          <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-black/85 text-amber-100 border border-amber-600/60 shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap hidden sm:flex items-center gap-1.5 text-xs font-medium">
            <span>{leftWall.icon}</span>
            <span>หันไป {leftWall.name}: <strong>{leftWall.sub}</strong></span>
          </div>

          {/* Subtle Direction Indicator Tag (Visible on mobile and desktop) */}
          <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-amber-300/80 bg-black/60 px-1.5 py-0.2 rounded-full border border-amber-700/50 shadow-xs whitespace-nowrap">
            {leftWall.icon} ซ้าย
          </span>
        </button>
      </aside>

      {/* Right Edge Screen Navigation Button */}
      <aside aria-label="แถบเปลี่ยนมุมมองด้านขวา" className="fixed right-2 sm:right-4 top-1/2 -translate-y-1/2 z-40 select-none pointer-events-auto">
        <button
          type="button"
          onClick={onRotateRight}
          className="group relative flex items-center justify-center p-2.5 sm:p-3 rounded-2xl bg-gradient-to-r from-[#6c411c] to-[#533114] text-amber-100 shadow-[0_8px_24px_rgba(0,0,0,0.45)] border-2 border-amber-500/60 hover:border-amber-300 hover:scale-110 active:scale-95 transition-all duration-200 backdrop-blur-md"
          title={`หันไปทางขวา: ${rightWall.name} (${rightWall.sub})`}
          aria-label={`หันไปทางขวา ดู${rightWall.name}`}
        >
          <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7 text-amber-200 group-hover:text-white transition-colors" />

          {/* Floating Pill Label on Hover / Active */}
          <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-black/85 text-amber-100 border border-amber-600/60 shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap hidden sm:flex items-center gap-1.5 text-xs font-medium">
            <span>หันไป {rightWall.name}: <strong>{rightWall.sub}</strong></span>
            <span>{rightWall.icon}</span>
          </div>

          {/* Subtle Direction Indicator Tag */}
          <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-amber-300/80 bg-black/60 px-1.5 py-0.2 rounded-full border border-amber-700/50 shadow-xs whitespace-nowrap">
            ขวา {rightWall.icon}
          </span>
        </button>
      </aside>
    </>
  );
};
