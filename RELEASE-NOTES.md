# Release Notes — Ajuda Professor

Histórico de versões do site. Formato inspirado no
[Keep a Changelog](https://keepachangelog.com/pt-BR/).

**Como usar:** registre cada mudança relevante na seção **[Não publicado]**, agrupada por
tipo (Adicionado, Alterado, Corrigido, Segurança, Documentação). Ao publicar na `main`,
renomeie "[Não publicado]" para uma versão datada (ex.: `## [1.0.0] — 2026-07-24`) e comece
uma nova seção "[Não publicado]" vazia no topo.

---

## [Não publicado]

_Branch: `feature/controle-acesso-cursos` (a partir da `develop`). Ainda não publicado na `main`._

### Adicionado
- **SEO:** `rel=canonical` em todas as páginas, `sitemap.xml` e `robots.txt`.
- **Compartilhamento:** meta tags Open Graph e Twitter Card em todas as páginas; imagem
  `imagens/og-share.png` (1200×630) no estilo do site.
- **Analytics (LGPD):** Google Analytics 4 com **Consent Mode v2** via
  `assets/js/analytics-consent.js` — cookies de análise desativados por padrão, banner de
  consentimento e injeção dos links de rodapé.
- **Página de privacidade** (`privacidade.html`).
- **Página "Apoie o projeto"** (`apoie.html`) com PIX: QR Code (BR Code gerado no navegador),
  "copia e cola", botões de valor sugerido e aviso de conferência do recebedor.
- **Controle de acesso a cursos** (Cloudflare Pages + Functions + D1): `schema.sql`, `lib/`,
  `functions/` (login Google, sessão, imposição de acesso, API admin), `admin/index.html` e
  `login.html`.

### Alterado
- **Rodapés padronizados** (`.site-footer`) em todas as páginas, por disciplina.
- Descrições (`meta description`) próprias para a home e os índices das disciplinas.

### Segurança
- **CSP** via `<meta http-equiv="Content-Security-Policy">` em todas as páginas.
- Arquivo `_headers` (Cloudflare Pages/Netlify) com HSTS, X-Frame-Options, Referrer-Policy,
  Permissions-Policy e CSP como header.
- Biblioteca de QR com auto-hospedagem + fallback (reduz dependência de CDN).

### Documentação
- `CLAUDE.md` (manual de bordo), `cloudflare-seguranca.md`, `cloudflare-pages-migracao.md`,
  `controle-acesso-guia.md` e este `RELEASE-NOTES.md`.

### Pendências
- Rodar os testes automatizados da lógica de sessão/permissões (bloqueado por ambiente).
- Migrar para a Cloudflare Pages e configurar OAuth/D1/segredos para ativar o controle de acesso.
- Verificação final no site publicado (banner, links, GA4 Tempo Real).

---

<!--
## [1.0.0] — AAAA-MM-DD
Primeira versão publicada com <resumo>.
-->
