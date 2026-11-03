'use client';

import React, { useState, useEffect } from 'react';
import { Note } from '@/types/note';
import {
  ShieldCheck,
  ShieldAlert,
  EyeOff,
  RotateCcw,
  Trash2,
  X,
  RefreshCw,
  LogOut,
  Megaphone,
  Sparkles,
} from 'lucide-react';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminToken: string;
  onLogout: () => void;
  onBoardReset?: () => void;
  onAnnouncementUpdated?: (text: string) => void;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  isOpen,
  onClose,
  adminToken,
  onLogout,
  onBoardReset,
  onAnnouncementUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'flagged' | 'reported' | 'settings'>('all');
  const [notes, setNotes] = useState<Note[]>([]);
  const [flagged, setFlagged] = useState<Note[]>([]);
  const [reported, setReported] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [announcementText, setAnnouncementText] = useState('เวรประจำวัน: ช่วยกันส่งต่อรอยยิ้ม');
  const [announcementMsg, setAnnouncementMsg] = useState<string | null>(null);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/notes', {
        headers: {
          'x-admin-key': adminToken,
        },
      });
      const data = await res.json();
      if (data.success && data.queue) {
        setNotes(data.queue.allNotes || []);
        setFlagged(data.queue.flagged || []);
        setReported(data.queue.reported || []);
      }
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      fetchAdminData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAction = async (noteId: string, action: 'hide' | 'restore' | 'delete') => {
    try {
      const res = await fetch('/api/admin/action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminToken,
        },
        body: JSON.stringify({ note_id: noteId, action }),
      });
      const data = await res.json();
      if (data.success) {
        fetchAdminData();
        if (onBoardReset) onBoardReset();
      } else {
        alert(data.error);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleResetBoard = async () => {
    if (!window.confirm('คุณต้องการล้างโพสต์ทั้งหมดและคืนค่ากระดานดำสู่เริ่มต้นใช่หรือไม่?')) return;
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminToken,
        },
        body: JSON.stringify({ action: 'reset_board' }),
      });
      const data = await res.json();
      if (data.success) {
        alert('คืนค่ากระดานดำสะอาดเรียบร้อยแล้ว');
        fetchAdminData();
        if (onBoardReset) onBoardReset();
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSaveAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminToken,
        },
        body: JSON.stringify({ action: 'set_announcement', announcement: announcementText }),
      });
      const data = await res.json();
      if (data.success) {
        setAnnouncementMsg('อัปเดตข้อความบนกระดานดำสำเร็จ! ✨');
        if (onAnnouncementUpdated) onAnnouncementUpdated(announcementText);
        setTimeout(() => setAnnouncementMsg(null), 3000);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const currentList =
    activeTab === 'flagged' ? flagged : activeTab === 'reported' ? reported : notes;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <div className="bg-[#fdfbf7] dark:bg-stone-900 w-full max-w-3xl rounded-3xl border-4 border-[#8b5a2b] shadow-2xl p-4 sm:p-6 flex flex-col gap-4 text-stone-800 dark:text-stone-100 max-h-[90dvh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-amber-950 dark:text-amber-100 flex items-center gap-2">
                <span>แผงควบคุมผู้ดูแล (Admin Panel)</span>
                <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.2 rounded-full font-medium">
                  ล็อกอินแล้ว
                </span>
              </h2>
              <p className="text-[11px] text-stone-500">
                จัดการโพสต์ ควบคุมความปลอดภัย และปรับแต่งห้องเรียน Yanin
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onLogout}
              className="px-3 py-1.5 bg-stone-200 dark:bg-stone-800 hover:bg-rose-100 dark:hover:bg-rose-950/40 text-stone-700 dark:text-stone-300 hover:text-rose-600 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>ออกจากระบบ</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="ปิดแผงควบคุม"
              className="p-1.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'all'
                ? 'bg-amber-700 text-white font-semibold shadow-xs'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
            }`}
          >
            โพสต์ทั้งหมด ({notes.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('reported')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'reported'
                ? 'bg-amber-700 text-white font-semibold shadow-xs'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
            }`}
          >
            ถูกรายงาน ({reported.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('flagged')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'flagged'
                ? 'bg-rose-600 text-white font-semibold shadow-xs'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
            }`}
          >
            เสี่ยงวิกฤติ ({flagged.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'settings'
                ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 font-semibold shadow-xs'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
            }`}
          >
            ⚙️ ตั้งค่ากระดาน
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto pr-1">
          {activeTab === 'settings' ? (
            /* Settings Tab */
            <div className="flex flex-col gap-4 py-2">
              {/* Daily Duty Announcement Card */}
              <form
                onSubmit={handleSaveAnnouncement}
                className="p-4 bg-white dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700 flex flex-col gap-2.5"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-amber-900 dark:text-amber-200">
                  <Megaphone className="w-4 h-4 text-amber-600" />
                  <span>แก้ไขข้อความเวรประจำวันบนกระดานดำ</span>
                </div>
                <input
                  type="text"
                  value={announcementText}
                  onChange={(e) => setAnnouncementText(e.target.value)}
                  placeholder="เช่น เวรประจำวัน: ช่วยกันส่งต่อรอยยิ้ม"
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-600 bg-transparent text-sm outline-none"
                />
                {announcementMsg && (
                  <p className="text-xs text-emerald-600 font-semibold">{announcementMsg}</p>
                )}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-amber-700 hover:bg-amber-600 text-white rounded-xl text-xs font-semibold shadow-xs"
                  >
                    บันทึกข้อความ
                  </button>
                </div>
              </form>

              {/* Reset Chalkboard Button */}
              <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-2xl border border-amber-300/40 flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-amber-950 dark:text-amber-200 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>คืนค่ากระดานดำ (Reset Board)</span>
                  </h4>
                  <p className="text-[11px] text-stone-600 dark:text-stone-400 mt-0.5">
                    ล้างโน้ตทดสอบที่รกออกทั้งหมด แล้วคืนค่าเป็นแผ่นตัวอย่าง 4 แผ่นสะอาดตา
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleResetBoard}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold shadow-xs shrink-0 active:scale-95 transition-all"
                >
                  ล้างและคืนค่ากระดาน 🧹
                </button>
              </div>
            </div>
          ) : loading ? (
            <div className="py-20 text-center text-xs text-stone-400 flex flex-col items-center justify-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin text-amber-600" />
              <span>กำลังโหลดข้อมูล...</span>
            </div>
          ) : currentList.length === 0 ? (
            <div className="py-20 text-center text-xs text-stone-400">
              ไม่มีรายการในหมวดนี้ 🎉
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentList.map((note) => (
                <div
                  key={note.id}
                  className="p-3 bg-white dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700 flex flex-col justify-between gap-2 shadow-xs"
                >
                  <div className="flex items-center justify-between text-[10px] text-stone-500 font-mono">
                    <span>{note.id}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded font-semibold ${
                        note.status === 'visible'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {note.status}
                    </span>
                  </div>

                  {/* Note preview box */}
                  <div
                    className="p-2.5 rounded-xl text-xs font-sans border border-black/10 line-clamp-3 postit-handwriting"
                    style={{ backgroundColor: note.color || '#fef08a' }}
                  >
                    {note.kind === 'text' ? note.body : `[ภาพวาด] ${note.caption || ''}`}
                  </div>

                  {note.report_count > 0 && (
                    <div className="text-[10px] text-rose-500 font-semibold">
                      🚨 ถูกรายงาน {note.report_count} ครั้ง
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex items-center gap-1.5 pt-1 border-t border-stone-100 dark:border-stone-700/60">
                    {note.status === 'visible' ? (
                      <button
                        type="button"
                        onClick={() => handleAction(note.id, 'hide')}
                        className="flex-1 py-1 bg-stone-100 dark:bg-stone-700 hover:bg-stone-200 text-stone-700 dark:text-stone-200 rounded-lg text-[11px] font-medium flex items-center justify-center gap-1"
                      >
                        <EyeOff className="w-3 h-3 text-stone-500" />
                        <span>ซ่อน</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleAction(note.id, 'restore')}
                        className="flex-1 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-[11px] font-medium flex items-center justify-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>แสดงคืน</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm('คุณแน่ใจว่าต้องการลบโพสต์นี้ถาวร?')) {
                          handleAction(note.id, 'delete');
                        }
                      }}
                      className="p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg"
                      title="ลบถาวร"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
