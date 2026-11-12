# Segurança do site do Terceirão: matriz de requisitos

Este site é estático (HTML/CSS/JS) com um mural no Supabase. Não há login, pagamento, pedidos, entregadores nem dados pessoais além de nome e mensagem do mural. Por isso, a maior parte dos módulos 22 a 26 (Tucaí) **não se aplica** aqui.

| Requisito | Estado | Evidência |
|---|---|---|
| XSS: texto do mural nunca vira HTML | Implementado e testado | `script.js` usa `textContent` (sem `innerHTML`) |
| CSP, `referrer`, sem objetos/frames externos | Implementado e testado | meta em `index.html`; navegador sem violações via servidor local |
| Chave do Supabase só pública | Implementado | `config.js` tem apenas `sb_publishable_…` |
| RLS ligada; anon só lê mensagens | Implementado (rodar SQL) | `supabase.sql` + `supabase-seguranca.sql` (revoke/grant) |
| Escrita só por função com checagem | Implementado | `enviar_mensagem` (security definer, `search_path` fixo) |
| SQL injection | Implementado | só consultas parametrizadas via RPC; sem SQL dinâmico |
| Código da turma guardado com hash | Implementado | SHA-256 em `config_mural` |
| Limite de tentativas de código | **Pendente: rodar `supabase-seguranca.sql`** | 30 erros/10 min pausam o envio |
| Limite de mensagens | **Pendente: rodar `supabase-seguranca.sql`** | 20/min |
| Validação no servidor (tamanho) | Implementado | `check` nas colunas + função |
| Privacidade/LGPD | Parcial | aviso no mural; sem cookies/rastreadores. Controlador e contato de privacidade **dependem de você** |
| Fontes do Google expõem IP ao Google | Aberto | hospedar as fontes no próprio site elimina isso |
| `supabase-js` sem versão/SRI fixos | Aberto | fixar versão exata e hash após testar |
| Cabeçalhos HTTP (HSTS, X-Frame-Options, nosniff, CSP completa) | Parcial | arquivo `_headers` pronto (vale em Netlify/Cloudflare Pages; em outra hospedagem, copie para a config dela) |
| Vídeos do YouTube isolados | Implementado | iframe com `sandbox` e `no-referrer`, domínio `youtube-nocookie` |
| Backups do Supabase | Dependente de fornecedor | verificar no painel do seu plano |
| Revisão jurídica | Dependente de validação jurídica | |

Conformidade integral **não** é declarada.
