# OrçaGuard

Analisador inteligente de orçamentos de obras para síndicos. Suba 2–5 orçamentos em PDF e receba uma análise comparativa apontando preços fora do mercado, itens faltantes e riscos contratuais.

Spec completa do produto: [`docs/spec.md`](docs/spec.md) · Guia para o Claude Code: [`CLAUDE.md`](CLAUDE.md)

---

## Mover este código para um repo próprio

Este projeto nasceu num branch independente (`orcaguard`) dentro de outro repositório. Para movê-lo para um repo `orcaguard` definitivo:

```bash
git clone --branch orcaguard --single-branch \
  https://github.com/srtebanha-ux/lidar-wpp-server.git orcaguard
cd orcaguard
git remote set-url origin https://github.com/srtebanha-ux/orcaguard.git
git push -u origin orcaguard:main
```

## Setup local

```bash
npm install
cp .env.example .env.local   # preencha as chaves reais
npm run dev                  # http://localhost:3000
```

### 1. Supabase
1. Crie um projeto novo em [supabase.com](https://supabase.com).
2. Rode as migrations na ordem (`supabase/migrations/001 → 003`), via Supabase CLI (`supabase db push`) ou colando no SQL Editor.
3. A migration `003` cria o bucket privado `orcamentos` e as policies. Se preferir, crie o bucket pelo painel (Storage → New bucket → **private**).
4. Copie `Project URL`, `anon key` e `service_role key` para o `.env.local`.

### 2. Anthropic
Crie uma chave em [console.anthropic.com](https://console.anthropic.com) e coloque em `ANTHROPIC_API_KEY`.

### 3. Mercado Pago
Pegue o `Access Token` de produção em [Mercado Pago Developers](https://www.mercadopago.com.br/developers) e configure o webhook apontando para `/api/webhooks/mercadopago`. Defina `MP_ACCESS_TOKEN` e `MP_WEBHOOK_SECRET`.

## Testar o motor de IA antes da interface

O coração do produto é o pipeline de análise. Teste com orçamentos reais **antes** de mexer em telas:

```bash
mkdir -p scripts/test-pdfs
# copie 2+ PDFs de orçamentos reais para scripts/test-pdfs/
WORK_TYPE=pintura_fachada npm run test:pipeline
```

Saídas geradas para inspeção: `scripts/extractions.json` e `scripts/analysis-result.json`.

Itere `prompts/analise-mestre.ts` + `knowledge/base-conhecimento.md` até a análise ficar no nível desejado. Isso é ~70% do produto.

## Stack

Next.js 14 (App Router) · TypeScript · Tailwind · Supabase (Postgres + Auth + Storage + RLS) · Anthropic (Haiku extração / Sonnet análise) · Mercado Pago · Resend · Vercel.

## Deploy

Vercel (git push = deploy). Configure todas as env vars no painel. A rota `/api/analyses/[id]/run` usa `maxDuration: 300` (requer plano Pro).

---

> OrçaGuard é uma ferramenta de apoio à decisão, não um laudo técnico com responsabilidade legal.
