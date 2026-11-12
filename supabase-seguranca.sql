-- =====================================================================
-- REFORÇO DE SEGURANÇA DO MURAL  ·  rode UMA vez: SQL Editor > New query > Run
-- (seguro rodar de novo; não apaga mensagens nem muda o código da turma)
-- =====================================================================

-- 1) Registro de tentativas de código errado (só o servidor enxerga; sem policy = anon não lê)
create table if not exists public.tentativas_mural (
  id bigint generated always as identity primary key,
  criado_em timestamptz not null default now()
);
alter table public.tentativas_mural enable row level security;
revoke all on public.tentativas_mural from anon, authenticated;

-- 2) anon só lê mensagens; remove qualquer outro direito direto nas tabelas
revoke all on public.mensagens, public.config_mural from anon, authenticated;
grant select on public.mensagens to anon;

-- 3) Envio com limites. Agora devolve texto ('ok' ou o motivo) em vez de lançar erro,
--    para que a tentativa errada fique registrada (erro desfaz o registro).
drop function if exists public.enviar_mensagem(text, text, text);
create function public.enviar_mensagem(p_codigo text, p_nome text, p_texto text)
returns text language plpgsql security definer set search_path = public, extensions as $$
declare v_nome text := btrim(coalesce(p_nome, '')); v_texto text := btrim(coalesce(p_texto, ''));
begin
  if not public.mural_aberto() then return 'mural_fechado'; end if;

  -- freio contra adivinhar o código: 30 erros em 10 min (no site todo) pausa o envio por alguns minutos
  if (select count(*) from public.tentativas_mural where criado_em > now() - interval '10 minutes') >= 30 then
    return 'muitas_tentativas';
  end if;

  if encode(digest(lower(btrim(coalesce(p_codigo, ''))), 'sha256'), 'hex')
       <> (select codigo_hash from public.config_mural where id = 1) then
    insert into public.tentativas_mural default values;
    delete from public.tentativas_mural where criado_em < now() - interval '1 day';
    return 'codigo_invalido';
  end if;

  -- freio contra enchente de mensagens: 20 por minuto no site todo
  if (select count(*) from public.mensagens where criado_em > now() - interval '1 minute') >= 20 then
    return 'muitas_mensagens';
  end if;

  if char_length(v_nome) not between 2 and 60 or char_length(v_texto) not between 1 and 500 then
    return 'dados_invalidos';
  end if;

  insert into public.mensagens (nome, texto) values (v_nome, v_texto);
  return 'ok';
end
$$;
revoke all on function public.enviar_mensagem(text, text, text) from public;
grant execute on function public.enviar_mensagem(text, text, text) to anon;
