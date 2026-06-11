'use client';

import { useState } from 'react';

const PLANS = [
  {
    id: 'avulso',
    name: 'Avulso',
    price: 'R$ 97',
    period: 'pagamento único',
    desc: '1 análise (até 5 orçamentos)',
    features: ['1 crédito de análise', 'Relatório PDF completo', 'Pix ou cartão'],
    highlight: false,
  },
  {
    id: 'sindico',
    name: 'Síndico',
    price: 'R$ 147',
    period: '/ mês',
    desc: 'Para quem analisa todo mês',
    features: ['4 análises/mês', 'Histórico de análises', 'Suporte prioritário'],
    highlight: true,
  },
  {
    id: 'administradora',
    name: 'Administradora',
    price: 'R$ 447',
    period: '/ mês',
    desc: 'Para administradoras de condomínios',
    features: ['20 análises/mês', 'Multiusuário', 'Logo própria no relatório'],
    highlight: false,
  },
];

export default function ComprarPage() {
  const [loading, setLoading] = useState<string | null>(null);

  async function handleBuy(planId: string) {
    setLoading(planId);
    // Cria preferência de pagamento no Mercado Pago e redireciona ao checkout.
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan: planId }),
    });
    const data = await res.json();
    if (data.checkout_url) {
      window.location.href = data.checkout_url;
    } else {
      alert(data.error ?? 'Erro ao iniciar o pagamento.');
      setLoading(null);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Comprar créditos</h1>
      <p className="text-gray-500 mb-8">Escolha o plano ideal. Sem contrato, cancele quando quiser.</p>

      <div className="grid md:grid-cols-3 gap-6">
        {PLANS.map((plan) => (
          <div key={plan.id} className={`rounded-xl border p-6 bg-white ${plan.highlight ? 'border-blue-600 shadow-lg' : ''}`}>
            {plan.highlight && <div className="text-xs text-blue-600 font-semibold mb-2">MAIS POPULAR</div>}
            <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
            <p className="text-sm text-gray-500 mb-4">{plan.desc}</p>
            <div className="mb-6">
              <span className="text-3xl font-bold">{plan.price}</span>
              <span className="text-gray-500 text-sm"> {plan.period}</span>
            </div>
            <ul className="space-y-2 mb-8">
              {plan.features.map((f) => (
                <li key={f} className="text-sm flex items-center gap-2">
                  <span className="text-green-500">✓</span> {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleBuy(plan.id)}
              disabled={loading !== null}
              className={`w-full text-center py-3 rounded-lg font-semibold text-sm disabled:opacity-50 ${
                plan.highlight ? 'bg-blue-600 text-white hover:bg-blue-700' : 'border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {loading === plan.id ? 'Redirecionando...' : 'Contratar'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
