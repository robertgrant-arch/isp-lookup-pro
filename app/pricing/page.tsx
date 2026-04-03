import Link from 'next/link';

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    description: 'For hobbyists and testing',
    features: [
      '100 API requests/day',
      'Single API key',
      'Address lookup endpoint',
      'Community support',
      'Standard rate limiting',
    ],
    cta: 'Get Started',
    href: '/dashboard',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '$49',
    period: '/month',
    description: 'For startups and growing apps',
    features: [
      '5,000 API requests/day',
      'Up to 10 API keys',
      'Address lookup + diagnostics',
      'Diagnostics token generation',
      'Priority support',
      'CORS enabled for all origins',
      'Webhook notifications',
    ],
    cta: 'Start Pro Trial',
    href: '/dashboard',
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: '$199',
    period: '/month',
    description: 'For large-scale integrations',
    features: [
      '50,000 API requests/day',
      'Unlimited API keys',
      'All Pro features included',
      'Bulk address processing',
      'Custom rate limits',
      'Dedicated support & SLA',
      'SSO & team management',
      'Data export & analytics',
    ],
    cta: 'Contact Sales',
    href: 'mailto:support@isplookuppro.com',
    highlight: false,
  },
];

export default function PricingPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-display font-bold text-white mb-4">Simple, Transparent Pricing</h1>
        <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
          Start free and scale as you grow. Every plan includes access to the FCC Broadband Map API
          with real-time provider data.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-16">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative rounded-2xl border p-8 flex flex-col ${
              plan.highlight
                ? 'border-accent-green/50 bg-accent-green/5 shadow-[0_0_40px_rgba(0,255,136,0.08)]'
                : 'border-zinc-800 bg-zinc-900/50'
            }`}
          >
            {plan.highlight && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent-green text-black text-xs font-mono font-bold px-3 py-1 rounded-full">
                MOST POPULAR
              </div>
            )}
            <h2 className="text-xl font-bold text-white mb-1">{plan.name}</h2>
            <p className="text-zinc-500 text-sm mb-6">{plan.description}</p>
            <div className="mb-6">
              <span className="text-4xl font-display font-bold text-white">{plan.price}</span>
              <span className="text-zinc-500 font-mono text-sm">{plan.period}</span>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-zinc-300">
                                <span className="text-accent-green mt-0.5">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href={plan.href}
              className={`block text-center py-3 px-6 rounded-lg font-mono text-sm font-bold transition-all ${
                plan.highlight
                  ? 'bg-accent-green text-black hover:bg-accent-green/90 shadow-[0_0_20px_rgba(0,255,136,0.15)]'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {plan.cta}
            </Link>
          </div>
        ))}
      </div>

      {/* FAQ Section */}
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-white text-center mb-8">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {[
            {
              q: 'What counts as an API request?',
              a: 'Each call to /api/v1/lookup counts as one request. Cached responses (within 1 hour) do not count against your limit.',
            },
            {
              q: 'What is a diagnostics token?',
              a: 'A diagnostics token lets you generate shareable URLs that run ISP detection and speed tests for any user. Great for support teams and network troubleshooting.',
            },
            {
              q: 'Can I upgrade or downgrade anytime?',
              a: 'Yes. Plan changes take effect immediately. When upgrading, you get instant access to higher limits.',
            },
            {
              q: 'What data does the API return?',
              a: 'Provider name, technology type (fiber, cable, DSL, satellite, fixed wireless), max download/upload speeds, and location details from the FCC Broadband Map.',
            },
          ].map((faq) => (
            <div key={faq.q} className="border border-zinc-800 rounded-lg p-5">
              <h3 className="text-white font-bold text-sm mb-2">{faq.q}</h3>
              <p className="text-zinc-400 text-sm">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
