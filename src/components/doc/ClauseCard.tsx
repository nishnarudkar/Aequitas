import React from 'react';
import { RiskBadge } from './RiskBadge';
import { Clause, ScoredRisk, SingleClauseAnalysis } from '@/types';
import { AlertTriangle, Lightbulb } from 'lucide-react';

interface ClauseCardProps {
  clause: Clause;
  analysis?: SingleClauseAnalysis;
  risk?: ScoredRisk;
  isFocused?: boolean;
  onFocus?: () => void;
}

export function ClauseCard({ clause, analysis, risk, isFocused, onFocus }: ClauseCardProps) {
  return (
    <div
      id={`clause-card-${clause.id}`}
      tabIndex={0}
      onClick={onFocus}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onFocus?.();
        }
      }}
      className={`p-4 rounded-xl border transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-400 ${
        isFocused
          ? 'bg-slate-800 border-amber-500 shadow-lg ring-1 ring-amber-500/50'
          : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded">
            {clause.id}
          </span>
          <h3 className="font-bold text-sm text-slate-100 line-clamp-1">{clause.heading}</h3>
        </div>
        {risk && <RiskBadge band={risk.band} score={risk.score} />}
      </div>

      {analysis && (
        <div className="mt-3 space-y-2.5 text-xs text-slate-300">
          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
            <span className="font-semibold text-slate-400 block mb-1">Plain Language Meaning:</span>
            <p className="text-slate-200 leading-relaxed font-medium">{analysis.plainMeaning}</p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="bg-slate-800/50 p-2 rounded border border-slate-700/50">
              <span className="text-slate-400 font-semibold block">Obligated Party:</span>
              <span className="text-slate-200 font-bold">{analysis.whoIsObligated}</span>
            </div>
            <div className="bg-slate-800/50 p-2 rounded border border-slate-700/50">
              <span className="text-slate-400 font-semibold block">Clause Type:</span>
              <span className="text-amber-300 font-mono capitalize">{analysis.type}</span>
            </div>
          </div>

          {analysis.watchFor && (
            <div className="flex items-start gap-1.5 text-amber-300/90 bg-amber-950/30 p-2 rounded border border-amber-900/40 text-[11px]">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" aria-hidden="true" />
              <span><strong>Watch Out:</strong> {analysis.watchFor}</span>
            </div>
          )}

          {analysis.suggestedAsk && (
            <div className="flex items-start gap-1.5 text-emerald-300 bg-emerald-950/30 p-2 rounded border border-emerald-900/40 text-[11px]">
              <Lightbulb className="w-3.5 h-3.5 shrink-0 mt-0.5 text-emerald-400" aria-hidden="true" />
              <span><strong>Suggested Ask:</strong> {analysis.suggestedAsk}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
