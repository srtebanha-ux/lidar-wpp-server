import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('full_name, credits, plan').eq('id', user.id).single();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/dashboard" className="text-xl font-bold text-blue-600">OrçaGuard</Link>
          <div className="flex items-center gap-6">
            <span className="text-sm text-gray-500">
              {profile?.credits ?? 0} análise{(profile?.credits ?? 0) !== 1 ? 's' : ''} disponível{(profile?.credits ?? 0) !== 1 ? 'is' : ''}
            </span>
            <Link href="/dashboard/comprar" className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700">
              + Créditos
            </Link>
            <form action="/api/auth/signout" method="post">
              <button type="submit" className="text-sm text-gray-500 hover:text-gray-900">Sair</button>
            </form>
          </div>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
