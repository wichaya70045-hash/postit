import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json().catch(() => ({}));
    const deviceHash = body.device_hash;

    if (!deviceHash) {
      return NextResponse.json(
        { success: false, error: 'ต้องระบุ device_hash' },
        { status: 400 }
      );
    }

    const result = db.likeChatMessage(id, deviceHash);
    return NextResponse.json({ success: true, ...result });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 400 }
    );
  }
}
