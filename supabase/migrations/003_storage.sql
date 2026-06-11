-- OrçaGuard — bucket de Storage privado para orçamentos
-- Apply after 002. Pode também ser feito pelo painel do Supabase.

insert into storage.buckets (id, name, public)
values ('orcamentos', 'orcamentos', false)
on conflict (id) do nothing;

-- Usuário só acessa arquivos sob seu próprio prefixo: {user_id}/...
create policy "orcamentos: usuário lê os próprios"
  on storage.objects for select
  using (
    bucket_id = 'orcamentos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "orcamentos: usuário envia os próprios"
  on storage.objects for insert
  with check (
    bucket_id = 'orcamentos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
