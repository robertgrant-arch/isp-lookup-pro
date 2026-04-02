'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { clsx } from 'clsx';

interface SearchBarProps {
  onSearch: (address: string) => void;
  loading: boolean;
}

interface Suggestion {
  address: string;
  lat: number;
  lng: number;
  city: string;
  state: string;
  zip: string;
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
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(-1);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const charIdx = useRef(0);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const abortRef = useRef<AbortController | null>(null);

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

  // Fetch suggestions with debounce
  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.length < 5) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setSuggestLoading(true);
    try {
      const res = await fetch(
        `/api/suggest?q=${encodeURIComponent(query)}`,
        { signal: controller.signal }
      );
      if (!res.ok) throw new Error('fail');
      const data = await res.json();
      setSuggestions(data.suggestions ?? []);
      setShowSuggestions((data.suggestions ?? []).length > 0);
      setSelectedIdx(-1);
    } catch {
      // aborted or failed, ignore
    } finally {
      setSuggestLoading(false);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setValue(v);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(v.trim()), 350);
  };

  const selectSuggestion = (addr: string) => {
    setValue(addr);
    setShowSuggestions(false);
    setSuggestions([]);
    onSearch(addr);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIdx((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIdx((i) => Math.max(i - 1, -1));
    } else if (e.key === 'Enter' && selectedIdx >= 0) {
      e.preventDefault();
      selectSuggestion(suggestions[selectedIdx].address);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (trimmed.length >= 5) {
      setShowSuggestions(false);
      onSearch(trimmed);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div ref={wrapperRef} className="relative">
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
            onChange={handleChange}
            onFocus={() => {
              setFocused(true);
              if (suggestions.length > 0) setShowSuggestions(true);
            }}
            onBlur={() => setFocused(false)}
            onKeyDown={handleKeyDown}
            placeholder={focused ? 'Enter a US address...' : placeholder}
            className="flex-1 bg-transparent py-4 pr-4 text-white font-mono text-sm placeholder:text-zinc-600 focus:outline-none"
            disabled={loading}
            autoComplete="off"
            spellCheck={false}
          />

          {/* Loading spinner for suggestions */}
          {suggestLoading && (
            <span className="mr-2 w-3 h-3 border border-zinc-600 border-t-accent-green rounded-full animate-spin shrink-0" />
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
              'Lookup \u2192'
            )}
          </button>
        </div>

        {/* Suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-1 rounded-lg border border-bg-border bg-bg-surface shadow-2xl overflow-hidden">
            {suggestions.map((s, i) => (
              <button
                key={s.address}
                type="button"
                className={clsx(
                  'w-full px-4 py-3 text-left font-mono text-sm transition-colors flex items-center gap-3',
                  i === selectedIdx
                    ? 'bg-accent-green/10 text-accent-green'
                    : 'text-zinc-300 hover:bg-white/5 hover:text-white'
                )}
                onMouseDown={(e) => {
                  e.preventDefault();
                  selectSuggestion(s.address);
                }}
                onMouseEnter={() => setSelectedIdx(i)}
              >
                <svg className="w-4 h-4 shrink-0 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="truncate">{s.address}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <p className="mt-2 text-[11px] font-mono text-zinc-600 pl-1">
        Enter a US street address to find all available ISPs via the FCC Broadband Map
      </p>
    </form>
  );
}
