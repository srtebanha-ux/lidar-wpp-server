# OrçaGuard — Analisador Inteligente de Orçamentos de Obras
### Plano de Negócio + Arquitetura de Software (Spec para Claude Code)

> Documento mestre do projeto. Use este arquivo como base do `CLAUDE.md` e como referência de escopo durante todo o desenvolvimento.
> Nome provisório: **OrçaGuard** (alternativas: FiscalObra, CompareObra, Perito.ai — decidir antes de registrar domínio).

---

## PARTE 1 — PLANO DE NEGÓCIO

### 1.1 One-liner
O perito de obras digital do síndico: sobe os orçamentos em PDF, recebe em minutos uma análise comparativa profissional apontando preços fora de mercado, itens faltantes e riscos contratuais.

### 1.2 O problema (validado por pesquisa)
- Síndicos são **obrigados** (por convenção/assembleia) a coletar geralmente 3 orçamentos antes de aprovar obras.
- As propostas chegam em formatos diferentes, sem detalhamento, impossíveis de comparar item a item.
- 61,2% dos síndicos apontam cotações/fornecedores como sua maior dificuldade (Censo SíndicoNet).
- Síndico responde **civilmente** por má contratação — o medo de errar é real e pessoal.
- Quem avalia hoje: ninguém, ou um engenheiro avulso cobrando R$ 1.500–5.000 por parecer.
- Concorrência direta com IA: **praticamente inexistente** (oceano azul).

### 1.3 A solução
Web app onde o usuário:
1. Cria a análise: descreve a obra em 2 campos (tipo de obra + observações).
2. Faz upload de 2 a 5 orçamentos em PDF (aceita também foto/imagem de orçamento).
3. Recebe em ~3 minutos um **Relatório de Análise Comparativa** contendo:
   - Tabela comparativa item a item (normalizada pela IA, mesmo com formatos diferentes)
   - Sinalização de preços fora da faixa de mercado (acima E abaixo — preço baixo demais é risco)
   - Itens presentes em um orçamento e ausentes nos outros (escopo incompleto)
   - Red flags contratuais: ausência de ART, prazo, garantia, forma de pagamento abusiva, BDI não declarado
   - Perguntas prontas para enviar a cada fornecedor (copy-paste)
   - Parecer-resumo em linguagem de assembleia (síndico apresenta direto aos condôminos)
4. Baixa o relatório em PDF profissional timbrado.

**Diferencial imbatível:** o motor de análise é calibrado com 15+ anos de conhecimento real de orçamentação (composições, BDI, faixas de preço SP, pegadinhas de fornecedor). Isso não se copia com prompt genérico.

**Posicionamento jurídico (importante):** o produto é uma *ferramenta de apoio à decisão*, não laudo técnico nem parecer de engenharia. Disclaimer claro no relatório e nos termos de uso. Para casos que exijam responsabilidade técnica formal, o relatório recomenda contratação de profissional habilitado (futura fonte de receita por indicação).

### 1.4 Público-alvo (ICP)
| Perfil | Dor | Disposição a pagar |
|---|---|---|
| **Síndico profissional** (gerencia 3–15 condomínios) | Analisa orçamentos toda semana, responde pessoalmente | Alta — é ferramenta de trabalho |
| **Administradora de condomínios** | Dezenas de cotações/mês, precisa padronizar e se proteger | Alta — B2B, assina plano maior |
| Síndico morador (voluntário) | 1–3 obras/ano, medo de errar | Média — compra avulsa |

Foco de lançamento: **síndicos profissionais de SP** (maior mercado do país, seu território, networking possível via administradoras que você já conhece do B2B).

### 1.5 Modelo de receita
| Plano | Preço | Inclui |
|---|---|---|
| **Avulso** | R$ 97 / análise | 1 análise (até 5 orçamentos) |
| **Síndico** | R$ 147 / mês | 4 análises/mês + histórico |
| **Administradora** | R$ 447 / mês | 20 análises/mês + multiusuário + logo próprio no relatório (white-label) |

- Pagamento: Mercado Pago (Pix + cartão recorrente). Pix no avulso converte muito no Brasil.
- O plano avulso é a porta de entrada e o validador: se ninguém pagar R$ 97 numa dor de R$ 500 mil (valor médio de obra condominial), o problema é o produto, não o preço.

### 1.6 Custos e margem (estimativa)
| Item | Custo mensal estimado |
|---|---|
| API Anthropic (~R$ 3–8 por análise, depende do tamanho dos PDFs) | variável (~5% da receita) |
| Vercel (hosting) | R$ 0–100 |
| Supabase | R$ 0–125 |
| Domínio + e-mail | ~R$ 30 |
| Mercado Pago | ~4% sobre receita |
| **Total fixo** | **< R$ 300/mês** |

