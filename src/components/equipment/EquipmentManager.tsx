'use client';

import { useState, useEffect } from 'react';
import { Player } from '@/types/game';
import { GameBalanceManager } from '@/lib/game-balance-manager';
import { supabase } from '@/lib/supabase';
import { Building2, Sword, Shirt, Zap, Heart, Brain } from 'lucide-react';

interface EquipmentManagerProps {
  player: Player;
  onPlayerUpdate: (player: Player) => void;
  onClose: () => void;
}

interface Equipment {
  id: string;
  name: string;
  type: 'facility' | 'equipment';
  category: string;
  description: string;
  cost: number;
  growthBonus: number;
  icon: React.ReactNode;
}

const AVAILABLE_EQUIPMENT: Equipment[] = [
  // 設備
  {
    id: 'basic_court',
    name: '基本コート',
    type: 'facility',
    category: 'court',
    description: '標準的なテニスコート。基本的な練習が可能。',
    cost: 1000,
    growthBonus: 0.1,
    icon: <Building2 className="w-6 h-6" />
  },
  {
    id: 'advanced_court',
    name: '上級コート',
    type: 'facility',
    category: 'court',
    description: '高品質なテニスコート。練習効率が大幅に向上。',
    cost: 5000,
    growthBonus: 0.3,
    icon: <Building2 className="w-6 h-6" />
  },
  {
    id: 'training_equipment',
    name: '練習用具',
    type: 'facility',
    category: 'equipment',
    description: 'ボールマシンやネットなどの練習用具。',
    cost: 2000,
    growthBonus: 0.2,
    icon: <Zap className="w-6 h-6" />
  },
  {
    id: 'coaching_staff',
    name: 'コーチ陣',
    type: 'facility',
    category: 'staff',
    description: '専門コーチによる指導。成長効率が向上。',
    cost: 3000,
    growthBonus: 0.25,
    icon: <Brain className="w-6 h-6" />
  },
  {
    id: 'medical_support',
    name: '医療サポート',
    type: 'facility',
    category: 'medical',
    description: '怪我の予防と回復サポート。',
    cost: 1500,
    growthBonus: 0.15,
    icon: <Heart className="w-6 h-6" />
  },
  
  // 道具
  {
    id: 'basic_racket',
    name: '基本ラケット',
    type: 'equipment',
    category: 'racket',
    description: '標準的なテニスラケット。',
    cost: 500,
    growthBonus: 0.05,
    icon: <Sword className="w-6 h-6" />
  },
  {
    id: 'advanced_racket',
    name: '上級ラケット',
    type: 'equipment',
    category: 'racket',
    description: '高品質なテニスラケット。練習効率が向上。',
    cost: 2000,
    growthBonus: 0.2,
    icon: <Sword className="w-6 h-6" />
  },
  {
    id: 'training_shoes',
    name: '練習シューズ',
    type: 'equipment',
    category: 'shoes',
    description: 'テニス専用の練習シューズ。',
    cost: 800,
    growthBonus: 0.1,
    icon: <Shirt className="w-6 h-6" />
  },
  {
    id: 'sports_drink',
    name: 'スポーツドリンク',
    type: 'equipment',
    category: 'consumable',
    description: '練習後の回復を促進。',
    cost: 100,
    growthBonus: 0.05,
    icon: <Heart className="w-6 h-6" />
  },
  {
    id: 'recovery_item',
    name: '回復アイテム',
    type: 'equipment',
    category: 'consumable',
    description: '疲労回復と成長促進。',
    cost: 300,
    growthBonus: 0.1,
    icon: <Zap className="w-6 h-6" />
  }
];

