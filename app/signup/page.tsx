'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const { error } = await supabase.auth.signUp({
      email: form.get('email') as string,
      password: form.get('password') as string,
      options: { data: { full_name: form.get('full_name') } },
    });
    if (error) { setError(error.message); setLoading(false); return; }
    setDone(true);
  }

  if (done) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-xl border p-8 w-full max-w-md text-center">
          <div className="text-4xl mb-4">📧</div>
          <h2 className="text-xl font-bold mb-2">Verifique seu e-mail</h2>
          <p className="text-gray-500 text-sm">Enviamos um link de confirmação para o seu e-mail. Clique nele para ativar a conta.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl border p-8 w-full max-w-md">
        <Link href="/" className="text-xl font-bold text-blue-600 block mb-8">OrçaGuard</Link>
        <h1 className="text-2xl font-bold mb-6">Criar conta</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nome completo</label>
            <input name="full_name" type="text" required className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">E-mail</label>
            <input name="email" type="email" required className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Senha</label>
            <input name="password" type="password" required minLength={8} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50">
            {loading ? 'Criando conta...' : 'Criar conta'}
          </button>
        </form>
        <p className="text-sm text-center text-gray-500 mt-6">
          Já tem conta? <Link href="/login" className="text-blue-600 hover:underline">Entrar</Link>
        </p>
      </div>
    </div>
  );
}
