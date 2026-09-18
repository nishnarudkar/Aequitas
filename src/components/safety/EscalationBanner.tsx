import React from 'react';
import { AlertTriangle, PhoneCall, ExternalLink, ShieldAlert } from 'lucide-react';
import { EscalationDecision } from '@/types';

interface EscalationBannerProps {
  escalation: EscalationDecision;
}

export function EscalationBanner({ escalation }: EscalationBannerProps) {
  if (!escalation.triggered || escalation.level === 'none') {
    return null;
  }

  const isCritical = escalation.level === 'critical';

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`w-full p-5 mb-6 rounded-xl border ${
        isCritical
          ? 'bg-rose-950/90 border-rose-500 text-rose-100 shadow-rose-900/30'
          : 'bg-amber-950/90 border-amber-500 text-amber-100 shadow-amber-900/30'
      } shadow-xl backdrop-blur-sm transition-all`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`p-2.5 rounded-lg shrink-0 ${
            isCritical ? 'bg-rose-900/80 text-rose-300' : 'bg-amber-900/80 text-amber-300'
          }`}
        >
          {isCritical ? (
            <ShieldAlert className="w-6 h-6 animate-pulse" aria-hidden="true" />
          ) : (
            <AlertTriangle className="w-6 h-6" aria-hidden="true" />
          )}
        </div>

        <div className="flex-1 space-y-3">
          <div>
            <h2 className="text-lg font-bold tracking-wide flex items-center gap-2">
              {isCritical ? 'Emergency Crisis Support Required' : 'Legal Emergency Triggered'}
            </h2>
            <p className="text-sm mt-1 leading-relaxed opacity-95">
              {escalation.rationale}
            </p>
          </div>

          {escalation.triggers.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {escalation.triggers.map((trigger, idx) => (
                <span
                  key={idx}
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                    isCritical
                      ? 'bg-rose-900/50 border-rose-700 text-rose-200'
                      : 'bg-amber-900/50 border-amber-700 text-amber-200'
                  }`}
                >
                  {trigger}
                </span>
              ))}
            </div>
          )}

          <div className="pt-2 border-t border-white/10">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2.5">
              Immediate Contact Resources:
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {escalation.resources.map((res) => (
                <div
                  key={res.id}
                  className="p-3 rounded-lg bg-black/30 border border-white/10 flex flex-col justify-between"
                >
                  <div>
                    <span className="text-xs font-semibold text-amber-300">{res.scope}</span>
                    <h4 className="text-sm font-bold text-white mt-0.5">{res.name}</h4>
                    <p className="text-xs text-slate-300 mt-1 line-clamp-2">{res.description}</p>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-2 text-xs font-medium border-t border-white/10 pt-2">
                    <span className="inline-flex items-center gap-1.5 text-amber-400 font-bold">
                      <PhoneCall className="w-3.5 h-3.5" aria-hidden="true" />
                      {res.contact}
                    </span>
                    <a
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-slate-300 hover:text-white underline underline-offset-2"
                    >
                      Visit site <ExternalLink className="w-3 h-3" aria-hidden="true" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
