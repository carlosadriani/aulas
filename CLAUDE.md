# CLAUDE.md — Manual de bordo do projeto "Ajuda Professor"

Contexto para o Claude/Cowork ao trabalhar neste repositório. Leia antes de agir.
Mantenha este arquivo **atualizado** quando uma decisão mudar.

## Visão geral

Site de materiais didáticos do **Prof. MSc. Carlos Adriani Lara Schaeffer**. Conteúdo em **português**.
Público: estudantes e demais interessados.
É um **site estático** (HTML/CSS/JS), organizado por disciplina.

- Domínio público: **https://www.ajudaprofessor.com.br**
- Repositório: **github.com/carlosadriani/aulas**
- Pasta local: `~/Adriano/Apps/aulas`

## Estrutura e convenções

- Uma **pasta por disciplina**, cada uma com um `index.html` que lista os tópicos, e uma
  página por tópico com a explicação aprofundada. Disciplinas atuais:
  `CloudComputing/`, `GestaoDeSegurancaDaInformacao/`, `ServicosDeRedes/`,
  `OrganizacaoDeComputadores/`, `TecnologiasDigitaisDocente/`, `DicionarioDeInformatica/`,
  `google_planilhas/`.
- Página inicial: `index.html` (raiz), com um card/link por disciplina.
- Recursos compartilhados: `assets/css/site.css`, `assets/js/`, `imagens/`.
- Nomes de tópico seguem padrões como `topico-*.html`, `aula0X-*.html`, `gestao-*.html`.
- Arquivos com sufixo `_old` são versões antigas: **não indexar** (têm `noindex`) e **excluir
  do sitemap**.

## Identidade visual (site.css)

Variáveis de cor: `--navy #003366`, `--blue #3b82f6`, `--gold #f59e0b`, `--ink #0f172a`,
`--bg #f1f5f9`. Fonte principal: **Inter**. Rodapé padrão: `.site-footer`
(© 2026 Prof. MSc. Carlos A. L. Schaeffer | <Disciplina>).

## Padrão do `<head>` das páginas

Toda página pública deve ter, logo após `<meta charset>`:
1. **CSP** via `<meta http-equiv="Content-Security-Policy">` (mesma política das demais).
2. Snippet do **GA4** + `/assets/js/analytics-consent.js`.
3. **canonical**, **description**, **Open Graph** e **Twitter** (imagem: `imagens/og-share.png`).

O arquivo `assets/js/analytics-consent.js` cuida sozinho de: GA4 com **Consent Mode v2 (LGPD)**,
banner de cookies e injeção dos links de rodapé ("Apoie o projeto", "Privacidade",
"Preferências de cookies"). Não duplicar essa lógica nas páginas.

## Convenções de escrita de conteúdo (páginas de tópico)

Ao criar ou editar uma página de tópico, seguir estas convenções:

- **Idioma e tom:** português (pt-BR), didático, claro e acessível a estudantes de graduação.
  Explicar o "porquê", não só o "o quê". Usar exemplos, analogias e progressão do simples
  ao avançado.
- **Profundidade:** cada tópico deve ter explicação **aprofundada** (não superficial), que é
  a proposta do site. Prefira seções bem divididas a um bloco único de texto.
- **Estrutura:** título `<h1>` claro; introdução curta situando o assunto; seções com
  subtítulos (`<h2>`/`<h3>`); listas e tabelas quando ajudarem; conclusão/resumo quando fizer
  sentido.
- **Precisão técnica:** conferir fatos antes de afirmar. Nas disciplinas técnicas
  (Redes, Segurança), citar **RFCs, normas ISO/NIST e fontes** — e **preservar os rodapés de
  "Referências"** existentes (são conteúdo intencional, não substituir pelo rodapé padrão).
- **Identidade visual:** reutilizar `assets/css/site.css` e as classes já existentes; seguir
  as cores e a fonte Inter. Não inventar um novo estilo por página sem necessidade.
- **Imagens:** guardar em `imagens/`; sempre com `alt` descritivo. Otimizar tamanho.
- **Acessibilidade:** hierarquia correta de headings, bom contraste, links com texto
  significativo (evitar "clique aqui").
- **Navegação:** interligar tópicos relacionados e o glossário da disciplina quando útil.
- **`<head>`:** replicar o padrão da seção acima (CSP, GA4, canonical, description, OG/Twitter)
  e adicionar a página nova ao `sitemap.xml`.

