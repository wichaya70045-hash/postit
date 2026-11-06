import { Note, ReactionType, CreateNotePayload } from '@/types/note';
import { ChatMessage, CreateChatMessagePayload } from '@/types/chat';
import { checkSafety } from './safety';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

export function sha256(input: string): string {
  return crypto.createHash('sha256').update(input).digest('hex');
}

const LOCAL_STORAGE_DIR = path.join(process.cwd(), '.data');
const LOCAL_STORAGE_FILE = path.join(LOCAL_STORAGE_DIR, 'notes_db.json');

export const MAX_BOARD_CAPACITY = 28; // Maximum notes on the Thai chalkboard at one time

interface LocalDBData {
  notes: Array<Note & { edit_token_hash: string }>;
  reactions: Array<{ note_id: string; device_hash: string; type: ReactionType; created_at: string }>;
  reports: Array<{ id: string; note_id: string; device_hash: string; reason: string; created_at: string }>;
  admin_actions: Array<{ id: string; admin_id: string; note_id: string; action: string; reason?: string; created_at: string }>;
  announcement?: string;
  allow_profanity?: boolean;
  chat_messages?: ChatMessage[];
  deleted_note_ids?: string[];
}

function getInitialSampleChat(): ChatMessage[] {
  return [
    {
      id: 'chat-welcome-1',
      author_name: 'แมวส้มข้างกระดาน',
      avatar: '🐱',
      avatar_bg: '#fed7aa',
      content: 'ยินดีต้อนรับสู่มุมคุยกันของห้องเรียน! พื้นที่นี้คุยได้ทุกเรื่อง ไม่ต้องล็อกอิน ใส่ชื่อปลอมกับอาวตาร์ที่ชอบได้เลยนะ 🍃',
      created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      likes: 15,
      liked_by: [],
      device_hash: 'system_cat',
      status: 'visible',
    },
    {
      id: 'chat-welcome-2',
      author_name: 'คุณกระต่ายขี้เซา',
      avatar: '🐰',
      avatar_bg: '#fbcfe8',
      content: 'วันนี้ใครเหนื่อยกับการเรียนหรือการทำงาน แวะมาพักหายใจตรงนี้ก่อนได้นะ ทุกคนทำเต็มที่มากแล้ว 🤍✨',
      created_at: new Date(Date.now() - 1800000).toISOString(),
      likes: 24,
      liked_by: [],
      device_hash: 'system_rabbit',
      status: 'visible',
    },
    {
      id: 'chat-welcome-3',
      author_name: 'เด็กหลังห้อง',
      avatar: '🦊',
      avatar_bg: '#bae6fd',
      content: 'ข้อดีของบอร์ดนี้คือปลอดภัยสุดๆ ไม่มีใครรู้ว่าเราเป็นใคร คุยระบายความในใจได้สบายใจเลย 📚',
      created_at: new Date(Date.now() - 600000).toISOString(),
      likes: 19,
      liked_by: [],
      device_hash: 'system_fox',
      status: 'visible',
    },
  ];
}

