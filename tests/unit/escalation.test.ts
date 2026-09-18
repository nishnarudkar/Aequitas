import { describe, it, expect } from 'vitest';
import { evaluateEscalation } from '../../src/lib/context/escalation';

describe('Escalation Triage Unit Tests', () => {
  it('detects self-harm and triggers critical escalation with crisis resources', () => {
    const text = 'I am overwhelmed and feel like ending my life over this debt.';
    const res = evaluateEscalation(text);

    expect(res.triggered).toBe(true);
    expect(res.level).toBe('critical');
    expect(res.triggers).toContain('Crisis & Personal Safety');
    expect(res.resources.some((r) => r.id === 'tele-manas')).toBe(true);
  });

  it('detects criminal proceedings trigger', () => {
    const text = 'The police filed a First Information Report (FIR) and issued an arrest warrant.';
    const res = evaluateEscalation(text);

    expect(res.triggered).toBe(true);
    expect(res.level).toBe('warning');
    expect(res.triggers).toContain('Criminal Proceedings');
  });

  it('detects court summons trigger', () => {
    const text = 'I received a court summons with a hearing date next week.';
    const res = evaluateEscalation(text);

    expect(res.triggered).toBe(true);
    expect(res.level).toBe('warning');
    expect(res.triggers).toContain('Court Summons & Hearing');
  });

  it('detects forced eviction trigger', () => {
    const text = 'The landlord threatened forced eviction and changed the locks today.';
    const res = evaluateEscalation(text);

    expect(res.triggered).toBe(true);
    expect(res.level).toBe('warning');
    expect(res.triggers).toContain('Imminent Eviction');
  });

  it('detects PoSH workplace sexual harassment trigger', () => {
    const text = 'I want to submit a workplace harassment complaint to the Internal Committee under PoSH Act.';
    const res = evaluateEscalation(text);

    expect(res.triggered).toBe(true);
    expect(res.level).toBe('warning');
    expect(res.triggers).toContain('Workplace Sexual Harassment');
  });

  it('does NOT trigger on benign look-alikes', () => {
    const benignTexts = [
      'I watched a movie about a court case yesterday.',
      'The agreement shall be governed by the laws of Maharashtra.',
      'Notice period shall be 30 days.',
      'Party A shall maintain confidentiality of all documents.',
    ];

    for (const text of benignTexts) {
      const res = evaluateEscalation(text);
      expect(res.triggered).toBe(false);
      expect(res.level).toBe('none');
    }
  });
});
