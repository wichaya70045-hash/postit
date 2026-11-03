'use client';

import React, { useState } from 'react';
import { DoorClosed, DoorOpen, Bell, Sparkles, Calendar, CheckCircle2 } from 'lucide-react';

interface DoorWallProps {
  onGoToBoard: () => void;
}

export const DoorWall: React.FC<DoorWallProps> = ({ onGoToBoard }) => {
  const [isDoorAjar, setIsDoorAjar] = useState(false);
  const [knockMessage, setKnockMessage] = useState<string | null>(null);
  const [bellRung, setBellRung] = useState(false);
  const [sweptCount, setSweptCount] = useState(0);

  const handleKnock = () => {
    setIsDoorAjar((prev) => !prev);
    const messages = [
      'ก๊อกๆ! "เชิญเข้ามาได้เลยจ้า ห้องเรียนนี้ยินดีต้อนรับทุกคนเสมอ!" 💛',
      'ก๊อกๆ! เสียงเพื่อนแว่วมาจากระเบียง: "อย่าลืมกินข้าวเที่ยงด้วยนะ!" 🍱',
      'ก๊อกๆ! "พักผ่อนบ้างนะ อย่าเครียดกับการเรียนเกินไปล่ะ!" 🌿',
      'ก๊อกๆ! "วันนี้ท้องฟ้าข้างนอกสวยมาก เลิกเรียนแล้วไปเดินเล่นกัน!" ✨',
    ];
    const picked = messages[Math.floor(Math.random() * messages.length)];
    setKnockMessage(picked);
    setTimeout(() => {
      setKnockMessage(null);
    }, 4500);
  };

  const handleRingBell = () => {
    setBellRung(true);
    setTimeout(() => setBellRung(false), 1200);
  };

  const handleSweep = () => {
    setSweptCount((prev) => prev + 1);
  };

  return (
    <div className="relative flex-1 w-full min-h-[70vh] sm:min-h-[82vh] rounded-xl sm:rounded-2xl overflow-hidden border-4 sm:border-[16px] border-[#533114] shadow-xl sm:shadow-2xl bg-[#fdfbf7] dark:bg-[#1a231d] flex flex-col justify-between transition-colors">
      {/* Wall Header: Classroom Plate */}
      <div className="px-3 sm:px-6 pt-2.5 sm:pt-4 pb-1.5 sm:pb-2 flex items-center justify-between z-20">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="text-lg sm:text-xl">🚪</span>
          <div>
            <h2 className="text-xs sm:text-base font-bold text-amber-950 dark:text-amber-100 flex items-center gap-1 sm:gap-2">
              <span>ผนังด้านขวา: ประตูห้องเรียน & ระเบียงทางเดิน</span>
              <span className="text-[9px] sm:text-[10px] font-normal px-1.5 sm:px-2 py-0.2 sm:py-0.5 rounded-full bg-amber-200/70 dark:bg-amber-900/50 text-amber-900 dark:text-amber-200 border border-amber-400/40">
                ม. ๓/๑
              </span>
            </h2>
            <p className="text-[10px] sm:text-[11px] text-stone-600 dark:text-stone-300 hidden xs:block">
              ประตูไม้คลาสสิกเชื่อมสู่ระเบียงทางเดินและโลกภายนอกห้องเรียน
            </p>
          </div>
        </div>

        {/* School Bell Button */}
        <button
          type="button"
          onClick={handleRingBell}
          className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-semibold shadow-xs border transition-all active:scale-95 ${
            bellRung
              ? 'bg-amber-500 text-white border-amber-300 animate-bounce'
              : 'bg-amber-700 hover:bg-amber-600 text-amber-100 border-amber-500/50'
          }`}
          title="กดกริ่งโรงเรียน"
        >
          <Bell className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${bellRung ? 'animate-spin-slow' : ''}`} />
          <span>{bellRung ? 'กริ๊งงงงงงง! 🔔' : 'สั่นกริ่ง'}</span>
        </button>
      </div>

      {/* Main Door Wall Scene */}
      <div className="flex-1 px-3 sm:px-10 py-2 sm:py-4 flex flex-col md:flex-row items-center justify-center gap-4 sm:gap-6 overflow-y-auto">
        {/* Left Section: Timetable & Duty Board */}
        <div className="w-full md:w-64 flex flex-col gap-3">
          {/* School Timetable Plaque */}
          <div className="p-3.5 bg-amber-50 dark:bg-stone-900 rounded-2xl border-2 border-amber-800/40 shadow-md">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-200 border-b border-amber-300 dark:border-stone-700 pb-1.5 mb-2">
              <Calendar className="w-3.5 h-3.5 text-amber-700" />
              <span>ตารางเรียนวิชาความสุข</span>
            </div>
            <ul className="space-y-1.5 text-[11px] text-stone-700 dark:text-stone-300 font-sans">
              <li className="flex items-center justify-between">
                <span>คาบ ๑: วิชาพลังบวก & ส่งยิ้ม</span>
                <span className="text-amber-700 dark:text-amber-400 font-semibold">08:30</span>
              </li>
              <li className="flex items-center justify-between">
                <span>คาบ ๒: ศิลปะและการวาดฝัน</span>
                <span className="text-amber-700 dark:text-amber-400 font-semibold">10:00</span>
              </li>
              <li className="flex items-center justify-between bg-amber-100/70 dark:bg-amber-950/40 px-1 rounded font-medium">
                <span>🍱 พักเที่ยง: ก๋วยเตี๋ยว & ชานม</span>
                <span className="text-amber-700 dark:text-amber-400">12:00</span>
              </li>
              <li className="flex items-center justify-between">
                <span>คาบ ๓: วิชาส่งต่อกำลังใจให้เพื่อน</span>
                <span className="text-amber-700 dark:text-amber-400 font-semibold">13:30</span>
              </li>
            </ul>
          </div>

          {/* Cleaning Corner (มุมเวรประจำวัน) */}
          <div className="p-3 bg-stone-100 dark:bg-stone-800/80 rounded-2xl border border-stone-300 dark:border-stone-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🧹</span>
              <div>
                <h4 className="text-xs font-bold text-stone-800 dark:text-stone-200">มุมเวรทำความสะอาด</h4>
                <p className="text-[10px] text-stone-600 dark:text-stone-400">
                  {sweptCount === 0
                    ? 'กวาดความทุกข์ ทิ้งความกังวล'
                    : `กวาดความกังวลไปแล้ว ${sweptCount} ครั้ง! ✨`}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleSweep}
              className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-[10px] font-semibold active:scale-95 shadow-2xs"
            >
              ช่วยกวาด 🧹
            </button>
          </div>
        </div>

        {/* Center Section: Vintage Classroom Wooden Door */}
        <div className="relative flex flex-col items-center">
          {/* Room Nameplate Above Door */}
          <div className="mb-2 px-5 py-1 rounded-lg bg-[#533114] border-2 border-[#b87333] shadow-md text-center">
            <span className="text-xs font-bold text-amber-200 tracking-wider">
              ม. ๓/๑ ห้องเรียนเพื่อนแท้
            </span>
          </div>

          {/* Door Frame */}
          <div className="relative w-44 sm:w-64 h-64 sm:h-96 rounded-t-xl sm:rounded-t-2xl border-4 sm:border-8 border-[#4d2b0e] bg-[#2a1608] shadow-xl sm:shadow-2xl overflow-hidden flex flex-col">
            {/* Hallway Backdrop with Thai School AI Scenery (Seen when door is ajar) */}
            <div
              className="absolute inset-0 bg-cover bg-center flex flex-col items-center justify-center p-3 text-center"
              style={{ backgroundImage: `url('/images/thai-school-window-view.jpg')` }}
            >
              <div className="absolute inset-0 bg-black/35 backdrop-blur-[0.5px]" />
              <div className="relative z-10 flex flex-col items-center">
                <span className="text-2xl mb-1 drop-shadow-md">🏫</span>
                <p className="text-xs font-bold text-white drop-shadow-md">ระเบียงโรงเรียน Yanin</p>
                <p className="text-[10px] text-amber-100 mt-1 max-w-[140px] drop-shadow-md">
                  มองออกไปเห็นทิวไม้และสนามหญ้าหน้าเสาธง...
                </p>
                <div className="mt-2 text-[9px] bg-amber-600/90 text-white px-2 py-0.5 rounded-full font-semibold shadow-xs">
                  ทางเดินสู่สนามโรงเรียน ✨
                </div>
              </div>
            </div>

            {/* The Actual Wooden Door Leaf */}
            <div
              className={`absolute inset-0 bg-gradient-to-r from-[#6c411c] via-[#8b5a2b] to-[#533114] border-r-4 border-[#3a1d08] p-4 flex flex-col justify-between transition-all duration-700 origin-left ${
                isDoorAjar ? 'rotate-y-[-60deg] scale-x-65 shadow-2xl' : ''
              }`}
              style={{
                transformStyle: 'preserve-3d',
                transform: isDoorAjar ? 'perspective(600px) rotateY(-50deg)' : 'none',
              }}
            >
              {/* Glass Window on Upper Door */}
              <div className="w-full h-32 rounded-lg border-4 border-[#4d2b0e] bg-sky-200/30 backdrop-blur-[1px] relative shadow-inner overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent" />
                <span className="text-xs text-amber-950/70 font-semibold select-none">
                  ยินดีต้อนรับ
                </span>
              </div>

              {/* Lower Wooden Moldings */}
              <div className="w-full h-24 rounded-lg border-2 border-[#4d2b0e] bg-[#533114]/60 shadow-inner flex items-center justify-center">
                <div className="w-4/5 h-3/4 border border-[#3b1c06] rounded" />
              </div>

              {/* Brass Door Knob / Handle */}
              <button
                type="button"
                onClick={handleKnock}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-12 rounded-lg bg-gradient-to-b from-amber-300 via-amber-500 to-amber-600 border border-amber-200 shadow-md flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95 transition-transform"
                title="เคาะประตูห้องเรียน"
                aria-label="เคาะประตู"
              >
                <div className="w-2 h-2 rounded-full bg-amber-800" />
              </button>
            </div>
          </div>

          {/* Door Action Buttons */}
          <div className="mt-2.5 flex items-center gap-2">
            <button
              type="button"
              onClick={handleKnock}
              className="px-3 py-1 bg-amber-700 hover:bg-amber-600 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1 active:scale-95 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>เคาะประตูก๊อกๆ 🚪</span>
            </button>

            <button
              type="button"
              onClick={() => setIsDoorAjar(!isDoorAjar)}
              className="px-2.5 py-1 bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 rounded-xl text-xs font-medium border border-stone-300 dark:border-stone-700 transition-all"
            >
              {isDoorAjar ? <DoorClosed className="w-3.5 h-3.5" /> : <DoorOpen className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Knock message popup */}
          {knockMessage && (
            <div className="absolute top-1/3 z-30 px-4 py-2.5 bg-amber-950/90 text-amber-100 rounded-2xl border border-amber-400 shadow-2xl text-xs postit-handwriting max-w-xs text-center animate-in fade-in zoom-in-95 duration-200">
              {knockMessage}
            </div>
          )}
        </div>

        {/* Right Section: Student Shoe Rack & Hallway Teaser */}
        <div className="w-full md:w-60 flex flex-col gap-3">
          {/* Shoe Rack (ชั้นวางรองเท้านักเรียน) */}
          <div className="p-3 bg-amber-900/10 dark:bg-stone-900 rounded-2xl border-2 border-amber-900/30">
            <div className="text-xs font-bold text-amber-950 dark:text-amber-200 mb-1.5 flex items-center gap-1.5">
              <span>👞 ชั้นวางรองเท้านักเรียน</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
              <div className="bg-amber-100 dark:bg-stone-800 p-1.5 rounded-lg border border-amber-300/40 shadow-2xs">
                👟 ดำ
              </div>
              <div className="bg-amber-100 dark:bg-stone-800 p-1.5 rounded-lg border border-amber-300/40 shadow-2xs">
                👟 น้ำตาล
              </div>
              <div className="bg-amber-100 dark:bg-stone-800 p-1.5 rounded-lg border border-amber-300/40 shadow-2xs">
                👟 ขาว
              </div>
            </div>
            <p className="text-[10px] text-stone-500 dark:text-stone-400 text-center mt-1.5">
              วางรองเท้าให้ตรงคู่ แล้วเดินเข้าห้องอย่างสบายใจ
            </p>
          </div>

          {/* Future Exploration Teaser Card */}
          <div className="p-3.5 bg-gradient-to-br from-amber-600/10 via-amber-500/5 to-transparent rounded-2xl border border-amber-500/30">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-200 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>ก้าวออกนอกห้องเรียน (เร็วๆ นี้)</span>
            </div>
            <p className="text-[11px] text-stone-600 dark:text-stone-300 leading-relaxed">
              ฟีเจอร์สำรวจนอกห้อง เช่น <strong>สหกรณ์ซื้อของตกแต่ง</strong>, <strong>ห้องสมุดเปิดอ่านบันทึก</strong> และ <strong>โรงอาหารแลกเปลี่ยนของขวัญ</strong> กำลังอยู่ในระหว่างก่อสร้าง!
            </p>
          </div>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="px-6 py-3 bg-[#e8ded1] dark:bg-[#121c16] border-t-4 border-[#8b5a2b] dark:border-stone-800 flex items-center justify-between z-20">
        <span className="text-xs text-stone-600 dark:text-stone-300">
          📍 ยืนอยู่หน้าประตูห้องเรียน
        </span>
        <button
          type="button"
          onClick={onGoToBoard}
          className="px-4 py-1.5 bg-amber-700 hover:bg-amber-600 text-white text-xs font-semibold rounded-xl shadow-xs border border-amber-500/50 active:scale-95 transition-all"
        >
          🏫 กลับไปดูกระดานดำหน้าห้อง
        </button>
      </div>
    </div>
  );
};
