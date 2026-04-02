'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface DiagnosticResult {
  ip: string;
  isp: string;
  org: string;
  asn: string;
  location: { city: string; region: string; country: string; timezone: string };
  isProxy: boolean;
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
        const ipRes = await fetch('https://freeipapi.com/api/json');
        const d = await ipRes.json();

        const data: DiagnosticResult = {
          ip: d.ipAddress || 'Unknown',
          isp: d.asnOrganization || 'Unknown',
          org: d.asnOrganization || 'Unknown',
          asn: d.asn ? `AS${d.asn}` : 'Unknown',
          location: {
            city: d.cityName || 'Unknown',
            region: d.regionName || 'Unknown',
            country: d.countryName || 'Unknown',
            timezone: d.timeZones?.[0] || 'Unknown',
          },
          isProxy: d.isProxy || false,
          timestamp: new Date().toISOString(),
        };
        setIspData(data);

        setStage('speed-test');
        const speed = await runSpeedTest();
        setSpeedData(speed);
        setStage('complete');
      } catch (err) {
        setError(String(err));
        setStage('error');
      }
    }
    if (token) runDiagnostics();
  }, [token]);

  async function runSpeedTest(): Promise<SpeedResult> {
    const nav = navigator as any;
    const connectionType = nav.connection?.effectiveType || 'unknown';
    const latencyStart = performance.now();
    await fetch('https://freeipapi.com/api/json', { cache: 'no-store' }).catch(() => {});
    const latencyMs = Math.round(performance.now() - latencyStart);
    const speedMbps = latencyMs < 50 ? '100+' : latencyMs < 100 ? '50+' : latencyMs < 200 ? '25+' : latencyMs < 500 ? '10+' : '<10';
    return { downloadMbps: speedMbps, latencyMs, connectionType };
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">ISP Connection Diagnostic</h1>
          <p className="text-gray-400 mt-2">Analyzing your internet connection...</p>
        </div>
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <StepDot active={stage === 'detecting'} done={stage !== 'detecting' && stage !== 'error'} label="Detecting ISP" />
            <StepDot active={stage === 'speed-test'} done={stage === 'complete'} label="Speed Test" />
            <StepDot active={false} done={stage === 'complete'} label="Complete" />
          </div>
          {stage !== 'complete' && stage !== 'error' && (
            <div className="w-full bg-gray-800 rounded-full h-1.5">
              <div className={`h-1.5 rounded-full bg-gradient-to-r from-green-400 to-cyan-400 transition-all duration-1000 ${stage === 'detecting' ? 'w-1/3' : 'w-2/3'}`} />
            </div>
          )}
        </div>
        {stage === 'error' && (
          <div className="bg-red-900/30 border border-red-500/30 rounded-xl p-6 text-center">
            <p className="text-red-400">Diagnostic failed: {error}</p>
          </div>
        )}
        {ispData && (
          <div className="space-y-4">
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">Internet Service Provider</h2>
              <p className="text-2xl font-bold text-white">{ispData.isp}</p>
              <p className="text-gray-400 mt-1">{ispData.org}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {ispData.isProxy && <span className="text-xs px-2 py-1 rounded-full border bg-yellow-500/20 text-yellow-400 border-yellow-500/30">VPN/Proxy</span>}
                {!ispData.isProxy && <span className="text-xs px-2 py-1 rounded-full border bg-green-500/20 text-green-400 border-green-500/30">Residential</span>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Card label="IP Address" value={ispData.ip} />
              <Card label="ASN" value={ispData.asn} />
              <Card label="Location" value={`${ispData.location.city}, ${ispData.location.region}`} />
              <Card label="Country" value={ispData.location.country} />
            </div>
            {speedData && (
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">Connection Performance</h2>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center"><p className="text-2xl font-bold text-green-400">{speedData.downloadMbps}</p><p className="text-xs text-gray-400">Mbps (est.)</p></div>
                  <div className="text-center"><p className="text-2xl font-bold text-cyan-400">{speedData.latencyMs}</p><p className="text-xs text-gray-400">Latency (ms)</p></div>
                  <div className="text-center"><p className="text-2xl font-bold text-purple-400">{speedData.connectionType}</p><p className="text-xs text-gray-400">Type</p></div>
                </div>
              </div>
            )}
            <div className="text-center text-xs text-gray-600 mt-6">
              <p>Token: {token}</p>
              <p>Scanned: {ispData.timestamp}</p>
            </div>
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

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
      <p className="text-xs text-gray-400 uppercase tracking-wider">{label}</p>
      <p className="text-sm font-medium text-white mt-1 truncate">{value}</p>
    </div>
  );
}
