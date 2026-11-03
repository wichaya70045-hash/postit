'use client';

import React, { useState, useEffect } from 'react';
import { Note } from '@/types/note';
import { PostitNote } from './PostitNote';
import { getOrCreateDeviceId, getOwnedNoteIds, removeEditToken, getEditToken } from '@/lib/device';
import Link from 'next/link';
import { Heart, Moon, Sun, Trash2, HeartHandshake, ShieldCheck, School } from 'lucide-react';

interface MineViewProps {
  onSelectNote: (note: Note) => void;
  onOpenComposer: () => void;
}

export const MineView: React.FC<MineViewProps> = ({ onSelectNote, onOpenComposer }) => {
  const [myNotes, setMyNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isDark = document.documentElement.classList.contains('dark');
      setIsDarkMode(isDark);
    }
    fetchMyNotes();
  }, []);

  const fetchMyNotes = async () => {
    setLoading(true);
    try {
      const deviceId = getOrCreateDeviceId();
      const noteIds = getOwnedNoteIds();

      const res = await fetch('/api/notes/mine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ device_hash: deviceId, note_ids: noteIds }),
      });
      const data = await res.json();
      if (data.success) {
        setMyNotes(data.notes || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleDarkMode = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    if (next) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleDeleteNote = async (e: React.MouseEvent, noteId: string) => {
    e.stopPropagation();
    if (!window.confirm('คุณต้องการลบโพสต์อิทนี้ใช่ไหม?')) return;

    const token = getEditToken(noteId);
    if (!token) {
      alert('ไม่พบโทเคนยืนยันสำหรับโพสต์นี้');
      return;
    }

    try {
      const res = await fetch(`/api/notes/${noteId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ edit_token: token }),
      });
      const data = await res.json();
      if (data.success) {
        removeEditToken(noteId);
        setMyNotes((prev) => prev.filter((n) => n.id !== noteId));
      }
    } catch {}
  };

  return (
    <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-4 pt-3 pb-24 sm:pb-8">
      {/* Top Header Card */}
      <div className="bg-stone-900/80 backdrop-blur-md rounded-2xl p-4 shadow-md border-2 border-[#6c411c] mb-4 flex items-center justify-between text-amber-100">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-800/80 rounded-xl text-amber-300">
            <School className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-amber-100">
              โพสต์อิทของฉัน (บันทึกโต๊ะเรียน)
            </h2>
            <p className="text-xs text-amber-200/60">
              เก็บไว้ในเครื่องนี้แบบไม่ระบุชื่อ สามารถจัดการหรือลบได้ตลอดเวลา
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={toggleDarkMode}
          className="p-2.5 min-w-[44px] min-h-[44px] rounded-xl bg-black/40 text-amber-300 border border-amber-900/50 flex items-center justify-center hover:bg-black/60 active:scale-95 transition-all"
          aria-label={isDarkMode ? 'เปลี่ยนเป็นโหมดสว่าง' : 'เปลี่ยนเป็นโหมดมืด'}
        >
          {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>

      {/* Mental Health Hotline Banner */}
      <Link
        href="/help"
        className="mb-4 p-3.5 bg-gradient-to-r from-rose-950/40 to-amber-950/40 border border-rose-800/50 rounded-2xl flex items-center justify-between active:scale-98 transition-all shadow-xs"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-rose-600 text-white rounded-xl shadow-xs">
            <HeartHandshake className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-rose-200">
              ต้องการคนรับฟังหรือกำลังใจ?
            </div>
            <div className="text-[11px] text-stone-300/80">
              สายด่วนสุขภาพจิต 1323 โทรฟรี 24 ชั่วโมง
            </div>
          </div>
        </div>
        <span className="text-xs text-rose-400 font-semibold px-2">
          ดูข้อมูล &rarr;
        </span>
      </Link>

      {/* My notes list */}
      {loading ? (
        <div className="py-12 text-center text-xs text-amber-200/50">กำลังโหลด...</div>
      ) : myNotes.length === 0 ? (
        <div className="py-16 flex flex-col items-center justify-center text-center px-4 bg-black/30 rounded-3xl border border-amber-900/40">
          <div className="w-16 h-16 rounded-full bg-amber-950/60 border border-amber-700/50 flex items-center justify-center text-amber-400 mb-3">
            <Heart className="w-7 h-7" />
          </div>
          <h3 className="text-sm font-semibold text-amber-100 mb-1">
            ยังไม่มีโพสต์อิทจากเครื่องนี้
          </h3>
          <p className="text-xs text-stone-300/70 mb-4">
            เขียนข้อความหรือวาดรูปแล้วลากไปติดบนกระดานดำได้เลยนะ
          </p>
          <button
            type="button"
            onClick={onOpenComposer}
            className="px-5 py-2.5 min-h-[44px] bg-amber-600 hover:bg-amber-700 active:scale-95 text-white text-xs font-semibold rounded-xl shadow-md transition-all border border-amber-400/40"
          >
            + เขียนโพสต์อิทแผ่นแรก
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-3 bg-chalkboard rounded-2xl border-4 border-[#6c411c]">
          {myNotes.map((note) => (
            <div key={note.id} className="relative group">
              <PostitNote note={note} onClick={() => onSelectNote(note)} />
              <button
                type="button"
                onClick={(e) => handleDeleteNote(e, note.id)}
                className="absolute -top-1.5 -right-1.5 z-30 w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-md active:scale-90 hover:bg-rose-700 transition-all border-2 border-white"
                title="ลบโพสต์นี้"
                aria-label="ลบโพสต์นี้"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Privacy Notice Card */}
      <div className="mt-8 p-4 bg-black/30 rounded-2xl flex items-start gap-2.5 text-stone-300 text-xs border border-amber-900/30">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>ความเป็นส่วนตัว:</strong> เราไม่เก็บชื่อ อีเมล หรือเบอร์โทรของคุณ โทเคนในการลบโพสต์จะถูกบันทึกไว้ในเบราว์เซอร์ของเครื่องนี้เท่านั้น
        </p>
      </div>
    </div>
  );
};
