-- =====================================================================
-- Ajuda Professor — Modelo de dados (Cloudflare D1 / SQLite)
-- Controle de acesso a cursos por turma e por aluno individual.
-- Aplicar com:  wrangler d1 execute ajudaprofessor --file=./schema.sql
-- =====================================================================

-- Turmas (ex.: "ADS 2026/1 - Noturno")
CREATE TABLE IF NOT EXISTS turmas (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  nome       TEXT NOT NULL UNIQUE,
  criado_em  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Alunos, identificados pelo e-mail Google (sempre em minúsculas)
CREATE TABLE IF NOT EXISTS alunos (
  email      TEXT PRIMARY KEY,
  nome       TEXT,
  criado_em  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Vínculo aluno <-> turma (N:N)
CREATE TABLE IF NOT EXISTS turma_alunos (
  turma_id     INTEGER NOT NULL REFERENCES turmas(id)   ON DELETE CASCADE,
  aluno_email  TEXT    NOT NULL REFERENCES alunos(email) ON DELETE CASCADE,
  PRIMARY KEY (turma_id, aluno_email)
);

-- Cursos. 'slug' é o prefixo da pasta no site (ex.: 'CloudComputing').
-- publico = 1 -> aberto a todos;  publico = 0 -> restrito (exige permissão).
CREATE TABLE IF NOT EXISTS cursos (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  slug       TEXT NOT NULL UNIQUE,
  nome       TEXT NOT NULL,
  publico    INTEGER NOT NULL DEFAULT 1,
  criado_em  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Curso liberado para uma turma inteira (N:N)
CREATE TABLE IF NOT EXISTS curso_turmas (
  curso_id  INTEGER NOT NULL REFERENCES cursos(id)  ON DELETE CASCADE,
  turma_id  INTEGER NOT NULL REFERENCES turmas(id)  ON DELETE CASCADE,
  PRIMARY KEY (curso_id, turma_id)
);

-- Curso liberado para um aluno específico (N:N) — permissão individual
CREATE TABLE IF NOT EXISTS curso_alunos (
  curso_id     INTEGER NOT NULL REFERENCES cursos(id)   ON DELETE CASCADE,
  aluno_email  TEXT    NOT NULL REFERENCES alunos(email) ON DELETE CASCADE,
  PRIMARY KEY (curso_id, aluno_email)
);

-- Administradores do painel /admin
CREATE TABLE IF NOT EXISTS admins (
  email  TEXT PRIMARY KEY
);

-- Índices para as consultas de verificação de acesso
CREATE INDEX IF NOT EXISTS idx_turma_alunos_email ON turma_alunos(aluno_email);
CREATE INDEX IF NOT EXISTS idx_curso_alunos_email ON curso_alunos(aluno_email);
CREATE INDEX IF NOT EXISTS idx_curso_turmas_turma ON curso_turmas(turma_id);
