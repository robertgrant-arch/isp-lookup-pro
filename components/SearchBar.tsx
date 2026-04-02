'use client';

import { useState, useRef, useEffect } from 'react';
import { clsx } from 'clsx';

interface SearchBarProps {
  onSearch: (address: string) => void;
  loading: boolean;
}

const EXAMPLES = [
  '1600 Pennsylvania Ave NW, Washington DC',
  '1 Apple Park Way, Cupertino CA',
  '350 Fifth Avenue, New York NY',
  '1 Infinite Loop, Cupertino CA',
  '700 W Georgia St, Vancouver BC',
];

export function SearchBar({ onSearch, loading }: SearchBarProps) {
  const [value, setValue] = useState('');
  const [placeholder, setPlaceholder] = useState('');
  const [exampleIdx, setExampleIdx] = useState(0);
  const [typing, setTyping] = useState(true);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const charIdx = useRef(0);

  // Animated placeholder typewriter
  useEffect(() => {
    if (focused || value) return;
    const example = EXAMPLES[exampleIdx];

    if (typing) {
      if (charIdx.current <= example.length) {
        const t = setTimeout(() => {
          setPlaceholder(example.slice(0, charIdx.current));
          charIdx.current++;
        }, 45);
        return () => clearTimeout(t);
      } else {
        const t = setTimeout(() => setTyping(false), 1800);
        return () => clearTimeout(t);
      }
    } else {
      if (charIdx.current > 0) {
        const t = setTimeout(() => {
          charIdx.current--;
          setPlaceholder(example.slice(0, charIdx.current));
        }, 20);
        return () => clearTimeout(t);
      } else {
        setExampleIdx((i) => (i + 1) % EXAMPLES.length);
        setTyping(true);
      }
    }
  }, [placeholder, typing, exampleIdx, focused, value]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (trimmed.length >= 5) onSearch(trimmed);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div
        className={clsx(
          'relative flex items-center rounded-lg border transition-all duration-200',
          focused
            ? 'border-accent-green/50 shadow-[0_0_0_1px_rgba(0,255,136,0.2),0_0_30px_rgba(0,255,136,0.08)]'
            : 'border-bg-border hover:border-white/20',
          'bg-bg-surface'
        )}
      >
        {/* Terminal prompt */}
        <div className="flex items-center pl-4 pr-2 shrink-0">
          <span className="font-mono text-accent-green text-sm select-none">$</span>
          <span className="font-mono text-zinc-600 text-sm mx-1 select-none">lookup</span>
        </div>

        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={focused ? 'Enter a US address...' : placeholder}
          className="flex-1 bg-transparent py-4 pr-4 text-white font-mono text-sm placeholder:text-zinc-600 focus:outline-none"
          disabled={loading}
          autoComplete="off"
          spellCheck={false}
        />

        {/* Blinking cursor when empty and focused */}
        {focused && !value && (
          <span className="absolute font-mono text-accent-green text-sm animate-blink pointer-events-none"
            style={{ left: `calc(4rem + ${placeholder.length * 0}px)` }}
          />
        )}

        <button
          type="submit"
          disabled={loading || value.trim().length < 5}
          className={clsx(
            'mr-2 px-4 py-2 rounded text-xs font-mono font-bold tracking-widest uppercase',
            'transition-all duration-200 shrink-0',
            loading || value.trim().length < 5
              ? 'bg-white/5 text-zinc-600 cursor-not-allowed'
              : 'bg-accent-green text-black hover:bg-accent-green/90 hover:shadow-[0_0_16px_rgba(0,255,136,0.4)]'
          )}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 border border-zinc-600 border-t-transparent rounded-full animate-spin" />
              Scanning
            </span>
          ) : (
            'Lookup →'
          )}
        </button>
      </div>

      <p className="mt-2 text-[11px] font-mono text-zinc-600 pl-1">
        Enter a US street address to find all available ISPs via the FCC Broadband Map
      </p>
    </form>
  );
}
