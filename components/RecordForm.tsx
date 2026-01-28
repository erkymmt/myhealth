'use client';

import { useState } from 'react';
import { MealType } from '@/lib/types';

type RecordType = 'meal' | 'exercise' | 'weight';

interface RecordFormProps {
  onRecordAdded: () => void;
}

export default function RecordForm({ onRecordAdded }: RecordFormProps) {
  const [recordType, setRecordType] = useState<RecordType>('meal');
  const [loading, setLoading] = useState(false);

  // 食事用
  const [mealType, setMealType] = useState<MealType>('breakfast');
  const [mealDescription, setMealDescription] = useState('');
  const [mealCalories, setMealCalories] = useState('');

  // 運動用
  const [exerciseDescription, setExerciseDescription] = useState('');
  const [exerciseDuration, setExerciseDuration] = useState('');
  const [exerciseCalories, setExerciseCalories] = useState('');
  const [exerciseHeartRate, setExerciseHeartRate] = useState('');

  // 体重用
  const [weightKg, setWeightKg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let url = '';
      let body = {};

      switch (recordType) {
        case 'meal':
          url = '/api/meals';
          body = {
            meal_type: mealType,
            description: mealDescription,
            calories: mealCalories ? parseInt(mealCalories) : undefined,
          };
          break;
        case 'exercise':
          url = '/api/exercises';
          body = {
            description: exerciseDescription,
            duration_minutes: exerciseDuration ? parseInt(exerciseDuration) : undefined,
            calories_burned: exerciseCalories ? parseInt(exerciseCalories) : undefined,
            heart_rate_avg: exerciseHeartRate ? parseInt(exerciseHeartRate) : undefined,
          };
          break;
        case 'weight':
          url = '/api/weight';
          body = {
            weight_kg: parseFloat(weightKg),
          };
          break;
      }

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (data.success) {
        // フォームリセット
        setMealDescription('');
        setMealCalories('');
        setExerciseDescription('');
        setExerciseDuration('');
        setExerciseCalories('');
        setExerciseHeartRate('');
        setWeightKg('');
        onRecordAdded();
      } else {
        alert('エラー: ' + data.error);
      }
    } catch (error) {
      alert('通信エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <h2 className="text-lg font-bold mb-4 text-gray-800">記録を追加</h2>

      <div className="flex space-x-2 mb-4">
        {[
          { type: 'meal', label: '食事', icon: '🍽️' },
          { type: 'exercise', label: '運動', icon: '🏃' },
          { type: 'weight', label: '体重', icon: '⚖️' },
        ].map(({ type, label, icon }) => (
          <button
            key={type}
            onClick={() => setRecordType(type as RecordType)}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
              recordType === type
                ? 'bg-green-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {icon} {label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {recordType === 'meal' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">種類</label>
              <select
                value={mealType}
                onChange={(e) => setMealType(e.target.value as MealType)}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="breakfast">朝食</option>
                <option value="lunch">昼食</option>
                <option value="dinner">夕食</option>
                <option value="snack">おやつ</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">内容</label>
              <textarea
                value={mealDescription}
                onChange={(e) => setMealDescription(e.target.value)}
                placeholder="例: 玄米ご飯、味噌汁、焼き鮭"
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                rows={2}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">カロリー (任意)</label>
              <input
                type="number"
                value={mealCalories}
                onChange={(e) => setMealCalories(e.target.value)}
                placeholder="例: 500"
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </>
        )}

        {recordType === 'exercise' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">内容</label>
              <textarea
                value={exerciseDescription}
                onChange={(e) => setExerciseDescription(e.target.value)}
                placeholder="例: キックボクシング、ジョギング5km"
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                rows={2}
                required
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">時間(分)</label>
                <input
                  type="number"
                  value={exerciseDuration}
                  onChange={(e) => setExerciseDuration(e.target.value)}
                  placeholder="60"
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">消費kcal</label>
                <input
                  type="number"
                  value={exerciseCalories}
                  onChange={(e) => setExerciseCalories(e.target.value)}
                  placeholder="400"
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">平均心拍</label>
                <input
                  type="number"
                  value={exerciseHeartRate}
                  onChange={(e) => setExerciseHeartRate(e.target.value)}
                  placeholder="130"
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          </>
        )}

        {recordType === 'weight' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">体重 (kg)</label>
            <input
              type="number"
              step="0.1"
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
              placeholder="例: 65.5"
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {loading ? '保存中...' : '記録する'}
        </button>
      </form>
    </div>
  );
}
