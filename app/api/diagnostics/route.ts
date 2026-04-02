import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

// In-memory token store (replace with DB in production)
const tokenStore = new Map<string, { email?: string; phone?: string; createdAt: number; used: boolean }>();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  // Get user's real IP from headers
  const headersList = headers();
  const forwardedFor = headersList.get('x-forwarded-for');
  const realIp = headersList.get('x-real-ip');
  const userIp = forwardedFor?.split(',')[0]?.trim() || realIp || '0.0.0.0';

  try {
    // Fetch ISP data from ip-api.com (free, no key needed, supports CORS)
    const ipApiRes = await fetch(
      `http://ip-api.com/json/${userIp}?fields=status,message,country,regionName,city,zip,lat,lon,timezone,isp,org,as,asname,mobile,proxy,hosting,query`,
      { next: { revalidate: 300 } }
    );
    const ipData = await ipApiRes.json();

    // Also try ipapi.co as backup (free tier: 1000/day)
    let backupData = null;
    try {
      const backupRes = await fetch(`https://ipapi.co/${userIp}/json/`, { next: { revalidate: 300 } });
      backupData = await backupRes.json();
    } catch (e) {
      // Backup failed, continue with primary
    }

    const result = {
      ip: userIp,
      isp: ipData.isp || backupData?.org || 'Unknown',
      org: ipData.org || backupData?.org || 'Unknown',
      asn: ipData.as || backupData?.asn || 'Unknown',
      asnName: ipData.asname || 'Unknown',
      location: {
        city: ipData.city || backupData?.city || 'Unknown',
        region: ipData.regionName || backupData?.region || 'Unknown',
        country: ipData.country || backupData?.country_name || 'Unknown',
        zip: ipData.zip || backupData?.postal || '',
        lat: ipData.lat || backupData?.latitude || 0,
        lon: ipData.lon || backupData?.longitude || 0,
        timezone: ipData.timezone || backupData?.timezone || 'Unknown',
      },
      connection: {
        isMobile: ipData.mobile || false,
        isProxy: ipData.proxy || false,
        isHosting: ipData.hosting || false,
      },
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

    // Verify admin secret
    if (secret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Generate unique token
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
