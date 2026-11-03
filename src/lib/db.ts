import { Note, ReactionType, CreateNotePayload } from '@/types/note';
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
      };
      fs.writeFileSync(LOCAL_STORAGE_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const raw = fs.readFileSync(LOCAL_STORAGE_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading local DB', e);
    return {
      notes: getInitialSampleNotes(),
      reactions: [],
      reports: [],
      admin_actions: [],
    };
  }
}

function saveLocalDB(data: LocalDBData): void {
  try {
    if (!fs.existsSync(LOCAL_STORAGE_DIR)) {
      fs.mkdirSync(LOCAL_STORAGE_DIR, { recursive: true });
    }
    fs.writeFileSync(LOCAL_STORAGE_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error saving local DB', e);
  }
}

export const db = {
  // Fetch active notes on chalkboard
  async getNotes(limit = 60, offset = 0): Promise<{ notes: Note[]; maxCapacity: number; fallenNotes: Note[] }> {
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
    if (safety.isAbusive) {
      throw new Error(`ข้อความของคุณมีถ้อยคำที่ไม่เหมาะสม โปรดปรับแก้ไขก่อนแปะนะ`);
    }

    const randomRotation = Number((Math.random() * 10 - 5).toFixed(1));
    const newNoteId = 'note_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

    const posX = typeof payload.posX === 'number' ? payload.posX : Math.floor(Math.random() * 68) + 6;
    // New notes are posted at the topmost area first
    const posY = typeof payload.posY === 'number' ? payload.posY : Math.floor(Math.random() * 8) + 8;

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
    const currentActive = data.notes.filter((n) => n.status === 'visible');
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
    note.posX = Math.max(0, Math.min(90, posX));
    note.posY = Math.max(0, Math.min(90, posY));
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

  async deleteNote(noteId: string, editToken: string): Promise<boolean> {
    const data = loadLocalDB();
    const hashed = sha256(editToken);
    const index = data.notes.findIndex((n) => n.id === noteId && n.edit_token_hash === hashed);
    if (index === -1) {
      throw new Error('คุณไม่มีสิทธิ์ลบโพสต์นี้หรือไม่พบโพสต์');
    }
    data.notes.splice(index, 1);
    saveLocalDB(data);
    return true;
  },

  async getMyNotes(deviceHash: string, noteIds: string[]): Promise<Note[]> {
    const data = loadLocalDB();
    const myNotes = data.notes.filter(
      (n) => (n.device_hash === deviceHash || noteIds.includes(n.id)) && n.status !== 'hidden'
    );
    myNotes.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return myNotes.map(({ edit_token_hash, ...publicNote }) => publicNote);
  },

  async getAdminQueue(): Promise<{ flagged: Note[]; reported: Note[]; allNotes: Note[] }> {
    const data = loadLocalDB();
    const flagged = data.notes.filter((n) => n.risk_flag);
    const reported = data.notes.filter((n) => n.report_count > 0);
    return {
      flagged: flagged.map(({ edit_token_hash, ...p }) => p),
      reported: reported.map(({ edit_token_hash, ...p }) => p),
      allNotes: data.notes.map(({ edit_token_hash, ...p }) => p),
    };
  },

  async performAdminAction(adminId: string, noteId: string, action: 'hide' | 'restore' | 'delete', reason?: string): Promise<boolean> {
    const data = loadLocalDB();
    const note = data.notes.find((n) => n.id === noteId);
    if (!note) throw new Error('ไม่พบโพสต์');

    if (action === 'hide') {
      note.status = 'hidden';
    } else if (action === 'restore') {
      note.status = 'visible';
      note.report_count = 0;
    } else if (action === 'delete') {
      const idx = data.notes.findIndex((n) => n.id === noteId);
      if (idx !== -1) data.notes.splice(idx, 1);
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
};
