import { describe, it, expect } from 'vitest';
import { POST } from '@/app/api/brief/route';
import { LawyerBriefSchema } from '@/lib/schemas';
import { NextRequest } from 'next/server';

describe('/api/brief API Endpoint & Schema', () => {
  const sampleBrief = {
    summary: 'The agreement is a Leave & Licence contract for a residential premises in Mumbai with a 3-month lock-in clause.',
    keyConcerns: [
      'Lock-in period forfeits security deposit on early exit.',
      'Licensor has unilateral immediate termination right.',
    ],
    questionsForLawyer: [
      'Is the 3-month lock-in deposit forfeiture enforceable under Maharashtra Rent Control Act?',
      'How can I request a reciprocal notice period clause?',
    ],
    documentChecklist: [
      'Original Leave & Licence Agreement',
      'Rent payment bank receipts',
      'Communication logs with landlord',
    ],
  };

  it('validates a valid LawyerBrief payload using Zod schema', () => {
    const parseResult = LawyerBriefSchema.safeParse(sampleBrief);
    expect(parseResult.success).toBe(true);
  });

  it('handles valid POST request to /api/brief', async () => {
    const req = new NextRequest('http://localhost:3000/api/brief', {
      method: 'POST',
      body: JSON.stringify({
        lawyerBrief: sampleBrief,
        context: { persona: 'tenant', jurisdiction: 'MH', goal: 'understand', language: 'en', readingLevel: 'standard' },
        documentType: 'rental',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.brief).toEqual(sampleBrief);
    expect(body.documentType).toBe('rental');
    expect(body.markdownExport).toContain('# AEQUITAS CLIENT LEGAL BRIEF');
    expect(body.markdownExport).toContain('EXECUTIVE SUMMARY');
  });

  it('returns 400 error when payload is missing brief data', async () => {
    const req = new NextRequest('http://localhost:3000/api/brief', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const body = await res.json();
    expect(body.error).toBeDefined();
  });
});
