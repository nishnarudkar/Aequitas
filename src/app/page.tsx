'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ContextWizard } from '@/components/intake/ContextWizard';
import { ParseResponse, UserContext } from '@/types';
import { Upload, FileText, AlertCircle, ArrowRight, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { createAnalysisPlan } from '@/lib/context/router';

export default function LandingPage() {
  const router = useRouter();

  const [context, setContext] = useState<UserContext>({
    persona: 'tenant',
    jurisdiction: 'MH',
    goal: 'understand',
    language: 'en',
    readingLevel: 'standard',
  });

  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [rawText, setRawText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [parseResult, setParseResult] = useState<ParseResponse | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setParseResult(null);
      setParseError(null);
    }
  };

  const handleParseDocument = async () => {
    setIsParsing(true);
    setParseError(null);
    setParseResult(null);

    try {
      let res: Response;

      if (activeTab === 'upload' && file) {
        const formData = new FormData();
        formData.append('file', file);
        res = await fetch('/api/parse', {
          method: 'POST',
          body: formData,
        });
      } else if (activeTab === 'paste' && rawText.trim().length > 0) {
        res = await fetch('/api/parse', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: rawText }),
        });
      } else {
        setParseError('Please select a file or paste document text to analyze.');
        setIsParsing(false);
        return;
      }

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to parse document.');
      }

      const data: ParseResponse = await res.json();
      setParseResult(data);
    } catch (err: any) {
      setParseError(err.message || 'An unexpected error occurred during document parsing.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleProceedToAnalysis = () => {
    if (!parseResult) return;

    // Store in sessionStorage
    sessionStorage.setItem('aequitas_context', JSON.stringify(context));
    sessionStorage.setItem('aequitas_parse', JSON.stringify(parseResult));
    sessionStorage.setItem('aequitas_raw_text', rawText || '');

    router.push('/analyze');
  };

  // Preview plan rationale
  const planPreview = parseResult
    ? createAnalysisPlan(context, parseResult.detectedType as any)
    : createAnalysisPlan(context);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 flex-1">
      {/* Title Header */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Equal footing in every agreement.
        </h1>
        <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
          Paste or upload any contract to receive a plain-language summary, clause risk flags, answer grounded Q&A, and a printable lawyer brief.
        </p>
      </div>

      {/* 3-Question Intake Wizard */}
      <ContextWizard context={context} onChange={setContext} />

      {/* Document Upload / Paste Area */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <label className="text-sm font-bold tracking-wide uppercase text-slate-300 flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-400" aria-hidden="true" />
            Step 4: Provide Document
          </label>
          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                activeTab === 'upload' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Upload File (PDF/DOCX/TXT)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('paste')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                activeTab === 'paste' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Paste Text
            </button>
          </div>
        </div>

        {activeTab === 'upload' ? (
          <div className="border-2 border-dashed border-slate-700 hover:border-amber-500/60 rounded-xl p-8 text-center bg-slate-950/40 transition-colors">
            <Upload className="w-10 h-10 mx-auto text-amber-400 mb-3" aria-hidden="true" />
            <p className="text-sm font-semibold text-slate-200 mb-1">
              Select contract file to upload
            </p>
            <p className="text-xs text-slate-400 mb-4">
              Supports PDF, DOCX, and TXT files (Max 10 MB). Zero disk storage.
            </p>
            <input
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload-input"
            />
            <label
              htmlFor="file-upload-input"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 text-slate-950 hover:bg-amber-400 font-bold text-xs cursor-pointer transition-colors shadow-lg shadow-amber-500/10"
            >
              Browse Computer
            </label>

            {file && (
              <div className="mt-4 p-3 bg-slate-800/80 rounded-lg inline-flex items-center gap-3 text-xs text-slate-200 border border-slate-700">
                <FileText className="w-4 h-4 text-amber-400" />
                <span className="font-semibold truncate max-w-xs">{file.name}</span>
                <span className="text-slate-400 font-mono">({(file.size / 1024).toFixed(1)} KB)</span>
              </div>
            )}
          </div>
        ) : (
          <div>
            <textarea
              rows={8}
              placeholder="Paste full contract text here..."
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-serif text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 leading-relaxed"
            />
          </div>
        )}

        {/* Parse Button & Status */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <button
            type="button"
            onClick={handleParseDocument}
            disabled={isParsing || (activeTab === 'upload' && !file) || (activeTab === 'paste' && !rawText.trim())}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs transition-colors flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isParsing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                Parsing Document...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" aria-hidden="true" />
                Parse & Inspect Document
              </>
            )}
          </button>
        </div>

        {/* Error Alert */}
        {parseError && (
          <div role="alert" className="p-4 rounded-xl bg-rose-950/80 border border-rose-500 text-rose-200 text-xs flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" aria-hidden="true" />
            <p>{parseError}</p>
          </div>
        )}

        {/* Scanned Image PDF Alert */}
        {parseResult?.isScanned && (
          <div role="alert" className="p-4 rounded-xl bg-amber-950/80 border border-amber-500 text-amber-200 text-xs flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-amber-400" aria-hidden="true" />
            <div>
              <h4 className="font-bold">Scanned Image PDF Detected</h4>
              <p className="mt-0.5">
                This document looks like a scanned image. Aequitas cannot read image pixels yet — please copy and paste the text directly into the &quot;Paste Text&quot; tab above.
              </p>
            </div>
          </div>
        )}

        {/* Parse Result Summary & Generated Plan Preview */}
        {parseResult && !parseResult.isScanned && (
          <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4" />
                Document Parsed Successfully
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {parseResult.clauses.length} Clauses | {parseResult.wordCount} Words
              </span>
            </div>

            {/* Generated Plan Explanation */}
            <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Generated Analysis Plan Reasoning:
              </h4>
              <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                {planPreview.rationale.map((r, idx) => (
                  <li key={idx}>{r}</li>
                ))}
              </ul>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={handleProceedToAnalysis}
                className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs transition-colors flex items-center gap-2 shadow-lg shadow-emerald-500/20"
              >
                Proceed to Full Analysis Workspace <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
