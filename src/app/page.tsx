'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Note, CreateNotePayload } from '@/types/note';
import { PostitNote } from '@/components/PostitNote';
import { BottomNav } from '@/components/BottomNav';
import { ComposerModal } from '@/components/ComposerModal';
import { NoteDetailModal } from '@/components/NoteDetailModal';
import { MineView } from '@/components/MineView';
import { getOrCreateDeviceId, generateRandomToken, saveEditToken } from '@/lib/device';
import { WallId, CLASSROOM_WALLS, EdgeNavButtons } from '@/components/classroom/EdgeNavButtons';
import { ClassroomCompass } from '@/components/classroom/ClassroomCompass';
import { CommunityWall } from '@/components/classroom/CommunityWall';
import { DoorWall } from '@/components/classroom/DoorWall';
import { BackWall } from '@/components/classroom/BackWall';
import { AdminLoginModal } from '@/components/AdminLoginModal';
import { AdminDashboardModal } from '@/components/AdminDashboardModal';
import Link from 'next/link';
import {
  HeartHandshake,
  Plus,
  LayoutGrid,
  Maximize2,
  Moon,
  Sun,
  User,
  RefreshCw,
  Sparkles,
  School,
  Layers,
  Key,
  ShieldCheck,
} from 'lucide-react';

