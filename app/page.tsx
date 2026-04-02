'use client';

import { useState } from 'react';
import { SearchBar } from '@/components/SearchBar';
import { ResultsPanel } from '@/components/ResultsPanel';
import { LoadingState } from '@/components/LoadingState';
import type { LookupResponse } from '@/lib/types';

export default function HomePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LookupResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastQuery, setLastQuery] = useState('');

  const handleSearch = async (address: string) => {
    setLoading(true);
    setError(null);
    setResult(null);
    setLastQuery(address);

    try {
      const res = await fetch('/api/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }

      setResult(data as LookupResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-3.5rem)] bg-grid">
      {/* Radial glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-accent-green/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 py-16">
        {/* Hero */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 border border-accent-green/20 bg-accent-green/5 rounded-full px-4 py-1.5 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse" />
            <span className="text-[11px] font-mono text-accent-green tracking-widest uppercase">
              Live · FCC Broadband Map
            </span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4 leading-none tracking-tight">
            Internet Provider
            <br />
            <span className="text-accent-green text-glow-green">Coverage Lookup</span>
          </h1>

          <p className="font-body text-zinc-400 text-lg max-w-xl mx-auto leading-relaxed">
            Find every broadband provider available at any US address — fiber, cable, DSL, satellite,
            and fixed wireless — in seconds.
          </p>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto">
          <SearchBar onSearch={handleSearch} loading={loading} />
        </div>

        {/* Loading */}
        {loading && (
          <div className="max-w-2xl mx-auto">
            <LoadingState />
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="max-w-2xl mx-auto mt-8 animate-fade-in">
            <div className="rounded-lg border border-accent-red/30 bg-accent-red/5 p-5">
              <div className="flex items-start gap-3">
                <span className="text-accent-red text-lg mt-0.5">⚠</span>
                <div>
                  <p className="font-mono text-sm font-semibold text-accent-red mb-1">Lookup Failed</p>
                  <p className="font-mono text-sm text-zinc-400">{error}</p>
                  {lastQuery && (
                    <p className="font-mono text-xs text-zinc-600 mt-2">Query: &quot;{lastQuery}&quot;</p>
                  )}
                  <p className="font-mono text-xs text-zinc-600 mt-2">
                    Try including a street number, city, and state (e.g. &quot;123 Main St, Austin TX&quot;)
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {result && !loading && <ResultsPanel result={result} />}

        {/* Empty state stats */}
        {!result && !loading && !error && (
          <div className="max-w-2xl mx-auto mt-16">
            <div className="grid grid-cols-3 gap-px bg-bg-border rounded-lg overflow-hidden border border-bg-border">
              {[
                { value: '800K+', label: 'US Locations' },
                { value: '2,400+', label: 'Providers' },
                { value: '< 1s', label: 'Response Time' },
              ].map((stat) => (
                <div key={stat.label} className="bg-bg-surface p-5 text-center">
                  <div className="font-display text-2xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="font-mono text-[10px] text-zinc-600 uppercase tracking-widest">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* API callout */}
            <div className="mt-5 rounded-lg border border-bg-border bg-bg-surface p-4">
              <p className="font-mono text-[11px] text-zinc-600 mb-2 uppercase tracking-widest">REST API</p>
              <code className="block font-mono text-xs text-zinc-400 bg-black/40 rounded px-3 py-2 overflow-x-auto">
                GET /api/v1/lookup?address=123+Main+St+Austin+TX&amp;api_key=YOUR_KEY
              </code>
              <p className="font-mono text-[10px] text-zinc-700 mt-2">
                Get an API key from the{' '}
                <a href="/dashboard" className="text-accent-green hover:underline">
                  Dashboard →
                </a>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
