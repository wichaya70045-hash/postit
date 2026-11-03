'use client';

import React, { useState, useEffect } from 'react';
import { Note, ReactionType } from '@/types/note';
import { SvgStrokes } from './SvgStrokes';
import { getOrCreateDeviceId, getEditToken, removeEditToken } from '@/lib/device';
import { X, MoreVertical, Flag, Trash2, HeartHandshake, Check, ShieldAlert } from 'lucide-react';

interface NoteDetailModalProps {
  note: Note | null;
  onClose: () => void;
  onNoteDeleted?: (id: string) => void;
  onReactionUpdated?: (id: string, counts: Note['reaction_counts']) => void;
  isAdmin?: boolean;
  adminToken?: string;
}

const REACTIONS: { type: ReactionType; label: string; icon: string }[] = [
  { type: 'heart', label: 'ถูกใจ', icon: '🤍' },
  { type: 'hug', label: 'ส่งกอด', icon: '🫂' },
  { type: 'sparkle', label: 'ชอบมาก', icon: '✨' },
  { type: 'cheer', label: 'สู้ๆ', icon: '✌️' },
  { type: 'idea', label: 'โดนใจ', icon: '💡' },
];

const REPORT_REASONS = [
  'มีข้อมูลติดต่อหรือข้อมูลส่วนตัว',
  'ถ้อยคำคุกคามหรือไม่เหมาะสม',
  'สแปมหรือโฆษณา',
  'เนื้อหาเกี่ยวกับความปลอดภัย',
];

