import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Database එකේ ඒ email එක තියෙනවද බලනවා
    const users = await sql`
      SELECT * FROM users WHERE email = ${email}
    `;

    if (users.length === 0) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const user = users[0];

    // Password එක හරිද බලනවා
    if (user.password_hash !== password) {
      return NextResponse.json({ message: 'Invalid password' }, { status: 401 });
    }

    // සාර්ථක නම් role එක එවනවා
    return NextResponse.json({ 
      message: 'Login successful', 
      role: user.role,
      name: user.full_name 
    });

  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}