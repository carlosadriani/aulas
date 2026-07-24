// Protege /api/admin/* — só administradores autenticados passam.
import { isAdmin } from "../../../lib/db.js";

export async function onRequest(context) {
  const { env, data, next } = context;
  const user = data && data.user;
  if (!user) return deny(401, "Faça login.");
  if (!env.DB) return deny(500, "Banco de dados indisponível.");
  if (!(await isAdmin(env.DB, user.email))) return deny(403, "Acesso restrito a administradores.");
  return next();
}

function deny(status, error) {
  return new Response(JSON.stringify({ error }), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}
