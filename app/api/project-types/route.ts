import { NextResponse } from 'next/server';
import sql, { initDB } from '@/lib/db';
import { ProjectType } from '@/lib/types';

export async function GET() {
  try {
    await initDB();
    const rows = await sql`
      SELECT id, title, description, created_at
      FROM project_type
      ORDER BY created_at ASC
    `;
    const types: ProjectType[] = rows.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description ?? undefined,
      createdAt: Number(r.created_at),
    }));
    return NextResponse.json(types);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch project types' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await initDB();
    const body: { title: string; description?: string } = await request.json();
    const id = body.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now();
    const createdAt = Date.now();

    await sql`
      INSERT INTO project_type (id, title, description, created_at)
      VALUES (
        ${id},
        ${body.title},
        ${body.description ?? null},
        ${createdAt}
      )
    `;

    const type: ProjectType = { id, title: body.title, description: body.description, createdAt };
    return NextResponse.json(type, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create project type' }, { status: 500 });
  }
}
