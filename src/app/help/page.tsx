import React from 'react';
import Link from 'next/link';
import { Phone, Heart, ArrowLeft, ShieldCheck, HeartHandshake, School } from 'lucide-react';

export default function HelpPage() {
  return (
    <main
      className="min-h-[100dvh] bg-[#112419] dark:bg-[#0a1710] text-amber-100 flex flex-col font-sans"
      style={{
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)',
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)',
      }}
    >
      <div className="max-w-md mx-auto w-full px-5 flex-1 flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center gap-3 py-2">
          <Link
            href="/"
            className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center -ml-2 rounded-full text-amber-200/80 hover:text-white"
            aria-label="กลับหน้าหลัก"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <School className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl font-bold text-amber-100">แหล่งความช่วยเหลือทางใจ</h1>
          </div>
        </div>

        {/* Friendly disclaimer */}
        <div className="p-4 bg-amber-950/60 border-2 border-amber-800/80 rounded-2xl flex items-start gap-3 shadow-md">
          <Heart className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-200/90 leading-relaxed">
            <strong>Yanin Board</strong> เป็นพื้นที่สำหรับเขียนข้อความ วาดรูป และส่งต่อความอบอุ่น หากคุณหรือคนที่คุณรู้จักกำลังเผชิญกับความทุกข์ใจ สามารถโทรติดต่อสายด่วนผู้เชี่ยวชาญด้านล่างได้ทันทีโดยไม่มีค่าใช้จ่าย
          </p>
        </div>

        {/* Hotlines */}
        <div className="flex flex-col gap-3">
          <h2 className="text-xs font-semibold text-amber-300 uppercase tracking-wider">
            สายด่วนสุขภาพจิตและฉุกเฉิน
          </h2>

          {/* Hotline 1323 */}
          <a
            href="tel:1323"
            className="p-4 bg-stone-900/90 border-2 border-[#8b5a2b] rounded-2xl shadow-md flex items-center justify-between active:scale-98 transition-all hover:border-rose-400 group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-rose-950/60 border border-rose-700/50 flex items-center justify-center text-rose-400 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-stone-100">
                  สายด่วนสุขภาพจิต 1323
                </h3>
                <p className="text-xs text-stone-400">
                  กรมสุขภาพจิต กระทรวงสาธารณสุข (โทรฟรี 24 ชม.)
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold px-3 py-1.5 bg-rose-600 text-white rounded-xl shadow-xs">
              โทรออก
            </span>
          </a>

          {/* Hotline 1669 */}
          <a
            href="tel:1669"
            className="p-4 bg-stone-900/90 border-2 border-[#8b5a2b] rounded-2xl shadow-md flex items-center justify-between active:scale-98 transition-all hover:border-amber-400 group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-amber-950/60 border border-amber-700/50 flex items-center justify-center text-amber-400 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-stone-100">
                  สายด่วนฉุกเฉิน 1669
                </h3>
                <p className="text-xs text-stone-400">
                  ศูนย์รับแจ้งเหตุฉุกเฉินทางการแพทย์ (24 ชม.)
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold px-3 py-1.5 bg-amber-600 text-white rounded-xl shadow-xs">
              โทรออก
            </span>
          </a>

          {/* Samaritans Thailand */}
          <a
            href="tel:021136789"
            className="p-4 bg-stone-900/90 border-2 border-[#8b5a2b] rounded-2xl shadow-md flex items-center justify-between active:scale-98 transition-all hover:border-sky-400 group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-sky-950/60 border border-sky-700/50 flex items-center justify-center text-sky-400 group-hover:bg-sky-600 group-hover:text-white transition-colors">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-stone-100">
                  สมาคมสะมาริตันส์แห่งประเทศไทย
                </h3>
                <p className="text-xs text-stone-400">
                  รับฟังด้วยใจ เพื่อป้องกันการทำร้ายตัวเอง (12:00 - 22:00 น.)
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold px-3 py-1.5 bg-sky-600 text-white rounded-xl shadow-xs">
              โทรออก
            </span>
          </a>
        </div>

        {/* Classroom Community Guidelines */}
        <div className="mt-4 p-4 bg-black/40 border border-amber-900/40 rounded-2xl flex flex-col gap-2">
          <div className="flex items-center gap-2 text-amber-200 font-medium text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>กติกาห้องเรียนกระดานดำ</span>
          </div>
          <ul className="text-xs text-stone-300 list-disc list-inside space-y-1 pl-1">
            <li>เขียนแบ่งปันสิ่งดีๆ ไม่บูลลี่หรือประจานใคร</li>
            <li>ไม่ใส่ข้อมูลติดต่อส่วนตัวของตนเองหรือผู้อื่น</li>
            <li>ไม่ลงโฆษณาหรือแปะสแปม</li>
            <li>ไม่แนะนำหรือยุยงวิธีทำร้ายตัวเอง</li>
            <li>ถ้ารู้สึกไม่ไหว มีคนพร้อมรับฟังเสมอที่ 1323</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
