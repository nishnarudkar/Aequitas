'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DocumentViewer } from '@/components/doc/DocumentViewer';
import { ClauseCard } from '@/components/doc/ClauseCard';
import { EscalationBanner } from '@/components/safety/EscalationBanner';
import { AskPanel } from '@/components/qa/AskPanel';
import { CompareView } from '@/components/compare/CompareView';
import { AnalyzeResponse, Clause, ParseResponse, UserContext } from '@/types';
import { Loader2, ArrowLeft, ShieldAlert, FileText, AlertTriangle, Scale } from 'lucide-react';

export default function AnalysisWorkspacePage() {
  const router = useRouter();

  const [context, setContext] = useState<UserContext | null>(null);
  const [analysis, setAnalysis] = useState<AnalyzeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [focusedClauseId, setFocusedClauseId] = useState<string | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<'analysis' | 'compare'>('analysis');
  const [documentTitle, setDocumentTitle] = useState('Uploaded Contract');

  useEffect(() => {
    const storedContext = sessionStorage.getItem('aequitas_context');
    const storedParse = sessionStorage.getItem('aequitas_parse');
    const rawText = sessionStorage.getItem('aequitas_raw_text') || '';

    if (!storedContext || !storedParse) {
      // Fallback mock fixture for direct navigation
      const defaultCtx: UserContext = {
        persona: 'tenant',
        jurisdiction: 'MH',
        goal: 'understand',
        language: 'en',
        readingLevel: 'standard',
      };
      setContext(defaultCtx);
      runAnalysis(defaultCtx, null, rawText);
      return;
    }

    try {
      const parsedCtx: UserContext = JSON.parse(storedContext);
      const parsedDoc: ParseResponse = JSON.parse(storedParse);
      setContext(parsedCtx);
      if (parsedDoc.detectedType) {
        setDocumentTitle(`${parsedDoc.detectedType} Contract`);
      }
      runAnalysis(parsedCtx, parsedDoc, rawText);
    } catch (err: any) {
      setError('Failed to load session data.');
      setIsLoading(false);
    }
  }, []);

  const runAnalysis = async (
    ctx: UserContext,
    doc: ParseResponse | null,
    textPayload: string
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const clauses: Clause[] = doc ? doc.clauses : [];
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textPayload || 'Leave & Licence agreement text for tenant in Mumbai.',
          clauses,
          context: ctx,
          documentType: doc?.detectedType,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to run document analysis.');
      }

      const data: AnalyzeResponse = await res.json();
      setAnalysis(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred during analysis execution.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectClause = (clauseId: string) => {
    setFocusedClauseId(clauseId);
    const element = document.getElementById(`doc-clause-${clauseId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-4">
        <Loader2 className="w-10 h-10 text-amber-400 animate-spin" />
        <h2 className="text-lg font-bold text-white">Analyzing Document...</h2>
        <p className="text-xs text-slate-400 max-w-sm text-center">
          Executing Context Engine rules, deterministic clause detectors, and persona risk calculations.
        </p>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="flex-1 p-8 max-w-xl mx-auto flex flex-col items-center justify-center space-y-4 text-center">
        <AlertTriangle className="w-12 h-12 text-rose-500" />
        <h2 className="text-lg font-bold text-white">Analysis Failed</h2>
        <p className="text-xs text-slate-300">{error || 'Unable to generate analysis results.'}</p>
        <button
          type="button"
          onClick={() => router.push('/')}
          className="px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-lg text-xs"
        >
          Return to Intake
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-6 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-xl border border-slate-800 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push('/')}
            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            title="Return to Intake"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base text-white capitalize">
                {analysis.plan.documentType} Contract Analysis
              </span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                {context?.persona} | {context?.jurisdiction}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Goal: {context?.goal} | {analysis.clauses.length} Clauses Inspected
            </p>
          </div>
        </div>

        {/* Rationale Badge */}
        <div className="text-right text-xs">
          <span className="text-slate-400 block font-semibold">Context Engine Rationale:</span>
          <span className="text-amber-300 font-mono text-[11px] block truncate max-w-md">
            {analysis.plan.rationale[0]}
          </span>
        </div>
      </div>

      {/* Escalation Emergency Banner if triggered */}
      {analysis.plan.escalation.triggered && (
        <EscalationBanner escalation={analysis.plan.escalation} />
      )}

      {/* Tab Bar */}
      <div className="flex items-center gap-1 bg-slate-900/70 border border-slate-800 rounded-xl p-1 w-fit" role="tablist" aria-label="Analysis views">
        <button
          id="tab-analysis"
          role="tab"
          aria-selected={activeTab === 'analysis'}
          aria-controls="panel-analysis"
          type="button"
          onClick={() => setActiveTab('analysis')}
          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'analysis'
              ? 'bg-amber-500 text-slate-950 shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" aria-hidden="true" />
          Analysis
        </button>
        <button
          id="tab-compare"
          role="tab"
          aria-selected={activeTab === 'compare'}
          aria-controls="panel-compare"
          type="button"
          onClick={() => setActiveTab('compare')}
          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'compare'
              ? 'bg-amber-500 text-slate-950 shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Scale className="w-3.5 h-3.5" aria-hidden="true" />
          Compare
        </button>
      </div>

      {/* Main 3-Pane Responsive Layout — Analysis Tab */}
      {activeTab === 'analysis' && (
      <div id="panel-analysis" role="tabpanel" aria-labelledby="tab-analysis" className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-[600px]">
        {/* Pane 1: Document Viewer */}
        <div className="lg:col-span-4 h-[600px] lg:h-auto">
          <DocumentViewer
            clauses={analysis.clauses}
            risks={analysis.synthesis.topRisks}
            focusedClauseId={focusedClauseId}
            onSelectClause={handleSelectClause}
          />
        </div>

        {/* Pane 2: Analysis Feed */}
        <div className="lg:col-span-5 space-y-6 overflow-y-auto max-h-[750px] pr-1">
          {/* Summary Card */}
          <section className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 shadow-lg">
            <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Plain Language Summary
            </h2>
            <p className="text-xs text-slate-200 leading-relaxed font-serif">
              {analysis.synthesis.summary}
            </p>
          </section>

          {/* Top Risks Feed */}
          <section className="space-y-3">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              Key Clause Risks ({analysis.synthesis.topRisks.length})
            </h2>
            <div className="space-y-3">
              {analysis.synthesis.topRisks.map((risk) => {
                const clause = analysis.clauses.find((c) => c.id === risk.clauseId) || {
                  id: risk.clauseId,
                  heading: risk.heading,
                  text: '',
                  startOffset: 0,
                  endOffset: 0,
                };
                return (
                  <ClauseCard
                    key={risk.clauseId}
                    clause={clause}
                    risk={risk}
                    isFocused={risk.clauseId === focusedClauseId}
                    onFocus={() => handleSelectClause(risk.clauseId)}
                  />
                );
              })}
            </div>
          </section>

          {/* Missing Clauses Card */}
          {analysis.missingClauses.length > 0 && (
            <section className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 shadow-lg">
              <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Missing Protective Clauses ({analysis.missingClauses.length})
              </h2>
              <div className="space-y-3 text-xs">
                {analysis.missingClauses.map((mc, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200">{mc.title}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-900 uppercase">
                        {mc.importance} Importance
                      </span>
                    </div>
                    <p className="text-slate-400">{mc.explanation}</p>
                    {mc.suggestedClause && (
                      <p className="text-emerald-300 font-serif text-[11px] pt-1">
                        <strong>Suggested Addition:</strong> {mc.suggestedClause}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Pane 3: Ask Q&A Panel */}
        <div className="lg:col-span-3 h-[600px] lg:h-auto">
          <AskPanel
            context={context!}
            clauses={analysis.clauses}
            onSelectCitation={handleSelectClause}
          />
        </div>
      </div>
      )}

      {/* Compare Tab Panel */}
      {activeTab === 'compare' && (
        <div id="panel-compare" role="tabpanel" aria-labelledby="tab-compare" className="max-w-4xl mx-auto w-full">
          <CompareView
            clauses={analysis.clauses}
            context={context!}
            documentTitle={documentTitle}
          />
        </div>
      )}
    </div>
  );
}
