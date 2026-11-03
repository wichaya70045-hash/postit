import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

function verifyAdmin(request: NextRequest): boolean {
  const secret = process.env.ADMIN_SECRET_KEY || 'yanin-admin-secret-change-me';
  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.replace('Bearer ', '').trim();
  const customHeader = request.headers.get('x-admin-key') || '';
  return token === secret || customHeader === secret;
}

export async function POST(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ success: false, error: 'ไม่ได้รับอนุญาต (Admin Key ไม่ถูกต้อง)' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action, announcement } = body;

    if (action === 'reset_board') {
      const resetNotes = db.resetBoardToDefault();
      return NextResponse.json({
        success: true,
        message: 'รีเซ็ตกระดานกลับสู่ค่าเริ่มต้นเรียบร้อยแล้ว',
        notes: resetNotes,
      });
    }

    if (action === 'set_announcement') {
      if (!announcement || typeof announcement !== 'string') {
        return NextResponse.json({ success: false, error: 'กรุณาระบุข้อความประกาศ' }, { status: 400 });
      }
      const updated = db.setAnnouncement(announcement.trim());
      return NextResponse.json({
        success: true,
        message: 'อัปเดตประกาศประจำวันสำเร็จ',
        announcement: updated,
      });
    }

    return NextResponse.json({ success: false, error: 'คำสั่งไม่ถูกต้อง' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
