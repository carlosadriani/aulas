# Controle de acesso a cursos — guia de configuração

Sistema de login com Google + turmas + permissões por curso, rodando em
**Cloudflare Pages + Functions + D1**. Este guia liga tudo. Antes de configurar,
entenda a arquitetura e o que já foi construído.

## O que já está no repositório

```
schema.sql                         Modelo de dados (D1)
wrangler.toml                      Configuração da Pages + binding do D1
lib/                               Lógica compartilhada (sessão, OAuth, permissões)
functions/
  _middleware.js                   Impõe o acesso aos cursos
  auth/login.js  callback.js  logout.js   Fluxo de login Google
  api/me.js                        Estado da sessão
  api/admin/_middleware.js         Protege a API do painel (só admins)
  api/admin/[[path]].js            API do painel (state + mutate)
login.html                         Tela "Entrar com Google"
admin/index.html                   Painel de administração
```

> **Importante:** as pastas `functions/` e `lib/` são **ignoradas pelo GitHub Pages**.
> Elas só ganham vida na **Cloudflare Pages**. Ou seja, nada disso quebra o site atual —
> mas o controle de acesso só funciona depois de migrar para a Cloudflare Pages.

## Pré-requisito

Migrar o site para a **Cloudflare Pages** (guia `cloudflare-pages-migracao.md`). O restante
assume que o projeto `ajudaprofessor` já existe na Pages, conectado ao repositório.

Instale o Wrangler (CLI da Cloudflare) para os comandos de banco:
```bash
npm install -g wrangler
wrangler login
```

---

## Parte 1 — Criar o banco D1 e as tabelas

```bash
cd ~/Adriano/Apps/aulas

# 1. Cria o banco (copie o database_id que aparecer na saída)
wrangler d1 create ajudaprofessor

# 2. Cole o database_id no wrangler.toml (campo database_id)

# 3. Cria as tabelas no banco remoto
wrangler d1 execute ajudaprofessor --remote --file=./schema.sql

# 4. Cadastre seu e-mail de administrador (a conta Google com que você fará login)
wrangler d1 execute ajudaprofessor --remote \
  --command "INSERT OR IGNORE INTO admins (email) VALUES ('carlos.schaeffer@gmail.com')"
```

## Parte 2 — Ligar o banco ao projeto Pages

No painel: **Pages → ajudaprofessor → Settings → Functions → D1 database bindings** →
**Add binding**: nome da variável `DB`, banco `ajudaprofessor`. (Isso corresponde ao
`env.DB` usado no código.)

## Parte 3 — Credenciais do Google (OAuth)

1. Acesse https://console.cloud.google.com → crie um projeto (ex.: "Ajuda Professor").
2. **APIs e Serviços → Tela de consentimento OAuth**:
   - Tipo **External**; preencha nome do app, e-mail de suporte e contato.
   - Em "Escopos", os padrões `.../auth/userinfo.email`, `.../auth/userinfo.profile` e
     `openid` já bastam.
   - **Publique o app** (botão "Publicar aplicativo"). Como os escopos são básicos
     (e-mail/perfil), não exige verificação — mas, sem publicar, só "usuários de teste"
     conseguem entrar. Publicando, qualquer aluno com conta Google entra.
3. **APIs e Serviços → Credenciais → Criar credenciais → ID do cliente OAuth**:
   - Tipo **Aplicativo da Web**.
   - **URIs de redirecionamento autorizados** (adicione os dois):
     - `https://www.ajudaprofessor.com.br/auth/callback`
     - `https://ajudaprofessor.pages.dev/auth/callback` (para testar antes do domínio)
   - Salve e copie o **Client ID** e o **Client Secret**.

## Parte 4 — Variáveis e segredos na Pages

No painel: **Pages → ajudaprofessor → Settings → Environment variables** (produção):

| Nome | Valor | Encrypt? |
|---|---|---|
| `GOOGLE_CLIENT_ID` | (o Client ID do Google) | não |
| `GOOGLE_CLIENT_SECRET` | (o Client Secret do Google) | **sim** |
| `SESSION_SECRET` | uma chave aleatória longa | **sim** |

Gere o `SESSION_SECRET` com:
```bash
openssl rand -hex 32
```

## Parte 5 — Publicar

Faça o deploy normal (push na `main`). A Cloudflare Pages detecta a pasta `functions/`
e passa a servir o backend automaticamente.

## Parte 6 — Cadastrar turmas, alunos e cursos

1. Acesse `https://www.ajudaprofessor.com.br/admin/` e entre com sua conta de admin.
2. Em **Turmas**: crie as turmas e adicione os e-mails dos alunos.
3. Em **Cursos**: clique em **Registrar curso**. O campo **slug é o nome exato da pasta**
   do curso no site (ex.: `CloudComputing`, `ServicosDeRedes`). Marque **Restrito**.
4. No curso restrito, marque as **turmas com acesso** e/ou libere **alunos individuais**.

> Cursos que você **não registrar** (ou registrar como "Público") continuam abertos a todos.
> A proteção só vale para cursos marcados como **Restrito**.

## Parte 7 — Testar

- Abra um curso restrito numa **janela anônima** → deve redirecionar para o login.
- Entre com um aluno **da turma liberada** → deve abrir normalmente.
- Entre com um Google **fora da lista** → deve aparecer a página "Acesso restrito".
- Entre com seu admin → acessa tudo.

---

## Como funciona (resumo técnico)

- Ao abrir uma página de um curso, o `functions/_middleware.js` lê o cookie de sessão
  (assinado), descobre o e-mail e consulta o D1: o curso é público? o e-mail é admin, tem
  permissão individual, ou está numa turma liberada? Se sim, entrega a página; se não,
  manda para o login (visitante) ou mostra "Acesso restrito" (logado sem permissão).
- O painel `/admin` só responde para e-mails na tabela `admins`.
- A sessão é um token assinado (HMAC) guardado em cookie `HttpOnly`/`Secure`, válido por 7 dias.

## Limitações desta versão (v1)

- A proteção é no nível da **página** (HTML). Imagens/CSS globais em `/assets` e `/imagens`
  continuam públicos (são compartilhados entre cursos).
- A **home** ainda mostra os cards de todos os cursos; ao clicar num restrito sem acesso, o
  aluno cai no login/aviso. Filtrar a home por permissão é uma evolução possível (fase 2).

## Rodar localmente (opcional)

```bash
wrangler pages dev . --d1 DB=ajudaprofessor \
  --binding GOOGLE_CLIENT_ID=... --binding GOOGLE_CLIENT_SECRET=... --binding SESSION_SECRET=...
```
(Para o login Google local, adicione `http://localhost:8788/auth/callback` às URIs no Google.)
