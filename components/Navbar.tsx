'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';

export function Navbar() {
  const path = usePathname();

  return (
    <nav className="border-b border-bg-border bg-bg/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded bg-accent-green/10 border border-accent-green/30 flex items-center justify-center group-hover:bg-accent-green/20 transition-colors">
            <span className="text-accent-green text-sm font-mono font-bold">⬡</span>
          </div>
          <span className="font-display font-bold text-white text-sm tracking-tight">
            ISP<span className="text-accent-green">Lookup</span>
            <span className="text-zinc-500 font-normal"> Pro</span>
          </span>
        </Link>

        <div className="flex items-center gap-1">
          <Link
            href="/"
            className={clsx(
              'px-3 py-1.5 rounded text-xs font-mono transition-colors',
              path === '/'
                ? 'text-white bg-white/10'
                : 'text-zinc-500 hover:text-zinc-300'
            )}
          >
            Lookup
          </Link>
          <Link
            href="/dashboard"
            className={clsx(
              'px-3 py-1.5 rounded text-xs font-mono transition-colors',
              path === '/dashboard'
                ? 'text-white bg-white/10'
                : 'text-zinc-500 hover:text-zinc-300'
            )}
          >
            Dashboard
          </Link>
          <a
            href="/api/v1/lookup"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded text-xs font-mono text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            API ↗
          </a>
        </div>
      </div>
    </nav>
  );
}
