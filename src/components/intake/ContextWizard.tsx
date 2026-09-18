import React from 'react';
import { PersonaPicker } from './PersonaPicker';
import { Goal, Jurisdiction, UserContext } from '@/types';
import { MapPin, Target, Calendar, CheckSquare, Languages } from 'lucide-react';

interface ContextWizardProps {
  context: UserContext;
  onChange: (updated: UserContext) => void;
}

const JURISDICTION_OPTIONS: Array<{ id: Jurisdiction; label: string }> = [
  { id: 'MH', label: 'Maharashtra' },
  { id: 'DL', label: 'Delhi (NCR)' },
  { id: 'KA', label: 'Karnataka' },
  { id: 'TG', label: 'Telangana' },
  { id: 'WB', label: 'West Bengal' },
  { id: 'OTHER', label: 'Other / Generic India' },
];

const GOAL_OPTIONS: Array<{ id: Goal; title: string; desc: string }> = [
  { id: 'understand', title: 'Understand Terms', desc: 'Plain-language breakdown & obligation summary' },
  { id: 'decide', title: 'Decide to Sign', desc: 'Risk highlights, gap analysis & decision checklist' },
  { id: 'negotiate', title: 'Negotiate Terms', desc: 'Redline suggestions & counter-proposal wording' },
  { id: 'dispute', title: 'Dispute / Breach', desc: 'Breached terms, cure routes & legal aid triage' },
  { id: 'prepare-for-lawyer', title: 'Prepare for Lawyer', desc: 'Printable 1-page Lawyer Brief & question list' },
];

export function ContextWizard({ context, onChange }: ContextWizardProps) {
  const updateField = <K extends keyof UserContext>(key: K, value: UserContext[K]) => {
    onChange({
      ...context,
      [key]: value,
    });
  };

  return (
    <div className="space-y-6 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-md">
      {/* 1. Persona Picker */}
      <PersonaPicker
        selectedPersona={context.persona}
        onSelect={(p) => updateField('persona', p)}
      />

      {/* 2. Jurisdiction & Goal Options */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 border-t border-slate-800">
        {/* Jurisdiction Selection */}
        <div className="space-y-3">
          <label className="text-sm font-bold tracking-wide uppercase text-slate-300 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-amber-400" aria-hidden="true" />
            Step 2: State Jurisdiction
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {JURISDICTION_OPTIONS.map((j) => {
              const isSelected = context.jurisdiction === j.id;
              return (
                <button
                  key={j.id}
                  type="button"
                  onClick={() => updateField('jurisdiction', j.id)}
                  className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-all text-center focus:outline-none focus:ring-2 focus:ring-amber-400 ${
                    isSelected
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-sm'
                      : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  {j.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Goal Selection */}
        <div className="space-y-3">
          <label className="text-sm font-bold tracking-wide uppercase text-slate-300 flex items-center gap-2">
            <Target className="w-4 h-4 text-amber-400" aria-hidden="true" />
            Step 3: What is your primary objective?
          </label>
          <div className="space-y-2">
            {GOAL_OPTIONS.map((g) => {
              const isSelected = context.goal === g.id;
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => updateField('goal', g.id)}
                  className={`w-full p-2.5 rounded-lg border text-left flex items-center justify-between transition-all focus:outline-none focus:ring-2 focus:ring-amber-400 ${
                    isSelected
                      ? 'bg-amber-500/20 border-amber-500 text-amber-200'
                      : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  <div>
                    <span className="text-xs font-bold block">{g.title}</span>
                    <span className="text-[11px] text-slate-400 block">{g.desc}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Optional Context Parameters */}
      <div className="pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        {/* Deadline Picker */}
        <div className="space-y-1.5">
          <label className="font-semibold text-slate-400 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
            Signing / Exit Deadline (Optional)
          </label>
          <input
            type="date"
            value={context.deadline || ''}
            onChange={(e) => updateField('deadline', e.target.value || undefined)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Counterparty Signed Checkbox */}
        <div className="space-y-1.5 flex flex-col justify-end">
          <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-300 bg-slate-800/80 border border-slate-700 rounded-lg p-2 hover:border-slate-600">
            <input
              type="checkbox"
              checked={context.counterpartySigned || false}
              onChange={(e) => updateField('counterpartySigned', e.target.checked)}
              className="rounded bg-slate-900 border-slate-700 text-amber-500 focus:ring-amber-400"
            />
            <CheckSquare className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
            Contract already signed?
          </label>
        </div>

        {/* Language Selection */}
        <div className="space-y-1.5">
          <label className="font-semibold text-slate-400 flex items-center gap-1.5">
            <Languages className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
            Output Language
          </label>
          <select
            value={context.language}
            onChange={(e) => updateField('language', e.target.value as 'en' | 'hi' | 'mr')}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500 font-medium"
          >
            <option value="en">English</option>
            <option value="hi">हिन्दी (Hindi)</option>
            <option value="mr">मराठी (Marathi)</option>
          </select>
        </div>
      </div>
    </div>
  );
}
