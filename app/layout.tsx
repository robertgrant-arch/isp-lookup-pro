import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'ISP Lookup Pro — Broadband Availability Search',
  description:
    'Find every internet service provider available at any US address. Powered by the FCC Broadband Map API.',
  keywords: ['ISP lookup', 'internet providers', 'broadband map', 'FCC', 'fiber internet', 'cable internet'],
  openGraph: {
    title: 'ISP Lookup Pro',
    description: 'Find every ISP available at any US address',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-[#080809] text-zinc-200 antialiased min-h-screen">
        <Navbar />
        <main>{children}</main>
        <footer className="border-t border-bg-border mt-16 py-8">
          <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="font-mono text-[11px] text-zinc-700">
              © {new Date().getFullYear()} ISP Lookup Pro · Data: FCC Broadband Map
            </span>
            <div className="flex items-center gap-4">
              <a
                href="https://broadbandmap.fcc.gov"
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[11px] text-zinc-700 hover:text-zinc-400 transition-colors"
              >
                FCC Broadband Map ↗
              </a>
              <span className="font-mono text-[11px] text-zinc-700">
                GET /api/v1/lookup
              </span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
