import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: analyses } = await supabase
    .from('analyses')
    .select('id, title, work_type, status, created_at, completed_at')
    .order('created_at', { ascending: false })
    .limit(20);

  const statusLabel: Record<string, string> = {
    pending: 'Aguardando',
    extracting: 'Extraindo...',
    analyzing: 'Analisando...',
    done: 'Concluída',
    failed: 'Falhou',
  };

  const statusColor: Record<string, string> = {
    pending: 'text-gray-500 bg-gray-100',
    extracting: 'text-blue-600 bg-blue-50',
    analyzing: 'text-blue-600 bg-blue-50',
    done: 'text-green-700 bg-green-50',
    failed: 'text-red-600 bg-red-50',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Minhas análises</h1>
        <Link
          href="/analises/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700"
        >
          + Nova análise
        </Link>
      </div>

      {!analyses || analyses.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border">
          <p className="text-gray-400 mb-4">Nenhuma análise ainda.</p>
          <Link href="/analises/new" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700">
            Criar primeira análise
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {analyses.map((a) => (
            <Link
              key={a.id}
              href={`/analises/${a.id}`}
              className="flex items-center justify-between p-4 bg-white rounded-xl border hover:border-blue-300 transition-colors"
            >
              <div>
                <h3 className="font-semibold text-gray-900">{a.title}</h3>
                <p className="text-sm text-gray-500 capitalize">{a.work_type.replace(/_/g, ' ')}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-gray-400">
                  {new Date(a.created_at).toLocaleDateString('pt-BR')}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor[a.status] ?? ''}`}>
                  {statusLabel[a.status] ?? a.status}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
