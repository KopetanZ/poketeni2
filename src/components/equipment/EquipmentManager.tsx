'use client';

import { useState, useEffect } from 'react';
import { Player } from '@/types/game';
import { Equipment, PlayerEquipment } from '@/types/items';
import { RACKET_EQUIPMENT_EXPANDED } from '@/lib/items-database-expanded';
import { AdvancedEquipmentManager } from './AdvancedEquipmentManager';
import { EquipmentWorkshop } from './EquipmentWorkshop';
import { EquipmentEffectsCalculator } from '@/lib/equipment-effects';
import { Wrench, Package, X } from 'lucide-react';

interface EquipmentManagerProps {
  player: Player;
  onClose: () => void;
  onEquipmentChange: (playerId: string, equipment: PlayerEquipment) => void;
}

export default function EquipmentManager({ player, onClose, onEquipmentChange }: EquipmentManagerProps) {
  const [activeView, setActiveView] = useState<'main' | 'workshop'>('main');
  const [playerEquipment, setPlayerEquipment] = useState<PlayerEquipment>({
    player_id: player.id,
    racket: undefined,
    shoes: undefined,
    accessory: undefined,
    pokemon_item: undefined
  });
  const [playerFunds, setPlayerFunds] = useState(15000); // 暫定的な資金

  useEffect(() => {
    loadPlayerData();
  }, []);

  const loadPlayerData = () => {
    // 暫定的なデータ読み込み（実際はデータベースから）
    setPlayerEquipment({
      player_id: player.id,
      racket: RACKET_EQUIPMENT_EXPANDED[0], // 初期装備
      shoes: undefined,
      accessory: undefined,
      pokemon_item: undefined
    });
  };

  const handleEquipmentUpdate = (newEquipment: PlayerEquipment) => {
    setPlayerEquipment(newEquipment);
    onEquipmentChange(player.id, newEquipment);
  };

  const handleFundsUpdate = (newFunds: number) => {
    setPlayerFunds(newFunds);
  };

  // メインビューの選択画面
  if (activeView === 'main') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
          {/* ヘッダー */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">装備システム</h1>
                <p className="text-blue-100">{player.pokemon_name} の装備管理</p>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-300 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* 現在の装備ステータス */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold mb-4">現在の装備効果</h2>
            <div className="grid grid-cols-2 gap-4">
              {(() => {
                const effects = EquipmentEffectsCalculator.calculateTotalEffects(playerEquipment);
                return Object.entries(effects).filter(([key]) => key !== 'special_abilities').map(([stat, value]) => (
                  <div key={stat} className="flex justify-between">
                    <span className="text-gray-600">
                      {stat === 'serve_skill' ? 'サーブ' :
                       stat === 'return_skill' ? 'リターン' :
                       stat === 'volley_skill' ? 'ボレー' :
                       stat === 'stroke_skill' ? 'ストローク' :
                       stat === 'mental' ? 'メンタル' :
                       stat === 'stamina' ? 'スタミナ' :
                       stat === 'experience_boost' ? '経験値ボーナス' : stat}:
                    </span>
                    <span className="font-bold text-green-600">
                      +{value}{stat === 'experience_boost' ? '%' : ''}
                    </span>
                  </div>
                ));
              })()}
            </div>
          </div>

          {/* メニューオプション */}
          <div className="p-6 space-y-4">
            <button
              onClick={() => setActiveView('workshop')}
              className="w-full flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl hover:from-green-100 hover:to-blue-100 transition-colors"
            >
              <Package className="text-blue-600" size={32} />
              <div className="text-left">
                <h3 className="font-bold text-gray-800">装備管理</h3>
                <p className="text-gray-600 text-sm">装備の変更・確認・購入</p>
              </div>
            </button>

            <button
              onClick={() => setActiveView('workshop')}
              className="w-full flex items-center gap-4 p-4 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl hover:from-orange-100 hover:to-red-100 transition-colors"
            >
              <Wrench className="text-orange-600" size={32} />
              <div className="text-left">
                <h3 className="font-bold text-gray-800">装備工房</h3>
                <p className="text-gray-600 text-sm">修理・強化・エンハンス</p>
              </div>
            </button>
          </div>

          {/* 装備プレビュー */}
          <div className="p-6 bg-gray-50 rounded-b-2xl">
            <h3 className="font-semibold text-gray-800 mb-3">現在の装備</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { slot: 'racket', name: 'ラケット', icon: '🎾' },
                { slot: 'shoes', name: 'シューズ', icon: '👟' },
                { slot: 'accessory', name: 'アクセサリー', icon: '💎' },
                { slot: 'pokemon_item', name: 'ポケモンアイテム', icon: '🔮' }
              ].map(slot => {
                const item = playerEquipment[slot.slot as keyof PlayerEquipment];
                return (
                  <div key={slot.slot} className="flex items-center gap-2 p-2 bg-white rounded-lg">
                    <div className="text-xl">{slot.icon}</div>
                    <div className="flex-1">
                      <div className="text-xs text-gray-600">{slot.name}</div>
                      <div className="text-sm font-medium">
                        {item ? (item as Equipment).name : '未装備'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 工房ビュー
  if (activeView === 'workshop') {
    return (
      <AdvancedEquipmentManager
        player={player}
        onClose={() => setActiveView('main')}
        onEquipmentChange={(playerId: string, equipment: PlayerEquipment) => handleEquipmentUpdate(equipment)}
        availableEquipment={RACKET_EQUIPMENT_EXPANDED}
        availableConsumables={[]}
        playerFunds={playerFunds}
      />
    );
  }

  return null;
}