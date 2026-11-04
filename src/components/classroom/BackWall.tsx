'use client';

import React, { useState, useEffect } from 'react';
import {
  Clock,
  Sparkles,
  Lock,
  Camera,
  Radio,
  Award,
  Vote,
  Volume2,
  VolumeX,
  Check,
  ChevronRight,
  Heart,
} from 'lucide-react';

interface BackWallProps {
  onGoToBoard: () => void;
}

interface FutureFeature {
  id: string;
  title: string;
  icon: string;
  category: string;
  desc: string;
  votes: number;
  badge: string;
}

export const BackWall: React.FC<BackWallProps> = ({ onGoToBoard }) => {
  const [timeString, setTimeString] = useState<string>('');
  const [selectedPreview, setSelectedPreview] = useState<string | null>(null);
  const [isPlayingLofi, setIsPlayingLofi] = useState<boolean>(false);
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set());

  // Features list with interactive voting
  const [features, setFeatures] = useState<FutureFeature[]>([
    {
      id: 'secret-locker',
      title: 'ตู้ล็อกเกอร์ความลับ & ส่งจดหมาย',
      icon: '📬',
      category: 'การสื่อสาร',
      desc: 'หย่อนจดหมายความรู้สึก กำลังใจ หรือข้อความลับถึงเพื่อนตามเลขตู้ล็อกเกอร์',
      votes: 142,
      badge: 'เร็วๆ นี้',
    },
    {
      id: 'yearbook-gallery',
      title: 'อัลบั้มภาพความทรงจำรุ่นเรา',
      icon: '📸',
      category: 'ความทรงจำ',
      desc: 'แปะรูปโพลารอยด์ ผลงานภาพวาด และบันทึกโมเมนต์อบอุ่นในห้องเรียน',
      votes: 118,
      badge: 'วางแผนพัฒนา',
    },
    {
      id: 'lofi-radio',
      title: 'วิทยุโรงเรียน & เสียงคลอสร้างสมาธิ',
      icon: '📻',
      category: 'บรรยากาศ',
      desc: 'เปิดเพลง Lofi สบายๆ เสียงฝนตก หรือเสียงลมสร้างความสงบใจขณะเขียนโน้ต',
      votes: 175,
      badge: 'กำลังสร้าง',
    },
    {
      id: 'kindness-hall',
      title: 'บอร์ดดาวคนดีศรีห้องเรียน',
      icon: '⭐',
      category: 'ชุมชน',
      desc: 'สะสมดาวความดีและยกย่องโพสต์อิทที่สร้างรอยยิ้มให้เพื่อนๆ มากที่สุด',
      votes: 96,
      badge: 'วางแผนพัฒนา',
    },
  ]);

  // Real-time ticking classroom clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(
        now.toLocaleTimeString('th-TH', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Load saved votes from local storage
  useEffect(() => {
    try {
      const savedVotes = localStorage.getItem('yanin_wall_votes');
      if (savedVotes) {
        setVotedIds(new Set(JSON.parse(savedVotes)));
      }
    } catch {}
  }, []);

  const handleVote = (id: string) => {
    if (votedIds.has(id)) return;
    const nextVoted = new Set(votedIds);
    nextVoted.add(id);
    setVotedIds(nextVoted);

    setFeatures((prev) =>
      prev.map((f) => (f.id === id ? { ...f, votes: f.votes + 1 } : f))
    );

    try {
      localStorage.setItem('yanin_wall_votes', JSON.stringify(Array.from(nextVoted)));
    } catch {}
  };

  // Simple gentle Web Audio relaxing chime when lofi radio is toggled
  const toggleRadio = () => {
    const next = !isPlayingLofi;
    setIsPlayingLofi(next);

    if (next && typeof window !== 'undefined' && (window.AudioContext || (window as any).webkitAudioContext)) {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.8);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 1.2);
      } catch {}
    }
  };

  return (
    <div className="relative flex-1 w-full min-h-[70vh] sm:min-h-[82vh] rounded-xl sm:rounded-2xl overflow-hidden border-4 sm:border-[16px] border-[#533114] shadow-xl sm:shadow-2xl bg-[#edd6b3] dark:bg-[#1a1f1b] flex flex-col justify-between transition-colors">
      {/* Ambient AI Thai Classroom Back Wall Background */}
      <div
        className="absolute inset-0 bg-cover bg-center pointer-events-none opacity-40 dark:opacity-25"
        style={{ backgroundImage: `url('/images/thai-classroom-back.jpg')` }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-stone-900/20 dark:bg-black/50 pointer-events-none" />
      {/* Wall Header: Classroom Clock and Title */}
      <div className="px-3 sm:px-6 pt-2.5 sm:pt-4 pb-1.5 sm:pb-2 flex items-center justify-between z-20">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="text-lg sm:text-xl">📌</span>
          <div>
            <h2 className="text-xs sm:text-base font-bold text-amber-950 dark:text-amber-100 flex items-center gap-1 sm:gap-2">
              <span>ผนังด้านหลัง: บอร์ดนิทรรศการ & โซนฟีเจอร์ในอนาคต</span>
              <span className="text-[9px] sm:text-[10px] font-normal px-1.5 sm:px-2 py-0.2 sm:py-0.5 rounded-full bg-amber-300 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 border border-amber-500/40">
                ✨ ฟีเจอร์ใหม่
              </span>
            </h2>
            <p className="text-[10px] sm:text-[11px] text-stone-700 dark:text-stone-300 hidden xs:block">
              พื้นที่จัดแสดงบอร์ดความรู้ ตู้ล็อกเกอร์ และฟีเจอร์ใหม่ที่กำลังจะมาถึงห้องเรียน
            </p>
          </div>
        </div>

        {/* Real-time Classroom Wall Clock */}
        <div className="flex items-center gap-1.5 sm:gap-2 bg-[#533114] text-amber-100 px-2 sm:px-3.5 py-1 sm:py-1.5 rounded-xl sm:rounded-2xl border sm:border-2 border-amber-600/60 shadow-md shrink-0">
          <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300 animate-spin-slow" />
          <div className="flex flex-col items-end">
            <span className="text-[8px] sm:text-[10px] text-amber-300 font-mono tracking-wider">นาฬิกาห้องเรียน</span>
            <span className="text-[11px] sm:text-sm font-bold font-mono text-white">{timeString || 'กำลังเดิน...'}</span>
          </div>
        </div>
      </div>

      {/* Main Corkboard Section (บอร์ดไม้ก๊อกขนาดใหญ่หลังห้อง) */}
      <div className="flex-1 px-2 sm:px-8 py-2 sm:py-3 flex flex-col justify-center overflow-y-auto relative z-10">
        {/* Corkboard Frame with AI Back Wall Background */}
        <div
          className="w-full relative rounded-xl sm:rounded-2xl border-4 sm:border-8 border-[#7a481e] bg-cover bg-center p-2.5 sm:p-6 shadow-xl sm:shadow-2xl overflow-hidden"
          style={{ backgroundImage: `url('/images/thai-classroom-back.jpg')` }}
        >
          {/* Subtle warm overlay to keep text clear */}
          <div className="absolute inset-0 bg-[#3a200e]/40 dark:bg-black/65 backdrop-blur-[0.5px] pointer-events-none" />

          {/* Banner Pinned to Corkboard */}
          <div className="relative mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-[#fdfbf7] dark:bg-stone-900/90 p-3 rounded-xl border border-amber-900/30 shadow-md">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📋</span>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-amber-950 dark:text-amber-100 flex items-center gap-2">
                  <span>บอร์ดแจ้งข่าวสาร & แผนพัฒนาห้องเรียน</span>
                  <span className="text-[10px] bg-amber-600 text-white px-2 py-0.2 rounded-full">
                    Future Roadmap
                  </span>
                </h3>
                <p className="text-[11px] text-stone-600 dark:text-stone-300">
                  นักเรียนทุกคนสามารถร่วมโหวตฟีเจอร์ที่อยากให้ห้องเรียนมีมากที่สุดได้เลยนะ!
                </p>
              </div>
            </div>

            {/* School Radio Quick Toggle */}
            <button
              type="button"
              onClick={toggleRadio}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shadow-xs border transition-all active:scale-95 ${
                isPlayingLofi
                  ? 'bg-amber-600 text-white border-amber-300 shadow-md'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-300'
              }`}
            >
              {isPlayingLofi ? <Volume2 className="w-3.5 h-3.5 animate-pulse text-amber-200" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span>{isPlayingLofi ? 'วิทยุ Lofi เปิดอยู่ 🎵' : 'เปิดวิทยุโรงเรียน'}</span>
            </button>
          </div>

          {/* Cards Grid: Pinned Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
            {features.map((feature) => {
              const hasVoted = votedIds.has(feature.id);
              return (
                <div
                  key={feature.id}
                  className="group relative bg-[#fdfaf3] dark:bg-[#1f2922] p-4 rounded-2xl border-2 border-stone-300/80 dark:border-stone-700 shadow-md hover:shadow-xl transition-all duration-200 flex flex-col justify-between"
                >
                  {/* Pushpin decorative top */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-red-500 border-2 border-red-700 shadow-md flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-white opacity-80" />
                  </div>

                  <div>
                    {/* Category & Badge */}
                    <div className="flex items-center justify-between text-[10px] text-stone-500 dark:text-stone-400 mb-1.5 pt-1">
                      <span className="bg-stone-200 dark:bg-stone-800 px-1.5 py-0.5 rounded-md font-medium">
                        {feature.category}
                      </span>
                      <span className="text-amber-800 dark:text-amber-300 font-semibold bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-300/60">
                        {feature.badge}
                      </span>
                    </div>

                    {/* Icon and Title */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{feature.icon}</span>
                      <h4 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100 leading-tight">
                        {feature.title}
                      </h4>
                    </div>

                    {/* Description */}
                    <p className="text-[11px] text-stone-600 dark:text-stone-300 leading-relaxed mb-3">
                      {feature.desc}
                    </p>
                  </div>

                  {/* Footer: Preview and Vote Buttons */}
                  <div className="pt-2 border-t border-stone-200 dark:border-stone-700/80 flex items-center justify-between gap-1.5">
                    <button
                      type="button"
                      onClick={() => setSelectedPreview(feature.id)}
                      className="text-[10px] font-semibold text-amber-800 dark:text-amber-300 hover:underline flex items-center gap-0.5"
                    >
                      <span>ดูตัวอย่าง</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>

                    {/* Vote button */}
                    <button
                      type="button"
                      onClick={() => handleVote(feature.id)}
                      disabled={hasVoted}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold shadow-2xs transition-all active:scale-95 ${
                        hasVoted
                          ? 'bg-emerald-600 text-white cursor-default'
                          : 'bg-amber-700 hover:bg-amber-600 text-white'
                      }`}
                      title={hasVoted ? 'คุณได้โหวตฟีเจอร์นี้แล้ว' : 'กดโหวตฟีเจอร์นี้'}
                    >
                      {hasVoted ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>{feature.votes} โหวตแล้ว</span>
                        </>
                      ) : (
                        <>
                          <Heart className="w-3 h-3 text-amber-200" />
                          <span>โหวต ({feature.votes})</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Feature Preview Modal */}
      {selectedPreview && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-[#fdfbf7] dark:bg-stone-900 p-6 rounded-3xl max-w-md w-full border-4 border-[#8b5a2b] shadow-2xl flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-2">
              <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <span>ตัวอย่างฟีเจอร์ในอนาคต</span>
              </h3>
              <button
                type="button"
                onClick={() => setSelectedPreview(null)}
                className="text-stone-500 hover:text-stone-800 dark:hover:text-white text-xs px-2 py-1 rounded-lg bg-stone-200 dark:bg-stone-800 font-semibold"
              >
                ปิดหน้าต่าง
              </button>
            </div>

            {selectedPreview === 'secret-locker' && (
              <div className="space-y-2 text-xs text-stone-700 dark:text-stone-300">
                <div className="p-3 bg-amber-100/70 dark:bg-stone-800 rounded-xl border border-amber-300/50">
                  <p className="font-bold text-amber-950 dark:text-amber-200 mb-1">
                    📬 ล็อกเกอร์หมายเลข ๑๔ (ตัวอย่าง):
                  </p>
                  <p className="postit-handwriting text-sm">
                    "ถึงเพื่อนร่วมห้อง: ขอบคุณสำหรับรอยยิ้มเมื่อเช้านะ ขอให้การสอบวันนี้ผ่านไปด้วยดี!"
                  </p>
                </div>
                <p className="text-[11px] text-stone-500">
                  * เมื่อเปิดใช้งานจริง คุณจะสามารถตั้งรหัสล็อกเกอร์และส่งจดหมายลับหากันได้
                </p>
              </div>
            )}

            {selectedPreview === 'yearbook-gallery' && (
              <div className="space-y-2 text-xs text-stone-700 dark:text-stone-300">
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 bg-white dark:bg-stone-800 rounded-xl shadow-xs border text-center">
                    <span className="text-3xl">🎨</span>
                    <p className="text-[10px] mt-1 font-semibold">ภาพวาดประทับใจ</p>
                  </div>
                  <div className="p-2 bg-white dark:bg-stone-800 rounded-xl shadow-xs border text-center">
                    <span className="text-3xl">🎈</span>
                    <p className="text-[10px] mt-1 font-semibold">วันงานโรงเรียน</p>
                  </div>
                </div>
                <p className="text-[11px] text-stone-500">
                  * จะเป็นพื้นที่ให้ทุกคนอัปโหลดรูปความทรงจำหรือลายเส้นสวยๆ แปะไว้บนบอร์ด
                </p>
              </div>
            )}

            {selectedPreview === 'lofi-radio' && (
              <div className="space-y-2 text-xs text-stone-700 dark:text-stone-300">
                <p className="leading-relaxed">
                  📻 ผู้ฟังจะสามารถเลือกเพลงบรรเลง Lofi เบาๆ เสียงคลื่นทะเล เสียงสายฝนพรำ หรือเสียงใบไม้ร่วง เพื่อสร้างบรรยากาศห้องเรียนที่ผ่อนคลายที่สุด
                </p>
              </div>
            )}

            {selectedPreview === 'kindness-hall' && (
              <div className="space-y-2 text-xs text-stone-700 dark:text-stone-300">
                <p className="leading-relaxed">
                  ⭐ โพสต์ที่ได้รับหัวใจและกำลังใจมากที่สุดในแต่ละสัปดาห์จะได้รับการประดับดาวทองบนบอร์ด พร้อมคำขอบคุณพิเศษจากเพื่อนๆ
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer Navigation */}
      <div className="px-6 py-3 bg-[#e8ded1] dark:bg-[#121c16] border-t-4 border-[#8b5a2b] dark:border-stone-800 flex items-center justify-between z-20">
        <span className="text-xs text-stone-700 dark:text-stone-300">
          📍 ยืนอยู่ด้านหลังห้องเรียน (หันหน้ามองบอร์ดนิทรรศการ)
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
