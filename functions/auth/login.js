// GET /auth/login?next=/CloudComputing/  -> redireciona ao consentimento do Google
import { buildAuthUrl, randomState } from "../../lib/google.js";
import { serializeCookie } from "../../lib/cookies.js";

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const nextRaw = url.searchParams.get("next") || "/";
  const next = nextRaw.startsWith("/") ? nextRaw : "/"; // só caminhos internos
  const state = randomState();
  const redirectUri = `${url.origin}/auth/callback`;

  if (!env.GOOGLE_CLIENT_ID) {
    return new Response("Configuração ausente: GOOGLE_CLIENT_ID.", { status: 500 });
  }

  const authUrl = buildAuthUrl({ clientId: env.GOOGLE_CLIENT_ID, redirectUri, state });
  const secure = url.protocol === "https:";
  const headers = new Headers();
  headers.append(
    "Set-Cookie",
    serializeCookie("ap_oauth", JSON.stringify({ state, next }), { maxAge: 600, sameSite: "Lax", secure })
  );
  headers.set("Location", authUrl);
  return new Response(null, { status: 302, headers });
}
