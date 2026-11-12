-- =====================================================================
-- MURAL DO TERCEIRÃO  ·  cole tudo isto no Supabase: SQL Editor > New query > Run
-- Antes de rodar, TROQUE o código da turma na linha marcada com  <<< TROCAR
-- =====================================================================

create extension if not exists pgcrypto with schema extensions;

-- Configuração do mural (uma única linha): aberto/fechado + código da turma
create table if not exists public.config_mural (
  id          int primary key default 1 check (id = 1),
  aberto      boolean not null default true,
  fecha_em    timestamptz,                 -- opcional: fecha sozinho nessa data
  codigo_hash text not null                -- o código nunca fica salvo em texto puro
);

-- Mensagens dos alunos
create table if not exists public.mensagens (
  id        bigint generated always as identity primary key,
  nome      text not null check (char_length(nome)  between 2 and 60),
  texto     text not null check (char_length(texto) between 1 and 500),
  criado_em timestamptz not null default now()
);

-- Segurança: RLS ligada. O site (anon) só pode LER mensagens.
-- Não existe policy de insert: ninguém grava direto na tabela.
alter table public.config_mural enable row level security;
alter table public.mensagens    enable row level security;

drop policy if exists "todos leem mensagens" on public.mensagens;
create policy "todos leem mensagens" on public.mensagens for select to anon using (true);

-- Código da turma (letras minúsculas, sem espaços nas pontas).      <<< TROCAR
insert into public.config_mural (id, codigo_hash)
values (1, encode(extensions.digest(lower(btrim('TROQUE-ESTE-CODIGO')), 'sha256'), 'hex'))
on conflict (id) do nothing;

-- O site pergunta se o mural está aberto
create or replace function public.mural_aberto()
returns boolean language sql stable security definer set search_path = public as $$
  select aberto and (fecha_em is null or now() < fecha_em)
  from public.config_mural where id = 1
$$;

-- Única porta de escrita: confere se está aberto e se o código está certo
create or replace function public.enviar_mensagem(p_codigo text, p_nome text, p_texto text)
returns void language plpgsql security definer set search_path = public, extensions as $$
begin
  if not public.mural_aberto() then
    raise exception 'mural_fechado';
  end if;
  if encode(digest(lower(btrim(coalesce(p_codigo, ''))), 'sha256'), 'hex')
       <> (select codigo_hash from public.config_mural where id = 1) then
    raise exception 'codigo_invalido';
  end if;
  insert into public.mensagens (nome, texto) values (btrim(p_nome), btrim(p_texto));
end
$$;

revoke all on function public.mural_aberto()                      from public;
revoke all on function public.enviar_mensagem(text, text, text)    from public;
grant execute on function public.mural_aberto()                    to anon;
grant execute on function public.enviar_mensagem(text, text, text) to anon;

-- =====================================================================
-- COMANDOS PARA USAR DEPOIS (rode um de cada vez no SQL Editor)
-- =====================================================================
-- FECHAR o mural agora:
--   update public.config_mural set aberto = false where id = 1;
-- ABRIR de novo:
--   update public.config_mural set aberto = true, fecha_em = null where id = 1;
-- Fechar sozinho numa data (ex.: 20/11/2026 às 23:59):
--   update public.config_mural set fecha_em = '2026-11-20 23:59-03' where id = 1;
-- Trocar o código da turma:
--   update public.config_mural
--   set codigo_hash = encode(extensions.digest(lower(btrim('NOVO-CODIGO')), 'sha256'), 'hex') where id = 1;
-- Apagar uma mensagem inadequada:
--   delete from public.mensagens where id = 123;
