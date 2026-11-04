import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { CreateChatMessagePayload } from '@/types/chat';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '80', 10);
    const messages = db.getChatMessages(limit);
    return NextResponse.json(
      { success: true, messages },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: CreateChatMessagePayload = await req.json();

    if (!body.content || !body.content.trim()) {
      return NextResponse.json(
        { success: false, error: 'กรุณาพิมพ์ข้อความก่อนส่ง' },
        { status: 400 }
      );
    }

    if (!body.device_hash) {
      return NextResponse.json(
        { success: false, error: 'ไม่พบรหัสอุปกรณ์นิรนาม (Device hash required)' },
        { status: 400 }
      );
    }

    const { message, isCrisis } = db.createChatMessage({
      author_name: body.author_name || 'เพื่อนร่วมห้อง',
      avatar: body.avatar || '🐱',
      avatar_bg: body.avatar_bg || '#fed7aa',
      content: body.content,
      device_hash: body.device_hash,
    });

    return NextResponse.json({ success: true, message, isCrisis }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'เกิดข้อผิดพลาดในการส่งข้อความ' },
      { status: 400 }
    );
  }
}
