import { z } from 'zod';

export const FlagSchema = z.enum(['ok', 'acima_mercado', 'abaixo_mercado', 'ausente', 'sem_detalhamento']);

export const VendorItemSchema = z.object({
  nome: z.string(),
  qtd: z.number().nullable(),
  preco_unit: z.number().nullable(),
  total: z.number().nullable(),
  flag: FlagSchema,
});

export const ComparativoItemSchema = z.object({
  item_normalizado: z.string(),
  unidade: z.string(),
  fornecedores: z.array(VendorItemSchema),
  faixa_mercado: z.object({ min: z.number().nullable(), max: z.number().nullable() }).nullable(),
  comentario: z.string().optional(),
});

export const RedFlagSchema = z.object({
  fornecedor: z.string(),
  tipo: z.enum(['preco', 'contratual', 'documental', 'escopo']),
  gravidade: z.enum(['alta', 'media', 'baixa']),
  descricao: z.string(),
});

export const RankingItemSchema = z.object({
  fornecedor: z.string(),
  nota: z.number().min(0).max(10),
  justificativa: z.string(),
});

export const AnalysisResultSchema = z.object({
  resumo_executivo: z.string(),
  comparativo: z.array(ComparativoItemSchema),
  itens_ausentes_por_fornecedor: z.record(z.string(), z.array(z.string())),
  red_flags: z.array(RedFlagSchema),
  perguntas_para_fornecedores: z.record(z.string(), z.array(z.string())),
  ranking: z.array(RankingItemSchema),
  parecer_assembleia: z.string(),
  confianca_extracao: z.record(z.string(), z.enum(['alta', 'media', 'baixa'])).optional(),
});

export type AnalysisResult = z.infer<typeof AnalysisResultSchema>;

// ── Extraction (per document) ──────────────────────────────

export const LineItemSchema = z.object({
  descricao: z.string(),
  unidade: z.string().nullable(),
  quantidade: z.number().nullable(),
  preco_unitario: z.number().nullable(),
  preco_total: z.number().nullable(),
});

export const ExtractionResultSchema = z.object({
  fornecedor: z.string(),
  cnpj: z.string().nullable(),
  validade: z.string().nullable(),
  prazo_execucao: z.string().nullable(),
  garantia: z.string().nullable(),
  condicoes_pagamento: z.string().nullable(),
  valor_total: z.number().nullable(),
  bdi_percentual: z.number().nullable(),
  itens: z.array(LineItemSchema),
  campos_ausentes: z.array(z.string()),
  confianca: z.enum(['alta', 'media', 'baixa']),
  notas: z.string().optional(),
});

export type ExtractionResult = z.infer<typeof ExtractionResultSchema>;
