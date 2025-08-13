'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
  type: 'bonus' | 'challenge' | 'shop' | 'evolution' | 'seasonal' | 'hidden' | 'training' | 'branch';
  reward?: {
    skill_boosts?: Record<string, number>;
    items?: string[];
    experience?: number;
    funds?: number;
    reputation?: number;
    condition_boost?: number;
    motivation_boost?: number;
  };
  choices?: Array<{
    id: string;
    name: string;
    description: string;
    effects: Record<string, number>;
    risk: 'low' | 'medium' | 'high';
  }>;
  seasonalType?: 'spring' | 'summer' | 'autumn' | 'winter';
  isHidden?: boolean;
}

// 定数
const HAND_SIZE = 5;
const ANIMATION_DELAY = 300;
const RESET_DELAY = 500;
const REPLENISH_DELAY = 100;
const BALL_ANIMATION_INTERVAL = 100;
const BALL_SPEED = 2;
const BALL_BOUNDS = { min: 20, max: 80 };
const CYCLE_LENGTH = 24;
const CALENDAR_DISPLAY_DAYS = 14;

export default function SugorokuTrainingBoard({
  currentPosition,
  availableCards,
  onCardUse,
  isLoading = false,
  allPlayers = []
}: SugorokuTrainingBoardProps) {
  // 状態管理
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
  
  // タイマー管理用のref
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const resetTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const replenishTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 重複除去されたカード配列（メモ化）
  const uniqueAvailableCards = useMemo(() => {
    if (availableCards.length === 0) return [];
    
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
    
    return uniqueCards;
  }, [availableCards]);

  // 手札の初期化（1回だけ実行）
  useEffect(() => {
    if (!isInitialized && uniqueAvailableCards.length > 0) {
      const initialHand = uniqueAvailableCards.slice(0, HAND_SIZE);
      setHandCards(initialHand);
      setIsInitialized(true);
      console.log('=== 手札初期化完了 ===', { 
        availableCount: uniqueAvailableCards.length,
        initialHandCount: initialHand.length
      });
    }
  }, [uniqueAvailableCards, isInitialized]);

  // 手札が空になったら補充（バックアップ用）
  useEffect(() => {
    if (handCards.length === 0 && uniqueAvailableCards.length > 0) {
      const initialHand = uniqueAvailableCards.slice(0, HAND_SIZE);
      setHandCards(initialHand);
      setDiscardedCards([]);
      console.log('=== 手札空補充（バックアップ） ===', { 
        availableCount: uniqueAvailableCards.length,
        initialHandCount: initialHand.length
      });
    }
  }, [handCards.length, uniqueAvailableCards]);

  // 手札が5枚未満になったら自動補充
  useEffect(() => {
    if (handCards.length < HAND_SIZE && uniqueAvailableCards.length > 0 && isInitialized) {
      const cardsToAdd = HAND_SIZE - handCards.length;
      
      // 手札に存在しないカードのみを対象とする
      const availableForHand = uniqueAvailableCards.filter(card => 
        !handCards.some(handCard => handCard.id === card.id)
      );
      
      if (availableForHand.length > 0) {
        const selectedCards: TrainingCard[] = [];
        const tempAvailable = [...availableForHand];
        
        for (let i = 0; i < Math.min(cardsToAdd, tempAvailable.length); i++) {
          const randomIndex = Math.floor(Math.random() * tempAvailable.length);
          const selectedCard = tempAvailable.splice(randomIndex, 1)[0];
          selectedCards.push(selectedCard);
        }
        
        setHandCards(prev => {
          const updated = [...prev, ...selectedCards];
          console.log('=== 自動補充完了 ===', { 
            addedCards: selectedCards.map(c => c.name),
            addedCount: selectedCards.length,
            handCardsCount: prev.length,
            totalHandCards: updated.length
          });
          return updated;
        });
      }
    }
  }, [handCards.length, uniqueAvailableCards, isInitialized]);

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

  // 季節イベントの詳細データ（仕様書通り）
  const seasonalEvents = useMemo(() => ({
    spring: [
      { day: 15, name: '新入部員歓迎会', effect: '新部員のやる気+20', type: 'motivation_boost', value: 20 },
      { day: 20, name: '中間テスト期間', effect: '練習効率-20%, 3ターン', type: 'efficiency_penalty', value: -20, duration: 3 },
      { day: 10, name: 'インターハイ予選', effect: '勝利で評判+5、資金+5,000円', type: 'tournament', value: { reputation: 5, funds: 5000 } }
    ],
    summer: [
      { day: 15, name: '夏休み開始', effect: '練習効率+30%, 2週間', type: 'efficiency_boost', value: 30, duration: 14 },
      { day: 10, name: '技術指導会', effect: '赤特殊能力除去チャンス', type: 'ability_removal', value: 'red_abilities' },
      { day: 20, name: '特別強化合宿', effect: '特殊能力習得確率2倍', type: 'ability_chance_boost', value: 2.0 }
    ],
    autumn: [
      { day: 15, name: '文化祭', effect: '資金+3,000円、評判+2', type: 'funds_reputation', value: { funds: 3000, reputation: 2 } },
      { day: 20, name: '期末テスト', effect: '練習効率-25%, 2ターン', type: 'efficiency_penalty', value: -25, duration: 2 },
      { day: 24, name: 'クリスマス', effect: 'ランダム好イベント確定', type: 'guaranteed_bonus', value: 'random_positive' }
    ],
    winter: [
      { day: 10, name: '新年初練習', effect: 'やる気+15、全員', type: 'motivation_boost', value: 15, target: 'all' },
      { day: 14, name: 'バレンタイン', effect: '女子部員からの差し入れで回復', type: 'recovery', value: 'valentine_gift' },
      { day: 15, name: '卒業式', effect: '3年生部員の引退処理', type: 'graduation', value: 'third_year_retirement' }
    ]
  }), []);

  // テニスボール打ち合いアニメーション（修正版）
  useEffect(() => {
    const interval = setInterval(() => {
      setBallPosition(prev => {
        let newDirection = prev.x <= BALL_BOUNDS.min ? 'right' : 
                         prev.x >= BALL_BOUNDS.max ? 'left' : 
                         ballDirection;
        
        const newX = newDirection === 'right' ? prev.x + BALL_SPEED : prev.x - BALL_SPEED;
        const newY = 30 + Math.sin((newX / 10) * Math.PI) * 15;
        
        // 方向を更新
        setBallDirection(newDirection);
        
        return { 
          x: Math.max(BALL_BOUNDS.min, Math.min(BALL_BOUNDS.max, newX)), 
          y: newY 
        };
      });
    }, BALL_ANIMATION_INTERVAL);

    return () => clearInterval(interval);
  }, [ballDirection]);

  // カードを補充する関数（最適化版）
  const replenishCard = useCallback(() => {
    if (uniqueAvailableCards.length === 0) return;
    
    const targetHandSize = HAND_SIZE;
    const currentHandSize = handCards.length;
    
    console.log('=== 補充処理開始 ===', { 
      currentHandSize, 
      targetHandSize,
      availableCardsCount: uniqueAvailableCards.length
    });
    
    // 手札が5枚未満の場合、5枚まで補充
    if (currentHandSize < targetHandSize) {
      const cardsToAdd = targetHandSize - currentHandSize;
      
      // 手札に存在しないカードのみを対象とする
      const availableForHand = uniqueAvailableCards.filter(card => 
        !handCards.some(handCard => handCard.id === card.id)
      );
      
      if (availableForHand.length === 0) {
        // 手札に追加できるカードがない場合の処理
        console.warn('手札に追加できるカードがありません。手札管理を最適化します。');
        
        if (handCards.length > 0) {
          const randomRemoveIndex = Math.floor(Math.random() * handCards.length);
          const removedCard = handCards[randomRemoveIndex];
          
          const filteredHand = handCards.filter((_, index) => index !== randomRemoveIndex);
          const newAvailableCards = uniqueAvailableCards.filter(card => 
            card.id !== removedCard.id && !filteredHand.some(handCard => handCard.id === card.id)
          );
          
          if (newAvailableCards.length > 0) {
            const randomNewIndex = Math.floor(Math.random() * newAvailableCards.length);
            const newCard = newAvailableCards[randomNewIndex];
            
            setHandCards([...filteredHand, newCard]);
            
            console.log('=== 手札最適化完了 ===', { 
              removedCard: removedCard.name,
              addedCard: newCard.name,
              finalHandCount: filteredHand.length + 1
            });
          }
        }
        return;
      }
      
      // 必要な枚数分のカードをランダムに選択
      const selectedCards: TrainingCard[] = [];
      const tempAvailable = [...availableForHand];
      
      for (let i = 0; i < Math.min(cardsToAdd, tempAvailable.length); i++) {
        const randomIndex = Math.floor(Math.random() * tempAvailable.length);
        const selectedCard = tempAvailable.splice(randomIndex, 1)[0];
        selectedCards.push(selectedCard);
      }
      
      setHandCards(prev => {
        const updated = [...prev, ...selectedCards];
        console.log('=== カード補充完了 ===', { 
          addedCards: selectedCards.map(c => c.name),
          addedCount: selectedCards.length,
          handCardsCount: prev.length,
          totalHandCards: updated.length
        });
        return updated;
      });
    }
  }, [uniqueAvailableCards, handCards]);

  // ルート選択処理
  const handleRouteChoice = useCallback((choice: any) => {
    console.log('ルート選択:', choice);
    // TODO: 選択したルートの効果を適用
    setShowEventDetails(null);
  }, []);

  // 特訓対象選択処理
  const handleTrainingChoice = useCallback((player: Player) => {
    console.log('特訓対象選択:', player.pokemon_name);
    // TODO: 選択した部員への特訓効果を適用
    setShowEventDetails(null);
  }, []);

  // イベント報酬受け取り処理
  const handleEventAction = useCallback((event: SpecialEvent) => {
    console.log('イベント報酬受け取り:', event);
    // TODO: 報酬の適用処理
    setShowEventDetails(null);
  }, []);

  // カード使用処理（アニメーション付き、最適化版）
  const handleCardUse = useCallback(async (cardId: string) => {
    if (!selectedCard || isLoading) return;
    
    console.log('=== カード使用開始 ===', { 
      cardId, 
      cardName: selectedCard.name, 
      handCardsBefore: handCards.length
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
      setCurrentAdvancingPosition(currentPosition + step);
      setAdvancementProgress(step);
      
      // 各ステップで少し待機（アニメーション効果）
      await new Promise(resolve => {
        animationTimeoutRef.current = setTimeout(resolve, ANIMATION_DELAY);
      });
    }
    
    // アニメーション完了後、実際のカード使用処理を実行
    console.log('=== カード使用処理実行 ===', { cardId });
    
    try {
      onCardUse(cardId);
      
      // 状態をリセット
      resetTimeoutRef.current = setTimeout(() => {
        setIsAdvancing(false);
        setAdvancementProgress(0);
        setSelectedCard(null);
        
        // カードを使用したら補充
        replenishTimeoutRef.current = setTimeout(() => {
          replenishCard();
        }, REPLENISH_DELAY);
      }, RESET_DELAY);
      
    } catch (error) {
      console.error('カード使用処理でエラーが発生しました:', error);
      
      // エラー時も状態をリセット
      resetTimeoutRef.current = setTimeout(() => {
        setIsAdvancing(false);
        setAdvancementProgress(0);
        setSelectedCard(null);
        
        // エラー時も補充を試行
        replenishTimeoutRef.current = setTimeout(() => {
          replenishCard();
        }, REPLENISH_DELAY);
      }, RESET_DELAY);
    }
  }, [selectedCard, isLoading, handCards, currentPosition, onCardUse, replenishCard]);

  // クリーンアップ処理
  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current);
      if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
      if (replenishTimeoutRef.current) clearTimeout(replenishTimeoutRef.current);
    };
  }, []);

  // マス目の種類を決定（通常の関数として定義）
  const getSquareType = (day: number): string => {
    const position = day % CYCLE_LENGTH;
    
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

  // 確定的な疑似乱数生成（通常の関数として定義）
  const deterministicRandom = (seed: number): number => {
    const a = 1664525;
    const c = 1013904223;
    const m = Math.pow(2, 32);
    
    let x = (seed * a + c) % m;
    x = (x * a + c) % m;
    
    return x / m;
  };

  // 特別イベントを決定（通常の関数として定義）
  const getSpecialEvent = (day: number) => {
    const position = day % CYCLE_LENGTH;
    
    // 季節イベント（固定位置・仕様書通り）
    if (position === 0) {
      return {
        id: `seasonal-${day}`,
        type: 'seasonal',
        name: '週末ボーナス',
        description: '週末の特別練習で、全員のやる気が向上します。',
        position: day,
        seasonalType: 'spring',
        reward: {
          motivation_boost: 15,
          condition_boost: 10,
          funds: 1000
        }
      };
    }
    
    if (position === 4) {
      return {
        id: `training-${day}`,
        type: 'training',
        name: '特訓マス',
        description: '3人の部員からランダム選択で特殊能力習得チャレンジ！',
        position: day,
        reward: {
          experience: 50,
          skill_boosts: { serve_skill: 5, return_skill: 5 }
        }
      };
    }
    
    if (position === 8) {
      return {
        id: `evolution-${day}`,
        type: 'evolution',
        name: '進化チャンス',
        description: 'ポケモンの進化が可能になります。',
        position: day,
        reward: {
          experience: 100,
          skill_boosts: { serve_skill: 10, return_skill: 10, volley_skill: 10, stroke_skill: 10 }
        }
      };
    }
    
    if (position === 12) {
      return {
        id: `challenge-${day}`,
        type: 'challenge',
        name: '強化試合',
        description: '強力な相手との練習試合で、経験値を大幅に獲得できます。',
        position: day,
        reward: {
          experience: 150,
          skill_boosts: { mental: 15, stamina: 10 }
        }
      };
    }
    
    if (position === 16) {
      return {
        id: `shop-${day}`,
        type: 'shop',
        name: 'ショップ',
        description: '特別なアイテムや装備を購入できます。',
        position: day,
        reward: {
          funds: 2000,
          items: ['ラケット強化', 'シューズ', '栄養ドリンク']
        }
      };
    }
    
    if (position === 20) {
      return {
        id: `branch-${day}`,
        type: 'branch',
        name: '分岐マス',
        description: '3つのルートから選択してください。',
        position: day,
        choices: [
          {
            id: 'safe-route',
            name: '安全ルート',
            description: '緑・青マス中心、低リスク・低報酬',
            effects: { funds: 1000, reputation: 1 },
            risk: 'low'
          },
          {
            id: 'risk-route',
            name: 'リスクルート',
            description: '赤マス多いが高報酬',
            effects: { funds: 5000, reputation: 3, experience: 100 },
            risk: 'high'
          },
          {
            id: 'balance-route',
            name: 'バランスルート',
            description: '中庸のリスクと報酬',
            effects: { funds: 2500, reputation: 2, experience: 50 },
            risk: 'medium'
          }
        ]
      };
    }
    
    // 隠しイベント（確定的・仕様書通り）
    const seed = day * 1000 + position;
    const random = deterministicRandom(seed);
    if (random < 0.1) {
      const hiddenEvents = [
        {
          id: `hidden-bonus-${day}`,
          type: 'hidden',
          name: 'ラッキーイベント',
          description: '隠しマス発見！ 全員の調子が大幅に向上します。',
          position: day,
          isHidden: true,
          reward: {
            condition_boost: 25,
            motivation_boost: 20,
            funds: 3000
          }
        },
        {
          id: `hidden-evolution-${day}`,
          type: 'hidden',
          name: '隠し進化',
          description: '隠しマス発見！ 進化の可能性が大幅に向上します。',
          position: day,
          isHidden: true,
          reward: {
            experience: 200,
            skill_boosts: { serve_skill: 15, return_skill: 15, volley_skill: 15, stroke_skill: 15 }
          }
        },
        {
          id: `hidden-shop-${day}`,
          type: 'hidden',
          name: '隠しショップ',
          description: '隠しマス発見！ レアアイテムが特別価格で購入できます。',
          position: day,
          isHidden: true,
          reward: {
            funds: 5000,
            items: ['伝説のラケット', '究極のシューズ', '神秘の栄養ドリンク']
          }
        }
      ];
      const eventIndex = Math.floor(random * 10) % hiddenEvents.length;
      return hiddenEvents[eventIndex];
    }
    
    return null;
  };

  // カレンダー表示用の日数取得（メモ化）
  const calendarDays = useMemo(() => {
    const days: Array<{ day: number; type: string; event?: any }> = [];
    const basePosition = isAdvancing ? currentAdvancingPosition : currentPosition;
    
    // 現在位置から14マス先まで表示
    for (let i = 0; i < CALENDAR_DISPLAY_DAYS; i++) {
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
  }, [isAdvancing, currentAdvancingPosition, currentPosition]);

  // マス目の色を決定（メモ化）
  const getSquareStyle = useCallback((type: string) => {
    const squareStyle = {
      'blue': 'from-blue-500 to-blue-600 border-blue-400',
      'red': 'from-red-500 to-red-600 border-red-400',
      'white': 'from-gray-300 to-gray-400 border-gray-200',
      'green': 'from-green-500 to-green-600 border-green-400',
      'yellow': 'from-yellow-500 to-yellow-600 border-yellow-400'
    } as const;
    
    return squareStyle[type as keyof typeof squareStyle] || 'from-slate-600 to-slate-700 border-slate-500';
  }, []);



  // マス目効果の詳細実装（仕様書通り）
  const getSquareEffects = useCallback((type: string) => {
    const effects = {
      'blue': {
        description: '良い練習をすることで、部員の調子向上(+10-20)、練習効率アップ(+15%)、資金獲得(+1,000-3,000円)、評判向上(+1-3ポイント)',
        skill_boosts: { serve_skill: 10, return_skill: 10, volley_skill: 10, stroke_skill: 10, mental: 15, stamina: 10 },
        funds: 2000,
        reputation: 2,
        condition_boost: 15
      },
      'red': {
        description: '悪い練習をすることで、部員の怪我・調子悪化(-15-25)、練習効率低下(-20%)、資金減少(-500-2,000円)、評判低下(-1-2ポイント)',
        skill_penalties: { serve_skill: -15, return_skill: -15, volley_skill: -15, stroke_skill: -15, mental: -20, stamina: -25 },
        funds: -1500,
        reputation: -1,
        condition_penalty: -20
      },
      'green': {
        description: '体力が回復し、疲労が解消されます。全部員のスタミナ完全回復、調子改善(+5-15)、やる気向上(+10-20)、怪我回復促進',
        stamina_recovery: 100,
        condition_boost: 10,
        motivation_boost: 15,
        injury_recovery: true
      },
      'yellow': {
        description: '練習効率が向上し、より多くのスキルを獲得できます。練習カードが乗った場合: 経験値1.5倍、そうでない場合: 白マスと同様、特殊能力習得確率+20%',
        experience_multiplier: 1.5,
        special_ability_chance: 0.2,
        skill_boosts: { serve_skill: 5, return_skill: 5, volley_skill: 5, stroke_skill: 5 }
      },
      'white': {
        description: 'ランダムなイベントが発生します。50%の確率で青または赤イベント、新部員加入チャンス(10%確率)、ランダムなアイテム獲得、転校生イベント(稀に発生)',
        random_event_chance: 0.5,
        new_member_chance: 0.1,
        transfer_student_chance: 0.02
      }
    };
    
    return effects[type as keyof typeof effects] || effects.white;
  }, []);

  // マス目の説明を取得（メモ化）
  const getSquareDescription = useCallback((type: string) => {
    const effects = getSquareEffects(type);
    return effects.description;
  }, [getSquareEffects]);

  // レアリティカラー（メモ化）
  const rarityColors = useMemo(() => ({
    common: 'from-gray-400 to-gray-500',
    uncommon: 'from-green-400 to-green-500',
    rare: 'from-blue-400 to-blue-500',
    epic: 'from-purple-400 to-purple-500',
    legendary: 'from-yellow-400 to-yellow-500'
  }), []);

  // 現在の位置情報（メモ化）
  const currentPositionInfo = useMemo(() => {
    const position = isAdvancing ? currentAdvancingPosition : currentPosition;
    const squareType = getSquareType(position);
    return { position, squareType };
  }, [isAdvancing, currentAdvancingPosition, currentPosition, getSquareType]);

  return (
    <div className="space-y-6">
      {/* カレンダートラック */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-600/50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white flex items-center">
            🎲 練習すごろく ({handCards.length}枚)
          </h2>
          <div className="text-slate-300">
            現在: {currentPositionInfo.position}日目
            <span className="ml-2 text-xs text-slate-400">
              (マス目: {currentPositionInfo.squareType})
            </span>
          </div>
        </div>

        {/* カレンダーマス目 */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {calendarDays.map((dayInfo, index) => {
            const isCurrent = dayInfo.day === currentPositionInfo.position;
            const isNext = dayInfo.day === currentPositionInfo.position + 1;
            const isAdvancingTo = isAdvancing && dayInfo.day === currentAdvancingPosition;
            const isCompleted = isAdvancing && dayInfo.day < currentAdvancingPosition;
            
            const baseClass = `bg-gradient-to-br ${getSquareStyle(dayInfo.type)}`;
            const animationClass = isAdvancingTo ? 'animate-pulse ring-4 ring-yellow-300 shadow-yellow-500/50 shadow-xl scale-110' : '';
            const completedClass = isCompleted ? 'ring-2 ring-green-300 shadow-green-500/30' : '';
            
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

        {/* マス目説明（仕様書通りの詳細表示） */}
        <div className="mt-3">
          <div className="flex justify-center gap-4 text-xs text-slate-300 mb-2">
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
          
          {/* 現在のマス目の詳細効果表示 */}
          <div className="bg-slate-700/30 rounded-lg p-3 border border-slate-600/30">
            <div className="text-center text-slate-300 text-xs mb-2">
              📍 現在のマス目効果
            </div>
            <div className="text-center text-white text-sm">
              {(() => {
                const effects = getSquareEffects(currentPositionInfo.squareType);
                const effectText = effects.description;
                return effectText.length > 60 ? effectText.substring(0, 60) + '...' : effectText;
              })()}
            </div>
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
        {/* 左：テニスコート背景にラリー風アニメ */}
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
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-bold text-white">練習を選択</h3>
            <div className="bg-slate-700/50 px-3 py-1 rounded-lg border border-slate-600/30">
              <span className="text-slate-300 text-sm">
                手札: {handCards.length}/{HAND_SIZE}枚
              </span>
            </div>
          </div>
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

      {/* イベント詳細モーダル（仕様書通りの詳細実装） */}
      {showEventDetails && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 max-w-2xl w-full mx-4 border border-slate-600">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">{showEventDetails.name}</h3>
              {showEventDetails.isHidden && (
                <span className="bg-yellow-500 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold">
                  🎯 隠しマス発見！
                </span>
              )}
            </div>
            
            <p className="text-slate-300 mb-4">{showEventDetails.description}</p>
            
            {/* 報酬表示 */}
            {showEventDetails.reward && (
              <div className="bg-slate-700/50 rounded-lg p-4 mb-4 border border-slate-600/30">
                <h4 className="text-lg font-semibold text-white mb-2">🎁 報酬</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {showEventDetails.reward.skill_boosts && Object.entries(showEventDetails.reward.skill_boosts).map(([skill, value]) => (
                    <div key={skill} className="flex justify-between">
                      <span className="text-slate-300">{skill}:</span>
                      <span className="text-green-400">+{value}</span>
                    </div>
                  ))}
                  {showEventDetails.reward.funds && (
                    <div className="flex justify-between">
                      <span className="text-slate-300">資金:</span>
                      <span className="text-yellow-400">+{showEventDetails.reward.funds}円</span>
                    </div>
                  )}
                  {showEventDetails.reward.reputation && (
                    <div className="flex justify-between">
                      <span className="text-slate-300">評判:</span>
                      <span className="text-blue-400">+{showEventDetails.reward.reputation}</span>
                    </div>
                  )}
                  {showEventDetails.reward.experience && (
                    <div className="flex justify-between">
                      <span className="text-slate-300">経験値:</span>
                      <span className="text-purple-400">+{showEventDetails.reward.experience}</span>
                    </div>
                  )}
                  {showEventDetails.reward.condition_boost && (
                    <div className="flex justify-between">
                      <span className="text-slate-300">調子向上:</span>
                      <span className="text-green-400">+{showEventDetails.reward.condition_boost}</span>
                    </div>
                  )}
                  {showEventDetails.reward.motivation_boost && (
                    <div className="flex justify-between">
                      <span className="text-slate-300">やる気向上:</span>
                      <span className="text-orange-400">+{showEventDetails.reward.motivation_boost}</span>
                    </div>
                  )}
                  {showEventDetails.reward.items && (
                    <div className="col-span-2">
                      <span className="text-slate-300">アイテム:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {showEventDetails.reward.items.map((item, index) => (
                          <span key={index} className="bg-blue-600 text-white px-2 py-1 rounded text-xs">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* 分岐マスの選択肢 */}
            {showEventDetails.type === 'branch' && showEventDetails.choices && (
              <div className="mb-4">
                <h4 className="text-lg font-semibold text-white mb-3">🛤️ ルート選択</h4>
                <div className="grid grid-cols-1 gap-3">
                  {showEventDetails.choices.map((choice) => (
                    <div
                      key={choice.id}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all hover:scale-105 ${
                        choice.risk === 'low' ? 'border-green-500 bg-green-500/10' :
                        choice.risk === 'medium' ? 'border-yellow-500 bg-yellow-500/10' :
                        'border-red-500 bg-red-500/10'
                      }`}
                      onClick={() => handleRouteChoice(choice)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-semibold text-white">{choice.name}</h5>
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          choice.risk === 'low' ? 'bg-green-600 text-white' :
                          choice.risk === 'medium' ? 'bg-yellow-600 text-white' :
                          'bg-red-600 text-white'
                        }`}>
                          {choice.risk === 'low' ? '低リスク' : choice.risk === 'medium' ? '中リスク' : '高リスク'}
                        </span>
                      </div>
                      <p className="text-slate-300 text-sm mb-2">{choice.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(choice.effects).map(([effect, value]) => (
                          <span key={effect} className="bg-slate-600 text-white px-2 py-1 rounded text-xs">
                            {effect}: +{value}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* 特訓マスの部員選択 */}
            {showEventDetails.type === 'training' && allPlayers.length > 0 && (
              <div className="mb-4">
                <h4 className="text-lg font-semibold text-white mb-3">🎯 特訓対象を選択</h4>
                <div className="grid grid-cols-3 gap-3">
                  {allPlayers.slice(0, 3).map((player, index) => (
                    <div
                      key={player.id}
                      className="p-3 rounded-lg border-2 border-blue-500 bg-blue-500/10 cursor-pointer transition-all hover:scale-105 hover:border-blue-400"
                      onClick={() => handleTrainingChoice(player)}
                    >
                      <div className="text-center">
                        <div className="w-12 h-12 mx-auto mb-2 rounded-full overflow-hidden ring-2 ring-blue-400">
                          <img 
                            src={`/img/pokemon/${player.pokemon_name.toLowerCase()}.png`} 
                            alt={player.pokemon_name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/pokemon-fallback.svg';
                            }}
                          />
                        </div>
                        <h5 className="font-semibold text-white text-sm">{player.pokemon_name}</h5>
                        <p className="text-slate-300 text-xs">Lv.{player.level}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowEventDetails(null)}
                className="flex-1 bg-slate-600 hover:bg-slate-700 text-white py-2 rounded-lg transition-colors"
              >
                閉じる
              </button>
              {showEventDetails.type !== 'branch' && showEventDetails.type !== 'training' && (
                <button
                  onClick={() => handleEventAction(showEventDetails)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors"
                >
                  報酬を受け取る
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}