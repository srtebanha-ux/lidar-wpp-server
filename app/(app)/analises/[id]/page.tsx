'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { AnalysisResult } from '@/lib/schemas';

type Analysis = {
  id: string;
  title: string;
  work_type: string;
  status: string;
  result: AnalysisResult | null;
  report_url: string | null;
  error: string | null;
  created_at: string;
};

const FLAG_COLOR: Record<string, string> = {
  ok: 'text-green-700 bg-green-50',
  acima_mercado: 'text-red-700 bg-red-50',
  abaixo_mercado: 'text-yellow-700 bg-yellow-50',
  ausente: 'text-gray-500 bg-gray-100',
  sem_detalhamento: 'text-yellow-600 bg-yellow-50',
};

const FLAG_ICON: Record<string, string> = {
  ok: '🟢',
  acima_mercado: '🔴',
  abaixo_mercado: '🟡',
  ausente: '—',
  sem_detalhamento: '🟡',
};

const GRAVIDADE_COLOR: Record<string, string> = {
  alta: 'text-red-700 bg-red-50 border-red-200',
  media: 'text-yellow-700 bg-yellow-50 border-yellow-200',
  baixa: 'text-gray-600 bg-gray-50 border-gray-200',
};

export default function AnalysisDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    let interval: NodeJS.Timeout;

    async function load() {
      const { data } = await supabase
        .from('analyses')
        .select('*')
        .eq('id', id)
        .single();
      setAnalysis(data);
      setLoading(false);
      if (data?.status === 'extracting' || data?.status === 'analyzing') {
        interval = setInterval(load, 3000);
      }
    }

    load();
    return () => clearInterval(interval);
  }, [id]);

  if (loading) return <div className="text-gray-400 py-20 text-center">Carregando...</div>;
  if (!analysis) return <div className="text-red-500 py-20 text-center">Análise não encontrada.</div>;

  const { result, status, error } = analysis;

  return (
    <div>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">{analysis.title}</h1>
          <p className="text-sm text-gray-500 mt-1 capitalize">{analysis.work_type.replace(/_/g, ' ')}</p>
        </div>
        {analysis.report_url && (
          <a
            href={analysis.report_url}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700"
          >
            Baixar relatório PDF
          </a>
        )}
      </div>

      {/* Status banner */}
      {(status === 'extracting' || status === 'analyzing') && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8 text-center">
          <div className="text-blue-600 font-semibold mb-1">
            {status === 'extracting' ? 'Extraindo dados dos orçamentos...' : 'Analisando e comparando...'}
          </div>
          <p className="text-sm text-blue-500">Isso leva de 1 a 3 minutos. Esta página atualiza automaticamente.</p>
          <div className="mt-4 flex justify-center">
            <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      )}

      {status === 'failed' && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
          <p className="text-red-600 font-semibold">Falha na análise</p>
          <p className="text-sm text-red-500 mt-1">{error}</p>
        </div>
      )}

      {result && status === 'done' && (
        <div className="space-y-8">
          {/* Resumo executivo */}
          <section className="bg-white rounded-xl border p-6">
            <h2 className="font-bold text-lg mb-3">Resumo executivo</h2>
            <p className="text-gray-700 leading-relaxed">{result.resumo_executivo}</p>
          </section>

          {/* Ranking */}
          <section className="bg-white rounded-xl border p-6">
            <h2 className="font-bold text-lg mb-4">Ranking dos orçamentos</h2>
            <div className="space-y-3">
              {result.ranking.map((r, i) => (
                <div key={r.fornecedor} className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold shrink-0">
                    {i + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">{r.fornecedor}</span>
                      <span className="text-sm text-gray-500">Nota {r.nota.toFixed(1)}/10</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-0.5">{r.justificativa}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Red flags */}
          {result.red_flags.length > 0 && (
            <section className="bg-white rounded-xl border p-6">
              <h2 className="font-bold text-lg mb-4">Red flags</h2>
              <div className="space-y-3">
                {result.red_flags.map((f, i) => (
                  <div key={i} className={`border rounded-lg p-4 ${GRAVIDADE_COLOR[f.gravidade]}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm">{f.fornecedor}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full border capitalize">{f.gravidade}</span>
                      <span className="text-xs capitalize">{f.tipo}</span>
                    </div>
                    <p className="text-sm">{f.descricao}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Comparativo */}
          <section className="bg-white rounded-xl border p-6 overflow-x-auto">
            <h2 className="font-bold text-lg mb-4">Tabela comparativa</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="pb-2 pr-4 font-medium min-w-[200px]">Item</th>
                  {result.comparativo[0]?.fornecedores.map((f) => (
                    <th key={f.nome} className="pb-2 pr-4 font-medium min-w-[130px]">{f.nome}</th>
                  ))}
                  <th className="pb-2 font-medium">Faixa mercado</th>
                </tr>
              </thead>
              <tbody>
                {result.comparativo.map((item) => (
                  <tr key={item.item_normalizado} className="border-b last:border-0">
                    <td className="py-3 pr-4">
                      <div className="font-medium">{item.item_normalizado}</div>
                      <div className="text-xs text-gray-400">{item.unidade}</div>
                    </td>
                    {item.fornecedores.map((f) => (
                      <td key={f.nome} className="py-3 pr-4">
                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${FLAG_COLOR[f.flag]}`}>
                          {FLAG_ICON[f.flag]}
                          {f.total != null ? `R$ ${f.total.toLocaleString('pt-BR')}` : '—'}
                        </span>
                        {f.preco_unit != null && (
                          <div className="text-xs text-gray-400 mt-0.5">
                            R$ {f.preco_unit.toLocaleString('pt-BR')}/{item.unidade}
                          </div>
                        )}
                      </td>
                    ))}
                    <td className="py-3 text-xs text-gray-500">
                      {item.faixa_mercado
                        ? `R$ ${item.faixa_mercado.min}–${item.faixa_mercado.max}/${item.unidade}`
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* Itens ausentes */}
          {Object.keys(result.itens_ausentes_por_fornecedor).length > 0 && (
            <section className="bg-white rounded-xl border p-6">
              <h2 className="font-bold text-lg mb-4">Itens ausentes por fornecedor</h2>
              <div className="space-y-3">
                {Object.entries(result.itens_ausentes_por_fornecedor).map(([fornecedor, itens]) => (
                  <div key={fornecedor}>
                    <p className="font-semibold text-sm mb-1">{fornecedor}</p>
                    <div className="flex flex-wrap gap-2">
                      {itens.map((item) => (
                        <span key={item} className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded">{item}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Perguntas */}
          <section className="bg-white rounded-xl border p-6">
            <h2 className="font-bold text-lg mb-4">Perguntas para os fornecedores</h2>
            {Object.entries(result.perguntas_para_fornecedores).map(([fornecedor, perguntas]) => (
              <div key={fornecedor} className="mb-4">
                <h3 className="font-semibold text-sm mb-2">{fornecedor}</h3>
                <ul className="space-y-1">
                  {perguntas.map((p, i) => (
                    <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                      <span className="text-blue-400 shrink-0">→</span> {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </section>

          {/* Parecer assembleia */}
          <section className="bg-blue-50 rounded-xl border border-blue-100 p-6">
            <h2 className="font-bold text-lg mb-3">Parecer para apresentar em assembleia</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{result.parecer_assembleia}</p>
          </section>

          {/* Legal disclaimer */}
          <p className="text-xs text-gray-400 text-center pb-4">
            Este relatório é uma ferramenta de apoio à decisão, não um laudo técnico com responsabilidade legal.
            Para obras de alto risco ou valor acima de R$ 500.000, recomenda-se contratar engenheiro responsável técnico.
          </p>
        </div>
      )}
    </div>
  );
}
