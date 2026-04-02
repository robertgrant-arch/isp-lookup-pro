'use client';

import { useState, useEffect, useCallback } from 'react';
import { clsx } from 'clsx';

interface KeyRecord {
  key: string;
  key_prefix: string;
  label: string;
  requests_today: number;
  requests_total: number;
  rate_limit: number;
  remaining_today: number;
  last_used: string | null;
  created_at: string;
  active: boolean;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      className="text-[10px] font-mono px-2 py-0.5 rounded border border-bg-border text-zinc-500 hover:text-zinc-300 hover:border-white/20 transition-colors"
    >
      {copied ? '✓ Copied' : 'Copy'}
    </button>
  );
}

function UsageBar({ used, limit }: { used: number; limit: number }) {
  const pct = limit > 0 ? Math.min(100, (used / limit) * 100) : 0;
  const color = pct > 85 ? 'bg-accent-red' : pct > 60 ? 'bg-accent-amber' : 'bg-accent-green';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
        <div className={clsx('h-full rounded-full transition-all duration-500', color)} style={{ width: `${pct}%` }} />
      </div>
      <span className="font-mono text-[10px] text-zinc-500 w-20 text-right">
        {used}/{limit}
      </span>
    </div>
  );
}

export default function DashboardPage() {
  const [adminSecret, setAdminSecret] = useState('');
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState('');
  const [keys, setKeys] = useState<KeyRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newLimit, setNewLimit] = useState(100);
  const [generating, setGenerating] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [genError, setGenError] = useState('');
  const [revoking, setRevoking] = useState<string | null>(null);

  const fetchKeys = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/keys/list', {
        headers: { 'x-admin-secret': adminSecret },
      });
      if (!res.ok) throw new Error('Unauthorized');
      const data = await res.json();
      setKeys(data.keys);
      setAuthed(true);
    } catch {
      setAuthError('Invalid admin secret. Check your ADMIN_SECRET environment variable.');
      setAuthed(false);
    } finally {
      setLoading(false);
    }
  }, [adminSecret]);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    fetchKeys();
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    setGenError('');
    setNewKey(null);
    try {
      const res = await fetch('/api/keys/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': adminSecret,
        },
        body: JSON.stringify({ label: newLabel || 'Unnamed Key', rate_limit: newLimit }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setNewKey(data.key);
      setNewLabel('');
      await fetchKeys();
    } catch (err) {
      setGenError(err instanceof Error ? err.message : 'Failed to generate key');
    } finally {
      setGenerating(false);
    }
  };

  const handleRevoke = async (key: string) => {
    if (!confirm('Revoke this API key? This cannot be undone.')) return;
    setRevoking(key);
    try {
      await fetch('/api/keys/revoke', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': adminSecret,
        },
        body: JSON.stringify({ key }),
      });
      await fetchKeys();
    } finally {
      setRevoking(null);
    }
  };

  const totalRequests = keys.reduce((s, k) => s + k.requests_total, 0);
  const activeKeys = keys.filter((k) => k.active).length;
  const todayRequests = keys.reduce((s, k) => s + k.requests_today, 0);

  if (!authed) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] bg-grid flex items-center justify-center">
        <div className="pointer-events-none fixed inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-accent-green/4 rounded-full blur-[120px]" />
        </div>
        <div className="relative w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-accent-green/10 border border-accent-green/30 flex items-center justify-center mx-auto mb-4">
              <span className="text-accent-green text-xl">⬡</span>
            </div>
            <h1 className="font-display text-2xl font-bold text-white">Admin Dashboard</h1>
            <p className="font-mono text-xs text-zinc-600 mt-2">API Key Management</p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block font-mono text-[10px] text-zinc-500 uppercase tracking-widest mb-2">
                Admin Secret
              </label>
              <input
                type="password"
                value={adminSecret}
                onChange={(e) => setAdminSecret(e.target.value)}
                placeholder="Enter ADMIN_SECRET…"
                className="w-full bg-bg-surface border border-bg-border rounded-lg px-4 py-3 font-mono text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:border-accent-green/40 focus:shadow-[0_0_0_1px_rgba(0,255,136,0.2)] transition-all"
                autoComplete="current-password"
              />
            </div>

            {authError && (
              <p className="font-mono text-xs text-accent-red">{authError}</p>
            )}

            <button
              type="submit"
              disabled={!adminSecret || loading}
              className="w-full py-3 rounded-lg bg-accent-green text-black font-mono font-bold text-sm tracking-widest hover:bg-accent-green/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {loading ? 'Authenticating…' : 'Authenticate →'}
            </button>
          </form>

          <div className="mt-6 rounded-lg border border-bg-border bg-bg-surface p-4">
            <p className="font-mono text-[10px] text-zinc-600 mb-2 uppercase tracking-widest">Hint</p>
            <p className="font-mono text-xs text-zinc-500">
              Set <code className="text-zinc-300">ADMIN_SECRET</code> in your <code className="text-zinc-300">.env.local</code> file.{' '}
              Default is <code className="text-zinc-300">change-me-before-deploying</code>.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-3.5rem)] bg-grid">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-32 right-0 w-[400px] h-[400px] bg-accent-blue/3 rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="font-display text-3xl font-bold text-white">Dashboard</h1>
            <p className="font-mono text-xs text-zinc-600 mt-1">API Key Management &amp; Usage Analytics</p>
          </div>
          <button
            onClick={() => { setAuthed(false); setKeys([]); }}
            className="text-xs font-mono text-zinc-600 hover:text-zinc-400 transition-colors"
          >
            Sign out
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-px bg-bg-border rounded-lg overflow-hidden border border-bg-border mb-8">
          {[
            { label: 'Active Keys', value: activeKeys },
            { label: "Today's Requests", value: todayRequests },
            { label: 'Total Requests', value: totalRequests.toLocaleString() },
          ].map((s) => (
            <div key={s.label} className="bg-bg-surface p-5 text-center">
              <div className="font-display text-3xl font-bold text-white mb-1">{s.value}</div>
              <div className="font-mono text-[10px] text-zinc-600 uppercase tracking-widest">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Generate key panel */}
          <div className="lg:col-span-1">
            <div className="rounded-lg border border-bg-border bg-bg-surface p-5">
              <h2 className="font-display font-semibold text-white text-base mb-4">Generate API Key</h2>
              <form onSubmit={handleGenerate} className="space-y-4">
                <div>
                  <label className="block font-mono text-[10px] text-zinc-500 uppercase tracking-widest mb-1.5">
                    Label
                  </label>
                  <input
                    type="text"
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    placeholder="My App"
                    maxLength={64}
                    className="w-full bg-black/30 border border-bg-border rounded px-3 py-2.5 font-mono text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:border-white/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] text-zinc-500 uppercase tracking-widest mb-1.5">
                    Rate Limit (req/day)
                  </label>
                  <input
                    type="number"
                    value={newLimit}
                    onChange={(e) => setNewLimit(Math.max(1, Math.min(10000, Number(e.target.value))))}
                    min={1}
                    max={10000}
                    className="w-full bg-black/30 border border-bg-border rounded px-3 py-2.5 font-mono text-sm text-white focus:outline-none focus:border-white/20 transition-all"
                  />
                </div>

                {genError && (
                  <p className="font-mono text-xs text-accent-red">{genError}</p>
                )}

                <button
                  type="submit"
                  disabled={generating}
                  className="w-full py-2.5 rounded bg-accent-green text-black font-mono font-bold text-sm tracking-widest hover:bg-accent-green/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  {generating ? 'Generating…' : '+ Generate Key'}
                </button>
              </form>

              {newKey && (
                <div className="mt-4 rounded border border-accent-green/30 bg-accent-green/5 p-3">
                  <p className="font-mono text-[10px] text-accent-green uppercase tracking-widest mb-2">
                    ✓ New Key — Save This Now
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="font-mono text-xs text-white break-all flex-1">{newKey}</code>
                    <CopyButton text={newKey} />
                  </div>
                  <p className="font-mono text-[10px] text-zinc-600 mt-2">
                    This key will not be shown again in full.
                  </p>
                </div>
              )}
            </div>

            {/* API Docs mini */}
            <div className="mt-4 rounded-lg border border-bg-border bg-bg-surface p-5">
              <h3 className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest mb-3">
                Quick API Reference
              </h3>
              <div className="space-y-3">
                {[
                  { method: 'GET', path: '/api/v1/lookup', desc: 'Query ISPs by address' },
                  { method: 'GET', path: '/api/keys/usage', desc: 'Check key usage stats' },
                ].map((e) => (
                  <div key={e.path}>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-mono text-[9px] font-bold text-accent-green border border-accent-green/30 bg-accent-green/5 px-1.5 py-0.5 rounded">
                        {e.method}
                      </span>
                      <code className="font-mono text-xs text-zinc-400">{e.path}</code>
                    </div>
                    <p className="font-mono text-[10px] text-zinc-600 pl-10">{e.desc}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-bg-border">
                <p className="font-mono text-[10px] text-zinc-600">
                  Pass key via <code className="text-zinc-400">?api_key=xxx</code> or{' '}
                  <code className="text-zinc-400">Authorization: Bearer xxx</code>
                </p>
              </div>
            </div>
          </div>

          {/* Keys table */}
          <div className="lg:col-span-2">
            <div className="rounded-lg border border-bg-border bg-bg-surface overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-bg-border">
                <h2 className="font-display font-semibold text-white text-base">
                  API Keys ({keys.length})
                </h2>
                <button
                  onClick={fetchKeys}
                  disabled={loading}
                  className="text-[10px] font-mono text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {loading ? 'Refreshing…' : '↻ Refresh'}
                </button>
              </div>

              {keys.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="font-mono text-sm text-zinc-600">No keys yet. Generate your first key →</p>
                </div>
              ) : (
                <div className="divide-y divide-bg-border">
                  {keys.map((k) => (
                    <div
                      key={k.key}
                      className={clsx(
                        'p-5 transition-colors',
                        k.active ? 'hover:bg-bg-elevated' : 'opacity-50'
                      )}
                    >
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-display font-semibold text-white text-sm">
                              {k.label}
                            </span>
                            {!k.active && (
                              <span className="text-[9px] font-mono text-accent-red border border-accent-red/30 bg-accent-red/5 px-1.5 py-0.5 rounded">
                                REVOKED
                              </span>
                            )}
                            {k.active && (
                              <span className="text-[9px] font-mono text-accent-green border border-accent-green/30 bg-accent-green/5 px-1.5 py-0.5 rounded flex items-center gap-1">
                                <span className="w-1 h-1 rounded-full bg-accent-green inline-block" />
                                ACTIVE
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <code className="font-mono text-xs text-zinc-500">{k.key_prefix}</code>
                            {k.active && <CopyButton text={k.key} />}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="font-mono text-xs text-zinc-500">
                            Created {new Date(k.created_at).toLocaleDateString()}
                          </div>
                          {k.last_used && (
                            <div className="font-mono text-[10px] text-zinc-700">
                              Last used {new Date(k.last_used).toLocaleString()}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-mono text-[10px] text-zinc-600 uppercase tracking-widest">
                            Today&apos;s Usage
                          </span>
                          <span className="font-mono text-[10px] text-zinc-500">
                            {k.remaining_today} remaining
                          </span>
                        </div>
                        <UsageBar used={k.requests_today} limit={k.rate_limit} />
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] text-zinc-600">
                          {k.requests_total.toLocaleString()} total requests
                        </span>
                        {k.active && (
                          <button
                            onClick={() => handleRevoke(k.key)}
                            disabled={revoking === k.key}
                            className="text-[10px] font-mono text-zinc-600 hover:text-accent-red transition-colors disabled:opacity-50"
                          >
                            {revoking === k.key ? 'Revoking…' : 'Revoke'}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Example curl */}
        <div className="mt-6 rounded-lg border border-bg-border bg-bg-surface p-5">
          <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest mb-3">
            Example Request
          </p>
          <pre className="font-mono text-xs text-zinc-400 bg-black/40 rounded px-4 py-3 overflow-x-auto">
{`curl -X GET \\
  "https://isp-lookup-pro-nine.vercel.app/api/v1/lookup?address=1600+Pennsylvania+Ave+NW+Washington+DC&api_key=YOUR_API_KEY" \\
  -H "Accept: application/json"`}
          </pre>
        </div>
      </div>
    </div>
  );
}
