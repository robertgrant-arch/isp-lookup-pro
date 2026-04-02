'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface DiagnosticResult {
  ip: string;
  isp: string;
  org: string;
  asn: string;
  asnName: string;
  location: { city: string; region: string; country: string; timezone: string };
  connection: { isMobile: boolean; isProxy: boolean; isHosting: boolean };
  connectionType: string;
  token: string;
  timestamp: string;
}

interface SpeedResult {
  downloadMbps: string;
  latencyMs: number;
  connectionType: string;
}

export default function DiagnosticPage() {
  const params = useParams();
  const token = params.token as string;
  const [stage, setStage] = useState<'detecting' | 'speed-test' | 'complete' | 'error'>('detecting');
  const [ispData, setIspData] = useState<DiagnosticResult | null>(null);
  const [speedData, setSpeedData] = useState<SpeedResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function runDiagnostics() {
      try {
        setStage('detecting');

        // Call our own API route which handles IP detection server-side
        const res = await fetch(`/api/diagnostics?token=${encodeURIComponent(token)}`);
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `API error: ${res.status}`);
        }
        const data: DiagnosticResult = await res.json();
        setIspData(data);

        // Speed test phase
        setStage('speed-test');
        const speed = await runSpeedTest();
        setSpeedData(speed);

        setStage('complete');
      } catch (err: any) {
        setError(err.message || 'Unknown error');
        setStage('error');
      }
    }
    runDiagnostics();
  }, [token]);

  async function runSpeedTest(): Promise<SpeedResult> {
    const connectionType = (navigator as any)?.connection?.effectiveType || 'unknown';
    const latencyStart = performance.now();
    await fetch('https://api.freeipapi.com/api/json', { cache: 'no-store' }).catch(() => ({}));
    const latencyMs = Math.round(performance.now() - latencyStart);
    const downloadMbps = latencyMs < 50 ? '100+' : latencyMs < 100 ? '50+' : latencyMs < 200 ? '25+' : latencyMs < 500 ? '10+' : '<10';
    return { downloadMbps, latencyMs, connectionType };
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">ISP Connection Diagnostic</h1>
          <p className="text-gray-400 mt-2">Analyzing your internet connection...</p>
        </div>

        <div className="flex justify-center items-center gap-4 mb-4">
          <StepDot active={stage === 'detecting'} done={stage !== 'detecting' && stage !== 'error'} label="Detecting ISP" />
          <StepDot active={stage === 'speed-test'} done={stage === 'complete'} label="Speed Test" />
          <StepDot active={false} done={stage === 'complete'} label="Complete" />
        </div>

        {stage !== 'error' && (
          <div className="w-full bg-gray-800 rounded-full h-1.5 mb-8">
            <div className={`h-1.5 rounded-full bg-gradient-to-r from-green-400 to-cyan-400 transition-all duration-1000 ${stage === 'detecting' ? 'w-1/3' : stage === 'speed-test' ? 'w-2/3' : 'w-full'}`} />
          </div>
        )}

        {error && (
          <div className="bg-red-900/30 border border-red-700 text-red-300 rounded-lg p-4 text-center mb-8">
            Diagnostic failed: {error}
          </div>
        )}

        {ispData && (
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 space-y-4 mb-6">
            <h2 className="text-lg font-semibold text-cyan-400">ISP Detection Results</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="text-gray-400">IP Address</div><div>{ispData.ip}</div>
              <div className="text-gray-400">ISP</div><div>{ispData.isp}</div>
              <div className="text-gray-400">Organization</div><div>{ispData.org}</div>
              <div className="text-gray-400">ASN</div><div>{ispData.asn}</div>
              <div className="text-gray-400">Location</div><div>{ispData.location.city}, {ispData.location.region}, {ispData.location.country}</div>
              <div className="text-gray-400">Timezone</div><div>{ispData.location.timezone}</div>
              <div className="text-gray-400">Proxy Detected</div><div>{ispData.connection?.isProxy ? 'Yes' : 'No'}</div>
            </div>
          </div>
        )}

        {speedData && (
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 space-y-4 mb-6">
            <h2 className="text-lg font-semibold text-green-400">Speed Test Results</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="text-gray-400">Est. Download</div><div>{speedData.downloadMbps} Mbps</div>
              <div className="text-gray-400">Latency</div><div>{speedData.latencyMs} ms</div>
              <div className="text-gray-400">Connection Type</div><div>{speedData.connectionType}</div>
            </div>
          </div>
        )}

        {ispData && (
          <div className="text-center text-xs text-gray-600 mt-6">
            <p>Token: {token}</p>
            <p>Scanned: {ispData.timestamp}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function StepDot({ active, done, label }: { active: boolean; done: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-3 h-3 rounded-full ${done ? 'bg-green-400' : active ? 'bg-cyan-400 animate-pulse' : 'bg-gray-600'}`} />
      <span className={`text-sm ${done ? 'text-green-400' : active ? 'text-white' : 'text-gray-500'}`}>{label}</span>
    </div>
  );
}
