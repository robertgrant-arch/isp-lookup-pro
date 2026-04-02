import type { TechCategory } from './types';

export const TECH_CODES: Record<number, { label: string; category: TechCategory }> = {
  10: { label: 'DSL', category: 'dsl' },
  11: { label: 'ADSL2', category: 'dsl' },
  12: { label: 'VDSL', category: 'dsl' },
  20: { label: 'Other Copper', category: 'dsl' },
  40: { label: 'Cable (DOCSIS 3.0)', category: 'cable' },
  41: { label: 'Cable (DOCSIS 3.1)', category: 'cable' },
  42: { label: 'Cable (DOCSIS 3.0)', category: 'cable' },
  43: { label: 'Cable (DOCSIS 3.1)', category: 'cable' },
  50: { label: 'Fiber', category: 'fiber' },
  60: { label: 'Satellite', category: 'satellite' },
  61: { label: 'Satellite (LEO)', category: 'satellite' },
  70: { label: 'Fixed Wireless', category: 'fixed_wireless' },
  71: { label: 'Licensed Fixed Wireless', category: 'fixed_wireless' },
  72: { label: 'Licensed-by-Rule Fixed Wireless', category: 'fixed_wireless' },
  300: { label: 'LTE / Other', category: 'other' },
  301: { label: 'Other', category: 'other' },
};

export function getTechInfo(code: number): { label: string; category: TechCategory } {
  return TECH_CODES[code] ?? { label: `Tech Code ${code}`, category: 'other' };
}

export const TECH_COLORS: Record<TechCategory, { bg: string; text: string; border: string }> = {
  fiber:          { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  cable:          { bg: 'bg-blue-500/10',    text: 'text-blue-400',    border: 'border-blue-500/30' },
  dsl:            { bg: 'bg-orange-500/10',  text: 'text-orange-400',  border: 'border-orange-500/30' },
  satellite:      { bg: 'bg-purple-500/10',  text: 'text-purple-400',  border: 'border-purple-500/30' },
  fixed_wireless: { bg: 'bg-cyan-500/10',    text: 'text-cyan-400',    border: 'border-cyan-500/30' },
  other:          { bg: 'bg-zinc-500/10',    text: 'text-zinc-400',    border: 'border-zinc-500/30' },
};
