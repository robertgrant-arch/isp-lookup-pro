import { NextResponse } from 'next/server';

const tokenStore = new Map<string, { email?: string; phone?: string; createdAt: number; used: boolean }>();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const userIp = forwardedFor?.split(',')[0]?.trim() || realIp || '0.0.0.0';

  try {
    // Use ipwho.is - free, HTTPS, no key needed, no Cloudflare blocking
    const res = await fetch(`https://ipwho.is/${userIp}`);
    const d = await res.json();

    const result = {
      ip: d.ip || userIp,
      isp: d.connection?.isp || 'Unknown',
      org: d.connection?.org || 'Unknown',
      asn: d.connection?.asn ? `AS${d.connection.asn}` : 'Unknown',
      asnName: d.connection?.org || 'Unknown',
      location: {
        city: d.city || 'Unknown',
        region: d.region || 'Unknown',
        country: d.country || 'Unknown',
        zip: d.postal || '',
        lat: d.latitude || 0,
        lon: d.longitude || 0,
        timezone: d.timezone?.id || 'Unknown',
      },
      connection: {
        isMobile: d.type === 'mobile',
        isProxy: false,
        isHosting: d.type === 'hosting',
      },
      connectionType: d.connection?.type || '',
      token: token || null,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(result);
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
