# ISP Lookup Pro 

> Find every broadband provider available at any US address, powered by the [FCC Broadband Map API](https://broadbandmap.fcc.gov).

![ISP Lookup Pro](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=flat-square&logo=vercel)

## Features

- 🔍 **Address lookup** — search any US address via the FCC Broadband Map API
- 📡 **All tech types** — Fiber, Cable, DSL, Satellite, Fixed Wireless
- ⚡ **Low latency indicators** — highlights providers with <100ms latency
- 🔑 **API key system** — generate keys with per-day rate limits
- 🌐 **Public REST API** — `GET /api/v1/lookup` for external integrations
- 🗄️ **1-hour result cache** — avoids redundant FCC API calls
- 📊 **Admin dashboard** — usage analytics and key management

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **FCC Broadband Map Public API** (no key required)
- **Vercel** deployment

## Quick Start

```bash
git clone https://github.com/your-org/isp-lookup-pro
cd isp-lookup-pro
npm install
cp .env.example .env.local
# Edit .env.local and set ADMIN_SECRET
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to Vercel

```bash
npx vercel
```

Set these environment variables in the Vercel dashboard:
- `ADMIN_SECRET` — a strong random secret for the admin dashboard
- `FCC_USER_AGENT` — (optional) your app's User-Agent string

## API Reference

### Search for ISPs

```
GET /api/v1/lookup?address={address}&api_key={key}
```

**Response:**
```json
{
  "success": true,
  "cached": false,
  "data": {
    "address": "1600 Pennsylvania Ave NW, Washington, DC 20500",
    "location_id": "1102535869614",
    "latitude": 38.89768,
    "longitude": -77.03654,
    "providers": [
      {
        "provider_id": 130077,
        "brand_name": "Verizon",
        "technology": 50,
        "technology_label": "Fiber",
        "technology_category": "fiber",
        "max_download_speed": 940,
        "max_upload_speed": 880,
        "low_latency": true,
        "business_residential_code": "R"
      }
    ],
    "timestamp": "2024-10-15T12:00:00.000Z"
  },
  "usage": {
    "requests_today": 1,
    "remaining_today": 99,
    "rate_limit": 100
  }
}
```

**Error codes:**
| Code | HTTP Status | Meaning |
|------|------------|---------|
| `MISSING_API_KEY` | 401 | No API key provided |
| `INVALID_API_KEY` | 401 | Key doesn't exist or is revoked |
| `RATE_LIMIT_EXCEEDED` | 429 | Daily limit reached |
| `MISSING_ADDRESS` | 400 | No address param |
| `ADDRESS_NOT_FOUND` | 404 | FCC has no data for this address |
| `UPSTREAM_ERROR` | 502 | FCC API is down |

### Check usage stats

```
GET /api/keys/usage?api_key={key}
```

### Generate API key (admin)

```
POST /api/keys/generate
x-admin-secret: YOUR_ADMIN_SECRET
Content-Type: application/json

{ "label": "My App", "rate_limit": 500 }
```

## Technology Codes

| Code | Technology |
|------|-----------|
| 10 | DSL |
| 40 | Cable (DOCSIS 3.0) |
| 41/43 | Cable (DOCSIS 3.1) |
| 50 | Fiber |
| 60 | Satellite |
| 61 | Satellite (LEO / Starlink) |
| 70 | Fixed Wireless |
| 71 | Licensed Fixed Wireless |
| 72 | Licensed-by-Rule Fixed Wireless |

## Production Notes

The in-memory store resets on each cold start in serverless environments.
For production persistence, replace the store with:
- **Keys**: [Upstash Redis](https://upstash.com/) or a database (Supabase, PlanetScale)
- **Cache**: Vercel KV or Upstash Redis

## License

MIT

<!-- v1 -->
