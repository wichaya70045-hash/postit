import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username = '', password = '', key = '' } = body;

    const validSecret = process.env.ADMIN_SECRET_KEY || 'yanin-admin-secret-change-me';
    
    // Check either username/password (admin / admin1234) or direct secret key
    const isValidCreds =
      (username.trim().toLowerCase() === 'admin' && (password === 'admin1234' || password === validSecret)) ||
      key.trim() === validSecret ||
      password.trim() === validSecret;

    if (!isValidCreds) {
      return NextResponse.json(
        { success: false, error: 'ชื่อผู้ใช้หรือรหัสผ่านผู้ดูแลไม่ถูกต้อง (ลองใช้ admin / admin1234)' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      token: validSecret,
      admin: {
        username: username || 'ครูเวร Yanin',
        role: 'ผู้ดูแลห้องเรียน',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
