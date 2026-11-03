'use client';

import React, { useState, useEffect } from 'react';
import { NoteStroke, CreateNotePayload } from '@/types/note';
import { DrawingCanvas } from './DrawingCanvas';
import { CrisisModal } from './CrisisModal';
import { checkSafety } from '@/lib/safety';
import { getOrCreateDeviceId, generateRandomToken, saveEditToken } from '@/lib/device';
import { X, Send, AlertCircle, GripHorizontal, Pipette, Palette } from 'lucide-react';

interface ComposerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostSuccess: () => void;
  onStartDragNote?: (notePayload: Partial<CreateNotePayload>) => void;
}

// Preset pastel favorites + custom color picker
const PRESET_COLORS = [
  { hex: '#fef08a', name: 'เหลืองคลาสสิก' },
  { hex: '#fbcfe8', name: 'ชมพูพาสเทล' },
  { hex: '#bae6fd', name: 'ฟ้าสดใส' },
  { hex: '#bbf7d0', name: 'เขียวมิ้นต์' },
  { hex: '#e9d5ff', name: 'ม่วงลาเวนเดอร์' },
  { hex: '#fed7aa', name: 'ส้มพีช' },
  { hex: '#fff1c5', name: 'ครีมวานิลลา' },
  { hex: '#c5f6fa', name: 'เขียวทะเล' },
];

const DRAFT_KEY = 'yanin_composer_draft_v3';

