'use client';

import React, { useState, useEffect } from 'react';
import { Note } from '@/types/note';
import { PostitNote } from '@/components/PostitNote';
import { ShieldAlert, ShieldCheck, EyeOff, RotateCcw, Trash2, Key, Check } from 'lucide-react';

export default function AdminPage() {
  const [adminKey, setAdminKey] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [queue, setQueue] = useState<{ flagged: Note[]; reported: Note[]; allNotes: Note[] }>({
    flagged: [],
    reported: [],
    allNotes: [],
  });
  const [activeTab, setActiveTab] = useState<'flagged' | 'reported' | 'all'>('flagged');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQueue = async (key: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/notes', {
        headers: {
          'x-admin-key': key,
        },
      });
      const data = await res.json();
      if (data.success) {
        setQueue(data.queue);
        setIsAuthenticated(true);
        localStorage.setItem('yanin_admin_key', key);
      } else {
        setError(data.error || 'รหัสแอดมินไม่ถูกต้อง');
      }
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem('yanin_admin_key');
    if (saved) {
      setAdminKey(saved);
      fetchQueue(saved);
    }
  }, []);

  const handleAction = async (noteId: string, action: 'hide' | 'restore' | 'delete') => {
    try {
      const res = await fetch('/api/admin/action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminKey,
        },
        body: JSON.stringify({ note_id: noteId, action }),
      });
      const data = await res.json();
      if (data.success) {
        fetchQueue(adminKey);
      } else {
        alert(data.error);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (!isAuthenticated) {
    return (
      <main className="min-h-[100dvh] bg-stone-100 dark:bg-stone-900 flex items-center justify-center p-4 font-sans">
        <div className="bg-white dark:bg-stone-800 p-6 rounded-2xl shadow-lg max-w-sm w-full border border-stone-200 dark:border-stone-700">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-3">
            <Key className="w-6 h-6" />
          </div>
          <h1 className="text-lg font-bold text-stone-800 dark:text-stone-100 mb-1">
            เข้าสู่ระบบผู้ดูแล (Admin)
          </h1>
          <p className="text-xs text-stone-500 mb-4">
            ใส่รหัส Admin Secret เพื่อเข้าดูคิวตรวจสอบความปลอดภัย
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchQueue(adminKey);
            }}
            className="flex flex-col gap-3"
          >
            <input
              type="password"
              placeholder="ใส่รหัสแอดมิน..."
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-600 bg-transparent text-sm outline-none"
            />
            {error && <div className="text-xs text-rose-500">{error}</div>}
            <button
              type="submit"
              disabled={loading || !adminKey.trim()}
              className="min-h-[44px] bg-stone-900 text-white dark:bg-amber-500 dark:text-stone-900 text-sm font-semibold rounded-xl flex items-center justify-center hover:opacity-90 active:scale-98 transition-all"
            >
              {loading ? 'กำลังตรวจสอบ...' : 'เข้าสู่ระบบ'}
            </button>
          </form>
        </div>
      </main>
    );
  }

  const currentList =
    activeTab === 'flagged'
      ? queue.flagged
      : activeTab === 'reported'
      ? queue.reported
      : queue.allNotes;

  return (
    <main className="min-h-[100dvh] bg-stone-100 dark:bg-stone-950 text-stone-800 dark:text-stone-100 p-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-stone-200 dark:border-stone-800 mb-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-500" />
            <span>ระบบดูแลเนื้อหา (Moderation Queue)</span>
          </h1>
          <p className="text-xs text-stone-500">
            ตรวจโพสต์เสี่ยงและรายงานเพื่อความปลอดภัยของผู้ใช้
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setIsAuthenticated(false);
            localStorage.removeItem('yanin_admin_key');
          }}
          className="text-xs text-stone-400 hover:text-stone-600"
        >
          ออกจากระบบ
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-4">
        <button
          type="button"
          onClick={() => setActiveTab('flagged')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 ${
            activeTab === 'flagged'
              ? 'bg-rose-500 text-white shadow-xs'
              : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>โพสต์เสี่ยงวิกฤติ ({queue.flagged.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('reported')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold ${
            activeTab === 'reported'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300'
          }`}
        >
          <span>ถูกรายงาน ({queue.reported.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold ${
            activeTab === 'all'
              ? 'bg-stone-800 text-white dark:bg-stone-200 dark:text-stone-900 shadow-xs'
              : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300'
          }`}
        >
          <span>ทั้งหมด ({queue.allNotes.length})</span>
        </button>
      </div>

      {/* Queue Grid */}
      {currentList.length === 0 ? (
        <div className="py-12 text-center text-xs text-stone-400 bg-white dark:bg-stone-900 rounded-2xl">
          ไม่มีรายการที่ต้องตรวจสอบในหมวดนี้ 🎉
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {currentList.map((note) => (
            <div
              key={note.id}
              className="bg-white dark:bg-stone-900 p-3.5 rounded-2xl border border-stone-200 dark:border-stone-800 flex flex-col justify-between gap-3 shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between text-[11px] text-stone-500 mb-2">
                  <span className="font-mono">{note.id}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                      note.status === 'visible'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {note.status}
                  </span>
                </div>

                <div className="w-full aspect-square max-w-[200px] mx-auto">
                  <PostitNote note={note} />
                </div>

                {note.report_count > 0 && (
                  <div className="mt-2 text-xs text-rose-500 font-medium">
                    ถูกรายงาน {note.report_count} ครั้ง
                  </div>
                )}
              </div>

              {/* Admin Actions */}
              <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-stone-100 dark:border-stone-800">
                {note.status === 'visible' ? (
                  <button
                    type="button"
                    onClick={() => handleAction(note.id, 'hide')}
                    className="flex-1 py-1.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-200 rounded-lg text-xs font-medium flex items-center justify-center gap-1"
                  >
                    <EyeOff className="w-3.5 h-3.5 text-stone-500" />
                    <span>ซ่อน</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleAction(note.id, 'restore')}
                    className="flex-1 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-medium flex items-center justify-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
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
                  className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg"
                  title="ลบถาวร"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

