'use client';

import { useState } from 'react';
import { ProviderCard } from './ProviderCard';
import { TechBadge } from './TechBadge';
import type { LookupResponse, TechCategory } from '@/lib/types';
import { clsx } from 'clsx';

const CATEGORY_ORDER: TechCategory[] = ['fiber', 'cable', 'fixed_wireless', 'dsl', 'satellite', 'other'];

type SortKey = 'speed' | 'technology' | 'name';

interface ResultsPanelProps {
  result: LookupResponse;
}

export function ResultsPanel({ result }: ResultsPanelProps) {
  const [sort, setSort] = useState<SortKey>('speed');
  const [filterCat, setFilterCat] = useState<TechCategory | 'all'>('all');

  const categories = Array.from(new Set(result.providers.map((p) => p.technology_category)));
  categories.sort((a, b) => CATEGORY_ORDER.indexOf(a) - CATEGORY_ORDER.indexOf(b));

  let providers = [...result.providers];

  if (filterCat !== 'all') {
    providers = providers.filter((p) => p.technology_category === filterCat);
  }

  if (sort === 'speed') {
    providers.sort((a, b) => b.max_download_speed - a.max_download_speed);
  } else if (sort === 'technology') {
    providers.sort(
      (a, b) =>
        CATEGORY_ORDER.indexOf(a.technology_category) -
        CATEGORY_ORDER.indexOf(b.technology_category)
    );
  } else {
    providers.sort((a, b) => a.brand_name.localeCompare(b.brand_name));
  }

  const hasFiber = result.providers.some((p) => p.technology_category === 'fiber');
  const maxDownload = Math.max(...result.providers.map((p) => p.max_download_speed));

  return (
    <div className="mt-8 animate-fade-in">
      {/* Location header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
              Address resolved
            </span>
            {result.cached && (
              <span className="text-[9px] font-mono text-accent-blue border border-accent-blue/20 bg-accent-blue/5 px-1.5 py-0.5 rounded">
                CACHED
              </span>
            )}
          </div>
          <h2 className="font-display text-white font-semibold text-lg leading-snug">
            {result.address}
          </h2>
          <p className="text-[11px] font-mono text-zinc-600 mt-1">
            Location ID: {result.location_id} · {result.latitude.toFixed(5)}, {result.longitude.toFixed(5)}
          </p>
        </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                                <a href={`sms:?&body=Your internet options for ${encodeURIComponent(result.address)}: ${typeof window !== 'undefined' ? window.location.href : ''}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] font-mono border border-accent-green/30 bg-accent-green/5 text-accent-green hover:bg-accent-green/10 transition-colors">
                                                📱 Text Token
                                              </a>
                                <a href={`mailto:?subject=Internet Options for ${encodeURIComponent(result.address)}&body=Here are the available internet providers at ${result.address}:%0A%0A${result.providers.slice(0,3).map(p => p.brand_name + ' - ' + p.max_download_speed + ' Mbps').join('%0A')}%0A%0AView all ${result.providers.length} providers: ${typeof window !== 'undefined' ? window.location.href : ''}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] font-mono border border-accent-blue/30 bg-accent-blue/5 text-accent-blue hover:bg-accent-blue/10 transition-colors">
                                                ✉️ Email Token
                                              </a>
                                <a href={`https://broadbandmap.fcc.gov/location-summary/fixed?location_id=${result.location_id}&addr=${encodeURIComponent(result.address)}&unit=&lat=${result.latitude}&lon=${result.longitude}&zoom=14`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] font-mono border border-zinc-600/40 bg-zinc-800/40 text-zinc-300 hover:text-white hover:border-zinc-400 transition-colors">
                                                🔍 Check Provider
                                              </a>
                              </div>

        <div className="shrink-0 text-right">
          <div className="text-3xl font-mono font-bold text-white">{result.providers.length}</div>
          <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Providers</div>
        </div>
      </div>

      {/* Summary chips */}
      <div className="flex flex-wrap gap-2 mb-5">
        {hasFiber && (
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-accent-green border border-accent-green/20 bg-accent-green/5 px-2.5 py-1 rounded">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse" />
            Fiber Available
          </div>
        )}
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-400 border border-bg-border bg-bg-surface px-2.5 py-1 rounded">
          Max {maxDownload >= 1000 ? `${(maxDownload / 1000).toFixed(0)} Gbps` : `${maxDownload} Mbps`} Down
        </div>
        {categories.map((cat) => (
          <TechBadge key={cat} category={cat} label={cat.replace('_', ' ')} size="sm" />
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-5 border-b border-bg-border">
        <div className="flex items-center gap-1">
          <span className="text-[10px] font-mono text-zinc-600 mr-2 uppercase tracking-widest">Filter:</span>
          <button
            onClick={() => setFilterCat('all')}
            className={clsx(
              'px-2.5 py-1 rounded text-[10px] font-mono border transition-colors',
              filterCat === 'all'
                ? 'border-accent-green/40 bg-accent-green/10 text-accent-green'
                : 'border-bg-border text-zinc-500 hover:text-zinc-300 hover:border-white/20'
            )}
          >
            All ({result.providers.length})
          </button>
          {categories.map((cat) => {
            const count = result.providers.filter((p) => p.technology_category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setFilterCat(cat)}
                className={clsx(
                  'px-2.5 py-1 rounded text-[10px] font-mono border capitalize transition-colors',
                  filterCat === cat
                    ? 'border-accent-green/40 bg-accent-green/10 text-accent-green'
                    : 'border-bg-border text-zinc-500 hover:text-zinc-300 hover:border-white/20'
                )}
              >
                {cat.replace('_', ' ')} ({count})
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1">
          <span className="text-[10px] font-mono text-zinc-600 mr-2 uppercase tracking-widest">Sort:</span>
          {(['speed', 'technology', 'name'] as SortKey[]).map((s) => (
            <button
              key={s}
              onClick={() => setSort(s)}
              className={clsx(
                'px-2.5 py-1 rounded text-[10px] font-mono border capitalize transition-colors',
                sort === s
                  ? 'border-white/30 bg-white/10 text-white'
                  : 'border-bg-border text-zinc-500 hover:text-zinc-300'
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {providers.length === 0 ? (
        <div className="text-center py-10 text-zinc-500 font-mono text-sm">
          No providers match the selected filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {providers.map((provider, i) => (
            <ProviderCard
              key={`${provider.provider_id}-${provider.technology}`}
              provider={provider}
              rank={sort === 'speed' ? i : -1}
              style={{ animationDelay: `${i * 60}ms`, animation: 'slideUp 0.35s ease-out forwards', opacity: 0 }}
            />
          ))}
        </div>
      )}

      <p className="mt-5 text-[11px] font-mono text-zinc-700 text-center">
        Data sourced from FCC Broadband Map API · As of {new Date(result.timestamp).toLocaleDateString()} ·
        Speeds are max advertised, not guaranteed
      </p>
    </div>
  );
}
