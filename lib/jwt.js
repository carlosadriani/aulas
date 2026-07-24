// Sessão assinada (JWS HS256) usando Web Crypto — funciona na Cloudflare e no Node 18+.
// Guarda apenas o e-mail e um carimbo de expiração; a assinatura impede adulteração.

function b64urlEncode(bytes) {
  let bin = "";
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  for (let i = 0; i < arr.length; i++) bin += String.fromCharCode(arr[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlDecode(str) {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) str += "=";
  const bin = atob(str);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

const enc = new TextEncoder();
const dec = new TextDecoder();

async function hmacKey(secret) {
  return crypto.subtle.importKey(
    "raw", enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false, ["sign", "verify"]
  );
}

// Compara duas strings em tempo constante (evita timing attack)
function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

export async function signSession(payload, secret, maxAgeSec = 60 * 60 * 24 * 7) {
  const header = { alg: "HS256", typ: "JWT" };
  const body = { ...payload, exp: Math.floor(Date.now() / 1000) + maxAgeSec };
  const h = b64urlEncode(enc.encode(JSON.stringify(header)));
  const b = b64urlEncode(enc.encode(JSON.stringify(body)));
  const data = `${h}.${b}`;
  const key = await hmacKey(secret);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return `${data}.${b64urlEncode(sig)}`;
}

export async function verifySession(token, secret) {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const data = `${parts[0]}.${parts[1]}`;
  const key = await hmacKey(secret);
  let ok = false;
  try {
    ok = await crypto.subtle.verify("HMAC", key, b64urlDecode(parts[2]), enc.encode(data));
  } catch (_) {
    return null;
  }
  if (!ok) return null;
  let body;
  try {
    body = JSON.parse(dec.decode(b64urlDecode(parts[1])));
  } catch (_) {
    return null;
  }
  if (!body.exp || body.exp < Math.floor(Date.now() / 1000)) return null;
  return body;
}

export { b64urlDecode, b64urlEncode, timingSafeEqual };