Margem bruta projetada: **85%+**. Break-even: ~3 assinantes.

### 1.7 Metas de validação
- **Mês 1:** MVP no ar + 5 análises avulsas vendidas (validação de pagamento)
- **Mês 3:** 10 assinantes (≈ R$ 1.500 MRR)
- **Mês 6:** 40 assinantes + 2 administradoras (≈ R$ 6.500 MRR)
- Kill criteria: se em 90 dias com 500 visitantes no site ninguém comprar, repensar oferta antes de insistir.

### 1.8 Aquisição sem aparecer (zero exposição pessoal)
1. **SEO de intenção:** artigos respondendo exatamente o que síndico busca no Google ("como comparar orçamentos de obra no condomínio", "síndico é responsável por obra mal feita?"). IA escreve, você revisa tecnicamente. 2 artigos/semana.
2. **Google Ads de fundo de funil:** palavras "comparar orçamento obra condomínio", "análise de orçamento de reforma" — pouca concorrência, CPC baixo. Budget teste: R$ 300/mês.
3. **Parceria com administradoras:** você já transita nesse mundo pelo B2B da LIDAR. Uma administradora parceira = dezenas de síndicos. Comissão de 20% recorrente para quem indicar.
4. **Portais do setor:** SíndicoNet, Direcional Condomínios — mídia paga ou artigo patrocinado.
5. **Ferramenta gratuita isca:** "Checklist do orçamento de obra" interativo (lead capture) → e-mail automatizado → oferta.

### 1.9 Riscos e mitigações
| Risco | Mitigação |
|---|---|
| Síndico achar que relatório substitui engenheiro e se queimar | Disclaimer forte + tom do relatório sempre "recomendamos confirmar com..." |
| PDFs ilegíveis/escaneados ruins | OCR no pipeline + mensagem clara pedindo reenvio quando confiança baixa |
| Concorrente copiar | A base de conhecimento de preços/composições da Monica embarcada no prompt + velocidade de iteração |
| LGPD (orçamentos contêm CNPJ, valores) | Retenção limitada (90 dias), criptografia em repouso (Supabase), política de privacidade clara |
| Custo de API estourar | Limite de páginas por PDF (30) e de análises por plano; cache de extração |

---

## PARTE 2 — ARQUITETURA DE SOFTWARE

### 2.1 Princípios
- **Solo-friendly:** o mínimo de partes móveis. Nada de microsserviço, fila externa ou Kubernetes. Um repo, um deploy.
- **Boring tech:** tudo gerenciado (Vercel + Supabase), zero servidor para administrar.
- **O produto É o prompt:** 70% do valor está no motor de análise (prompt mestre + base de conhecimento). O app é um invólucro bonito em volta dele.

### 2.2 Stack
| Camada | Tecnologia | Por quê |
|---|---|---|
| Frontend + Backend | **Next.js 14 (App Router) + TypeScript** | Full-stack num projeto só; Claude Code domina |
| UI | Tailwind CSS + shadcn/ui | Rápido e profissional |
| Banco + Auth + Storage | **Supabase** (Postgres, Auth, Storage) | Auth pronto, RLS para isolamento de dados, storage para PDFs |
| IA | **Anthropic API** (Claude Sonnet com suporte nativo a PDF) | Lê PDF direto, sem parser próprio no MVP |
| Pagamento | **Mercado Pago** (Checkout Pro + Assinaturas) | Pix + recorrência no Brasil |
| Geração de PDF | `@react-pdf/renderer` (ou Puppeteer no server se precisar de layout complexo) | Relatório timbrado |
| E-mail transacional | Resend | Relatório pronto, recibo, onboarding |
| Deploy | Vercel | Git push = deploy |
| Jobs longos | Vercel Functions com `maxDuration: 300` (Pro) ou Supabase Edge Functions | Análise leva 1–3 min |

### 2.3 Diagrama (alto nível)
```
[Browser]
   │  upload PDFs + dados da obra
   ▼
[Next.js  /  Vercel]
   ├── /api/analyses  (cria análise, sobe PDFs p/ Supabase Storage)
   ├── /api/analyses/[id]/run  (function longa: pipeline de IA)
   ├── /api/webhooks/mercadopago  (pagamentos)
   │
   ▼                         ▼
[Supabase]              [Anthropic API]
 Postgres (dados)        1. Extração estruturada por PDF
 Storage (PDFs/relatórios) 2. Análise comparativa (prompt mestre)
 Auth (usuários)           3. Geração do parecer
```

