import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { Project } from '@/lib/types';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body: Omit<Project, 'id' | 'createdAt'> & { createdAt?: number } =
      await request.json();

    await sql`
      UPDATE projects
      SET
        title       = ${body.title},
        description = ${body.description ?? null},
        live_url    = ${body.liveUrl ?? null},
        github_url  = ${body.githubUrl ?? null},
        tags        = ${body.tags ?? null},
        featured    = ${body.featured ?? false},
        type_id     = ${body.typeId ?? null}
      WHERE id = ${params.id}
    `;

    // Replace platform links
    await sql`DELETE FROM project_platform_link WHERE project_id = ${params.id}`;
    if (body.platformIds && body.platformIds.length > 0) {
      for (const platformId of body.platformIds) {
        await sql`
          INSERT INTO project_platform_link (project_id, platform_id)
          VALUES (${params.id}, ${platformId})
          ON CONFLICT DO NOTHING
        `;
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { featured }: { featured: boolean } = await request.json();
    await sql`
      UPDATE projects
      SET featured = ${featured}
      WHERE id = ${params.id}
    `;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await sql`DELETE FROM projects WHERE id = ${params.id}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}
