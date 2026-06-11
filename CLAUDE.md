# CLAUDE.md

This file provides guidance to Claude Code when working with OrçaGuard.

## What this project is

**OrçaGuard** is an AI-powered construction budget analyzer for Brazilian building managers (síndicos). Users upload 2–5 budget PDFs for a renovation job; the system returns a professional comparative analysis report pointing out out-of-market prices, missing line items, and contractual risks.

Business spec is in `docs/spec.md` (full plan + architecture).

## Running locally

```bash
cp .env.example .env.local   # fill in real values
npm install
npm run dev                  # http://localhost:3000
```

To test the AI pipeline without a browser:
```bash
# put test PDFs in scripts/test-pdfs/
npm run test:pipeline
```

## Environment variables

See `.env.example`. All required before the app is functional:
- `ANTHROPIC_API_KEY` — calls `claude-haiku-4-5` (extraction) and `claude-sonnet-4-6` (analysis)
- `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` — browser Supabase client
- `SUPABASE_SERVICE_ROLE_KEY` — server-side Supabase (bypasses RLS where needed)
- `MP_ACCESS_TOKEN` + `MP_WEBHOOK_SECRET` — Mercado Pago
- `RESEND_API_KEY` — transactional email

## Architecture

### Two-file AI layer

**`prompts/extracao.ts`** — Step 1 extraction prompt. One call per PDF, runs in parallel via `Promise.all`. Uses `claude-haiku-4-5` (3× cheaper than Sonnet). Returns structured JSON with vendor info + line items.

**`prompts/analise-mestre.ts`** — Step 2 master analysis prompt. Single call with all extractions + `knowledge/base-conhecimento.md` injected as a prompt-cached system block. Uses `claude-sonnet-4-6`. Returns the full `AnalysisResult` JSON.

### Token-economy decisions (never change without good reason)

1. **Model split:** `EXTRACTION_MODEL = 'claude-haiku-4-5'`, `ANALYSIS_MODEL = 'claude-sonnet-4-6'` — constants in `lib/anthropic.ts`.
2. **Prompt caching:** The analysis system prompt (prompt mestre + base-conhecimento.md) is sent with `cache_control: {type: "ephemeral"}` as the last static block before the variable user content. Saves ~90% on re-reads.
3. **Local PDF extraction first:** `lib/pdf.ts` tries `pdf-parse` locally before falling back to native Anthropic PDF API (for scanned/image PDFs that need vision). DB caches extraction in `documents.extraction` — never re-extract the same document.
4. **Structured output:** `lib/schemas.ts` defines Zod schemas; `analise-mestre.ts` instructs the model to return JSON matching the schema. Output is parsed with `z.parse()` — no retry loops for bad JSON.
5. **Idempotency:** `/api/analyses/[id]/run` checks `documents.extraction` before calling the AI. If extraction already exists, it's reused. Analysis can be re-run (e.g., after prompt update) by calling the endpoint again.

### Data flow

```
POST /api/analyses          → create row in analyses + upload PDFs to Storage
POST /api/analyses/[id]/run → 
  for each doc: extract (haiku, parallel) → save documents.extraction
  compose all extractions + knowledge base
  → analyze (sonnet) → save analyses.result
  → render PDF → save report_url → send email
```

### Key files

| File | Purpose |
|---|---|
| `lib/anthropic.ts` | Anthropic client + model constants |
| `lib/supabase/server.ts` | Server-side Supabase client (SSR cookies) |
| `lib/supabase/client.ts` | Browser Supabase client |
| `lib/pdf.ts` | Local PDF text extraction (pdf-parse) |
| `lib/schemas.ts` | Zod schemas: `ExtractionResult`, `AnalysisResult` |
| `lib/report.ts` | PDF report generation (@react-pdf/renderer) |
| `prompts/extracao.ts` | Extraction system + user prompt builder |
| `prompts/analise-mestre.ts` | Master analysis prompt with knowledge injection |
| `knowledge/base-conhecimento.md` | **The competitive moat** — price ranges, composition rules, red flags |
| `supabase/migrations/` | SQL migrations + RLS policies |
| `middleware.ts` | Supabase auth session refresh |

## Database

Run migrations via Supabase CLI: `supabase db push` or apply `supabase/migrations/*.sql` in order.

Tables: `profiles`, `analyses`, `documents`, `payments` — all with RLS (each user sees only their own rows).

## Deployment

Vercel (git push = deploy). Set all env vars in Vercel dashboard. The `/api/analyses/[id]/run` route uses `maxDuration: 300` (Vercel Pro) since analysis takes 1–3 min.

## Key conventions

- **Phone/CNPJ** stripped to digits only before storing.
- **Storage buckets** are private; PDFs are served only via signed URLs (60 min expiry).
- **PDF size limit:** 30 pages max enforced before sending to AI.
- **Credits:** analyses are gated by `profiles.credits > 0`; deducted atomically when analysis starts.
- **Status flow:** `pending → extracting → analyzing → done | failed`. Each step updates `analyses.status`; on failure, `analyses.error` is set and the row can be re-run.
- Never log raw PDF content or budget line items to stdout (LGPD).
