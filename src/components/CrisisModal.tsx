'use client';

import React from 'react';
import { Phone, Heart, ExternalLink, X } from 'lucide-react';

interface CrisisModalProps {
  isOpen: boolean;
  onProceed: () => void;
  onCancel: () => void;
}

export const CrisisModal: React.FC<CrisisModalProps> = ({
  isOpen,
  onProceed,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-stone-900 w-full max-w-md rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl border border-stone-200 dark:border-stone-800 flex flex-col gap-4">
        {/* Header with gentle icon */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-rose-500">
            <div className="p-2.5 rounded-full bg-rose-50 dark:bg-rose-950/40">
              <Heart className="w-6 h-6 fill-rose-500" />
            </div>
            <h3 className="text-lg font-semibold text-stone-800 dark:text-stone-100">
              เราได้ยินคุณนะ...
            </h3>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-2 text-stone-400 hover:text-stone-600 rounded-full"
            aria-label="ปิด"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Compassionate message */}
        <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
          หากตอนนี้รู้สึกว่าเรื่องราวในใจมันหนักเกินจะแบกไว้คนเดียว อยากบอกว่าคุณไม่ได้อยู่ลำพัง และมีคนที่พร้อมรับฟังคุณอย่างเข้าใจเสมอ
        </p>

        {/* Hotline Call Button (tel:1323) */}
        <div className="flex flex-col gap-2 pt-1">
          <a
            href="tel:1323"
            className="w-full min-h-[48px] bg-rose-500 hover:bg-rose-600 active:scale-98 text-white font-medium rounded-xl flex items-center justify-center gap-2.5 shadow-sm transition-all"
          >
            <Phone className="w-5 h-5" />
            <span>โทรสายด่วนสุขภาพจิต 1323 (โทรฟรี)</span>
          </a>

          <a
            href="tel:1669"
            className="w-full min-h-[44px] bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-200 font-medium rounded-xl flex items-center justify-center gap-2 hover:bg-stone-200 active:scale-98 transition-all text-sm"
          >
            <Phone className="w-4 h-4 text-stone-500" />
            <span>เบอร์ฉุกเฉินทางการแพทย์ 1669</span>
          </a>
        </div>

        {/* Actions: Proceed to post or talk */}
        <div className="flex items-center justify-between pt-3 border-t border-stone-100 dark:border-stone-800 gap-2">
          <a
            href="/help"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-stone-500 hover:text-stone-700 dark:text-stone-400 flex items-center gap-1 py-2"
          >
            <span>แหล่งความช่วยเหลืออื่นๆ</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          <button
            type="button"
            onClick={onProceed}
            className="px-4 py-2.5 min-h-[44px] text-xs font-medium text-stone-600 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 rounded-xl hover:bg-stone-200 active:scale-95 transition-all"
          >
            ยังต้องการแปะบนกระดานต่อ
          </button>
        </div>
      </div>
    </div>
  );
};

