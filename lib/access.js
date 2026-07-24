// Lógica pura de controle de acesso (sem dependência de runtime — fácil de testar).

// Extrai o "slug" do curso (primeiro segmento do caminho).
// Ex.: "/CloudComputing/aula02.html" -> "CloudComputing"
export function courseSlugFromPath(pathname) {
  const clean = decodeURIComponent(pathname || "/").replace(/^\/+/, "");
  const seg = clean.split("/")[0];
  return seg || null;
}

// Decide se um usuário pode acessar um curso, dadas as informações já coletadas.
//   publico            -> curso é aberto a todos
//   isAdmin            -> usuário é administrador
//   individualAllowed  -> e-mail liberado individualmente para o curso
//   hasTurmaAccess     -> e-mail pertence a alguma turma com acesso ao curso
export function decideAccess({ publico, isAdmin, individualAllowed, hasTurmaAccess }) {
  if (publico) return true;
  if (isAdmin) return true;
  if (individualAllowed) return true;
  if (hasTurmaAccess) return true;
  return false;
}

// Só faz sentido impor acesso em navegações de página (documento HTML),
// não em cada asset (css, imagem, js). Reduz consultas ao banco.
export function isHtmlNavigation(request, pathname) {
  const accept = (request.headers.get("Accept") || "").toLowerCase();
  if (accept.includes("text/html")) return true;
  const p = (pathname || "").toLowerCase();
  return p.endsWith("/") || p.endsWith(".html") || p.endsWith(".htm");
}

// Normaliza e-mail para comparação/armazenamento (minúsculas, sem espaços).
export function normEmail(email) {
  return (email || "").trim().toLowerCase();
}
