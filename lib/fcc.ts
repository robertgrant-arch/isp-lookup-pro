import type { LocationResult, Provider } from './types';
import { getTechInfo } from './techCodes';

const FCC_BASE = 'https://broadbandmap.fcc.gov/api/public/map';
const USER_AGENT =
  process.env.FCC_USER_AGENT ?? 'ISPLookupPro/1.0 (https://github.com/isplookuppro)';

const defaultHeaders = {
  'User-Agent': USER_AGENT,
  Accept: 'application/json',
};

// ─── Step 1: Search for location ─────────────────────────────────────────────

interface FccLocationRaw {
  location_id: string;
  address: string;
  unit?: string;
  city: string;
  state: string;
  zip: string;
  latitude: number;
  longitude: number;
}

interface FccSearchResponse {
  data?: FccLocationRaw[];
  message?: string;
}

export async function searchLocations(address: string): Promise<LocationResult[]> {
  const url = new URL(`${FCC_BASE}/listSearchedLocations`);
  url.searchParams.set('search_text', address);
  url.searchParams.set('limit', '10');

  const res = await fetch(url.toString(), {
    headers: defaultHeaders,
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    throw new Error(`FCC location search failed: ${res.status} ${res.statusText}`);
  }

  const json: FccSearchResponse = await res.json();

  if (!json.data || json.data.length === 0) {
    return [];
  }

  return json.data.map((loc) => ({
    location_id: loc.location_id,
    address: loc.address,
    unit: loc.unit ?? null,
    city: loc.city,
    state: loc.state,
    zip: loc.zip,
    latitude: loc.latitude,
    longitude: loc.longitude,
  }));
}

// ─── Step 2: Get availability for a location ─────────────────────────────────

interface FccProviderRaw {
  provider_id: number;
  brand_name: string;
  technology: number;
  max_download_speed: number;
  max_upload_speed: number;
  low_latency: number; // 0 or 1
  business_residential_code: string;
}

interface FccAvailabilityResponse {
  data?: {
    availability?: FccProviderRaw[];
  };
  message?: string;
}

export async function getAvailability(locationId: string): Promise<Provider[]> {
  const url = `${FCC_BASE}/listAvailability/${encodeURIComponent(locationId)}`;

  const res = await fetch(url, {
    headers: defaultHeaders,
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    throw new Error(`FCC availability lookup failed: ${res.status} ${res.statusText}`);
  }

  const json: FccAvailabilityResponse = await res.json();
  const raw = json.data?.availability ?? [];

  return raw.map((p) => {
    const techInfo = getTechInfo(p.technology);
    return {
      provider_id: p.provider_id,
      brand_name: p.brand_name,
      technology: p.technology,
      technology_label: techInfo.label,
      technology_category: techInfo.category,
      max_download_speed: p.max_download_speed,
      max_upload_speed: p.max_upload_speed,
      low_latency: p.low_latency === 1,
      business_residential_code: p.business_residential_code,
    };
  });
}

// ─── Combined lookup ──────────────────────────────────────────────────────────

export async function lookupAddress(address: string): Promise<{
  location: LocationResult;
  providers: Provider[];
} | null> {
  const locations = await searchLocations(address);
  if (locations.length === 0) return null;

  const location = locations[0];
  const providers = await getAvailability(location.location_id);

  // Deduplicate by provider + technology combo and sort: fastest first
  const seen = new Set<string>();
  const unique = providers.filter((p) => {
    const key = `${p.provider_id}-${p.technology}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  unique.sort((a, b) => b.max_download_speed - a.max_download_speed);

  return { location, providers: unique };
}
