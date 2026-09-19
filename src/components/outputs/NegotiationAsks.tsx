'use client';

import React, { useState } from 'react';
import { NegotiationAsk } from '@/types';
import { MessageSquarePlus, ChevronDown, ChevronUp, Pencil } from 'lucide-react';

interface NegotiationAsksProps {
  asks: NegotiationAsk[];
}

export function NegotiationAsks({ asks }: NegotiationAsksProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (asks.length === 0) {
    return (
      <p className="text-xs text-slate-400 italic">
        No negotiation asks generated. This contract may not have high-risk clauses for your
        persona, or try a different goal (e.g. &quot;negotiate&quot;).
      </p>
    );
  }

  return (
    <section aria-label="Negotiation asks" className="space-y-4">
      <div className="flex items-center gap-2">
        <MessageSquarePlus className="w-4 h-4 text-amber-400" aria-hidden="true" />
        <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wider">
          Negotiation Asks ({asks.length})
        </h2>
      </div>

      <p className="text-xs text-slate-400 leading-relaxed">
        These are suggested talking points to raise with the other party. They are not legal
        advice — consult a lawyer before using any wording in formal correspondence.
      </p>

      <ol className="space-y-3 list-none">
        {asks.map((ask, idx) => {
          const isOpen = expandedId === ask.id;
          return (
            <li key={ask.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              {/* Header */}
              <button
                id={`ask-toggle-${ask.id}`}
                type="button"
                aria-expanded={isOpen}
                aria-controls={`ask-body-${ask.id}`}
                onClick={() => setExpandedId(isOpen ? null : ask.id)}
                className="w-full flex items-center justify-between gap-3 p-4 text-left hover:bg-slate-800/60 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-amber-500/10 border border-amber-500/30 text-[10px] font-extrabold text-amber-300">
                    {idx + 1}
                  </span>
                  <span className="text-xs font-semibold text-slate-200 truncate">
                    {ask.currentIssue}
                  </span>
                </div>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />
                )}
              </button>

              {/* Expandable body */}
              {isOpen && (
                <div
                  id={`ask-body-${ask.id}`}
                  role="region"
                  aria-labelledby={`ask-toggle-${ask.id}`}
                  className="px-4 pb-4 space-y-3 border-t border-slate-800 pt-3"
                >
                  {/* Proposed wording */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                      <Pencil className="w-3 h-3" aria-hidden="true" />
                      Suggested Wording
                    </div>
                    <blockquote className="text-xs text-emerald-200 font-serif leading-relaxed bg-emerald-950/30 border border-emerald-900/50 rounded-lg p-3 italic">
                      &ldquo;{ask.proposedWording}&rdquo;
                    </blockquote>
                  </div>

                  {/* Rationale */}
                  <div className="space-y-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Why request this
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{ask.rationale}</p>
                  </div>

                  {ask.targetClauseId && (
                    <p className="text-[11px] text-slate-500 font-mono">
                      Targets clause: {ask.targetClauseId}
                    </p>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
