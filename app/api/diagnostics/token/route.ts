import { NextResponse } from 'next/server';
import crypto from 'crypto';

// In-memory token store (shared with diagnostics route)
// In production, use Redis or a database
const tokenStore = new Map<string, {
  email?: string;
  phone?: string;
  label?: string;
  createdAt: number;
  used: boolean;
  expiresAt: number;
}>();

// Export for use by the diagnostics route
export { tokenStore };

export async function POST(request: Request) {
  try {
    const adminSecret = request.headers.get('x-admin-secret');
    if (adminSecret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { email, phone, label } = body;

    const token = `diag_${crypto.randomBytes(16).toString('hex')}`;
    const now = Date.now();
    const expiresAt = now + 24 * 60 * 60 * 1000; // 24 hours

    tokenStore.set(token, {
      email: email || undefined,
      phone: phone || undefined,
      label: label || 'Unnamed',
      createdAt: now,
      used: false,
      expiresAt,
    });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://isp-lookup-pro-nine.vercel.app';

    return NextResponse.json({
      token,
      url: `${baseUrl}/diagnostics/${token}`,
      expiresAt: new Date(expiresAt).toISOString(),
      label: label || 'Unnamed',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate token', details: String(error) },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const adminSecret = request.headers.get('x-admin-secret');
  if (adminSecret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const tokens = Array.from(tokenStore.entries()).map(([token, data]) => ({
    token: token.substring(0, 12) + '...',
    fullToken: token,
    label: data.label,
    email: data.email,
    phone: data.phone,
    createdAt: new Date(data.createdAt).toISOString(),
    expiresAt: new Date(data.expiresAt).toISOString(),
    used: data.used,
    expired: Date.now() > data.expiresAt,
  }));

  return NextResponse.json({ tokens });
}
