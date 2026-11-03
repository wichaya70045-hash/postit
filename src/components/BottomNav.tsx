'use client';

import React from 'react';
import { LayoutGrid, Plus, User } from 'lucide-react';

interface BottomNavProps {
  currentTab: 'board' | 'mine';
  onTabChange: (tab: 'board' | 'mine') => void;
  onOpenComposer: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onTabChange,
  onOpenComposer,
}) => {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 bg-white/90 dark:bg-stone-900/90 backdrop-blur-md border-t border-stone-200/80 dark:border-stone-800 shadow-lg select-none transition-colors"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 6px)' }}
      aria-label="เมนูหลัก"
    >
      <div className="max-w-md mx-auto px-6 h-14 flex items-center justify-between">
        {/* Board Tab */}
        <button
          type="button"
          onClick={() => onTabChange('board')}
          className={`flex flex-col items-center justify-center min-w-[48px] min-h-[48px] px-3 transition-colors active:scale-95 ${
            currentTab === 'board'
              ? 'text-amber-600 dark:text-amber-400 font-semibold'
              : 'text-stone-400 hover:text-stone-600 dark:text-stone-500'
          }`}
          aria-label="หน้ากระดาน"
        >
          <LayoutGrid className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] leading-tight">กระดาน</span>
        </button>

        {/* Center Primary Action */}
        <div className="relative -top-4 flex items-center justify-center">
          <button
            type="button"
            onClick={onOpenComposer}
            className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-500 to-amber-400 text-white flex flex-col items-center justify-center shadow-lg hover:shadow-amber-500/30 active:scale-90 transition-all border-4 border-stone-100 dark:border-stone-900"
            aria-label="เขียนโพสต์อิทใหม่"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        {/* Mine Tab */}
        <button
          type="button"
          onClick={() => onTabChange('mine')}
          className={`flex flex-col items-center justify-center min-w-[48px] min-h-[48px] px-3 transition-colors active:scale-95 ${
            currentTab === 'mine'
              ? 'text-amber-600 dark:text-amber-400 font-semibold'
              : 'text-stone-400 hover:text-stone-600 dark:text-stone-500'
          }`}
          aria-label="โพสต์ของฉัน"
        >
          <User className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] leading-tight">ของฉัน</span>
        </button>
      </div>
    </nav>
  );
};
