import { NextResponse } from 'next/server';

// In-memory token store (replace with DB in production)
const tokenStore = new Map<string, { email?: string; phone?: string; createdAt: number; used: boolean }>();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  // Get user's real IP from request headers
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const userIp = forwardedFor?.split(',')[0]?.trim() || realIp || '0.0.0.0';

  try {
    // Fetch ISP data from ipapi.co (free HTTPS, 1000 req/day)
    const ipApiRes = await fetch(`https://ipapi.co/${userIp}/json/`);
    const ipData = await ipApiRes.json();

    const result = {
      ip: ipData.ip || userIp,
      isp: ipData.org || 'Unknown',
      org: ipData.org || 'Unknown',
      asn: ipData.asn || 'Unknown',
      asnName: ipData.org || 'Unknown',
      location: {
        city: ipData.city || 'Unknown',
        region: ipData.region || 'Unknown',
        country: ipData.country_name || 'Unknown',
        zip: ipData.postal || '',
        lat: ipData.latitude || 0,
        lon: ipData.longitude || 0,
        timezone: ipData.timezone || 'Unknown',
      },
      connection: {
        isMobile: false,
        isProxy: false,
        isHosting: false,
      },
      network: ipData.network || '',
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

// POST: Generate a new diagnostic token
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