### 2.4 Modelo de dados (Postgres / Supabase)
```sql
-- Usuários: gerenciados pelo Supabase Auth; perfil estendido:
create table profiles (
  id uuid primary key references auth.users,
  full_name text,
  org_name text,                -- nome da administradora, se houver
  plan text default 'free',     -- free | avulso | sindico | administradora
  credits int default 0,        -- análises disponíveis
  logo_url text,                -- white-label (plano administradora)
  created_at timestamptz default now()
);

create table analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) not null,
  title text not null,                  -- "Reforma da fachada - Cond. X"
  work_type text not null,              -- fachada | impermeabilizacao | pintura | eletrica | ...
  description text,                     -- contexto livre do usuário
  status text default 'pending',        -- pending | extracting | analyzing | done | failed
  result jsonb,                         -- saída estruturada da IA (ver schema 2.6)
  report_url text,                      -- PDF final no Storage
  error text,
  created_at timestamptz default now(),
  completed_at timestamptz
);

create table documents (
  id uuid primary key default gen_random_uuid(),
  analysis_id uuid references analyses(id) on delete cascade,
  file_url text not null,               -- Supabase Storage (bucket privado)
  original_name text,
  vendor_name text,                     -- preenchido pela IA na extração
  extraction jsonb,                     -- itens extraídos deste orçamento
  pages int,
  created_at timestamptz default now()
);

create table payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  mp_payment_id text unique,
  type text,                            -- one_time | subscription
  plan text,
  amount numeric,
  status text,                          -- approved | pending | refunded
  created_at timestamptz default now()
);

-- RLS: cada usuário só enxerga as próprias linhas (políticas em todas as tabelas).
```

### 2.5 Pipeline de análise (o coração do produto)
Endpoint `/api/analyses/[id]/run` executa em 3 passos:

**Passo 1 — Extração (1 chamada de IA por PDF, em paralelo)**
- Envia o PDF direto à API (suporte nativo a documento, base64).
- Prompt de extração pede **somente JSON**: fornecedor, CNPJ, validade, prazo, garantia, condições de pagamento, e lista de itens `{descricao, unidade, quantidade, preco_unitario, preco_total}` + campos detectados como ausentes.
- Salva em `documents.extraction`. Se confiança baixa (PDF escaneado ruim), marca para aviso ao usuário.

**Passo 2 — Análise comparativa (1 chamada com tudo junto)**
- Entrada: extrações de todos os orçamentos + tipo de obra + descrição do usuário + **base de conhecimento** (ver 2.7).
- O prompt mestre instrui a IA a agir como engenheira orçamentista sênior com 15 anos de obras B2B em SP e devolver o JSON do schema 2.6.

**Passo 3 — Relatório**
- Renderiza o JSON num PDF timbrado (capa, tabela comparativa, semáforos 🟢🟡🔴, red flags, perguntas aos fornecedores, parecer para assembleia, disclaimer).
- Sobe ao Storage, grava `report_url`, dispara e-mail "Sua análise está pronta".

**Resiliência:** cada passo atualiza `status`; em falha, grava `error` e permite re-rodar sem reprocessar extrações já feitas (idempotência por documento).

### 2.6 Schema de saída da análise (resumido)
```json
{
  "resumo_executivo": "string (5-8 linhas, linguagem de síndico)",
  "comparativo": [
    {
      "item_normalizado": "Pintura de fachada com textura",
      "unidade": "m²",
      "fornecedores": [
        {"nome": "Empresa A", "qtd": 850, "preco_unit": 48.00, "total": 40800, "flag": "ok"},
        {"nome": "Empresa B", "qtd": 850, "preco_unit": 95.00, "total": 80750, "flag": "acima_mercado"},
        {"nome": "Empresa C", "qtd": null, "preco_unit": null, "total": null, "flag": "ausente"}
      ],
      "faixa_mercado": {"min": 40, "max": 65},
      "comentario": "string"
    }
  ],
  "itens_ausentes_por_fornecedor": {"Empresa C": ["andaime", "ART", "descarte de entulho"]},
  "red_flags": [
    {"fornecedor": "Empresa B", "tipo": "contratual", "gravidade": "alta",
     "descricao": "Exige 50% de entrada sem garantia contratual"}
  ],
  "perguntas_para_fornecedores": {"Empresa A": ["...?"], "Empresa B": ["...?"]},
  "ranking": [{"fornecedor": "Empresa A", "nota": 8.2, "justificativa": "..."}],
  "parecer_assembleia": "string (texto pronto para o síndico apresentar)",
  "confianca_extracao": {"Empresa C": "baixa"}
}
```

