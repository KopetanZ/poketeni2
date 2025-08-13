'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { TrainingCard } from '@/types/training-cards';
import { Player } from '@/types/game';
import { EnhancedCardInterface } from '@/components/cards/EnhancedCardInterface';
import { ComboIndicator } from '@/components/cards/ComboIndicator';
import { HandStateManager, CardRetentionSystem, calculateHandSize } from '@/lib/enhanced-hand-management';
import { ComboDetectionSystem, ComboEffectSystem, ComboHistoryManager } from '@/lib/combo-system';
import { DeckBuilderSystem, DeckStorageSystem } from '@/lib/deck-builder';

interface EnhancedSugorokuBoardProps {
  currentPosition: number;
  availableCards: TrainingCard[];
  onCardUse: (cardId: string) => void;
  isLoading?: boolean;
  allPlayers?: Player[];
  playerStats: {
    level: number;
    funds: number;
    reputation: number;
    facilityLevel: number;
  };
}

export default function EnhancedSugorokuBoard({
  currentPosition,
  availableCards,
  onCardUse,
  isLoading = false,
  allPlayers = [],
  playerStats
}: EnhancedSugorokuBoardProps) {
  // 拡張手札管理システム
  const [handManager] = useState(() => new HandStateManager());
  const [retentionSystem] = useState(() => new CardRetentionSystem());
  const [comboDetection] = useState(() => new ComboDetectionSystem());
  const [comboEffectSystem] = useState(() => new ComboEffectSystem());
  const [comboHistory] = useState(() => new ComboHistoryManager());
  const [deckBuilder] = useState(() => new DeckBuilderSystem());
  const [deckStorage] = useState(() => new DeckStorageSystem());

  // 状態管理
  const [handCards, setHandCards] = useState<TrainingCard[]>([]);
  const [retainedCards, setRetainedCards] = useState<TrainingCard[]>([]);
  const [currentDeck, setCurrentDeck] = useState<any>(null);
  const [completedCombos, setCompletedCombos] = useState<string[]>([]);
  const [showComboHistory, setShowComboHistory] = useState(false);

  // 手札サイズ計算
  const handSizeInfo = useMemo(() => {
    const baseSize = 5;
    const facilityBonus = Math.min(Math.floor(playerStats.facilityLevel / 10), 2);
    const reputationBonus = playerStats.reputation >= 80 ? 1 : 0;
    const totalSize = Math.min(baseSize + facilityBonus + reputationBonus, 8);
    
    return {
      current: handCards.length,
      maximum: totalSize,
      bonuses: [
        facilityBonus > 0 ? `施設レベル: +${facilityBonus}` : null,
        reputationBonus > 0 ? `評判: +${reputationBonus}` : null
      ].filter(Boolean)
    };
  }, [handCards.length, playerStats.facilityLevel, playerStats.reputation]);

  // 初期化
  useEffect(() => {
    if (availableCards.length > 0) {
      const initialHand = availableCards.slice(0, handSizeInfo.maximum);
      setHandCards(initialHand);
      
      // 保存されたデッキを読み込み
      const savedDeck = deckStorage.loadAllDecks()[0];
      if (savedDeck) {
        setCurrentDeck(savedDeck);
      }
    }
  }, [availableCards, handSizeInfo.maximum]);

  // カード選択処理
  const handleCardSelect = (card: TrainingCard) => {
    // カード選択の処理
    console.log('カード選択:', card.name);
  };

  // カード保持処理
  const handleCardRetain = (card: TrainingCard) => {
    if (playerStats.funds >= 1000) {
      const success = retentionSystem.retainCard(card, playerStats.funds);
      if (success) {
        setRetainedCards(retentionSystem.getRetainedCards());
        // 手札から削除
        setHandCards(prev => prev.filter(c => c.id !== card.id));
        // 資金を減らす（実際の実装では親コンポーネントで管理）
        console.log('カードを保持しました:', card.name);
      }
    }
  };

  // カード破棄処理
  const handleCardDiscard = (card: TrainingCard) => {
    setHandCards(prev => prev.filter(c => c.id !== card.id));
    console.log('カードを破棄しました:', card.name);
  };

  // デッキ変更処理
  const handleDeckChange = (deck: any) => {
    setCurrentDeck(deck);
    deckStorage.saveDeck(deck);
  };

  // コンボ発動処理
  const handleComboActivate = (combo: any, selectedCards: TrainingCard[]) => {
    // コンボ効果を適用
    const comboEffects = comboEffectSystem.applyComboEffects(
      combo,
      { skill: 10, experience: 50 },
      playerStats
    );
    
    // コンボ履歴に記録
    comboHistory.recordComboUsage(
      combo.id,
      selectedCards.map(c => c.id),
      true,
      comboEffects
    );
    
    // 完了コンボに追加
    setCompletedCombos(prev => [...prev, combo.id]);
    
    // 使用したカードを手札から削除
    setHandCards(prev => prev.filter(c => !selectedCards.some(sc => sc.id === c.id)));
    
    console.log('コンボ発動:', combo.name, comboEffects);
  };

  // 利用可能なコンボを検出
  const availableCombos = useMemo(() => {
    return comboDetection.detectAvailableCombos(
      handCards,
      playerStats.level,
      playerStats.reputation,
      completedCombos
    );
  }, [handCards, playerStats, completedCombos]);

  // 利用可能なデッキテンプレート
  const availableDecks = useMemo(() => {
    return deckBuilder.getAvailableDecks(
      playerStats.level,
      playerStats.funds,
      completedCombos
    );
  }, [playerStats, completedCombos]);

  return (
    <div className="space-y-6">
      {/* 拡張手札インターフェース */}
      <EnhancedCardInterface
        handCards={handCards}
        retainedCards={retainedCards}
        availableCards={availableCards}
        onCardSelect={handleCardSelect}
        onCardRetain={handleCardRetain}
        onCardDiscard={handleCardDiscard}
        onDeckChange={handleDeckChange}
        playerStats={playerStats}
        currentDeck={currentDeck}
      />

      {/* コンボインジケーター */}
      {availableCombos.length > 0 && (
        <ComboIndicator
          handCards={handCards}
          playerStats={playerStats}
          completedCombos={completedCombos}
          onComboActivate={handleComboActivate}
        />
      )}

      {/* デッキ情報 */}
      {currentDeck && (
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-600/50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-white">現在のデッキ</h3>
            <div className="text-slate-300 text-sm">
              評価: {deckBuilder.calculateDeckEffects(currentDeck, handCards).overallRating}/100
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-white mb-2">{currentDeck.name}</h4>
              <p className="text-slate-300 text-sm mb-3">{currentDeck.description}</p>
              
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-slate-400">コンボ確率:</span>
                  <span className="text-purple-400 ml-2">
                    +{currentDeck.deckEffects.comboChanceBonus}%
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">特殊ドロー:</span>
                  <span className="text-blue-400 ml-2">
                    +{currentDeck.deckEffects.specialDrawChance}%
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <h5 className="font-semibold text-white mb-2">カテゴリボーナス</h5>
              <div className="space-y-1 text-sm">
                {Object.entries(currentDeck.deckEffects.categoryBonus).map(([category, bonus]) => (
                  <div key={category} className="flex justify-between">
                    <span className="text-slate-400">{category}:</span>
                    <span className="text-green-400">x{bonus}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 利用可能なデッキテンプレート */}
      {availableDecks.length > 0 && (
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-600/50">
          <h3 className="text-lg font-bold text-white mb-3">利用可能なデッキ</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {availableDecks.map((deck) => (
              <div
                key={deck.id}
                className="bg-slate-700/50 rounded-lg p-3 border border-slate-600/30 cursor-pointer hover:border-blue-400/50 transition-all hover:scale-105"
                onClick={() => handleDeckChange(deck)}
              >
                <h4 className="font-semibold text-white text-sm mb-2">{deck.name}</h4>
                <p className="text-slate-300 text-xs mb-2 line-clamp-2">
                  {deck.description}
                </p>
                
                <div className="flex items-center justify-between text-xs">
                  <span className="text-blue-400">
                    コンボ: +{deck.deckEffects.comboChanceBonus}%
                  </span>
                  <span className="text-green-400">
                    Lv.{deck.unlockRequirements.playerLevel}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* コンボ履歴 */}
      <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-600/50">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-white">コンボ履歴</h3>
          <button
            onClick={() => setShowComboHistory(!showComboHistory)}
            className="text-blue-400 hover:text-blue-300 text-sm"
          >
            {showComboHistory ? '隠す' : '表示'}
          </button>
        </div>
        
        {showComboHistory && (
          <div className="space-y-2">
            {comboHistory.getComboHistory().length === 0 ? (
              <div className="text-center py-4 text-slate-400">
                コンボ履歴はありません
              </div>
            ) : (
              comboHistory.getComboHistory().map((record, index) => (
                <div key={index} className="bg-slate-700/30 rounded-lg p-3 border border-slate-600/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-white text-sm">
                      {record.comboId}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      record.success 
                        ? 'bg-green-600/20 text-green-400' 
                        : 'bg-red-600/20 text-red-400'
                    }`}>
                      {record.success ? '成功' : '失敗'}
                    </span>
                  </div>
                  
                  <div className="text-xs text-slate-400">
                    使用カード: {record.usedCards.length}枚
                  </div>
                  
                  <div className="text-xs text-slate-400">
                    {record.timestamp.toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* 統計情報 */}
      <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-600/50">
        <h3 className="text-lg font-bold text-white mb-3">統計情報</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{handSizeInfo.current}</div>
            <div className="text-slate-400">手札枚数</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">{retainedCards.length}</div>
            <div className="text-slate-400">保持カード</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{availableCombos.length}</div>
            <div className="text-slate-400">利用可能コンボ</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">{completedCombos.length}</div>
            <div className="text-slate-400">完了コンボ</div>
          </div>
        </div>
      </div>
    </div>
  );
}
