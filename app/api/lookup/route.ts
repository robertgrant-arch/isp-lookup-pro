import { NextRequest, NextResponse } from 'next/server';
import { lookupAddress } from '@/lib/fcc';
import { cacheGet, cacheSet } from '@/lib/store';
import type { LookupResponse } from '@/lib/types';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  let body: { address?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const address = body.address?.trim();
  if (!address) {
    return NextResponse.json({ error: 'address is required' }, { status: 400 });
  }

  if (address.length < 5) {
    return NextResponse.json({ error: 'Address too short' }, { status: 400 });
  }

  const cacheKey = `lookup:${address.toLowerCase()}`;
  const cached = cacheGet<LookupResponse>(cacheKey);
  if (cached) {
    return NextResponse.json({ ...cached, cached: true });
  }

  try {
    const result = await lookupAddress(address);

    if (!result) {
      return NextResponse.json(
        { error: 'Address not found. Try a more specific address including street number, city, and state.' },
        { status: 404 }
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

    return NextResponse.json(response);
  } catch (err) {
    console.error('[/api/lookup] FCC API error:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to query FCC Broadband Map API', detail: message },
      { status: 502 }
    );
  }
}
