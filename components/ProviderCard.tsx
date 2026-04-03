'use client';

import { useState } from 'react';
import { TechBadge } from './TechBadge';
import type { Provider } from '@/lib/types';
import { clsx } from 'clsx';
import { getProviderPricing } from '@/lib/provider-pricing';
import type { PricingTier } from '@/lib/provider-pricing';

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

function PricingPanel({ brandName }: { brandName: string }) {
  const pricing = getProviderPricing(brandName);

  if (!pricing) {
    return (
      <div className="mt-4 pt-4 border-t border-white/10">
        <p className="text-zinc-500 text-xs font-mono text-center py-2">
          Pricing info not available for this provider.{' '}
          <a
            href={`https://www.google.com/search?q=${encodeURIComponent(brandName + ' internet plans pricing')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent-green underline hover:text-accent-green/80"
          >
            Search online →
          </a>
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4 pt-4 border-t border-white/10">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-zinc-400 text-[10px] font-mono uppercase tracking-widest">
          Available Plans
        </p>
        <a
          href={pricing.websiteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent-green text-[10px] font-mono hover:underline"
        >
          View on website →
        </a>
      </div>

      {/* Plan tiers */}
      <div className="space-y-2">
        {pricing.plans.map((plan: PricingTier) => (
          <div
            key={plan.name}
            className="rounded border border-white/8 bg-white/3 px-3 py-2 flex items-center gap-3"
          >
            {/* Speed info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2 mb-0.5">
                <span className="text-white text-xs font-mono font-semibold truncate">
                  {plan.name}
                </span>
                {plan.dataCapGB && (
                  <span className="text-amber-500 text-[9px] font-mono shrink-0">
                    {plan.dataCapGB} GB cap
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-[10px] font-mono text-zinc-500">
                <span>↓ {formatSpeed(plan.downloadMbps)}</span>
                <span>↑ {formatSpeed(plan.uploadMbps)}</span>
                {plan.contractRequired && (
                  <span className="text-amber-500/70">contract</span>
                )}
              </div>
              {plan.notes && (
                <p className="text-zinc-600 text-[9px] font-mono mt-0.5 truncate">{plan.notes}</p>
              )}
            </div>

            {/* Price */}
            <div className="text-right shrink-0">
              {plan.promoPrice ? (
                <>
                  <div className="text-accent-green font-mono font-bold text-sm leading-none">
                    ${plan.promoPrice}
                    <span className="text-[9px] font-normal text-zinc-400">/mo</span>
                  </div>
                  <div className="text-zinc-600 text-[9px] font-mono line-through">
                    ${plan.pricePerMonth}/mo
                  </div>
                  <div className="text-zinc-500 text-[8px] font-mono">
                    {plan.promoDuration}
                  </div>
                </>
              ) : (
                <div className="text-white font-mono font-bold text-sm leading-none">
                  ${plan.pricePerMonth}
                  <span className="text-[9px] font-normal text-zinc-400">/mo</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Disclaimer */}
      {pricing.disclaimer && (
        <p className="text-zinc-600 text-[9px] font-mono mt-3 leading-relaxed">
          * {pricing.disclaimer}
        </p>
      )}
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
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={clsx(
        'group relative rounded-lg border bg-bg-surface transition-all duration-200 cursor-pointer',
        'hover:border-white/20 hover:bg-bg-elevated',
        isFastest
          ? 'border-accent-green/40 shadow-[0_0_20px_rgba(0,255,136,0.06)]'
          : 'border-bg-border',
        expanded && 'border-white/15 bg-bg-elevated'
      )}
      style={style}
      onClick={() => setExpanded((prev) => !prev)}
    >
      {isFastest && (
        <div className="absolute -top-px left-4 right-4 h-px bg-gradient-to-r from-transparent via-accent-green/60 to-transparent" />
      )}

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            {isFastest && (
              <span className="inline-block bg-accent-green/10 text-accent-green text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 rounded mb-1 mr-1">
                Fastest
              </span>
            )}
            {provider.low_latency && (
              <span className="inline-block bg-white/5 text-zinc-400 text-[9px] font-mono px-2 py-0.5 rounded mb-1">
                ⚡ Low Latency
              </span>
            )}
            <h3 className="text-white font-semibold text-sm leading-tight">{provider.brand_name}</h3>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <TechBadge category={provider.technology_category} label={provider.technology_label} />
            <span className="text-zinc-600 text-[10px] font-mono transition-transform duration-200"
              style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
              ▾
            </span>
          </div>
        </div>

        {/* Speed stats */}
        <div className="space-y-2">
          <div>
            <div className="flex justify-between text-[10px] font-mono mb-1">
              <span className="text-zinc-500 uppercase tracking-widest">Download</span>
              <span className="text-white font-semibold">{formatSpeed(provider.max_download_speed)}</span>
            </div>
            <SpeedBar value={provider.max_download_speed} max={5000} color="bg-accent-green" />
          </div>
          <div>
            <div className="flex justify-between text-[10px] font-mono mb-1">
              <span className="text-zinc-500 uppercase tracking-widest">Upload</span>
              <span className="text-white font-semibold">{formatSpeed(provider.max_upload_speed)}</span>
            </div>
            <SpeedBar value={provider.max_upload_speed} max={5000} color="bg-blue-400" />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
          <span className="text-zinc-700 text-[9px] font-mono">
            ID #{provider.provider_id}
          </span>
          <span className="text-zinc-600 text-[9px] font-mono">
            {provider.business_residential_code === 'R'
              ? 'Residential'
              : provider.business_residential_code === 'B'
              ? 'Business'
              : 'Residential & Business'}
          </span>
        </div>

        {/* Expandable pricing panel */}
        {expanded && <PricingPanel brandName={provider.brand_name} />}
      </div>
    </div>
  );
}
