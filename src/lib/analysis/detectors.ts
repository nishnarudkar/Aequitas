import { ClauseType, DetectorHit } from '@/types';

export function detectClauseTypes(text: string): DetectorHit[] {
  const hits: DetectorHit[] = [];

  // Helper regex tests
  const testHit = (
    clauseType: ClauseType,
    regex: RegExp,
    asymmetryEvaluator?: (text: string) => { partyA: string; partyB: string } | undefined
  ) => {
    const match = regex.exec(text);
    if (match) {
      const evidence = match[0].trim();
      const asymmetry = asymmetryEvaluator ? asymmetryEvaluator(text) : undefined;
      hits.push({
        clauseType,
        matched: true,
        evidence: evidence.length > 200 ? evidence.slice(0, 197) + '...' : evidence,
        asymmetry,
      });
    }
  };

  // 1. Auto-renewal
  testHit(
    'auto-renewal',
    /\b(auto-renew|automatically renew|renews automatically|tacit renewal|automatically extended|renew for successive)\b/i
  );

  // 2. Unilateral amendment
  testHit(
    'unilateral-amendment',
    /\b(sole discretion|reserve the right to (modify|change|amend)|update these terms without prior notice|at any time without notice)\b/i
  );

  // 3. Lock-in period
  testHit(
    'lock-in',
    /\b(lock-in|lock in period|minimum (tenure|term|period)|shall not terminate during the first|mandatory period of)\b/i
  );

  // 4. Liquidated damages / penalty / bond
  testHit(
    'liquidated-damages',
    /\b(liquidated damages|pre-estimated damages|penalty of|forfeit the security deposit|training bond|bond amount|recovery of INR|penalty amount)\b/i
  );

  // 5. Indemnity
  testHit(
    'indemnity',
    /\b(indemnify|hold harmless|indemnification|defend and hold harmless)\b/i,
    (t) => {
      const lower = t.toLowerCase();
      const isOneSided =
        (lower.includes('licensee shall indemnify') && !lower.includes('licensor shall indemnify')) ||
        (lower.includes('contractor shall indemnify') && !lower.includes('client shall indemnify')) ||
        (lower.includes('employee shall indemnify') && !lower.includes('employer shall indemnify')) ||
        (lower.includes('borrower shall indemnify') && !lower.includes('lender shall indemnify'));

      if (isOneSided) {
        return {
          partyA: 'Counterparty (Fully Indemnified)',
          partyB: 'User (Solely Obligated to Indemnify)',
        };
      }
      return undefined;
    }
  );

  // 6. Liability Cap
  testHit(
    'liability-cap',
    /\b(limitation of liability|aggregate liability|maximum liability|shall not exceed|capped at|in no event shall the total liability)\b/i,
    (t) => {
      const lower = t.toLowerCase();
      if (lower.includes('unlimited liability') || lower.includes('no cap on liability')) {
        return {
          partyA: 'Counterparty (Liability Capped)',
          partyB: 'User (Unlimited Liability)',
        };
      }
      return undefined;
    }
  );

  // 7. Jurisdiction
  testHit(
    'jurisdiction',
    /\b(exclusive jurisdiction|courts at|courts in|subject to the jurisdiction of|venue for disputes)\b/i
  );

  // 8. Arbitration
  testHit(
    'arbitration',
    /\b(arbitration|sole arbitrator|arbitral tribunal|seat of arbitration|arbitration and conciliation act)\b/i
  );

  // 9. Non-compete
  testHit(
    'non-compete',
    /\b(non-compete|not engage in any competing|restraint of trade|competing business|similar business during and after)\b/i
  );

  // 10. Non-solicit
  testHit(
    'non-solicit',
    /\b(non-solicit|shall not solicit|solicit any employee|solicit any customer|solicit clients)\b/i
  );

  // 11. IP Assignment
  testHit(
    'ip-assignment',
    /\b(work made for hire|assign all intellectual property|ownership of deliverables|ip rights shall belong|assigns all right title)\b/i,
    (t) => {
      const lower = t.toLowerCase();
      if (lower.includes('upon creation') || lower.includes('upon execution') || !lower.includes('upon payment')) {
        return {
          partyA: 'Client/Employer (Receives IP immediately on creation)',
          partyB: 'User/Freelancer (Transfers IP before receiving payment)',
        };
      }
      return undefined;
    }
  );

  // 12. Confidentiality
  testHit(
    'confidentiality',
    /\b(confidential information|non-disclosure|confidentiality obligations|maintain strict confidentiality|perpetual confidentiality)\b/i
  );

  // 13. Termination for Convenience
  testHit(
    'termination-convenience',
    /\b(terminate (without cause|for convenience)|either party may terminate|at any time by giving)\b/i
  );

  // 14. Notice Period Asymmetry
  testHit(
    'notice-period-asymmetry',
    /\b(notice period|\bnotice of [0-9]+ (days|months)\b|\b[0-9]+ days notice\b)\b/i,
    (t) => {
      const dayMatches = Array.from(t.matchAll(/([a-zA-Z\s]+)\s+(?:may terminate|shall give)\s+(?:by giving\s+)?([0-9]+)\s+days/gi));
      if (dayMatches.length >= 2) {
        const p1 = dayMatches[0];
        const p2 = dayMatches[1];
        if (p1 && p2 && p1[2] !== p2[2]) {
          return {
            partyA: `${p1[1]?.trim()}: ${p1[2]} days notice`,
            partyB: `${p2[1]?.trim()}: ${p2[2]} days notice`,
          };
        }
      }
      return undefined;
    }
  );

  // 15. Interest & Late Fees
  testHit(
    'interest-late-fee',
    /\b(late payment|interest rate|penal interest|late fee|delayed payment|overdue interest|\b[0-9]+% per month\b)\b/i
  );

  // 16. Security Deposit
  testHit(
    'security-deposit',
    /\b(security deposit|refund of deposit|deposit amount|deductions from deposit|discretion of licensor)\b/i
  );

  // 17. Force Majeure
  testHit(
    'force-majeure',
    /\b(force majeure|act of god|unforeseen circumstances|pandemic|epidemic|war or civil commotion)\b/i
  );

  // 18. Waiver
  testHit(
    'waiver',
    /\b(waiver of rights|failure to enforce|shall not constitute a waiver|no waiver)\b/i
  );

  // 19. Entire Agreement
  testHit(
    'entire-agreement',
    /\b(entire agreement|supersedes all prior|merger clause|complete understanding|oral or written)\b/i
  );

  // 20. Governing Law
  testHit(
    'governing-law',
    /\b(governed by|construed in accordance with|laws of India|laws of Maharashtra)\b/i
  );

  return hits;
}
