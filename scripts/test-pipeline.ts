/**
 * CLI test for the AI pipeline.
 * Usage: npm run test:pipeline
 * Put test PDFs in scripts/test-pdfs/
 */

import fs from 'fs';
import path from 'path';
import Anthropic from '@anthropic-ai/sdk';
import { extractPdfText, bufferToBase64 } from '../lib/pdf';
import { EXTRACTION_SYSTEM, buildExtractionUserPrompt } from '../prompts/extracao';
import { buildAnalysisSystemPrompt, buildAnalysisUserPrompt } from '../prompts/analise-mestre';
import { ExtractionResultSchema, AnalysisResultSchema } from '../lib/schemas';
import type { ExtractionResult } from '../lib/schemas';

const EXTRACTION_MODEL = 'claude-haiku-4-5';
const ANALYSIS_MODEL = 'claude-sonnet-4-6';

const TEST_PDF_DIR = path.join(__dirname, 'test-pdfs');
const WORK_TYPE = process.env.WORK_TYPE ?? 'pintura_fachada';
const DESCRIPTION = process.env.DESCRIPTION ?? 'Condomínio residencial de 10 andares. Fachada com manchas e pintura descascada.';

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('ANTHROPIC_API_KEY não definida. Crie um .env.local com a chave.');
    process.exit(1);
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  if (!fs.existsSync(TEST_PDF_DIR)) {
    fs.mkdirSync(TEST_PDF_DIR, { recursive: true });
    console.error(`Pasta ${TEST_PDF_DIR} criada. Adicione PDFs de orçamentos e rode novamente.`);
    process.exit(1);
  }

  const pdfFiles = fs.readdirSync(TEST_PDF_DIR).filter((f) => f.endsWith('.pdf'));
  if (pdfFiles.length < 2) {
    console.error(`Coloque pelo menos 2 PDFs em ${TEST_PDF_DIR}`);
    process.exit(1);
  }

  console.log(`\nOrçaGuard — teste de pipeline`);
  console.log(`Tipo de obra: ${WORK_TYPE}`);
  console.log(`Documentos: ${pdfFiles.join(', ')}\n`);

  // ── Step 1: Extraction ──────────────────────────────────
  console.log('PASSO 1 — Extração (paralela)');
  const extractionResults = await Promise.all(
    pdfFiles.map(async (fileName) => {
      process.stdout.write(`  [${fileName}] extraindo... `);
      const buffer = fs.readFileSync(path.join(TEST_PDF_DIR, fileName));
      const pdfResult = await extractPdfText(buffer);
      console.log(`${pdfResult.pages} págs, confiança ${pdfResult.lowConfidence ? 'baixa' : 'ok'}`);

      let rawJson: string;
      if (!pdfResult.lowConfidence && pdfResult.text.length > 200) {
        const res = await anthropic.messages.create({
          model: EXTRACTION_MODEL,
          max_tokens: 4096,
          system: EXTRACTION_SYSTEM,
          messages: [{ role: 'user', content: buildExtractionUserPrompt(pdfResult.text.slice(0, 40_000), fileName) }],
        });
        rawJson = (res.content[0] as any).text;
      } else {
        const base64 = bufferToBase64(buffer);
        const res = await anthropic.messages.create({
          model: EXTRACTION_MODEL,
          max_tokens: 4096,
          system: EXTRACTION_SYSTEM,
          messages: [
            {
              role: 'user',
              content: [
                { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: base64 }, title: fileName } as any,
                { type: 'text', text: buildExtractionUserPrompt('[ver documento acima]', fileName) },
              ],
            },
          ],
        });
        rawJson = (res.content[0] as any).text;
      }

      const extraction = ExtractionResultSchema.parse(JSON.parse(rawJson));
      console.log(`  [${fileName}] fornecedor: ${extraction.fornecedor}, ${extraction.itens.length} itens, total: R$ ${extraction.valor_total}`);
      return { fileName, extraction };
    })
  );

  // Save extractions to disk for inspection
  fs.writeFileSync(
    path.join(__dirname, 'extractions.json'),
    JSON.stringify(extractionResults, null, 2)
  );
  console.log('\n  Extrações salvas em scripts/extractions.json\n');

  // ── Step 2: Analysis ────────────────────────────────────
  console.log('PASSO 2 — Análise comparativa');
  const systemBlocks = buildAnalysisSystemPrompt();
  const userPrompt = buildAnalysisUserPrompt(WORK_TYPE, DESCRIPTION, extractionResults);

  const analysisRes = await anthropic.messages.create({
    model: ANALYSIS_MODEL,
    max_tokens: 8192,
    system: systemBlocks as any,
    messages: [{ role: 'user', content: userPrompt }],
  });

  const analysisRaw = (analysisRes.content[0] as any).text;
  const result = AnalysisResultSchema.parse(JSON.parse(analysisRaw));

  fs.writeFileSync(
    path.join(__dirname, 'analysis-result.json'),
    JSON.stringify(result, null, 2)
  );

  console.log('\n--- RESUMO EXECUTIVO ---');
  console.log(result.resumo_executivo);
  console.log('\n--- RANKING ---');
  result.ranking.forEach((r, i) => console.log(`  ${i + 1}. ${r.fornecedor} — nota ${r.nota}/10`));
  console.log(`\n  ${result.red_flags.length} red flag(s) encontrada(s).`);
  console.log('\n  Resultado completo salvo em scripts/analysis-result.json');
}

main().catch((e) => { console.error(e); process.exit(1); });
