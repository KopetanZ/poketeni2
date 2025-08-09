'use client';

import { useState, useEffect } from 'react';
import { PokemonStats, EffortValues } from '@/types/pokemon-stats';
import { PokemonStatsCalculator } from '@/lib/pokemon-stats-calculator';

interface EffortValueTrainerProps {
  pokemonStats: PokemonStats;
  onClose: () => void;
  onApply: (newEVs: EffortValues) => void;
}

// 努力値配分プリセット
const EV_PRESETS = {
  balanced: {
    name: 'バランス型',
    description: '全能力均等に配分',
    evs: { hp: 85, attack: 85, defense: 85, sp_attack: 85, sp_defense: 85, speed: 85 }
  },
  offensive: {
    name: 'アタッカー型',
    description: 'サーブ・ボレー特化',
    evs: { hp: 4, attack: 252, defense: 0, sp_attack: 252, sp_defense: 0, speed: 2 }
  },
  defensive: {
    name: '守備型',
    description: 'リターン・ストローク特化',
    evs: { hp: 252, attack: 0, defense: 252, sp_attack: 0, sp_defense: 6, speed: 0 }
  },
  speedy: {
    name: 'スピード型',
    description: 'スタミナ重視',
    evs: { hp: 4, attack: 0, defense: 0, sp_attack: 0, sp_defense: 252, speed: 252 }
  },
  tank: {
    name: 'タンク型',
    description: 'メンタル・リターン重視',
    evs: { hp: 252, attack: 0, defense: 252, sp_attack: 0, sp_defense: 6, speed: 0 }
  },
  technical: {
    name: 'テクニック型',
    description: 'ボレー・スタミナ重視',
    evs: { hp: 6, attack: 0, defense: 0, sp_attack: 252, sp_defense: 0, speed: 252 }
  },
  physical: {
    name: 'フィジカル型',
    description: 'サーブ・スタミナ重視',
    evs: { hp: 6, attack: 252, defense: 0, sp_attack: 0, sp_defense: 0, speed: 252 }
  }
} as const;

