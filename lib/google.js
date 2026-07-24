// Helpers de login com Google (OAuth 2.0 / OpenID Connect).
import { b64urlDecode } from "./jwt.js";

const AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";

// URL para redirecionar o usuário ao consentimento do Google.
export function buildAuthUrl({ clientId, redirectUri, state }) {
  const p = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state,
    access_type: "online",
    prompt: "select_account",
  });
  return `${AUTH_ENDPOINT}?${p.toString()}`;
}

// Troca o "code" recebido no callback pelos tokens (inclui id_token).
export async function exchangeCode({ code, clientId, clientSecret, redirectUri }) {
  const body = new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
  });
  const res = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Falha ao trocar código no Google (${res.status}): ${txt}`);
  }
  return res.json();
}

// Decodifica o payload do id_token. Como o token vem por troca direta e via TLS
// com o endpoint oficial do Google, o payload é confiável para extrair o e-mail.
export function decodeIdToken(idToken) {
  const parts = (idToken || "").split(".");
  if (parts.length !== 3) throw new Error("id_token inválido");
  const json = new TextDecoder().decode(b64urlDecode(parts[1]));
  return JSON.parse(json);
}

// Gera um valor aleatório para o parâmetro 'state' (proteção CSRF do OAuth).
export function randomState() {
  const a = new Uint8Array(16);
  crypto.getRandomValues(a);
  return Array.from(a).map((b) => b.toString(16).padStart(2, "0")).join("");
}
