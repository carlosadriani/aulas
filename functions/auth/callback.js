// GET /auth/callback?code=...&state=...  -> valida, cria sessão e volta para 'next'
import { exchangeCode, decodeIdToken } from "../../lib/google.js";
import { parseCookies, serializeCookie, clearCookie } from "../../lib/cookies.js";
import { signSession } from "../../lib/jwt.js";

const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 dias

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  const cookies = parseCookies(request);
  let saved = {};
  try { saved = JSON.parse(cookies.ap_oauth || "{}"); } catch (_) {}

  if (!code || !state || !saved.state || state !== saved.state) {
    return htmlError(400, "Falha na autenticação: estado inválido. Tente entrar novamente.");
  }
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET || !env.SESSION_SECRET) {
    return htmlError(500, "Configuração de autenticação ausente no servidor.");
  }

  let claims;
  try {
    const tokens = await exchangeCode({
      code,
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      redirectUri: `${url.origin}/auth/callback`,
    });
    claims = decodeIdToken(tokens.id_token);
  } catch (e) {
    return htmlError(502, "Não foi possível concluir o login com o Google.");
  }

  if (!claims.email || claims.email_verified === false) {
    return htmlError(403, "Sua conta Google não tem e-mail verificado.");
  }

  const email = String(claims.email).toLowerCase();
  const session = await signSession(
    { email, name: claims.name || "" }, env.SESSION_SECRET, SESSION_MAX_AGE
  );
  const next = typeof saved.next === "string" && saved.next.startsWith("/") ? saved.next : "/";

  const secure = url.protocol === "https:";
  const headers = new Headers();
  headers.append("Set-Cookie", serializeCookie("ap_session", session, { maxAge: SESSION_MAX_AGE, secure }));
  headers.append("Set-Cookie", clearCookie("ap_oauth", { secure }));
  headers.set("Location", next);
  return new Response(null, { status: 302, headers });
}

function htmlError(status, msg) {
  return new Response(
    `<!doctype html><meta charset="utf-8"><title>Login</title>` +
    `<div style="font-family:system-ui;max-width:520px;margin:80px auto;text-align:center">` +
    `<h1 style="color:#b91c1c;font-size:1.3rem">Não foi possível entrar</h1><p>${msg}</p>` +
    `<p><a href="/login.html">Voltar ao login</a></p></div>`,
    { status, headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
}
