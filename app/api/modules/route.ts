import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

// 1. අලුත් Module එකක් හදන්න (POST)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { module_name, module_code } = body;

    const newModule = await sql`
      INSERT INTO modules (module_name, module_code)
      VALUES (${module_name}, ${module_code})
      RETURNING *
    `;

    return NextResponse.json({ message: 'Module created successfully', module: newModule[0] }, { status: 201 });
  } catch (error: any) {
    if (error.code === '23505') {
      return NextResponse.json({ message: 'Module Code already exists' }, { status: 400 });
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// 2. හැම Module එකක්ම ගන්න (GET) - Teacher ගේ නමත් එක්කම
export async function GET() {
  try {
    const modules = await sql`
      SELECT m.*, u.full_name as teacher_name 
      FROM modules m
      LEFT JOIN users u ON m.teacher_id = u.id
      ORDER BY m.id DESC
    `;
    return NextResponse.json(modules);
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching modules' }, { status: 500 });
  }
}

// 3. Module එකකට Teacher කෙනෙක්ව පවරන්න (PUT)
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { module_id, teacher_id } = body;

    const updatedModule = await sql`
      UPDATE modules 
      SET teacher_id = ${teacher_id}
      WHERE id = ${module_id}
      RETURNING *
    `;

    return NextResponse.json({ message: 'Teacher assigned successfully', module: updatedModule[0] }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}