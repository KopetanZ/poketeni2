'use client';

import { useState, useEffect } from 'react';
import { CardRarity } from '@/types/training-cards';
import { MANAGER_IMAGE_PATHS, MANAGER_TIPS } from '@/lib/manager-assets';
import { SQUARE_EFFECTS } from '@/lib/calendar-system';
import { CalendarDay } from '@/types/calendar';

interface BoardCard {
  id: string;
  name: string;
  number: number;
  rarity: CardRarity;
  description: string;
  trainingEffects: Record<string, number>;
}

interface SugorokuTrainingBoardProps {
  currentPosition: number;
  availableCards: TrainingCard[];
  onCardUse: (cardId: string) => void;
  isLoading?: boolean;
}

interface SpecialEvent {
  id: string;
  name: string;
  description: string;
  position: number;
  type: 'bonus' | 'challenge' | 'shop' | 'evolution';
  reward?: {
    skill_boosts?: Record<string, number>;
    items?: string[];
    experience?: number;
  };
}

export default function SugorokuTrainingBoard({
  currentPosition,
  availableCards,
  onCardUse,
  isLoading = false
}: SugorokuTrainingBoardProps) {
  const [selectedCard, setSelectedCard] = useState<TrainingCard | null>(null);
  const [showEventDetails, setShowEventDetails] = useState<SpecialEvent | null>(null);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [advancementProgress, setAdvancementProgress] = useState(0);
  const [currentAdvancingPosition, setCurrentAdvancingPosition] = useState(currentPosition);

  // カード使用処理（アニメーション付き）
  const handleCardUse = async (cardId: string) => {
    if (!selectedCard || isLoading) return;
    
    setIsAdvancing(true);
    setAdvancementProgress(0);
    
    // カードの数字分だけ1マスずつ進むアニメーション
    const totalSteps = selectedCard.number;
    
    for (let step = 1; step <= totalSteps; step++) {
      // 現在進行中の位置を更新
      setCurrentAdvancingPosition(currentPosition + step);
      setAdvancementProgress(step);
      
      // 各ステップで少し待機（アニメーション効果）
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    // アニメーション完了後、実際のカード使用処理を実行
    onCardUse(cardId);
    
    // 状態をリセット
    setTimeout(() => {
      setIsAdvancing(false);
      setAdvancementProgress(0);
      setCurrentAdvancingPosition(currentPosition);
      setSelectedCard(null);
    }, 500);
  };

  // カレンダー表示用の日数取得（peekDays相当）
  const getCalendarDays = () => {
    const days: Array<{ day: number; type: string; event?: any }> = [];
    const basePosition = isAdvancing ? currentAdvancingPosition : currentPosition;
    
    for (let i = 0; i < 14; i++) {
      const dayNumber = basePosition + i;
      const squareType = getSquareType(dayNumber);
      const event = getSpecialEvent(dayNumber);
      
      days.push({
        day: dayNumber,
        type: squareType,
        event
      });
    }
    
    return days;
  };

  // マス目の色を決定
  const getSquareStyle = (type: string) => {
    const squareStyle = {
      'blue': 'from-blue-500 to-blue-600 border-blue-400',
      'red': 'from-red-500 to-red-600 border-red-400',
      'white': 'from-gray-300 to-gray-400 border-gray-200',
      'green': 'from-green-500 to-green-600 border-green-400',
      'yellow': 'from-yellow-500 to-yellow-600 border-yellow-400'
    } as const;
    
    return squareStyle[type as keyof typeof squareStyle] || 'from-slate-600 to-slate-700 border-slate-500';
  };

  // マス目の種類を決定（簡易版）
  const getSquareType = (day: number): string => {
    const types = ['blue', 'red', 'white', 'green', 'yellow'];
    return types[day % types.length];
  };

  // 特別イベントを決定（簡易版）
  const getSpecialEvent = (day: number) => {
    if (day % 7 === 0) return { type: 'bonus', name: '週末ボーナス' };
    if (day % 10 === 0) return { type: 'evolution', name: '進化チャンス' };
    if (day % 15 === 0) return { type: 'shop', name: 'ショップ' };
    return null;
  };

  const calendarDays = getCalendarDays();

  return (
    <div className="space-y-6">
      {/* カレンダートラック */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-600/50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white flex items-center">
            🎲 練習すごろく ({availableCards.length}枚)
          </h2>
          <div className="text-slate-300">
            現在: {isAdvancing ? currentAdvancingPosition : currentPosition}日目
          </div>
        </div>

        {/* カレンダーマス目 */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {calendarDays.map((dayInfo, index) => {
            const isCurrent = dayInfo.day === (isAdvancing ? currentAdvancingPosition : currentPosition);
            const isNext = dayInfo.day === (isAdvancing ? currentAdvancingPosition : currentPosition) + 1;
            const isAdvancingTo = isAdvancing && dayInfo.day === currentAdvancingPosition;
            const isCompleted = isAdvancing && dayInfo.day < currentAdvancingPosition;
            
            const baseClass = `bg-gradient-to-br ${getSquareStyle(dayInfo.type)}`;
            const animationClass = isAdvancingTo ? 'animate-pulse ring-4 ring-yellow-300 shadow-yellow-500/50 shadow-xl scale-110' : '';
            const completedClass = isCompleted ? 'ring-2 ring-green-300 shadow-green-500/30' : '';
            
            return (
              <div
                key={`${dayInfo.day}-${index}`}
                className={`relative w-14 h-14 min-w-14 rounded-md border-2 flex items-center justify-center text-sm font-bold transition-all duration-300 ${baseClass} ${animationClass} ${completedClass}
                ${isCurrent ? 'ring-2 ring-yellow-300 shadow-yellow-500/40 shadow-lg' : ''}
                ${isNext ? 'ring-2 ring-purple-300 shadow-purple-500/40 shadow-lg' : ''}`}
                title={dayInfo.event ? dayInfo.event.name : `Day ${dayInfo.day}`}
              >
                <span className={`text-white drop-shadow`}>{dayInfo.day}</span>
                {dayInfo.event && (
                  <div className="absolute -top-2 -right-2 text-base">
                    {dayInfo.event.type === 'shop' ? '🏪' : 
                     dayInfo.event.type === 'bonus' ? '🎾' : 
                     dayInfo.event.type === 'evolution' ? '✨' : '⚔️'}
                  </div>
                )}
                {/* 進行中のマーカー */}
                {isAdvancingTo && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                    <div className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 進行状況表示 */}
        {isAdvancing && (
          <div className="mt-3 text-center">
            <div className="bg-yellow-600/20 border border-yellow-400/30 rounded-lg px-3 py-2 inline-block text-yellow-300 text-sm">
              🚀 {selectedCard?.name}で{advancementProgress}/{selectedCard?.number}マス進行中...
            </div>
          </div>
        )}

        {selectedCard && !isAdvancing && (
          <div className="mt-3 text-center">
            <div className="bg-blue-600/20 border border-blue-400/30 rounded-lg px-3 py-2 inline-block text-blue-300 text-sm">
              📍 {selectedCard.name}使用で {selectedCard.number}マス進みます
            </div>
          </div>
        )}
      </div>

      {/* 中段：左に練習コートの簡易アニメ、右にマネージャー */}
      <div className="flex gap-4">
        {/* 左：テニスコート背景にラリー風アニメ（プレースホルダ画像と部員アイコン） */}
        <div className="flex-1 bg-[url('/img/window.svg')] bg-cover bg-center rounded-2xl border border-slate-600/50 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/20 to-slate-900/40" />
          {/* コート線の簡易表現 */}
          <div className="absolute inset-6 border-2 border-white/30 rounded-xl" />
          {/* 部員（簡易）：左右にアバター（丸+画像） */}
          <div className="absolute left-8 bottom-8 w-14 h-14 rounded-full overflow-hidden ring-2 ring-white/60 shadow-xl bg-white/20">
            <img src="/img/mgr/ChatGPT Image 202587 12_34_08.png" alt="player-left" className="w-full h-full object-cover" />
          </div>
          <div className="absolute right-8 bottom-8 w-14 h-14 rounded-full overflow-hidden ring-2 ring-white/60 shadow-xl bg-white/20">
            <img src="/img/mgr/ChatGPT Image 202587 12_34_08.png" alt="player-right" className="w-full h-full object-cover" />
          </div>
          {/* ボール（バウンドアニメ） */}
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-4 h-4 bg-yellow-400 rounded-full shadow-lg animate-bounce"></div>
          </div>
        </div>

        {/* 右：マネージャーパネル */}
        <div className="w-80 bg-slate-800/50 rounded-2xl border border-slate-600/50 p-6">
          <div className="text-center">
            {/* マネージャー画像 */}
            <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden ring-4 ring-slate-500/50">
              <img 
                src={MANAGER_IMAGE_PATHS[Math.floor(Math.random() * MANAGER_IMAGE_PATHS.length)]} 
                alt="Manager" 
                className="w-full h-full object-cover"
              />
            </div>
            {/* 一言tips */}
            <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600/30">
              <p className="text-slate-300 text-sm italic">
                "{MANAGER_TIPS[Math.floor(Math.random() * MANAGER_TIPS.length)]}"
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 手札エリア */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-600/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">練習を選択</h3>
          <button
            onClick={() => selectedCard && handleCardUse(selectedCard.id)}
            disabled={!selectedCard || isLoading || isAdvancing}
            className={`${!selectedCard || isLoading || isAdvancing ? 'bg-slate-600/50 text-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white shadow-lg hover:scale-105'}
              px-4 py-2 rounded-lg font-bold transition-all`}
          >
            {isAdvancing ? '進行中...' : isLoading ? '進行中...' : selectedCard ? `${selectedCard.name} を実行` : 'カードを選択' }
          </button>
        </div>

        {/* カード一覧 */}
        <div className="flex gap-4 overflow-x-auto pb-2">
          {availableCards.map((card) => {
            const isSelected = selectedCard?.id === card.id;
            const rarityColors = {
              common: 'from-gray-400 to-gray-500',
              uncommon: 'from-green-400 to-green-500',
              rare: 'from-blue-400 to-blue-500',
              epic: 'from-purple-400 to-purple-500',
              legendary: 'from-yellow-400 to-yellow-500'
            };

            return (
              <div
                key={card.id}
                onClick={() => setSelectedCard(card)}
                className={`relative cursor-pointer transition-all duration-200 hover:scale-105 ${
                  isSelected ? 'scale-105 ring-2 ring-yellow-300 shadow-yellow-500/30' : 'hover:ring-2 hover:ring-slate-400'
                }`}
              >
                <div className={`w-48 h-64 rounded-lg border-2 overflow-hidden bg-gradient-to-br ${rarityColors[card.rarity] || 'from-gray-400 to-gray-500'}`}>
                  <div className="p-4 text-white">
                    <div className="text-center mb-3">
                      <div className="text-2xl mb-2">{card.icon}</div>
                      <h4 className="font-bold text-sm mb-1">{card.name}</h4>
                      <div className="text-xs opacity-80">{card.rarity.toUpperCase()}</div>
                    </div>
                    
                    <div className="text-xs mb-3">
                      <div className="mb-2">
                        <span className="opacity-80">期間:</span> {card.number}日
                      </div>
                      <p className="opacity-90 line-clamp-3">{card.description}</p>
                    </div>

                    {/* スキル効果 */}
                    {card.baseEffects.skillGrowth && (
                      <div className="text-xs space-y-1">
                        {Object.entries(card.baseEffects.skillGrowth).map(([skill, value]) => (
                          <div key={skill} className="flex justify-between">
                            <span className="opacity-80">{skill}:</span>
                            <span className="text-yellow-300">+{value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* 選択状態表示 */}
                {isSelected && (
                  <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold">
                    選択中
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* イベント詳細モーダル */}
      {showEventDetails && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4 border border-slate-600">
            <h3 className="text-xl font-bold text-white mb-4">{showEventDetails.name}</h3>
            <p className="text-slate-300 mb-4">{showEventDetails.description}</p>
            <button
              onClick={() => setShowEventDetails(null)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
            >
              閉じる
            </button>
          </div>
        </div>
      )}
    </div>
  );
}