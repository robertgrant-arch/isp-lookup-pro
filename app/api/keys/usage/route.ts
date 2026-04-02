import { NextRequest, NextResponse } from 'next/server';
import { getUsage, getAllKeys, getCacheStats } from '@/lib/store';
import { extractApiKey, validateAdminSecret } from '@/lib/auth';

export const runtime = 'nodejs';

// GET /api/keys/usage - individual key stats (uses own key auth)
// GET /api/keys/usage?all=true - all keys (requires admin secret)
export async function GET(req: NextRequest) {
  const allParam = req.nextUrl.searchParams.get('all');

  if (allParam === 'true') {
    if (!validateAdminSecret(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const keys = getAllKeys();
    const cache = getCacheStats();
    return NextResponse.json({
      keys: keys.map((k) => ({
        key_prefix: k.key.substring(0, 12) + '...',
        label: k.label,
        requests_today: k.requests_today,
        requests_total: k.requests_total,
        rate_limit: k.rate_limit,
        remaining_today: Math.max(0, k.rate_limit - k.requests_today),
        last_used: k.last_used,
        created_at: k.created_at,
        active: k.active,
      })),
      cache,
    });
  }

  // Individual key lookup
  const key = extractApiKey(req);
  if (!key) {
    return NextResponse.json(
      { error: 'Provide api_key query param or Authorization: Bearer <key>' },
      { status: 401 }
    );
  }

  const record = getUsage(key);
  if (!record) {
    return NextResponse.json({ error: 'API key not found' }, { status: 404 });
  }

  return NextResponse.json({
    key_prefix: record.key.substring(0, 12) + '...',
    label: record.label,
    requests_today: record.requests_today,
    requests_total: record.requests_total,
    rate_limit: record.rate_limit,
    remaining_today: Math.max(0, record.rate_limit - record.requests_today),
    last_used: record.last_used,
    created_at: record.created_at,
    active: record.active,
  });
}
