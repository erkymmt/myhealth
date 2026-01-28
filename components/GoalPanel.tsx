'use client';

import { useState, useEffect } from 'react';
import { Goal, WeightLog } from '@/lib/types';
import { format, differenceInDays } from 'date-fns';
import { ja } from 'date-fns/locale';

interface GoalPanelProps {
  refreshTrigger: number;
  onGoalSet: () => void;
}

export default function GoalPanel({ refreshTrigger, onGoalSet }: GoalPanelProps) {
  const [goal, setGoal] = useState<Goal | null>(null);
  const [latestWeight, setLatestWeight] = useState<WeightLog | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  // フォーム用
  const [targetWeight, setTargetWeight] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [initialWeight, setInitialWeight] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchData();
  }, [refreshTrigger]);

  const fetchData = async () => {
    try {
      const [goalRes, weightRes] = await Promise.all([
        fetch('/api/goals'),
        fetch('/api/weight?latest=true'),
      ]);
      const [goalData, weightData] = await Promise.all([goalRes.json(), weightRes.json()]);
      if (goalData.success) setGoal(goalData.data || null);
      if (weightData.success) setLatestWeight(weightData.data || null);
    } catch (error) {
      console.error('Failed to fetch goal:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_weight_kg: parseFloat(targetWeight),
          target_date: targetDate,
          initial_weight_kg: parseFloat(initialWeight),
          notes: notes || undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setShowForm(false);
        setTargetWeight('');
        setTargetDate('');
        setInitialWeight('');
        setNotes('');
        fetchData();
        onGoalSet();
      } else {
        alert('エラー: ' + data.error);
      }
    } catch (error) {
      alert('通信エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = () => {
    if (!goal || !latestWeight) return null;

    const totalToLose = goal.initial_weight_kg - goal.target_weight_kg;
    const lost = goal.initial_weight_kg - latestWeight.weight_kg;
    const progressPercent = Math.min(100, Math.max(0, (lost / totalToLose) * 100));
    const remaining = latestWeight.weight_kg - goal.target_weight_kg;
    const daysLeft = differenceInDays(new Date(goal.target_date), new Date());

    return {
      progressPercent,
      lost,
      remaining,
      daysLeft,
    };
  };

  const progress = calculateProgress();

  if (showForm) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-4">
        <h2 className="text-lg font-bold mb-4 text-gray-800">目標設定</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">目標体重 (kg)</label>
            <input
              type="number"
              step="0.1"
              value={targetWeight}
              onChange={(e) => setTargetWeight(e.target.value)}
              placeholder="例: 60.0"
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">目標期限</label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">現在の体重 (kg)</label>
            <input
              type="number"
              step="0.1"
              value={initialWeight}
              onChange={(e) => setInitialWeight(e.target.value)}
              placeholder="例: 70.0"
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">メモ (任意)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="例: 週3回キックボクシング、糖質制限"
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              rows={2}
            />
          </div>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? '設定中...' : '設定する'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-gray-800">目標</h2>
        <button
          onClick={() => setShowForm(true)}
          className="text-sm text-green-600 hover:text-green-700"
        >
          {goal ? '変更' : '設定する'}
        </button>
      </div>

      {!goal ? (
        <div className="text-center py-4">
          <p className="text-gray-500">目標が設定されていません</p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
          >
            目標を設定する
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">{goal.target_weight_kg} kg</p>
            <p className="text-sm text-gray-500">
              目標: {format(new Date(goal.target_date), 'yyyy年M月d日', { locale: ja })}まで
            </p>
          </div>

          {progress && (
            <>
              <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="absolute h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-500"
                  style={{ width: `${progress.progressPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>{goal.initial_weight_kg}kg</span>
                <span className="font-medium text-green-600">
                  {progress.progressPercent.toFixed(0)}% 達成
                </span>
                <span>{goal.target_weight_kg}kg</span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 bg-gray-50 rounded-lg">
                  <p className="text-lg font-bold text-gray-800">
                    {latestWeight?.weight_kg || '-'}kg
                  </p>
                  <p className="text-xs text-gray-500">現在</p>
                </div>
                <div className="p-2 bg-green-50 rounded-lg">
                  <p className="text-lg font-bold text-green-600">
                    -{progress.lost.toFixed(1)}kg
                  </p>
                  <p className="text-xs text-gray-500">減量済み</p>
                </div>
                <div className="p-2 bg-orange-50 rounded-lg">
                  <p className="text-lg font-bold text-orange-600">
                    {progress.remaining.toFixed(1)}kg
                  </p>
                  <p className="text-xs text-gray-500">残り</p>
                </div>
              </div>

              <p className="text-center text-sm text-gray-600">
                {progress.daysLeft > 0 ? (
                  <>あと <span className="font-bold">{progress.daysLeft}日</span></>
                ) : (
                  <span className="text-red-500">期限を過ぎています</span>
                )}
              </p>
            </>
          )}

          {goal.notes && (
            <p className="text-sm text-gray-500 bg-gray-50 p-2 rounded">
              {goal.notes}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
