import { NextRequest, NextResponse } from 'next/server';
import { getMeals, insertMeal } from '@/lib/db';
import { MealType } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7');
    const meals = await getMeals(days);
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

    const result = await insertMeal({
      meal_type: meal_type as MealType,
      description,
      calories: calories || undefined,
      recorded_at: recorded_at || new Date().toISOString(),
    });

    return NextResponse.json({ success: true, data: { id: result.id } });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
