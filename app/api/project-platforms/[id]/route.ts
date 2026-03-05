import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body: { title: string } = await request.json();
    await sql`
      UPDATE project_platform
      SET title = ${body.title}
      WHERE id = ${params.id}
    `;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update platform' }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await sql`DELETE FROM project_platform WHERE id = ${params.id}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to delete platform' }, { status: 500 });
  }
}
