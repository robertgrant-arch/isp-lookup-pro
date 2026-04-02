import type { LocationResult, Provider, TechCategory } from './types';

// ── Census Geocoder: address → lat/lng ────────────────────────────────────────

interface CensusMatch {
  matchedAddress: string;
  coordinates: { x: number; y: number };
  addressComponents: {
    zip: string;
    streetName: string;
    city: string;
    state: string;
    fromAddress: string;
    toAddress: string;
    preDirection: string;
    suffixType: string;
  };
}

async function geocodeAddress(address: string): Promise<CensusMatch> {
  const url = new URL(
    'https://geocoding.geo.census.gov/geocoder/locations/onelineaddress'
  );
  url.searchParams.set('address', address);
  url.searchParams.set('benchmark', '2020');
  url.searchParams.set('format', 'json');

  const res = await fetch(url.toString(), { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Census geocoder failed: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();
  const match = json?.result?.addressMatches?.[0];
  if (!match) {
    throw new Error('Address not found by Census geocoder');
  }
  return match as CensusMatch;
}

// ── BroadbandMap.com API: lat/lng → providers ─────────────────────────────────

interface BroadbandMapProvider {
  name: string;
  technology: string;
  technology_code: number;
  max_download_mbps: number;
  max_upload_mbps: number;
  provider_id: number;
}

interface BroadbandMapResponse {
  lat: number;
  lng: number;
  h3_hex: string;
  h3_resolution: number;
  service_type: string;
  count: number;
  providers: BroadbandMapProvider[];
}

function techCodeToCategory(code: number): TechCategory {
  if (code === 50) return 'fiber';
  if (code === 40 || code === 41 || code === 42 || code === 43) return 'cable';
  if (code === 10 || code === 11 || code === 12 || code === 20) return 'dsl';
  if (code === 60) return 'satellite';
  if (code === 61) return 'satellite';
  if (code === 70 || code === 71 || code === 79) return 'fixed_wireless';
  return 'other';
}

function techCodeToLabel(code: number): string {
  const map: Record<number, string> = {
    10: 'ADSL',
    11: 'ADSL2',
    12: 'VDSL',
    20: 'DSL (Symmetric)',
    40: 'DOCSIS 3.0',
    41: 'DOCSIS 3.1',
    42: 'Cable (Other)',
    43: 'Cable Modem',
    50: 'Fiber to the Premises',
    60: 'GSO Satellite',
    61: 'LEO Satellite',
    70: 'Licensed Fixed Wireless',
    71: 'Unlicensed Fixed Wireless',
    79: 'Fixed Wireless (Other)',
  };
  return map[code] ?? `Technology ${code}`;
}

async function getProvidersAtLocation(
  lat: number,
  lng: number
): Promise<BroadbandMapProvider[]> {
  const url = `https://broadbandmap.com/api/v1/location/internet?lat=${lat}&lng=${lng}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(
      `BroadbandMap.com API failed: ${res.status} ${res.statusText}`
    );
  }
  const json: BroadbandMapResponse = await res.json();
  return json.providers ?? [];
}

// ── Combined lookup ───────────────────────────────────────────────────────────

export async function lookupAddress(address: string): Promise<{
  location: LocationResult;
  providers: Provider[];
} | null> {
  // Step 1: Geocode the address
  let geo: CensusMatch;
  try {
    geo = await geocodeAddress(address);
  } catch {
    return null;
  }

  const lat = geo.coordinates.y;
  const lng = geo.coordinates.x;
  const ac = geo.addressComponents;

  // Step 2: Look up broadband providers at that location
  const raw = await getProvidersAtLocation(lat, lng);

  // Step 3: Map to our Provider type
  const providers: Provider[] = raw.map((p) => ({
    provider_id: p.provider_id,
    brand_name: p.name,
    technology: p.technology_code,
    technology_label: techCodeToLabel(p.technology_code),
    technology_category: techCodeToCategory(p.technology_code),
    max_download_speed: p.max_download_mbps,
    max_upload_speed: p.max_upload_mbps,
    low_latency: p.technology_code !== 60, // GSO satellite = high latency
    business_residential_code: 'X',
  }));

  // Deduplicate by provider + technology and sort fastest first
  const seen = new Set<string>();
  const unique = providers.filter((p) => {
    const key = `${p.provider_id}-${p.technology}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  unique.sort((a, b) => b.max_download_speed - a.max_download_speed);

  const location: LocationResult = {
    location_id: `census-${lat}-${lng}`,
    address: geo.matchedAddress.split(',')[0] ?? geo.matchedAddress,
    unit: null,
    city: ac.city,
    state: ac.state,
    zip: ac.zip,
    latitude: lat,
    longitude: lng,
  };

  return { location, providers: unique };
}
