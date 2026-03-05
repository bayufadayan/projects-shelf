import { NextResponse } from 'next/server';
import sql, { initDB } from '@/lib/db';
import { ProjectPlatform } from '@/lib/types';

export async function GET() {
  try {
    await initDB();
    const rows = await sql`
      SELECT id, title, created_at
      FROM project_platform
      ORDER BY title ASC
    `;
    const platforms: ProjectPlatform[] = rows.map((r) => ({
      id: r.id,
      title: r.title,
      createdAt: Number(r.created_at),
    }));
    return NextResponse.json(platforms);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch platforms' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await initDB();
    const body: { title: string } = await request.json();
    const id = body.title.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '') + '_' + Date.now();
    const createdAt = Date.now();

    await sql`
      INSERT INTO project_platform (id, title, created_at)
      VALUES (${id}, ${body.title}, ${createdAt})
    `;

    const platform: ProjectPlatform = { id, title: body.title, createdAt };
    return NextResponse.json(platform, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create platform' }, { status: 500 });
  }
}
