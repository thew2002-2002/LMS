import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

function getErrorDetails(error: unknown) {
  if (error instanceof Error) {
    return { message: error.message, name: error.name };
  }

  if (typeof error === 'object' && error !== null) {
    return error;
  }

  return { message: String(error) };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const subjectName = String(body.subject_name ?? '').trim();
    const subjectCode = String(body.subject_code ?? '').trim();

    if (!subjectName || !subjectCode) {
      return NextResponse.json(
        { message: 'Subject name and subject code are required' },
        { status: 400 }
      );
    }

    const existing = await sql`
      SELECT id
      FROM subjects
      WHERE subject_code = ${subjectCode}
      LIMIT 1
    `;

    if (existing.length > 0) {
      return NextResponse.json(
        { message: 'Subject code already exists' },
        { status: 409 }
      );
    }

    const created = await sql`
      INSERT INTO subjects (subject_name, subject_code)
      VALUES (${subjectName}, ${subjectCode})
      RETURNING id, subject_name, subject_code
    `;

    return NextResponse.json(
      { message: 'Subject created successfully', subject: created[0] },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Error creating subject:', error);

    const databaseError = error as { code?: string };
    if (databaseError.code === '23505') {
      return NextResponse.json(
        { message: 'Subject code already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: 'Internal server error', error: getErrorDetails(error) },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const subjects = await sql`
      SELECT
        s.id,
        s.subject_name,
        s.subject_code,
        COALESCE((
          SELECT json_agg(
            json_build_object('id', u.id, 'name', u.full_name)
            ORDER BY u.full_name
          )
          FROM subject_teachers st
          JOIN users u ON u.id = st.teacher_id
          WHERE st.subject_id = s.id
        ), '[]'::json) AS teachers
      FROM subjects s
      ORDER BY s.id DESC
    `;

    return NextResponse.json(Array.isArray(subjects) ? subjects : []);
  } catch (error: unknown) {
    console.error('Error fetching subjects:', error);
    return NextResponse.json(
      { message: 'Failed to fetch subjects', error: getErrorDetails(error) },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const subjectId = Number(body.subject_id);
    const teacherIds = Array.isArray(body.teacher_ids)
      ? body.teacher_ids.map((id: unknown) => Number(id)).filter((id: number) => Number.isInteger(id) && id > 0)
      : [];

    if (!subjectId) {
      return NextResponse.json(
        { message: 'Subject ID is required' },
        { status: 400 }
      );
    }

    const subject = await sql`
      SELECT id FROM subjects WHERE id = ${subjectId} LIMIT 1
    `;

    if (subject.length === 0) {
      return NextResponse.json({ message: 'Subject not found' }, { status: 404 });
    }

    await sql`DELETE FROM subject_teachers WHERE subject_id = ${subjectId}`;

    for (const teacherId of teacherIds) {
      await sql`
        INSERT INTO subject_teachers (subject_id, teacher_id)
        VALUES (${subjectId}, ${teacherId})
      `;
    }

    return NextResponse.json(
      { message: 'Teachers assigned successfully' },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Error assigning subject teachers:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: getErrorDetails(error) },
      { status: 500 }
    );
  }
}