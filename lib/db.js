// Camada de acesso ao banco D1. Todas as funções recebem `db` (env.DB).
import { normEmail } from "./access.js";

export async function isAdmin(db, email) {
  if (!email) return false;
  const row = await db.prepare("SELECT 1 FROM admins WHERE email = ?").bind(normEmail(email)).first();
  return !!row;
}

// Verifica se `email` pode acessar o curso de `slug`.
// Retorna { managed, allow }.  managed=false => curso não está sob controle (liberar).
export async function canAccessCourse(db, email, slug) {
  const e = normEmail(email);
  const course = await db.prepare("SELECT id, publico FROM cursos WHERE slug = ?").bind(slug).first();
  if (!course) return { managed: false, allow: true };
  if (course.publico) return { managed: true, allow: true };
  if (!e) return { managed: true, allow: false };

  const adm = await db.prepare("SELECT 1 FROM admins WHERE email = ?").bind(e).first();
  if (adm) return { managed: true, allow: true };

  const ind = await db.prepare(
    "SELECT 1 FROM curso_alunos WHERE curso_id = ? AND aluno_email = ?"
  ).bind(course.id, e).first();
  if (ind) return { managed: true, allow: true };

  const tur = await db.prepare(
    `SELECT 1 FROM curso_turmas ct
       JOIN turma_alunos ta ON ta.turma_id = ct.turma_id
      WHERE ct.curso_id = ? AND ta.aluno_email = ? LIMIT 1`
  ).bind(course.id, e).first();
  if (tur) return { managed: true, allow: true };

  return { managed: true, allow: false };
}

// ---------- Turmas ----------
export const listTurmas = (db) =>
  db.prepare("SELECT id, nome, criado_em FROM turmas ORDER BY nome").all().then((r) => r.results);

export const createTurma = (db, nome) =>
  db.prepare("INSERT INTO turmas (nome) VALUES (?)").bind(nome.trim()).run();

export const deleteTurma = (db, id) =>
  db.prepare("DELETE FROM turmas WHERE id = ?").bind(id).run();

// ---------- Alunos ----------
export const listAlunos = (db) =>
  db.prepare("SELECT email, nome, criado_em FROM alunos ORDER BY email").all().then((r) => r.results);

export const upsertAluno = (db, email, nome) =>
  db.prepare(
    "INSERT INTO alunos (email, nome) VALUES (?1, ?2) ON CONFLICT(email) DO UPDATE SET nome = COALESCE(?2, nome)"
  ).bind(normEmail(email), nome || null).run();

export const deleteAluno = (db, email) =>
  db.prepare("DELETE FROM alunos WHERE email = ?").bind(normEmail(email)).run();

export const listTurmaAlunos = (db, turmaId) =>
  db.prepare("SELECT aluno_email FROM turma_alunos WHERE turma_id = ? ORDER BY aluno_email")
    .bind(turmaId).all().then((r) => r.results.map((x) => x.aluno_email));

export const addAlunoToTurma = (db, turmaId, email) =>
  db.prepare("INSERT OR IGNORE INTO turma_alunos (turma_id, aluno_email) VALUES (?, ?)")
    .bind(turmaId, normEmail(email)).run();

export const removeAlunoFromTurma = (db, turmaId, email) =>
  db.prepare("DELETE FROM turma_alunos WHERE turma_id = ? AND aluno_email = ?")
    .bind(turmaId, normEmail(email)).run();

// ---------- Cursos ----------
export const listCursos = (db) =>
  db.prepare("SELECT id, slug, nome, publico, criado_em FROM cursos ORDER BY nome").all().then((r) => r.results);

export const createCurso = (db, slug, nome, publico) =>
  db.prepare("INSERT INTO cursos (slug, nome, publico) VALUES (?, ?, ?)")
    .bind(slug.trim(), nome.trim(), publico ? 1 : 0).run();

export const setCursoPublico = (db, id, publico) =>
  db.prepare("UPDATE cursos SET publico = ? WHERE id = ?").bind(publico ? 1 : 0, id).run();

export const deleteCurso = (db, id) =>
  db.prepare("DELETE FROM cursos WHERE id = ?").bind(id).run();

export const listCursoTurmas = (db, cursoId) =>
  db.prepare("SELECT turma_id FROM curso_turmas WHERE curso_id = ?")
    .bind(cursoId).all().then((r) => r.results.map((x) => x.turma_id));

export const addTurmaToCurso = (db, cursoId, turmaId) =>
  db.prepare("INSERT OR IGNORE INTO curso_turmas (curso_id, turma_id) VALUES (?, ?)")
    .bind(cursoId, turmaId).run();

export const removeTurmaFromCurso = (db, cursoId, turmaId) =>
  db.prepare("DELETE FROM curso_turmas WHERE curso_id = ? AND turma_id = ?")
    .bind(cursoId, turmaId).run();

export const listCursoAlunos = (db, cursoId) =>
  db.prepare("SELECT aluno_email FROM curso_alunos WHERE curso_id = ? ORDER BY aluno_email")
    .bind(cursoId).all().then((r) => r.results.map((x) => x.aluno_email));

export const addAlunoToCurso = (db, cursoId, email) =>
  db.prepare("INSERT OR IGNORE INTO curso_alunos (curso_id, aluno_email) VALUES (?, ?)")
    .bind(cursoId, normEmail(email)).run();

export const removeAlunoFromCurso = (db, cursoId, email) =>
  db.prepare("DELETE FROM curso_alunos WHERE curso_id = ? AND aluno_email = ?")
    .bind(cursoId, normEmail(email)).run();
