import { NextRequest, NextResponse } from 'next/server';
import { getDb, getExercises } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7');
    const exercises = getExercises(days);
    return NextResponse.json({ success: true, data: exercises });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { description, duration_minutes, calories_burned, heart_rate_avg, recorded_at } = body;

    if (!description) {
      return NextResponse.json(
        { success: false, error: 'description is required' },
        { status: 400 }
      );
    }

    const db = getDb();
    const stmt = db.prepare(`
      INSERT INTO exercises (description, duration_minutes, calories_burned, heart_rate_avg, recorded_at)
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      description,
      duration_minutes || null,
      calories_burned || null,
      heart_rate_avg || null,
      recorded_at || new Date().toISOString()
    );

    return NextResponse.json({ success: true, data: { id: result.lastInsertRowid } });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
