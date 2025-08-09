'use client';

import React, { useState } from 'react';
import { Equipment, PlayerEquipment } from '@/types/items';
import { EquipmentEffectsCalculator, EquipmentDisplayHelpers } from '@/lib/equipment-effects';
import { 
  Wrench, 
  Zap, 
  TrendingUp, 
  DollarSign, 
  AlertTriangle,
  CheckCircle,
  Hammer,
  Sparkles,
  X
} from 'lucide-react';

interface EquipmentWorkshopProps {
  playerEquipment: PlayerEquipment;
  playerFunds: number;
  onClose: () => void;
  onEquipmentUpdate: (equipment: PlayerEquipment) => void;
  onFundsUpdate: (newFunds: number) => void;
}

export function EquipmentWorkshop({
  playerEquipment,
  playerFunds,
  onClose,
  onEquipmentUpdate,
  onFundsUpdate
}: EquipmentWorkshopProps) {
  const [activeTab, setActiveTab] = useState<'repair' | 'upgrade' | 'enhance'>('repair');
  const [selectedItem, setSelectedItem] = useState<Equipment | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<keyof PlayerEquipment | null>(null);
  const [confirmAction, setConfirmAction] = useState<string | null>(null);

  // 修理が必要なアイテムを取得
  const getRepairableItems = (): { item: Equipment; slot: keyof PlayerEquipment }[] => {
    const items: { item: Equipment; slot: keyof PlayerEquipment }[] = [];
    
    Object.entries(playerEquipment).forEach(([slot, item]) => {
      if (item && item.durability && item.durability.current < item.durability.max) {
        items.push({ item, slot: slot as keyof PlayerEquipment });
      }
    });
    
    return items;
  };

  const repairableItems = getRepairableItems();

  // 修理処理
  const handleRepair = (item: Equipment, slot: keyof PlayerEquipment, repairType: 'partial' | 'full') => {
    if (!item.durability) return;

    const repairAmount = repairType === 'full' 
      ? item.durability.max - item.durability.current
      : Math.min(20, item.durability.max - item.durability.current);
    
    const cost = repairType === 'full'
      ? EquipmentEffectsCalculator.calculateRepairCost(item)
      : Math.floor(EquipmentEffectsCalculator.calculateRepairCost(item) * 0.3);

    if (playerFunds < cost) {
      alert('資金が不足しています');
      return;
    }

    const repairedItem = EquipmentEffectsCalculator.repairEquipment(item, repairAmount);
    const newEquipment = { ...playerEquipment, [slot]: repairedItem };
    
    onEquipmentUpdate(newEquipment);
    onFundsUpdate(playerFunds - cost);
    setConfirmAction(null);
    setSelectedItem(null);
  };

  // 強化処理（未実装のプレースホルダー）
  const handleUpgrade = (item: Equipment, slot: keyof PlayerEquipment) => {
    alert('装備強化システムは今後実装予定です！');
  };

  // エンハンス処理（未実装のプレースホルダー）
  const handleEnhance = (item: Equipment, slot: keyof PlayerEquipment) => {
    alert('装備エンハンスシステムは今後実装予定です！');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Hammer size={32} />
              <div>
                <h1 className="text-2xl font-bold">装備工房</h1>
                <p className="text-orange-100">修理・強化・エンハンス</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-orange-100">所持金</div>
                <div className="text-xl font-bold">💰 {playerFunds.toLocaleString()}円</div>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-300 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
          </div>
        </div>

        {/* タブナビゲーション */}
        <div className="bg-gray-100 px-6 py-4">
          <div className="flex space-x-4">
            {[
              { id: 'repair', name: '修理', icon: Wrench, description: '装備の耐久性を回復' },
              { id: 'upgrade', name: '強化', icon: TrendingUp, description: '装備の性能向上' },
              { id: 'enhance', name: 'エンハンス', icon: Sparkles, description: '特殊効果付与' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-orange-600 text-white'
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

        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {activeTab === 'repair' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-800">装備修理</h2>
              
              {repairableItems.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="mx-auto text-green-500 mb-4" size={48} />
                  <p className="text-gray-600 text-lg">すべての装備が完璧な状態です！</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {repairableItems.map(({ item, slot }) => {
                    const condition = EquipmentEffectsCalculator.getEquipmentCondition(item);
                    const fullRepairCost = EquipmentEffectsCalculator.calculateRepairCost(item);
                    const partialRepairCost = Math.floor(fullRepairCost * 0.3);
                    
                    return (
                      <div
                        key={`${slot}-${item.id}`}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="text-3xl">{item.icon}</div>
                            <div>
                              <h3 className="font-bold text-lg">{item.name}</h3>
                              <div className="flex items-center gap-2">
                                <span className={`text-sm font-medium ${condition.color}`}>
                                  {condition.description}
                                </span>
                                <span className="text-sm text-gray-500">
                                  ({item.durability?.current}/{item.durability?.max})
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            {/* 部分修理 */}
                            <button
                              onClick={() => {
                                setSelectedItem(item);
                                setSelectedSlot(slot);
                                setConfirmAction('partial-repair');
                              }}
                              className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                              disabled={playerFunds < partialRepairCost}
                            >
                              部分修理<br />💰{partialRepairCost.toLocaleString()}円
                            </button>
                            
                            {/* 完全修理 */}
                            <button
                              onClick={() => {
                                setSelectedItem(item);
                                setSelectedSlot(slot);
                                setConfirmAction('full-repair');
                              }}
                              className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                              disabled={playerFunds < fullRepairCost}
                            >
                              完全修理<br />💰{fullRepairCost.toLocaleString()}円
                            </button>
                          </div>
                        </div>
                        
                        {/* 耐久性バー */}
                        <div className="mt-3">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all ${
                                condition.condition === 'excellent' ? 'bg-green-500' :
                                condition.condition === 'good' ? 'bg-blue-500' :
                                condition.condition === 'fair' ? 'bg-yellow-500' :
                                condition.condition === 'poor' ? 'bg-red-500' :
                                'bg-gray-500'
                              }`}
                              style={{ 
                                width: `${((item.durability?.current || 0) / (item.durability?.max || 1)) * 100}%` 
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'upgrade' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-800">装備強化</h2>
              <div className="text-center py-12">
                <TrendingUp className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-600 text-lg mb-4">装備強化システム</p>
                <p className="text-gray-500">今後のアップデートで実装予定です</p>
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="font-bold text-blue-800 mb-2">予定機能:</h3>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• 装備のステータスボーナス向上</li>
                    <li>• 強化レベルシステム (+1 ~ +10)</li>
                    <li>• 強化素材の導入</li>
                    <li>• 強化失敗のリスク</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'enhance' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-800">装備エンハンス</h2>
              <div className="text-center py-12">
                <Sparkles className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-600 text-lg mb-4">装備エンハンスシステム</p>
                <p className="text-gray-500">今後のアップデートで実装予定です</p>
                <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <h3 className="font-bold text-purple-800 mb-2">予定機能:</h3>
                  <ul className="text-sm text-purple-700 space-y-1">
                    <li>• 特殊効果の付与</li>
                    <li>• エンチャントストーン使用</li>
                    <li>• 希少効果のランダム付与</li>
                    <li>• セット効果の強化</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 確認ダイアログ */}
        {confirmAction && selectedItem && selectedSlot && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
              <h3 className="font-bold text-lg mb-4">修理確認</h3>
              
              <div className="flex items-center gap-3 mb-4">
                <div className="text-3xl">{selectedItem.icon}</div>
                <div>
                  <div className="font-semibold">{selectedItem.name}</div>
                  <div className="text-sm text-gray-600">
                    {confirmAction === 'partial-repair' ? '部分修理' : '完全修理'}を実行しますか？
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg mb-4">
                <div className="text-sm">
                  <div className="flex justify-between">
                    <span>修理費用:</span>
                    <span className="font-bold">
                      💰{(confirmAction === 'partial-repair' 
                        ? Math.floor(EquipmentEffectsCalculator.calculateRepairCost(selectedItem) * 0.3)
                        : EquipmentEffectsCalculator.calculateRepairCost(selectedItem)
                      ).toLocaleString()}円
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>修理後耐久性:</span>
                    <span>
                      {confirmAction === 'partial-repair' 
                        ? `${Math.min(selectedItem.durability!.max, selectedItem.durability!.current + 20)}/${selectedItem.durability!.max}`
                        : `${selectedItem.durability!.max}/${selectedItem.durability!.max}`
                      }
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmAction(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  キャンセル
                </button>
                <button
                  onClick={() => handleRepair(
                    selectedItem, 
                    selectedSlot, 
                    confirmAction === 'partial-repair' ? 'partial' : 'full'
                  )}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  修理実行
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}