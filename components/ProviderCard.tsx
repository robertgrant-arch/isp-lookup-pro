'use client';

import { TechBadge } from './TechBadge';
import type { Provider } from '@/lib/types';
import { clsx } from 'clsx';

function formatSpeed(mbps: number): string {
  if (mbps >= 1000) return `${(mbps / 1000).toFixed(mbps % 1000 === 0 ? 0 : 1)} Gbps`;
  return `${mbps} Mbps`;
}

function SpeedBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.min(100, (Math.log10(value + 1) / Math.log10(max + 1)) * 100);
  return (
    <div className="h-1 w-full rounded-full bg-white/5 overflow-hidden">
      <div
        className={clsx('h-full rounded-full transition-all duration-700', color)}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

interface ProviderCardProps {
  provider: Provider;
  rank: number;
  style?: React.CSSProperties;
}

export function ProviderCard({ provider, rank, style }: ProviderCardProps) {
  const isFastest = rank === 0;

  return (
    <div
      className={clsx(
        'group relative rounded-lg border bg-bg-surface transition-all duration-200',
        'hover:border-white/20 hover:bg-bg-elevated',
        isFastest
          ? 'border-accent-green/40 shadow-[0_0_20px_rgba(0,255,136,0.06)]'
          : 'border-bg-border'
      )}
      style={style}
    >
      {isFastest && (
        <div className="absolute -top-px left-4 right-4 h-px bg-gradient-to-r from-transparent via-accent-green/60 to-transparent" />
      )}

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              {isFastest && (
                <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold tracking-widest text-accent-green uppercase border border-accent-green/30 bg-accent-green/5 px-1.5 py-0.5 rounded">
                  <span className="w-1 h-1 rounded-full bg-accent-green animate-pulse inline-block" />
                  Fastest
                </span>
              )}
              {provider.low_latency && (
                <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold tracking-widest text-accent-blue uppercase border border-accent-blue/30 bg-accent-blue/5 px-1.5 py-0.5 rounded">
                  ⚡ Low Latency
                </span>
              )}
            </div>
            <h3 className="font-display font-semibold text-white text-base leading-tight truncate">
              {provider.brand_name}
            </h3>
          </div>
          <TechBadge category={provider.technology_category} label={provider.technology_label} />
        </div>

        {/* Speed stats */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div>
            <div className="flex items-baseline justify-between mb-1.5">
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Download</span>
              <span className="font-mono text-sm font-bold text-white">
                {formatSpeed(provider.max_download_speed)}
              </span>
            </div>
            <SpeedBar
              value={provider.max_download_speed}
              max={10000}
              color="bg-gradient-to-r from-accent-green/60 to-accent-green"
            />
          </div>
          <div>
            <div className="flex items-baseline justify-between mb-1.5">
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Upload</span>
              <span className="font-mono text-sm font-bold text-white">
                {formatSpeed(provider.max_upload_speed)}
              </span>
            </div>
            <SpeedBar
              value={provider.max_upload_speed}
              max={10000}
              color="bg-gradient-to-r from-accent-blue/60 to-accent-blue"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
          <span className="text-[10px] font-mono text-zinc-600">
            ID #{provider.provider_id}
          </span>
          <span className="text-[10px] font-mono text-zinc-600">
            {provider.business_residential_code === 'R'
              ? 'Residential'
              : provider.business_residential_code === 'B'
              ? 'Business'
              : 'Residential & Business'}
          </span>
        </div>
      </div>
    </div>
  );
}
