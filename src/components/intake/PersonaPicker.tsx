import React from 'react';
import { Home, Briefcase, UserCheck, ShieldCheck, Landmark } from 'lucide-react';
import { Persona } from '@/types';

interface PersonaOption {
  id: Persona;
  title: string;
  subtitle: string;
  documents: string;
  fears: string;
  icon: React.ComponentType<{ className?: string }>;
}

const PERSONA_OPTIONS: PersonaOption[] = [
  {
    id: 'tenant',
    title: 'Home Tenant',
    subtitle: 'Renting an apartment or house',
    documents: 'Leave & Licence, Rent Agreement, Society NOC',
    fears: 'Deposit forfeiture, sudden eviction, lock-in penalty',
    icon: Home,
  },
  {
    id: 'freelancer',
    title: 'Freelancer / Consultant',
    subtitle: 'Independent service provider',
    documents: 'Service Agreement, SOW, NDA, MSA',
    fears: 'Delayed/non-payment, unlimited liability, IP loss',
    icon: Briefcase,
  },
  {
    id: 'employee',
    title: 'Salaried Employee',
    subtitle: 'Job applicant or working professional',
    documents: 'Offer Letter, Employment Contract, Bond',
    fears: 'Long notice period, training bond penalty, non-compete',
    icon: UserCheck,
  },
  {
    id: 'consumer',
    title: 'Consumer / Buyer',
    subtitle: 'App user, service subscriber or buyer',
    documents: 'T&C, Privacy Policy, Warranty, Insurance',
    fears: 'Data sharing, auto-renewal trap, arbitration waiver',
    icon: ShieldCheck,
  },
  {
    id: 'borrower',
    title: 'Borrower / Credit Applicant',
    subtitle: 'Individual taking a personal or home loan',
    documents: 'Loan Sanction Letter, Personal Loan Agreement',
    fears: 'Hidden interest resets, foreclosure fees, guarantor liability',
    icon: Landmark,
  },
];

interface PersonaPickerProps {
  selectedPersona: Persona;
  onSelect: (persona: Persona) => void;
}

export function PersonaPicker({ selectedPersona, onSelect }: PersonaPickerProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-bold tracking-wide uppercase text-slate-300">
          Step 1: Who are you in this agreement?
        </label>
        <span className="text-xs text-slate-400">Select your persona to calibrate risk weights</span>
      </div>

      <div
        role="radiogroup"
        aria-label="Target Persona Selection"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5"
      >
        {PERSONA_OPTIONS.map((p) => {
          const Icon = p.icon;
          const isSelected = selectedPersona === p.id;

          return (
            <button
              key={p.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onSelect(p.id)}
              className={`p-4 rounded-xl border text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-400 ${
                isSelected
                  ? 'bg-amber-500/10 border-amber-500 text-white shadow-lg shadow-amber-500/10 ring-1 ring-amber-500'
                  : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:border-slate-600 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2.5 rounded-lg shrink-0 ${
                    isSelected ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-700/60 text-slate-300'
                  }`}
                >
                  <Icon className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">{p.title}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{p.subtitle}</p>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-700/50 space-y-1.5 text-xs">
                <div className="flex items-start gap-1">
                  <span className="font-semibold text-slate-400 shrink-0">Docs:</span>
                  <span className="text-slate-300 truncate">{p.documents}</span>
                </div>
                <div className="flex items-start gap-1">
                  <span className="font-semibold text-rose-400 shrink-0">Fears:</span>
                  <span className="text-slate-400 line-clamp-1">{p.fears}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
