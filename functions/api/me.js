// GET /api/me -> informa se há sessão e se o usuário é admin
import { isAdmin } from "../../lib/db.js";

export async function onRequestGet({ data, env }) {
  const user = data && data.user;
  if (!user) return Response.json({ authenticated: false });
  let admin = false;
  if (env.DB) {
    try { admin = await isAdmin(env.DB, user.email); } catch (_) {}
  }
  return Response.json({ authenticated: true, email: user.email, name: user.name || "", admin });
}
