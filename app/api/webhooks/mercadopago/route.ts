import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createServiceClient } from '@/lib/supabase/server';

const PLAN_CREDITS: Record<string, number> = {
  avulso: 1,
  sindico: 4,
  administradora: 20,
};

function verifySignature(req: NextRequest, body: string): boolean {
  const secret = process.env.MP_WEBHOOK_SECRET;
  if (!secret) return true; // dev mode — skip verification
  const signature = req.headers.get('x-signature') ?? '';
  const ts = signature.match(/ts=([^,]+)/)?.[1] ?? '';
  const v1 = signature.match(/v1=([^,]+)/)?.[1] ?? '';
  const manifest = `id:${req.nextUrl.searchParams.get('id')};request-id:${req.headers.get('x-request-id')};ts:${ts};`;
  const expected = crypto.createHmac('sha256', secret).update(manifest).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(v1), Buffer.from(expected));
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  if (!verifySignature(req, body)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const event = JSON.parse(body);
  if (event.type !== 'payment') return NextResponse.json({ ok: true });

  const paymentId = event.data?.id;
  if (!paymentId) return NextResponse.json({ ok: true });

  // Fetch payment details from Mercado Pago
  const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` },
  });
  if (!mpRes.ok) return NextResponse.json({ error: 'MP fetch failed' }, { status: 502 });

  const payment = await mpRes.json();
  if (payment.status !== 'approved') return NextResponse.json({ ok: true });

  const userId = payment.metadata?.user_id;
  const plan = payment.metadata?.plan ?? 'avulso';
  if (!userId) return NextResponse.json({ error: 'Missing user_id in metadata' }, { status: 400 });

  const service = createServiceClient();

  // Idempotency check
  const { data: existing } = await service
    .from('payments')
    .select('id')
    .eq('mp_payment_id', String(paymentId))
    .single();
  if (existing) return NextResponse.json({ ok: true }); // already processed

  // Record payment
  await service.from('payments').insert({
    user_id: userId,
    mp_payment_id: String(paymentId),
    type: plan === 'avulso' ? 'one_time' : 'subscription',
    plan,
    amount: payment.transaction_amount,
    status: 'approved',
  });

  // Add credits atomically (RPC), then update plan
  const credits = PLAN_CREDITS[plan] ?? 1;
  await service.rpc('increment_credits', { uid: userId, amount: credits });
  await service.from('profiles').update({ plan }).eq('id', userId);

  return NextResponse.json({ ok: true });
}
