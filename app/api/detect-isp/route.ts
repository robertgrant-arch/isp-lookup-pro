import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const forwarded = req.headers.get('x-forwarded-for') || '';
    const ip = forwarded.split(',')[0].trim() || '0.0.0.0';

    const res = await fetch(`https://ipwho.is/${ip}`);
    if (!res.ok) throw new Error('Lookup failed');
    const data = await res.json();

    return NextResponse.json({
      ip: data.ip ?? ip,
      isp: data.connection?.isp ?? data.org ?? '',
      org: data.connection?.org ?? data.org ?? '',
      asn: data.connection?.asn ? `AS${data.connection.asn}` : '',
      city: data.city ?? '',
      region: data.region ?? '',
      country: data.country ?? '',
      type: data.connection?.type ?? '',
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: 'Unable to detect ISP right now.' },
      { status: 500 }
    );
  }
}
