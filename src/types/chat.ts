export interface ChatMessage {
  id: string;
  author_name: string;      // Pseudonym / fake name (e.g. "เด็กหลังห้อง", "คุณกระต่ายขี้เซา")
  avatar: string;           // Emoji or avatar token (e.g. "🐱", "🐰", "🦊")
  avatar_bg: string;        // Hex color background (e.g. "#fef08a", "#bae6fd")
  content: string;          // Message content
  created_at: string;       // ISO 8601 string
  likes: number;            // Number of likes
  liked_by?: string[];      // Array of device hashes
  device_hash: string;      // Anonymous device hash of author (for author deletion)
  status: 'visible' | 'hidden' | 'deleted';
  risk_flag?: boolean;
  report_count?: number;
}

export interface CreateChatMessagePayload {
  author_name: string;
  avatar: string;
  avatar_bg?: string;
  content: string;
  device_hash: string;
}
