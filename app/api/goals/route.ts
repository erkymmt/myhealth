import { NextRequest, NextResponse } from 'next/server';
import { getLatestGoal, insertGoal } from '@/lib/db';

export async function GET() {
  try {
    const goal = await getLatestGoal();
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

    const result = await insertGoal({
      target_weight_kg,
      target_date,
      initial_weight_kg,
      notes: notes || undefined,
    });

    return NextResponse.json({ success: true, data: { id: result.id } });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
