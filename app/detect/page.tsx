'use client';

import { useEffect, useState } from 'react';

type DetectResult = {
  ip: string;
  isp: string;
  org: string;
  asn: string;
  city: string;
  region: string;
  country: string;
  type: string;
};

export default function DetectPage() {
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [result, setResult] = useState<DetectResult | null>(null);
  const [error, setError] = useState('');
  const [ping, setPing] = useState<number | null>(null);

  const runDetection = async () => {
    setState('loading');
    setError('');
    setPing(null);
    try {
      const t0 = performance.now();
      const res = await fetch('/api/detect-isp');
      const t1 = performance.now();
      setPing(Math.round(t1 - t0));
      if (!res.ok) throw new Error('Detection failed');
      const data = await res.json();
      setResult(data);
      setState('success');
    } catch (e: any) {
      setError(e.message || 'Something went wrong');
      setState('error');
    }
  };

  useEffect(() => { runDetection(); }, []);

  return (
    <main className="min-h-screen bg-bg text-white">
      <div className="max-w-2xl mx-auto px-4 py-20">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 border border-accent-green/30 bg-accent-green/5 rounded-full px-4 py-1.5 mb-6">
            <span className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
            <span className="text-accent-green text-xs font-mono uppercase tracking-wider">Live Detection</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold mb-3">
            Detect My <span className="text-accent-green">Internet Provider</span>
          </h1>
          <p className="text-zinc-400 text-sm max-w-md mx-auto">
            Open this page on the network you want checked. We will identify the ISP currently serving your connection.
          </p>
        </div>

        <div className="border border-zinc-800 rounded-xl bg-zinc-900/50 overflow-hidden">
          {state === 'loading' && (
            <div className="p-10 text-center">
              <div className="w-8 h-8 border-2 border-accent-green/30 border-t-accent-green rounded-full animate-spin mx-auto mb-4" />
              <p className="text-zinc-400 text-sm">Detecting your provider...</p>
            </div>
          )}

          {state === 'error' && (
            <div className="p-10 text-center">
              <p className="text-red-400 text-sm mb-4">{error}</p>
              <button onClick={runDetection} className="text-xs font-mono text-accent-green hover:underline">Try again</button>
            </div>
          )}

          {state === 'success' && result && (
            <div>
              <div className="p-6 border-b border-zinc-800">
                <p className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-1">Current Internet Provider</p>
                <p className="text-2xl font-display font-bold text-accent-green">{result.isp || result.org || 'Unknown'}</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 divide-x divide-y divide-zinc-800">
                <div className="p-4">
                  <p className="text-xs font-mono text-zinc-500 mb-1">IP Address</p>
                  <p className="text-sm font-mono">{result.ip}</p>
                </div>
                {result.asn && (
                  <div className="p-4">
                    <p className="text-xs font-mono text-zinc-500 mb-1">ASN</p>
                    <p className="text-sm font-mono">{result.asn}</p>
                  </div>
                )}
                {result.type && (
                  <div className="p-4">
                    <p className="text-xs font-mono text-zinc-500 mb-1">Connection</p>
                    <p className="text-sm font-mono capitalize">{result.type}</p>
                  </div>
                )}
                {(result.city || result.region) && (
                  <div className="p-4">
                    <p className="text-xs font-mono text-zinc-500 mb-1">Location</p>
                    <p className="text-sm">{[result.city, result.region, result.country].filter(Boolean).join(', ')}</p>
                  </div>
                )}
                {ping !== null && (
                  <div className="p-4">
                    <p className="text-xs font-mono text-zinc-500 mb-1">Response Time</p>
                    <p className="text-sm font-mono">{ping} ms</p>
                  </div>
                )}
              </div>
              <div className="p-4 border-t border-zinc-800 flex items-center justify-between">
                <p className="text-xs text-zinc-600">Results reflect your current connection and may differ from service availability at your address.</p>
                <button onClick={runDetection} className="text-xs font-mono text-accent-green hover:underline whitespace-nowrap ml-4">Run Again</button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 text-center">
          <p className="text-zinc-500 text-xs">Share this link with customers so they can check their current provider:</p>
          <p className="text-accent-green text-sm font-mono mt-1">isp-lookup-pro-nine.vercel.app/detect</p>
        </div>
      </div>
    </main>
  );
}