export default function EquipmentManager({ player, onPlayerUpdate, onClose }: EquipmentManagerProps) {
  const [funds, setFunds] = useState(10000);
  const [ownedEquipment, setOwnedEquipment] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // 現在の設備・道具を取得
    if (player.growth_efficiency) {
      // 成長効率から逆算して所有設備を推定
      const estimatedEquipment = estimateOwnedEquipment(player.growth_efficiency);
      setOwnedEquipment(estimatedEquipment);
    }
  }, [player]);

  // 成長効率から所有設備を推定
  const estimateOwnedEquipment = (growthEfficiency: Player['growth_efficiency']): string[] => {
    const equipment: string[] = [];
    const baseEfficiency = 0.1; // 初期効率
    
    // 各スキルの効率から設備を推定
    Object.entries(growthEfficiency).forEach(([key, efficiency]) => {
      const bonus = efficiency - baseEfficiency;
      if (bonus > 0) {
        // ボーナスに応じて設備を追加
        if (bonus >= 0.3) equipment.push('advanced_court');
        if (bonus >= 0.2) equipment.push('training_equipment');
        if (bonus >= 0.25) equipment.push('coaching_staff');
        if (bonus >= 0.15) equipment.push('medical_support');
        if (bonus >= 0.2) equipment.push('advanced_racket');
        if (bonus >= 0.1) equipment.push('training_shoes');
        if (bonus >= 0.05) equipment.push('basic_racket');
      }
    });
    
    return [...new Set(equipment)]; // 重複除去
  };

  const handlePurchaseEquipment = async (equipment: Equipment) => {
    if (isProcessing) return;
    if (funds < equipment.cost) {
      alert('資金が不足しています');
      return;
    }
    if (ownedEquipment.includes(equipment.id)) {
      alert('既に所有しています');
      return;
    }

    setIsProcessing(true);

    try {
      // 新しい設備・道具を追加
      const newOwnedEquipment = [...ownedEquipment, equipment.id];
      
      // 成長効率を更新
      const newGrowthEfficiency = GameBalanceManager.updateGrowthEfficiency(
        player,
        newOwnedEquipment.filter(id => AVAILABLE_EQUIPMENT.find(e => e.id === id)?.type === 'facility'),
        newOwnedEquipment.filter(id => AVAILABLE_EQUIPMENT.find(e => e.id === id)?.type === 'equipment')
      );

      // プレイヤーを更新
      const updatedPlayer = {
        ...player,
        growth_efficiency: newGrowthEfficiency
      };

      // データベースに保存
      await supabase
        .from('players')
        .update({
          growth_efficiency: newGrowthEfficiency
        })
        .eq('id', player.id);

      // 状態を更新
      setOwnedEquipment(newOwnedEquipment);
      setFunds(prev => prev - equipment.cost);
      onPlayerUpdate(updatedPlayer);

      alert(`${equipment.name}を購入しました！\n成長効率が向上しました。`);

    } catch (error) {
      console.error('Equipment purchase error:', error);
      alert('購入中にエラーが発生しました');
    } finally {
      setIsProcessing(false);
    }
  };

  const getCurrentGrowthEfficiency = () => {
    if (!player.growth_efficiency) return null;
    
    const efficiency = GameBalanceManager.getGrowthEfficiencyDisplay(player);
    return efficiency;
  };

  const currentEfficiency = getCurrentGrowthEfficiency();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">🏗️ 設備・道具管理</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* 現在の状況 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-blue-50 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">💰 資金</h3>
            <p className="text-2xl font-bold text-blue-600">¥{funds.toLocaleString()}</p>
          </div>
          
          <div className="bg-green-50 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">📊 成長効率</h3>
            <p className="text-lg font-medium text-green-600">
              {currentEfficiency?.overall || '未設定'}
            </p>
          </div>
          
          <div className="bg-purple-50 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">🏆 所有設備</h3>
            <p className="text-lg font-medium text-purple-600">{ownedEquipment.length}個</p>
          </div>
        </div>

        {/* 成長効率詳細 */}
        {currentEfficiency && (
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">📈 詳細な成長効率</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(currentEfficiency.details).map(([key, detail]) => (
                <div key={key} className="text-center">
                  <div className="text-lg font-bold text-gray-800">
                    {(detail.efficiency * 100).toFixed(0)}%
                  </div>
                  <div className="text-xs text-gray-600">{detail.description}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 設備・道具一覧 */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-800">🛒 購入可能な設備・道具</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {AVAILABLE_EQUIPMENT.map((equipment) => {
              const isOwned = ownedEquipment.includes(equipment.id);
              const canAfford = funds >= equipment.cost;
              
              return (
                <div
                  key={equipment.id}
                  className={`border rounded-xl p-4 transition-all ${
                    isOwned 
                      ? 'bg-green-50 border-green-300' 
                      : canAfford 
                        ? 'bg-white border-gray-300 hover:border-blue-400' 
                        : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center mb-3">
                    <div className="text-blue-600 mr-3">{equipment.icon}</div>
                    <div>
                      <h4 className="font-semibold text-gray-800">{equipment.name}</h4>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        equipment.type === 'facility' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {equipment.type === 'facility' ? '設備' : '道具'}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">{equipment.description}</p>
                  
                  <div className="flex justify-between items-center">
                    <div className="text-sm">
                      <span className="text-gray-500">成長効率: </span>
                      <span className="font-medium text-green-600">+{(equipment.growthBonus * 100).toFixed(0)}%</span>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-800">¥{equipment.cost.toLocaleString()}</div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handlePurchaseEquipment(equipment)}
                    disabled={isOwned || !canAfford || isProcessing}
                    className={`w-full mt-3 py-2 px-4 rounded-lg font-medium transition-colors ${
                      isOwned
                        ? 'bg-green-500 text-white cursor-not-allowed'
                        : canAfford
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    }`}
                  >
                    {isOwned ? '✓ 所有済み' : canAfford ? '購入' : '資金不足'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* 栄冠ナイン式システム説明 */}
        <div className="mt-6 p-4 bg-blue-50 rounded-xl">
          <h4 className="text-lg font-semibold text-blue-800 mb-2">💡 栄冠ナイン式成長システム</h4>
          <p className="text-sm text-blue-700">
            初期状態では成長効率が非常に低く、練習してもほとんど成長しません。
            設備・道具を購入することで成長効率が向上し、より効率的に選手を育てることができます。
            3年かけてオールB、設備整備後にオールA・Sランク選手の育成が可能になります。
          </p>
        </div>
      </div>
    </div>
  );
}