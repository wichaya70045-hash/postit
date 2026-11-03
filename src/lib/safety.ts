// Safety, PII filtering and crisis detection logic according to spec

export interface SafetyCheckResult {
  hasPII: boolean;
  piiReasons: string[];
  isCrisis: boolean;
  crisisKeywords: string[];
  isAbusive: boolean;
  abusiveReasons: string[];
}

// Regex patterns for Thai phone numbers, international formats, emails, URLs, and LINE IDs
const PHONE_REGEX = /(\+?66|0)[0-9]{1,2}[-.\s]?[0-9]{3,4}[-.\s]?[0-9]{3,4}\b/;
const EMAIL_REGEX = /[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+/;
const URL_REGEX = /(https?:\/\/|www\.)[^\s/$.?#].[^\s]*/i;
const LINE_ID_REGEX = /(line\s*(id)?\s*[:=]\s*[@a-zA-Z0-9._-]+)|(@[a-zA-Z0-9._-]{4,})/i;

// Profanity list for Thai and English abusive speech
const ABUSIVE_PATTERNS = [
  /ควย/i,
  /เหี้ย/i,
  /สัส/i,
  /เย็ด/i,
  /หมาบ้า/i,
  /อีดอก/i,
  /กวนส้น/i,
  /แม่ง/i,
  /\bfuck\b/i,
  /\bshit\b/i,
  /\bbitch\b/i,
];

// Crisis and self-harm keywords (Requires compassionate intervention without blocking)
const CRISIS_KEYWORDS = [
  'อยากตาย',
  'ไม่อยากอยู่แล้ว',
  'ฆ่าตัวตาย',
  'ทำร้ายตัวเอง',
  'จบชีวิต',
  'ลาโลก',
  'ไม่อยากตื่นขึ้นมาอีก',
  'เหนื่อยจนไม่อยากหายใจ',
  'ทรมานจนไม่อยากอยู่',
  'ตายไปคงดี',
  'ไม่อยากมีชีวิตอยู่แล้ว',
];

export function checkSafety(content: string): SafetyCheckResult {
  const trimmed = content.trim();
  const piiReasons: string[] = [];
  const abusiveReasons: string[] = [];
  const matchedCrisisKeywords: string[] = [];

  // 1. PII Checks
  if (PHONE_REGEX.test(trimmed)) {
    piiReasons.push('พบหมายเลขโทรศัพท์');
  }
  if (EMAIL_REGEX.test(trimmed)) {
    piiReasons.push('พบอีเมล');
  }
  if (URL_REGEX.test(trimmed)) {
    piiReasons.push('พบลิงก์หรือเว็บไซต์');
  }
  if (LINE_ID_REGEX.test(trimmed)) {
    piiReasons.push('พบช่องทางติดต่อหรือ LINE ID');
  }

  // 2. Abusive / Profanity Checks
  for (const pattern of ABUSIVE_PATTERNS) {
    if (pattern.test(trimmed)) {
      abusiveReasons.push('มีคำที่ไม่สุภาพหรืออาจกระทบกระเทือนใจผู้อื่น');
      break;
    }
  }

  // 3. Crisis Keywords Check
  const lowerContent = trimmed.toLowerCase();
  for (const keyword of CRISIS_KEYWORDS) {
    if (lowerContent.includes(keyword)) {
      matchedCrisisKeywords.push(keyword);
    }
  }

  return {
    hasPII: piiReasons.length > 0,
    piiReasons,
    isCrisis: matchedCrisisKeywords.length > 0,
    crisisKeywords: matchedCrisisKeywords,
    isAbusive: abusiveReasons.length > 0,
    abusiveReasons,
  };
}

