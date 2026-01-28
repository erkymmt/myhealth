import { NextRequest, NextResponse } from 'next/server';
import { getExercises, insertExercise } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7');
    const exercises = await getExercises(days);
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

    const result = await insertExercise({
      description,
      duration_minutes: duration_minutes || undefined,
      calories_burned: calories_burned || undefined,
      heart_rate_avg: heart_rate_avg || undefined,
      recorded_at: recorded_at || new Date().toISOString(),
    });

    return NextResponse.json({ success: true, data: { id: result.id } });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
