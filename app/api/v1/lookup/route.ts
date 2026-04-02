import { NextRequest, NextResponse } from 'next/server';
import { lookupAddress } from '@/lib/fcc';
import { cacheGet, cacheSet, validateAndConsume } from '@/lib/store';
import { extractApiKey } from '@/lib/auth';
import type { LookupResponse } from '@/lib/types';

export const runtime = 'nodejs';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type',
};

function errorResponse(message: string, code: string, status: number) {
  return NextResponse.json(
    {
      success: false,
      error: { code, message },
      timestamp: new Date().toISOString(),
    },
    { status, headers: corsHeaders }
  );
}

export async function GET(req: NextRequest) {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const apiKey = extractApiKey(req);
  if (!apiKey) {
    return errorResponse(
      'API key required. Pass ?api_key=xxx or Authorization: Bearer xxx',
      'MISSING_API_KEY',
      401
    );
  }

  const auth = validateAndConsume(apiKey);
  if (!auth.valid) {
    const isRateLimit = auth.error?.includes('Rate limit');
    return errorResponse(
      auth.error ?? 'Unauthorized',
      isRateLimit ? 'RATE_LIMIT_EXCEEDED' : 'INVALID_API_KEY',
      isRateLimit ? 429 : 401
    );
  }

  // ── Address ─────────────────────────────────────────────────────────────
  const address = req.nextUrl.searchParams.get('address')?.trim();
  if (!address) {
    return errorResponse('address query parameter is required', 'MISSING_ADDRESS', 400);
  }
  if (address.length < 5) {
    return errorResponse('Address is too short', 'INVALID_ADDRESS', 400);
  }

  // ── Cache ───────────────────────────────────────────────────────────────
  const cacheKey = `lookup:${address.toLowerCase()}`;
  const cached = cacheGet(cacheKey);
  if (cached) {
    return NextResponse.json(
      {
        success: true,
        cached: true,
        data: cached,
        usage: {
          requests_today: auth.record!.requests_today,
          remaining_today: Math.max(0, auth.record!.rate_limit - auth.record!.requests_today),
          rate_limit: auth.record!.rate_limit,
        },
      },
      { headers: corsHeaders }
    );
  }

  // ── FCC Lookup ──────────────────────────────────────────────────────────
  try {
    const result = await lookupAddress(address);
    if (!result) {
      return errorResponse(
        'Address not found in FCC Broadband Map database',
        'ADDRESS_NOT_FOUND',
        404
      );
    }

    const response: LookupResponse = {
      address: `${result.location.address}${result.location.unit ? ` ${result.location.unit}` : ''}, ${result.location.city}, ${result.location.state} ${result.location.zip}`,
      location_id: result.location.location_id,
      latitude: result.location.latitude,
      longitude: result.location.longitude,
      providers: result.providers,
      cached: false,
      timestamp: new Date().toISOString(),
    };

    cacheSet(cacheKey, response);

    return NextResponse.json(
      {
        success: true,
        cached: false,
        data: response,
        usage: {
          requests_today: auth.record!.requests_today,
          remaining_today: Math.max(0, auth.record!.rate_limit - auth.record!.requests_today),
          rate_limit: auth.record!.rate_limit,
        },
      },
      { headers: corsHeaders }
    );
  } catch (err) {
    console.error('[/api/v1/lookup] FCC error:', err);
    return errorResponse('Upstream FCC API error', 'UPSTREAM_ERROR', 502);
  }
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}
