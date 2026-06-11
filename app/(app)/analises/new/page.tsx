'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

const WORK_TYPES = [
  { value: 'pintura_interna', label: 'Pintura interna' },
  { value: 'pintura_fachada', label: 'Pintura de fachada' },
  { value: 'impermeabilizacao_laje', label: 'Impermeabilização de laje' },
  { value: 'impermeabilizacao_subsolo', label: 'Impermeabilização de subsolo/garagem' },
  { value: 'recuperacao_estrutural', label: 'Recuperação estrutural' },
  { value: 'eletrica', label: 'Instalações elétricas' },
  { value: 'elevador', label: 'Elevadores' },
  { value: 'jardim_paisagismo', label: 'Jardim e paisagismo' },
  { value: 'reforma_geral', label: 'Reforma geral' },
];

export default function NewAnalysisPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (files.length < 2) { setError('Selecione pelo menos 2 PDFs.'); return; }
    if (files.length > 5) { setError('Máximo de 5 orçamentos.'); return; }

    setLoading(true);
    setError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);
    files.forEach((f) => formData.append('pdfs', f));

    const res = await fetch('/api/analyses', { method: 'POST', body: formData });
    const data = await res.json();

    if (!res.ok) { setError(data.error ?? 'Erro desconhecido.'); setLoading(false); return; }

    // Start the analysis pipeline
    await fetch(`/api/analyses/${data.id}/run`, { method: 'POST' });

    router.push(`/analises/${data.id}`);
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-8">Nova análise</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Título da análise
          </label>
          <input
            name="title"
            required
            placeholder="Ex: Reforma da fachada — Cond. Jardins"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Work type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de obra
          </label>
          <select
            name="work_type"
            required
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Selecione...</option>
            {WORK_TYPES.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contexto adicional <span className="text-gray-400">(opcional)</span>
          </label>
          <textarea
            name="description"
            rows={3}
            placeholder="Ex: Condomínio com 8 andares, fachada de 2.400m². A última pintura foi há 12 anos. Já apareceu infiltração no 7º andar."
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        {/* File upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Orçamentos em PDF <span className="text-gray-500">(2 a 5 arquivos)</span>
          </label>
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 transition-colors"
          >
            {files.length === 0 ? (
              <div>
                <p className="text-gray-500 mb-1">Clique para selecionar ou arraste os PDFs aqui</p>
                <p className="text-xs text-gray-400">PDF, JPG ou PNG — máx. 20 MB por arquivo</p>
              </div>
            ) : (
              <div>
                <p className="font-medium text-green-600 mb-2">{files.length} arquivo{files.length > 1 ? 's' : ''} selecionado{files.length > 1 ? 's' : ''}</p>
                <ul className="text-sm text-gray-500 space-y-1">
                  {files.map((f) => <li key={f.name}>{f.name}</li>)}
                </ul>
                <p className="text-xs text-blue-500 mt-2">Clique para alterar</p>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            multiple
            className="hidden"
            onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
          />
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">{error}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Enviando e iniciando análise...' : 'Analisar orçamentos'}
        </button>
      </form>
    </div>
  );
}
