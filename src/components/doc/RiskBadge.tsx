import React from 'react';
import { ShieldCheck, Eye, AlertCircle, AlertOctagon } from 'lucide-react';
import { RiskBand } from '@/types';

interface RiskBadgeProps {
  band: RiskBand;
  score?: number;
}

export function RiskBadge({ band, score }: RiskBadgeProps) {
  const configs: Record<
    RiskBand,
    { label: string; icon: React.ComponentType<{ className?: string }>; style: string }
  > = {
    standard: {
      label: 'Standard',
      icon: ShieldCheck,
      style: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    },
    'worth-a-look': {
      label: 'Worth A Look',
      icon: Eye,
      style: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    },
    negotiate: {
      label: 'Negotiate This',
      icon: AlertCircle,
      style: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    },
    'get-advice': {
      label: 'Get Legal Advice',
      icon: AlertOctagon,
      style: 'bg-rose-500/10 text-rose-400 border-rose-500/30 font-bold',
    },
  };

  const config = configs[band] || configs.standard;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-medium ${config.style}`}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      <span>{config.label}</span>
      {score !== undefined && (
        <span className="opacity-80 font-mono text-[11px]">({score}/100)</span>
      )}
    </span>
  );
}
