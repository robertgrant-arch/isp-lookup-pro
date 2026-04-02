'use client';

import { TECH_COLORS } from '@/lib/techCodes';
import type { TechCategory } from '@/lib/types';
import { clsx } from 'clsx';

const ICONS: Record<TechCategory, string> = {
  fiber:          '◈',
  cable:          '◉',
  dsl:            '◎',
  satellite:      '◯',
  fixed_wireless: '◆',
  other:          '◇',
};

interface TechBadgeProps {
  category: TechCategory;
  label: string;
  size?: 'sm' | 'md';
}

export function TechBadge({ category, label, size = 'md' }: TechBadgeProps) {
  const colors = TECH_COLORS[category];
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded border font-mono font-medium tracking-wide',
        colors.bg,
        colors.text,
        colors.border,
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
      )}
    >
      <span aria-hidden="true">{ICONS[category]}</span>
      {label}
    </span>
  );
}