function getInitialSampleNotes(): Array<Note & { edit_token_hash: string }> {
  return [
    {
      id: 'note-welcome-1',
      kind: 'text',
      body: 'ยินดีต้อนรับสู่ห้องเรียน Yanin 🏫 กระดานดำเข้มขรึมสไตล์โรงเรียนไทย! เขียนหรือวาดลงโพสต์อิทแล้วลากมาแปะได้เลยนะ',
      color: '#fef08a',
      posX: 12,
      posY: 10,
      rotation: -2.5,
      status: 'visible',
      risk_flag: false,
      report_count: 0,
      reaction_counts: { heart: 24, hug: 12, sparkle: 28, cheer: 18, idea: 15 },
      created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      device_hash: 'system_dev',
      edit_token_hash: sha256('system_token_1'),
    },
    {
      id: 'note-sample-2',
      kind: 'text',
      body: 'การบ้านวันนี้: อย่าลืมใจดีกับตัวเองเยอะๆ และยิ้มให้สดใสก่อนนอนนะ ☀️✨',
      color: '#bae6fd',
      posX: 44,
      posY: 14,
      rotation: 2.8,
      status: 'visible',
      risk_flag: false,
      report_count: 0,
      reaction_counts: { heart: 32, hug: 18, sparkle: 36, cheer: 25, idea: 11 },
      created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
      device_hash: 'sample_dev_2',
      edit_token_hash: sha256('system_token_2'),
    },
    {
      id: 'note-sample-3',
      kind: 'text',
      body: '🔔 เสียงกระดิ่งบอกเวลาเลิกเรียนคือเสียงที่ไพเราะที่สุดในวัยเด็ก ใครคิดเหมือนกันบ้าง! 😆',
      color: '#bbf7d0',
      posX: 70,
      posY: 20,
      rotation: -1.6,
      status: 'visible',
      risk_flag: false,
      report_count: 0,
      reaction_counts: { heart: 22, hug: 9, sparkle: 19, cheer: 20, idea: 42 },
      created_at: new Date(Date.now() - 3600000 * 6).toISOString(),
      device_hash: 'sample_dev_3',
      edit_token_hash: sha256('system_token_3'),
    },
    {
      id: 'note-sample-4',
      kind: 'text',
      body: 'สูตรสำเร็จ: ความพยายาม + ความตั้งใจ = วันข้างหน้าที่งดงาม 🤍 สู้ไปด้วยกันนะ!',
      color: '#fbcfe8',
      posX: 22,
      posY: 46,
      rotation: 3.2,
      status: 'visible',
      risk_flag: false,
      report_count: 0,
      reaction_counts: { heart: 45, hug: 30, sparkle: 26, cheer: 38, idea: 16 },
      created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
      device_hash: 'sample_dev_4',
      edit_token_hash: sha256('system_token_4'),
    },
  ];
}

let memoryCache: LocalDBData | null = null;
let lastMtimeMs = 0;

function loadLocalDB(): LocalDBData {
  try {
    if (!fs.existsSync(LOCAL_STORAGE_DIR)) {
      fs.mkdirSync(LOCAL_STORAGE_DIR, { recursive: true });
    }
    if (!fs.existsSync(LOCAL_STORAGE_FILE)) {
      const initial: LocalDBData = {
        notes: getInitialSampleNotes(),
        reactions: [],
        reports: [],
        admin_actions: [],
        chat_messages: getInitialSampleChat(),
        deleted_note_ids: [],
      };
      saveLocalDB(initial);
      return initial;
    }

    const stat = fs.statSync(LOCAL_STORAGE_FILE);
    if (memoryCache && stat.mtimeMs <= lastMtimeMs) {
      return memoryCache;
    }

    const raw = fs.readFileSync(LOCAL_STORAGE_FILE, 'utf-8');
    const cleanRaw = raw.replace(/^\uFEFF/, '').trim();
    if (!cleanRaw) {
      if (memoryCache) return memoryCache;
      const initial: LocalDBData = {
        notes: getInitialSampleNotes(),
        reactions: [],
        reports: [],
        admin_actions: [],
        chat_messages: getInitialSampleChat(),
        deleted_note_ids: [],
      };
      saveLocalDB(initial);
      return initial;
    }
    const parsed: LocalDBData = JSON.parse(cleanRaw);
    if (!parsed.deleted_note_ids) {
      parsed.deleted_note_ids = [];
    }
    if (!parsed.notes) {
      parsed.notes = [];
    }
    // Permanently filter out any deleted note IDs
    if (parsed.deleted_note_ids.length > 0) {
      const deletedSet = new Set(parsed.deleted_note_ids);
      parsed.notes = parsed.notes.filter((n) => !deletedSet.has(n.id));
    }
    if (parsed.allow_profanity === undefined) {
      parsed.allow_profanity = true;
    }
    if (!parsed.chat_messages || parsed.chat_messages.length === 0) {
      parsed.chat_messages = getInitialSampleChat();
    }
    memoryCache = parsed;
    lastMtimeMs = stat.mtimeMs;
    return parsed;
  } catch (e) {
    console.error('Error loading local DB', e);
    if (memoryCache) return memoryCache;
    const fallback: LocalDBData = {
      notes: getInitialSampleNotes(),
      reactions: [],
      reports: [],
      admin_actions: [],
      chat_messages: getInitialSampleChat(),
      deleted_note_ids: [],
    };
    memoryCache = fallback;
    return fallback;
  }
}

