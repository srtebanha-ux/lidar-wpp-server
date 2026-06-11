import pdfParse from 'pdf-parse';
import { MAX_PAGES_PER_PDF } from './anthropic';

export interface PdfExtractResult {
  text: string;
  pages: number;
  method: 'local' | 'api';
  lowConfidence: boolean;
}

/**
 * Extracts text from a PDF buffer.
 * Uses pdf-parse locally first (free, fast).
 * If the text is too sparse (scanned doc), caller should fall back to Anthropic vision API.
 */
export async function extractPdfText(buffer: Buffer): Promise<PdfExtractResult> {
  const parsed = await pdfParse(buffer, { max: MAX_PAGES_PER_PDF });
  const pages = parsed.numpages;
  const text = parsed.text.trim();

  // Heuristic: scanned PDFs have very little extractable text per page
  const charsPerPage = text.length / Math.max(pages, 1);
  const lowConfidence = charsPerPage < 100;

  return { text, pages, method: 'local', lowConfidence };
}

export function bufferToBase64(buffer: Buffer): string {
  return buffer.toString('base64');
}
