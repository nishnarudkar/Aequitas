'use client';

import React from 'react';
import { ActionItem } from '@/types';
import { CheckSquare, Circle, AlertCircle, Clock } from 'lucide-react';

interface ChecklistProps {
  items: ActionItem[];
}

const PRIORITY_STYLE: Record<string, { icon: React.ReactNode; badge: string; border: string }> = {
  high: {
    icon: <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" aria-hidden="true" />,
    badge: 'bg-rose-950 text-rose-300 border-rose-900',
    border: 'border-l-rose-500',
  },
  medium: {
    icon: <Circle className="w-3.5 h-3.5 text-amber-400 shrink-0" aria-hidden="true" />,
    badge: 'bg-amber-950 text-amber-300 border-amber-900',
    border: 'border-l-amber-500',
  },
  low: {
    icon: <Circle className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />,
    badge: 'bg-slate-800 text-slate-300 border-slate-700',
    border: 'border-l-slate-600',
  },
};

export function Checklist({ items }: ChecklistProps) {
  if (items.length === 0) {
    return (
      <p className="text-xs text-slate-400 italic">No action items generated.</p>
    );
  }

  // Group by category
  const grouped = items.reduce<Record<string, ActionItem[]>>((acc, item) => {
    const cat = item.category ?? 'General';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  return (
    <section aria-label="Action checklist" className="space-y-5">
      <div className="flex items-center gap-2">
        <CheckSquare className="w-4 h-4 text-amber-400" aria-hidden="true" />
        <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wider">
          Action Checklist ({items.length} items)
        </h2>
      </div>

      {Object.entries(grouped).map(([category, categoryItems]) => (
        <div key={category} className="space-y-2">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 pl-1">
            {category}
          </h3>
          <ol className="space-y-2 list-none">
            {categoryItems.map((item) => {
              const style = PRIORITY_STYLE[item.priority] ?? PRIORITY_STYLE.low!;
              return (
                <li
                  key={item.id}
                  className={`flex items-start gap-3 p-3 rounded-lg bg-slate-900 border border-slate-800 border-l-4 ${style.border} text-xs`}
                >
                  {style.icon}
                  <div className="flex-1 min-w-0 space-y-1">
                    <p className="text-slate-200 font-medium leading-snug">{item.action}</p>
                    {item.timeline && (
                      <div className="flex items-center gap-1 text-[11px] text-slate-400">
                        <Clock className="w-3 h-3" aria-hidden="true" />
                        {item.timeline}
                      </div>
                    )}
                  </div>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase shrink-0 ${style.badge}`}
                    aria-label={`${item.priority} priority`}
                  >
                    {item.priority}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      ))}
    </section>
  );
}
