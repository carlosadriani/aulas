// API do painel de administração.
//   GET  /api/admin/state   -> snapshot completo (turmas, alunos, cursos e relações)
//   POST /api/admin/mutate  -> { action, payload } aplica uma alteração
import * as db from "../../../lib/db.js";

export async function onRequest(context) {
  const { request, env } = context;
  const DB = env.DB;
  if (request.method === "GET") return getState(DB);
  if (request.method === "POST") return mutate(request, DB);
  return json({ error: "Método não suportado" }, 405);
}

async function getState(DB) {
  const [turmas, alunos, cursos] = await Promise.all([
    db.listTurmas(DB), db.listAlunos(DB), db.listCursos(DB),
  ]);

  const turmaAlunos = {};
  for (const t of turmas) turmaAlunos[t.id] = await db.listTurmaAlunos(DB, t.id);

  const cursoTurmas = {}, cursoAlunos = {};
  for (const c of cursos) {
    cursoTurmas[c.id] = await db.listCursoTurmas(DB, c.id);
    cursoAlunos[c.id] = await db.listCursoAlunos(DB, c.id);
  }
  return json({ turmas, alunos, cursos, turmaAlunos, cursoTurmas, cursoAlunos });
}

async function mutate(request, DB) {
  let body;
  try { body = await request.json(); } catch (_) { return json({ error: "JSON inválido" }, 400); }
  const action = body && body.action;
  const p = (body && body.payload) || {};
  try {
    switch (action) {
      case "createTurma": await db.createTurma(DB, req(p.nome, "nome")); break;
      case "deleteTurma": await db.deleteTurma(DB, req(p.id, "id")); break;

      case "upsertAluno": await db.upsertAluno(DB, req(p.email, "email"), p.nome || null); break;
      case "deleteAluno": await db.deleteAluno(DB, req(p.email, "email")); break;

      case "addAlunoToTurma":
        await db.upsertAluno(DB, req(p.email, "email"), p.nome || null);
        await db.addAlunoToTurma(DB, req(p.turmaId, "turmaId"), p.email);
        break;
      case "removeAlunoFromTurma":
        await db.removeAlunoFromTurma(DB, req(p.turmaId, "turmaId"), req(p.email, "email"));
        break;

      case "createCurso": await db.createCurso(DB, req(p.slug, "slug"), req(p.nome, "nome"), !!p.publico); break;
      case "setCursoPublico": await db.setCursoPublico(DB, req(p.id, "id"), !!p.publico); break;
      case "deleteCurso": await db.deleteCurso(DB, req(p.id, "id")); break;

      case "addTurmaToCurso":
        await db.addTurmaToCurso(DB, req(p.cursoId, "cursoId"), req(p.turmaId, "turmaId")); break;
      case "removeTurmaFromCurso":
        await db.removeTurmaFromCurso(DB, req(p.cursoId, "cursoId"), req(p.turmaId, "turmaId")); break;

      case "addAlunoToCurso":
        await db.upsertAluno(DB, req(p.email, "email"), p.nome || null);
        await db.addAlunoToCurso(DB, req(p.cursoId, "cursoId"), p.email);
        break;
      case "removeAlunoFromCurso":
        await db.removeAlunoFromCurso(DB, req(p.cursoId, "cursoId"), req(p.email, "email")); break;

      default: return json({ error: "Ação desconhecida: " + action }, 400);
    }
    return json({ ok: true });
  } catch (e) {
    return json({ error: e.message || "Erro ao aplicar alteração" }, 400);
  }
}

function req(v, name) {
  if (v === undefined || v === null || v === "") throw new Error("Campo obrigatório: " + name);
  return v;
}
function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status, headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}
