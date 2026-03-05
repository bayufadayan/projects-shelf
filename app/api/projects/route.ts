import { NextResponse } from 'next/server';
import sql, { initDB } from '@/lib/db';
import { Project } from '@/lib/types';

export async function GET() {
  try {
    await initDB();
    const rows = await sql`
      SELECT
        p.id, p.title, p.description, p.live_url, p.github_url,
        p.tags, p.created_at, p.featured, p.type_id,
        pt.title AS type_name
      FROM projects p
      LEFT JOIN project_type pt ON pt.id = p.type_id
      ORDER BY p.created_at DESC
    `;

    // Batch fetch platform links for all projects
    const platformLinks = await sql`
      SELECT ppl.project_id, ppl.platform_id, pp.title AS platform_title
      FROM project_platform_link ppl
      JOIN project_platform pp ON pp.id = ppl.platform_id
    `;
    const platformsByProject: Record<string, { ids: string[]; names: string[] }> = {};
    for (const row of platformLinks) {
      if (!platformsByProject[row.project_id]) {
        platformsByProject[row.project_id] = { ids: [], names: [] };
      }
      platformsByProject[row.project_id].ids.push(row.platform_id);
      platformsByProject[row.project_id].names.push(row.platform_title);
    }

    const projects: Project[] = rows.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description ?? undefined,
      liveUrl: r.live_url ?? undefined,
      githubUrl: r.github_url ?? undefined,
      tags: r.tags ?? undefined,
      createdAt: Number(r.created_at),
      featured: r.featured ?? false,
      typeId: r.type_id ?? undefined,
      typeName: r.type_name ?? undefined,
      platformIds: platformsByProject[r.id]?.ids,
      platformNames: platformsByProject[r.id]?.names,
    }));
    return NextResponse.json(projects);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await initDB();
    const body: Omit<Project, 'id' | 'createdAt' | 'typeName' | 'platformNames'> = await request.json();
    const id = Date.now().toString();
    const createdAt = Date.now();
    const featured = body.featured ?? false;

    await sql`
      INSERT INTO projects (id, title, description, live_url, github_url, tags, created_at, featured, type_id)
      VALUES (
        ${id},
        ${body.title},
        ${body.description ?? null},
        ${body.liveUrl ?? null},
        ${body.githubUrl ?? null},
        ${body.tags ?? null},
        ${createdAt},
        ${featured},
        ${body.typeId ?? null}
      )
    `;

    // Insert platform links
    if (body.platformIds && body.platformIds.length > 0) {
      for (const platformId of body.platformIds) {
        await sql`
          INSERT INTO project_platform_link (project_id, platform_id)
          VALUES (${id}, ${platformId})
          ON CONFLICT DO NOTHING
        `;
      }
    }

    const project: Project = { id, createdAt, ...body, featured };
    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}
