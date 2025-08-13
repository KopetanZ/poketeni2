'use client';

import React, { useState, useEffect } from 'react';
import { TrainingCard } from '@/types/training-cards';
import { CardCombo, ComboDetectionSystem, ComboEffectSystem } from '@/lib/combo-system';

interface ComboIndicatorProps {
  handCards: TrainingCard[];
  playerStats: {
    level: number;
    reputation: number;
  };
  completedCombos: string[];
  onComboActivate: (combo: CardCombo, selectedCards: TrainingCard[]) => void;
}

export default function ComboIndicator({
  handCards,
  playerStats,
  completedCombos,
  onComboActivate
}: ComboIndicatorProps) {
  const [availableCombos, setAvailableCombos] = useState<CardCombo[]>([]);
  const [selectedCombo, setSelectedCombo] = useState<CardCombo | null>(null);
  const [selectedCards, setSelectedCards] = useState<TrainingCard[]>([]);
  const [showComboDetails, setShowComboDetails] = useState(false);

  // コンボ検出システム
  const comboDetection = new ComboDetectionSystem();
  const comboEffectSystem = new ComboEffectSystem();

  // 利用可能なコンボを検出
  useEffect(() => {
    const combos = comboDetection.detectAvailableCombos(
      handCards,
      playerStats.level,
      playerStats.reputation,
      completedCombos
    );
    setAvailableCombos(combos);
  }, [handCards, playerStats, completedCombos]);

  // コンボ選択処理
  const handleComboSelect = (combo: CardCombo) => {
    setSelectedCombo(combo);
    setSelectedCards([]);
    setShowComboDetails(true);
  };

  // カード選択処理
  const handleCardSelect = (card: TrainingCard) => {
    if (selectedCombo) {
      const isSelected = selectedCards.some(c => c.id === card.id);
      if (isSelected) {
        setSelectedCards(prev => prev.filter(c => c.id !== card.id));
      } else {
        setSelectedCards(prev => [...prev, card]);
      }
    }
  };

  // コンボ実行処理
  const handleComboActivate = () => {
    if (selectedCombo && selectedCards.length > 0) {
      onComboActivate(selectedCombo, selectedCards);
      setShowComboDetails(false);
      setSelectedCombo(null);
      setSelectedCards([]);
    }
  };

  // コンボの成功率を計算
  const getComboSuccessRate = (combo: CardCombo) => {
    return comboEffectSystem.calculateComboSuccessRate(combo, handCards, playerStats);
  };

  // コンボの効果を計算
  const getComboEffects = (combo: CardCombo) => {
    const baseEffects = { skill: 10, experience: 50 }; // 仮の基本効果
    return comboEffectSystem.applyComboEffects(combo, baseEffects, playerStats);
  };

  if (availableCombos.length === 0) {
    return null; // 利用可能なコンボがない場合は表示しない
  }

  return (
    <div className="space-y-4">
      {/* コンボ利用可能インジケーター */}
      <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl p-4 border border-purple-500/30">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            ✨ コンボ利用可能 ({availableCombos.length})
          </h3>
          <div className="text-purple-300 text-sm">
            手札から強力なコンボを発動できます
          </div>
        </div>
        
        {/* 利用可能なコンボ一覧 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {availableCombos.map((combo) => {
            const successRate = getComboSuccessRate(combo);
            const effects = getComboEffects(combo);
            
            return (
              <div
                key={combo.id}
                className="bg-slate-700/50 rounded-lg p-3 border border-purple-500/30 cursor-pointer hover:border-purple-400/50 transition-all hover:scale-105"
                onClick={() => handleComboSelect(combo)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-white text-sm">{combo.name}</h4>
                  <span className="bg-purple-600 text-white px-2 py-1 rounded text-xs">
                    {successRate}%
                  </span>
                </div>
                
                <p className="text-slate-300 text-xs mb-2 line-clamp-2">
                  {combo.description}
                </p>
                
                <div className="flex items-center justify-between text-xs">
                  <span className="text-purple-300">
                    効果: {effects.modifiedEffects.skill || 0}倍
                  </span>
                  {effects.progressBonus > 0 && (
                    <span className="text-green-400">
                      +{effects.progressBonus}マス
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* コンボ詳細モーダル */}
      {showComboDetails && selectedCombo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 max-w-2xl w-full mx-4 border border-slate-600">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">{selectedCombo.name}</h3>
              <button
                onClick={() => setShowComboDetails(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <p className="text-slate-300 mb-4">{selectedCombo.description}</p>
            
            {/* 必要カード表示 */}
            <div className="bg-slate-700/50 rounded-lg p-4 mb-4 border border-slate-600/30">
              <h4 className="text-lg font-semibold text-white mb-3">必要カードを選択</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {handCards.map((card) => {
                  const isSelected = selectedCards.some(c => c.id === card.id);
                  const isRequired = checkCardRequirement(card, selectedCombo);
                  
                  return (
                    <div
                      key={card.id}
                      className={`relative cursor-pointer transition-all ${
                        isSelected 
                          ? 'ring-2 ring-purple-400 scale-105' 
                          : isRequired 
                            ? 'ring-2 ring-yellow-400' 
                            : 'hover:ring-2 hover:ring-slate-400'
                      }`}
                      onClick={() => handleCardSelect(card)}
                    >
                      <div className={`w-full h-32 rounded-lg border-2 overflow-hidden bg-gradient-to-br ${
                        isSelected ? 'from-purple-400 to-purple-500' : 'from-slate-500 to-slate-600'
                      }`}>
                        <div className="p-3 text-white">
                          <div className="text-center mb-2">
                            <div className="text-lg mb-1">{card.icon}</div>
                            <h5 className="font-bold text-xs">{card.name}</h5>
                          </div>
                          
                          {isRequired && (
                            <div className="absolute top-1 right-1 bg-yellow-500 text-yellow-900 px-1 py-0.5 rounded text-xs">
                              必要
                            </div>
                          )}
                          
                          {isSelected && (
                            <div className="absolute -top-1 -right-1 bg-purple-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                              選択中
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* コンボ効果詳細 */}
            <div className="bg-slate-700/50 rounded-lg p-4 mb-4 border border-slate-600/30">
              <h4 className="text-lg font-semibold text-white mb-3">コンボ効果</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-400">効果倍率:</span>
                  <span className="text-green-400 ml-2 font-bold">
                    {selectedCombo.effects.bonusMultiplier}x
                  </span>
                </div>
                
                {selectedCombo.effects.progressBonus && (
                  <div>
                    <span className="text-slate-400">進行ボーナス:</span>
                    <span className="text-blue-400 ml-2 font-bold">
                      +{selectedCombo.effects.progressBonus}マス
                    </span>
                  </div>
                )}
                
                {selectedCombo.effects.costReduction && (
                  <div>
                    <span className="text-slate-400">コスト軽減:</span>
                    <span className="text-purple-400 ml-2 font-bold">
                      {Math.round(selectedCombo.effects.costReduction * 100)}%
                    </span>
                  </div>
                )}
                
                <div>
                  <span className="text-slate-400">成功率:</span>
                  <span className="text-yellow-400 ml-2 font-bold">
                    {getComboSuccessRate(selectedCombo)}%
                  </span>
                </div>
              </div>
              
              {/* 特殊効果 */}
              {selectedCombo.effects.specialEffects && selectedCombo.effects.specialEffects.length > 0 && (
                <div className="mt-3">
                  <span className="text-slate-400 text-sm">特殊効果:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedCombo.effects.specialEffects.map((effect, index) => (
                      <span key={index} className="bg-purple-600 text-white px-2 py-1 rounded text-xs">
                        {effect.type === 'special_ability_unlock' && '特殊能力解放'}
                        {effect.type === 'all_stats_boost' && '全能力向上'}
                        {effect.type === 'special_event_trigger' && '特殊イベント'}
                        {effect.type === 'team_bonus' && 'チームボーナス'}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* アクションボタン */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowComboDetails(false)}
                className="flex-1 bg-slate-600 hover:bg-slate-700 text-white py-2 rounded-lg transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleComboActivate}
                disabled={selectedCards.length < selectedCombo.requiredCards.minCards}
                className={`flex-1 py-2 rounded-lg transition-colors ${
                  selectedCards.length >= selectedCombo.requiredCards.minCards
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white'
                    : 'bg-slate-600 text-slate-400 cursor-not-allowed'
                }`}
              >
                コンボ発動！
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// カードの要件チェック（ヘルパー関数）
function checkCardRequirement(card: TrainingCard, combo: CardCombo): boolean {
  const { requiredCards } = combo;
  
  // カテゴリチェック
  if (requiredCards.categories && requiredCards.categories.includes(card.category || 'general')) {
    return true;
  }
  
  // レア度チェック
  if (requiredCards.rarities && requiredCards.rarities.includes(card.rarity)) {
    return true;
  }
  
  // 特定カードIDチェック
  if (requiredCards.cardIds && requiredCards.cardIds.includes(card.id)) {
    return true;
  }
  
  return false;
}
