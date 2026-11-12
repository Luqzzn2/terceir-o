# Site do Terceirão · 3º Informática 1

Abra o `index.html` no navegador para ver o site. Para o mural funcionar, siga o passo 1.

## 1. Ligar o mural (Supabase)

1. Crie um projeto grátis em supabase.com.
2. Abra `supabase.sql`, troque `TROQUE-ESTE-CODIGO` pelo **código da turma** (só os alunos vão saber) e cole tudo em **SQL Editor > New query > Run**.
3. Em **Project Settings > API**, copie a **Project URL** e a chave **anon public** e cole em `config.js` (`supabaseUrl` e `supabaseKey`).

Essa chave pode ficar no site: sem o código da turma, ninguém consegue escrever.

## 2. Abrir e fechar o mural

Só os alunos que souberem o código conseguem publicar. Todo mundo que abrir o site consegue **ler**.

- Fechar agora: `update public.config_mural set aberto = false where id = 1;`
- Abrir de novo: `update public.config_mural set aberto = true, fecha_em = null where id = 1;`
- Fechar sozinho em uma data: `update public.config_mural set fecha_em = '2026-11-20 23:59-03' where id = 1;`
- Apagar mensagem inadequada: `delete from public.mensagens where id = 123;`

(Rode no SQL Editor do Supabase. Esses comandos também estão no fim do `supabase.sql`.)

## 3. Colocar fotos, vídeos e nomes

Tudo se edita em `config.js`:

- **Fotos:** copie os arquivos para `assets/fotos/` e adicione em `fotos`.
- **Vídeos:** arquivo `.mp4` em `assets/videos/` ou link do YouTube (só o ID).
- **Alunos:** lista em `alunos` (troque os "Nome do Aluno N").
- **Momentos:** linha do tempo em `momentos`.
- **Formatura:** `formatura` define a contagem regressiva.

Dica: reduza fotos grandes (até ~1600 px de largura) para o site abrir rápido no celular. Vídeos pesados é melhor subir no YouTube como "não listado" e usar o ID.

## 4. Colocar no ar (grátis)

Arraste a pasta inteira em **netlify.com/drop**, ou use GitHub Pages / Cloudflare Pages. Você recebe um link para mandar para a turma.

## Cores

No topo do `style.css` (`:root`), troque as variáveis `--blue`, `--navy-900`, `--cream` etc. para mudar o visual todo.


## Reforço de segurança do mural
Depois do `supabase.sql`, rode também `supabase-seguranca.sql` (limite de tentativas e de mensagens). Veja `SEGURANCA.md`.
