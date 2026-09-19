export interface PdfPageText {
  pageNumber: number;
  text: string;
}

export interface PdfParseResult {
  text: string;
  wordCount: number;
  pageCount: number;
  pages: PdfPageText[];
  isScanned: boolean;
}

export async function parsePdf(
  buffer: Buffer | ArrayBuffer
): Promise<PdfParseResult> {
  const uint8Array =
    buffer instanceof Uint8Array
      ? buffer
      : new Uint8Array(buffer as ArrayBuffer);

  // Dynamic import pdfjs-dist for node / bundler compatibility
  // eslint-disable-next-line
  const pdfjsLib = require('pdfjs-dist');

  const loadingTask = pdfjsLib.getDocument({
    data: uint8Array,
    useSystemFonts: true,
    isEvalSupported: false,
  });

  const pdfDocument = await loadingTask.promise;
  const pageCount = pdfDocument.numPages;
  const pages: PdfPageText[] = [];
  let fullTextParts: string[] = [];

  for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
    const page = await pdfDocument.getPage(pageNum);
    const textContent = await page.getTextContent();
    const pageStrings = textContent.items
      .map((item: any) => (item.str ? item.str : ''))
      .join(' ');

    const cleanedPageText = pageStrings
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\s+/g, ' ')
      .trim();

    pages.push({
      pageNumber: pageNum,
      text: cleanedPageText,
    });

    if (cleanedPageText.length > 0) {
      fullTextParts.push(cleanedPageText);
    }
  }

  const fullText = fullTextParts.join('\n\n').trim();
  const words = fullText.split(/\s+/).filter((w) => w.length > 0);

  // If pageCount >= 1 and total extracted text < 50 chars, mark as scanned image PDF
  const isScanned = pageCount > 0 && fullText.length < 50;

  return {
    text: fullText,
    wordCount: words.length,
    pageCount,
    pages,
    isScanned,
  };
}