export const NoteDetailModal: React.FC<NoteDetailModalProps> = ({
  note,
  onClose,
  onNoteDeleted,
  onReactionUpdated,
  isAdmin = false,
  adminToken = '',
}) => {
  const [userReactions, setUserReactions] = useState<ReactionType[]>([]);
  const [currentCounts, setCurrentCounts] = useState<Note['reaction_counts']>({
    heart: 0,
    hug: 0,
    sparkle: 0,
    cheer: 0,
    idea: 0,
  });
  const [isOwner, setIsOwner] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportReason, setReportReason] = useState(REPORT_REASONS[0]);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!note) return;
    setCurrentCounts(
      note.reaction_counts || { heart: 0, hug: 0, sparkle: 0, cheer: 0, idea: 0 }
    );
    const deviceId = getOrCreateDeviceId();
    const editToken = getEditToken(note.id);
    setIsOwner(Boolean(editToken) || note.device_hash === deviceId);

    fetch(`/api/notes/${note.id}?device_hash=${deviceId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.userReactions) {
          setUserReactions((prev) =>
            Array.from(new Set([...prev, ...(data.userReactions || [])]))
          );
        }
      })
      .catch(() => {});
  }, [note]);

  if (!note) return null;

  const handleReact = async (type: ReactionType) => {
    if (userReactions.includes(type)) return;

    const deviceId = getOrCreateDeviceId();
    setUserReactions((prev) => Array.from(new Set([...prev, type])));
    setCurrentCounts((prev) => ({
      ...prev,
      [type]: (prev[type] || 0) + 1,
    }));

    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(30);
    }

    try {
      const res = await fetch(`/api/notes/${note.id}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, device_hash: deviceId }),
      });
      const data = await res.json();
      if (data.success && data.reactionCounts) {
        setCurrentCounts(data.reactionCounts);
        if (onReactionUpdated) {
          onReactionUpdated(note.id, data.reactionCounts);
        }
      }
    } catch {}
  };

  const handleReport = async () => {
    const deviceId = getOrCreateDeviceId();
    try {
      const res = await fetch(`/api/notes/${note.id}/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ device_hash: deviceId, reason: reportReason }),
      });
      const data = await res.json();
      if (data.success) {
        setReportSuccess(true);
        setTimeout(() => {
          setShowReportDialog(false);
          setShowMenu(false);
          setReportSuccess(false);
          if (data.hidden && onNoteDeleted) {
            onNoteDeleted(note.id);
          }
          onClose();
        }, 1200);
      }
    } catch {}
  };

  const handleDelete = async () => {
    if (!window.confirm('คุณแน่ใจว่าต้องการลบโพสต์อิทนี้ใช่ไหม?')) return;
    const editToken = getEditToken(note.id);
    if (!editToken) {
      alert('ไม่พบโทเคนยืนยันความเป็นเจ้าของ');
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/notes/${note.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ edit_token: editToken }),
      });
      const data = await res.json();
      if (data.success) {
        removeEditToken(note.id);
        if (onNoteDeleted) onNoteDeleted(note.id);
        onClose();
      } else {
        alert(data.error || 'ลบโพสต์ไม่สำเร็จ');
      }
    } catch (err: any) {
      alert(err.message || 'เกิดข้อผิดพลาดในการลบโพสต์');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAdminDelete = async () => {
    if (!note) return;
    if (!window.confirm('คุณเป็น Admin: ต้องการลบโพสต์นี้ถาวรใช่ไหม?')) return;
    setIsDeleting(true);
    const token =
      adminToken ||
      (typeof window !== 'undefined'
        ? localStorage.getItem('yanin_admin_token') || localStorage.getItem('yanin_admin_key') || 'admin1234'
        : 'admin1234');
    try {
      const res = await fetch('/api/admin/action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': token,
        },
        body: JSON.stringify({ note_id: note.id, action: 'delete', admin_key: token }),
      });
      const data = await res.json();
      if (data.success) {
        if (onNoteDeleted) onNoteDeleted(note.id);
        onClose();
      } else {
        alert(data.error || 'ลบไม่สำเร็จ');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div
        className="bg-white dark:bg-stone-900 rounded-3xl w-full max-w-md flex flex-col shadow-2xl overflow-hidden border border-stone-200 dark:border-stone-800"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 12px)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-stone-100 dark:border-stone-800">
          <span className="text-xs text-stone-500 font-medium">รายละเอียดโพสต์อิท</span>

          <div className="flex items-center gap-1">
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-stone-400 hover:text-stone-600 rounded-full"
                aria-label="ตัวเลือกเพิ่มเติม"
              >
                <MoreVertical className="w-5 h-5" />
              </button>

              {showMenu && (
                <div className="absolute right-0 top-10 w-44 bg-white dark:bg-stone-800 rounded-xl shadow-lg border border-stone-200 dark:border-stone-700 py-1 z-50 animate-in fade-in zoom-in-95">
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      setShowReportDialog(true);
                    }}
                    className="w-full px-4 py-2.5 text-xs text-left text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 flex items-center gap-2"
                  >
                    <Flag className="w-3.5 h-3.5 text-rose-500" />
                    <span>รายงานโพสต์</span>
                  </button>

                  {isOwner && (
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="w-full px-4 py-2.5 text-xs text-left text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2 border-t border-stone-100 dark:border-stone-700"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{isDeleting ? 'กำลังลบ...' : 'ลบโพสต์ของฉัน'}</span>
                    </button>
                  )}

                  {isAdmin && (
                    <button
                      type="button"
                      onClick={handleAdminDelete}
                      disabled={isDeleting}
                      className="w-full px-4 py-2.5 text-xs text-left text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2 border-t border-stone-100 dark:border-stone-700 font-bold"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{isDeleting ? 'กำลังลบ...' : 'ลบโพสต์ (Admin)'}</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-stone-400 hover:text-stone-600 rounded-full"
              aria-label="ปิด"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Note Card */}
        <div className="p-5 flex items-center justify-center">
          <div
            className="w-full max-w-sm rounded-2xl p-6 postit-shadow flex flex-col justify-between aspect-square select-none border border-black/10"
            style={{
              transform: `rotate(${note.rotation}deg)`,
              backgroundColor: note.color || '#fef08a',
            }}
          >
            <div className="flex-1 flex items-center justify-center overflow-hidden">
              {note.kind === 'text' ? (
                <p className="postit-handwriting text-stone-800 text-center text-xl leading-relaxed break-words w-full">
                  {note.body}
                </p>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center">
                  <SvgStrokes strokes={note.strokes || []} />
                  {note.caption && (
                    <p className="text-xs text-stone-700 postit-handwriting mt-2 text-center">
                      {note.caption}
                    </p>
                  )}
                </div>
              )}
            </div>

            {note.risk_flag && (
              <div className="mt-3 bg-amber-100/95 border border-amber-300 text-amber-900 rounded-xl p-2 text-xs flex items-center justify-center gap-2">
                <HeartHandshake className="w-4 h-4 text-amber-700 shrink-0" />
                <span>หากคุณต้องการคนรับฟัง โทรฟรีสายด่วน 1323</span>
              </div>
            )}
          </div>
        </div>

        {/* Admin Moderation Bar (Prominent Delete for ครูเวร / Admin) */}
        {isAdmin && (
          <div className="px-5 py-2.5 bg-rose-50 dark:bg-rose-950/40 border-t border-rose-200 dark:border-rose-900 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-rose-700 dark:text-rose-300 text-xs font-semibold">
              <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
              <span>สิทธิ์ครูเวร (Admin)</span>
            </div>
            <button
              type="button"
              onClick={handleAdminDelete}
              disabled={isDeleting}
              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isDeleting ? 'กำลังลบ...' : 'ลบโพสต์นี้ (Admin)'}</span>
            </button>
          </div>
        )}

        {/* Reactions Bar (5 Positive Community Options) */}
        <div className="px-5 py-4 border-t border-stone-100 dark:border-stone-800">
          <p className="text-center text-xs text-stone-500 mb-3">แสดงความรู้สึกต่อโพสต์อิทนี้</p>
          <div className="grid grid-cols-5 gap-1.5">
            {REACTIONS.map((r) => {
              const isReacted = userReactions.includes(r.type);
              const count = currentCounts[r.type] || 0;

              return (
                <button
                  key={r.type}
                  type="button"
                  data-testid={`reaction-${r.type}`}
                  aria-label={`รีแอคชัน ${r.label}`}
                  onClick={() => handleReact(r.type)}
                  disabled={isReacted}
                  className={`min-h-[50px] rounded-xl flex flex-col items-center justify-center gap-1 transition-all active:scale-90 ${
                    isReacted
                      ? 'bg-amber-100 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 shadow-xs scale-102'
                      : 'bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300'
                  }`}
                >
                  <span className="text-base leading-none">{r.icon}</span>
                  <span className="text-[10px] font-medium leading-none">
                    {r.label} {count > 0 && `(${count})`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {showReportDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-stone-900 w-full max-w-sm rounded-2xl p-5 shadow-2xl flex flex-col gap-3">
            <h4 className="font-semibold text-stone-800 dark:text-stone-100 text-sm">
              รายงานโพสต์นี้
            </h4>
            <p className="text-xs text-stone-500">
              ช่วยเราดูแลกระดานให้เป็นพื้นที่ปลอดภัยสำหรับทุกคน
            </p>

            {reportSuccess ? (
              <div className="py-4 text-center text-xs text-emerald-600 flex items-center justify-center gap-2">
                <Check className="w-4 h-4" />
                <span>ส่งรายงานเรียบร้อย ขอบคุณครับ</span>
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-1.5 my-1">
                  {REPORT_REASONS.map((r) => (
                    <label
                      key={r}
                      className="flex items-center gap-2.5 p-2 rounded-xl text-xs hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="report_reason"
                        value={r}
                        checked={reportReason === r}
                        onChange={() => setReportReason(r)}
                        className="text-amber-500"
                      />
                      <span className="text-stone-700 dark:text-stone-300">{r}</span>
                    </label>
                  ))}
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
                  <button
                    type="button"
                    onClick={() => setShowReportDialog(false)}
                    className="px-3 py-2 text-xs text-stone-500 min-h-[40px]"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="button"
                    onClick={handleReport}
                    className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white text-xs font-medium rounded-xl min-h-[40px]"
                  >
                    ส่งรายงาน
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
