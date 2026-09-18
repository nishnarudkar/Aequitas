import React from 'react';
import { Scale } from 'lucide-react';

export function Disclaimer() {
  return (
    <footer
      aria-label="Legal Disclaimer"
      className="sticky bottom-0 z-40 w-full bg-slate-900 border-t border-slate-800 text-slate-300 py-3 px-4 text-xs shadow-lg"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Scale aria-hidden="true" className="w-4 h-4 text-amber-400 shrink-0" />
          <p className="font-medium text-slate-200">
            Aequitas gives information, not legal advice. It can be wrong. For decisions that matter, talk to a lawyer.
          </p>
        </div>
        <a
          href="https://nalsa.gov.in"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 hover:text-amber-200 border border-amber-500/30 transition-colors font-medium text-xs whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-amber-400"
        >
          Free Legal Aid (NALSA 15100)
        </a>
      </div>
    </footer>
  );
}
