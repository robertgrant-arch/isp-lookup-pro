import { NextRequest, NextResponse } from 'next/server';
import { getAllKeys } from '@/lib/store';
import { validateAdminSecret } from '@/lib/auth';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  if (!validateAdminSecret(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const keys = getAllKeys();
  return NextResponse.json({
    keys: keys.map((k) => ({
      key_prefix: k.key.substring(0, 16) + '...',
      key: k.key,
      label: k.label,
      requests_today: k.requests_today,
      requests_total: k.requests_total,
      rate_limit: k.rate_limit,
      remaining_today: Math.max(0, k.rate_limit - k.requests_today),
      last_used: k.last_used,
      created_at: k.created_at,
      active: k.active,
    })),
  });
}
