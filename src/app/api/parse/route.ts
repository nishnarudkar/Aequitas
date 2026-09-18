import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { parseText } from '@/lib/parse/text';
import { parseDocx } from '@/lib/parse/docx';
import { parsePdf } from '@/lib/parse/pdf';
import { detectDocumentType } from '@/lib/parse/detect';
import { segmentDocument } from '@/lib/parse/segment';
import { ParseResponse } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';

    let text = '';
    let pageCount: number | undefined = undefined;
    let isScanned = false;

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      const rawTextParam = formData.get('text') as string | null;

      if (file) {
        // Size validation (Max 10 MB)
        const maxBytes = (parseInt(process.env.MAX_UPLOAD_MB || '10', 10)) * 1024 * 1024;
        if (file.size > maxBytes) {
          return NextResponse.json(
            { error: `File size exceeds maximum allowed limit of ${process.env.MAX_UPLOAD_MB || 10} MB.` },
            { status: 400 }
          );
        }

        const fileName = file.name.toLowerCase();
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        if (fileName.endsWith('.pdf')) {
          const pdfRes = await parsePdf(buffer);
          text = pdfRes.text;
          pageCount = pdfRes.pageCount;
          isScanned = pdfRes.isScanned;
        } else if (fileName.endsWith('.docx')) {
          const docxRes = await parseDocx(buffer);
          text = docxRes.text;
        } else {
          const txtRes = parseText(buffer);
          text = txtRes.text;
        }
      } else if (rawTextParam) {
        text = parseText(rawTextParam).text;
      } else {
        return NextResponse.json(
          { error: 'No file or text payload provided.' },
          { status: 400 }
        );
      }
    } else {
      const body = await req.json();
      if (body.text) {
        text = parseText(body.text).text;
      } else {
        return NextResponse.json(
          { error: 'Invalid JSON request body. Expected "text" property.' },
          { status: 400 }
        );
      }
    }

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Document appears to be empty or unreadable.' },
        { status: 400 }
      );
    }

    // 1. Detect Document Type
    const detection = detectDocumentType(text);

    // 2. Segment into Clauses
    const clauses = segmentDocument(text);

    const wordCount = text.split(/\s+/).filter((w) => w.length > 0).length;
    const documentId = `doc-${crypto.randomBytes(4).toString('hex')}`;

    const responsePayload: ParseResponse = {
      documentId,
      detectedType: detection.documentType,
      confidence: detection.confidence,
      pageCount,
      wordCount,
      clauses,
      isScanned,
    };

    return NextResponse.json(responsePayload, { status: 200 });
  } catch (error: any) {
    console.error('Parse API route error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to parse document.' },
      { status: 500 }
    );
  }
}
