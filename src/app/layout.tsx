import type { Metadata } from 'next';
import './globals.css';
import { Disclaimer } from '@/components/safety/Disclaimer';

export const metadata: Metadata = {
  title: 'Aequitas — Equal footing in every agreement.',
  description:
    'Plain-language legal contract analysis, clause risk detection, persona-tuned guidance, and actionable briefs for non-lawyers in India.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen flex flex-col font-sans antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 bg-amber-400 text-slate-950 px-4 py-2 font-bold rounded-md shadow-xl border border-amber-500"
        >
          Skip to main content
        </a>

        <header className="bg-slate-900/90 border-b border-slate-800 py-3 px-6 sticky top-0 z-30 backdrop-blur-md">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500 bg-clip-text text-transparent">
                Aequitas
              </span>
              <span className="text-xs font-semibold text-slate-400 hidden sm:inline-block border-l border-slate-700 pl-3">
                Equal footing in every agreement.
              </span>
            </div>

            <nav aria-label="Main Navigation" className="flex items-center gap-4 text-xs font-medium">
              <a
                href="/"
                className="text-slate-300 hover:text-amber-300 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400 rounded px-1.5 py-1"
              >
                Intake & Analyze
              </a>
              <a
                href="https://nalsa.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-400 hover:underline font-semibold"
              >
                Free Legal Aid
              </a>
            </nav>
          </div>
        </header>

        <main id="main-content" className="flex-1 flex flex-col">
          {children}
        </main>

        <Disclaimer />
      </body>
    </html>
  );
}
