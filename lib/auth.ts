import type { NextRequest } from 'next/server';

/**
 * Extracts API key from:
 *  - ?api_key=xxx query param
 *  - Authorization: Bearer xxx header
 */
export function extractApiKey(req: NextRequest): string | null {
  // Query param
  const qp = req.nextUrl.searchParams.get('api_key');
  if (qp) return qp.trim();

  // Authorization header
  const auth = req.headers.get('authorization');
  if (auth?.startsWith('Bearer ')) {
    return auth.slice(7).trim();
  }

  return null;
}

/**
 * Validate the ADMIN_SECRET env var for protected dashboard endpoints.
 */
export function validateAdminSecret(req: NextRequest): boolean {
  const secret = process.env.ADMIN_SECRET ?? 'change-me-before-deploying';
  const provided =
    req.headers.get('x-admin-secret') ??
    req.nextUrl.searchParams.get('admin_secret');
  return provided === secret;
}
