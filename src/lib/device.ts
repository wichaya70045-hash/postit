// Client-side anonymous device identity and edit token management

const DEVICE_ID_KEY = 'yanin_device_id';
const EDIT_TOKENS_KEY = 'yanin_edit_tokens';

// Generate a random cryptographically secure token
export function generateRandomToken(length = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  const cryptoObj = typeof window !== 'undefined' ? window.crypto : null;
  if (cryptoObj && cryptoObj.getRandomValues) {
    const values = new Uint32Array(length);
    cryptoObj.getRandomValues(values);
    for (let i = 0; i < length; i++) {
      token += chars[values[i] % chars.length];
    }
  } else {
    for (let i = 0; i < length; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  }
  return token;
}

// Get or create anonymous device hash
export function getOrCreateDeviceId(): string {
  if (typeof window === 'undefined') return 'server_render';
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);
  if (!deviceId) {
    deviceId = 'dev_' + generateRandomToken(24);
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }
  return deviceId;
}

// Store edit token locally for owner verification
export function saveEditToken(noteId: string, token: string): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(EDIT_TOKENS_KEY);
    const map: Record<string, string> = raw ? JSON.parse(raw) : {};
    map[noteId] = token;
    localStorage.setItem(EDIT_TOKENS_KEY, JSON.stringify(map));
  } catch (e) {
    console.error('Failed to save edit token', e);
  }
}

// Retrieve edit token for a note
export function getEditToken(noteId: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(EDIT_TOKENS_KEY);
    const map: Record<string, string> = raw ? JSON.parse(raw) : {};
    return map[noteId] || null;
  } catch {
    return null;
  }
}

// Get all note IDs owned by this device
export function getOwnedNoteIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(EDIT_TOKENS_KEY);
    const map: Record<string, string> = raw ? JSON.parse(raw) : {};
    return Object.keys(map);
  } catch {
    return [];
  }
}

// Remove edit token after deletion
export function removeEditToken(noteId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(EDIT_TOKENS_KEY);
    const map: Record<string, string> = raw ? JSON.parse(raw) : {};
    delete map[noteId];
    localStorage.setItem(EDIT_TOKENS_KEY, JSON.stringify(map));
  } catch {}
}

