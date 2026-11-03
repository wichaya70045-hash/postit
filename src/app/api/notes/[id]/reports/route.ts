import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { reason, device_hash } = body;

    if (!reason || typeof reason !== 'string') {
      return NextResponse.json({ success: false, error: 'กรุณาระบุเหตุผลการรายงาน' }, { status: 400 });
    }

    if (!device_hash) {
      return NextResponse.json({ success: false, error: 'ไม่พบรหัสอุปกรณ์' }, { status: 400 });
    }

    const result = await db.reportNote(id, device_hash, reason);
    return NextResponse.json({
      success: true,
      message: 'ขอบคุณที่ช่วยดูแลความปลอดภัยของชุมชน',
      hidden: result.hidden,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

