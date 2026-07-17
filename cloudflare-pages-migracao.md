# Migração para a Cloudflare Pages (Ajuda Professor)

Guia para migrar o site do **GitHub Pages** para a **Cloudflare Pages**, mantendo o mesmo
repositório e o mesmo fluxo de trabalho (push no GitHub → deploy automático). Custo: **R$ 0**
(plano Free). Ao final, os cabeçalhos de segurança do arquivo `_headers` passam a valer
automaticamente, sem precisar de Transform Rules.

**Pré-requisitos**
- O domínio `ajudaprofessor.com.br` já adicionado à sua conta Cloudflare (Partes 1 e 2 do
  guia `cloudflare-seguranca.md` — adicionar o site e trocar os nameservers no Registro.br).
- Repositório no GitHub: `carlosadriani/aulas`.
- As últimas alterações já commitadas na `main` (faça o deploy pendente antes de migrar).

---

## Parte 1 — Criar o projeto na Cloudflare Pages

1. No painel: **Workers & Pages → Create application → Pages → Connect to Git**.
2. Na primeira vez, a Cloudflare pede para **instalar o app dela no GitHub**. Autorize o
   acesso ao repositório `aulas` (pode limitar só a esse repositório).
3. Selecione o repositório **`aulas`** e clique em **Begin setup**.

## Parte 2 — Configurar o build (site estático, sem build)

Como o site é HTML/CSS/JS puro, não há processo de build:

| Campo | Valor |
|---|---|
| **Project name** | `ajudaprofessor` (vira `ajudaprofessor.pages.dev`) |
| **Production branch** | `main` |
| **Framework preset** | `None` |
| **Build command** | `exit 0` |
| **Build output directory** | `/` |

Clique em **Save and Deploy**. Em ~1 minuto o primeiro deploy fica pronto.

> A Cloudflare também cria **previews automáticos** para outras branches (ex.: cada push na
> `develop` gera uma URL de teste própria) e para Pull Requests — ótimo para revisar antes de
> ir à produção.

## Parte 3 — Testar ANTES de apontar o domínio

Você recebe uma URL provisória `https://ajudaprofessor.pages.dev`. Teste tudo por ela:

- Navegação, fontes, ícones e o **QR Code** da página `/apoie.html`.
- O **banner de cookies** e, aceitando, o **Tempo Real** do Google Analytics.
- Os **cabeçalhos de segurança** (que vêm do `_headers`):
  ```bash
  curl -sI https://ajudaprofessor.pages.dev | grep -iE "content-security|x-frame|x-content-type|referrer-policy|permissions-policy"
  ```
- Abra o **Console do navegador** e confirme que nada é bloqueado pelo CSP.

Se algo falhar, corrija no repositório e faça push (redeploy automático) antes de seguir.

## Parte 4 — Conectar o domínio personalizado

1. No projeto: **Custom domains → Set up a custom domain**.
2. Adicione **`www.ajudaprofessor.com.br`**. Como o domínio já está na Cloudflare, o registro
   DNS é criado automaticamente e o SSL é emitido em poucos minutos.
3. (Opcional, recomendado) Adicione também o apex **`ajudaprofessor.com.br`** e configure um
   **redirecionamento do apex para o `www`** — para manter uma única URL canônica:
   - **Rules → Redirect Rules → Create rule**: se `Hostname` for `ajudaprofessor.com.br`,
     redirecione (301) para `https://www.ajudaprofessor.com.br/$1` preservando o caminho.

> Suas tags `canonical` já apontam para o `www`, então mesmo sem o redirect não há problema
> de conteúdo duplicado — o redirect é só um refinamento.

## Parte 5 — Desativar o GitHub Pages

Para não ter dois serviços publicando o mesmo repositório:

1. No GitHub: **repositório `aulas` → Settings → Pages**.
2. Em **Source**, selecione **None** (ou desative o GitHub Pages) e salve.
3. O arquivo **`CNAME`** na branch `main` era usado só pelo GitHub Pages. Pode deixá-lo (a
   Cloudflare Pages o ignora) ou removê-lo depois — não faz diferença para a Cloudflare.

## Parte 6 — Conferência final

- Acesse `https://www.ajudaprofessor.com.br` e confirme que está sendo servido pela
  Cloudflare (deploy novo, mais rápido).
- Rode o teste em https://securityheaders.com com a URL `www` — a nota deve ser **A/A+**.
- Confirme o Google Analytics registrando visitas no **Tempo Real**.

---

## Como fica o fluxo de trabalho depois

Igual ao de hoje, só que publicando pela Cloudflare:

```bash
cd ~/Adriano/Apps/aulas
git add -A
git commit -m "..."
git push origin develop          # gera um preview em *.pages.dev
# ao aprovar, leve para produção (merge para main):
git checkout main && git merge develop && git push origin main
git checkout develop
```

O push na `main` publica automaticamente em `www.ajudaprofessor.com.br`. Se algo sair errado,
use **rollback** com um clique no painel da Cloudflare Pages (Deployments → deploy anterior →
Rollback).

## Vantagens que passam a valer

- Cabeçalhos de segurança (`_headers`) aplicados automaticamente — CSP como header real, HSTS,
  X-Frame-Options — sem Transform Rules.
- Desempenho melhor no Brasil (rede de borda da Cloudflare) e banda ilimitada.
- Previews por branch/PR e rollback com um clique.
- HTTP/3 e compressão Brotli por padrão.