function saveLocalDB(data: LocalDBData): void {
  try {
    if (!fs.existsSync(LOCAL_STORAGE_DIR)) {
      fs.mkdirSync(LOCAL_STORAGE_DIR, { recursive: true });
    }
    if (!data.deleted_note_ids) {
      data.deleted_note_ids = [];
    }
    // Ensure deleted notes are purged before writing
    if (data.deleted_note_ids.length > 0) {
      const deletedSet = new Set(data.deleted_note_ids);
      data.notes = data.notes.filter((n) => !deletedSet.has(n.id));
    }
    // Update authoritative in-memory cache immediately
    memoryCache = data;
    // Write directly to file
    fs.writeFileSync(LOCAL_STORAGE_FILE, JSON.stringify(data, null, 2), 'utf-8');
    try {
      lastMtimeMs = fs.statSync(LOCAL_STORAGE_FILE).mtimeMs;
    } catch {}
  } catch (e) {
    console.error('Error saving local DB', e);
  }
}

export const db = {
  // Fetch active notes on chalkboard
  async getNotes(limit = 60, offset = 0): Promise<{ notes: Note[]; maxCapacity: number; fallenNotes: Note[]; announcement?: string }> {
    const data = loadLocalDB();
    const visibleNotes = data.notes.filter((n) => n.status === 'visible');
    visibleNotes.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // Notes beyond MAX_BOARD_CAPACITY fall off the board
    const activeNotes = visibleNotes.slice(0, MAX_BOARD_CAPACITY);
    const fallenNotes = visibleNotes.slice(MAX_BOARD_CAPACITY, MAX_BOARD_CAPACITY + 10);

    const paginated = activeNotes.slice(offset, offset + limit);
    return {
      notes: paginated.map(({ edit_token_hash, ...p }) => p),
      maxCapacity: MAX_BOARD_CAPACITY,
      fallenNotes: fallenNotes.map(({ edit_token_hash, ...p }) => p),
      announcement: data.announcement || 'เวรประจำวัน: ช่วยกันส่งต่อรอยยิ้ม',
    };
  },

  async getNoteById(id: string): Promise<Note | null> {
    const data = loadLocalDB();
    const found = data.notes.find((n) => n.id === id && (n.status === 'visible' || n.status === 'fallen'));
    if (!found) return null;
    const { edit_token_hash, ...publicNote } = found;
    return publicNote;
  },

  async createNote(payload: CreateNotePayload): Promise<{ note: Note; isCrisis: boolean; oldestFallenNote?: Note }> {
    const data = loadLocalDB();
    
    const textToCheck = `${payload.body || ''} ${payload.caption || ''}`;
    const safety = checkSafety(textToCheck);

    if (safety.hasPII) {
      throw new Error(`ไม่อนุญาตให้ใส่ข้อมูลส่วนตัว: ${safety.piiReasons.join(', ')}`);
    }
    if (safety.isAbusive && data.allow_profanity === false) {
      throw new Error(`ข้อความของคุณมีถ้อยคำที่ไม่เหมาะสม โปรดปรับแก้ไขก่อนแปะนะ`);
    }

    const randomRotation = Number((Math.random() * 10 - 5).toFixed(1));
    const newNoteId = 'note_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

    const currentActive = data.notes.filter((n) => n.status === 'visible');

    let posX = payload.posX;
    let posY = payload.posY;

    if (typeof posX !== 'number' || typeof posY !== 'number') {
      // Free organic placement across the entire chalkboard
      const slotIndex = currentActive.length;
      const col = slotIndex % 5;
      const row = Math.floor(slotIndex / 5) % 4;

      const colX = 5 + col * 17 + (Math.floor(Math.random() * 8) - 4);
      const rowY = 8 + row * 19 + (Math.floor(Math.random() * 8) - 4);

      if (typeof posX !== 'number') posX = Math.max(2, Math.min(88, colX));
      if (typeof posY !== 'number') posY = Math.max(4, Math.min(84, rowY));
    }

    const newRecord: Note & { edit_token_hash: string } = {
      id: newNoteId,
      kind: payload.kind,
      body: payload.body,
      strokes: payload.strokes,
      caption: payload.caption,
      color: payload.color || '#fef08a',
      posX,
      posY,
      rotation: randomRotation,
      status: 'visible',
      risk_flag: safety.isCrisis,
      report_count: 0,
      reaction_counts: { heart: 0, hug: 0, sparkle: 0, cheer: 0, idea: 0 },
      created_at: new Date().toISOString(),
      device_hash: payload.device_hash,
      edit_token_hash: sha256(payload.edit_token),
    };

    // Find if the board is already at full capacity
    currentActive.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    let oldestFallenNote: Note | undefined = undefined;
    if (currentActive.length >= MAX_BOARD_CAPACITY) {
      // The oldest note peels off and falls down
      const oldest = currentActive[currentActive.length - 1];
      oldest.status = 'fallen';
      const { edit_token_hash, ...p } = oldest;
      oldestFallenNote = p;
    }

    data.notes.unshift(newRecord);
    saveLocalDB(data);

    const { edit_token_hash, ...publicNote } = newRecord;
    return { note: publicNote, isCrisis: safety.isCrisis, oldestFallenNote };
  },

  async updateNotePosition(id: string, posX: number, posY: number): Promise<boolean> {
    const data = loadLocalDB();
    const note = data.notes.find((n) => n.id === id);
    if (!note) return false;
    note.posX = Math.max(0.5, Math.min(95, posX));
    note.posY = Math.max(1, Math.min(95, posY));
    saveLocalDB(data);
    return true;
  },

  async addReaction(noteId: string, deviceHash: string, type: ReactionType): Promise<{ success: boolean; reactionCounts: Note['reaction_counts'] }> {
    const data = loadLocalDB();
    const note = data.notes.find((n) => n.id === noteId);
    if (!note) throw new Error('ไม่พบโพสต์');

    if (!note.reaction_counts) {
      note.reaction_counts = { heart: 0, hug: 0, sparkle: 0, cheer: 0, idea: 0 };
    }

    const alreadyReacted = data.reactions.some(
      (r) => r.note_id === noteId && r.device_hash === deviceHash && r.type === type
    );

    if (!alreadyReacted) {
      data.reactions.push({
        note_id: noteId,
        device_hash: deviceHash,
        type,
        created_at: new Date().toISOString(),
      });
      note.reaction_counts[type] = (note.reaction_counts[type] || 0) + 1;
      saveLocalDB(data);
    }

    return { success: true, reactionCounts: note.reaction_counts };
  },

  async getUserReactionsForNote(noteId: string, deviceHash: string): Promise<ReactionType[]> {
    const data = loadLocalDB();
    return data.reactions
      .filter((r) => r.note_id === noteId && r.device_hash === deviceHash)
      .map((r) => r.type);
  },

  async reportNote(noteId: string, deviceHash: string, reason: string): Promise<{ hidden: boolean }> {
    const data = loadLocalDB();
    const note = data.notes.find((n) => n.id === noteId);
    if (!note) throw new Error('ไม่พบโพสต์');

    data.reports.push({
      id: 'rep_' + Date.now(),
      note_id: noteId,
      device_hash: deviceHash,
      reason,
      created_at: new Date().toISOString(),
    });

    note.report_count = (note.report_count || 0) + 1;
    let hidden = false;
    if (note.report_count >= 3) {
      note.status = 'hidden';
      hidden = true;
    }
    saveLocalDB(data);
    return { hidden };
  },

  async deleteNote(noteId: string, editToken?: string, isAdmin = false, deviceHash?: string): Promise<boolean> {
    const data = loadLocalDB();
    let index = -1;
    if (isAdmin) {
      index = data.notes.findIndex((n) => n.id === noteId);
    } else if (editToken) {
      const hashed = sha256(editToken);
      index = data.notes.findIndex((n) => n.id === noteId && n.edit_token_hash === hashed);
    } else if (deviceHash) {
      index = data.notes.findIndex((n) => n.id === noteId && n.device_hash === deviceHash);
    }
    if (index === -1) {
      throw new Error('ไม่พบโพสต์หรือคุณไม่มีสิทธิ์ลบโพสต์นี้');
    }

    if (!data.deleted_note_ids) {
      data.deleted_note_ids = [];
    }
    if (!data.deleted_note_ids.includes(noteId)) {
      data.deleted_note_ids.push(noteId);
    }
    data.notes = data.notes.filter((n) => n.id !== noteId);
    data.reactions = (data.reactions || []).filter((r) => r.note_id !== noteId);
    data.reports = (data.reports || []).filter((r) => r.note_id !== noteId);

    saveLocalDB(data);
    return true;
  },

  async getMyNotes(deviceHash: string, noteIds: string[]): Promise<Note[]> {
    const data = loadLocalDB();
    const deletedSet = new Set(data.deleted_note_ids || []);
    const myNotes = data.notes.filter(
      (n) => !deletedSet.has(n.id) && (n.device_hash === deviceHash || noteIds.includes(n.id)) && n.status !== 'hidden'
    );
    myNotes.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return myNotes.map(({ edit_token_hash, ...publicNote }) => publicNote);
  },

  async getAdminQueue(): Promise<{ flagged: Note[]; reported: Note[]; allNotes: Note[] }> {
    const data = loadLocalDB();
    const deletedSet = new Set(data.deleted_note_ids || []);
    const activeNotes = data.notes.filter((n) => !deletedSet.has(n.id));
    const flagged = activeNotes.filter((n) => n.risk_flag);
    const reported = activeNotes.filter((n) => n.report_count > 0);
    return {
      flagged: flagged.map(({ edit_token_hash, ...p }) => p),
      reported: reported.map(({ edit_token_hash, ...p }) => p),
      allNotes: activeNotes.map(({ edit_token_hash, ...p }) => p),
    };
  },

  async performAdminAction(adminId: string, noteId: string, action: 'hide' | 'restore' | 'delete', reason?: string): Promise<boolean> {
    const data = loadLocalDB();
    const note = data.notes.find((n) => n.id === noteId);
    if (!note && action !== 'delete') throw new Error('ไม่พบโพสต์');

    if (action === 'hide') {
      if (note) note.status = 'hidden';
    } else if (action === 'restore') {
      if (note) {
        note.status = 'visible';
        note.report_count = 0;
      }
    } else if (action === 'delete') {
      if (!data.deleted_note_ids) {
        data.deleted_note_ids = [];
      }
      if (!data.deleted_note_ids.includes(noteId)) {
        data.deleted_note_ids.push(noteId);
      }
      data.notes = data.notes.filter((n) => n.id !== noteId);
      data.reactions = (data.reactions || []).filter((r) => r.note_id !== noteId);
      data.reports = (data.reports || []).filter((r) => r.note_id !== noteId);
    }

    data.admin_actions.push({
      id: 'adm_' + Date.now(),
      admin_id: adminId,
      note_id: noteId,
      action,
      reason,
      created_at: new Date().toISOString(),
    });

    saveLocalDB(data);
    return true;
  },

  getAnnouncement(): string {
    const data = loadLocalDB();
    return data.announcement || 'เวรประจำวัน: ช่วยกันส่งต่อรอยยิ้ม';
  },

  setAnnouncement(text: string): string {
    const data = loadLocalDB();
    data.announcement = text;
    saveLocalDB(data);
    return data.announcement;
  },

  getProfanityAllowed(): boolean {
    const data = loadLocalDB();
    return !!data.allow_profanity;
  },

  setProfanityAllowed(allowed: boolean): boolean {
    const data = loadLocalDB();
    data.allow_profanity = allowed;
    saveLocalDB(data);
    return data.allow_profanity;
  },

  resetBoardToDefault(): Note[] {
    const data = loadLocalDB();
    data.notes = getInitialSampleNotes();
    data.reactions = [];
    data.reports = [];
    data.deleted_note_ids = [];
    saveLocalDB(data);
    return data.notes.map(({ edit_token_hash, ...p }) => p);
  },

  // --- Community Chat Methods (100% Anonymous & Safe) ---
  getChatMessages(limit = 60): ChatMessage[] {
    const data = loadLocalDB();
    const messages = (data.chat_messages || []).filter((m) => m.status === 'visible');
    return messages.slice(-limit);
  },

  createChatMessage(payload: CreateChatMessagePayload): { message: ChatMessage; isCrisis: boolean } {
    const data = loadLocalDB();
    if (!data.chat_messages) data.chat_messages = [];

    const textToCheck = `${payload.author_name} ${payload.content}`;
    const safety = checkSafety(textToCheck);
    if (safety.hasPII) {
      throw new Error(safety.piiReasons[0] || 'ข้อความของคุณมีเบอร์โทรศัพท์หรือข้อมูลติดต่อส่วนตัว เพื่อความปลอดภัยของผู้เขียนกรุณาอย่าเปิดเผยข้อมูลติดต่อ');
    }
    if (safety.isAbusive && data.allow_profanity === false) {
      throw new Error(safety.abusiveReasons[0] || 'ข้อความมีถ้อยคำที่ไม่เหมาะสม เพื่อรักษาบรรยากาศที่อบอุ่นของห้องเรียน');
    }

    const newMessage: ChatMessage = {
      id: 'chat_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      author_name: (payload.author_name || 'เพื่อนร่วมห้อง').trim().slice(0, 30),
      avatar: payload.avatar || '🐱',
      avatar_bg: payload.avatar_bg || '#fed7aa',
      content: payload.content.trim().slice(0, 500),
      created_at: new Date().toISOString(),
      likes: 0,
      liked_by: [],
      device_hash: payload.device_hash,
      status: 'visible',
      risk_flag: safety.isCrisis,
      report_count: 0,
    };

    data.chat_messages.push(newMessage);
    if (data.chat_messages.length > 200) {
      data.chat_messages = data.chat_messages.slice(-200);
    }
    saveLocalDB(data);

    return { message: newMessage, isCrisis: safety.isCrisis };
  },

  likeChatMessage(id: string, deviceHash: string): { likes: number; hasLiked: boolean } {
    const data = loadLocalDB();
    const message = (data.chat_messages || []).find((m) => m.id === id);
    if (!message) throw new Error('ไม่พบข้อความ');

    if (!message.liked_by) message.liked_by = [];
    const index = message.liked_by.indexOf(deviceHash);
    let hasLiked = false;

    if (index >= 0) {
      message.liked_by.splice(index, 1);
      message.likes = Math.max(0, message.likes - 1);
      hasLiked = false;
    } else {
      message.liked_by.push(deviceHash);
      message.likes += 1;
      hasLiked = true;
    }

    saveLocalDB(data);
    return { likes: message.likes, hasLiked };
  },

  deleteChatMessage(id: string, deviceHash: string, isAdmin = false): boolean {
    const data = loadLocalDB();
    const index = (data.chat_messages || []).findIndex((m) => m.id === id);
    if (index === -1) throw new Error('ไม่พบข้อความ');

    const message = data.chat_messages![index];
    if (!isAdmin && message.device_hash !== deviceHash) {
      throw new Error('คุณสามารถลบได้เฉพาะข้อความที่คุณเขียนเท่านั้น');
    }

    data.chat_messages!.splice(index, 1);
    saveLocalDB(data);
    return true;
  },

  reportChatMessage(id: string, deviceHash: string, reason = 'เนื้อหาไม่เหมาะสม'): boolean {
    const data = loadLocalDB();
    const message = (data.chat_messages || []).find((m) => m.id === id);
    if (!message) throw new Error('ไม่พบข้อความ');

    message.report_count = (message.report_count || 0) + 1;
    if (message.report_count >= 3) {
      message.status = 'hidden';
    }
    saveLocalDB(data);
    return true;
  },
};
