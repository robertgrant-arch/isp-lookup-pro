import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

// Provider normalization map
const PROVIDER_MAP: Record<string, string> = {
  'google fiber': 'Google Fiber',
  'charter': 'Spectrum',
  'spectrum': 'Spectrum',
  'comcast': 'Xfinity',
  'xfinity': 'Xfinity',
  'at&t': 'AT&T',
  'att services': 'AT&T',
  'att-internet': 'AT&T',
  'bellsouth': 'AT&T',
  'cox': 'Cox',
  'cox communications': 'Cox',
  'frontier': 'Frontier',
  'frontier communications': 'Frontier',
  'verizon': 'Verizon',
  'verizon fios': 'Verizon Fios',
  'verizon business': 'Verizon',
  't-mobile': 'T-Mobile',
  'tmobile': 'T-Mobile',
  'sprint': 'T-Mobile',
  'centurylink': 'CenturyLink',
  'lumen': 'CenturyLink',
  'windstream': 'Windstream',
  'mediacom': 'Mediacom',
  'optimum': 'Optimum',
  'altice': 'Optimum',
  'cablevision': 'Optimum',
  'suddenlink': 'Suddenlink',
  'rcn': 'RCN',
  'wow': 'WOW!',
  'wide open west': 'WOW!',
  'consolidated': 'Consolidated Communications',
  'atlantic broadband': 'Breezeline',
  'breezeline': 'Breezeline',
  'earthlink': 'EarthLink',
  'hughesnet': 'HughesNet',
  'viasat': 'Viasat',
  'starlink': 'Starlink',
  'spacex': 'Starlink',
};

// Mobile carrier detection
const MOBILE_CARRIERS = ['t-mobile', 'verizon wireless', 'at&t mobility', 'sprint', 'us cellular', 'cricket', 'metro', 'boost', 'visible', 'mint mobile', 'google fi'];

function normalizeProvider(rawOrg: string): { provider: string; normalized: boolean } {
  const lower = rawOrg.toLowerCase();
  for (const [key, value] of Object.entries(PROVIDER_MAP)) {
    if (lower.includes(key)) {
      return { provider: value, normalized: true };
    }
  }
  return { provider: rawOrg, normalized: false };
}

function detectConnectionType(rawOrg: string, type: string): string {
  const lower = rawOrg.toLowerCase();
  if (MOBILE_CARRIERS.some(c => lower.includes(c))) return 'Mobile';
  if (type === 'isp') return 'Residential Broadband';
  if (type === 'business') return 'Business';
  if (type === 'hosting') return 'Hosting/Datacenter';
  if (type === 'education') return 'Education';
  if (type === 'government') return 'Government';
  return type || 'Unknown';
}

function detectVpn(rawOrg: string, type: string): boolean {
  const lower = rawOrg.toLowerCase();
  const vpnKeywords = ['vpn', 'private internet', 'nord', 'express', 'surfshark', 'proton', 'mullvad', 'cloudflare warp', 'tunnel'];
  if (vpnKeywords.some(k => lower.includes(k))) return true;
  if (type === 'hosting') return true;
  return false;
}

export async function GET(req: NextRequest) {
  const startTime = Date.now();

  try {
    const forwarded = req.headers.get('x-forwarded-for') || '';
    const realIp = req.headers.get('x-real-ip') || '';
    const ip = realIp || forwarded.split(',')[0].trim();

    // Use ipwho.is - if we have client IP use it, otherwise let it auto-detect
    const url = ip ? `https://ipwho.is/${ip}` : 'https://ipwho.is/';
    const res = await fetch(url, {
      headers: { 'User-Agent': 'ISPLookupPro/1.0' },
    });
    const data = await res.json();

    if (data.success === false) {
      // Try without IP as fallback
      const res2 = await fetch('https://ipwho.is/', {
        headers: { 'User-Agent': 'ISPLookupPro/1.0' },
      });
      const data2 = await res2.json();
      if (data2.success === false) {
        return NextResponse.json({
          success: false,
          ip: ip || 'unknown',
          isp: 'Unable to determine',
          provider: 'Unable to determine',
          org: '',
          asn: '',
          connectionType: 'Unknown',
          isVpn: false,
          confidence: 'low',
          location: { city: '', region: '', country: '' },
          responseTime: Date.now() - startTime,
          detectedAt: new Date().toISOString(),
        }, {
          headers: corsHeaders(),
        });
      }
      return buildResponse(data2, ip, startTime);
    }

    return buildResponse(data, ip, startTime);
  } catch (e: any) {
    console.error('detect-isp error:', e?.message);
    return NextResponse.json(
      { success: false, error: 'Unable to detect ISP right now.' },
      { status: 500, headers: corsHeaders() }
    );
  }
}

// Support CORS preflight for external API consumers
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(),
  });
}

function corsHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Cache-Control': 'no-store, no-cache, must-revalidate',
  };
}

function buildResponse(data: any, fallbackIp: string, startTime: number) {
  const rawIsp = data.connection?.isp ?? '';
  const rawOrg = data.connection?.org ?? data.org ?? '';
  const rawType = data.connection?.type ?? '';
  const asnNum = data.connection?.asn;
  const asn = asnNum ? `AS${asnNum}` : '';

  const { provider, normalized } = normalizeProvider(rawIsp || rawOrg);
  const connectionType = detectConnectionType(rawIsp || rawOrg, rawType);
  const isVpn = detectVpn(rawIsp || rawOrg, rawType);

  // Confidence scoring
  let confidence: 'high' | 'medium' | 'low' = 'medium';
  if (normalized && !isVpn && rawType === 'isp') confidence = 'high';
  if (isVpn || !rawIsp) confidence = 'low';

  return NextResponse.json({
    success: true,
    ip: data.ip ?? fallbackIp ?? 'unknown',
    isp: rawIsp,
    provider,
    org: rawOrg,
    asn,
    connectionType,
    isVpn,
    confidence,
    location: {
      city: data.city ?? '',
      region: data.region ?? '',
      country: data.country ?? '',
    },
    responseTime: Date.now() - startTime,
    detectedAt: new Date().toISOString(),
  }, {
    headers: corsHeaders(),
  });
}