export default function HomePage() {
  const [currentTab, setCurrentTab] = useState<'board' | 'mine'>('board');
  const [currentWall, setCurrentWall] = useState<WallId>('front');
  const [viewMode, setViewMode] = useState<'canvas' | 'grid'>('canvas');
  const [notes, setNotes] = useState<Note[]>([]);
  const [maxCapacity, setMaxCapacity] = useState<number>(28);
  const [fallingNoteIds, setFallingNoteIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState<boolean>(true);
  const [isComposerOpen, setIsComposerOpen] = useState<boolean>(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [draggedNotePayload, setDraggedNotePayload] = useState<Partial<CreateNotePayload> | null>(null);
  const [dragOverPos, setDragOverPos] = useState<{ x: number; y: number } | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [adminToken, setAdminToken] = useState<string>('');
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState<boolean>(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState<boolean>(false);
  const [announcement, setAnnouncement] = useState<string>('เวรประจำวัน: ช่วยกันส่งต่อรอยยิ้ม');
  const boardRef = useRef<HTMLDivElement | null>(null);

  // Load dark mode and admin state
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
      const savedToken = localStorage.getItem('yanin_admin_token') || localStorage.getItem('yanin_admin_key');
      if (savedToken) {
        setIsAdmin(true);
        setAdminToken(savedToken);
      }
    }
  }, []);

  const toggleDarkMode = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    if (next) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const fetchNotes = async () => {
    try {
      const res = await fetch('/api/notes?limit=60&offset=0');
      const data = await res.json();
      if (data.success) {
        setNotes(data.notes || []);
        if (data.maxCapacity) setMaxCapacity(data.maxCapacity);
        if (data.announcement) setAnnouncement(data.announcement);
      }
    } catch (e) {
      console.error('Error fetching notes', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  // 4-Wall Classroom Navigation Helpers
  const rotateLeft = () => {
    const currentIndex = CLASSROOM_WALLS.findIndex((w) => w.id === currentWall);
    const prev = CLASSROOM_WALLS[(currentIndex - 1 + CLASSROOM_WALLS.length) % CLASSROOM_WALLS.length];
    setCurrentWall(prev.id);
  };

  const rotateRight = () => {
    const currentIndex = CLASSROOM_WALLS.findIndex((w) => w.id === currentWall);
    const next = CLASSROOM_WALLS[(currentIndex + 1) % CLASSROOM_WALLS.length];
    setCurrentWall(next.id);
  };

  // Keyboard Navigation: ArrowLeft / ArrowRight to turn walls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isComposerOpen || selectedNote) return;
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }
      if (e.key === 'ArrowLeft') {
        rotateLeft();
      } else if (e.key === 'ArrowRight') {
        rotateRight();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentWall, isComposerOpen, selectedNote]);

  // Realtime polling
  useEffect(() => {
    const timer = setInterval(() => {
      if (currentTab === 'board' && !isComposerOpen) {
        fetch('/api/notes?limit=35&offset=0')
          .then((r) => r.json())
          .then((data) => {
            if (data.success && data.notes) {
              setNotes((prev) => {
                const serverMap = new Map(data.notes.map((n: Note) => [n.id, n]));
                const fallingList = prev.filter((n) => fallingNoteIds.has(n.id) && !serverMap.has(n.id));
                return [...data.notes, ...fallingList];
              });
            }
          })
          .catch(() => {});
      }
    }, 3000);
    return () => clearInterval(timer);
  }, [currentTab, isComposerOpen, fallingNoteIds]);

  // Handle Drag Over Chalkboard
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    if (!boardRef.current) return;
    const rect = boardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setDragOverPos({ x: Math.max(2, Math.min(85, x)), y: Math.max(2, Math.min(85, y)) });
  };

  // Handle Drop onto Chalkboard
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverPos(null);
    if (!boardRef.current) return;

    const rect = boardRef.current.getBoundingClientRect();
    const posX = Math.max(2, Math.min(85, Number((((e.clientX - rect.left) / rect.width) * 100).toFixed(1))));
    const posY = Math.max(2, Math.min(85, Number((((e.clientY - rect.top) / rect.height) * 100).toFixed(1))));

    // Moving existing note
    const movingNoteId = e.dataTransfer.getData('note-id');
    if (movingNoteId) {
      setNotes((prev) =>
        prev.map((n) => (n.id === movingNoteId ? { ...n, posX, posY } : n))
      );
      fetch(`/api/notes/${movingNoteId}/position`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ posX, posY }),
      }).catch(() => {});
      return;
    }

    // Dropping new note from composer
    let payload = draggedNotePayload;
    if (!payload) {
      try {
        const raw = e.dataTransfer.getData('text/plain');
        if (raw) payload = JSON.parse(raw);
      } catch {}
    }

    if (payload && (payload.body || payload.strokes)) {
      const deviceId = getOrCreateDeviceId();
      const editToken = generateRandomToken(32);

      const fullPayload: CreateNotePayload = {
        kind: payload.kind || 'text',
        body: payload.body,
        strokes: payload.strokes,
        caption: payload.caption,
        color: payload.color || '#fef08a',
        posX,
        posY,
        device_hash: deviceId,
        edit_token: editToken,
      };

      try {
        const res = await fetch('/api/notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(fullPayload),
        });
        const data = await res.json();
        if (data.success && data.note) {
          saveEditToken(data.note.id, editToken);

          // If capacity was reached, animate oldest note falling off!
          if (data.oldestFallenNote) {
            setFallingNoteIds((prev) => new Set([...prev, data.oldestFallenNote.id]));
            setTimeout(() => {
              setNotes((prev) => prev.filter((n) => n.id !== data.oldestFallenNote.id));
              setFallingNoteIds((prev) => {
                const next = new Set(prev);
                next.delete(data.oldestFallenNote.id);
                return next;
              });
            }, 1500);
          }

          setNotes((prev) => [data.note, ...prev]);
          setIsComposerOpen(false);
          setDraggedNotePayload(null);
        }
      } catch (err) {
        console.error('Error posting dropped note', err);
      }
    }
  };

  // Admin direct note delete
  const handleAdminDeleteNote = async (noteId: string) => {
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
        body: JSON.stringify({ note_id: noteId, action: 'delete', admin_key: token }),
      });
      const data = await res.json();
      if (data.success) {
        setNotes((prev) => prev.filter((n) => n.id !== noteId));
      } else {
        alert(data.error || 'ลบไม่สำเร็จ');
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <main
      className="min-h-[100dvh] bg-[#112419] dark:bg-[#0a1710] flex flex-col relative select-none"
      style={{
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 8px)',
      }}
    >
      {/* Ambient Thai Classroom AI Background */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-25 dark:opacity-15 bg-cover bg-center transition-opacity"
        style={{
          backgroundImage: `url('/images/thai-classroom-bg.jpg')`,
        }}
        aria-hidden="true"
      />
      {/* Thai Classroom Header Navigation */}
      <header className="w-full max-w-7xl mx-auto px-2.5 sm:px-6 py-1.5 sm:py-2.5 flex items-center justify-between z-30">
        {/* School / Classroom Branding */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-amber-700 border-2 border-amber-500/60 text-amber-200 flex items-center justify-center shadow-md shrink-0">
            <School className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-xl font-bold tracking-tight text-amber-100 flex items-center gap-1.5 sm:gap-2">
              <span>Yanin Board</span>
              <span className="hidden sm:inline-block text-[11px] font-medium text-amber-300 bg-amber-950/60 border border-amber-700/60 px-2 py-0.5 rounded-full">
                🏫 ห้องเรียนกระดานดำ
              </span>
            </h1>
            <p className="text-[11px] text-amber-200/60 hidden sm:block">
              กระดานดำไทยออนไลน์ เขียน วาด หรือลากโพสต์อิทมาแปะแบ่งปันได้ตามใจชอบ
            </p>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* View Mode Toggle: Canvas vs Grid */}
          <div className="hidden sm:flex items-center bg-black/40 backdrop-blur-xs p-1 rounded-xl border border-amber-900/50">
            <button
              type="button"
              onClick={() => setViewMode('canvas')}
              className={`px-3 py-1 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-all ${
                viewMode === 'canvas'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-amber-200/70 hover:text-amber-100'
              }`}
              title="กระดานดำอิสระ (ลากแปะได้)"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>กระดานดำ</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-all ${
                viewMode === 'grid'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-amber-200/70 hover:text-amber-100'
              }`}
              title="ตารางระเบียบ"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>ตาราง</span>
            </button>
          </div>

          {/* "+ แปะโพสต์อิท" button */}
          <button
            type="button"
            onClick={() => setIsComposerOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-4 py-2 min-h-[42px] bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white text-xs font-semibold rounded-xl shadow-md border border-amber-400/40 active:scale-95 transition-all"
            aria-label="เขียนโพสต์อิทใหม่"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>แปะโพสต์อิท</span>
          </button>

          {/* My Notes */}
          <button
            type="button"
            onClick={() => setCurrentTab(currentTab === 'board' ? 'mine' : 'board')}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-2 min-h-[42px] rounded-xl text-xs font-medium border transition-all ${
              currentTab === 'mine'
                ? 'bg-amber-700 border-amber-400 text-white font-semibold'
                : 'bg-black/30 border-amber-900/50 text-amber-200 hover:text-white'
            }`}
          >
            <User className="w-4 h-4" />
            <span>{currentTab === 'mine' ? 'ดูกระดาน' : 'โพสต์ของฉัน'}</span>
          </button>

          {/* Mental Health Hotline */}
          <Link
            href="/help"
            className="p-1.5 sm:px-3 sm:py-2 min-h-[36px] sm:min-h-[42px] min-w-[36px] sm:min-w-[42px] rounded-lg sm:rounded-xl bg-black/30 border border-amber-900/50 flex items-center justify-center gap-1.5 text-rose-400 hover:text-rose-300 active:scale-95 transition-all shadow-xs text-xs font-medium"
            title="แหล่งช่วยเหลือทางใจ (โทร 1323)"
            aria-label="แหล่งช่วยเหลือทางใจ"
          >
            <HeartHandshake className="w-4 h-4 text-rose-400" />
            <span className="hidden md:inline">ช่วยเหลือทางใจ</span>
          </Link>

          {/* Admin Dashboard / Login Button */}
          {isAdmin ? (
            <button
              type="button"
              onClick={() => setIsAdminDashboardOpen(true)}
              className="px-2 sm:px-3 py-1.5 sm:py-2 min-h-[36px] sm:min-h-[42px] rounded-lg sm:rounded-xl bg-amber-600/30 hover:bg-amber-600/50 border border-amber-500/60 text-amber-200 flex items-center gap-1.5 text-xs font-semibold active:scale-95 transition-all shadow-xs"
              title="แผงควบคุมครูเวร (Admin)"
              aria-label="แผงควบคุมครูเวร"
            >
              <ShieldCheck className="w-4 h-4 text-amber-300" />
              <span className="hidden sm:inline">ครูเวร (Admin)</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsAdminLoginOpen(true)}
              className="p-1.5 sm:px-3 sm:py-2 min-h-[36px] sm:min-h-[42px] min-w-[36px] sm:min-w-[42px] rounded-lg sm:rounded-xl bg-black/30 hover:bg-black/50 border border-amber-900/50 text-amber-300/80 hover:text-amber-200 flex items-center justify-center gap-1.5 text-xs font-medium active:scale-95 transition-all shadow-xs"
              title="เข้าสู่ระบบครูเวร / Admin"
              aria-label="เข้าสู่ระบบครูเวร"
            >
              <Key className="w-4 h-4" />
              <span className="hidden md:inline">Admin</span>
            </button>
          )}

          {/* Dark Mode toggle */}
          <button
            type="button"
            onClick={toggleDarkMode}
            className="p-1.5 sm:p-2 min-h-[36px] sm:min-h-[42px] min-w-[36px] sm:min-w-[42px] rounded-lg sm:rounded-xl bg-black/30 border border-amber-900/50 text-amber-300 flex items-center justify-center hover:bg-black/50 active:scale-95 transition-all shadow-xs"
            aria-label="สลับโหมดมืด/สว่าง"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Board View vs Mine View */}
      {currentTab === 'board' ? (
        <div className="flex-1 flex flex-col w-full max-w-7xl mx-auto px-1 sm:px-6 pb-20 sm:pb-6 relative">
          {/* Edge Screen Navigation Buttons for 4 Walls */}
          <EdgeNavButtons
            currentWall={currentWall}
            onRotateLeft={rotateLeft}
            onRotateRight={rotateRight}
          />

          {/* 4-Wall Classroom Direction Compass / Selector */}
          <ClassroomCompass
            currentWall={currentWall}
            onSelectWall={(wall) => setCurrentWall(wall)}
          />

          {/* Mobile subheader bar with capacity and toggle */}
          {currentWall === 'front' && (
            <div className="flex items-center justify-between px-1.5 sm:px-2 py-0.5 sm:py-1 mb-1 text-[11px] sm:text-xs text-amber-200/70">
              {/* Board Capacity Indicator */}
              <div className="flex items-center gap-1 sm:gap-1.5 bg-black/40 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg border border-amber-900/40">
                <Layers className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400" />
                <span>
                  ความจุกระดาน: <strong className="text-amber-300">{notes.length}</strong> / {maxCapacity} แผ่น
                </span>
                <span className="hidden md:inline text-[10px] text-amber-400/80 ml-1">
                  (เมื่อเต็ม โน้ตเก่าจะค่อยๆ ร่วงหล่น)
                </span>
              </div>

              {/* Mobile toggle button */}
              <button
                type="button"
                onClick={() => setViewMode(viewMode === 'canvas' ? 'grid' : 'canvas')}
                className="sm:hidden text-[11px] px-2 py-0.5 bg-black/40 border border-amber-900/40 rounded-lg text-amber-200 font-medium active:scale-95 transition-transform"
              >
                {viewMode === 'canvas' ? 'สลับเป็นตาราง' : 'สลับเป็นกระดานดำ'}
              </button>
            </div>
          )}

          {loading ? (
            <div className="flex-1 py-32 text-center text-xs text-amber-200/50 flex flex-col items-center justify-center gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-amber-400" />
              <span>กำลังเปิดห้องเรียน...</span>
            </div>
          ) : currentWall === 'left' ? (
            /* Left Wall: Anonymous Discussion Board / Community Chat */
            <div className="classroom-wall-enter flex-1 flex flex-col">
              <CommunityWall
                onGoToBoard={() => setCurrentWall('front')}
                isAdmin={isAdmin}
                adminToken={adminToken}
              />
            </div>
          ) : currentWall === 'right' ? (
            /* Right Wall: Classroom Wooden Door & Hallway */
            <div className="classroom-wall-enter flex-1 flex flex-col">
              <DoorWall onGoToBoard={() => setCurrentWall('front')} />
            </div>
          ) : currentWall === 'back' ? (
            /* Back Wall: Exhibition Board & Future Features */
            <div className="classroom-wall-enter flex-1 flex flex-col">
              <BackWall onGoToBoard={() => setCurrentWall('front')} />
            </div>
          ) : viewMode === 'canvas' ? (
            /* Front Wall: Classic Thai Classroom Green Chalkboard */
            <div className="classroom-wall-enter relative flex-1 flex flex-col w-full">
              {/* Wooden Chalkboard Frame with Green Chalk Surface */}
              <div
                ref={boardRef}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="relative flex-1 w-full min-h-[70vh] sm:min-h-[82vh] rounded-xl sm:rounded-2xl chalkboard-frame bg-chalkboard overflow-hidden transition-colors"
              >
                {/* Vintage Classroom Chalk Corner Header */}
                <div className="absolute top-2 left-2.5 sm:top-4 sm:left-6 z-10 pointer-events-none flex flex-col">
                  <span className="chalk-font text-[10px] sm:text-sm tracking-wide opacity-80">
                    กระดานห้องเรียน Yanin 🏫
                  </span>
                  <span className="text-[9px] sm:text-xs text-stone-300/80 postit-handwriting hidden xs:inline">
                    {announcement || 'เวรประจำวัน: ช่วยกันส่งต่อรอยยิ้ม'}
                  </span>
                </div>

                <div className="absolute top-2 right-2.5 sm:top-4 sm:right-6 z-10 pointer-events-none text-right">
                  <span className="chalk-font text-[9px] sm:text-xs opacity-70">
                    วันอังคารที่ ๓ พ.ย. ๒๕๖๙
                  </span>
                </div>

                {/* Drag over drop target indicator */}
                {dragOverPos && (
                  <div
                    className="absolute z-30 w-28 sm:w-36 h-28 sm:h-36 rounded-xl border-2 border-dashed border-amber-300 bg-amber-300/20 backdrop-blur-[1px] pointer-events-none transition-all flex items-center justify-center text-[11px] sm:text-xs text-amber-100 font-bold"
                    style={{ left: `${dragOverPos.x}%`, top: `${dragOverPos.y}%` }}
                  >
                    ปล่อยเพื่อแปะตรงนี้ 📌
                  </div>
                )}

                {/* Chalk Dust Overlay */}
                <div className="absolute inset-0 shadow-[inset_0_4px_30px_rgba(0,0,0,0.6)] pointer-events-none z-10" />

                {/* Post-it Notes on Chalkboard (Stacked newest-on-top via zIndex) */}
                {notes.map((note, index) => (
                  <PostitNote
                    key={note.id}
                    note={note}
                    isAbsolute
                    zIndex={notes.length - index + 20}
                    isFalling={fallingNoteIds.has(note.id)}
                    isAdmin={isAdmin}
                    onAdminDelete={handleAdminDeleteNote}
                    onDragStart={(e) => {
                      e.dataTransfer.setData('note-id', note.id);
                    }}
                    onClick={() => setSelectedNote(note)}
                  />
                ))}

                {notes.length === 0 && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 pointer-events-none z-10">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-black/40 text-amber-300 flex items-center justify-center mb-3 border border-amber-600/40">
                      <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <h3 className="text-sm sm:text-base font-semibold text-amber-100 chalk-font">กระดานดำยังว่างอยู่</h3>
                    <p className="text-[11px] sm:text-xs text-stone-300/70 mt-1">
                      คลิก "+ แปะโพสต์อิท" แล้วลากแผ่นกระดาษมาติดบนกระดานได้เลย!
                    </p>
                  </div>
                )}
              </div>

              {/* Wooden Chalk Tray (รางวางชอล์กด้านล่าง) */}
              <div className="h-4 sm:h-7 bg-[#4d2b0e] border-t sm:border-t-2 border-[#6c411c] shadow-lg rounded-b-lg sm:rounded-b-xl flex items-center justify-between px-3 sm:px-6 z-20">
                {/* Chalk sticks */}
                <div className="flex items-center gap-1 sm:gap-1.5 opacity-80">
                  <div className="w-4 sm:w-8 h-1.5 sm:h-2 bg-white rounded-full shadow-xs" title="ชอล์กขาว" />
                  <div className="w-4 sm:w-8 h-1.5 sm:h-2 bg-yellow-200 rounded-full shadow-xs" title="ชอล์กเหลือง" />
                  <div className="w-3.5 sm:w-7 h-1.5 sm:h-2 bg-sky-200 rounded-full shadow-xs" title="ชอล์กฟ้า" />
                  <div className="w-3.5 sm:w-7 h-1.5 sm:h-2 bg-pink-200 rounded-full shadow-xs" title="ชอล์กชมพู" />
                </div>

                {/* Wooden Felt Eraser (แปรงลบกระดาน) */}
                <div
                  className="flex items-center h-2.5 sm:h-3.5 px-2 sm:px-3 bg-[#8b5a2b] border border-[#3b1f08] rounded shadow-xs text-[8px] sm:text-[9px] text-amber-100/90 font-mono tracking-tighter"
                  title="แปรงลบกระดาน"
                >
                  แปรงลบกระดาน
                </div>
              </div>
            </div>
          ) : (
            /* Responsive Grid Mode with Chalkboard Theme */
            <div className="classroom-wall-enter grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-4 p-2 sm:p-3 bg-chalkboard rounded-xl sm:rounded-2xl border-2 sm:border-4 border-[#6c411c]">
              {notes.map((note) => (
                <PostitNote
                  key={note.id}
                  note={note}
                  isFalling={fallingNoteIds.has(note.id)}
                  isAdmin={isAdmin}
                  onAdminDelete={handleAdminDeleteNote}
                  onClick={() => setSelectedNote(note)}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <MineView
          onSelectNote={(note) => setSelectedNote(note)}
          onOpenComposer={() => setIsComposerOpen(true)}
        />
      )}

      {/* Mobile Bottom Navigation (Visible on mobile screens) */}
      <div className="sm:hidden">
        <BottomNav
          currentTab={currentTab}
          onTabChange={(tab) => setCurrentTab(tab)}
          onOpenComposer={() => setIsComposerOpen(true)}
        />
      </div>

      {/* Composer Modal */}
      <ComposerModal
        isOpen={isComposerOpen}
        onClose={() => setIsComposerOpen(false)}
        onPostSuccess={() => {
          setCurrentWall('front');
          fetchNotes();
        }}
        onStartDragNote={(payload) => {
          setCurrentWall('front');
          setDraggedNotePayload(payload);
          setIsComposerOpen(false);
        }}
      />

      {/* Note Detail Modal */}
      <NoteDetailModal
        note={selectedNote}
        onClose={() => setSelectedNote(null)}
        isAdmin={isAdmin}
        adminToken={adminToken}
        onNoteDeleted={(deletedId) => {
          setNotes((prev) => prev.filter((n) => n.id !== deletedId));
        }}
        onReactionUpdated={(updatedId, counts) => {
          setNotes((prev) =>
            prev.map((n) => (n.id === updatedId ? { ...n, reaction_counts: counts } : n))
          );
        }}
      />

      {/* Admin Login Modal (Public users NEVER have to login) */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onLoginSuccess={(token) => {
          setIsAdmin(true);
          setAdminToken(token);
          setIsAdminDashboardOpen(true);
        }}
      />

      {/* Admin Management Dashboard Modal */}
      <AdminDashboardModal
        isOpen={isAdminDashboardOpen}
        onClose={() => setIsAdminDashboardOpen(false)}
        adminToken={adminToken}
        onLogout={() => {
          setIsAdmin(false);
          setAdminToken('');
          setIsAdminDashboardOpen(false);
        }}
        onBoardReset={() => {
          fetchNotes();
        }}
        onAnnouncementUpdated={(newText) => {
          setAnnouncement(newText);
        }}
      />
    </main>
  );
}
