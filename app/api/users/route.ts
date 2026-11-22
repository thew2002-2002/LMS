import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

// 1. අලුත් User කෙනෙක් හදන්න (POST)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, full_name, role, student_id, grade } = body;

    const existingUser = await sql`SELECT * FROM users WHERE email = ${email}`;
    if (existingUser.length > 0) {
      return NextResponse.json({ message: 'Email already exists' }, { status: 400 });
    }

    const newUser = await sql`
      INSERT INTO users (email, password_hash, full_name, role, student_id, grade)
      VALUES (${email}, ${password}, ${full_name}, ${role}, ${student_id || null}, ${grade || null})
      RETURNING id, email, full_name, role, grade
    `;

    return NextResponse.json({ message: 'User created successfully', user: newUser[0] }, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// 2. හැම User කෙනෙක්වම ගන්න (GET)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role'); 

    // Teacher ලාව විතරක් ඉල්ලුවොත්
    if (role === 'teacher') {
      const teachers = await sql`
        SELECT u.id, u.full_name, u.email, u.role,
        (SELECT json_agg(json_build_object('id', m.id, 'name', m.module_name))
         FROM modules m WHERE m.teacher_id = u.id) as subjects
        FROM users u WHERE u.role = 'teacher'
      `;
      return NextResponse.json(teachers);
    }

    // හැමෝම ගන්නකොට (මේකේ තමයි අපිට ඕන කරන දේ තියෙන්නේ)
    const users = await sql`
      SELECT 
        u.id, u.email, u.full_name, u.role, u.student_id, u.grade, u.created_at,
        (
          SELECT json_agg(json_build_object('id', m.id, 'name', m.module_name))
          FROM modules m 
          WHERE m.teacher_id = u.id
        ) as subjects,
        (
          SELECT json_agg(json_build_object('id', m.id, 'name', m.module_name, 'teacher', t.full_name))
          FROM module_registrations mr
          JOIN modules m ON mr.module_id = m.id
          LEFT JOIN users t ON m.teacher_id = t.id
          WHERE mr.student_id = u.id
        ) as enrolled_subjects
      FROM users u 
      ORDER BY u.created_at DESC
    `;
    
    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ message: 'Error fetching users' }, { status: 500 });
  }
}

// 3. User කෙනෙක්ව වෙනස් කරන්න (PUT)
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, email, password, full_name, role, student_id, grade } = body;

    const existingUser = await sql`SELECT * FROM users WHERE email = ${email} AND id != ${id}`;
    if (existingUser.length > 0) {
      return NextResponse.json({ message: 'Email already in use' }, { status: 400 });
    }

    let updatedUser;
    if (password && password.trim() !== '') {
      updatedUser = await sql`
        UPDATE users 
        SET email = ${email}, full_name = ${full_name}, password_hash = ${password}, role = ${role}, student_id = ${student_id || null}, grade = ${grade || null}
        WHERE id = ${id} RETURNING *
      `;
    } else {
      updatedUser = await sql`
        UPDATE users 
        SET email = ${email}, full_name = ${full_name}, role = ${role}, student_id = ${student_id || null}, grade = ${grade || null}
        WHERE id = ${id} RETURNING *
      `;
    }

    return NextResponse.json({ message: 'User updated successfully', user: updatedUser[0] }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// 4. User කෙනෙක්ව මකන්න (DELETE)
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ message: 'ID required' }, { status: 400 });

    await sql`DELETE FROM users WHERE id = ${id}`;
    return NextResponse.json({ message: 'User deleted' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}