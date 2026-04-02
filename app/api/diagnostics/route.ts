import { NextResponse } from 'next/server';

const tokenStore = new Map<string, { email?: string; phone?: string; createdAt: number; used: boolean }>();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const userIp = forwardedFor?.split(',')[0]?.trim() || realIp || '0.0.0.0';

  try {
    // Use freeipapi.com with user's real IP
    const res = await fetch(`https://freeipapi.com/api/json/${userIp}`);
    const d = await res.json();

    return NextResponse.json({
      ip: d.ipAddress || userIp,
      isp: d.asnOrganization || 'Unknown',
      org: d.asnOrganization || 'Unknown',
      asn: d.asn ? `AS${d.asn}` : 'Unknown',
      location: {
        city: d.cityName || 'Unknown',
        region: d.regionName || 'Unknown',
        country: d.countryName || 'Unknown',
        timezone: d.timeZones?.[0] || 'Unknown',
      },
      isProxy: d.isProxy || false,
      token: token || null,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to detect ISP', details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, phone, secret } = body;

    if (secret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = crypto.randomUUID();
    tokenStore.set(token, {
      email: email || undefined,
      phone: phone || undefined,
      createdAt: Date.now(),
      used: false,
    });

    const diagnosticUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://isp-lookup-pro-nine.vercel.app'}/diagnostics/${token}`;

    return NextResponse.json({
      token,
      url: diagnosticUrl,
      email: email || null,
      phone: phone || null,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate token', details: String(error) },
      { status: 500 }
    );
  }
}
