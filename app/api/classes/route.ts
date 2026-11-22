import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { subject_id, teacher_id, grade, class_date, start_time, end_time, zoom_link } = body;

    const newClass = await sql`
      INSERT INTO classes (subject_id, teacher_id, grade, class_date, start_time, end_time, zoom_link)
      VALUES (${subject_id}, ${teacher_id}, ${grade}, ${class_date}, ${start_time}, ${end_time}, ${zoom_link || null})
      RETURNING *
    `;

    return NextResponse.json({ message: 'Class created successfully', class: newClass[0] }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get('subject_id');

    if (!subjectId) return NextResponse.json({ message: 'Subject ID required' }, { status: 400 });

    const classes = await sql`
      SELECT c.*, u.full_name as teacher_name 
      FROM classes c
      JOIN users u ON c.teacher_id = u.id
      WHERE c.subject_id = ${subjectId}
      ORDER BY c.class_date DESC, c.start_time DESC
    `;

    return NextResponse.json(classes);
  } catch (error) {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}