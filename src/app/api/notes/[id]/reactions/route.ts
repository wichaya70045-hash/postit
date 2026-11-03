import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ReactionType } from '@/types/note';

const VALID_REACTIONS: ReactionType[] = ['heart', 'hug', 'sparkle', 'cheer', 'idea'];

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { type, device_hash } = body;

    if (!type || !VALID_REACTIONS.includes(type)) {
      return NextResponse.json({ success: false, error: 'ประเภทรัวแอคชันไม่ถูกต้อง' }, { status: 400 });
    }

    if (!device_hash) {
      return NextResponse.json({ success: false, error: 'ไม่พบรหัสอุปกรณ์' }, { status: 400 });
    }

    const result = await db.addReaction(id, device_hash, type);
    return NextResponse.json({ success: true, reactionCounts: result.reactionCounts });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
