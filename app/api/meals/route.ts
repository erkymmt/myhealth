import { NextRequest, NextResponse } from 'next/server';
import { getDb, getMeals } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7');
    const meals = getMeals(days);
    return NextResponse.json({ success: true, data: meals });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { meal_type, description, calories, recorded_at } = body;

    if (!meal_type || !description) {
      return NextResponse.json(
        { success: false, error: 'meal_type and description are required' },
        { status: 400 }
      );
    }

    const db = getDb();
    const stmt = db.prepare(`
      INSERT INTO meals (meal_type, description, calories, recorded_at)
      VALUES (?, ?, ?, ?)
    `);

    const result = stmt.run(
      meal_type,
      description,
      calories || null,
      recorded_at || new Date().toISOString()
    );

    return NextResponse.json({ success: true, data: { id: result.lastInsertRowid } });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
