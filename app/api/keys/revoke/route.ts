import { NextRequest, NextResponse } from 'next/server';
import { revokeKey } from '@/lib/store';
import { validateAdminSecret } from '@/lib/auth';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  if (!validateAdminSecret(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { key?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!body.key) {
    return NextResponse.json({ error: 'key is required' }, { status: 400 });
  }

  const ok = revokeKey(body.key);
  if (!ok) {
    return NextResponse.json({ error: 'Key not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, message: 'Key revoked' });
}
