'use client';

import React, { useState, useEffect } from 'react';
import { TrainingCardSystem, TRAINING_CARDS, RARITY_CONFIGS } from '../../lib/training-card-system';
import { TrainingCard, CardUsageResult, CardDrop } from '../../types/training-cards';
import { Player } from '../../types/game';
import TrainingCardDisplay from './TrainingCardDisplay';
import CardUsageResultModal from './CardUsageResultModal';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { handCardsManager } from '../../lib/hand-cards-manager';
import { gameProgressManager } from '../../lib/game-progress-manager';

interface CardSelectionInterfaceProps {
  player: Player;
  schoolFunds: number;
  schoolReputation: number;
  schoolId: string; // 学校IDを追加
  currentDate: { year: number; month: number; day: number }; // 現在の日付を追加
  onCardUse?: (result: CardUsageResult) => void;
  onStatsUpdate?: (player: Player) => void;
}

export const CardSelectionInterface: React.FC<CardSelectionInterfaceProps> = ({
  player,
  schoolFunds,
  schoolReputation,
  schoolId,
  currentDate,
  onCardUse,
  onStatsUpdate
}) => {
  const [availableCards, setAvailableCards] = useState<TrainingCard[]>([]);
  const [selectedCard, setSelectedCard] = useState<TrainingCard | null>(null);
  const [usageResult, setUsageResult] = useState<CardUsageResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingCards, setIsGeneratingCards] = useState(false);

  // プレイヤーステータス変換
  const getPlayerStats = () => ({
    stamina: player.stamina || 100,
    motivation: player.condition || 50, // condition をやる気として使用
    level: player.level || 1,
    serve_skill: player.serve_skill || 0,
    return_skill: player.return_skill || 0,
    volley_skill: player.volley_skill || 0,
    stroke_skill: player.stroke_skill || 0,
    mental: player.mental || 0
  });

  // 初期化時にデータベースからカードを読み込み
  useEffect(() => {
    loadHandCards();
  }, [schoolId, currentDate.year, currentDate.month, currentDate.day]);

  // 手札カードの読み込み
  const loadHandCards = async () => {
    setIsLoading(true);
    try {
      // データベースから手札を読み込み
      let cards = await handCardsManager.getHandCards(schoolId);
      
      // 手札が空の場合、または日次リセットが必要な場合は新しいカードを生成
      if (cards.length === 0 || await gameProgressManager.shouldResetDaily(
        schoolId, 
        currentDate.year, 
        currentDate.month, 
        currentDate.day
      )) {
        cards = await handCardsManager.generateAndSaveDailyCards(
          schoolId,
          schoolReputation,
          player.level || 1,
          currentDate.year,
          currentDate.month,
          currentDate.day
        );
      }
      
      setAvailableCards(cards);
    } catch (error) {
      console.error('Failed to load hand cards:', error);
      // エラーの場合はフォールバックとしてカードを生成
      const fallbackCards = TrainingCardSystem.generateCardDrop(
        schoolReputation,
        player.level || 1,
        5,
        'daily_practice'
      ).cards;
      setAvailableCards(fallbackCards);
    } finally {
      setIsLoading(false);
    }
  };

  // 手動でカードを更新（デバッグ用）
  const refreshCards = async () => {
    setIsGeneratingCards(true);
    try {
      const cards = await handCardsManager.generateAndSaveDailyCards(
        schoolId,
        schoolReputation,
        player.level || 1,
        currentDate.year,
        currentDate.month,
        currentDate.day
      );
      setAvailableCards(cards);
    } catch (error) {
      console.error('Failed to refresh cards:', error);
    } finally {
      setIsGeneratingCards(false);
    }
  };

  // カード使用処理
  const handleCardUse = async (card: TrainingCard) => {
    setSelectedCard(card);
    
    // 環境修正要因を設定（実際の環境情報があれば使用）
    const environmentModifiers = {
      weather: 'sunny', // TODO: 実際の天候情報
      courtCondition: 'normal', // TODO: 実際のコート状況
      teamMorale: 70 // TODO: 実際のチーム士気
    };

    // カード使用結果計算（static method呼び出しなのでHook rules violation回避）
    const result = TrainingCardSystem.useCard(
      card,
      getPlayerStats(),
      environmentModifiers
    );

    // プレイヤーステータス更新
    if (result.success && onStatsUpdate) {
      const updatedPlayer = { ...player };
      
      // スキル成長適用
      if (result.actualEffects.skillGrowth) {
        Object.entries(result.actualEffects.skillGrowth).forEach(([skill, growth]) => {
          (updatedPlayer as any)[skill] = ((updatedPlayer as any)[skill] || 0) + growth;
        });
      }
      
      // 状態変化適用
      if (result.actualEffects.statusChanges) {
        if (result.actualEffects.statusChanges.condition) {
          (updatedPlayer as any).condition = Math.max(0, Math.min(100, 
            ((updatedPlayer as any).condition || 50) + result.actualEffects.statusChanges.condition
          ));
        }
      }
      
      // 体力消費
      updatedPlayer.stamina = Math.max(0, (updatedPlayer.stamina || 100) - card.costs.stamina);
      
      // 経験値追加
      updatedPlayer.experience = (updatedPlayer.experience || 0) + result.experienceGained;
      
      onStatsUpdate(updatedPlayer);
    }

    // データベースからカードを削除し、履歴に記録
    try {
      await handCardsManager.useCard(
        schoolId,
        card,
        player.id,
        await getCurrentPosition(), // 現在のすごろく位置を取得
        result.actualEffects
      );
      
      // ローカル状態も更新
      setAvailableCards(prev => prev.filter(c => c.id !== card.id));
    } catch (error) {
      console.error('Failed to record card usage:', error);
    }

    // 結果表示
    setUsageResult(result);
    onCardUse?.(result);
  };

  // 現在のすごろく位置を取得
  const getCurrentPosition = async (): Promise<number> => {
    try {
      const progress = await gameProgressManager.getGameProgress(schoolId);
      return progress?.current_position || 0;
    } catch (error) {
      console.error('Failed to get current position:', error);
      return 0;
    }
  };

  // カード追加（特別な報酬等）
  const handleSpecialCardReward = async (context: 'event_reward' | 'reputation_bonus') => {
    const specialDrop = TrainingCardSystem.generateCardDrop(
      schoolReputation,
      player.level || 1,
      2,
      context
    );
    
    // データベースに保存
    for (const card of specialDrop.cards) {
      await handCardsManager.addCard(schoolId, card);
    }
    
    // ローカル状態も更新
    setAvailableCards(prev => [...prev, ...specialDrop.cards]);
  };

  // カードフィルタリング機能
  const [filterRarity, setFilterRarity] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const filteredCards = availableCards.filter(card => {
    if (filterRarity !== 'all' && card.rarity !== filterRarity) return false;
    if (filterCategory !== 'all' && card.category !== filterCategory) return false;
    return true;
  });

  // ローディング中の表示
  if (isLoading) {
    return (
      <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mx-auto mb-4"></div>
          <h3 className="text-xl font-bold">手札を読み込み中...</h3>
          <p className="text-blue-100 mt-2">データベースから情報を取得しています</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー情報 */}
      <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl">練習カード選択</h2>
              <p className="text-blue-100">{player.pokemon_name}の特訓メニュー</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-blue-100">利用可能カード</div>
              <div className="text-2xl font-bold">{availableCards.length}枚</div>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* プレイヤー現在ステータス */}
      <Card>
        <CardHeader>
          <CardTitle>現在の状態</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{getPlayerStats().stamina}</div>
              <div className="text-sm text-gray-600">体力</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{getPlayerStats().motivation}</div>
              <div className="text-sm text-gray-600">やる気</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">Lv.{getPlayerStats().level}</div>
              <div className="text-sm text-gray-600">レベル</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">¥{schoolFunds.toLocaleString()}</div>
              <div className="text-sm text-gray-600">資金</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* カードフィルタ */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div>
              <label className="text-sm font-semibold mr-2">希少度:</label>
              <select 
                value={filterRarity} 
                onChange={(e) => setFilterRarity(e.target.value)}
                className="border rounded px-2 py-1 text-sm"
              >
                <option value="all">すべて</option>
                <option value="common">コモン</option>
                <option value="uncommon">アンコモン</option>
                <option value="rare">レア</option>
                <option value="legendary">レジェンド</option>
              </select>
            </div>
            
            <div>
              <label className="text-sm font-semibold mr-2">カテゴリ:</label>
              <select 
                value={filterCategory} 
                onChange={(e) => setFilterCategory(e.target.value)}
                className="border rounded px-2 py-1 text-sm"
              >
                <option value="all">すべて</option>
                <option value="technical">テクニカル</option>
                <option value="physical">フィジカル</option>
                <option value="mental">メンタル</option>
                <option value="tactical">戦術</option>
                <option value="special">スペシャル</option>
              </select>
            </div>

            <Button
              onClick={refreshCards}
              disabled={isGeneratingCards}
              variant="outline"
              size="sm"
            >
              {isGeneratingCards ? '更新中...' : 'カード更新'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* カード生成中の表示 */}
      {isGeneratingCards && (
        <Card className="bg-gradient-to-r from-purple-400 to-pink-500 text-white">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mx-auto mb-4"></div>
            <h3 className="text-xl font-bold">練習カード更新中...</h3>
            <p className="text-purple-100 mt-2">新しいカードを生成しています</p>
          </CardContent>
        </Card>
      )}

      {/* カード一覧表示 */}
      {filteredCards.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCards.map((card, index) => (
            <TrainingCardDisplay
              key={`${card.id}-${index}`}
              card={card}
              onUse={handleCardUse}
              playerStats={getPlayerStats() as any}
              schoolFunds={schoolFunds}
            />
          ))}
        </div>
      ) : (
        <Card className="text-center p-8">
          <CardContent>
            <h3 className="text-xl text-gray-600 mb-4">利用可能なカードがありません</h3>
            <p className="text-gray-500 mb-6">
              新しい練習カードを入手するか、フィルターを変更してください
            </p>
            <Button onClick={refreshCards} disabled={isGeneratingCards}>
              新しいカードを生成
            </Button>
          </CardContent>
        </Card>
      )}

      {/* 使用結果モーダル */}
      {usageResult && (
        <CardUsageResultModal
          result={usageResult}
          onClose={() => {
            setUsageResult(null);
            setSelectedCard(null);
          }}
        />
      )}
    </div>
  );
};

export default CardSelectionInterface;