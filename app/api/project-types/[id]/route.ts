import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body: { title: string; description?: string } = await request.json();
    await sql`
      UPDATE project_type
      SET
        title       = ${body.title},
        description = ${body.description ?? null}
      WHERE id = ${params.id}
    `;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update project type' }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await sql`DELETE FROM project_type WHERE id = ${params.id}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to delete project type' }, { status: 500 });
  }
}
