'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CompareView } from '@/components/compare/CompareView';
import { Clause, ParseResponse, UserContext } from '@/types';
import { ArrowLeft, Scale } from 'lucide-react';

export default function ComparePage() {
  const router = useRouter();
  const [context, setContext] = useState<UserContext | null>(null);
  const [clauses, setClauses] = useState<Clause[]>([]);
  const [documentTitle, setDocumentTitle] = useState('Uploaded Contract');

  useEffect(() => {
    const storedContext = sessionStorage.getItem('aequitas_context');
    const storedParse = sessionStorage.getItem('aequitas_parse');

    if (storedContext && storedParse) {
      try {
        const parsedCtx: UserContext = JSON.parse(storedContext);
        const parsedDoc: ParseResponse = JSON.parse(storedParse);
        setContext(parsedCtx);
        setClauses(parsedDoc.clauses || []);
        if (parsedDoc.detectedType) {
          setDocumentTitle(`${parsedDoc.detectedType} Contract`);
        }
      } catch (e) {
        console.error('Failed to parse session storage in compare page:', e);
      }
    } else {
      // Default fallback context
      const defaultCtx: UserContext = {
        persona: 'tenant',
        jurisdiction: 'MH',
        goal: 'negotiate',
        language: 'en',
        readingLevel: 'standard',
      };
      setContext(defaultCtx);
      setClauses([
        {
          id: 'c-0001',
          heading: 'Security Deposit',
          text: 'The Licensee shall pay a security deposit of INR 50,000. Refund shall occur within 30 days post vacating after deductions for damages.',
          startOffset: 0,
          endOffset: 120,
        },
        {
          id: 'c-0002',
          heading: 'Lock-in Period',
          text: 'The agreement has a mandatory 6-month lock-in period. Exit prior to 6 months forfeits deposit.',
          startOffset: 121,
          endOffset: 220,
        },
      ]);
    }
  }, []);

  if (!context) {
    return null;
  }

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-6 space-y-6 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-xl border border-slate-800 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push('/analyze')}
            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            title="Return to Workspace"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-base font-extrabold text-white flex items-center gap-2">
              <Scale className="w-4 h-4 text-amber-400" />
              Contract Comparison Matrix
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Compare your contract ({documentTitle}) against market baselines or a second contract.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
        <CompareView
          clauses={clauses}
          context={context}
          documentTitle={documentTitle}
        />
      </div>
    </div>
  );
}
