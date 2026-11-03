import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

const createNoteSchema = z.object({
  kind: z.enum(['text', 'drawing']),
  body: z.string().max(280, 'ข้อความต้องไม่เกิน 280 ตัวอักษร').optional(),
  strokes: z
    .array(
      z.object({
        points: z.array(z.array(z.number())),
        color: z.string(),
        size: z.number(),
      })
    )
    .optional(),
  caption: z.string().max(100, 'คำบรรยายต้องไม่เกิน 100 ตัวอักษร').optional(),
  color: z.string().min(1, 'กรุณาเลือกสีกระดาษ'),
  posX: z.number().min(0).max(95).optional(),
  posY: z.number().min(0).max(95).optional(),
  device_hash: z.string().min(1, 'ต้องมีรหัสอุปกรณ์'),
  edit_token: z.string().min(8, 'ต้องมีรหัสแก้ไข'),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '60', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const result = await db.getNotes(limit, offset);
    return NextResponse.json(
      {
        success: true,
        notes: result.notes,
        maxCapacity: result.maxCapacity,
        fallenNotes: result.fallenNotes,
        announcement: (result as any).announcement || 'เวรประจำวัน: ช่วยกันส่งต่อรอยยิ้ม',
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createNoteSchema.parse(body);

    if (parsed.kind === 'text' && (!parsed.body || parsed.body.trim().length === 0)) {
      return NextResponse.json(
        { success: false, error: 'กรุณาพิมพ์ข้อความก่อนแปะ' },
        { status: 400 }
      );
    }

    if (parsed.kind === 'drawing' && (!parsed.strokes || parsed.strokes.length === 0)) {
      return NextResponse.json(
        { success: false, error: 'กรุณาวาดภาพก่อนแปะ' },
        { status: 400 }
      );
    }

    if (parsed.kind === 'drawing' && parsed.strokes) {
      const strokeSize = Buffer.byteLength(JSON.stringify(parsed.strokes), 'utf8');
      if (strokeSize > 50 * 1024) {
        return NextResponse.json(
          { success: false, error: 'ลายเส้นมีขนาดใหญ่เกินกำหนด (เกิน 50 KB)' },
          { status: 400 }
        );
      }
    }

    const { note, isCrisis, oldestFallenNote } = await db.createNote(parsed);

    return NextResponse.json({
      success: true,
      note,
      isCrisis,
      oldestFallenNote,
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: error.errors[0]?.message || 'ข้อมูลไม่ถูกต้อง' },
        { status: 400 }
      );
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
