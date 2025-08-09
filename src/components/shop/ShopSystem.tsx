'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useGameData } from '@/hooks/useGameData';
import { ITEMS_DATABASE, RARITY_COLORS, EFFECT_TRANSLATIONS } from '@/lib/items-database';
import { BaseItem, Equipment, ConsumableItem, FacilityItem, SpecialItem } from '@/types/items';

interface ShopSystemProps {
  onClose: () => void;
}

type ShopTab = 'equipment' | 'consumables' | 'facilities' | 'specials';

export default function ShopSystem({ onClose }: ShopSystemProps) {
  const { user } = useAuth();
  const { gameData } = useGameData();
  const [activeTab, setActiveTab] = useState<ShopTab>('equipment');
  const [purchasePoints, setPurchasePoints] = useState(0);
  const [selectedItem, setSelectedItem] = useState<BaseItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    // 戦績ポイントを計算（簡単な実装）
    // 実際のアプリでは試合勝利数から計算
    if (gameData.school) {
      const estimatedWins = Math.floor(gameData.school.reputation / 10);
      setPurchasePoints(estimatedWins * 100 + gameData.school.funds * 0.1);
    }
  }, [gameData]);

  const getTabItems = (tab: ShopTab): BaseItem[] => {
    switch (tab) {
      case 'equipment': return ITEMS_DATABASE.equipment;
      case 'consumables': return ITEMS_DATABASE.consumables;
      case 'facilities': return ITEMS_DATABASE.facilities;
      case 'specials': return ITEMS_DATABASE.specials;
      default: return [];
    }
  };

  const handlePurchase = async (item: BaseItem) => {
    if (!user || !gameData.school) {
      setMessage('認証エラーが発生しました');
      return;
    }

    if (purchasePoints < item.price) {
      setMessage('戦績ポイントが不足しています');
      return;
    }

    setLoading(true);
    try {
      // ここで実際の購入処理を実装
      // 現在は簡単なシミュレーション
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setPurchasePoints(prev => prev - item.price);
      setMessage(`${item.name}を購入しました！`);
      setSelectedItem(null);
      
      // 5秒後にメッセージをクリア
      setTimeout(() => setMessage(null), 5000);
    } catch (error) {
      console.error('Purchase error:', error);
      setMessage('購入に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const renderItemEffects = (item: BaseItem) => {
    if (item.category === 'equipment') {
      const equipment = item as Equipment;
      return (
        <div className="text-xs text-gray-600 space-y-1">
          {Object.entries(equipment.effects).map(([key, value]) => {
            if (value === 0) return null;
            const effectName = EFFECT_TRANSLATIONS[key as keyof typeof EFFECT_TRANSLATIONS] || key;
            const sign = typeof value === 'number' && value > 0 ? '+' : '';
            const suffix = key === 'experience_boost' ? '%' : '';
            return (
              <div key={key} className="flex justify-between">
                <span>{effectName}:</span>
                <span className={value && value > 0 ? 'text-green-600' : 'text-red-600'}>
                  {sign}{value}{suffix}
                </span>
              </div>
            );
          })}
          {equipment.durability && (
            <div className="flex justify-between text-gray-500">
              <span>耐久値:</span>
              <span>{equipment.durability.max}</span>
            </div>
          )}
        </div>
      );
    }

    if (item.category === 'facility') {
      const facility = item as FacilityItem;
      return (
        <div className="text-xs text-gray-600 space-y-1">
          {Object.entries(facility.effects).map(([key, value]) => {
            if (value === 0 || value === undefined) return null;
            const effectName = EFFECT_TRANSLATIONS[key as keyof typeof EFFECT_TRANSLATIONS] || key;
            if (Array.isArray(value)) {
              return (
                <div key={key}>
                  <span className="text-blue-600">特別練習解放:</span>
                  <div className="ml-2">{value.join(', ')}</div>
                </div>
              );
            }
            const suffix = typeof value === 'number' && key.includes('efficiency') || key.includes('prevention') || key.includes('maintenance') ? '%' : '';
            return (
              <div key={key} className="flex justify-between">
                <span>{effectName}:</span>
                <span className="text-green-600">+{value}{suffix}</span>
              </div>
            );
          })}
          <div className="flex justify-between text-gray-500">
            <span>耐久値:</span>
            <span>{facility.durability.max}</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>最大レベル:</span>
            <span>{facility.maxLevel}</span>
          </div>
        </div>
      );
    }

    return null;
  };

  const getTabName = (tab: ShopTab) => {
    switch (tab) {
      case 'equipment': return '装備品';
      case 'consumables': return '消耗品';
      case 'facilities': return '施設';
      case 'specials': return '特殊';
      default: return '';
    }
  };

  const getTabIcon = (tab: ShopTab) => {
    switch (tab) {
      case 'equipment': return '🎾';
      case 'consumables': return '💊';
      case 'facilities': return '🏗️';
      case 'specials': return '✨';
      default: return '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full m-4 max-h-[90vh] overflow-hidden">
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold">🏪 ポケテニショップ</h2>
              <p className="text-indigo-100 mt-2">栄冠ナイン式アイテム商店</p>
            </div>
            <div className="text-right">
              <div className="text-yellow-200 text-lg font-semibold">
                戦績ポイント: {Math.floor(purchasePoints).toLocaleString()}P
              </div>
              <button
                onClick={onClose}
                className="mt-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors font-semibold shadow-lg"
              >
                ✕ 閉じる
              </button>
            </div>
          </div>
        </div>

        {/* メッセージ */}
        {message && (
          <div className={`p-4 ${message.includes('失敗') || message.includes('不足') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
            <div className="text-center font-semibold">{message}</div>
          </div>
        )}

        <div className="flex h-[calc(90vh-200px)]">
          {/* サイドバー（タブ） */}
          <div className="w-1/4 bg-gray-50 border-r">
            <div className="p-4">
              <h3 className="font-bold text-gray-700 mb-4">商品カテゴリ</h3>
              <div className="space-y-2">
                {(['equipment', 'consumables', 'facilities', 'specials'] as ShopTab[]).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      activeTab === tab
                        ? 'bg-indigo-100 text-indigo-700 font-semibold'
                        : 'bg-white hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <span className="mr-2">{getTabIcon(tab)}</span>
                    {getTabName(tab)}
                    <div className="text-xs text-gray-500 mt-1">
                      {getTabItems(tab).length}個の商品
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* メインコンテンツ */}
          <div className="flex-1 overflow-y-auto p-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">
              {getTabIcon(activeTab)} {getTabName(activeTab)}商品
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getTabItems(activeTab).map(item => (
                <div 
                  key={item.id}
                  className="bg-white rounded-xl border-2 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-bold text-lg text-gray-800">{item.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl mb-2">{item.icon}</div>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${RARITY_COLORS[item.rarity]}`}>
                          {item.rarity}
                        </span>
                      </div>
                    </div>

                    {/* アイテム効果 */}
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      {renderItemEffects(item)}
                    </div>

                    {/* 価格と購入ボタン */}
                    <div className="flex justify-between items-center">
                      <div className="text-xl font-bold text-indigo-600">
                        {item.price.toLocaleString()}P
                      </div>
                      <button
                        onClick={() => handlePurchase(item)}
                        disabled={loading || purchasePoints < item.price}
                        className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                          purchasePoints >= item.price && !loading
                            ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {loading ? '購入中...' : purchasePoints >= item.price ? '購入' : 'ポイント不足'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {getTabItems(activeTab).length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">このカテゴリの商品はありません</p>
              </div>
            )}
          </div>
        </div>

        {/* フッター */}
        <div className="bg-gray-50 px-6 py-4 border-t">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <div>💡 戦績ポイントは試合に勝利することで獲得できます</div>
            <div>🛡️ 装備には耐久値があり、試合で消耗します</div>
          </div>
        </div>
      </div>
    </div>
  );
}