import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

function errorDetails(error: unknown) {
  if (error instanceof Error) return { message: error.message, name: error.name };
  return { message: String(error) };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email ?? '').trim().toLowerCase();
    const password = String(body.password ?? '');
    const fullName = String(body.full_name ?? '').trim();
    const role = String(body.role ?? '').trim().toLowerCase();
    const studentId = body.student_id ? String(body.student_id).trim() : null;
    const grade = body.grade ? String(body.grade).trim() : null;
    const subjectId = body.subject_id ? Number(body.subject_id) : null;

    if (!email || !password || !fullName || !role) {
      return NextResponse.json({ message: 'Email, password, full name, and role are required' }, { status: 400 });
    }

    if (!['student', 'teacher', 'cashier', 'admin'].includes(role)) {
      return NextResponse.json({ message: 'Invalid role' }, { status: 400 });
    }

    const existingUser = await sql`SELECT id FROM users WHERE email = ${email} LIMIT 1`;
    if (existingUser.length > 0) {
      return NextResponse.json({ message: 'Email already exists' }, { status: 409 });
    }

    const newUser = await sql`
      INSERT INTO users (email, password_hash, full_name, role, student_id, grade)
      VALUES (${email}, ${password}, ${fullName}, ${role}, ${studentId}, ${grade})
      RETURNING id, email, full_name, role, student_id, grade, created_at
    `;

    if (role === 'teacher' && subjectId) {
      await sql`
        INSERT INTO subject_teachers (subject_id, teacher_id)
        VALUES (${subjectId}, ${newUser[0].id})
      `;
    }

    if (role === 'student' && subjectId) {
      await sql`
        INSERT INTO course_registrations (student_id, subject_id)
        VALUES (${newUser[0].id}, ${subjectId})
      `;
    }

    return NextResponse.json(
      { message: 'User created successfully', user: newUser[0] },
      { status: 201 }
    );
  } catch (error) {
    const details = errorDetails(error);
    console.error('Error creating user:', details);
    return NextResponse.json(
      { message: 'Internal server error', error: details },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role')?.trim().toLowerCase();

    let users;
    if (role) {
      users = await sql`
        SELECT
          u.id,
          u.email,
          u.full_name,
          u.role,
          u.student_id,
          u.grade,
          u.created_at,
          COALESCE((
            SELECT json_agg(json_build_object(
              'id', assigned.id,
              'name', assigned.subject_name,
              'subject_code', assigned.subject_code
            ) ORDER BY assigned.subject_name)
            FROM (
              SELECT DISTINCT s.id, s.subject_name, s.subject_code
              FROM subject_teachers st
              JOIN subjects s ON s.id = st.subject_id
              WHERE st.teacher_id = u.id
            ) assigned
          ), '[]'::json) AS subjects,
          COALESCE((
            SELECT json_agg(json_build_object(
              'id', enrolled.id,
              'name', enrolled.subject_name,
              'subject_code', enrolled.subject_code,
              'teacher', enrolled.teacher
            ) ORDER BY enrolled.subject_name)
            FROM (
              SELECT DISTINCT
                s.id,
                s.subject_name,
                s.subject_code,
                (
                  SELECT teacher.full_name
                  FROM subject_teachers st
                  JOIN users teacher ON teacher.id = st.teacher_id
                  WHERE st.subject_id = s.id
                  LIMIT 1
                ) AS teacher
              FROM course_registrations cr
              JOIN subjects s ON s.id = cr.subject_id
              WHERE cr.student_id = u.id
            ) enrolled
          ), '[]'::json) AS enrolled_subjects
        FROM users u
        WHERE u.role = ${role}
        ORDER BY u.created_at DESC
      `;
    } else {
      users = await sql`
        SELECT
          u.id,
          u.email,
          u.full_name,
          u.role,
          u.student_id,
          u.grade,
          u.created_at,
          COALESCE((
            SELECT json_agg(json_build_object(
              'id', assigned.id,
              'name', assigned.subject_name,
              'subject_code', assigned.subject_code
            ) ORDER BY assigned.subject_name)
            FROM (
              SELECT DISTINCT s.id, s.subject_name, s.subject_code
              FROM subject_teachers st
              JOIN subjects s ON s.id = st.subject_id
              WHERE st.teacher_id = u.id
            ) assigned
          ), '[]'::json) AS subjects,
          COALESCE((
            SELECT json_agg(json_build_object(
              'id', enrolled.id,
              'name', enrolled.subject_name,
              'subject_code', enrolled.subject_code,
              'teacher', enrolled.teacher
            ) ORDER BY enrolled.subject_name)
            FROM (
              SELECT DISTINCT
                s.id,
                s.subject_name,
                s.subject_code,
                (
                  SELECT teacher.full_name
                  FROM subject_teachers st
                  JOIN users teacher ON teacher.id = st.teacher_id
                  WHERE st.subject_id = s.id
                  LIMIT 1
                ) AS teacher
              FROM course_registrations cr
              JOIN subjects s ON s.id = cr.subject_id
              WHERE cr.student_id = u.id
            ) enrolled
          ), '[]'::json) AS enrolled_subjects
        FROM users u
        ORDER BY u.created_at DESC
      `;
    }

    return NextResponse.json(Array.isArray(users) ? users : []);
  } catch (error) {
    const details = errorDetails(error);
    console.error('Error fetching users:', details);
    return NextResponse.json(
      { message: 'Failed to fetch users', error: details },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const id = Number(body.id);
    const email = String(body.email ?? '').trim().toLowerCase();
    const password = typeof body.password === 'string' ? body.password : '';
    const fullName = String(body.full_name ?? '').trim();
    const role = String(body.role ?? '').trim().toLowerCase();
    const studentId = body.student_id ? String(body.student_id).trim() : null;
    const grade = body.grade ? String(body.grade).trim() : null;
    const subjectId = body.subject_id ? Number(body.subject_id) : null;

    if (!id || !email || !fullName || !role) {
      return NextResponse.json({ message: 'ID, email, full name, and role are required' }, { status: 400 });
    }

    const existingUser = await sql`SELECT id FROM users WHERE email = ${email} AND id != ${id} LIMIT 1`;
    if (existingUser.length > 0) {
      return NextResponse.json({ message: 'Email already in use' }, { status: 409 });
    }

    let updatedUser;
    if (password.trim()) {
      updatedUser = await sql`
        UPDATE users
        SET email = ${email}, full_name = ${fullName}, password_hash = ${password}, role = ${role},
            student_id = ${studentId}, grade = ${grade}
        WHERE id = ${id}
        RETURNING id, email, full_name, role, student_id, grade, created_at
      `;
    } else {
      updatedUser = await sql`
        UPDATE users
        SET email = ${email}, full_name = ${fullName}, role = ${role},
            student_id = ${studentId}, grade = ${grade}
        WHERE id = ${id}
        RETURNING id, email, full_name, role, student_id, grade, created_at
      `;
    }

    if (updatedUser.length === 0) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    if (role === 'teacher') {
      await sql`DELETE FROM subject_teachers WHERE teacher_id = ${id}`;
      if (subjectId) {
        await sql`INSERT INTO subject_teachers (subject_id, teacher_id) VALUES (${subjectId}, ${id})`;
      }
    }

    return NextResponse.json(
      { message: 'User updated successfully', user: updatedUser[0] },
      { status: 200 }
    );
  } catch (error) {
    const details = errorDetails(error);
    console.error('Error updating user:', details);
    return NextResponse.json(
      { message: 'Internal server error', error: details },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get('id'));

    if (!id) {
      return NextResponse.json({ message: 'ID required' }, { status: 400 });
    }

    await sql`DELETE FROM classes WHERE teacher_id = ${id}`;
    await sql`DELETE FROM subject_teachers WHERE teacher_id = ${id}`;
    await sql`DELETE FROM course_registrations WHERE student_id = ${id}`;

    const deleted = await sql`
      DELETE FROM users WHERE id = ${id}
      RETURNING id
    `;

    if (deleted.length === 0) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'User deleted' }, { status: 200 });
  } catch (error) {
    const details = errorDetails(error);
    console.error('Error deleting user:', details);
    return NextResponse.json(
      { message: 'Internal server error', error: details },
      { status: 500 }
    );
  }
}