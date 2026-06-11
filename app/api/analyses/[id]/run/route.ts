import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { getAnthropicClient, EXTRACTION_MODEL, ANALYSIS_MODEL, MAX_PAGES_PER_PDF } from '@/lib/anthropic';
import { extractPdfText, bufferToBase64 } from '@/lib/pdf';
import { buildExtractionUserPrompt, EXTRACTION_SYSTEM, buildExtractionMessagesWithVision } from '@/prompts/extracao';
import { buildAnalysisSystemPrompt, buildAnalysisUserPrompt } from '@/prompts/analise-mestre';
import { ExtractionResultSchema, AnalysisResultSchema } from '@/lib/schemas';

// Vercel Pro: long-running function
export const maxDuration = 300;

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = params;
  const service = createServiceClient();
  const anthropic = getAnthropicClient();

  // Fetch analysis + documents
  const { data: analysis, error: fetchError } = await service
    .from('analyses')
    .select('*, documents(*)')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (fetchError || !analysis) return NextResponse.json({ error: 'Análise não encontrada.' }, { status: 404 });
  if (analysis.status === 'analyzing' || analysis.status === 'extracting') {
    return NextResponse.json({ error: 'Análise já está em andamento.' }, { status: 409 });
  }

  const documents: any[] = analysis.documents ?? [];
  if (documents.length < 2) return NextResponse.json({ error: 'Mínimo de 2 documentos necessários.' }, { status: 400 });

  // ── STEP 1: Extraction (parallel, idempotent) ─────────────────
  await service.from('analyses').update({ status: 'extracting' }).eq('id', id);

  const extractionResults = await Promise.all(
    documents.map(async (doc) => {
      // Idempotency: skip if already extracted
      if (doc.extraction) {
        return { fileName: doc.original_name, extraction: doc.extraction, docId: doc.id };
      }

      // Download PDF from Storage
      const { data: fileData, error: dlError } = await service.storage
        .from('orcamentos')
        .download(doc.file_url);
      if (dlError || !fileData) throw new Error(`Erro ao baixar ${doc.original_name}: ${dlError?.message}`);

      const buffer = Buffer.from(await fileData.arrayBuffer());

      // Try local extraction first
      const pdfResult = await extractPdfText(buffer);

      let rawJson: string;

      if (!pdfResult.lowConfidence && pdfResult.text.length > 200) {
        // Text-based PDF — use text extraction (cheaper)
        const truncatedText = pdfResult.text.slice(0, 40_000); // ~30k tokens max
        const response = await anthropic.messages.create({
          model: EXTRACTION_MODEL,
          max_tokens: 4096,
          system: EXTRACTION_SYSTEM,
          messages: [{ role: 'user', content: buildExtractionUserPrompt(truncatedText, doc.original_name) }],
        });
        rawJson = (response.content[0] as any).text;
      } else {
        // Scanned/image PDF — use vision via native PDF API
        const base64 = bufferToBase64(buffer);
        const messages = buildExtractionMessagesWithVision(base64, doc.original_name);
        const response = await anthropic.messages.create({
          model: EXTRACTION_MODEL,
          max_tokens: 4096,
          system: EXTRACTION_SYSTEM,
          messages: messages as any,
        });
        rawJson = (response.content[0] as any).text;
      }

      // Parse and validate
      const parsed = JSON.parse(rawJson);
      const extraction = ExtractionResultSchema.parse(parsed);

      // Cache in DB
      await service.from('documents').update({
        extraction,
        vendor_name: extraction.fornecedor,
        pages: pdfResult.pages,
      }).eq('id', doc.id);

      return { fileName: doc.original_name, extraction, docId: doc.id };
    })
  );

  // ── STEP 2: Comparative analysis ─────────────────────────────
  await service.from('analyses').update({ status: 'analyzing' }).eq('id', id);

  const systemBlocks = buildAnalysisSystemPrompt();
  const userPrompt = buildAnalysisUserPrompt(
    analysis.work_type,
    analysis.description ?? '',
    extractionResults.map(({ fileName, extraction }) => ({ fileName, extraction }))
  );

  const analysisResponse = await anthropic.messages.create({
    model: ANALYSIS_MODEL,
    max_tokens: 8192,
    system: systemBlocks as any,
    messages: [{ role: 'user', content: userPrompt }],
  });

  const analysisRaw = (analysisResponse.content[0] as any).text;
  const result = AnalysisResultSchema.parse(JSON.parse(analysisRaw));

  // Save result
  await service.from('analyses').update({
    status: 'done',
    result,
    completed_at: new Date().toISOString(),
  }).eq('id', id);

  // TODO Step 3: generate PDF report and send email (Fase 2)

  return NextResponse.json({ ok: true, result });
}