export default function EffortValueTrainer({ pokemonStats, onClose, onApply }: EffortValueTrainerProps) {
  const [editingEVs, setEditingEVs] = useState<EffortValues>({ ...pokemonStats.effort_values });
  const [totalEVs, setTotalEVs] = useState(pokemonStats.effort_total);
  const [previewStats, setPreviewStats] = useState(pokemonStats.final_stats);

  // 努力値変更時のプレビュー更新
  useEffect(() => {
    const newTotal = Object.values(editingEVs).reduce((sum, val) => sum + val, 0);
    setTotalEVs(newTotal);

    // プレビュー用の一時的なポケモンステータス作成
    const tempStats: PokemonStats = {
      ...pokemonStats,
      effort_values: editingEVs,
      effort_total: newTotal
    };

    // プレビュー能力値を計算
    const preview = PokemonStatsCalculator.calculateFinalStats(tempStats);
    setPreviewStats(preview);
  }, [editingEVs, pokemonStats]);

  // 個別の努力値を変更
  const updateEV = (stat: keyof EffortValues, value: number) => {
    const newValue = Math.max(0, Math.min(255, value));
    const newEVs = { ...editingEVs, [stat]: newValue };
    const newTotal = Object.values(newEVs).reduce((sum, val) => sum + val, 0);
    
    if (newTotal <= 510) {
      setEditingEVs(newEVs);
    }
  };

  // プリセット適用
  const applyPreset = (preset: typeof EV_PRESETS[keyof typeof EV_PRESETS]) => {
    setEditingEVs(preset.evs);
  };

  // リセット
  const resetEVs = () => {
    const resetEVs = { hp: 0, attack: 0, defense: 0, sp_attack: 0, sp_defense: 0, speed: 0 };
    setEditingEVs(resetEVs);
  };

  // 残り努力値を均等配分
  const distributeRemaining = () => {
    const remaining = 510 - totalEVs;
    if (remaining <= 0) return;

    const perStat = Math.floor(remaining / 6);
    const extra = remaining % 6;
    
    const newEVs = { ...editingEVs };
    const stats: (keyof EffortValues)[] = ['hp', 'attack', 'defense', 'sp_attack', 'sp_defense', 'speed'];
    
    stats.forEach((stat, index) => {
      const addition = perStat + (index < extra ? 1 : 0);
      newEVs[stat] = Math.min(255, newEVs[stat] + addition);
    });
    
    setEditingEVs(newEVs);
  };

  const getStatDifference = (current: number, preview: number) => {
    const diff = preview - current;
    if (diff > 0) return `+${diff}`;
    if (diff < 0) return `${diff}`;
    return '±0';
  };

  const getStatDifferenceColor = (current: number, preview: number) => {
    const diff = preview - current;
    if (diff > 0) return 'text-green-600';
    if (diff < 0) return 'text-red-600';
    return 'text-gray-500';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full m-4 max-h-[90vh] overflow-hidden">
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold">💪 努力値振り分け</h2>
              <p className="mt-2 opacity-90">{pokemonStats.pokemon_name}の能力を戦略的にカスタマイズ</p>
            </div>
            <button
              onClick={onClose}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors font-semibold"
            >
              ✕ 閉じる
            </button>
          </div>
          
          <div className="mt-4 flex items-center justify-between">
            <div className="text-lg">
              使用努力値: <span className="font-bold">{totalEVs}/510</span>
            </div>
            <div className="flex space-x-2">
              {totalEVs > 510 && (
                <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold">
                  ⚠️ 上限超過
                </span>
              )}
              {totalEVs === 510 && (
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                  ✅ 上限まで使用
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex">
          {/* 左側: 努力値調整 */}
          <div className="w-2/3 p-6 border-r">
            {/* プリセット */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-3">📋 配分プリセット</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {Object.entries(EV_PRESETS).map(([key, preset]) => (
                  <button
                    key={key}
                    onClick={() => applyPreset(preset)}
                    className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-2 rounded text-xs font-semibold transition-colors"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
              
              <div className="mt-3 flex space-x-2">
                <button
                  onClick={resetEVs}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded text-sm font-semibold transition-colors"
                >
                  🔄 リセット
                </button>
                <button
                  onClick={distributeRemaining}
                  disabled={totalEVs >= 510}
                  className={`px-4 py-2 rounded text-sm font-semibold transition-colors ${
                    totalEVs >= 510 
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-green-100 hover:bg-green-200 text-green-800'
                  }`}
                >
                  ⚡ 残り均等配分
                </button>
              </div>
            </div>

            {/* 努力値調整スライダー */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-800">🎚️ 個別調整</h3>
              
              {Object.entries({
                hp: { name: 'HP (メンタル)', color: 'orange', tennis: 'メンタル力' },
                attack: { name: '攻撃 (サーブ)', color: 'red', tennis: 'サーブ力' },
                defense: { name: '防御 (リターン)', color: 'blue', tennis: 'リターン力' },
                sp_attack: { name: '特攻 (ボレー)', color: 'green', tennis: 'ボレー力' },
                sp_defense: { name: '特防 (ストローク)', color: 'purple', tennis: 'ストローク力' },
                speed: { name: '素早 (スタミナ)', color: 'indigo', tennis: 'スタミナ' }
              }).map(([stat, info]) => {
                const statKey = stat as keyof EffortValues;
                const currentValue = editingEVs[statKey];
                
                return (
                  <div key={stat} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <span className="font-semibold text-gray-700">{info.name}</span>
                        <span className="text-sm text-gray-500 ml-2">→ {info.tennis}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          min="0"
                          max="255"
                          value={currentValue}
                          onChange={(e) => updateEV(statKey, parseInt(e.target.value) || 0)}
                          className="w-16 px-2 py-1 border rounded text-center text-sm"
                        />
                        <span className="text-sm text-gray-500">/ 255</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <input
                        type="range"
                        min="0"
                        max="255"
                        value={currentValue}
                        onChange={(e) => updateEV(statKey, parseInt(e.target.value))}
                        className={`flex-1 slider-${info.color}`}
                      />
                      <div className="w-20 text-right">
                        <div className={`text-${info.color}-600 font-bold`}>
                          +{Math.floor(currentValue / 4)}
                        </div>
                        <div className="text-xs text-gray-500">実質上昇</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 右側: プレビュー */}
          <div className="w-1/3 p-6 bg-gray-50">
            <h3 className="text-lg font-bold text-gray-800 mb-4">📊 能力値プレビュー</h3>
            
            <div className="space-y-3">
              {Object.entries({
                serve_skill: { name: 'サーブ力', current: pokemonStats.final_stats.serve_skill },
                return_skill: { name: 'リターン力', current: pokemonStats.final_stats.return_skill },
                volley_skill: { name: 'ボレー力', current: pokemonStats.final_stats.volley_skill },
                stroke_skill: { name: 'ストローク力', current: pokemonStats.final_stats.stroke_skill },
                mental: { name: 'メンタル力', current: pokemonStats.final_stats.mental },
                stamina: { name: 'スタミナ', current: pokemonStats.final_stats.stamina }
              }).map(([stat, info]) => {
                const statKey = stat as keyof typeof previewStats;
                const preview = previewStats[statKey];
                const difference = getStatDifference(info.current, preview);
                const colorClass = getStatDifferenceColor(info.current, preview);
                
                return (
                  <div key={stat} className="bg-white rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-700">{info.name}</span>
                      <div className="text-right">
                        <div className="font-bold text-lg">{preview}</div>
                        <div className={`text-sm ${colorClass}`}>
                          ({difference})
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${Math.min(preview / 150 * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 適用ボタン */}
            <div className="mt-6 space-y-3">
              <button
                onClick={() => onApply(editingEVs)}
                disabled={totalEVs > 510}
                className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                  totalEVs > 510
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
              >
                💪 努力値を適用
              </button>
              
              <div className="text-center">
                <div className="text-sm text-gray-600">
                  合計能力上昇: <span className="font-semibold">
                    +{Object.values(previewStats).reduce((sum, val) => sum + val, 0) - 
                       Object.values(pokemonStats.final_stats).reduce((sum, val) => sum + val, 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}