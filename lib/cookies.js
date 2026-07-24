// Utilitários de cookie (compatíveis com o runtime da Cloudflare Workers/Pages).

export function parseCookies(request) {
  const header = request.headers.get("Cookie") || "";
  const out = {};
  header.split(";").forEach((part) => {
    const idx = part.indexOf("=");
    if (idx < 0) return;
    const k = part.slice(0, idx).trim();
    const v = part.slice(idx + 1).trim();
    if (k) out[k] = decodeURIComponent(v);
  });
  return out;
}

export function serializeCookie(name, value, opts = {}) {
  const p = [`${name}=${encodeURIComponent(value)}`];
  p.push(`Path=${opts.path || "/"}`);
  if (opts.maxAge != null) p.push(`Max-Age=${Math.floor(opts.maxAge)}`);
  if (opts.expires) p.push(`Expires=${opts.expires.toUTCString()}`);
  if (opts.httpOnly !== false) p.push("HttpOnly");
  if (opts.secure !== false) p.push("Secure");
  p.push(`SameSite=${opts.sameSite || "Lax"}`);
  return p.join("; ");
}

// Cookie de remoção (expira imediatamente)
export function clearCookie(name, opts = {}) {
  return serializeCookie(name, "", { ...opts, maxAge: 0 });
}
