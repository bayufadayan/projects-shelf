import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// Singleton promise — prevents concurrent initDB() calls from racing on pg_type
let _initPromise: Promise<void> | null = null;

export function initDB(): Promise<void> {
  if (!_initPromise) {
    _initPromise = _runInit().catch((err) => {
      // Reset so a future call can retry if it truly failed
      _initPromise = null;
      throw err;
    });
  }
  return _initPromise;
}

async function _runInit() {
  // --- project_platform table (no deps) ---
  await sql`
    CREATE TABLE IF NOT EXISTS project_platform (
      id         TEXT   PRIMARY KEY,
      title      TEXT   NOT NULL,
      created_at BIGINT NOT NULL
    )
  `;

  // Seed default platforms if table is empty
  const existingPlatforms = await sql`SELECT id FROM project_platform LIMIT 1`;
  if (existingPlatforms.length === 0) {
    const now = Date.now();
    await sql`
      INSERT INTO project_platform (id, title, created_at) VALUES
        ('web',             'Web',             ${now}),
        ('mobile',          'Mobile',          ${now + 1}),
        ('frontend',        'Frontend',        ${now + 2}),
        ('backend',         'Backend',         ${now + 3}),
        ('fullstack',       'Fullstack',       ${now + 4}),
        ('script',          'Script',          ${now + 5}),
        ('desktop',         'Desktop',         ${now + 6}),
        ('machine_learning','Machine Learning', ${now + 7})
    `;
  }

  // --- project_type table (no deps) ---
  await sql`
    CREATE TABLE IF NOT EXISTS project_type (
      id          TEXT  PRIMARY KEY,
      title       TEXT  NOT NULL,
      description TEXT,
      created_at  BIGINT NOT NULL
    )
  `;

  // Seed default types if table is empty
  const existing = await sql`SELECT id FROM project_type LIMIT 1`;
  if (existing.length === 0) {
    const now = Date.now();
    await sql`
      INSERT INTO project_type (id, title, description, created_at) VALUES
        ('main',     'Main',    'Project serius untuk portofolio',                                                         ${now}),
        ('learning', 'Learning','Project untuk Pembelajaran',                                                              ${now + 1}),
        ('utility',  'Utility', 'Project yang berfokus pada fungsionalitas dan mengesampingkan teknologi serta dikerjakan dengan vibe coding', ${now + 2})
    `;
  }

  // --- projects table (references project_type) ---
  await sql`
    CREATE TABLE IF NOT EXISTS projects (
      id          TEXT     PRIMARY KEY,
      title       TEXT     NOT NULL,
      description TEXT,
      live_url    TEXT,
      github_url  TEXT,
      tags        TEXT[],
      created_at  BIGINT   NOT NULL,
      featured    BOOLEAN  NOT NULL DEFAULT false,
      type_id     TEXT     REFERENCES project_type(id) ON DELETE SET NULL
    )
  `;

  // Migrations for existing installations
  await sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS featured BOOLEAN NOT NULL DEFAULT false`;
  await sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS type_id TEXT REFERENCES project_type(id) ON DELETE SET NULL`;

  // --- project_platform_link junction (references projects + project_platform) ---
  await sql`
    CREATE TABLE IF NOT EXISTS project_platform_link (
      project_id  TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      platform_id TEXT NOT NULL REFERENCES project_platform(id) ON DELETE CASCADE,
      PRIMARY KEY (project_id, platform_id)
    )
  `;
}

export default sql;
