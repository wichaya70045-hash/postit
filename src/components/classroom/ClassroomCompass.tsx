'use client';

import React from 'react';
import { WallId, CLASSROOM_WALLS } from './EdgeNavButtons';
import { Compass } from 'lucide-react';

interface ClassroomCompassProps {
  currentWall: WallId;
  onSelectWall: (wall: WallId) => void;
}

export const ClassroomCompass: React.FC<ClassroomCompassProps> = ({
  currentWall,
  onSelectWall,
}) => {
  return (
    <nav aria-label="สลับผนังห้องเรียน 4 ด้าน" className="flex items-center justify-center w-full px-2 py-1 mb-2">
      <div className="flex items-center gap-1 sm:gap-2 bg-black/60 backdrop-blur-md px-2.5 py-1.5 rounded-2xl border border-amber-800/60 shadow-lg">
        <div className="hidden md:flex items-center gap-1.5 text-xs text-amber-300/80 pr-2 border-r border-amber-900/60">
          <Compass className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
          <span className="font-semibold text-[11px]">ห้องเรียน 4 ด้าน:</span>
        </div>

        <div className="flex items-center gap-1 sm:gap-1.5">
          {CLASSROOM_WALLS.map((wall) => {
            const isActive = wall.id === currentWall;
            return (
              <button
                key={wall.id}
                type="button"
                onClick={() => onSelectWall(wall.id)}
                className={`flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-amber-600 text-white font-semibold shadow-md border border-amber-400/50 scale-105'
                    : 'text-amber-200/70 hover:text-amber-100 hover:bg-white/10'
                }`}
                title={wall.sub}
              >
                <span>{wall.icon}</span>
                <span className="text-[11px] sm:text-xs">{wall.name}</span>
                {isActive && (
                  <span className="hidden sm:inline text-[10px] bg-amber-900/70 text-amber-200 px-1.5 py-0.2 rounded-md ml-0.5">
                    {wall.id === 'front' ? 'หน้าห้อง' : wall.id === 'right' ? 'ประตู' : wall.id === 'back' ? 'หลังห้อง' : 'หน้าต่าง'}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
