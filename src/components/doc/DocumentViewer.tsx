import React, { useState } from 'react';
import { Clause, ScoredRisk } from '@/types';
import { Search, FileText } from 'lucide-react';

interface DocumentViewerProps {
  clauses: Clause[];
  risks?: ScoredRisk[];
  focusedClauseId?: string;
  onSelectClause?: (clauseId: string) => void;
}

export function DocumentViewer({
  clauses,
  risks = [],
  focusedClauseId,
  onSelectClause,
}: DocumentViewerProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const riskMap = new Map<string, ScoredRisk>();
  risks.forEach((r) => riskMap.set(r.clauseId, r));

  const filteredClauses = clauses.filter(
    (c) =>
      c.heading.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      {/* Search Header */}
      <div className="p-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-amber-400" aria-hidden="true" />
          <h2 className="text-sm font-bold text-white">Document Viewer</h2>
          <span className="text-xs text-slate-400 font-mono">({clauses.length} clauses)</span>
        </div>

        <div className="relative w-48 sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" aria-hidden="true" />
          <input
            type="text"
            placeholder="Search clauses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-md pl-8 pr-3 py-1 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>

      {/* Clauses Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans text-xs leading-relaxed">
        {filteredClauses.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            No clauses match your search term.
          </div>
        ) : (
          filteredClauses.map((clause) => {
            const isFocused = clause.id === focusedClauseId;
            const risk = riskMap.get(clause.id);

            let borderStyle = 'border-slate-800 bg-slate-950/60';
            if (isFocused) {
              borderStyle = 'border-amber-500 bg-amber-950/20 ring-1 ring-amber-500/50';
            } else if (risk) {
              if (risk.band === 'get-advice') borderStyle = 'border-rose-950 bg-rose-950/10 hover:border-rose-700';
              else if (risk.band === 'negotiate') borderStyle = 'border-orange-950 bg-orange-950/10 hover:border-orange-700';
              else if (risk.band === 'worth-a-look') borderStyle = 'border-amber-950 bg-amber-950/10 hover:border-amber-700';
            }

            return (
              <article
                key={clause.id}
                id={`doc-clause-${clause.id}`}
                tabIndex={0}
                onClick={() => onSelectClause?.(clause.id)}
                className={`p-4 rounded-xl border transition-all ${borderStyle} cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-400`}
              >
                <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-slate-800/60">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-amber-400 bg-slate-900 border border-slate-700 px-2 py-0.5 rounded">
                      {clause.id}
                    </span>
                    <h3 className="font-bold text-sm text-slate-200">{clause.heading}</h3>
                  </div>
                  {clause.pageHint && (
                    <span className="text-[10px] text-slate-400 font-mono">Page {clause.pageHint}</span>
                  )}
                </div>
                <p className="text-slate-300 font-serif whitespace-pre-wrap">{clause.text}</p>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}
