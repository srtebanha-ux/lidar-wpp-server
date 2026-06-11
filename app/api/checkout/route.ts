import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const PLAN_CONFIG: Record<string, { title: string; price: number; recurring: boolean }> = {
  avulso: { title: 'OrçaGuard — 1 análise', price: 97, recurring: false },
  sindico: { title: 'OrçaGuard — Plano Síndico', price: 147, recurring: true },
  administradora: { title: 'OrçaGuard — Plano Administradora', price: 447, recurring: true },
};

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { plan } = await req.json();
  const config = PLAN_CONFIG[plan];
  if (!config) return NextResponse.json({ error: 'Plano inválido.' }, { status: 400 });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

  // Cria preferência de Checkout Pro no Mercado Pago.
  // Para assinaturas (recurring) o ideal é usar a API de Preapproval; aqui mantemos
  // Checkout Pro simples como base — trocar por preapproval na Fase 3.
  const preference = {
    items: [
      {
        title: config.title,
        quantity: 1,
        unit_price: config.price,
        currency_id: 'BRL',
      },
    ],
    payer: { email: user.email },
    metadata: { user_id: user.id, plan },
    back_urls: {
      success: `${appUrl}/dashboard?pagamento=sucesso`,
      failure: `${appUrl}/dashboard/comprar?pagamento=falhou`,
      pending: `${appUrl}/dashboard?pagamento=pendente`,
    },
    auto_return: 'approved',
    notification_url: `${appUrl}/api/webhooks/mercadopago`,
  };

  const mpRes = await fetch('https://api.mercadopago.com/checkout/preferences', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(preference),
  });

  if (!mpRes.ok) {
    const detail = await mpRes.text();
    console.error('[checkout] MP error:', detail);
    return NextResponse.json({ error: 'Erro ao criar pagamento no Mercado Pago.' }, { status: 502 });
  }

  const data = await mpRes.json();
  return NextResponse.json({ checkout_url: data.init_point });
}