## Hospedagem e deploy

- Hoje: **GitHub Pages** (serve a branch **`main`**, que contém o arquivo `CNAME`).
- Planejado: migrar para **Cloudflare Pages** (necessário para o backend de controle de acesso).
- Fluxo git (git-flow): trabalha-se na **`develop`** e leva-se para a **`main`** via Pull
  Request. A `main` é a branch publicada.
- **REGRA: todo trabalho novo (feature, correção, conteúdo) deve ser feito em uma branch
  criada a partir da `develop`** (ex.: `feature/nome-curto`), nunca commitando direto na
  `develop` ou na `main`. Fluxo: `git checkout develop && git pull` → `git checkout -b
  feature/...` → trabalha → PR de volta para a `develop`.
- Comandos típicos:
  ```bash
  git checkout develop && git pull origin develop
  git checkout -b feature/minha-alteracao
  # ... trabalho ...
  git add -A && git commit -m "..." && git push -u origin feature/minha-alteracao
  # depois: PR feature/... -> develop  e, quando publicar, develop -> main
  ```
- **A cada mudança relevante, atualizar o `RELEASE-NOTES.md`** (ver seção Guias).

## Fatos e identificadores

- Google Analytics 4: **G-ZHE86CNTZB**
- E-mail de contato/admin: `carlos.schaeffer@skymed.app.br` (admin do painel pode ser outro
  Google; conferir na tabela `admins`)
- PIX de doação (página `apoie.html`): chave `carlos.schaeffer@gmail.com`

## Controle de acesso a cursos (Cloudflare Pages + Functions + D1)

Arquitetura para restringir cursos por **turma** e por **aluno individual**, com login Google.

- `schema.sql` — modelo D1 (turmas, alunos, cursos, permissões, admins).
- `lib/` — lógica compartilhada (sessão HMAC, OAuth Google, cookies, decisão de acesso).
- `functions/` — backend (login, callback, logout, `/api/me`, `/api/admin/*`, e o
  `_middleware.js` que impõe o acesso).
- `admin/index.html` — painel de administração (criar turmas, cadastrar alunos, cursos e
  permissões). Só responde para e-mails na tabela `admins`.
- Guia completo de configuração: **`controle-acesso-guia.md`**.

> **`functions/` e `lib/` são ignorados pelo GitHub Pages** — só ganham vida na Cloudflare
> Pages. Adicioná-los NÃO quebra o site estático atual.

## Regras da casa (faça / não faça)

- **Nunca** commitar segredos (Client Secret do Google, `SESSION_SECRET`, tokens). Segredos
  ficam apenas nas variáveis de ambiente da Cloudflare.
- Ao usar um **novo domínio externo** (script, fonte, imagem, iframe), **atualizar o CSP** de
  todas as páginas e do arquivo `_headers`, senão o recurso é bloqueado.
- Ao criar uma **página nova**, replicar o padrão de `<head>` acima e adicioná-la ao
  `sitemap.xml`.
- Preservar rodapés de "Referências" dos tópicos (são conteúdo intencional), não os
  substituir pelo rodapé padrão.
- O QR Code do PIX (`apoie.html`) é gerado no navegador a partir do BR Code; a chave fica no
  topo do script da página.

## Guias detalhados (fonte de verdade por tema)

- `cloudflare-seguranca.md` — Cloudflare na frente do site: SSL, HSTS, cabeçalhos.
- `cloudflare-pages-migracao.md` — migrar do GitHub Pages para a Cloudflare Pages.
- `controle-acesso-guia.md` — configurar login Google, D1, segredos e o painel.
- `_headers` — cabeçalhos de segurança para Cloudflare Pages/Netlify.
- `RELEASE-NOTES.md` — histórico de versões (changelog). **Atualizar a cada mudança
  relevante**, na seção "Não publicado", movendo para uma versão datada ao publicar na `main`.

## Ambiente de execução (nota operacional)

O ambiente Linux do Cowork (onde o Claude roda testes/git) é um sandbox temporário — **não é
o computador do usuário**. Se ele falhar por "falta de espaço", geralmente é transitório:
iniciar uma sessão nova costuma resolver. Se sobrar um `.git/index.lock`, remover com
`rm -f .git/index.lock`.

---
_Última atualização: 24/07/2026. Ao mudar decisões (hospedagem, stack, convenções), edite
este arquivo._
