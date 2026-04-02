import { NextRequest, NextResponse } from 'next/server';
import { generateKey } from '@/lib/store';
import { validateAdminSecret } from '@/lib/auth';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  if (!validateAdminSecret(req)) {
    return NextResponse.json({ error: 'Unauthorized. Provide x-admin-secret header.' }, { status: 401 });
  }

  let body: { label?: string; rate_limit?: number };
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const label = (body.label ?? 'Unnamed Key').slice(0, 64);
  const rateLimit = Math.min(Math.max(Number(body.rate_limit ?? 100), 1), 10000);

  const key = generateKey(label, rateLimit);

  return NextResponse.json({
    success: true,
    key: key.key,
    label: key.label,
    rate_limit: key.rate_limit,
    created_at: key.created_at,
    message: 'Store this key securely. It cannot be retrieved again.',
  });
}
