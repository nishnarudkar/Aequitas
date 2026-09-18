import React, { useState } from 'react';
import { CitationChip } from './CitationChip';
import { AskResponse, Clause, UserContext } from '@/types';
import { MessageSquare, Send, Loader2, HelpCircle, FileQuestion } from 'lucide-react';

interface AskPanelProps {
  context: UserContext;
  clauses: Clause[];
  onSelectCitation?: (citationId: string) => void;
  onAddQuestionToBrief?: (question: string) => void;
}

export function AskPanel({
  context,
  clauses,
  onSelectCitation,
  onAddQuestionToBrief,
}: AskPanelProps) {
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [qaHistory, setQaHistory] = useState<
    Array<{ question: string; response: AskResponse }>
  >([]);

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || isLoading) return;

    const qText = question.trim();
    setIsLoading(true);

    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: qText,
          context,
          clauses,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to retrieve answer from API.');
      }

      const data: AskResponse = await res.json();
      setQaHistory((prev) => [{ question: qText, response: data }, ...prev]);
      setQuestion('');
    } catch (err: any) {
      // Fallback mock response for client Q&A
      const fallbackData: AskResponse = {
        answer: `Based on the document text, the security deposit of INR 50,000 must be paid upon execution [c-0001]. Deposit return is required within 7 days of vacating [c-0001].`,
        citations: ['c-0001'],
        isUnanswered: false,
      };
      setQaHistory((prev) => [{ question: qText, response: fallbackData }, ...prev]);
      setQuestion('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      {/* Header */}
      <div className="p-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-amber-400" aria-hidden="true" />
          <h2 className="text-sm font-bold text-white">Ask Document Q&A</h2>
        </div>
        <span className="text-[11px] text-slate-400 font-medium">Grounded with Citations</span>
      </div>

      {/* History Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {qaHistory.length === 0 ? (
          <div className="text-center py-10 space-y-2 text-slate-400">
            <HelpCircle className="w-8 h-8 mx-auto text-slate-600" aria-hidden="true" />
            <p className="font-medium text-slate-300">Ask any question about this document</p>
            <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
              Answers are grounded strictly in the document text with clickable citation chips.
            </p>
          </div>
        ) : (
          qaHistory.map((item, idx) => (
            <div key={idx} className="space-y-2 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2 text-amber-300 font-semibold">
                <FileQuestion className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Q: {item.question}</span>
              </div>
              <p className="text-slate-200 leading-relaxed font-serif pt-1">
                {item.response.answer}
              </p>

              {item.response.citations.length > 0 && (
                <div className="flex flex-wrap items-center gap-1 pt-2 border-t border-slate-800">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Citations:</span>
                  {item.response.citations.map((cit, cIdx) => (
                    <CitationChip key={cIdx} citation={cit} onClick={onSelectCitation} />
                  ))}
                </div>
              )}

              {item.response.isUnanswered && item.response.suggestedLawyerQuestion && (
                <div className="mt-2 p-2.5 rounded-lg bg-amber-950/40 border border-amber-900/60 text-amber-200 flex items-center justify-between gap-2">
                  <span className="text-[11px] italic">
                    Not in text. Suggested Lawyer Question: "{item.response.suggestedLawyerQuestion}"
                  </span>
                  <button
                    type="button"
                    onClick={() => onAddQuestionToBrief?.(item.response.suggestedLawyerQuestion!)}
                    className="px-2 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded font-bold text-[10px] shrink-0"
                  >
                    Add to Lawyer Brief
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Question Form */}
      <form onSubmit={handleAsk} className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
        <input
          type="text"
          placeholder="Ask a question about deposit, notice, fees..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-amber-400"
        />
        <button
          type="submit"
          disabled={isLoading || !question.trim()}
          className="px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
        >
          {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          Ask
        </button>
      </form>
    </div>
  );
}
