import React from 'react';
import { Bookmark } from 'lucide-react';

interface CitationChipProps {
  citation: string;
  onClick?: (citation: string) => void;
}

export function CitationChip({ citation, onClick }: CitationChipProps) {
  const cleanId = citation.replace(/^\[|\]$/g, '');

  return (
    <button
      type="button"
      onClick={() => onClick?.(cleanId)}
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-mono font-bold transition-all focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer my-0.5 mx-0.5"
    >
      <Bookmark className="w-3 h-3" aria-hidden="true" />
      <span>{cleanId}</span>
    </button>
  );
}
