'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface DiagnosticResult {
  ip: string;
  isp: string;
  org: string;
  asn: string;
  asnName: string;
  location: {
    city: string;
    region: string;
    country: string;
    zip: string;
    lat: number;
    lon: number;
    timezone: string;
  };
  connection: {
    isMobile: boolean;
    isProxy: boolean;
    isHosting: boolean;
  };
  token: string | null;
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
  const [webrtcIp, setWebrtcIp] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function runDiagnostics() {
      try {
        setStage('detecting');
        const res = await fetch(`/api/diagnostics?token=${token}`);
        if (!res.ok) throw new Error('Failed to detect ISP');
        const data: DiagnosticResult = await res.json();
        setIspData(data);

        try {
          const rtcIp = await getWebRTCIP();
          setWebrtcIp(rtcIp);
        } catch (e) { /* WebRTC may be blocked */ }

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

  async function getWebRTCIP(): Promise<string | null> {
    return new Promise((resolve) => {
      try {
        const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
        pc.createDataChannel('');
        pc.createOffer().then((offer) => pc.setLocalDescription(offer));
        pc.onicecandidate = (ice) => {
          if (!ice || !ice.candidate || !ice.candidate.candidate) return;
          const ipRegex = /([0-9]{1,3}(\.[0-9]{1,3}){3})/;
          const match = ipRegex.exec(ice.candidate.candidate);
          if (match) { resolve(match[1]); pc.close(); }
        };
        setTimeout(() => resolve(null), 3000);
      } catch (e) { resolve(null); }
    });
  }

  async function runSpeedTest(): Promise<SpeedResult> {
    const nav = navigator as any;
    const connectionType = nav.connection?.effectiveType || 'unknown';
    const latencyStart = performance.now();
    await fetch('/api/diagnostics?token=ping', { method: 'HEAD', cache: 'no-store' });
    const latencyMs = Math.round(performance.now() - latencyStart);
    const startTime = performance.now();
    const response = await fetch('/api/diagnostics?token=speedtest', { cache: 'no-store' });
    const blob = await response.blob();
    const endTime = performance.now();
    const durationSec = (endTime - startTime) / 1000;
    const bitsLoaded = blob.size * 8;
    const speedMbps = ((bitsLoaded / durationSec) / 1000000).toFixed(1);
    return { downloadMbps: speedMbps, latencyMs, connectionType };
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
            ISP Connection Diagnostic
          </h1>
          <p className="text-gray-400 mt-2">Analyzing your internet connection...</p>
        </div>

        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Step active={stage === 'detecting'} done={stage !== 'detecting' && stage !== 'error'} label="Detecting ISP" />
            <Step active={stage === 'speed-test'} done={stage === 'complete'} label="Speed Test" />
            <Step active={false} done={stage === 'complete'} label="Complete" />
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
                {ispData.connection.isMobile && <span className="text-xs px-2 py-1 rounded-full border bg-blue-500/20 text-blue-400 border-blue-500/30">Mobile</span>}
                {ispData.connection.isProxy && <span className="text-xs px-2 py-1 rounded-full border bg-yellow-500/20 text-yellow-400 border-yellow-500/30">VPN/Proxy</span>}
                {ispData.connection.isHosting && <span className="text-xs px-2 py-1 rounded-full border bg-purple-500/20 text-purple-400 border-purple-500/30">Hosting</span>}
                {!ispData.connection.isMobile && !ispData.connection.isProxy && <span className="text-xs px-2 py-1 rounded-full border bg-green-500/20 text-green-400 border-green-500/30">Residential</span>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
                <p className="text-xs text-gray-400 uppercase tracking-wider">IP Address</p>
                <p className="text-sm font-medium text-white mt-1 truncate">{ispData.ip}</p>
              </div>
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
                <p className="text-xs text-gray-400 uppercase tracking-wider">ASN</p>
                <p className="text-sm font-medium text-white mt-1 truncate">{ispData.asnName}</p>
              </div>
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
                <p className="text-xs text-gray-400 uppercase tracking-wider">Location</p>
                <p className="text-sm font-medium text-white mt-1 truncate">{ispData.location.city}, {ispData.location.region}</p>
              </div>
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
                <p className="text-xs text-gray-400 uppercase tracking-wider">Timezone</p>
                <p className="text-sm font-medium text-white mt-1 truncate">{ispData.location.timezone}</p>
              </div>
            </div>

            {speedData && (
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">Connection Performance</h2>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-400">{speedData.downloadMbps}</p>
                    <p className="text-xs text-gray-400">Mbps (est.)</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-cyan-400">{speedData.latencyMs}</p>
                    <p className="text-xs text-gray-400">Latency (ms)</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-400">{speedData.connectionType}</p>
                    <p className="text-xs text-gray-400">Type</p>
                  </div>
                </div>
              </div>
            )}

            {webrtcIp && webrtcIp !== ispData.ip && (
              <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-xl p-4 text-center">
                <p className="text-yellow-400 text-sm">VPN detected: Browser IP ({webrtcIp}) differs from server IP ({ispData.ip})</p>
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

function Step({ active, done, label }: { active: boolean; done: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-3 h-3 rounded-full ${done ? 'bg-green-400' : active ? 'bg-cyan-400 animate-pulse' : 'bg-gray-600'}`} />
      <span className={`text-sm ${done ? 'text-green-400' : active ? 'text-white' : 'text-gray-500'}`}>{label}</span>
    </div>
  );
}
