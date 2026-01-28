'use client';

import { useState } from 'react';
import ChatPanel from '@/components/ChatPanel';
import RecordForm from '@/components/RecordForm';
import RecordList from '@/components/RecordList';
import GoalPanel from '@/components/GoalPanel';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

export default function Home() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const now = new Date();
  const currentDate = format(now, 'M月d日(E)', { locale: ja });
  const currentTime = format(now, 'HH:mm');

  const handleRecordAdded = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-green-700">MyHealth</h1>
              <p className="text-sm text-gray-500">ダイエット相談 & 記録アプリ</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-gray-800">{currentDate}</p>
              <p className="text-sm text-gray-500">{currentTime}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左カラム: チャット */}
          <div className="lg:col-span-2 h-[calc(100vh-200px)] min-h-[500px]">
            <ChatPanel />
          </div>

          {/* 右カラム: 記録・目標 */}
          <div className="space-y-6">
            <GoalPanel
              refreshTrigger={refreshTrigger}
              onGoalSet={handleRecordAdded}
            />
            <RecordForm onRecordAdded={handleRecordAdded} />
            <RecordList refreshTrigger={refreshTrigger} />
          </div>
        </div>
      </main>

      <footer className="text-center py-4 text-sm text-gray-500">
        時間と記録を把握したAIアドバイザーがダイエットをサポートします
      </footer>
    </div>
  );
}