export const ComposerModal: React.FC<ComposerModalProps> = ({
  isOpen,
  onClose,
  onPostSuccess,
  onStartDragNote,
}) => {
  const [tab, setTab] = useState<'text' | 'drawing'>('text');
  const [color, setColor] = useState<string>('#fef08a');
  const [bodyText, setBodyText] = useState<string>('');
  const [drawingStrokes, setDrawingStrokes] = useState<NoteStroke[]>([]);
  const [caption, setCaption] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [piiError, setPiiError] = useState<string | null>(null);
  const [showCrisisModal, setShowCrisisModal] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.tab) setTab(parsed.tab);
        if (parsed.color) setColor(parsed.color);
        if (parsed.bodyText) setBodyText(parsed.bodyText);
        if (parsed.caption) setCaption(parsed.caption);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    try {
      localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({ tab, color, bodyText, caption })
      );
    } catch {}
  }, [tab, color, bodyText, caption, isOpen]);

  if (!isOpen) return null;

  const clearDraft = () => {
    setBodyText('');
    setDrawingStrokes([]);
    setCaption('');
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {}
  };

  const checkContentSafety = () => {
    const textToCheck = `${bodyText} ${caption}`.trim();
    const safety = checkSafety(textToCheck);

    if (safety.hasPII) {
      setPiiError(`โปรดนำข้อมูลติดต่อออกก่อนแปะนะ: ${safety.piiReasons.join(', ')}`);
      return { allowed: false, isCrisis: false };
    }

    if (safety.isAbusive) {
      setPiiError('ข้อความมีคำที่ไม่สุภาพ โปรดปรับเปลี่ยนก่อนแปะนะ');
      return { allowed: false, isCrisis: false };
    }

    setPiiError(null);
    return { allowed: true, isCrisis: safety.isCrisis };
  };

  const executeSubmit = async (forcePostAfterCrisis = false) => {
    const safety = checkContentSafety();
    if (!safety.allowed) return;

    if (safety.isCrisis && !forcePostAfterCrisis) {
      setShowCrisisModal(true);
      return;
    }

    setShowCrisisModal(false);
    setIsSubmitting(true);

    try {
      const deviceId = getOrCreateDeviceId();
      const editToken = generateRandomToken(32);

      const payload: CreateNotePayload = {
        kind: tab,
        body: tab === 'text' ? bodyText.trim() : undefined,
        strokes: tab === 'drawing' ? drawingStrokes : undefined,
        caption: tab === 'drawing' ? caption.trim() : undefined,
        color,
        device_hash: deviceId,
        edit_token: editToken,
      };

      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'เกิดข้อผิดพลาดในการแปะโพสต์อิท');
      }

      saveEditToken(data.note.id, editToken);

      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(40);
      }

      clearDraft();
      onPostSuccess();
      onClose();
    } catch (err: any) {
      setPiiError(err.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentPayloadForDrag: Partial<CreateNotePayload> = {
    kind: tab,
    body: tab === 'text' ? bodyText.trim() : undefined,
    strokes: tab === 'drawing' ? drawingStrokes : undefined,
    caption: tab === 'drawing' ? caption.trim() : undefined,
    color,
  };

  const isReadyToPost =
    tab === 'text' ? bodyText.trim().length > 0 : drawingStrokes.length > 0;

  const handleDragStart = (e: React.DragEvent) => {
    const safety = checkContentSafety();
    if (!safety.allowed) {
      e.preventDefault();
      return;
    }
    const dataString = JSON.stringify(currentPayloadForDrag);
    e.dataTransfer.setData('text/plain', dataString);
    e.dataTransfer.effectAllowed = 'copyMove';
    if (onStartDragNote) {
      onStartDragNote(currentPayloadForDrag);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
        <div
          className="bg-stone-50 dark:bg-stone-900 rounded-3xl w-full max-w-lg flex flex-col shadow-2xl border-4 border-[#8b5a2b] dark:border-stone-800 max-h-[90dvh] overflow-hidden"
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 12px)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-stone-200 dark:border-stone-800 bg-[#fdfbf7] dark:bg-stone-900">
            {/* Tabs */}
            <div className="flex items-center bg-stone-200/80 dark:bg-stone-800 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setTab('text')}
                className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all min-h-[36px] ${
                  tab === 'text'
                    ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs'
                    : 'text-stone-600 dark:text-stone-400'
                }`}
              >
                ✏️ ชอล์ก / ปากกา
              </button>
              <button
                type="button"
                onClick={() => setTab('drawing')}
                className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all min-h-[36px] ${
                  tab === 'drawing'
                    ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs'
                    : 'text-stone-600 dark:text-stone-400'
                }`}
              >
                🎨 วาดรูป
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-full"
              aria-label="ปิด"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-5 py-3.5 flex flex-col gap-3.5">
            {piiError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs rounded-xl flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{piiError}</span>
              </div>
            )}

            {/* Free Custom Color Picker Toolbar */}
            <div className="flex flex-col gap-2 p-2.5 bg-stone-100 dark:bg-stone-800/60 rounded-2xl border border-stone-200/80 dark:border-stone-700">
              <div className="flex items-center justify-between text-xs font-medium text-stone-700 dark:text-stone-300">
                <span className="flex items-center gap-1.5">
                  <Palette className="w-4 h-4 text-amber-600" />
                  <span>เลือกสีกระดาษอิสระ:</span>
                </span>
                
                {/* Custom Color Input Wheel */}
                <label className="flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-stone-700 border border-stone-300 dark:border-stone-600 rounded-xl cursor-pointer hover:bg-stone-50 active:scale-95 transition-all text-[11px] font-semibold text-stone-700 dark:text-stone-200">
                  <Pipette className="w-3.5 h-3.5 text-amber-600" />
                  <span>เลือกสีเอง ({color.toUpperCase()})</span>
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-0 h-0 opacity-0 absolute"
                  />
                  <div
                    className="w-4 h-4 rounded-full border border-stone-400 shadow-2xs"
                    style={{ backgroundColor: color }}
                  />
                </label>
              </div>

              {/* Preset Color Swatches */}
              <div className="flex items-center gap-2 overflow-x-auto py-1">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setColor(c.hex)}
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 transition-transform active:scale-90 shrink-0 ${
                      color.toLowerCase() === c.hex.toLowerCase()
                        ? 'border-stone-800 dark:border-white scale-115 shadow-sm ring-2 ring-amber-400'
                        : 'border-white dark:border-stone-700'
                    }`}
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                    aria-label={`เลือกสี ${c.name}`}
                  />
                ))}
              </div>
            </div>

            {/* Text Mode */}
            {tab === 'text' && (
              <div className="flex-1 flex flex-col">
                <div
                  className="w-full min-h-[190px] rounded-2xl p-4 transition-colors postit-shadow flex flex-col justify-between border border-black/10"
                  style={{ backgroundColor: color }}
                >
                  <textarea
                    value={bodyText}
                    onChange={(e) => {
                      setBodyText(e.target.value);
                      setPiiError(null);
                    }}
                    maxLength={280}
                    placeholder="เขียนข้อความ การบ้าน ไอเดีย หรือบันทึกที่อยากแปะบนกระดานดำ..."
                    className="w-full flex-1 bg-transparent resize-none outline-none postit-handwriting text-stone-900 placeholder:text-stone-600/70 text-lg leading-relaxed"
                    style={{ fontSize: '18px' }}
                  />
                  <div className="flex justify-end text-xs text-stone-700 font-mono">
                    {bodyText.length}/280
                  </div>
                </div>
              </div>
            )}

            {/* Drawing Mode */}
            {tab === 'drawing' && (
              <div className="flex-1 flex flex-col items-center">
                <DrawingCanvas
                  initialStrokes={drawingStrokes}
                  onStrokesChange={(strokes) => {
                    setDrawingStrokes(strokes);
                    setPiiError(null);
                  }}
                />
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  maxLength={100}
                  placeholder="เขียนคำบรรยายภาพ (ไม่บังคับ)..."
                  className="w-full mt-2.5 px-3.5 py-2.5 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm outline-none"
                  style={{ fontSize: '16px' }}
                />
              </div>
            )}

            {/* Drag Hint Card if ready */}
            {isReadyToPost && (
              <div
                draggable
                onDragStart={handleDragStart}
                className="cursor-grab active:cursor-grabbing p-3 rounded-2xl border-2 border-dashed border-amber-500 bg-amber-50 dark:bg-amber-950/30 flex items-center justify-between text-xs text-amber-900 dark:text-amber-200 transition-all hover:bg-amber-100 select-none shadow-xs"
              >
                <div className="flex items-center gap-2">
                  <GripHorizontal className="w-5 h-5 text-amber-600 shrink-0" />
                  <span className="font-medium">
                    🖐️ สามารถคลิกหรือแตะแผ่นนี้ลากไปแปะบนกระดานดำได้เลย!
                  </span>
                </div>
                <span className="text-[11px] bg-amber-300 text-amber-950 px-2 py-1 rounded-lg font-bold shrink-0">
                  ลากได้
                </span>
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="px-5 py-3.5 border-t border-stone-200 dark:border-stone-800 flex items-center justify-end gap-3 bg-[#fdfbf7] dark:bg-stone-900">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs text-stone-500 hover:text-stone-700 dark:text-stone-400 min-h-[44px]"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              onClick={() => executeSubmit(false)}
              disabled={isSubmitting || !isReadyToPost}
              className="min-h-[48px] px-6 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-sm active:scale-98 disabled:opacity-40 transition-all"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'กำลังแปะ...' : 'แปะบนกระดาน'}</span>
            </button>
          </div>
        </div>
      </div>

      <CrisisModal
        isOpen={showCrisisModal}
        onProceed={() => executeSubmit(true)}
        onCancel={() => setShowCrisisModal(false)}
      />
    </>
  );
};
