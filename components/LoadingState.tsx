'use client';

import { useEffect, useState } from 'react';

const STEPS = [
  { label: 'Resolving address…', duration: 600 },
  { label: 'Querying FCC Broadband Map…', duration: 900 },
  { label: 'Fetching provider availability…', duration: 800 },
  { label: 'Processing results…', duration: 400 },
];

export function LoadingState() {
  const [stepIdx, setStepIdx] = useState(0);
  const [dots, setDots] = useState('');

  useEffect(() => {
    let elapsed = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];

    STEPS.forEach((step, i) => {
      const t = setTimeout(() => setStepIdx(i), elapsed);
      timers.push(t);
      elapsed += step.duration;
    });

    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setDots((d) => (d.length >= 3 ? '' : d + '.')), 300);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="mt-8 animate-fade-in">
      <div className="rounded-lg border border-bg-border bg-bg-surface p-6">
        {/* Scan animation */}
        <div className="relative h-1 w-full bg-bg-elevated rounded-full overflow-hidden mb-6">
          <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-transparent via-accent-green to-transparent w-1/3 animate-[scan-bar_1.5s_ease-in-out_infinite]" />
        </div>

        <style jsx>{`
          @keyframes scan-bar {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(400%); }
          }
        `}</style>

        <div className="space-y-3">
          {STEPS.map((step, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="w-4 h-4 shrink-0 flex items-center justify-center">
                {i < stepIdx ? (
                  <span className="text-accent-green text-sm">✓</span>
                ) : i === stepIdx ? (
                  <span className="w-3 h-3 border border-accent-green border-t-transparent rounded-full animate-spin block" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-white/10 block" />
                )}
              </span>
              <span
                className={`font-mono text-sm transition-colors duration-300 ${
                  i < stepIdx
                    ? 'text-zinc-500 line-through'
                    : i === stepIdx
                    ? 'text-white'
                    : 'text-zinc-700'
                }`}
              >
                {step.label}
                {i === stepIdx && <span className="text-accent-green">{dots}</span>}
              </span>
            </div>
          ))}
        </div>

        <p className="mt-5 text-[11px] font-mono text-zinc-700">
          Data sourced from FCC Broadband Map · Results cached for 1 hour
        </p>
      </div>
    </div>
  );
}
