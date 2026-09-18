import { Clause } from '@/types';

export interface RawSegment {
  heading: string;
  text: string;
  startOffset: number;
  endOffset: number;
  pageHint?: number;
}

const HEADING_REGEX =
  /(?:^|\n)((?:(?:SECTION|ARTICLE|CLAUSE)\s+[0-9IVXLC]+|[0-9]+\.[0-9]*|\([a-z0-9]+\)|WHEREAS|NOW THEREFORE|SCHEDULE\s+[A-Z0-9]+)\b[^\n]*)/gi;

export function segmentDocument(
  text: string,
  pageHints?: Array<{ startOffset: number; endOffset: number; pageNumber: number }>
): Clause[] {
  if (!text || text.trim().length === 0) {
    return [];
  }

  const rawSegments: RawSegment[] = [];
  const matches: Array<{ heading: string; index: number }> = [];

  let match: RegExpExecArray | null;
  HEADING_REGEX.lastIndex = 0;

  while ((match = HEADING_REGEX.exec(text)) !== null) {
    const heading = match[1] ? match[1].trim() : match[0].trim();
    // Index of match in raw string
    const matchIndex = match.index + (match[0].startsWith('\n') ? 1 : 0);
    matches.push({ heading, index: matchIndex });
  }

  if (matches.length > 0) {
    for (let i = 0; i < matches.length; i++) {
      const current = matches[i]!;
      const startOffset = current.index;
      const endOffset = i < matches.length - 1 ? matches[i + 1]!.index : text.length;

      const segmentText = text.slice(startOffset, endOffset).trim();
      rawSegments.push({
        heading: current.heading,
        text: segmentText,
        startOffset,
        endOffset,
      });
    }
  } else {
    // Fallback: split by paragraph breaks (\n\n+)
    const paragraphs = text.split(/(\n\s*\n+)/);
    let currentPos = 0;

    for (const part of paragraphs) {
      const startOffset = currentPos;
      const endOffset = currentPos + part.length;
      currentPos = endOffset;

      const trimmed = part.trim();
      if (trimmed.length > 0) {
        // Extract first sentence or first 60 chars as heading
        const firstLine = trimmed.split('\n')[0] || '';
        const heading =
          firstLine.length <= 60 ? firstLine : firstLine.slice(0, 57) + '...';

        rawSegments.push({
          heading,
          text: trimmed,
          startOffset,
          endOffset,
        });
      }
    }
  }

  // 1. Merge short clauses (< 200 chars) with neighboring clauses
  const mergedSegments: RawSegment[] = [];
  let buffer: RawSegment | null = null;

  for (const seg of rawSegments) {
    if (!buffer) {
      buffer = { ...seg };
      continue;
    }

    if (buffer.text.length < 200) {
      // Merge buffer into current seg
      buffer.text = `${buffer.text}\n\n${seg.text}`;
      buffer.endOffset = seg.endOffset;
    } else {
      mergedSegments.push(buffer);
      buffer = { ...seg };
    }
  }

  if (buffer) {
    if (mergedSegments.length > 0 && buffer.text.length < 200) {
      // Merge trailing small buffer into last segment
      const last = mergedSegments[mergedSegments.length - 1]!;
      last.text = `${last.text}\n\n${buffer.text}`;
      last.endOffset = buffer.endOffset;
    } else {
      mergedSegments.push(buffer);
    }
  }

  // 2. Split large clauses (> 4000 chars) into sub-segments
  const finalSegments: RawSegment[] = [];

  for (const seg of mergedSegments) {
    if (seg.text.length <= 4000) {
      finalSegments.push(seg);
    } else {
      // Split seg into ~3000 char chunks at sentence boundaries
      let start = 0;
      let partIdx = 1;

      while (start < seg.text.length) {
        let end = start + 3000;
        if (end < seg.text.length) {
          // Look for sentence boundary
          const boundary = seg.text.lastIndexOf('. ', end);
          if (boundary > start + 1500) {
            end = boundary + 1;
          }
        } else {
          end = seg.text.length;
        }

        const chunkText = seg.text.slice(start, end).trim();
        const chunkStartOffset = seg.startOffset + start;
        const chunkEndOffset = seg.startOffset + end;

        finalSegments.push({
          heading: `${seg.heading} (Part ${partIdx})`,
          text: chunkText,
          startOffset: chunkStartOffset,
          endOffset: chunkEndOffset,
        });

        start = end;
        partIdx++;
      }
    }
  }

  // 3. Format into final Clause[] with pageHint and stable c-0001 ids
  return finalSegments.map((seg, idx) => {
    const id = `c-${String(idx + 1).padStart(4, '0')}`;
    let pageHint: number | undefined;

    if (pageHints && pageHints.length > 0) {
      const matchedPage = pageHints.find(
        (p) => seg.startOffset >= p.startOffset && seg.startOffset < p.endOffset
      );
      if (matchedPage) {
        pageHint = matchedPage.pageNumber;
      }
    }

    return {
      id,
      heading: seg.heading,
      text: seg.text,
      startOffset: seg.startOffset,
      endOffset: seg.endOffset,
      pageHint,
    };
  });
}
