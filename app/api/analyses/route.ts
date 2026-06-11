import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check credits
  const { data: profile } = await supabase
    .from('profiles')
    .select('credits, plan')
    .eq('id', user.id)
    .single();

  if (!profile || profile.credits <= 0) {
    return NextResponse.json({ error: 'Sem créditos disponíveis. Adquira um plano para continuar.' }, { status: 402 });
  }

  const formData = await req.formData();
  const title = formData.get('title') as string;
  const workType = formData.get('work_type') as string;
  const description = formData.get('description') as string | null;
  const files = formData.getAll('pdfs') as File[];

  if (!title || !workType || files.length < 2) {
    return NextResponse.json({ error: 'Título, tipo de obra e pelo menos 2 PDFs são obrigatórios.' }, { status: 400 });
  }
  if (files.length > 5) {
    return NextResponse.json({ error: 'Máximo de 5 orçamentos por análise.' }, { status: 400 });
  }

  const service = createServiceClient();

  // Create analysis row
  const { data: analysis, error: insertError } = await service
    .from('analyses')
    .insert({ user_id: user.id, title, work_type: workType, description, status: 'pending' })
    .select()
    .single();

  if (insertError || !analysis) {
    return NextResponse.json({ error: 'Erro ao criar análise.' }, { status: 500 });
  }

  // Upload PDFs to private Storage bucket
  const documentIds: string[] = [];
  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const storagePath = `${user.id}/${analysis.id}/${file.name}`;

    const { error: uploadError } = await service.storage
      .from('orcamentos')
      .upload(storagePath, buffer, { contentType: 'application/pdf', upsert: false });

    if (uploadError) {
      await service.from('analyses').update({ status: 'failed', error: uploadError.message }).eq('id', analysis.id);
      return NextResponse.json({ error: `Erro ao fazer upload: ${uploadError.message}` }, { status: 500 });
    }

    const { data: doc } = await service
      .from('documents')
      .insert({ analysis_id: analysis.id, file_url: storagePath, original_name: file.name })
      .select()
      .single();

    if (doc) documentIds.push(doc.id);
  }

  // Deduct one credit atomically
  await service.rpc('deduct_credit', { uid: user.id });

  return NextResponse.json({ id: analysis.id }, { status: 201 });
}

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: analyses } = await supabase
    .from('analyses')
    .select('id, title, work_type, status, created_at, completed_at')
    .order('created_at', { ascending: false });

  return NextResponse.json({ analyses: analyses ?? [] });
}
