// Middleware raiz: resolve a sessão e impõe o controle de acesso aos cursos.
// Roda em TODAS as requisições servidas por Functions na Cloudflare Pages.
import { parseCookies } from "../lib/cookies.js";
import { verifySession } from "../lib/jwt.js";
import { courseSlugFromPath, isHtmlNavigation } from "../lib/access.js";
import { canAccessCourse } from "../lib/db.js";

export async function onRequest(context) {
  const { request, env, next } = context;
  const url = new URL(request.url);
  const pathname = url.pathname;

  // 1) Resolve o usuário logado (se houver) e disponibiliza no contexto
  let user = null;
  const cookies = parseCookies(request);
  if (cookies.ap_session && env.SESSION_SECRET) {
    user = await verifySession(cookies.ap_session, env.SESSION_SECRET);
  }
  context.data = context.data || {};
  context.data.user = user;

  // 2) Não intercepta rotas internas, o painel, nem assets/navegações não-HTML
  if (
    pathname.startsWith("/auth/") ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/assets/") ||
    pathname.startsWith("/imagens/") ||
    pathname === "/login.html" ||
    !isHtmlNavigation(request, pathname)
  ) {
    return next();
  }

  // 3) Verifica se o caminho é um curso controlado
  const slug = courseSlugFromPath(pathname);
  if (!slug || !env.DB) return next();

  let verdict;
  try {
    verdict = await canAccessCourse(env.DB, user && user.email, slug);
  } catch (_) {
    // Em caso de erro no banco, não bloqueia o site (fail-open só para conteúdo).
    return next();
  }

  if (!verdict.managed || verdict.allow) return next();

  // 4) Sem permissão
  if (!user) {
    const to = `/login.html?next=${encodeURIComponent(pathname + url.search)}`;
    return new Response(null, { status: 302, headers: { Location: url.origin + to } });
  }
  return new Response(forbiddenHtml(), {
    status: 403,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

function forbiddenHtml() {
  return `<!doctype html><html lang="pt-br"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Acesso restrito — Ajuda Professor</title></head>
<body style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:#f1f5f9;margin:0">
<div style="max-width:520px;margin:80px auto;background:#fff;border-radius:16px;padding:40px;text-align:center;box-shadow:0 10px 30px rgba(15,23,42,.08)">
<h1 style="color:#003366;font-size:1.4rem;margin:0 0 8px">Acesso restrito</h1>
<p style="color:#334155;line-height:1.6">Este curso é exclusivo para turmas autorizadas. Sua conta está
conectada, mas ainda não tem permissão para acessá-lo.</p>
<p style="color:#64748b;font-size:.9rem">Se você acredita que deveria ter acesso, fale com o professor
informando o e-mail com que entrou.</p>
<p style="margin-top:24px"><a href="/" style="color:#1e40af;font-weight:600">Voltar ao início</a>
&nbsp;·&nbsp; <a href="/auth/logout" style="color:#64748b">Sair</a></p>
</div></body></html>`;
}