### 2.7 Base de conhecimento (o fosso competitivo)
Arquivo `knowledge/base-conhecimento.md` injetado no prompt mestre, contendo o que só a Monica tem:
- Faixas de preço de referência por serviço (m², ponto, vb) — região SP, atualizáveis por INCC
- Composições típicas: o que DEVE constar em cada tipo de obra (ex.: impermeabilização sem teste de estanqueidade = red flag)
- BDI usual por porte de empresa e o que significa BDI ausente/escondido
- Pegadinhas clássicas de fornecedor (quantidade subestimada para ganhar na medição, "verba" sem detalhamento, exclusões em letra miúda)
- Checklist documental: ART/RRT, garantia mínima por serviço (norma de desempenho), seguro
**Manutenção:** versionar este arquivo no repo; a cada análise real revisada pela Monica, enriquecer. É o "treinamento contínuo do Robson" aplicado ao produto.

### 2.8 Estrutura de pastas
```
orcaguard/
├── CLAUDE.md                  # instruções do projeto p/ Claude Code
├── knowledge/
│   └── base-conhecimento.md   # fosso competitivo (2.7)
├── prompts/
│   ├── extracao.ts            # prompt do passo 1
│   └── analise-mestre.ts      # prompt do passo 2 (injeta knowledge)
├── app/
│   ├── (marketing)/page.tsx   # landing page
│   ├── (app)/dashboard/
│   ├── (app)/analises/[id]/
│   └── api/
│       ├── analyses/...
│       └── webhooks/mercadopago/
├── components/
├── lib/ (supabase, anthropic, mercadopago, pdf)
└── supabase/migrations/
```

### 2.9 Segurança e LGPD
- Buckets do Storage **privados**; download só por URL assinada de curta duração.
- RLS em todas as tabelas (usuário só vê o que é dele).
- Retenção: PDFs originais apagados após 90 dias (cron no Supabase); relatório mantido.
- Termos de uso + política de privacidade na landing (gerar rascunho e revisar).
- Nunca logar conteúdo dos orçamentos em texto puro.

### 2.10 Plano de construção no Claude Code (ordem de ataque)
**Fase 0 — Setup (1 sessão)**
> "Crie um projeto Next.js 14 com TypeScript, Tailwind e shadcn/ui chamado orcaguard. Configure Supabase (auth por e-mail/senha e magic link) e crie as migrations do modelo de dados deste documento, com RLS."

**Fase 1 — Motor antes de tela (2–3 sessões)** ← o mais importante primeiro
> "Implemente o pipeline de análise: rota que recebe 2+ PDFs, executa extração via Anthropic API com o prompt em prompts/extracao.ts, depois a análise comparativa com prompts/analise-mestre.ts injetando knowledge/base-conhecimento.md, validando a saída contra o schema com Zod. Crie um script de teste de linha de comando que roda o pipeline com PDFs locais."
- **Teste com orçamentos REAIS do seu acervo LIDAR antes de qualquer interface.** Iterar o prompt até a análise ficar no nível Robson. Isso é 70% do produto.

**Fase 2 — App mínimo (2 sessões)**
> "Crie o fluxo: login → nova análise (form + upload p/ Storage) → tela de progresso (polling do status) → tela de resultado renderizando o JSON → geração e download do PDF timbrado."

**Fase 3 — Pagamento (1–2 sessões)**
> "Integre Mercado Pago: compra avulsa via Checkout Pro (Pix/cartão) creditando 1 análise via webhook, e assinaturas para os planos Síndico e Administradora. Bloqueie criação de análise sem crédito."

**Fase 4 — Landing + polimento (1–2 sessões)**
> Landing page com proposta de valor, exemplo de relatório (anonimizado), preços, FAQ. E-mails transacionais via Resend. Disclaimer e termos.

**Fase 5 — Lançamento**
- Domínio + analytics (Plausible) + Google Ads fundo de funil + 1ª parceria com administradora conhecida.

### 2.11 Variáveis de ambiente
```
ANTHROPIC_API_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
MP_ACCESS_TOKEN=
MP_WEBHOOK_SECRET=
RESEND_API_KEY=
```

### 2.12 Backlog v2 (NÃO fazer no MVP)
- White-label completo para administradoras
- Comparação com histórico de análises (banco de preços crescente — vira ativo de dados)
- Upload por WhatsApp (síndico vive no WhatsApp)
- Marketplace reverso: indicar fornecedores verificados (nova linha de receita)
- Versão "construtoras": analisar orçamentos de subempreiteiros (você seria a primeira cliente 😄)

---
*Documento v1 — junho/2026. Regra de ouro do MVP: tudo que não estiver na Fase 0–5, é v2.*
