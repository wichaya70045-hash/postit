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
    const { note_id, action, reason, admin_id = 'admin_user' } = body;

    if (!note_id || !action || !['hide', 'restore', 'delete'].includes(action)) {
      return NextResponse.json({ success: false, error: 'ข้อมูลคำสั่งไม่ถูกต้อง' }, { status: 400 });
    }

    await db.performAdminAction(admin_id, note_id, action, reason);
    return NextResponse.json({ success: true, message: `ดำเนินการ ${action} สำเร็จแล้ว` });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

