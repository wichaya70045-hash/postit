'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '@/types/chat';
import { getOrCreateDeviceId } from '@/lib/device';
import { checkSafety } from '@/lib/safety';
import { CrisisModal } from '../CrisisModal';
import {
  MessageSquare,
  Send,
  Heart,
  Trash2,
  Flag,
  Sparkles,
  Shield,
  Shuffle,
  Smile,
  RefreshCw,
  ArrowRight,
  Info,
  X,
  Check,
} from 'lucide-react';

interface CommunityWallProps {
  onGoToBoard: () => void;
  isAdmin?: boolean;
  adminToken?: string;
}

const AVATARS = [
  '🐱', '🐰', '🦊', '🐼',
  '🐻', '🐸', '🐧', '🐨',
  '🦉', '🐯', '🐶', '🦄',
  '🌸', '⭐', '☕', '🎨',
];

const AVATAR_COLORS = [
  '#fed7aa', // orange
  '#fbcfe8', // pink
  '#bae6fd', // sky
  '#bbf7d0', // mint
  '#e9d5ff', // purple
  '#fef08a', // yellow
  '#ddd6fe', // violet
  '#fecdd3', // rose
];

const RANDOM_PSEUDONYMS = [
  'แมวส้มตัวตึงห้อง 3',
  'คุณกระต่ายขี้เซา',
  'เด็กหลังห้องชอบอ่านการ์ตูน',
  'แพนด้ากินชานม',
  'สายลมริมหน้าต่าง',
  'คุณดาวตกผู้อ่อนโยน',
  'จิ้งจอกนักฝัน',
  'นกฮูกกะดึก',
  'เจ้าหมีง่วงนอน',
  'กบตัวน้อยในสระ',
  'เพนกวินนักคิด',
  'โคอาล่ารักสงบ',
  'นักบินอวกาศฝึกหัด',
  'ต้นกล้าริมระเบียง',
];

const PROFILE_STORAGE_KEY = 'yanin_chat_profile_v1';

