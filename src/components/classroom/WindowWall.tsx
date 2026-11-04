'use client';

import React, { useState } from 'react';
import { Wind, Sun, Moon, Cloud, Sparkles, Smile, RefreshCw } from 'lucide-react';

interface WindowWallProps {
  isDarkMode: boolean;
  onGoToBoard: () => void;
}

export const WindowWall: React.FC<WindowWallProps> = ({ isDarkMode, onGoToBoard }) => {
  const [isOpenWindow, setIsOpenWindow] = useState(true);
  const [plantWiggle, setPlantWiggle] = useState(false);
  const [chimeRung, setChimeRung] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);

  const quotes = [
    '“เมื่อรู้สึกเหนื่อย ลืมตามองออกไปนอกหน้าต่าง สูดลมหายใจลึกๆ โลกใบนี้ยังมีมุมอบอุ่นรออยู่เสมอ” 🍃',
    '“ทุกๆ วันคือโอกาสในการเริ่มต้นใหม่ เหมือนแสงอาทิตย์ยามเช้าที่ส่องผ่านกระจกห้องเรียน” ☀️',
    '“ไม่จำเป็นต้องเก่งที่สุดในทุกเรื่อง แค่ใจดีกับตัวเองและคนรอบข้างก็วิเศษมากแล้ว” 🤍',
    '“แม้ในวันที่ฝนตก นอกหน้าต่างยังมีต้นไม้ที่กำลังเติบโตอย่างเงียบๆ” 🌱',
  ];

  const triggerPlant = () => {
    setPlantWiggle(true);
    setTimeout(() => setPlantWiggle(false), 800);
  };

  const triggerChime = () => {
    setChimeRung(true);
    setTimeout(() => setChimeRung(false), 1000);
  };

  return (
    <div className="relative flex-1 w-full min-h-[70vh] sm:min-h-[82vh] rounded-xl sm:rounded-2xl overflow-hidden border-4 sm:border-[16px] border-[#533114] shadow-xl sm:shadow-2xl bg-[#f5efe6] dark:bg-[#1a251f] flex flex-col justify-between transition-colors">
      {/* Wall Header: Classroom Sign */}
      <div className="px-3 sm:px-6 pt-2.5 sm:pt-4 pb-1.5 sm:pb-2 flex items-center justify-between z-20">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="text-lg sm:text-xl">🪟</span>
          <div>
            <h2 className="text-xs sm:text-base font-bold text-amber-950 dark:text-amber-100 flex items-center gap-1 sm:gap-2">
              <span>ผนังด้านซ้าย: หน้าต่างห้องเรียนริมสนาม</span>
              <span className="text-[9px] sm:text-[10px] font-normal px-1.5 sm:px-2 py-0.2 sm:py-0.5 rounded-full bg-amber-200/70 dark:bg-amber-900/50 text-amber-900 dark:text-amber-200 border border-amber-400/40">
                {isOpenWindow ? '🍃 รับลม' : '🔒 ปิด'}
              </span>
            </h2>
            <p className="text-[10px] sm:text-[11px] text-stone-600 dark:text-stone-300 hidden xs:block">
              มุมโปรดริมหน้าต่างของห้อง มองออกไปเห็นสนามหญ้าและท้องฟ้า
            </p>
          </div>
        </div>

        {/* Window Toggle Button */}
        <button
          type="button"
          onClick={() => setIsOpenWindow(!isOpenWindow)}
          className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-semibold shadow-xs border transition-all active:scale-95 ${
            isOpenWindow
              ? 'bg-emerald-600 text-white border-emerald-400'
              : 'bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-200 border-stone-300'
          }`}
        >
          <Wind className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${isOpenWindow ? 'animate-spin-slow text-emerald-200' : ''}`} />
          <span>{isOpenWindow ? 'ปิดหน้าต่าง' : 'เปิดรับลม'}</span>
        </button>
      </div>

      {/* Main Window Frame Area */}
      <div className="flex-1 px-2 sm:px-12 py-1.5 sm:py-3 flex items-center justify-center">
        <div className="w-full max-w-4xl h-[42vh] sm:h-[54vh] relative rounded-xl sm:rounded-2xl border-4 sm:border-12 border-[#6c411c] bg-[#3a200e] shadow-xl sm:shadow-2xl overflow-hidden flex flex-col">
          {/* Top Wooden Window Transom Header */}
          <div className="h-6 sm:h-8 bg-[#4d2b0e] border-b-4 border-[#311808] flex items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400/60" />
            </div>

            {/* Brass Wind Chime Hanging */}
            <button
              type="button"
              onClick={triggerChime}
              className={`flex items-center gap-1 text-[11px] font-medium text-amber-200/90 hover:text-amber-100 bg-[#311808] px-2 py-0.5 rounded-full border border-amber-600/50 cursor-pointer active:scale-90 transition-transform ${
                chimeRung ? 'animate-bounce' : ''
              }`}
              title="เคาะกระดิ่งลม"
            >
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>กระดิ่งลมริมหน้าต่าง 🎐</span>
            </button>
          </div>

          {/* Outside View: Beautiful AI Generated Thai School Scenery */}
          <div
            className="relative flex-1 w-full overflow-hidden bg-cover bg-center transition-all duration-700"
            style={{ backgroundImage: `url('/images/thai-school-window-view.jpg')` }}
          >
            {/* Night mode soft dimming */}
            {isDarkMode && (
              <div className="absolute inset-0 bg-slate-950/65 backdrop-blur-[0.5px]" />
            )}

            {/* Sun / Moon subtle celestial glow */}
            <div className="absolute top-4 right-8 transition-transform duration-700">
              {isDarkMode ? (
                <div className="relative">
                  <Moon className="w-10 h-10 text-amber-200 drop-shadow-[0_0_15px_rgba(253,230,138,0.8)]" />
                  <div className="absolute -top-1 -right-2 text-xs">✨</div>
                </div>
              ) : (
                <div className="relative">
                  <Sun className="w-12 h-12 text-amber-300 drop-shadow-[0_0_20px_rgba(251,191,36,0.9)] animate-pulse" />
                  <div className="absolute inset-0 bg-amber-300/20 rounded-full blur-xl scale-150" />
                </div>
              )}
            </div>

            {/* Floating Breeze Particles when window is open */}
            {isOpenWindow && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-1/4 left-10 text-emerald-300 animate-bounce text-sm opacity-80">
                  🍃
                </div>
                <div className="absolute top-1/2 left-1/3 text-emerald-400 text-xs animate-pulse opacity-70">
                  🍃
                </div>
                <div className="absolute top-1/3 right-1/4 text-pink-300 text-sm animate-bounce opacity-80">
                  🌸
                </div>
              </div>
            )}

            {/* 3 Large Window Panes Grid */}
            <div className="absolute inset-0 grid grid-cols-3 pointer-events-none border-t border-b border-[#4d2b0e]">
              <div className="border-r-4 border-[#533114] relative bg-white/5 backdrop-blur-[0.5px]">
                {/* Diagonal Glass Reflection */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />
              </div>
              <div className="border-r-4 border-[#533114] relative bg-white/5 backdrop-blur-[0.5px]">
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />
              </div>
              <div className="relative bg-white/5 backdrop-blur-[0.5px]">
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />
              </div>
            </div>

            {/* Swaying Soft Classroom Curtains */}
            <div className="absolute inset-y-0 left-0 w-12 sm:w-20 bg-gradient-to-r from-sky-100/80 to-transparent dark:from-indigo-900/70 border-r border-sky-300/40 pointer-events-none transform -skew-x-2" />
            <div className="absolute inset-y-0 right-0 w-12 sm:w-20 bg-gradient-to-l from-sky-100/80 to-transparent dark:from-indigo-900/70 border-l border-sky-300/40 pointer-events-none transform skew-x-2" />
          </div>

          {/* Wooden Window Sill (ขอบหน้าต่างไม้ด้านล่าง) */}
          <div className="h-10 sm:h-12 bg-[#533114] border-t-4 border-[#6c411c] shadow-lg flex items-center justify-between px-4 sm:px-8 z-10">
            {/* Potted Plant */}
            <button
              type="button"
              onClick={triggerPlant}
              className={`flex items-center gap-1.5 cursor-pointer text-xs text-amber-100 font-medium hover:text-white transition-transform ${
                plantWiggle ? 'animate-bounce' : ''
              }`}
              title="รดน้ำต้นไม้ริมหน้าต่าง"
            >
              <span className="text-base sm:text-lg">🪴</span>
              <span className="text-[11px] text-amber-200/90">ต้นไม้ริมหน้าต่าง</span>
            </button>

            {/* Motivational Quote Switcher */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setQuoteIndex((prev) => (prev + 1) % quotes.length)}
                className="flex items-center gap-1 px-2.5 py-1 bg-[#3a200e] hover:bg-[#4d2b0e] text-amber-200 rounded-lg text-[11px] border border-amber-600/40 active:scale-95 transition-all"
              >
                <RefreshCw className="w-3 h-3 text-amber-300" />
                <span>เปลี่ยนข้อคิด</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Classroom Wall Footer Shelf & Quote Note */}
      <div className="px-6 py-3 bg-[#e8ded1] dark:bg-[#121c16] border-t-4 border-[#8b5a2b] dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-2 z-20">
        <div className="flex items-center gap-2 text-xs text-stone-800 dark:text-stone-200">
          <Smile className="w-4 h-4 text-amber-600 shrink-0" />
          <p className="postit-handwriting text-xs sm:text-sm italic">{quotes[quoteIndex]}</p>
        </div>

        <button
          type="button"
          onClick={onGoToBoard}
          className="px-4 py-1.5 bg-amber-700 hover:bg-amber-600 text-white text-xs font-semibold rounded-xl shadow-xs border border-amber-500/50 active:scale-95 transition-all whitespace-nowrap"
        >
          🏫 กลับไปดูกระดานดำหน้าห้อง
        </button>
      </div>
    </div>
  );
};
