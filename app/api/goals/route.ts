import { NextRequest, NextResponse } from 'next/server';
import { getDb, getLatestGoal } from '@/lib/db';

export async function GET() {
  try {
    const goal = getLatestGoal();
    return NextResponse.json({ success: true, data: goal });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { target_weight_kg, target_date, initial_weight_kg, notes } = body;

    if (!target_weight_kg || !target_date || !initial_weight_kg) {
      return NextResponse.json(
        { success: false, error: 'target_weight_kg, target_date, and initial_weight_kg are required' },
        { status: 400 }
      );
    }

    const db = getDb();
    const stmt = db.prepare(`
      INSERT INTO goals (target_weight_kg, target_date, initial_weight_kg, notes)
      VALUES (?, ?, ?, ?)
    `);

    const result = stmt.run(
      target_weight_kg,
      target_date,
      initial_weight_kg,
      notes || null
    );

    return NextResponse.json({ success: true, data: { id: result.lastInsertRowid } });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
