/**
 * In-memory store for API keys, rate limiting, and result cache.
 *
 * NOTE: This works perfectly for development and single-instance deployments.
 * For production on Vercel (serverless), each cold start gets a fresh instance.
 * Replace with Redis (Upstash) or a database (PlanetScale, Supabase) for persistence.
 *
 * Upstash Redis drop-in: https://docs.upstash.com/redis
 */

import type { ApiKey } from './types';
import { v4 as uuidv4 } from 'uuid';

// ─── API Key Store ────────────────────────────────────────────────────────────

const keyStore = new Map<string, ApiKey>();

// Seed a default demo key on startup so the app is immediately usable
const DEMO_KEY = 'demo-key-isplookup-00000000';
if (!keyStore.has(DEMO_KEY)) {
  keyStore.set(DEMO_KEY, {
    key: DEMO_KEY,
    label: 'Demo Key',
    created_at: new Date().toISOString(),
    last_used: null,
    requests_today: 0,
    requests_total: 0,
    rate_limit: 100,
    last_reset: new Date().toISOString().split('T')[0],
    active: true,
  });
}

export function generateKey(label: string, rateLimit = 100): ApiKey {
  const key = `iplp_${uuidv4().replace(/-/g, '')}`;
  const record: ApiKey = {
    key,
    label,
    created_at: new Date().toISOString(),
    last_used: null,
    requests_today: 0,
    requests_total: 0,
    rate_limit: rateLimit,
    last_reset: new Date().toISOString().split('T')[0],
    active: true,
  };
  keyStore.set(key, record);
  return record;
}

export function getKey(key: string): ApiKey | undefined {
  return keyStore.get(key);
}

export function getAllKeys(): ApiKey[] {
  return Array.from(keyStore.values());
}

export function revokeKey(key: string): boolean {
  const record = keyStore.get(key);
  if (!record) return false;
  record.active = false;
  keyStore.set(key, record);
  return true;
}

function resetIfNewDay(record: ApiKey): ApiKey {
  const today = new Date().toISOString().split('T')[0];
  if (record.last_reset !== today) {
    record.requests_today = 0;
    record.last_reset = today;
  }
  return record;
}

export function validateAndConsume(key: string): {
  valid: boolean;
  error?: string;
  record?: ApiKey;
} {
  const record = keyStore.get(key);
  if (!record) return { valid: false, error: 'Invalid API key' };
  if (!record.active) return { valid: false, error: 'API key has been revoked' };

  const fresh = resetIfNewDay(record);

  if (fresh.requests_today >= fresh.rate_limit) {
    return {
      valid: false,
      error: `Rate limit exceeded. Limit: ${fresh.rate_limit} requests/day. Resets at midnight UTC.`,
    };
  }

  fresh.requests_today += 1;
  fresh.requests_total += 1;
  fresh.last_used = new Date().toISOString();
  keyStore.set(key, fresh);

  return { valid: true, record: fresh };
}

export function getUsage(key: string): ApiKey | undefined {
  const record = keyStore.get(key);
  if (!record) return undefined;
  return resetIfNewDay(record);
}

// ─── Result Cache ─────────────────────────────────────────────────────────────

interface CacheEntry<T> {
  data: T;
  expires_at: number;
}

const resultCache = new Map<string, CacheEntry<unknown>>();

const CACHE_TTL_MS = 1000 * 60 * 60; // 1 hour

export function cacheGet<T>(key: string): T | null {
  const entry = resultCache.get(key) as CacheEntry<T> | undefined;
  if (!entry) return null;
  if (Date.now() > entry.expires_at) {
    resultCache.delete(key);
    return null;
  }
  return entry.data;
}

export function cacheSet<T>(key: string, data: T, ttlMs = CACHE_TTL_MS): void {
  resultCache.set(key, { data, expires_at: Date.now() + ttlMs });
}

export function getCacheStats() {
  const now = Date.now();
  let active = 0;
  for (const [, entry] of resultCache) {
    if (now <= entry.expires_at) active++;
  }
  return { total: resultCache.size, active };
}
