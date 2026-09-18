import crypto from 'crypto';

export function generateNonce(): string {
  return crypto.randomBytes(4).toString('hex');
}

export function sanitizeUserContent(content: string, nonce: string): string {
  if (!content) return '';

  // 1. Strip any occurrence of the request nonce from user content
  const nonceRegex = new RegExp(nonce, 'gi');
  let sanitized = content.replace(nonceRegex, 'REDACTED_NONCE');

  // 2. Strip fake closing/opening XML/HTML document tags
  sanitized = sanitized.replace(/<\/?document[^>]*>/gi, '[REDACTED_TAG]');

  // 3. Neutralize explicit system override attempt phrases
  sanitized = sanitized.replace(
    /\b(ignore (all )?previous instructions|system prompt|disregard instructions)\b/gi,
    '[USER_TEXT_REDACTED_COMMAND]'
  );

  return sanitized;
}