export const CommunityWall: React.FC<CommunityWallProps> = ({
  onGoToBoard,
  isAdmin = false,
  adminToken = '',
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputText, setInputText] = useState('');
  const [authorName, setAuthorName] = useState('แมวส้มข้างกระดาน');
  const [selectedAvatar, setSelectedAvatar] = useState('🐱');
  const [selectedColor, setSelectedColor] = useState('#fed7aa');
  const [isAvatarPickerOpen, setIsAvatarPickerOpen] = useState(false);
  const [isSafetyInfoOpen, setIsSafetyInfoOpen] = useState(false);
  const [showCrisisModal, setShowCrisisModal] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deviceId, setDeviceId] = useState('');

  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Initialize Profile & Device ID
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const id = getOrCreateDeviceId();
      setDeviceId(id);

      const saved = localStorage.getItem(PROFILE_STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.authorName) setAuthorName(parsed.authorName);
          if (parsed.selectedAvatar) setSelectedAvatar(parsed.selectedAvatar);
          if (parsed.selectedColor) setSelectedColor(parsed.selectedColor);
        } catch {}
      } else {
        // Pick random initial profile
        const randomName = RANDOM_PSEUDONYMS[Math.floor(Math.random() * RANDOM_PSEUDONYMS.length)];
        const randomAvatar = AVATARS[Math.floor(Math.random() * AVATARS.length)];
        const randomBg = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
        setAuthorName(randomName);
        setSelectedAvatar(randomAvatar);
        setSelectedColor(randomBg);
      }
    }
  }, []);

  // Save profile changes to localStorage
  const saveProfile = (name: string, avatar: string, color: string) => {
    setAuthorName(name);
    setSelectedAvatar(avatar);
    setSelectedColor(color);
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        PROFILE_STORAGE_KEY,
        JSON.stringify({ authorName: name, selectedAvatar: avatar, selectedColor: color })
      );
    }
  };

  const rollRandomPseudonym = () => {
    const randomName = RANDOM_PSEUDONYMS[Math.floor(Math.random() * RANDOM_PSEUDONYMS.length)];
    const randomAvatar = AVATARS[Math.floor(Math.random() * AVATARS.length)];
    const randomBg = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
    saveProfile(randomName, randomAvatar, randomBg);
  };

  // Fetch Messages
  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/chat?limit=80');
      const data = await res.json();
      if (data.success && data.messages) {
        setMessages(data.messages);
      }
    } catch (e) {
      console.error('Error fetching chat messages', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, []);

  // Scroll to bottom on load
  const scrollToBottom = (smooth = true) => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
    }
  };

  useEffect(() => {
    if (!loading && messages.length > 0) {
      scrollToBottom(false);
    }
  }, [loading]);

  // Handle Send Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed || isSubmitting) return;

    setErrorNotice(null);

    // Safety checks for privacy & crisis
    const safety = checkSafety(`${authorName} ${trimmed}`);
    if (safety.isCrisis) {
      setShowCrisisModal(true);
      return;
    }

    if (safety.hasPII) {
      setErrorNotice(
        'เพื่อความปลอดภัยและความเป็นส่วนตัวของคุณ กรุณาอย่าระบุเบอร์โทรศัพท์หรือข้อมูลติดต่อส่วนตัวนะ (' +
          (safety.piiReasons[0] || 'พบข้อมูลติดต่อ') +
          ')'
      );
      return;
    }

    if (safety.isAbusive) {
      setErrorNotice(
        safety.abusiveReasons[0] ||
          'ข้อความมีถ้อยคำที่ไม่เหมาะสม เพื่อรักษาบรรยากาศที่อบอุ่นของห้องเรียน'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author_name: authorName.trim() || 'เพื่อนร่วมห้อง',
          avatar: selectedAvatar,
          avatar_bg: selectedColor,
          content: trimmed,
          device_hash: deviceId,
        }),
      });

      const data = await res.json();
      if (data.success && data.message) {
        setMessages((prev) => [...prev, data.message]);
        setInputText('');
        setTimeout(() => scrollToBottom(true), 100);
      } else {
        setErrorNotice(data.error || 'ไม่สามารถส่งข้อความได้');
      }
    } catch (err: any) {
      setErrorNotice(err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Like
  const handleLike = async (messageId: string) => {
    try {
      const res = await fetch(`/api/chat/${messageId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ device_hash: deviceId }),
      });
      const data = await res.json();
      if (data.success) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === messageId
              ? {
                  ...m,
                  likes: data.likes,
                  liked_by: data.hasLiked
                    ? [...(m.liked_by || []), deviceId]
                    : (m.liked_by || []).filter((h) => h !== deviceId),
                }
              : m
          )
        );
      }
    } catch {}
  };

  // Handle Delete (Own message or Admin)
  const handleDelete = async (messageId: string) => {
    if (!window.confirm('คุณต้องการลบข้อความนี้ใช่หรือไม่?')) return;
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (adminToken) headers['x-admin-key'] = adminToken;

      const res = await fetch(`/api/chat/${messageId}`, {
        method: 'DELETE',
        headers,
        body: JSON.stringify({ device_hash: deviceId }),
      });
      const data = await res.json();
      if (data.success) {
        setMessages((prev) => prev.filter((m) => m.id !== messageId));
      } else {
        alert(data.error || 'ไม่สามารถลบข้อความได้');
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Handle Report
  const handleReport = async (messageId: string) => {
    if (!window.confirm('คุณต้องการรายงานข้อความนี้เนื่องจากไม่เหมาะสมหรือละเมิดความปลอดภัยใช่หรือไม่?'))
      return;
    try {
      const res = await fetch(`/api/chat/${messageId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'report', device_hash: deviceId }),
      });
      const data = await res.json();
      if (data.success) {
        alert('ขอบคุณที่ช่วยดูแลความปลอดภัยของห้องเรียน! แอดมินจะตรวจสอบโดยเร็ว');
      }
    } catch {}
  };

  return (
    <div className="relative flex-1 w-full min-h-[70vh] sm:min-h-[82vh] rounded-xl sm:rounded-2xl overflow-hidden border-4 sm:border-[16px] border-[#533114] shadow-xl sm:shadow-2xl bg-[#fdfbf7] dark:bg-[#141e17] flex flex-col justify-between transition-colors">
      {/* Wall Header: Classroom Discussion Board Sign */}
      <div className="px-3 sm:px-6 py-2 sm:py-3 border-b border-[#e5dcd0] dark:border-stone-800 bg-[#f7f2eb] dark:bg-[#19241d] flex items-center justify-between z-20 shadow-xs">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center text-lg sm:text-xl shadow-xs shrink-0">
            💬
          </div>
          <div>
            <h2 className="text-xs sm:text-base font-bold text-amber-950 dark:text-amber-100 flex items-center gap-1.5 sm:gap-2">
              <span>ผนังด้านซ้าย: บอร์ดคุยกันนิรนาม (Community Chat)</span>
              <span className="text-[9px] sm:text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                🛡️ ปลอดภัย • ไม่ต้องล็อกอิน
              </span>
            </h2>
            <p className="text-[10px] sm:text-xs text-stone-600 dark:text-stone-300 hidden xs:block">
              มุมคุยแลกเปลี่ยนของทุกคนในห้องเรียน ใส่ชื่อปลอมและเลือกอาวตาร์ได้ตามใจชอบ
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Safety Info Button */}
          <button
            type="button"
            onClick={() => setIsSafetyInfoOpen(true)}
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-medium text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 transition-all active:scale-95 shadow-xs"
            title="ดูนโยบายความปลอดภัยและความเป็นส่วนตัว"
          >
            <Shield className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline">ความปลอดภัย</span>
          </button>

          {/* Jump to Chalkboard */}
          <button
            type="button"
            onClick={onGoToBoard}
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-semibold text-amber-900 dark:text-amber-100 bg-amber-200/80 dark:bg-amber-900/60 border border-amber-400/50 hover:bg-amber-300 active:scale-95 transition-all shadow-xs"
          >
            <span>ดูกระดานดำ</span>
            <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </button>
        </div>
      </div>

      {/* Safety Notice Banner */}
      <div className="px-3 sm:px-6 py-1.5 bg-amber-50/90 dark:bg-amber-950/30 border-b border-amber-200/60 dark:border-amber-900/40 text-[10px] sm:text-[11px] text-amber-900 dark:text-amber-200 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
          <span>
            <strong>Safe Space:</strong> ไม่จำเป็นต้องเปิดเผยตัวตนจริง • ห้ามระบุเบอร์โทรหรือที่อยู่ส่วนตัว เพื่อความปลอดภัยของคุณ
          </span>
        </div>
        <span className="hidden md:inline text-stone-500 dark:text-stone-400 text-[10px]">
          ข้อความออนไลน์เรียลไทม์
        </span>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-3 sm:py-4 space-y-3 sm:space-y-4">
        {loading ? (
          <div className="py-20 text-center text-xs text-stone-400 flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-amber-600" />
            <span>กำลังเปิดบอร์ดคุยกัน...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="py-20 text-center text-xs text-stone-400 flex flex-col items-center justify-center gap-2">
            <span className="text-3xl">💬</span>
            <p className="font-semibold text-stone-700 dark:text-stone-300">
              ยังไม่มีข้อความในบอร์ดคุยกัน
            </p>
            <p className="text-[11px]">เป็นคนแรกที่เริ่มทักทายเพื่อนๆ ในห้องเรียนได้เลยนะ!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMine = msg.device_hash === deviceId;
            const hasLiked = (msg.liked_by || []).includes(deviceId);

            return (
              <div
                key={msg.id}
                className={`flex items-start gap-2 sm:gap-3 group animate-in fade-in duration-200 ${
                  isMine ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                {/* Avatar */}
                <button
                  type="button"
                  onClick={() => setIsAvatarPickerOpen(true)}
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center text-base sm:text-xl shadow-xs border border-black/10 shrink-0 transition-transform hover:scale-105 active:scale-95"
                  style={{ backgroundColor: msg.avatar_bg || '#fed7aa' }}
                  title="คลิกเพื่อปรับแต่งอาวตาร์ของคุณ"
                >
                  {msg.avatar || '🐱'}
                </button>

                {/* Message Content Container */}
                <div
                  className={`max-w-[82%] sm:max-w-[70%] flex flex-col ${
                    isMine ? 'items-end' : 'items-start'
                  }`}
                >
                  {/* Meta: Author Name & Time */}
                  <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] sm:text-[11px] text-stone-500 dark:text-stone-400">
                    <span className="font-semibold text-stone-800 dark:text-stone-200">
                      {msg.author_name}
                    </span>
                    {isMine && (
                      <span className="text-[9px] bg-amber-600 text-white px-1.5 py-0.2 rounded-full font-medium">
                        คุณ
                      </span>
                    )}
                    <span>•</span>
                    <span>
                      {new Date(msg.created_at).toLocaleTimeString('th-TH', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`p-2.5 sm:p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs border transition-all ${
                      isMine
                        ? 'bg-amber-600 text-white rounded-tr-xs border-amber-500 shadow-amber-900/10'
                        : 'bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 rounded-tl-xs border-[#e5dcd0] dark:border-stone-700'
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                  </div>

                  {/* Message Action Bar (Like, Delete, Report) */}
                  <div className="flex items-center gap-2 mt-1 px-1 text-[10px] sm:text-xs">
                    {/* Like button */}
                    <button
                      type="button"
                      onClick={() => handleLike(msg.id)}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded-full border transition-all active:scale-95 ${
                        hasLiked
                          ? 'bg-rose-50 text-rose-600 border-rose-300 dark:bg-rose-950/40 dark:border-rose-800'
                          : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:text-rose-500'
                      }`}
                      title="กดถูกใจ"
                    >
                      <Heart
                        className={`w-3 h-3 ${
                          hasLiked ? 'fill-rose-500 text-rose-500' : 'text-stone-400'
                        }`}
                      />
                      <span>{msg.likes > 0 ? msg.likes : 'ใจ'}</span>
                    </button>

                    {/* Delete button (Only for author or Admin) */}
                    {(isMine || isAdmin) && (
                      <button
                        type="button"
                        onClick={() => handleDelete(msg.id)}
                        className="text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 p-0.5 rounded transition-colors"
                        title="ลบข้อความของคุณ"
                        aria-label="ลบข้อความ"
                      >
                        <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      </button>
                    )}

                    {/* Report button */}
                    {!isMine && (
                      <button
                        type="button"
                        onClick={() => handleReport(msg.id)}
                        className="text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 p-0.5 rounded transition-colors"
                        title="รายงานข้อความไม่เหมาะสม"
                        aria-label="รายงานข้อความ"
                      >
                        <Flag className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Safety Error Notice Pill */}
      {errorNotice && (
        <div className="mx-3 sm:mx-6 mb-2 p-2.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-200 text-xs rounded-xl flex items-center justify-between shadow-xs animate-in slide-in-from-bottom-2">
          <span>{errorNotice}</span>
          <button
            type="button"
            onClick={() => setErrorNotice(null)}
            className="p-1 hover:bg-rose-200/50 rounded-md"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Profile Bar & Message Composer Box (Bottom) */}
      <div className="border-t border-[#e5dcd0] dark:border-stone-800 bg-[#f7f2eb] dark:bg-[#19241d] p-2.5 sm:p-4 z-20 flex flex-col gap-2">
        {/* Profile / Pseudonym Quick Bar */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => setIsAvatarPickerOpen(true)}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center text-sm sm:text-base border border-stone-300 shadow-xs active:scale-95 transition-transform"
              style={{ backgroundColor: selectedColor }}
              title="คลิกเพื่อเปลี่ยนอาวตาร์หรือสี"
            >
              {selectedAvatar}
            </button>

            <div className="flex items-center gap-1">
              <input
                type="text"
                value={authorName}
                maxLength={25}
                onChange={(e) => saveProfile(e.target.value, selectedAvatar, selectedColor)}
                placeholder="ใส่ชื่อปลอม / นามแฝง"
                className="px-2 py-1 text-xs font-semibold rounded-lg bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-800 dark:text-stone-100 outline-none focus:border-amber-500 w-32 sm:w-44 shadow-2xs"
                title="ชื่อปลอมของคุณ (แก้ไขได้ตลอดเวลา ไม่ต้องล็อกอิน)"
              />

              <button
                type="button"
                onClick={rollRandomPseudonym}
                className="p-1 text-stone-500 hover:text-amber-700 dark:hover:text-amber-400 bg-stone-100 dark:bg-stone-800 rounded-lg border border-stone-300 dark:border-stone-700 active:scale-95 transition-all shadow-2xs"
                title="สุ่มชื่อและอาวตาร์ใหม่ 🎲"
                aria-label="สุ่มชื่อปลอม"
              >
                <Shuffle className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <span className="text-[10px] text-stone-500 dark:text-stone-400 hidden sm:inline">
            🔒 นามแฝงปลอดภัย ไม่เก็บข้อมูลจริง
          </span>
        </div>

        {/* Form Composer */}
        <form onSubmit={handleSendMessage} className="flex items-center gap-1.5 sm:gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="พิมพ์ข้อความคุยกันได้เลย... (พื้นที่ปลอดภัย ไม่เปิดเผยตัวตน)"
            maxLength={400}
            className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-xs sm:text-sm text-stone-800 dark:text-stone-100 outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-500 transition-all shadow-xs"
          />

          <button
            type="submit"
            disabled={!inputText.trim() || isSubmitting}
            className="px-3.5 sm:px-5 py-2 sm:py-2.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded-xl sm:rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 shadow-md active:scale-95 transition-all shrink-0"
            aria-label="ส่งข้อความ"
          >
            <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">ส่ง</span>
          </button>
        </form>
      </div>

      {/* Avatar Picker Modal */}
      {isAvatarPickerOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-[#fdfbf7] dark:bg-stone-900 w-full max-w-sm rounded-3xl border-4 border-[#8b5a2b] shadow-2xl p-5 flex flex-col gap-4 text-stone-800 dark:text-stone-100">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <span>เลือกอาวตาร์ & สีนิรนาม</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAvatarPickerOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Current Preview */}
            <div className="flex items-center gap-3 p-3 bg-amber-50/70 dark:bg-stone-800 rounded-2xl border border-amber-200/60 dark:border-stone-700">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-xs border border-stone-300"
                style={{ backgroundColor: selectedColor }}
              >
                {selectedAvatar}
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold">{authorName || 'เพื่อนร่วมห้อง'}</p>
                <p className="text-[10px] text-stone-500">ตัวอย่างที่จะแสดงในบอร์ดคุยกัน</p>
              </div>
            </div>

            {/* Avatars */}
            <div>
              <label className="block text-xs font-semibold mb-1.5 text-stone-600 dark:text-stone-400">
                เลือกตัวละครอาวตาร์
              </label>
              <div className="grid grid-cols-4 gap-2">
                {AVATARS.map((av) => (
                  <button
                    key={av}
                    type="button"
                    onClick={() => saveProfile(authorName, av, selectedColor)}
                    className={`h-11 rounded-xl text-xl flex items-center justify-center border transition-all active:scale-95 ${
                      selectedAvatar === av
                        ? 'border-amber-600 bg-amber-100 dark:bg-amber-950/60 scale-105 shadow-xs font-bold'
                        : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 hover:bg-stone-100'
                    }`}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>

            {/* Background Colors */}
            <div>
              <label className="block text-xs font-semibold mb-1.5 text-stone-600 dark:text-stone-400">
                เลือกสีพื้นหลังอาวตาร์
              </label>
              <div className="grid grid-cols-4 gap-2">
                {AVATAR_COLORS.map((bg) => (
                  <button
                    key={bg}
                    type="button"
                    onClick={() => saveProfile(authorName, selectedAvatar, bg)}
                    className={`h-8 rounded-xl border flex items-center justify-center transition-all ${
                      selectedColor === bg
                        ? 'border-black dark:border-white ring-2 ring-amber-500 scale-105'
                        : 'border-black/10 hover:opacity-90'
                    }`}
                    style={{ backgroundColor: bg }}
                  >
                    {selectedColor === bg && <Check className="w-3.5 h-3.5 text-stone-800" />}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsAvatarPickerOpen(false)}
              className="w-full py-2 bg-amber-700 hover:bg-amber-600 text-white font-semibold text-xs rounded-xl shadow-xs active:scale-95 transition-all mt-1"
            >
              เสร็จสิ้น
            </button>
          </div>
        </div>
      )}

      {/* Safety Policy Modal */}
      {isSafetyInfoOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-[#fdfbf7] dark:bg-stone-900 w-full max-w-md rounded-3xl border-4 border-[#8b5a2b] shadow-2xl p-6 flex flex-col gap-3 text-stone-800 dark:text-stone-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-bold text-amber-950 dark:text-amber-100">
                  นโยบายความปลอดภัยของคนเขียน (Safety First)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSafetyInfoOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300/50 rounded-2xl">
                <p className="font-semibold text-emerald-900 dark:text-emerald-200">
                  ✨ 1. ไม่ต้องล็อกอิน & นิรนาม 100%
                </p>
                <p className="mt-0.5 text-[11px]">
                  ไม่มีการเก็บบัญชีผู้ใช้ อีเมล หรือชื่อจริงของคุณ ทุกคนสามารถสุ่มชื่อและอาวตาร์พูดคุยได้อย่างอิสระ
                </p>
              </div>

              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-300/50 rounded-2xl">
                <p className="font-semibold text-amber-900 dark:text-amber-200">
                  🛡️ 2. ระบบคัดกรองเบอร์โทรและข้อมูลติดต่อ
                </p>
                <p className="mt-0.5 text-[11px]">
                  เพื่อปกป้องคุณจากการถูกคุกคาม ระบบจะไม่อนุญาตให้พิมพ์เบอร์โทรศัพท์หรือข้อมูลส่วนตัวลงในบอร์ดสาธารณะ
                </p>
              </div>

              <div className="p-3 bg-sky-50 dark:bg-sky-950/30 border border-sky-300/50 rounded-2xl">
                <p className="font-semibold text-sky-900 dark:text-sky-200">
                  🗑️ 3. สิทธิ์ในการลบข้อความของตัวเอง
                </p>
                <p className="mt-0.5 text-[11px]">
                  ข้อความที่คุณส่ง คุณสามารถกดปุ่มถังขยะเพื่อลบออกจากบอร์ดได้ตลอดเวลาผ่านเครื่องของคุณ
                </p>
              </div>

              <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-300/50 rounded-2xl">
                <p className="font-semibold text-rose-900 dark:text-rose-200">
                  🫂 4. พื้นที่ใจดี & สายด่วนสุขภาพจิต 1323
                </p>
                <p className="mt-0.5 text-[11px]">
                  หากคุณหรือเพื่อนๆ กำลังรู้สึกเศร้าหรือหมดหวัง มีระบบแจ้งเตือนและให้กำลังใจพร้อมโทรหาสายด่วนฟรี 24 ชั่วโมง
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsSafetyInfoOpen(false)}
              className="w-full py-2.5 bg-amber-700 hover:bg-amber-600 text-white font-semibold text-xs rounded-xl shadow-xs active:scale-95 transition-all mt-1"
            >
              เข้าใจแล้ว
            </button>
          </div>
        </div>
      )}

      {/* Gentle Crisis Dialog for mental health safety */}
      <CrisisModal
        isOpen={showCrisisModal}
        onProceed={async () => {
          setShowCrisisModal(false);
          setIsSubmitting(true);
          try {
            const res = await fetch('/api/chat', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                author_name: authorName.trim() || 'เพื่อนร่วมห้อง',
                avatar: selectedAvatar,
                avatar_bg: selectedColor,
                content: inputText.trim(),
                device_hash: deviceId,
              }),
            });
            const data = await res.json();
            if (data.success && data.message) {
              setMessages((prev) => [...prev, data.message]);
              setInputText('');
              setTimeout(() => scrollToBottom(true), 100);
            }
          } catch {} finally {
            setIsSubmitting(false);
          }
        }}
        onCancel={() => setShowCrisisModal(false)}
      />
    </div>
  );
};
