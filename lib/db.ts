import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Meal, Exercise, WeightLog, Goal, ChatMessage } from './types';

let supabase: SupabaseClient | null = null;

export function getDb(): SupabaseClient {
  if (!supabase) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables');
    }

    supabase = createClient(supabaseUrl, supabaseKey);
  }
  return supabase;
}

// ヘルパー関数群
export async function getMeals(days: number = 7): Promise<Meal[]> {
  const db = getDb();
  const daysAgo = new Date();
  daysAgo.setDate(daysAgo.getDate() - days);

  const { data, error } = await db
    .from('meals')
    .select('*')
    .gte('recorded_at', daysAgo.toISOString())
    .order('recorded_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getExercises(days: number = 7): Promise<Exercise[]> {
  const db = getDb();
  const daysAgo = new Date();
  daysAgo.setDate(daysAgo.getDate() - days);

  const { data, error } = await db
    .from('exercises')
    .select('*')
    .gte('recorded_at', daysAgo.toISOString())
    .order('recorded_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getWeightLogs(days: number = 30): Promise<WeightLog[]> {
  const db = getDb();
  const daysAgo = new Date();
  daysAgo.setDate(daysAgo.getDate() - days);

  const { data, error } = await db
    .from('weight_logs')
    .select('*')
    .gte('recorded_at', daysAgo.toISOString())
    .order('recorded_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getLatestGoal(): Promise<Goal | undefined> {
  const db = getDb();

  const { data, error } = await db
    .from('goals')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
  return data || undefined;
}

export async function getChatHistory(limit: number = 20): Promise<ChatMessage[]> {
  const db = getDb();

  const { data, error } = await db
    .from('chat_messages')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data || []).reverse();
}

export async function getLatestWeight(): Promise<WeightLog | undefined> {
  const db = getDb();

  const { data, error } = await db
    .from('weight_logs')
    .select('*')
    .order('recorded_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data || undefined;
}

// 挿入ヘルパー
export async function insertMeal(meal: Omit<Meal, 'id' | 'created_at'>) {
  const db = getDb();
  const { data, error } = await db.from('meals').insert(meal).select().single();
  if (error) throw error;
  return data;
}

export async function insertExercise(exercise: Omit<Exercise, 'id' | 'created_at'>) {
  const db = getDb();
  const { data, error } = await db.from('exercises').insert(exercise).select().single();
  if (error) throw error;
  return data;
}

export async function insertWeightLog(weight: Omit<WeightLog, 'id' | 'created_at'>) {
  const db = getDb();
  const { data, error } = await db.from('weight_logs').insert(weight).select().single();
  if (error) throw error;
  return data;
}

export async function insertGoal(goal: Omit<Goal, 'id' | 'created_at'>) {
  const db = getDb();
  const { data, error } = await db.from('goals').insert(goal).select().single();
  if (error) throw error;
  return data;
}

export async function insertChatMessage(message: Omit<ChatMessage, 'id' | 'created_at'>) {
  const db = getDb();
  const { data, error } = await db.from('chat_messages').insert(message).select().single();
  if (error) throw error;
  return data;
}
