import mammoth from 'mammoth';

export interface DocxParseResult {
  text: string;
  wordCount: number;
}

export async function parseDocx(
  buffer: Buffer | ArrayBuffer
): Promise<DocxParseResult> {
  const inputBuffer = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
  const result = await mammoth.extractRawText({ buffer: inputBuffer });
  const rawText = result.value || '';

  const normalizedText = rawText
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
