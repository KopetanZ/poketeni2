'use client';

import React, { useState, useMemo } from 'react';
import { TrainingCard } from '@/types/training-cards';
import { CardCombo } from '@/lib/combo-system';
import { CustomDeck } from '@/lib/deck-builder';
import { HandStateManager, CardRetentionSystem } from '@/lib/enhanced-hand-management';

interface EnhancedCardInterfaceProps {
  handCards: TrainingCard[];
  retainedCards: TrainingCard[];
  availableCards: TrainingCard[];
  onCardSelect: (card: TrainingCard) => void;
  onCardRetain: (card: TrainingCard) => void;
  onCardDiscard: (card: TrainingCard) => void;
  onDeckChange: (deck: CustomDeck) => void;
  playerStats: {
    level: number;
    funds: number;
    reputation: number;
    facilityLevel: number;
  };
  currentDeck?: CustomDeck;
}

export default function EnhancedCardInterface({
  handCards,
  retainedCards,
  availableCards,
  onCardSelect,
  onCardRetain,
  onCardDiscard,
  onDeckChange,
  playerStats,
  currentDeck
}: EnhancedCardInterfaceProps) {
  const [selectedCard, setSelectedCard] = useState<TrainingCard | null>(null);
  const [showRetainedCards, setShowRetainedCards] = useState(false);
  const [showDeckBuilder, setShowDeckBuilder] = useState(false);
  const [activeTab, setActiveTab] = useState<'hand' | 'retained' | 'deck'>('hand');

  // 手札管理システムのインスタンス
  const handManager = useMemo(() => new HandStateManager(), []);
  const retentionSystem = useMemo(() => new CardRetentionSystem(), []);

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

  // カード保持コスト
  const retentionCost = useMemo(() => {
    return retainedCards.length * 1000; // 1枚あたり1000円
  }, [retainedCards.length]);

  // カード選択処理
  const handleCardSelect = (card: TrainingCard) => {
    setSelectedCard(card);
    onCardSelect(card);
  };

  // カード保持処理
  const handleCardRetain = (card: TrainingCard) => {
    if (playerStats.funds >= 1000) {
      onCardRetain(card);
    }
  };

  // カード破棄処理
  const handleCardDiscard = (card: TrainingCard) => {
    onCardDiscard(card);
    if (selectedCard?.id === card.id) {
      setSelectedCard(null);
    }
  };

  // レアリティカラー
  const rarityColors = {
    common: 'from-gray-400 to-gray-500',
    uncommon: 'from-green-400 to-green-500',
    rare: 'from-blue-400 to-blue-500',
    epic: 'from-purple-400 to-purple-500',
    legendary: 'from-yellow-400 to-yellow-500'
  };

  return (
    <div className="space-y-6">
      {/* 手札サイズインジケーター */}
      <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-600/50">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-white">手札管理</h3>
          <div className="flex items-center gap-2">
            <span className="text-slate-300 text-sm">
              手札: {handSizeInfo.current}/{handSizeInfo.maximum}枚
            </span>
            {handSizeInfo.bonuses.length > 0 && (
              <div className="flex gap-1">
                {handSizeInfo.bonuses.map((bonus, index) => (
                  <span key={index} className="bg-green-600/20 text-green-400 px-2 py-1 rounded text-xs">
                    {bonus}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* 手札サイズバー */}
        <div className="w-full bg-slate-700 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${(handSizeInfo.current / handSizeInfo.maximum) * 100}%` }}
          />
        </div>
      </div>

      {/* タブナビゲーション */}
      <div className="flex border-b border-slate-600">
        <button
          onClick={() => setActiveTab('hand')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'hand'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          手札 ({handCards.length})
        </button>
        <button
          onClick={() => setActiveTab('retained')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'retained'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          保持 ({retainedCards.length})
        </button>
        <button
          onClick={() => setActiveTab('deck')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'deck'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          デッキ設定
        </button>
      </div>

      {/* 手札タブ */}
      {activeTab === 'hand' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-white">現在の手札</h4>
            <div className="text-slate-400 text-sm">
              選択中: {selectedCard ? selectedCard.name : 'なし'}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {handCards.map((card) => (
              <div
                key={card.id}
                className={`relative cursor-pointer transition-all duration-200 hover:scale-105 ${
                  selectedCard?.id === card.id 
                    ? 'scale-105 ring-2 ring-yellow-300 shadow-yellow-500/30' 
                    : 'hover:ring-2 hover:ring-slate-400'
                }`}
                onClick={() => handleCardSelect(card)}
              >
                <div className={`w-full h-64 rounded-lg border-2 overflow-hidden bg-gradient-to-br ${
                  rarityColors[card.rarity] || 'from-gray-400 to-gray-500'
                }`}>
                  <div className="p-4 text-white">
                    <div className="text-center mb-3">
                      <div className="text-2xl mb-2">{card.icon}</div>
                      <h5 className="font-bold text-sm mb-1">{card.name}</h5>
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
                
                {/* アクションボタン */}
                <div className="absolute top-2 right-2 flex gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCardRetain(card);
                    }}
                    disabled={playerStats.funds < 1000}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white p-1 rounded text-xs"
                    title="カードを保持 (1000円)"
                  >
                    💾
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCardDiscard(card);
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white p-1 rounded text-xs"
                    title="カードを破棄"
                  >
                    🗑️
                  </button>
                </div>
                
                {/* 選択状態表示 */}
                {selectedCard?.id === card.id && (
                  <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold">
                    選択中
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 保持カードタブ */}
      {activeTab === 'retained' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-white">保持中のカード</h4>
            <div className="text-slate-400 text-sm">
              保持コスト: {retentionCost}円
            </div>
          </div>
          
          {retainedCards.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              保持中のカードはありません
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {retainedCards.map((card) => (
                <div
                  key={card.id}
                  className="relative w-full h-64 rounded-lg border-2 overflow-hidden bg-gradient-to-br from-purple-400 to-purple-500"
                >
                  <div className="p-4 text-white">
                    <div className="text-center mb-3">
                      <div className="text-2xl mb-2">{card.icon}</div>
                      <h5 className="font-bold text-sm mb-1">{card.name}</h5>
                      <div className="text-xs opacity-80">保持中</div>
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
                  
                  {/* 保持状態表示 */}
                  <div className="absolute top-2 right-2 bg-purple-600 text-white px-2 py-1 rounded text-xs">
                    保持中
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* デッキ設定タブ */}
      {activeTab === 'deck' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-white">デッキ設定</h4>
            <button
              onClick={() => setShowDeckBuilder(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
            >
              デッキ構築
            </button>
          </div>
          
          {currentDeck ? (
            <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600/30">
              <h5 className="font-semibold text-white mb-2">{currentDeck.name}</h5>
              <p className="text-slate-300 text-sm mb-3">{currentDeck.description}</p>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-400">優先カテゴリ:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {currentDeck.composition.preferredCategories.map(category => (
                      <span key={category} className="bg-blue-600 text-white px-2 py-1 rounded text-xs">
                        {category}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <span className="text-slate-400">除外カード:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {currentDeck.composition.excludedCards.length > 0 ? (
                      currentDeck.composition.excludedCards.map(cardId => (
                        <span key={cardId} className="bg-red-600 text-white px-2 py-1 rounded text-xs">
                          {cardId}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-500 text-xs">なし</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">
              デッキが設定されていません
            </div>
          )}
        </div>
      )}

      {/* 資金・コスト表示 */}
      <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-600/50">
        <div className="flex items-center justify-between">
          <div className="text-slate-300">
            現在の資金: <span className="text-yellow-400 font-bold">{playerStats.funds.toLocaleString()}円</span>
          </div>
          <div className="text-slate-300">
            保持コスト: <span className="text-red-400 font-bold">{retentionCost.toLocaleString()}円</span>
          </div>
        </div>
      </div>
    </div>
  );
}
