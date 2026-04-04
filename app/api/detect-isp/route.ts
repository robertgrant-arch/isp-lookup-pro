import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
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
          ip: ip || 'unknown',
          isp: 'Unable to determine',
          org: '',
          asn: '',
          city: '',
          region: '',
          country: '',
          type: '',
        });
      }
      return buildResponse(data2, ip);
    }

    return buildResponse(data, ip);
  } catch (e: any) {
    console.error('detect-isp error:', e?.message);
    return NextResponse.json(
      { error: 'Unable to detect ISP right now.' },
      { status: 500 }
    );
  }
}

function buildResponse(data: any, fallbackIp: string) {
  return NextResponse.json({
    ip: data.ip ?? fallbackIp ?? 'unknown',
    isp: data.connection?.isp ?? '',
    org: data.connection?.org ?? data.org ?? '',
    asn: data.connection?.asn ? `AS${data.connection.asn}` : '',
    city: data.city ?? '',
    region: data.region ?? '',
    country: data.country ?? '',
    type: data.connection?.type ?? '',
  });
}
