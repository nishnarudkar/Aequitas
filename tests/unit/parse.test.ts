import { describe, it, expect } from 'vitest';
import { parseText } from '../../src/lib/parse/text';
import { detectDocumentType } from '../../src/lib/parse/detect';
import { segmentDocument } from '../../src/lib/parse/segment';

describe('Document Parsing & Segmentation Unit Tests', () => {
  describe('Text Parser', () => {
    it('normalizes CRLF line endings and counts words', () => {
      const rawText = 'Line 1\r\nLine 2\r\n\r\nLine 3 with  extra   spaces.';
      const res = parseText(rawText);

      expect(res.text).toBe('Line 1\nLine 2\n\nLine 3 with  extra   spaces.');
      expect(res.wordCount).toBe(9);
    });
  });

  describe('Document Type Detector', () => {
    it('detects rental agreement with high confidence', () => {
      const text = `
        LEAVE AND LICENCE AGREEMENT
        This agreement is made between the Licensor and the Licensee.
        Monthly Rent shall be INR 35,000. Security deposit of INR 1,00,000 is paid.
        Lock-in period of 3 months applies for the demised premises.
      `;
      const res = detectDocumentType(text);

      expect(res.documentType).toBe('rental');
      expect(res.confidence).toBeGreaterThanOrEqual(0.6);
    });

    it('detects service agreement with high confidence', () => {
      const text = `
        MASTER SERVICE AGREEMENT
        Scope of Work and Deliverables for Independent Contractor.
        Milestone payments will be invoiced monthly by Service Provider.
      `;
      const res = detectDocumentType(text);

      expect(res.documentType).toBe('service-agreement');
      expect(res.confidence).toBeGreaterThanOrEqual(0.6);
    });

    it('detects offer letter / employment contract', () => {
      const text = `
        EMPLOYMENT OFFER LETTER
        We are pleased to offer you employment. Annual remuneration (CTC) is INR 12,00,000.
        Probation period is 6 months with 3 months notice period.
      `;
      const res = detectDocumentType(text);

      expect(res.documentType).toBe('employment');
      expect(res.confidence).toBeGreaterThanOrEqual(0.6);
    });

    it('detects privacy policy', () => {
      const text = `
        PRIVACY POLICY
        We collect personal data and use cookies. Data Controller shares data with third party sharing partners.
        Contact our Grievance Officer for data retention queries.
      `;
      const res = detectDocumentType(text);

      expect(res.documentType).toBe('privacy-policy');
      expect(res.confidence).toBeGreaterThanOrEqual(0.6);
    });

    it('detects loan sanction letter', () => {
      const text = `
        LOAN SANCTION LETTER
        The Lender approves a principal amount loan for Borrower.
        Interest rate per annum is 9.5% floating rate with EMI payable monthly.
      `;
      const res = detectDocumentType(text);

      expect(res.documentType).toBe('loan');
      expect(res.confidence).toBeGreaterThanOrEqual(0.6);
    });

    it('returns "other" for ambiguous generic text below confidence threshold', () => {
      const text = 'Hello world, this is a random text document with no specific legal terms.';
      const res = detectDocumentType(text);

      expect(res.documentType).toBe('other');
      expect(res.confidence).toBeLessThan(0.6);
    });
  });

  describe('Document Segmenter', () => {
    it('segments numbered headings accurately with correct offsets', () => {
      const docText = `
1. Security Deposit
The Licensee shall pay a security deposit of INR 50,000 to the Licensor upon signing this agreement.

2. Lock-in Period
Both parties agree to a mandatory 6-month lock-in period. Neither party may terminate during this time.

3. Maintenance Charges
The Licensee agrees to pay monthly society maintenance charges directly to the society office.
      `.trim();

      const clauses = segmentDocument(docText);

      expect(clauses.length).toBeGreaterThan(0);
      expect(clauses[0]?.id).toBe('c-0001');

      // Verify offset slicing integrity: slice(startOffset, endOffset) matches or covers clause range
      clauses.forEach((clause) => {
        expect(clause.startOffset).toBeGreaterThanOrEqual(0);
        expect(clause.endOffset).toBeGreaterThan(clause.startOffset);
        const sliced = docText.slice(clause.startOffset, clause.endOffset);
        expect(sliced).toContain(clause.heading);
      });
    });

    it('merges short clauses under 200 characters', () => {
      const shortDoc = `
1. Short Title
This agreement is titled Lease.

2. Definitions
Licensor means owner.

3. Detailed Terms
The Licensee agrees to pay monthly rent of INR 30,000 on or before the 5th of every month. The security deposit of INR 1,00,000 shall be refunded within 7 working days after vacating the demised premises in good condition.
      `.trim();

      const clauses = segmentDocument(shortDoc);

      // Short clauses should be merged together so total clause count is reduced
      expect(clauses.length).toBeLessThan(3);
    });

    it('splits large clauses exceeding 4,000 characters into sub-clauses', () => {
      const longClauseText = '1. Long Master Terms\n' + 'A'.repeat(4500);
      const clauses = segmentDocument(longClauseText);

      expect(clauses.length).toBeGreaterThan(1);
      expect(clauses[0]?.heading).toContain('Part 1');
      expect(clauses[1]?.heading).toContain('Part 2');
    });

    it('falls back to paragraph breaks when no numbered headings exist', () => {
      const plainParagraphsDoc = `
First paragraph describing the general purpose of the rental agreement and the background of both parties involved.

Second paragraph outlining the payment terms, monthly rent due dates, and bank transfer account details.

Third paragraph covering dispute resolution and jurisdiction in Mumbai.
      `.trim();

      const clauses = segmentDocument(plainParagraphsDoc);

      expect(clauses.length).toBeGreaterThanOrEqual(1);
      expect(clauses[0]?.id).toBe('c-0001');
    });
  });
});
