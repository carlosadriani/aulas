# Cabeçalhos de segurança via Cloudflare (para www.ajudaprofessor.com.br)

O GitHub Pages não permite configurar cabeçalhos HTTP de resposta. Colocando a
**Cloudflare (plano gratuito) na frente** do GitHub Pages, você passa a poder aplicar
HSTS, anti-clickjacking, CSP como header de verdade e outras proteções — sem mudar
onde o site é hospedado.

Este guia tem 5 partes. Faça na ordem. Tempo estimado: ~30–40 min (a propagação de DNS
pode levar algumas horas).

---

## Parte 1 — Adicionar o domínio à Cloudflare

1. Crie/entre em uma conta em https://dash.cloudflare.com.
2. **Add a site** → digite `ajudaprofessor.com.br` (o domínio raiz, sem `www`).
3. Escolha o plano **Free**.
4. A Cloudflare vai escanear seus registros DNS atuais. Confira se aparecem os registros
   que hoje apontam para o GitHub Pages, tipicamente:
   - `www` → `CNAME` → `carlosadriani.github.io` (ou os IPs do GitHub Pages no raiz).
   - registros `A` do apex (`ajudaprofessor.com.br`) para os IPs do GitHub Pages:
     `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`.
   - Se algum faltar, adicione manualmente.
5. Deixe esses registros com o **proxy LIGADO (nuvem laranja)** — é o que permite aplicar
   os cabeçalhos.

## Parte 2 — Trocar os nameservers no registrador

1. A Cloudflare vai te mostrar **2 nameservers** (ex.: `xxx.ns.cloudflare.com`).
2. No painel onde você registrou o `.com.br` (Registro.br), substitua os nameservers
   atuais pelos da Cloudflare.
3. Aguarde a propagação (de minutos a algumas horas). A Cloudflare envia um e-mail quando
   o domínio ficar **Active**.

> Observação: no Registro.br, a alteração de servidores DNS fica em "DNS" → "Alterar
> servidores DNS" do domínio.

## Parte 3 — SSL/TLS correto (evita loop de redirecionamento)

Como o site fica atrás da Cloudflare, o modo de SSL precisa ser compatível com o
certificado que o GitHub Pages já fornece:

1. No painel da Cloudflare: **SSL/TLS → Overview**.
2. Selecione o modo **Full (strict)**. **NÃO** use "Flexible" — com o GitHub Pages isso
   causa loop de redirecionamento infinito.
3. Vá em **SSL/TLS → Edge Certificates** e ative **Always Use HTTPS**.

> Se você mantém "Enforce HTTPS" ligado no GitHub Pages, tudo bem — desde que o modo aqui
> seja Full (strict), não haverá loop.

## Parte 4 — Ativar HSTS (painel dedicado)

Use o painel próprio de HSTS (não coloque HSTS via Transform Rules para não duplicar):

1. **SSL/TLS → Edge Certificates → HTTP Strict Transport Security (HSTS)** → **Enable HSTS**.
2. Configure:
   - **Max Age Header**: 6 ou 12 meses.
   - **Apply HSTS Policy to subdomains (includeSubDomains)**: ligue apenas se **todos** os
     subdomínios servem HTTPS.
   - **Preload**: ligue só quando tiver certeza — é um compromisso difícil de reverter
     (o navegador passa a exigir HTTPS para o domínio mesmo antes da 1ª visita).
3. Confirme o aviso e salve.

## Parte 5 — Demais cabeçalhos via Transform Rule

1. No painel: **Rules → Transform Rules → Create rule → Modify Response Header**
   (em algumas contas: **Rules → Overview → Create rule → Response Header Transform Rule**).
2. Nome: `Security Headers`.
3. Em **If incoming requests match**, escolha **All incoming requests** (ou expressão
   `Hostname contains ajudaprofessor.com.br`).
4. Em **Then**, para cada linha abaixo clique **Add → Set static** e preencha o nome e o valor:

| Header | Valor |
|---|---|
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `SAMEORIGIN` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `geolocation=(), camera=(), microphone=(), payment=(), usb=(), browsing-topics=()` |
| `Content-Security-Policy` | *(a política longa abaixo, em uma linha só)* |

Valor do `Content-Security-Policy` (cole em uma única linha):

```
default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://cdnjs.cloudflare.com https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com https://cdn.jsdelivr.net; font-src 'self' data: https://fonts.gstatic.com https://cdnjs.cloudflare.com; img-src 'self' data: https:; connect-src 'self' https://www.google-analytics.com https://region1.google-analytics.com https://analytics.google.com https://www.googletagmanager.com; frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com
```

5. Clique em **Deploy**.

> Este CSP é o mesmo que já está nas páginas via `<meta>`, com um extra que só funciona
> como header: `frame-ancestors 'self'` (proteção anti-clickjacking real). Você pode manter
> as duas versões (meta + header) — não há conflito. O `X-Frame-Options: SAMEORIGIN` reforça
> o mesmo objetivo para navegadores antigos.

---

## Verificação

Depois de propagar, teste:

- Acesse https://securityheaders.com e informe `https://www.ajudaprofessor.com.br` —
  a nota deve subir para **A/A+**.
- Ou, no terminal:
  ```bash
  curl -sI https://www.ajudaprofessor.com.br | grep -iE "strict-transport|content-security|x-frame|x-content-type|referrer-policy|permissions-policy"
  ```
- Abra o site e o **Console do navegador**: se algo for bloqueado pelo CSP, aparece um aviso
  indicando o domínio — me avise que eu ajusto a política.

## Cuidados

- **Teste antes de divulgar.** Confira Google Fonts, ícones, o QR Code da página Apoie e o
  Google Analytics (aceite o banner e veja o Tempo Real) funcionando normalmente.
- **HSTS `preload` é definitivo na prática.** Só ligue quando tiver certeza de que o domínio
  e subdomínios ficarão sempre em HTTPS.
- **Não** use SSL "Flexible" (causa loop com o GitHub Pages).

---

## Alternativa: hospedar na Cloudflare Pages

Se um dia quiser sair do GitHub Pages, a **Cloudflare Pages** hospeda o mesmo repositório e
lê um arquivo `_headers` na raiz automaticamente (sem Transform Rules). Já deixei um
`_headers` pronto na raiz do projeto para esse cenário — ele é ignorado pelo GitHub Pages,
então não atrapalha nada agora.
