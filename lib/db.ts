import Database from 'better-sqlite3';
import path from 'path';
import { Meal, Exercise, WeightLog, Goal, ChatMessage } from './types';

const dbPath = path.join(process.cwd(), 'data', 'myhealth.db');

// データベースインスタンスをシングルトンで管理
let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    // dataディレクトリがなければ作成
    const fs = require('fs');
    const dataDir = path.dirname(dbPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    initTables(db);
  }
  return db;
}

function initTables(db: Database.Database) {
  // 目標テーブル
  db.exec(`
    CREATE TABLE IF NOT EXISTS goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      target_weight_kg REAL NOT NULL,
      target_date TEXT NOT NULL,
      initial_weight_kg REAL NOT NULL,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now', 'localtime'))
    )
  `);

  // 体重記録テーブル
  db.exec(`
    CREATE TABLE IF NOT EXISTS weight_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      weight_kg REAL NOT NULL,
      recorded_at TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now', 'localtime'))
    )
  `);

  // 食事記録テーブル
  db.exec(`
    CREATE TABLE IF NOT EXISTS meals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      meal_type TEXT NOT NULL CHECK(meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
      description TEXT NOT NULL,
      calories INTEGER,
      recorded_at TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now', 'localtime'))
    )
  `);

  // 運動記録テーブル
  db.exec(`
    CREATE TABLE IF NOT EXISTS exercises (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      description TEXT NOT NULL,
      duration_minutes INTEGER,
      calories_burned INTEGER,
      heart_rate_avg INTEGER,
      recorded_at TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now', 'localtime'))
    )
  `);

  // チャット履歴テーブル
  db.exec(`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      role TEXT NOT NULL CHECK(role IN ('user', 'assistant')),
      content TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now', 'localtime'))
    )
  `);
}

// ヘルパー関数群
export function getMeals(days: number = 7): Meal[] {
  const db = getDb();
  return db.prepare(`
    SELECT * FROM meals
    WHERE recorded_at >= datetime('now', '-${days} days', 'localtime')
    ORDER BY recorded_at DESC
  `).all() as Meal[];
}

export function getExercises(days: number = 7): Exercise[] {
  const db = getDb();
  return db.prepare(`
    SELECT * FROM exercises
    WHERE recorded_at >= datetime('now', '-${days} days', 'localtime')
    ORDER BY recorded_at DESC
  `).all() as Exercise[];
}

export function getWeightLogs(days: number = 30): WeightLog[] {
  const db = getDb();
  return db.prepare(`
    SELECT * FROM weight_logs
    WHERE recorded_at >= datetime('now', '-${days} days', 'localtime')
    ORDER BY recorded_at DESC
  `).all() as WeightLog[];
}

export function getLatestGoal(): Goal | undefined {
  const db = getDb();
  return db.prepare(`
    SELECT * FROM goals ORDER BY created_at DESC LIMIT 1
  `).get() as Goal | undefined;
}

export function getChatHistory(limit: number = 20): ChatMessage[] {
  const db = getDb();
  return (db.prepare(`
    SELECT * FROM chat_messages ORDER BY created_at DESC LIMIT ?
  `).all(limit) as ChatMessage[]).reverse();
}

export function getLatestWeight(): WeightLog | undefined {
  const db = getDb();
  return db.prepare(`
    SELECT * FROM weight_logs ORDER BY recorded_at DESC LIMIT 1
  `).get() as WeightLog | undefined;
}
