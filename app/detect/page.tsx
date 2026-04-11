'use client';

import { useEffect, useState } from 'react';

type DetectResult = {
  success: boolean;
  ip: string;
  isp: string;
  provider: string;
  org: string;
  asn: string;
  connectionType: string;
  isVpn: boolean;
  confidence: 'high' | 'medium' | 'low';
  location: {
    city: string;
    region: string;
    country: string;
  };
  responseTime: number;
  detectedAt: string;
};

export default function DetectPage() {
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [result, setResult] = useState<DetectResult | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const runDetection = async () => {
    setState('loading');
    setError('');
    try {
      const res = await fetch('/api/detect-isp');
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

  const shareUrl = typeof window !== 'undefined' ? window.location.href : 'isp-lookup-pro-nine.vercel.app/detect';

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const confidenceColor = (c: string) => {
    if (c === 'high') return 'text-accent-green';
    if (c === 'medium') return 'text-yellow-400';
    return 'text-red-400';
  };

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
              <p className="text-zinc-400 text-sm">Checking your connection...</p>
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
              {/* Provider Header */}
              <div className="p-6 border-b border-zinc-800">
                <p className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-1">Current Internet Provider</p>
                <p className="text-2xl font-display font-bold text-accent-green">{result.provider || result.isp || result.org || 'Unknown'}</p>
                {result.provider !== result.isp && result.isp && (
                  <p className="text-xs text-zinc-500 mt-1">Raw: {result.isp}</p>
                )}
              </div>

              {/* VPN Warning */}
              {result.isVpn && (
                <div className="px-6 py-3 bg-yellow-500/10 border-b border-zinc-800">
                  <p className="text-yellow-400 text-xs font-mono">VPN or proxy detected. Results may not reflect your actual ISP. Turn off your VPN and reload for accurate results.</p>
                </div>
              )}

              {/* Detail Grid */}
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
                <div className="p-4">
                  <p className="text-xs font-mono text-zinc-500 mb-1">Connection</p>
                  <p className="text-sm font-mono">{result.connectionType}</p>
                </div>
                {(result.location.city || result.location.region) && (
                  <div className="p-4">
                    <p className="text-xs font-mono text-zinc-500 mb-1">Location</p>
                    <p className="text-sm">{[result.location.city, result.location.region, result.location.country].filter(Boolean).join(', ')}</p>
                  </div>
                )}
                <div className="p-4">
                  <p className="text-xs font-mono text-zinc-500 mb-1">Confidence</p>
                  <p className={`text-sm font-mono capitalize ${confidenceColor(result.confidence)}`}>{result.confidence}</p>
                </div>
                <div className="p-4">
                  <p className="text-xs font-mono text-zinc-500 mb-1">Response Time</p>
                  <p className="text-sm font-mono">{result.responseTime} ms</p>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-zinc-800 flex items-center justify-between">
                <p className="text-xs text-zinc-600">Results reflect your current connection and may differ from service availability at your address.</p>
                <button onClick={runDetection} className="text-xs font-mono text-accent-green hover:underline whitespace-nowrap ml-4">Run Again</button>
              </div>
            </div>
          )}
        </div>

        {/* Share Section */}
        <div className="mt-8 border border-zinc-800 rounded-xl bg-zinc-900/50 p-6">
          <p className="text-zinc-400 text-xs font-mono uppercase tracking-wider mb-3">Share via Text Message</p>
          <p className="text-zinc-500 text-xs mb-4">Send this link to anyone. When they open it on their network, it instantly shows their internet provider.</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-accent-green text-sm font-mono truncate">{shareUrl}</code>
            <button
              onClick={copyLink}
              className="px-4 py-2.5 bg-accent-green text-black text-xs font-mono font-bold rounded-lg hover:bg-accent-green/90 transition whitespace-nowrap"
            >
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>
          <p className="text-zinc-600 text-xs mt-3">Tip: Ask them to open this while connected to their home Wi-Fi for best results.</p>
        </div>

        {/* API Section */}
        <div className="mt-4 border border-zinc-800 rounded-xl bg-zinc-900/50 p-6">
          <p className="text-zinc-400 text-xs font-mono uppercase tracking-wider mb-3">API Access</p>
          <p className="text-zinc-500 text-xs mb-3">Use the detect-isp endpoint directly in your applications. No API key required.</p>
          <pre className="bg-zinc-900 border border-zinc-700 rounded-lg p-4 text-xs font-mono text-zinc-300 overflow-x-auto">
{`GET /api/detect-isp

// Response
{
  "success": true,
  "provider": "Google Fiber",
  "ip": "136.39.26.85",
  "asn": "AS16591",
  "connectionType": "Residential Broadband",
  "confidence": "high",
  "isVpn": false,
  "location": {
    "city": "Kansas City",
    "region": "Missouri",
    "country": "United States"
  }
}`}
          </pre>
          <a href="/docs" className="text-accent-green text-xs font-mono hover:underline mt-3 inline-block">View full API documentation &rarr;</a>
        </div>
      </div>
    </main>
  );
}
