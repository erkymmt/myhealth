import { NextRequest, NextResponse } from 'next/server';
import { getWeightLogs, getLatestWeight, insertWeightLog } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');
    const latest = searchParams.get('latest') === 'true';

    if (latest) {
      const weight = await getLatestWeight();
      return NextResponse.json({ success: true, data: weight });
    }

    const weights = await getWeightLogs(days);
    return NextResponse.json({ success: true, data: weights });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { weight_kg, recorded_at } = body;

    if (!weight_kg) {
      return NextResponse.json(
        { success: false, error: 'weight_kg is required' },
        { status: 400 }
      );
    }

    const result = await insertWeightLog({
      weight_kg,
      recorded_at: recorded_at || new Date().toISOString(),
    });

    return NextResponse.json({ success: true, data: { id: result.id } });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
