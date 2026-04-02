import { NextResponse } from 'next/server';

const tokenStore = new Map<string, { email?: string; phone?: string; createdAt: number; used: boolean }>();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const userIp = forwardedFor?.split(',')[0]?.trim() || realIp || '';

  try {
    // Use ip-api.com for reliable ISP detection (supports IP parameter)
    const apiUrl = userIp ? `http://ip-api.com/json/${userIp}?fields=status,message,query,isp,org,as,asname,city,regionName,country,timezone,proxy,hosting,mobile` : `http://ip-api.com/json/?fields=status,message,query,isp,org,as,asname,city,regionName,country,timezone,proxy,hosting,mobile`;
    const res = await fetch(apiUrl);
    const d = await res.json();

    if (d.status === 'fail') {
      throw new Error(d.message || 'IP lookup failed');
    }

    return NextResponse.json({
      ip: d.query || userIp || 'Unknown',
      isp: d.isp || 'Unknown',
      org: d.org || 'Unknown',
      asn: d.as || 'Unknown',
      asnName: d.asname || 'Unknown',
      location: {
        city: d.city || 'Unknown',
        region: d.regionName || 'Unknown',
        country: d.country || 'Unknown',
        timezone: d.timezone || 'Unknown',
      },
      connection: {
        isMobile: d.mobile || false,
        isProxy: d.proxy || false,
        isHosting: d.hosting || false,
      },
      connectionType: '',
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
