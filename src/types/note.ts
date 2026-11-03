export type ReactionType = 'heart' | 'hug' | 'sparkle' | 'cheer' | 'idea';

export interface ReactionCounts {
  heart: number;
  hug: number;
  sparkle: number;
  cheer: number;
  idea: number;
}

export interface NoteStroke {
  points: number[][]; // [x, y, pressure]
  color: string;
  size: number;
}

export interface Note {
  id: string;
  kind: 'text' | 'drawing';
  body?: string;
  strokes?: NoteStroke[];
  caption?: string;
  color: string; // Any hex color code (e.g. #fef08a, #ff7597, #bae6fd)
  posX: number; // Percentage X (0 - 90%)
  posY: number; // Percentage Y (0 - 90%)
  rotation: number; // -6 to +6 degrees
  status: 'visible' | 'hidden' | 'pending_review' | 'fallen';
  risk_flag: boolean;
  report_count: number;
  reaction_counts: ReactionCounts;
  created_at: string;
  device_hash: string;
}

export interface CreateNotePayload {
  kind: 'text' | 'drawing';
  body?: string;
  strokes?: NoteStroke[];
  caption?: string;
  color: string;
  posX?: number;
  posY?: number;
  device_hash: string;
  edit_token: string;
}

export interface NoteDetailResponse {
  note: Note;
  userReactions: ReactionType[];
  isOwner: boolean;
}
