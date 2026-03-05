import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: { title: string; description?: string } = await request.json();
    await sql`
      UPDATE project_type
      SET
        title       = ${body.title},
        description = ${body.description ?? null}
      WHERE id = ${id}
    `;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update project type' }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await sql`DELETE FROM project_type WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to delete project type' }, { status: 500 });
  }
}
