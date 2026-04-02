import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

interface CensusAddressMatch {
  matchedAddress: string;
  coordinates: { x: number; y: number };
  addressComponents: {
    zip: string;
    streetName: string;
    city: string;
    state: string;
    fromAddress: string;
    toAddress: string;
  };
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim();
  if (!q || q.length < 4) {
    return NextResponse.json({ suggestions: [] });
  }

  try {
    const url = new URL(
      'https://geocoding.geo.census.gov/geocoder/locations/onelineaddress'
    );
    url.searchParams.set('address', q);
    url.searchParams.set('benchmark', '2020');
    url.searchParams.set('format', 'json');

    const res = await fetch(url.toString(), { cache: 'no-store' });
    if (!res.ok) {
      return NextResponse.json({ suggestions: [] });
    }

    const json = await res.json();
    const matches: CensusAddressMatch[] =
      json?.result?.addressMatches ?? [];

    const suggestions = matches.slice(0, 5).map((m) => ({
      address: m.matchedAddress,
      lat: m.coordinates.y,
      lng: m.coordinates.x,
      city: m.addressComponents.city,
      state: m.addressComponents.state,
      zip: m.addressComponents.zip,
    }));

    return NextResponse.json({ suggestions });
  } catch {
    return NextResponse.json({ suggestions: [] });
  }
}
