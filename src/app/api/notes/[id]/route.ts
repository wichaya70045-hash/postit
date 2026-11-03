import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const deviceHash = searchParams.get('device_hash') || '';

    const note = await db.getNoteById(id);
    if (!note) {
      return NextResponse.json({ success: false, error: 'ไม่พบโพสต์นี้' }, { status: 404 });
    }

    const userReactions = deviceHash
      ? await db.getUserReactionsForNote(id, deviceHash)
      : [];
    const isOwner = deviceHash ? note.device_hash === deviceHash : false;

    return NextResponse.json({
      success: true,
      note,
      userReactions,
      isOwner,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const editToken = body.edit_token;

    if (!editToken) {
      return NextResponse.json(
        { success: false, error: 'ต้องใช้โทเคนยืนยันเพื่อลบโพสต์' },
        { status: 401 }
      );
    }

    await db.deleteNote(id, editToken);
    return NextResponse.json({ success: true, message: 'ลบโพสต์เรียบร้อยแล้ว' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

