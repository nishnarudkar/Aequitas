'use client';

import React, { useState } from 'react';
import { CompareResponse, Clause, UserContext } from '@/types';
import {
  Scale,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Minus,
  Equal,
} from 'lucide-react';

interface CompareViewProps {
  clauses: Clause[];
  context: UserContext;
  documentTitle: string;
}

type BetterFor = 'docA' | 'docB' | 'neither' | 'equal';
type ItemStatus = 'docA-only' | 'docB-only' | 'different' | 'similar';

const BETTER_ICON: Record<BetterFor, React.ReactNode> = {
  docA: <ArrowLeft className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />,
  docB: <ArrowRight className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />,
  neither: <Minus className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />,
  equal: <Equal className="w-3.5 h-3.5 text-slate-300" aria-hidden="true" />,
};

const BETTER_LABEL: Record<BetterFor, string> = {
  docA: 'Your Doc',
  docB: 'Baseline',
  neither: 'Neither',
  equal: 'Equal',
};

const STATUS_BADGE: Record<ItemStatus, { label: string; className: string }> = {
  'docA-only': { label: 'Your doc only', className: 'bg-amber-950 text-amber-300 border-amber-900' },
  'docB-only': { label: 'Baseline only', className: 'bg-slate-800 text-slate-300 border-slate-700' },
  different: { label: 'Materially different', className: 'bg-rose-950 text-rose-300 border-rose-900' },
  similar: { label: 'Similar', className: 'bg-emerald-950 text-emerald-300 border-emerald-900' },
};

export function CompareView({ clauses, context, documentTitle }: CompareViewProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CompareResponse | null>(null);
  const [mode, setMode] = useState<'baseline' | 'upload'>('baseline');

  const handleCompare = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const payload = {
        docA: { title: documentTitle, clauses },
        // In baseline mode, docB is synthesized server-side
        docB: { title: 'Fair Baseline', clauses: [] },
        context,
        isBaseline: mode === 'baseline',
      };

      const res = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error('Comparison failed. Please try again.');
      }

      const data: CompareResponse = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message ?? 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const scoreForPersona = (result?.items ?? []).reduce(
    (acc, item) => {
      if (item.betterForPersona === 'docA') acc.docA++;
      else if (item.betterForPersona === 'docB') acc.docB++;
      return acc;
    },
    { docA: 0, docB: 0 }
  );

  return (
    <section aria-labelledby="compare-heading" className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5 shadow-lg">
        <div className="flex items-center gap-2">
          <Scale className="w-4 h-4 text-amber-400" aria-hidden="true" />
          <h2 id="compare-heading" className="text-sm font-bold text-amber-400 uppercase tracking-wider">
            Document Comparison
          </h2>
        </div>

        {/* Mode selector */}
        <div className="space-y-3">
          <p className="text-xs text-slate-300">
            Compare your contract against a fair market baseline — or upload a second document.
          </p>
          <div className="flex items-center gap-2">
            <button
              id="compare-mode-baseline"
              type="button"
              onClick={() => setMode('baseline')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
                mode === 'baseline'
                  ? 'bg-amber-500 text-slate-950 border-amber-400'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-amber-500/60'
              }`}
              aria-pressed={mode === 'baseline'}
            >
              Compare vs Fair Baseline
            </button>
            <button
              id="compare-mode-upload"
              type="button"
              onClick={() => setMode('upload')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
                mode === 'upload'
                  ? 'bg-amber-500 text-slate-950 border-amber-400'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-amber-500/60'
              }`}
              aria-pressed={mode === 'upload'}
            >
              Upload Second Document
            </button>
          </div>

          {mode === 'upload' && (
            <p className="text-xs text-slate-400 italic">
              Second-document upload coming soon. Use fair baseline mode to compare now.
            </p>
          )}
        </div>

        <button
          id="run-compare-btn"
          type="button"
          onClick={handleCompare}
          disabled={isLoading || clauses.length === 0}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs transition-colors flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-busy={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              Running Comparison...
            </>
          ) : (
            <>
              <Scale className="w-4 h-4" aria-hidden="true" />
              Run Comparison
            </>
          )}
        </button>

        {error && (
          <div role="alert" className="p-3 rounded-lg bg-rose-950/80 border border-rose-500 text-rose-200 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
            {error}
          </div>
        )}
      </div>

      {/* Results Table */}
      {result && (
        <div className="space-y-4">
          {/* Summary Banner */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                Comparison Complete — {result.items.length} clause pairs analysed
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{result.summary}</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono shrink-0">
              <div className="text-center">
                <div className="text-lg font-extrabold text-amber-400">{scoreForPersona.docA}</div>
                <div className="text-slate-400">Your Doc Wins</div>
              </div>
              <div className="text-slate-600 font-bold">vs</div>
              <div className="text-center">
                <div className="text-lg font-extrabold text-emerald-400">{scoreForPersona.docB}</div>
                <div className="text-slate-400">Baseline Wins</div>
              </div>
            </div>
          </div>

          {/* Comparison Rows */}
          <div className="space-y-3" role="list" aria-label="Clause comparison results">
            {result.items.map((item, idx) => {
              const statusStyle = STATUS_BADGE[item.status as ItemStatus] ?? STATUS_BADGE.different;
              return (
                <article
                  key={idx}
                  role="listitem"
                  className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 shadow"
                >
                  {/* Row header */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${statusStyle.className}`}
                      >
                        {statusStyle.label}
                      </span>
                      <span className="text-xs font-bold text-white">{item.title}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-300">
                      {BETTER_ICON[item.betterForPersona as BetterFor]}
                      <span>
                        Better for you: <strong className="text-white">{BETTER_LABEL[item.betterForPersona as BetterFor]}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Two-column comparison */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                      <div className="text-[10px] font-bold uppercase text-amber-300 tracking-wider">Your Document</div>
                      <p className="text-slate-200 leading-relaxed">{item.docAPosition}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                      <div className="text-[10px] font-bold uppercase text-emerald-300 tracking-wider">Fair Baseline</div>
                      <p className="text-slate-200 leading-relaxed">{item.docBPosition}</p>
                    </div>
                  </div>

                  {/* Why */}
                  <p className="text-xs text-slate-400 leading-relaxed border-t border-slate-800 pt-2">
                    <span className="font-semibold text-slate-300">Why it matters: </span>
                    {item.why}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
