import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getMeals, getExercises, getWeightLogs, getLatestGoal, getChatHistory, getLatestWeight, insertChatMessage } from '@/lib/db';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Meal, Exercise, WeightLog, Goal } from '@/lib/types';

function getOpenAIClient() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

function buildSystemPrompt(
  meals: Meal[],
  exercises: Exercise[],
  weights: WeightLog[],
  goal: Goal | undefined,
  latestWeight: WeightLog | undefined
) {
  const now = new Date();
  const currentTime = format(now, 'yyyy年M月d日(E) HH:mm', { locale: ja });
  const dayOfWeek = format(now, 'EEEE', { locale: ja });

  // 食事データを整形
  const mealsText = meals.length > 0
    ? meals.map(m => {
      const mealDate = format(new Date(m.recorded_at), 'M/d(E) HH:mm', { locale: ja });
      const typeMap: Record<string, string> = {
        breakfast: '朝食',
        lunch: '昼食',
        dinner: '夕食',
        snack: 'おやつ'
      };
      return `- ${mealDate} ${typeMap[m.meal_type] || m.meal_type}: ${m.description}${m.calories ? ` (${m.calories}kcal)` : ''}`;
    }).join('\n')
    : '記録なし';

  // 運動データを整形
  const exercisesText = exercises.length > 0
    ? exercises.map(e => {
      const exDate = format(new Date(e.recorded_at), 'M/d(E) HH:mm', { locale: ja });
      let detail = e.description;
      if (e.duration_minutes) detail += ` (${e.duration_minutes}分)`;
      if (e.calories_burned) detail += ` 消費${e.calories_burned}kcal`;
      if (e.heart_rate_avg) detail += ` 平均心拍${e.heart_rate_avg}`;
      return `- ${exDate}: ${detail}`;
    }).join('\n')
    : '記録なし';

  // 体重データを整形
  const weightsText = weights.length > 0
    ? weights.slice(0, 5).map(w => {
      const wDate = format(new Date(w.recorded_at), 'M/d(E)', { locale: ja });
      return `- ${wDate}: ${w.weight_kg}kg`;
    }).join('\n')
    : '記録なし';

  // 目標情報を整形
  let goalText = '目標未設定';
  if (goal) {
    const targetDate = format(new Date(goal.target_date), 'yyyy年M月d日', { locale: ja });
    goalText = `目標: ${goal.target_weight_kg}kg (期限: ${targetDate})\n開始時体重: ${goal.initial_weight_kg}kg`;
    if (latestWeight) {
      const diff = (goal.initial_weight_kg - latestWeight.weight_kg).toFixed(1);
      const remaining = (latestWeight.weight_kg - goal.target_weight_kg).toFixed(1);
      goalText += `\n現在: ${latestWeight.weight_kg}kg (開始から${diff}kg減, あと${remaining}kg)`;
    }
    if (goal.notes) {
      goalText += `\nメモ: ${goal.notes}`;
    }
  }

  return `あなたはダイエットをサポートするパーソナルアドバイザーです。
ユーザーの食事、運動、体重の記録を把握した上で、具体的で実践的なアドバイスを提供してください。

## 現在時刻
${currentTime}（${dayOfWeek}）

## ユーザーの目標
${goalText}

## 最近の食事記録（過去7日間）
${mealsText}

## 最近の運動記録（過去7日間）
${exercisesText}

## 体重推移（直近5回）
${weightsText}

## あなたの役割
- 時間や曜日を意識したアドバイス（例：「今日は水曜日なので週の後半に向けて...」）
- 過去の記録を参照した具体的なフィードバック
- 励ましつつも現実的なアドバイス
- 必要に応じてカロリーや栄養バランスの観点からコメント
- ユーザーが「朝ご飯食べた」と言ったら、今日の朝食の話だと理解する

返答は親しみやすく、でも専門的なトーンで。日本語で回答してください。`;
}

export async function GET() {
  try {
    const history = await getChatHistory(50);
    return NextResponse.json({ success: true, data: history });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json(
        { success: false, error: 'message is required' },
        { status: 400 }
      );
    }

    // ユーザーメッセージを保存
    await insertChatMessage({ role: 'user', content: message });

    // データを並列取得
    const [meals, exercises, weights, goal, latestWeight, history] = await Promise.all([
      getMeals(7),
      getExercises(7),
      getWeightLogs(30),
      getLatestGoal(),
      getLatestWeight(),
      getChatHistory(20),
    ]);

    // OpenAI APIにリクエスト
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: buildSystemPrompt(meals, exercises, weights, goal, latestWeight) },
      ...history.map(h => ({
        role: h.role as 'user' | 'assistant',
        content: h.content
      }))
    ];

    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      max_tokens: 1000,
      temperature: 0.7,
    });

    const reply = completion.choices[0]?.message?.content || 'すみません、応答を生成できませんでした。';

    // アシスタントの返答を保存
    await insertChatMessage({ role: 'assistant', content: reply });

    return NextResponse.json({ success: true, data: { reply } });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
