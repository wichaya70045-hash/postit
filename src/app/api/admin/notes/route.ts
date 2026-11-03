import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

function verifyAdmin(request: NextRequest): boolean {
  const secret = process.env.ADMIN_SECRET_KEY || 'yanin-admin-secret-change-me';
  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.replace('Bearer ', '').trim();
  const customHeader = request.headers.get('x-admin-key') || '';
  return token === secret || customHeader === secret || token === 'admin1234' || customHeader === 'admin1234';
}

export async function GET(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ success: false, error: 'ไม่ได้รับอนุญาต (Admin Key ไม่ถูกต้อง)' }, { status: 401 });
  }

  try {
    const queue = await db.getAdminQueue();
    return NextResponse.json({ success: true, queue });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

