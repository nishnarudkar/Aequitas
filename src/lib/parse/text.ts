export interface TextParseResult {
  text: string;
  wordCount: number;
}

export function parseText(rawContent: string | Buffer): TextParseResult {
  const contentStr =
    typeof rawContent === 'string'
      ? rawContent
      : rawContent.toString('utf-8');

  // Normalize line breaks and remove null bytes or control characters
  const normalizedText = contentStr
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')
    .trim();

  const words = normalizedText.split(/\s+/).filter((w) => w.length > 0);

  return {
    text: normalizedText,
    wordCount: words.length,
  };
}
