// GET /auth/logout -> encerra a sessão e volta para a home
import { clearCookie } from "../../lib/cookies.js";

export async function onRequestGet({ request }) {
  const url = new URL(request.url);
  const headers = new Headers();
  headers.append("Set-Cookie", clearCookie("ap_session"));
  headers.set("Location", url.searchParams.get("next") || "/");
  return new Response(null, { status: 302, headers });
}
