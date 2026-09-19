import { describe, it, expect } from 'vitest';
import { redactPII } from '@/lib/security/redact';
import { validateInputPayload } from '@/lib/security/validate';
import { checkRateLimit } from '@/lib/security/ratelimit';

describe('Security Modules', () => {
  describe('redactPII', () => {
    it('redacts Aadhaar numbers from contract text', () => {
      const input = 'My Aadhaar number is 1234 5678 9012.';
      const result = redactPII(input);
      expect(result.sanitizedText).toContain('[AADHAAR_REDACTED]');
      expect(result.redactedCount).toBe(1);
    });

    it('redacts PAN card numbers from contract text', () => {
      const input = 'PAN: ABCDE1234F for Licensee.';
      const result = redactPII(input);
      expect(result.sanitizedText).toContain('[PAN_REDACTED]');
      expect(result.redactedCount).toBe(1);
    });

    it('redacts email addresses and phone numbers', () => {
      const input = 'Contact john.doe@example.com or +91 9876543210.';
      const result = redactPII(input);
      expect(result.sanitizedText).toContain('[EMAIL_REDACTED]');
      expect(result.sanitizedText).toContain('[PHONE_REDACTED]');
      expect(result.redactedCount).toBe(2);
    });
  });

  describe('validateInputPayload', () => {
    it('approves payloads within bounds', () => {
      const result = validateInputPayload('Valid contract text', 'contract.pdf', 1000);
      expect(result.isValid).toBe(true);
    });

    it('rejects oversized payloads', () => {
      const largeText = 'a'.repeat(200000);
      const result = validateInputPayload(largeText);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('maximum character limit');
    });

    it('rejects unallowed file extensions', () => {
      const result = validateInputPayload('text', 'executable.exe', 100);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Unsupported file format');
    });
  });

  describe('checkRateLimit', () => {
    it('allows requests within rate limits and blocks when limit exceeded', () => {
      const id = 'test_client_ip';
      const config = { limit: 2, windowMs: 1000 };

      const r1 = checkRateLimit(id, config);
      expect(r1.allowed).toBe(true);
      expect(r1.remaining).toBe(1);

      const r2 = checkRateLimit(id, config);
      expect(r2.allowed).toBe(true);
      expect(r2.remaining).toBe(0);

      const r3 = checkRateLimit(id, config);
      expect(r3.allowed).toBe(false);
      expect(r3.remaining).toBe(0);
    });
  });
});
