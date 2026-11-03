'use client';

import React, { useState } from 'react';
import { Key, X, ShieldCheck, AlertCircle } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (token: string) => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (data.success && data.token) {
        localStorage.setItem('yanin_admin_token', data.token);
        localStorage.setItem('yanin_admin_key', data.token);
        onLoginSuccess(data.token);
        onClose();
      } else {
        setError(data.error || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
      }
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-[#fdfbf7] dark:bg-stone-900 w-full max-w-sm rounded-3xl border-4 border-[#8b5a2b] shadow-2xl p-6 flex flex-col gap-4 text-stone-800 dark:text-stone-100">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center border border-amber-300">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-amber-950 dark:text-amber-100">
                เข้าสู่ระบบผู้ดูแล (Admin)
              </h2>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                สำหรับคุณครูหรือแอดมินจัดการกระดาน
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Public Notice */}
        <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-300/50 rounded-2xl text-[11px] text-amber-900 dark:text-amber-200 leading-relaxed">
          ✨ <strong>หมายเหตุ:</strong> นักเรียนและผู้ใช้ทั่วไปสามารถเขียนโพสต์อิท วาดรูป และอ่านกระดานได้ทันทีโดย<strong>ไม่ต้องล็อกอิน</strong>เลยนะ
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {error && (
            <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs rounded-xl flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold mb-1 text-stone-700 dark:text-stone-300">
              ชื่อผู้ใช้ (Username)
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm outline-none focus:border-amber-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 text-stone-700 dark:text-stone-300">
              รหัสผ่าน (Password / Secret Key)
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="admin1234"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm outline-none focus:border-amber-500"
              required
            />
            <span className="text-[10px] text-stone-500 mt-1 block">
              * รหัสเริ่มต้นคือ <code>admin1234</code>
            </span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-stone-500 hover:text-stone-700"
            >
              ยกเลิก
            </button>

            <button
              type="submit"
              disabled={loading || !password.trim()}
              className="px-5 py-2.5 bg-amber-700 hover:bg-amber-600 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-md active:scale-95 transition-all flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{loading ? 'กำลังตรวจสอบ...' : 'เข้าสู่ระบบ Admin'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
