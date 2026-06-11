import fs from 'fs';
import path from 'path';
import type { ExtractionResult } from '@/lib/schemas';

let _knowledgeBase: string | null = null;

function loadKnowledgeBase(): string {
  if (!_knowledgeBase) {
    const filePath = path.join(process.cwd(), 'knowledge', 'base-conhecimento.md');
    _knowledgeBase = fs.readFileSync(filePath, 'utf-8');
  }
  return _knowledgeBase;
}

export const ANALYSIS_SCHEMA_DESCRIPTION = `{
  "resumo_executivo": "5-8 linhas em linguagem de síndico (não técnica)",
  "comparativo": [
    {
      "item_normalizado": "nome do item padronizado",
      "unidade": "m², ponto, vb, etc.",
      "fornecedores": [
        { "nome": "Empresa A", "qtd": 850, "preco_unit": 48.00, "total": 40800, "flag": "ok|acima_mercado|abaixo_mercado|ausente|sem_detalhamento" }
      ],
      "faixa_mercado": { "min": 40, "max": 65 } ou null se desconhecida,
      "comentario": "observação técnica opcional"
    }
  ],
  "itens_ausentes_por_fornecedor": { "Empresa C": ["andaime", "ART", "descarte de entulho"] },
  "red_flags": [
    { "fornecedor": "Empresa B", "tipo": "preco|contratual|documental|escopo", "gravidade": "alta|media|baixa", "descricao": "descrição objetiva" }
  ],
  "perguntas_para_fornecedores": { "Empresa A": ["Pergunta 1?", "Pergunta 2?"] },
  "ranking": [{ "fornecedor": "Empresa A", "nota": 8.2, "justificativa": "..." }],
  "parecer_assembleia": "texto pronto para o síndico apresentar em assembleia (3-5 parágrafos)",
  "confianca_extracao": { "Empresa C": "baixa" }
}`;

export function buildAnalysisSystemPrompt(): { type: 'text'; text: string; cache_control: { type: 'ephemeral' } }[] {
  const knowledge = loadKnowledgeBase();

  return [
    {
      type: 'text',
      text: `Você é a Perita OrçaGuard — engenheira orçamentista sênior com 15 anos de experiência em obras B2B no mercado condominial de São Paulo.
Seu papel é analisar orçamentos de obras com rigor técnico e devolver um relatório comparativo estruturado em JSON.

REGRAS ABSOLUTAS:
1. Responda APENAS com JSON válido, sem markdown, sem texto antes ou depois.
2. Use o schema fornecido à risca. Não adicione campos não listados.
3. Seja direta e objetiva. O síndico precisa saber o que fazer, não o que é óbvio.
4. Nunca omita red flags por educação. Se é um problema, sinalize claramente.
5. Preço abaixo do mercado é TÃO perigoso quanto preço acima — sinalize como abaixo_mercado.
6. Se itens têm nomes diferentes entre orçamentos, normalize para o mesmo nome no comparativo.
7. O parecer_assembleia deve ser em linguagem leiga — sem jargões técnicos que o síndico não entende.

POSICIONAMENTO LEGAL (obrigatório no relatório):
- Você é uma ferramenta de apoio à decisão, não um laudo técnico com responsabilidade legal.
- O parecer_assembleia deve conter: "Este relatório é uma ferramenta de apoio à decisão. Para obras de alto risco ou valor acima de R$ 500.000, recomenda-se contratar engenheiro responsável técnico."`,
      cache_control: { type: 'ephemeral' },
    },
    {
      type: 'text',
      text: `BASE DE CONHECIMENTO TÉCNICA (referência de preços, composições e red flags):

${knowledge}`,
      cache_control: { type: 'ephemeral' },
    },
  ];
}

export function buildAnalysisUserPrompt(
  workType: string,
  description: string,
  extractions: Array<{ fileName: string; extraction: ExtractionResult }>
): string {
  const extractionsText = extractions
    .map(({ fileName, extraction }) => `### ${fileName}\n${JSON.stringify(extraction, null, 2)}`)
    .join('\n\n');

  return `Analise os orçamentos abaixo para a seguinte obra e retorne o JSON de análise.

TIPO DE OBRA: ${workType}
DESCRIÇÃO DO CONDOMÍNIO / CONTEXTO: ${description || 'Não informado'}

ORÇAMENTOS EXTRAÍDOS:
${extractionsText}

SCHEMA DE SAÍDA ESPERADO:
${ANALYSIS_SCHEMA_DESCRIPTION}

Retorne APENAS o JSON, sem texto adicional.`;
}
