import type { ExtractionResult } from '@/lib/schemas';

export const EXTRACTION_SYSTEM = `Você é um assistente especializado em leitura de orçamentos de obras no Brasil.
Sua tarefa é extrair SOMENTE os dados estruturados do documento fornecido e devolvê-los como JSON.
Não faça análise, não emita opinião. Apenas extraia os dados presentes no documento.
Se um campo não estiver presente, use null.
Responda APENAS com JSON válido, sem markdown, sem explicação.`;

export function buildExtractionUserPrompt(pdfText: string, fileName: string): string {
  return `Extraia os dados do orçamento abaixo e retorne JSON no seguinte schema exato:

{
  "fornecedor": "Nome da empresa",
  "cnpj": "00.000.000/0001-00 ou null",
  "validade": "data ou prazo de validade da proposta ou null",
  "prazo_execucao": "prazo de execução dos serviços ou null",
  "garantia": "prazo de garantia declarado ou null",
  "condicoes_pagamento": "forma de pagamento descrita ou null",
  "valor_total": 00000.00 (número, sem símbolo) ou null,
  "bdi_percentual": 00.0 (número) ou null,
  "itens": [
    {
      "descricao": "descrição do item",
      "unidade": "m², ponto, vb, etc. ou null",
      "quantidade": 00.0 ou null,
      "preco_unitario": 00.0 ou null,
      "preco_total": 00.0 ou null
    }
  ],
  "campos_ausentes": ["lista de campos importantes não encontrados"],
  "confianca": "alta | media | baixa",
  "notas": "observações relevantes ou null"
}

Arquivo: ${fileName}

TEXTO DO ORÇAMENTO:
---
${pdfText}
---`;
}

// For scanned PDFs — sends the PDF directly to the API as a document block
export function buildExtractionMessagesWithVision(
  pdfBase64: string,
  fileName: string
): { role: 'user'; content: Anthropic.ContentBlockParam[] }[] {
  return [
    {
      role: 'user',
      content: [
        {
          type: 'document',
          source: { type: 'base64', media_type: 'application/pdf', data: pdfBase64 },
          title: fileName,
        } as any,
        {
          type: 'text',
          text: buildExtractionUserPrompt('[texto extraído do documento acima]', fileName).replace(
            'TEXTO DO ORÇAMENTO:\n---\n[texto extraído do documento acima]\n---',
            'Extraia os dados do documento PDF acima.'
          ),
        },
      ],
    },
  ];
}

import Anthropic from '@anthropic-ai/sdk';
