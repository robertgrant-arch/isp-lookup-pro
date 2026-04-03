// Provider pricing database
// Prices sourced from publicly listed ISP plan pages (2025-2026)
// All prices in USD/month. Marked as approximate where confirmed.

export interface PricingTier {
  name: string;
  downloadMbps: number;
  uploadMbps: number;
  pricePerMonth: number;
  promoPrice?: number;       // intro/promo price for first 12-24 months
  promoDuration?: string;    // e.g. "12 months"
  contractRequired?: boolean;
  dataCapGB?: number;        // undefined = unlimited
  notes?: string;
}

export interface ProviderPricing {
  brandName: string;
  // Partial match keywords — lowercased brand_name is checked against these
  matchKeywords: string[];
  websiteUrl: string;
  plans: PricingTier[];
  disclaimer?: string;
}

export const PROVIDER_PRICING_DB: ProviderPricing[] = [
  {
    brandName: 'Xfinity',
    matchKeywords: ['xfinity', 'comcast'],
    websiteUrl: 'https://www.xfinity.com/learn/internet-service',
    plans: [
      { name: 'Connect', downloadMbps: 75, uploadMbps: 15, pricePerMonth: 35, promoPrice: 20, promoDuration: '24 months', contractRequired: false },
      { name: 'Connect More', downloadMbps: 200, uploadMbps: 200, pricePerMonth: 50, promoPrice: 35, promoDuration: '24 months', contractRequired: false },
      { name: 'Fast', downloadMbps: 400, uploadMbps: 20, pricePerMonth: 65, promoPrice: 45, promoDuration: '24 months', contractRequired: false },
      { name: 'Superfast', downloadMbps: 800, uploadMbps: 20, pricePerMonth: 80, promoPrice: 60, promoDuration: '24 months', contractRequired: false },
      { name: 'Gigabit', downloadMbps: 1200, uploadMbps: 40, pricePerMonth: 100, promoPrice: 80, promoDuration: '24 months', contractRequired: false },
      { name: 'Gigabit Extra', downloadMbps: 2000, uploadMbps: 2000, pricePerMonth: 120, contractRequired: false, notes: 'Fiber available areas only' },
    ],
    disclaimer: 'Prices vary by region. Equipment fee ~$15/mo. Taxes & fees extra.',
  },
  {
    brandName: 'AT&T',
    matchKeywords: ['at&t', 'att'],
    websiteUrl: 'https://www.att.com/internet/',
    plans: [
      { name: 'Internet 300', downloadMbps: 300, uploadMbps: 300, pricePerMonth: 55, contractRequired: false },
      { name: 'Internet 500', downloadMbps: 500, uploadMbps: 500, pricePerMonth: 65, contractRequired: false },
      { name: 'Internet 1 Gig', downloadMbps: 1000, uploadMbps: 1000, pricePerMonth: 80, contractRequired: false },
      { name: 'Internet 2 Gig', downloadMbps: 2000, uploadMbps: 2000, pricePerMonth: 110, contractRequired: false },
      { name: 'Internet 5 Gig', downloadMbps: 5000, uploadMbps: 5000, pricePerMonth: 180, contractRequired: false },
    ],
    disclaimer: 'Fiber plans. Price guaranteed for life of service with AutoPay. Taxes extra.',
  },
  {
    brandName: 'Spectrum',
    matchKeywords: ['spectrum', 'charter', 'time warner'],
    websiteUrl: 'https://www.spectrum.com/internet',
    plans: [
      { name: 'Internet', downloadMbps: 500, uploadMbps: 10, pricePerMonth: 50, contractRequired: false },
      { name: 'Internet Ultra', downloadMbps: 1000, uploadMbps: 20, pricePerMonth: 70, contractRequired: false },
      { name: 'Internet Gig', downloadMbps: 1000, uploadMbps: 35, pricePerMonth: 90, contractRequired: false, notes: 'No data caps, no contracts' },
    ],
    disclaimer: 'No contracts or data caps. Modem included free. Price for 12 months with AutoPay.',
  },
  {
    brandName: 'Verizon Fios',
    matchKeywords: ['verizon', 'fios'],
    websiteUrl: 'https://www.verizon.com/home/internet/',
    plans: [
      { name: '300 Mbps', downloadMbps: 300, uploadMbps: 300, pricePerMonth: 50, contractRequired: false },
      { name: '1 Gig', downloadMbps: 1000, uploadMbps: 1000, pricePerMonth: 70, contractRequired: false },
      { name: '2 Gig', downloadMbps: 2000, uploadMbps: 2000, pricePerMonth: 110, contractRequired: false },
    ],
    disclaimer: 'Symmetric fiber speeds. No data caps. Price with Auto Pay & paper-free billing.',
  },
  {
    brandName: 'T-Mobile Home Internet',
    matchKeywords: ['t-mobile', 'tmobile'],
    websiteUrl: 'https://www.t-mobile.com/isp',
    plans: [
      { name: 'Home Internet', downloadMbps: 245, uploadMbps: 31, pricePerMonth: 50, contractRequired: false, notes: 'Avg download 245 Mbps. Price lock guarantee.' },
      { name: 'Home Internet Plus', downloadMbps: 415, uploadMbps: 43, pricePerMonth: 70, contractRequired: false, notes: 'Avg download 415 Mbps.' },
    ],
    disclaimer: 'Fixed wireless access. Speeds may vary based on location and network congestion.',
  },
  {
    brandName: 'Starlink',
    matchKeywords: ['starlink'],
    websiteUrl: 'https://www.starlink.com/residential',
    plans: [
      { name: 'Residential', downloadMbps: 200, uploadMbps: 25, pricePerMonth: 120, contractRequired: false, notes: 'Hardware kit $599 one-time. Unlimited data.' },
      { name: 'Priority', downloadMbps: 500, uploadMbps: 50, pricePerMonth: 250, contractRequired: false, notes: 'Higher priority access. Hardware $2500.' },
      { name: 'Mobile', downloadMbps: 100, uploadMbps: 15, pricePerMonth: 165, contractRequired: false, notes: 'Portable use anywhere in country.' },
    ],
    disclaimer: 'LEO satellite service. One-time hardware cost applies. Speeds vary by location.',
  },
  {
    brandName: 'HughesNet',
    matchKeywords: ['hughesnet', 'hughes'],
    websiteUrl: 'https://www.hughesnet.com/internet-plans',
    plans: [
      { name: '15 GB', downloadMbps: 25, uploadMbps: 3, pricePerMonth: 50, contractRequired: true, dataCapGB: 15, notes: 'Data speeds reduced after cap.' },
      { name: '30 GB', downloadMbps: 25, uploadMbps: 3, pricePerMonth: 65, contractRequired: true, dataCapGB: 30 },
      { name: '100 GB', downloadMbps: 50, uploadMbps: 5, pricePerMonth: 95, contractRequired: true, dataCapGB: 100 },
      { name: 'Fusion 100 GB', downloadMbps: 50, uploadMbps: 5, pricePerMonth: 105, contractRequired: true, dataCapGB: 100, notes: 'Hybrid satellite+terrestrial for lower latency.' },
    ],
    disclaimer: 'GSO satellite. 24-month contract required. Early termination fee applies. Hardware lease ~$15/mo.',
  },
  {
    brandName: 'Cox',
    matchKeywords: ['cox'],
    websiteUrl: 'https://www.cox.com/residential/internet.html',
    plans: [
      { name: 'Internet Starter 25', downloadMbps: 25, uploadMbps: 3, pricePerMonth: 30, contractRequired: false },
      { name: 'Internet Essential 100', downloadMbps: 100, uploadMbps: 10, pricePerMonth: 50, contractRequired: false },
      { name: 'Internet Preferred 250', downloadMbps: 250, uploadMbps: 10, pricePerMonth: 70, contractRequired: false },
      { name: 'Internet Ultimate 500', downloadMbps: 500, uploadMbps: 10, pricePerMonth: 80, contractRequired: false },
      { name: 'Gigablast', downloadMbps: 1000, uploadMbps: 35, pricePerMonth: 100, contractRequired: false },
    ],
    disclaimer: 'Prices for 12 months. Equipment rental ~$13/mo. Taxes & fees extra.',
  },
  {
    brandName: 'Google Fiber',
    matchKeywords: ['google fiber', 'google'],
    websiteUrl: 'https://fiber.google.com/about/',
    plans: [
      { name: '1 Gig', downloadMbps: 1000, uploadMbps: 1000, pricePerMonth: 70, contractRequired: false },
      { name: '2 Gig', downloadMbps: 2000, uploadMbps: 1000, pricePerMonth: 100, contractRequired: false },
      { name: '5 Gig', downloadMbps: 5000, uploadMbps: 2500, pricePerMonth: 150, contractRequired: false },
      { name: '8 Gig', downloadMbps: 8000, uploadMbps: 8000, pricePerMonth: 250, contractRequired: false },
    ],
    disclaimer: 'No data caps. No contracts. Router included free. Price for life guarantee.',
  },
  {
    brandName: 'Frontier',
    matchKeywords: ['frontier'],
    websiteUrl: 'https://frontier.com/local/internet',
    plans: [
      { name: 'Fiber 500', downloadMbps: 500, uploadMbps: 500, pricePerMonth: 50, promoPrice: 40, promoDuration: '12 months', contractRequired: false },
      { name: 'Fiber 1 Gig', downloadMbps: 1000, uploadMbps: 1000, pricePerMonth: 60, promoPrice: 50, promoDuration: '12 months', contractRequired: false },
      { name: 'Fiber 2 Gig', downloadMbps: 2000, uploadMbps: 2000, pricePerMonth: 100, contractRequired: false },
      { name: 'Fiber 5 Gig', downloadMbps: 5000, uploadMbps: 5000, pricePerMonth: 155, contractRequired: false },
    ],
    disclaimer: 'Fiber-only plans. No data caps. No contracts. Router included.',
  },
  {
    brandName: 'EarthLink',
    matchKeywords: ['earthlink'],
    websiteUrl: 'https://www.earthlink.net/internet/',
    plans: [
      { name: 'Fiber 1 Gig', downloadMbps: 1000, uploadMbps: 1000, pricePerMonth: 70, contractRequired: false },
      { name: 'HyperLink 2 Gig', downloadMbps: 2000, uploadMbps: 2000, pricePerMonth: 100, contractRequired: false },
      { name: 'HyperLink 5 Gig', downloadMbps: 5000, uploadMbps: 5000, pricePerMonth: 150, contractRequired: false },
    ],
    disclaimer: 'No data caps. Price-lock guarantee. Equipment included.',
  },
  {
    brandName: 'Windstream',
    matchKeywords: ['windstream', 'kinetic'],
    websiteUrl: 'https://www.windstream.com/internet',
    plans: [
      { name: 'Kinetic 200', downloadMbps: 200, uploadMbps: 200, pricePerMonth: 40, contractRequired: false },
      { name: 'Kinetic 500', downloadMbps: 500, uploadMbps: 500, pricePerMonth: 55, contractRequired: false },
      { name: 'Kinetic Gig', downloadMbps: 1000, uploadMbps: 1000, pricePerMonth: 70, contractRequired: false },
    ],
    disclaimer: 'Fiber DSL hybrid. Prices may vary by area.',
  },
  {
    brandName: 'Astound Broadband',
    matchKeywords: ['astound', 'rcn', 'wave', 'grande'],
    websiteUrl: 'https://www.astound.com/internet/',
    plans: [
      { name: '200 Mbps', downloadMbps: 200, uploadMbps: 10, pricePerMonth: 30, promoPrice: 20, promoDuration: '12 months', contractRequired: false },
      { name: '500 Mbps', downloadMbps: 500, uploadMbps: 20, pricePerMonth: 50, promoPrice: 35, promoDuration: '12 months', contractRequired: false },
      { name: '1 Gbps', downloadMbps: 1000, uploadMbps: 50, pricePerMonth: 70, promoPrice: 50, promoDuration: '12 months', contractRequired: false },
      { name: '1.5 Gbps', downloadMbps: 1500, uploadMbps: 50, pricePerMonth: 90, contractRequired: false },
    ],
    disclaimer: 'No data caps, no annual contracts. Modem included.',
  },
];

/**
 * Look up pricing for a given provider brand name.
 * Returns null if no matching pricing data is found.
 */
export function getProviderPricing(brandName: string): ProviderPricing | null {
  const lower = brandName.toLowerCase();
  return (
    PROVIDER_PRICING_DB.find((p) =>
      p.matchKeywords.some((kw) => lower.includes(kw))
    ) ?? null
  );
}
