/**
 * PDF report generation using @react-pdf/renderer.
 * Called after analysis completes to produce the downloadable report.
 * TODO: implement full layout in Fase 2. This is the stub.
 */

import type { AnalysisResult } from './schemas';

export async function generateReportPdf(
  analysis: { title: string; work_type: string; created_at: string },
  result: AnalysisResult,
  logoUrl?: string
): Promise<Buffer> {
  // Lazy import to avoid loading @react-pdf/renderer in edge runtime
  const { pdf, Document, Page, Text, View, StyleSheet } = await import('@react-pdf/renderer');
  const React = await import('react');

  const styles = StyleSheet.create({
    page: { padding: 48, fontFamily: 'Helvetica', fontSize: 11 },
    title: { fontSize: 22, fontWeight: 'bold', marginBottom: 4 },
    subtitle: { fontSize: 12, color: '#6b7280', marginBottom: 24 },
    sectionTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 8, marginTop: 20 },
    body: { lineHeight: 1.6, color: '#374151' },
    disclaimer: { fontSize: 8, color: '#9ca3af', marginTop: 32, borderTop: '1pt solid #e5e7eb', paddingTop: 8 },
  });

  const doc = React.createElement(
    Document,
    null,
    React.createElement(
      Page,
      { size: 'A4', style: styles.page },
      React.createElement(Text, { style: styles.title }, 'OrçaGuard — Relatório de Análise'),
      React.createElement(Text, { style: styles.subtitle }, `${analysis.title} • ${new Date(analysis.created_at).toLocaleDateString('pt-BR')}`),
      React.createElement(Text, { style: styles.sectionTitle }, 'Resumo Executivo'),
      React.createElement(Text, { style: styles.body }, result.resumo_executivo),
      React.createElement(Text, { style: styles.sectionTitle }, 'Parecer para Assembleia'),
      React.createElement(Text, { style: styles.body }, result.parecer_assembleia),
      React.createElement(
        Text,
        { style: styles.disclaimer },
        'Este relatório é uma ferramenta de apoio à decisão, não um laudo técnico com responsabilidade legal. ' +
        'Para obras de alto risco ou valor acima de R$ 500.000, recomenda-se contratar engenheiro responsável técnico. ' +
        `Gerado em ${new Date().toLocaleDateString('pt-BR')} por OrçaGuard.`
      )
    )
  );

  const stream = await pdf(doc).toBuffer();
  return stream;
}
