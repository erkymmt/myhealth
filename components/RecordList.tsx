'use client';

import { useState, useEffect } from 'react';
import { Meal, Exercise, WeightLog } from '@/lib/types';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

interface RecordListProps {
  refreshTrigger: number;
}

export default function RecordList({ refreshTrigger }: RecordListProps) {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [weights, setWeights] = useState<WeightLog[]>([]);
  const [activeTab, setActiveTab] = useState<'meal' | 'exercise' | 'weight'>('meal');

  useEffect(() => {
    fetchRecords();
  }, [refreshTrigger]);

  const fetchRecords = async () => {
    try {
      const [mealsRes, exercisesRes, weightsRes] = await Promise.all([
        fetch('/api/meals?days=7'),
        fetch('/api/exercises?days=7'),
        fetch('/api/weight?days=30'),
      ]);

      const [mealsData, exercisesData, weightsData] = await Promise.all([
        mealsRes.json(),
        exercisesRes.json(),
        weightsRes.json(),
      ]);

      if (mealsData.success) setMeals(mealsData.data || []);
      if (exercisesData.success) setExercises(exercisesData.data || []);
      if (weightsData.success) setWeights(weightsData.data || []);
    } catch (error) {
      console.error('Failed to fetch records:', error);
    }
  };

  const mealTypeLabel: Record<string, string> = {
    breakfast: '朝食',
    lunch: '昼食',
    dinner: '夕食',
    snack: 'おやつ',
  };

  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), 'M/d(E) HH:mm', { locale: ja });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <h2 className="text-lg font-bold mb-4 text-gray-800">記録一覧</h2>

      <div className="flex space-x-2 mb-4">
        {[
          { type: 'meal', label: '食事', icon: '🍽️' },
          { type: 'exercise', label: '運動', icon: '🏃' },
          { type: 'weight', label: '体重', icon: '⚖️' },
        ].map(({ type, label, icon }) => (
          <button
            key={type}
            onClick={() => setActiveTab(type as typeof activeTab)}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
              activeTab === type
                ? 'bg-green-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {icon} {label}
          </button>
        ))}
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {activeTab === 'meal' && (
          <>
            {meals.length === 0 ? (
              <p className="text-gray-500 text-center py-4">食事記録がありません</p>
            ) : (
              meals.map((meal) => (
                <div key={meal.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start">
                    <span className="text-xs text-gray-500">{formatDate(meal.recorded_at)}</span>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                      {mealTypeLabel[meal.meal_type]}
                    </span>
                  </div>
                  <p className="text-sm text-gray-800 mt-1">{meal.description}</p>
                  {meal.calories && (
                    <p className="text-xs text-gray-500 mt-1">{meal.calories} kcal</p>
                  )}
                </div>
              ))
            )}
          </>
        )}

        {activeTab === 'exercise' && (
          <>
            {exercises.length === 0 ? (
              <p className="text-gray-500 text-center py-4">運動記録がありません</p>
            ) : (
              exercises.map((exercise) => (
                <div key={exercise.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start">
                    <span className="text-xs text-gray-500">{formatDate(exercise.recorded_at)}</span>
                  </div>
                  <p className="text-sm text-gray-800 mt-1">{exercise.description}</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {exercise.duration_minutes && (
                      <span className="text-xs text-gray-500">{exercise.duration_minutes}分</span>
                    )}
                    {exercise.calories_burned && (
                      <span className="text-xs text-orange-600">{exercise.calories_burned}kcal消費</span>
                    )}
                    {exercise.heart_rate_avg && (
                      <span className="text-xs text-red-500">心拍{exercise.heart_rate_avg}</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {activeTab === 'weight' && (
          <>
            {weights.length === 0 ? (
              <p className="text-gray-500 text-center py-4">体重記録がありません</p>
            ) : (
              weights.map((weight, index) => {
                const prevWeight = weights[index + 1];
                const diff = prevWeight ? (weight.weight_kg - prevWeight.weight_kg).toFixed(1) : null;
                return (
                  <div key={weight.id} className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      {format(new Date(weight.recorded_at), 'M/d(E)', { locale: ja })}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold text-gray-800">{weight.weight_kg} kg</span>
                      {diff && (
                        <span className={`text-xs ${parseFloat(diff) > 0 ? 'text-red-500' : 'text-green-500'}`}>
                          {parseFloat(diff) > 0 ? '+' : ''}{diff}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </>
        )}
      </div>
    </div>
  );
}
