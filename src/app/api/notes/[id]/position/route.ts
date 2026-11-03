import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { posX, posY } = body;

    if (typeof posX !== 'number' || typeof posY !== 'number') {
      return NextResponse.json({ success: false, error: 'พิกัดไม่ถูกต้อง' }, { status: 400 });
    }

    const updated = await db.updateNotePosition(id, posX, posY);
    return NextResponse.json({ success: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

