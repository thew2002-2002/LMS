import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const studentId = Number(body.student_id);
    const subjectId = Number(body.subject_id);

    if (!studentId || !subjectId) {
      return NextResponse.json(
        { message: 'Student ID and subject ID are required' },
        { status: 400 }
      );
    }

    const student = await sql`
      SELECT id, role FROM users WHERE id = ${studentId} LIMIT 1
    `;

    if (student.length === 0) {
      return NextResponse.json({ message: 'Student not found' }, { status: 404 });
    }

    if (student[0].role !== 'student') {
      return NextResponse.json({ message: 'Only students can be enrolled' }, { status: 400 });
    }

    const subject = await sql`
      SELECT id FROM subjects WHERE id = ${subjectId} LIMIT 1
    `;

    if (subject.length === 0) {
      return NextResponse.json({ message: 'Subject not found' }, { status: 404 });
    }

    const existing = await sql`
      SELECT id FROM course_registrations
      WHERE student_id = ${studentId} AND subject_id = ${subjectId}
      LIMIT 1
    `;

    if (existing.length > 0) {
      return NextResponse.json(
        { message: 'Student is already registered for this subject' },
        { status: 409 }
      );
    }

    await sql`
      INSERT INTO course_registrations (student_id, subject_id)
      VALUES (${studentId}, ${subjectId})
    `;

    return NextResponse.json(
      { message: 'Enrolled successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error registering course:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: String(error) },
      { status: 500 }
    );
  }
}