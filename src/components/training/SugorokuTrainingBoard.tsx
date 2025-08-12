'use client';

import { useState, useEffect } from 'react';
import { TrainingCard, CardRarity } from '@/types/training-cards';
import { MANAGER_IMAGE_PATHS, MANAGER_TIPS } from '@/lib/manager-assets';
import { SQUARE_EFFECTS } from '@/lib/calendar-system';
import { CalendarDay } from '@/types/calendar';
import { Player } from '@/types/game';
import { PokemonAPI } from '@/lib/pokemon-api';

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
  allPlayers?: Player[];
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
  isLoading = false,
  allPlayers = []
}: SugorokuTrainingBoardProps) {
  const [selectedCard, setSelectedCard] = useState<TrainingCard | null>(null);
  const [showEventDetails, setShowEventDetails] = useState<SpecialEvent | null>(null);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [advancementProgress, setAdvancementProgress] = useState(0);
  const [currentAdvancingPosition, setCurrentAdvancingPosition] = useState(currentPosition);
  const [player1Image, setPlayer1Image] = useState<string>('/pokemon-fallback.svg');
  const [player2Image, setPlayer2Image] = useState<string>('/pokemon-fallback.svg');
  const [ballPosition, setBallPosition] = useState({ x: 50, y: 50 });
  const [ballDirection, setBallDirection] = useState<'left' | 'right'>('right');
  const [managerImage, setManagerImage] = useState<string>('');
  const [managerTip, setManagerTip] = useState<string>('');
  
  // 手札の状態管理
  const [handCards, setHandCards] = useState<TrainingCard[]>([]);
  const [discardedCards, setDiscardedCards] = useState<TrainingCard[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [uniqueAvailableCards, setUniqueAvailableCards] = useState<TrainingCard[]>([]);

  // availableCardsの重複を除去して管理用の配列を作成
  useEffect(() => {
    if (availableCards.length > 0) {
      // 重複チェック：同じIDのカードを除去（データ整合性のため）
      const uniqueCards = availableCards.filter((card, index, self) => 
        index === self.findIndex(c => c.id === card.id)
      );
      
      if (uniqueCards.length !== availableCards.length) {
        console.warn('重複IDカードを検出:', {
          original: availableCards.length,
          unique: uniqueCards.length,
          duplicates: availableCards.length - uniqueCards.length
        });
      }
      
      setUniqueAvailableCards(uniqueCards);
    }
  }, [availableCards]);

  // 手札の初期化（1回だけ実行）
  useEffect(() => {
    if (!isInitialized && uniqueAvailableCards.length > 0) {
      // 初期手札を配る（5枚まで）
      const initialHand = uniqueAvailableCards.slice(0, 5);
      setHandCards(initialHand);
      setIsInitialized(true);
      console.log('=== 手札初期化完了 ===', { 
        availableCount: uniqueAvailableCards.length,
        initialHandCount: initialHand.length,
        cardCount: initialHand.length 
      });
    }
  }, [uniqueAvailableCards, isInitialized]);

  // availableCardsの変更を監視（デバッグ用）
  useEffect(() => {
    if (isInitialized) {
      console.log('=== availableCards変更検知 ===', { 
        newCount: availableCards.length, 
        handCardsCount: handCards.length,
        isInitialized 
      });
    }
  }, [availableCards, isInitialized, handCards.length]);

  // カードを補充する関数
  const replenishCard = () => {
    if (uniqueAvailableCards.length > 0) {
      const targetHandSize = 5;
      const currentHandSize = handCards.length;
      
      console.log('=== 補充処理開始 ===', { 
        currentHandSize, 
        targetHandSize,
        availableCardsCount: uniqueAvailableCards.length,
        handCardIds: handCards.map(c => c.id)
      });
      
      // 手札に存在しないカードのみを対象とする
      const availableForHand = uniqueAvailableCards.filter(card => 
        !handCards.some(handCard => handCard.id === card.id)
      );
      
      console.log('=== 補充可能カード ===', {
        availableForHandCount: availableForHand.length,
        availableForHandIds: availableForHand.map(c => c.id)
      });
      
      if (availableForHand.length === 0) {
        // 手札に追加できるカードがない場合の処理
        console.warn('手札に追加できるカードがありません。手札管理を最適化します。');
        
        // 現在の手札から1枚をランダムに削除して、新しいカードを追加
        if (handCards.length > 0) {
          const randomRemoveIndex = Math.floor(Math.random() * handCards.length);
          const removedCard = handCards[randomRemoveIndex];
          
          // 削除したカードを除いた手札を作成
          const filteredHand = handCards.filter((_, index) => index !== randomRemoveIndex);
          
          // 削除したカードを除いて、新しいカードを選択
          const newAvailableCards = uniqueAvailableCards.filter(card => 
            card.id !== removedCard.id && !filteredHand.some(handCard => handCard.id === card.id)
          );
          
          if (newAvailableCards.length > 0) {
            const randomNewIndex = Math.floor(Math.random() * newAvailableCards.length);
            const newCard = newAvailableCards[randomNewIndex];
            
            const updatedHand = [...filteredHand, newCard];
            setHandCards(updatedHand);
            
            console.log('=== 手札最適化完了 ===', { 
              removedCard: removedCard.name,
              addedCard: newCard.name,
              finalHandCount: updatedHand.length
            });
          } else {
            // それでも新しいカードがない場合は、手札を維持
            console.log('手札の最適化ができませんでした。現在の手札を維持します。');
          }
        }
        return;
      }
      
      // 毎回1枚補充（手札の枚数に関係なく）
      const randomIndex = Math.floor(Math.random() * availableForHand.length);
      const newCard = availableForHand[randomIndex];
      
      // 新しいカードを手札に追加
      setHandCards(prev => {
        const updated = [...prev, newCard];
        console.log('=== カード補充完了 ===', { 
          cardName: newCard.name,
          cardId: newCard.id,
          handCardsCount: prev.length,
          totalHandCards: updated.length,
          targetSize: targetHandSize
        });
        return updated;
      });
    }
  };

  // 手札が空になったら補充（バックアップ用）
  useEffect(() => {
    if (handCards.length === 0 && uniqueAvailableCards.length > 0) {
      // 初期手札を配る（5枚まで）
      const initialHand = uniqueAvailableCards.slice(0, 5);
      setHandCards(initialHand);
      setDiscardedCards([]);
      console.log('=== 手札空補充（バックアップ） ===', { 
        availableCount: uniqueAvailableCards.length,
        initialHandCount: initialHand.length,
        cardCount: initialHand.length
      });
    }
  }, [handCards.length, uniqueAvailableCards]);

  // ポケモン画像の取得
  useEffect(() => {
    const loadPokemonImages = async () => {
      if (allPlayers.length >= 2) {
        try {
          const [pokemon1, pokemon2] = await Promise.all([
            PokemonAPI.getPokemonDetails(allPlayers[0].pokemon_name),
            PokemonAPI.getPokemonDetails(allPlayers[1].pokemon_name)
          ]);
          setPlayer1Image(PokemonAPI.getBestImageUrl(pokemon1.sprites, true));
          setPlayer2Image(PokemonAPI.getBestImageUrl(pokemon2.sprites, true));
        } catch (error) {
          console.error('Failed to load Pokemon images:', error);
        }
      }
    };
    loadPokemonImages();
  }, [allPlayers]);

  // currentPositionが変更された際の内部状態更新
  useEffect(() => {
    setCurrentAdvancingPosition(currentPosition);
  }, [currentPosition]);

  // マネージャー画像とtipsの初期化（1回だけ実行）
  useEffect(() => {
    if (!managerImage || !managerTip) {
      const randomImage = MANAGER_IMAGE_PATHS[Math.floor(Math.random() * MANAGER_IMAGE_PATHS.length)];
      const randomTip = MANAGER_TIPS[Math.floor(Math.random() * MANAGER_TIPS.length)];
      setManagerImage(randomImage);
      setManagerTip(randomTip);
    }
  }, [managerImage, managerTip]);

  // テニスボール打ち合いアニメーション
  useEffect(() => {
    const interval = setInterval(() => {
      setBallPosition(prev => {
        const newDirection = prev.x <= 20 ? 'right' : prev.x >= 80 ? 'left' : prev.x <= 20 || prev.x >= 80 ? ballDirection : ballDirection;
        
        const speed = 2;
        const newX = newDirection === 'right' ? prev.x + speed : prev.x - speed;
        const newY = 30 + Math.sin((newX / 10) * Math.PI) * 15; // 弧を描くような動き
        
        return { x: Math.max(20, Math.min(80, newX)), y: newY };
      });
    }, 100);

    return () => clearInterval(interval);
  }, []); // ballDirectionを依存配列から削除

  // カード使用処理（アニメーション付き）
  const handleCardUse = async (cardId: string) => {
    if (!selectedCard || isLoading) return;
    
    console.log('=== カード使用開始 ===', { 
      cardId, 
      cardName: selectedCard.name, 
      handCardsBefore: handCards.length,
      selectedCard 
    });
    
    setIsAdvancing(true);
    setAdvancementProgress(0);
    
    // 使用したカードを手札から削除
    setHandCards(prev => {
      const filtered = prev.filter(card => card.id !== cardId);
      console.log('=== カード削除完了 ===', { 
        removedCard: selectedCard.name, 
        previousCount: prev.length, 
        newCount: filtered.length 
      });
      return filtered;
    });
    
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
    console.log('=== カード使用処理実行 ===', { cardId });
    
    try {
      // カード使用処理を実行
      onCardUse(cardId);
      
      // 状態をリセット（ただし位置は維持）
      setTimeout(() => {
        setIsAdvancing(false);
        setAdvancementProgress(0);
        // currentAdvancingPositionは現在の位置を維持（リセットしない）
        setSelectedCard(null);
        
        // カードを使用したら補充（少し遅延を入れて確実に実行）
        console.log('=== カード補充開始 ===');
        setTimeout(() => {
          replenishCard();
        }, 100);
      }, 500);
      
    } catch (error) {
      console.error('カード使用処理でエラーが発生しました:', error);
      
      // エラー時も状態をリセット
      setTimeout(() => {
        setIsAdvancing(false);
        setAdvancementProgress(0);
        setSelectedCard(null);
        
        // エラー時も補充を試行
        console.log('=== エラー後のカード補充試行 ===');
        setTimeout(() => {
          replenishCard();
        }, 100);
      }, 500);
    }
  };

  // カレンダー表示用の日数取得（peekDays相当）
  const getCalendarDays = () => {
    const days: Array<{ day: number; type: string; event?: any }> = [];
    const basePosition = isAdvancing ? currentAdvancingPosition : currentPosition;
    
    // 現在位置から14マス先まで表示
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

  // マス目の色を決定（仕様書通りの5色システム）
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

  // マス目の種類を決定（仕様書通りの効果ベース）
  const getSquareType = (day: number): string => {
    // 仕様書通りのマス目配置ロジック
    const cycle = 24; // 1周24マス
    const position = day % cycle;
    
    // 青マス（良いイベント）: 4, 8, 12, 16, 20
    if ([4, 8, 12, 16, 20].includes(position)) return 'blue';
    
    // 赤マス（悪いイベント）: 2, 6, 10, 14, 18, 22
    if ([2, 6, 10, 14, 18, 22].includes(position)) return 'red';
    
    // 緑マス（体力回復）: 1, 7, 13, 19
    if ([1, 7, 13, 19].includes(position)) return 'green';
    
    // 黄マス（練習効率）: 3, 9, 15, 21
    if ([3, 9, 15, 21].includes(position)) return 'yellow';
    
    // 白マス（ランダムイベント）: 0, 5, 11, 17, 23
    return 'white';
  };

  // 確定的な疑似乱数生成（同じ入力に対して同じ結果を返す）
  const deterministicRandom = (seed: number): number => {
    // シンプルな線形合同法
    const a = 1664525;
    const c = 1013904223;
    const m = Math.pow(2, 32);
    
    // シードを32ビット整数に変換
    let x = (seed * a + c) % m;
    x = (x * a + c) % m; // もう一度適用してより良い分布に
    
    return x / m; // 0-1の範囲に正規化
  };

  // 特別イベントを決定（仕様書通りの季節イベント）
  const getSpecialEvent = (day: number) => {
    const cycle = 24;
    const position = day % cycle;
    
    // 季節イベント（固定位置）
    if (position === 0) return { type: 'bonus', name: '週末ボーナス' };
    if (position === 8) return { type: 'evolution', name: '進化チャンス' };
    if (position === 16) return { type: 'shop', name: 'ショップ' };
    if (position === 12) return { type: 'challenge', name: '強化試合' };
    
    // 隠しイベント（確定的）
    const seed = day * 1000 + position;
    const random = deterministicRandom(seed);
    if (random < 0.1) {
      const events = [
        { type: 'bonus', name: 'ラッキーイベント' },
        { type: 'evolution', name: '隠し進化' },
        { type: 'shop', name: '隠しショップ' }
      ];
      const eventIndex = Math.floor(random * 10) % events.length; // 確定的な選択
      return events[eventIndex];
    }
    
    return null;
  };

  // マス目の説明を取得
  const getSquareDescription = (type: string) => {
    switch (type) {
      case 'blue':
        return '良い練習をすることで、スキルや体力が向上します。';
      case 'red':
        return '悪い練習をすることで、スキルや体力が低下します。';
      case 'green':
        return '体力が回復し、疲労が解消されます。';
      case 'yellow':
        return '練習効率が向上し、より多くのスキルを獲得できます。';
      case 'white':
        return 'ランダムなイベントが発生します。';
      default:
        return '通常の日です。';
    }
  };

  const calendarDays = getCalendarDays();

  return (
    <div className="space-y-6">
      {/* カレンダートラック */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-600/50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white flex items-center">
            🎲 練習すごろく ({handCards.length}枚)
          </h2>
          <div className="text-slate-300">
            現在: {isAdvancing ? currentAdvancingPosition : currentPosition}日目
            <span className="ml-2 text-xs text-slate-400">
              (マス目: {getSquareType(isAdvancing ? currentAdvancingPosition : currentPosition)})
            </span>
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
            
            // マス目の説明を取得
            const squareDescription = getSquareDescription(dayInfo.type);
            
            return (
              <div
                key={`${dayInfo.day}-${index}`}
                className={`relative w-14 h-14 min-w-14 rounded-md border-2 flex items-center justify-center text-sm font-bold transition-all duration-300 ${baseClass} ${animationClass} ${completedClass}
                ${isCurrent ? 'ring-2 ring-yellow-300 shadow-yellow-500/40 shadow-lg' : ''}
                ${isNext ? 'ring-2 ring-purple-300 shadow-purple-500/40 shadow-lg' : ''}`}
                title={`Day ${dayInfo.day} - ${squareDescription}`}
                onClick={() => dayInfo.event && setShowEventDetails(dayInfo.event)}
              >
                <span className={`text-white drop-shadow`}>{dayInfo.day}</span>
                {dayInfo.event && (
                  <div className="absolute -top-2 -right-2 text-base">
                    {dayInfo.event.type === 'shop' ? '🏪' : 
                     dayInfo.event.type === 'bonus' ? '🎾' : 
                     dayInfo.event.type === 'evolution' ? '✨' : 
                     dayInfo.event.type === 'challenge' ? '⚔️' : '🎲'}
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

        {/* マス目説明 */}
        <div className="mt-3 flex justify-center gap-4 text-xs text-slate-300">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span>青: 良練習</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>赤: 悪練習</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>緑: 回復</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span>黄: 効率</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-gray-400 rounded"></div>
            <span>白: ランダム</span>
          </div>
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
        <div className="flex-1 bg-[url('/window.svg')] bg-cover bg-center rounded-2xl border border-slate-600/50 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/20 to-slate-900/40" />
          {/* コート線の簡易表現 */}
          <div className="absolute inset-6 border-2 border-white/30 rounded-xl" />
          {/* 左側プレイヤー（ポケモン画像） */}
          <div className="absolute left-8 bottom-8 w-16 h-16 rounded-full overflow-hidden ring-2 ring-yellow-400/60 shadow-xl bg-white/20 transition-all duration-300 hover:scale-110">
            <img 
              src={player1Image} 
              alt={allPlayers[0]?.pokemon_name || 'Player 1'} 
              className="w-full h-full object-contain bg-gradient-to-br from-blue-100 to-blue-200"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/pokemon-fallback.svg';
              }}
            />
          </div>
          
          {/* 右側プレイヤー（ポケモン画像） */}
          <div className="absolute right-8 bottom-8 w-16 h-16 rounded-full overflow-hidden ring-2 ring-red-400/60 shadow-xl bg-white/20 transition-all duration-300 hover:scale-110">
            <img 
              src={player2Image} 
              alt={allPlayers[1]?.pokemon_name || 'Player 2'} 
              className="w-full h-full object-contain bg-gradient-to-br from-red-100 to-red-200 scale-x-[-1]"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/pokemon-fallback.svg';
              }}
            />
          </div>
          
          {/* テニスボール（打ち合いアニメーション） */}
          <div 
            className="absolute w-6 h-6 transition-all duration-200 ease-linear"
            style={{
              left: `${ballPosition.x}%`,
              top: `${ballPosition.y}%`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div className="w-full h-full bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full shadow-lg relative">
              {/* テニスボールの線 */}
              <div className="absolute inset-0 rounded-full border-2 border-white/50"></div>
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/60 transform -translate-y-1/2"></div>
            </div>
            {/* ボールの軌跡エフェクト */}
            <div className="absolute inset-0 rounded-full bg-yellow-400/20 animate-ping"></div>
          </div>
          
          {/* プレイヤー名表示 */}
          <div className="absolute left-8 bottom-2 text-xs text-white/80 font-medium bg-black/40 px-2 py-1 rounded">
            {allPlayers[0]?.pokemon_name || 'Player 1'}
          </div>
          <div className="absolute right-8 bottom-2 text-xs text-white/80 font-medium bg-black/40 px-2 py-1 rounded">
            {allPlayers[1]?.pokemon_name || 'Player 2'}
          </div>
        </div>

        {/* 右：マネージャーパネル */}
        <div className="w-80 bg-slate-800/50 rounded-2xl border border-slate-600/50 p-6">
          <div className="text-center">
            {/* マネージャー画像 */}
            <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden ring-4 ring-slate-500/50">
              <img 
                src={managerImage} 
                alt="Manager" 
                className="w-full h-full object-cover"
              />
            </div>
            {/* 一言tips */}
            <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600/30">
              <p className="text-slate-300 text-sm italic">
                &ldquo;{managerTip}&rdquo;
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
          {handCards.map((card) => {
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