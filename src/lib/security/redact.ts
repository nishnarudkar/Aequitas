/**
 * PII Redaction module for server-side security.
 * Redacts Aadhaar, PAN, phone numbers, emails, and bank accounts prior to LLM processing.
 */

export interface RedactionResult {
  sanitizedText: string;
  redactedCount: number;
}

export function redactPII(text: string): RedactionResult {
  if (!text) return { sanitizedText: '', redactedCount: 0 };

  let count = 0;
  let sanitized = text;

  // 1. Aadhaar Number (12 digits, optional space/hyphen)
  const aadhaarRegex = /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g;
  sanitized = sanitized.replace(aadhaarRegex, () => {
    count++;
    return '[AADHAAR_REDACTED]';
  });

  // 2. PAN Card Number (10 alphanumeric: 5 letters, 4 numbers, 1 letter)
  const panRegex = /\b[A-Z]{5}[0-9]{4}[A-Z]\b/gi;
  sanitized = sanitized.replace(panRegex, () => {
    count++;
    return '[PAN_REDACTED]';
  });

  // 3. Indian Phone Numbers (+91 or 10-digit mobile starting with 6-9)
  const phoneRegex = /(?:\+91[-\s]?)?\b[6-9]\d{9}\b/g;
  sanitized = sanitized.replace(phoneRegex, () => {
    count++;
    return '[PHONE_REDACTED]';
  });

  // 4. Email Addresses
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
  sanitized = sanitized.replace(emailRegex, () => {
    count++;
    return '[EMAIL_REDACTED]';
  });

  // 5. Bank Account Numbers (9-18 digits standalone)
  const bankRegex = /\b\d{9,18}\b/g;
  sanitized = sanitized.replace(bankRegex, (match) => {
    // Avoid replacing 4-digit years or zip codes (usually 4 to 6 digits)
    if (match.length >= 9) {
      count++;
      return '[ACCOUNT_REDACTED]';
    }
    return match;
  });

  return {
    sanitizedText: sanitized,
    redactedCount: count,
  };
}
