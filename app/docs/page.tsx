export default function DocsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-display font-bold text-white mb-2">API Documentation</h1>
      <p className="text-zinc-400 mb-8 font-mono text-sm">ISP Lookup Pro &mdash; REST API v1</p>

      {/* Base URL */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-white mb-3">Base URL</h2>
        <pre className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 font-mono text-sm text-accent-green overflow-x-auto">
          {process.env.NEXT_PUBLIC_BASE_URL || 'https://isp-lookup-pro-nine.vercel.app'}
        </pre>
      </section>

      {/* Authentication */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-white mb-3">Authentication</h2>
        <p className="text-zinc-300 mb-3">All API requests require an API key. You can obtain one from the <a href="/dashboard" className="text-accent-green hover:underline">Dashboard</a>.</p>
        <p className="text-zinc-300 mb-2">Pass your key via query parameter or header:</p>
        <pre className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 font-mono text-sm text-zinc-300 overflow-x-auto mb-2">
{`# Query parameter
GET /api/v1/lookup?address=...&api_key=YOUR_KEY

# Authorization header
curl -H "Authorization: Bearer YOUR_KEY" \\
  /api/v1/lookup?address=...`}
        </pre>
        <p className="text-zinc-500 text-xs">Note: The <code className="text-accent-green">/api/detect-isp</code> endpoint does not require an API key.</p>
      </section>

      {/* Endpoints */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-white mb-3">Endpoints</h2>

        {/* Detect ISP - No Auth Required */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-accent-green/20 text-accent-green px-2 py-0.5 rounded text-xs font-mono font-bold">GET</span>
            <code className="text-white font-mono text-sm">/api/detect-isp</code>
            <span className="ml-auto text-xs text-zinc-500 font-mono">No auth required</span>
          </div>
          <p className="text-zinc-400 text-sm mb-4">Detect the internet service provider of the caller's current connection. Ideal for SMS-shared detection links.</p>

          <h3 className="text-white font-bold text-sm mb-2">Example Request</h3>
          <pre className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 font-mono text-sm text-zinc-300 overflow-x-auto mb-4">
{`curl "https://isp-lookup-pro-nine.vercel.app/api/detect-isp"`}
          </pre>

          <h3 className="text-white font-bold text-sm mb-2">Response</h3>
          <pre className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 font-mono text-sm text-zinc-300 overflow-x-auto mb-4">
{`{
  "success": true,
  "ip": "136.39.26.85",
  "isp": "Google Fiber Inc.",
  "provider": "Google Fiber",
  "org": "Google Fiber Inc.",
  "asn": "AS16591",
  "connectionType": "Residential Broadband",
  "isVpn": false,
  "confidence": "high",
  "location": {
    "city": "Kansas City",
    "region": "Missouri",
    "country": "United States"
  },
  "responseTime": 312,
  "detectedAt": "2026-04-10T21:00:00Z"
}`}
          </pre>

          <h3 className="text-white font-bold text-sm mb-2">Response Fields</h3>
          <table className="w-full text-sm mb-4">
            <thead>
              <tr className="text-left text-zinc-500 border-b border-zinc-800">
                <th className="pb-2 font-mono">Field</th>
                <th className="pb-2 font-mono">Type</th>
                <th className="pb-2">Description</th>
              </tr>
            </thead>
            <tbody className="text-zinc-300">
              <tr className="border-b border-zinc-800/50">
                <td className="py-2 font-mono text-accent-green">provider</td>
                <td className="py-2 font-mono">string</td>
                <td className="py-2">Normalized ISP name (e.g. &quot;Spectrum&quot;, &quot;Xfinity&quot;, &quot;Google Fiber&quot;)</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-2 font-mono text-accent-green">isp</td>
                <td className="py-2 font-mono">string</td>
                <td className="py-2">Raw ISP name from IP intelligence data</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-2 font-mono text-accent-green">connectionType</td>
                <td className="py-2 font-mono">string</td>
                <td className="py-2">Residential Broadband, Mobile, Business, Hosting/Datacenter</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-2 font-mono text-accent-green">isVpn</td>
                <td className="py-2 font-mono">boolean</td>
                <td className="py-2">True if a VPN, proxy, or datacenter IP is detected</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-2 font-mono text-accent-green">confidence</td>
                <td className="py-2 font-mono">string</td>
                <td className="py-2">high | medium | low based on match quality and VPN status</td>
              </tr>
              <tr>
                <td className="py-2 font-mono text-accent-green">location</td>
                <td className="py-2 font-mono">object</td>
                <td className="py-2">city, region, and country of the IP</td>
              </tr>
            </tbody>
          </table>

          <div className="bg-zinc-800/50 rounded-lg p-3">
            <p className="text-zinc-400 text-xs font-mono">SMS Usage: Share <span className="text-accent-green">isp-lookup-pro-nine.vercel.app/detect</span> via text. The recipient opens it on their connection and instantly sees their provider. No login, no input required.</p>
          </div>
        </div>

        {/* v1/lookup */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-accent-green/20 text-accent-green px-2 py-0.5 rounded text-xs font-mono font-bold">GET</span>
            <code className="text-white font-mono text-sm">/api/v1/lookup</code>
          </div>
          <p className="text-zinc-400 text-sm mb-4">Look up all internet service providers available at a US address.</p>

          <h3 className="text-white font-bold text-sm mb-2">Parameters</h3>
          <table className="w-full text-sm mb-4">
            <thead>
              <tr className="text-left text-zinc-500 border-b border-zinc-800">
                <th className="pb-2 font-mono">Name</th>
                <th className="pb-2 font-mono">Type</th>
                <th className="pb-2 font-mono">Required</th>
                <th className="pb-2">Description</th>
              </tr>
            </thead>
            <tbody className="text-zinc-300">
              <tr className="border-b border-zinc-800/50">
                <td className="py-2 font-mono text-accent-green">address</td>
                <td className="py-2 font-mono">string</td>
                <td className="py-2">Yes</td>
                <td className="py-2">Full US street address</td>
              </tr>
              <tr>
                <td className="py-2 font-mono text-accent-green">api_key</td>
                <td className="py-2 font-mono">string</td>
                <td className="py-2">Yes*</td>
                <td className="py-2">Your API key (or use Bearer header)</td>
              </tr>
            </tbody>
          </table>

          <h3 className="text-white font-bold text-sm mb-2">Example Request</h3>
          <pre className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 font-mono text-sm text-zinc-300 overflow-x-auto mb-4">
{`curl "https://isp-lookup-pro-nine.vercel.app/api/v1/lookup?address=1600+Pennsylvania+Ave+Washington+DC&api_key=YOUR_KEY"`}
          </pre>

          <h3 className="text-white font-bold text-sm mb-2">Response</h3>
          <pre className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 font-mono text-sm text-zinc-300 overflow-x-auto">
{`{
  "success": true,
  "cached": false,
  "data": {
    "address": "1600 PENNSYLVANIA AVE NW, WASHINGTON, DC 20500",
    "location_id": "...",
    "latitude": 38.8977,
    "longitude": -77.0365,
    "providers": [
      {
        "name": "Verizon",
        "technology": "Optical Carrier / Fiber to the Premises",
        "max_down": 940,
        "max_up": 880,
        "category": "fiber"
      }
    ]
  },
  "usage": {
    "requests_today": 1,
    "remaining_today": 99,
    "rate_limit": 100
  }
}`}
          </pre>
        </div>
      </section>

      {/* Error Codes */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-white mb-3">Error Codes</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-zinc-500 border-b border-zinc-800">
              <th className="pb-2 font-mono">Code</th>
              <th className="pb-2 font-mono">Status</th>
              <th className="pb-2">Description</th>
            </tr>
          </thead>
          <tbody className="text-zinc-300">
            <tr className="border-b border-zinc-800/50"><td className="py-2 font-mono">MISSING_API_KEY</td><td className="py-2">401</td><td className="py-2">No API key provided</td></tr>
            <tr className="border-b border-zinc-800/50"><td className="py-2 font-mono">INVALID_API_KEY</td><td className="py-2">401</td><td className="py-2">API key not recognized</td></tr>
            <tr className="border-b border-zinc-800/50"><td className="py-2 font-mono">RATE_LIMIT_EXCEEDED</td><td className="py-2">429</td><td className="py-2">Daily request limit reached</td></tr>
            <tr className="border-b border-zinc-800/50"><td className="py-2 font-mono">MISSING_ADDRESS</td><td className="py-2">400</td><td className="py-2">No address parameter</td></tr>
            <tr className="border-b border-zinc-800/50"><td className="py-2 font-mono">ADDRESS_NOT_FOUND</td><td className="py-2">404</td><td className="py-2">Address not in FCC database</td></tr>
            <tr><td className="py-2 font-mono">UPSTREAM_ERROR</td><td className="py-2">502</td><td className="py-2">FCC API unavailable</td></tr>
          </tbody>
        </table>
      </section>

      {/* Rate Limits */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-white mb-3">Rate Limits</h2>
        <p className="text-zinc-300">Default: <span className="text-white font-bold">100 requests/day</span> per API key. Usage info is included in every successful response. Results are cached for 1 hour.</p>
        <p className="text-zinc-500 text-sm mt-2">The <code className="text-accent-green">/api/detect-isp</code> endpoint is not rate-limited and requires no API key.</p>
      </section>
    </div>
  );
}
