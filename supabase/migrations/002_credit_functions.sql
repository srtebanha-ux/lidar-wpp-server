-- OrçaGuard — funções de manipulação de créditos (atômicas)
-- Apply after 001_initial.sql

-- Decrementa 1 crédito do usuário (não deixa negativar).
-- Retorna o número de créditos restantes, ou null se não havia crédito.
create or replace function deduct_credit(uid uuid)
returns int
language plpgsql
security definer
as $$
declare
  remaining int;
begin
  update profiles
    set credits = credits - 1
    where id = uid and credits > 0
    returning credits into remaining;
  return remaining; -- null se a condição credits > 0 falhou
end;
$$;

-- Adiciona N créditos ao usuário. Retorna o novo saldo.
create or replace function increment_credits(uid uuid, amount int)
returns int
language plpgsql
security definer
as $$
declare
  new_total int;
begin
  update profiles
    set credits = credits + amount
    where id = uid
    returning credits into new_total;
  return new_total;
end;
$$;
