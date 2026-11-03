import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { searchParams } = new URL(req.url);
    const body = await req.json().catch(() => ({}));
    const deviceHash = body.device_hash || searchParams.get('device_hash');
    const adminKey = req.headers.get('x-admin-key');
    const isAdmin = adminKey === 'admin1234' || adminKey === process.env.ADMIN_SECRET_KEY;

    if (!deviceHash && !isAdmin) {
      return NextResponse.json(
        { success: false, error: 'ต้องระบุ device_hash หรือสิทธิ์แอดมิน' },
        { status: 400 }
      );
    }

    db.deleteChatMessage(id, deviceHash || '', isAdmin);
    return NextResponse.json({ success: true, message: 'ลบข้อความเรียบร้อย' });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 400 }
    );
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const action = body.action;

    if (action === 'report') {
      const deviceHash = body.device_hash || 'anon';
      const reason = body.reason || 'เนื้อหาไม่เหมาะสม';
      db.reportChatMessage(id, deviceHash, reason);
      return NextResponse.json({ success: true, message: 'รายงานข้อความเรียบร้อย' });
    }

    return NextResponse.json(
      { success: false, error: 'คำสั่งไม่ถูกต้อง' },
      { status: 400 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 400 }
    );
  }
}
