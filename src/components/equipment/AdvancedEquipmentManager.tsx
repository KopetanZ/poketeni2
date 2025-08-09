'use client';

import React, { useState, useEffect } from 'react';
import { Player } from '@/types/game';
import { Equipment, ConsumableItem, PlayerEquipment } from '@/types/items';
import { RACKET_EQUIPMENT_EXPANDED } from '@/lib/items-database-expanded';
import { 
  Package, 
  Zap, 
  TrendingUp, 
  Shield, 
  Sparkles, 
  AlertTriangle,
  Info,
  RefreshCw,
  Target,
  X
} from 'lucide-react';

interface AdvancedEquipmentManagerProps {
  player: Player;
  onClose: () => void;
  onEquipmentChange: (playerId: string, equipment: PlayerEquipment) => void;
  availableEquipment: Equipment[];
  availableConsumables: ConsumableItem[];
  playerFunds: number;
}

export function AdvancedEquipmentManager({
  player,
  onClose,
  onEquipmentChange,
  availableEquipment = RACKET_EQUIPMENT_EXPANDED,
  availableConsumables = [],
  playerFunds = 10000
}: AdvancedEquipmentManagerProps) {
  const [activeTab, setActiveTab] = useState<'equipped' | 'inventory' | 'shop'>('equipped');
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [currentEquipment, setCurrentEquipment] = useState<PlayerEquipment>({
    player_id: player.id,
    racket: undefined,
    shoes: undefined,
    accessory: undefined,
    pokemon_item: undefined
  });
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [comparisonItem, setComparisonItem] = useState<Equipment | null>(null);

  // 装備効果の計算
  const calculateEquipmentEffects = (equipment: PlayerEquipment) => {
    const totalEffects = {
      serve_skill: 0,
      return_skill: 0,
      volley_skill: 0,
      stroke_skill: 0,
      mental: 0,
      stamina: 0,
      experience_boost: 0
    };

    Object.values(equipment).forEach(item => {
      if (item && item.effects) {
        Object.entries(item.effects).forEach(([key, value]) => {
          if (typeof value === 'number') {
            (totalEffects as any)[key] = (totalEffects as any)[key] || 0;
            (totalEffects as any)[key] += value;
          }
        });
      }
    });

    return totalEffects;
  };

  const currentEffects = calculateEquipmentEffects(currentEquipment);

  // レア度に応じたスタイリング
  const getRarityStyle = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'border-gray-300 bg-gray-50 text-gray-800';
      case 'uncommon':
        return 'border-green-300 bg-green-50 text-green-800';
      case 'rare':
        return 'border-blue-300 bg-blue-50 text-blue-800';
      case 'epic':
        return 'border-purple-300 bg-purple-50 text-purple-800';
      case 'legendary':
        return 'border-yellow-300 bg-yellow-50 text-yellow-800';
      default:
        return 'border-gray-300 bg-gray-50 text-gray-800';
    }
  };

  // 装備アイテムカード
  const EquipmentCard = ({ equipment, isEquipped = false, showComparison = false }: { 
    equipment: Equipment; 
    isEquipped?: boolean;
    showComparison?: boolean;
  }) => (
    <div
      className={`p-4 rounded-xl border-2 cursor-pointer transition-all hover:scale-105 ${getRarityStyle(equipment.rarity)} ${
        isEquipped ? 'ring-4 ring-blue-400 ring-opacity-50' : ''
      }`}
      onClick={() => showComparison ? setComparisonItem(equipment) : setSelectedEquipment(equipment)}
    >
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="text-2xl">{equipment.icon}</div>
          <div>
            <h3 className="font-bold text-lg">{equipment.name}</h3>
            <div className="text-sm opacity-75 capitalize">{equipment.rarity}</div>
          </div>
        </div>
        {isEquipped && (
          <div className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-bold">
            装備中
          </div>
        )}
      </div>

      {/* 説明 */}
      <p className="text-sm mb-3 opacity-90">{equipment.description}</p>

      {/* 効果表示 */}
      <div className="space-y-2">
        <div className="text-sm font-medium">効果:</div>
        <div className="grid grid-cols-2 gap-1 text-xs">
          {Object.entries(equipment.effects).map(([stat, value]) => (
            <div key={stat} className="flex justify-between">
              <span>
                {stat === 'serve_skill' ? 'サーブ' :
                 stat === 'return_skill' ? 'リターン' :
                 stat === 'volley_skill' ? 'ボレー' :
                 stat === 'stroke_skill' ? 'ストローク' :
                 stat === 'mental' ? 'メンタル' :
                 stat === 'stamina' ? 'スタミナ' :
                 stat === 'experience_boost' ? '経験値' : stat}:
              </span>
              <span className="font-bold text-green-600">+{value}{stat === 'experience_boost' ? '%' : ''}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 耐久性 */}
      {equipment.durability && (
        <div className="mt-3 pt-2 border-t border-current border-opacity-20">
          <div className="text-xs flex justify-between">
            <span>耐久性:</span>
            <span>{equipment.durability.current}/{equipment.durability.max}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${(equipment.durability.current / equipment.durability.max) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* 価格（ショップタブでのみ表示） */}
      {activeTab === 'shop' && (
        <div className="mt-3 pt-2 border-t border-current border-opacity-20">
          <div className="text-sm font-bold text-center">
            💰 {equipment.price.toLocaleString()}円
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Package size={32} />
              <div>
                <h1 className="text-2xl font-bold">装備管理</h1>
                <p className="text-blue-100">{player.pokemon_name} の装備とアイテム</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-300 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* タブナビゲーション */}
        <div className="bg-gray-100 px-6 py-4">
          <div className="flex space-x-4">
            {[
              { id: 'equipped', name: '装備中', icon: Shield, description: '現在の装備状況' },
              { id: 'inventory', name: '所持品', icon: Package, description: '持っているアイテム' },
              { id: 'shop', name: 'ショップ', icon: Sparkles, description: '新しいアイテムを購入' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-200'
                }`}
              >
                <tab.icon size={18} />
                <div className="text-left">
                  <div className="font-semibold">{tab.name}</div>
                  <div className="text-xs opacity-75">{tab.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex h-[calc(90vh-200px)]">
          {/* 左側: メインコンテンツ */}
          <div className="flex-1 p-6 overflow-y-auto">
            {activeTab === 'equipped' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-800">現在の装備</h2>
                
                {/* 装備スロット */}
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { slot: 'racket', name: 'ラケット', icon: '🎾' },
                    { slot: 'shoes', name: 'シューズ', icon: '👟' },
                    { slot: 'accessory', name: 'アクセサリー', icon: '💎' },
                    { slot: 'pokemon_item', name: 'ポケモンアイテム', icon: '🔮' }
                  ].map(slot => (
                    <div
                      key={slot.slot}
                      className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors cursor-pointer"
                    >
                      <div className="text-4xl mb-2">{slot.icon}</div>
                      <div className="font-semibold text-gray-700">{slot.name}</div>
                      {currentEquipment[slot.slot as keyof PlayerEquipment] ? (
                        <div className="mt-2 text-sm text-blue-600">
                          装備中: {(currentEquipment[slot.slot as keyof PlayerEquipment] as Equipment)?.name}
                        </div>
                      ) : (
                        <div className="mt-2 text-sm text-gray-500">未装備</div>
                      )}
                    </div>
                  ))}
                </div>

                {/* 装備効果サマリー */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <h3 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
                    <TrendingUp size={20} />
                    装備効果合計
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    {Object.entries(currentEffects).map(([stat, value]) => (
                      <div key={stat} className="text-center">
                        <div className="text-2xl font-bold text-blue-600">+{value}{stat === 'experience_boost' ? '%' : ''}</div>
                        <div className="text-sm text-blue-800">
                          {stat === 'serve_skill' ? 'サーブ' :
                           stat === 'return_skill' ? 'リターン' :
                           stat === 'volley_skill' ? 'ボレー' :
                           stat === 'stroke_skill' ? 'ストローク' :
                           stat === 'mental' ? 'メンタル' :
                           stat === 'stamina' ? 'スタミナ' :
                           stat === 'experience_boost' ? '経験値' : stat}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'inventory' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-800">所持アイテム</h2>
                
                {/* フィルターとソート */}
                <div className="flex gap-4">
                  <select className="px-3 py-2 border border-gray-300 rounded-lg">
                    <option>すべてのカテゴリー</option>
                    <option>ラケット</option>
                    <option>シューズ</option>
                    <option>アクセサリー</option>
                    <option>ポケモンアイテム</option>
                  </select>
                  <select className="px-3 py-2 border border-gray-300 rounded-lg">
                    <option>レア度順</option>
                    <option>名前順</option>
                    <option>効果順</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availableEquipment.slice(0, 6).map(equipment => (
                    <EquipmentCard 
                      key={equipment.id} 
                      equipment={equipment}
                      showComparison={true}
                    />
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'shop' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-800">ショップ</h2>
                  <div className="text-lg font-bold text-green-600">
                    💰 {playerFunds.toLocaleString()}円
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availableEquipment.map(equipment => (
                    <EquipmentCard 
                      key={equipment.id} 
                      equipment={equipment}
                      showComparison={true}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 右側: 詳細パネル */}
          <div className="w-80 bg-gray-50 border-l border-gray-200 p-6">
            <div className="sticky top-0">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Info size={20} />
                詳細情報
              </h3>
              
              {selectedEquipment ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl mb-2">{selectedEquipment.icon}</div>
                    <h4 className="font-bold text-lg">{selectedEquipment.name}</h4>
                    <div className={`inline-block px-2 py-1 rounded-full text-xs font-bold ${getRarityStyle(selectedEquipment.rarity)}`}>
                      {selectedEquipment.rarity.toUpperCase()}
                    </div>
                  </div>

                  <p className="text-sm text-gray-600">{selectedEquipment.description}</p>

                  {/* 装備ボタン */}
                  <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                    <Target size={18} />
                    装備する
                  </button>

                  {activeTab === 'shop' && (
                    <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
                      💰 {selectedEquipment.price.toLocaleString()}円で購入
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  アイテムを選択してください
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}