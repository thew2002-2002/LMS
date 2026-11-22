import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { student_id, module_id } = body;

    if (!student_id || !module_id) {
       return NextResponse.json({ message: 'Missing data' }, { status: 400 });
    }

    // දැනටමත් register වෙලාද බලන්න
    const existing = await sql`SELECT * FROM module_registrations WHERE student_id = ${student_id} AND module_id = ${module_id}`;
    if (existing.length > 0) {
      return NextResponse.json({ message: 'Already registered' }, { status: 400 });
    }

    await sql`
      INSERT INTO module_registrations (student_id, module_id)
      VALUES (${student_id}, ${module_id})
    `;

    return NextResponse.json({ message: 'Enrolled successfully' }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}