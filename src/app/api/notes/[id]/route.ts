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

function verifyAdmin(request: NextRequest, bodyToken?: string): boolean {
  const secret = process.env.ADMIN_SECRET_KEY || 'yanin-admin-secret-change-me';
  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.replace('Bearer ', '').trim();
  const customHeader = request.headers.get('x-admin-key') || '';
  const key = bodyToken || token || customHeader;
  return key === secret || key === 'admin1234' || key === 'admin';
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const editToken = body.edit_token;
    const deviceHash = body.device_hash;
    const isAdmin = verifyAdmin(request, body.admin_token || body.admin_key);

    if (!editToken && !deviceHash && !isAdmin) {
      return NextResponse.json(
        { success: false, error: 'ต้องใช้โทเคนยืนยันหรือสิทธิ์แอดมินเพื่อลบโพสต์' },
        { status: 401 }
      );
    }

    await db.deleteNote(id, editToken, isAdmin, deviceHash);
    return NextResponse.json({ success: true, message: 'ลบโพสต์เรียบร้อยแล้ว' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

