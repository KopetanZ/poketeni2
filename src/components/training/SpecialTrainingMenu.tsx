'use client';

import { useState } from 'react';
import { Player } from '@/types/game';
import { PokemonStats } from '@/types/pokemon-stats';

interface SpecialTrainingMenuProps {
  players: Player[];
  onPlayerSelect: (player: Player) => void;
  onTrainingStart: (player: Player, trainingType: TrainingType) => void;
}

type TrainingType = 
  | 'intensive_serve'
  | 'return_mastery'
  | 'net_tactics'
  | 'baseline_power'
  | 'mental_training'
  | 'stamina_drill'
  | 'iv_training'
  | 'ability_awakening';

interface TrainingOption {
  id: TrainingType;
  name: string;
  description: string;
  icon: string;
  cost: number;
  duration: number; // 日数
  requirements?: {
    min_level?: number;
    required_stats?: Partial<Record<keyof Player, number>>;
    required_ability?: string;
  };
  effects: {
    stat_boosts: Partial<Record<string, number>>;
    experience: number;
    special_effects?: string[];
  };
}

const trainingOptions: TrainingOption[] = [
  {
    id: 'intensive_serve',
    name: '🎯 集中サーブ練習',
    description: 'サーブ技術を徹底的に鍛える特別メニュー',
    icon: '🎾',
    cost: 100,
    duration: 3,
    requirements: { min_level: 5 },
    effects: {
      stat_boosts: { serve_skill: 8, mental: 2 },
      experience: 50,
      special_effects: ['サーブエース確率+5%']
    }
  },
  {
    id: 'return_mastery',
    name: '🛡️ リターンマスタリー',
    description: 'あらゆるサーブに対応するリターン技術を習得',
    icon: '⚔️',
    cost: 120,
    duration: 4,
    requirements: { min_level: 8 },
    effects: {
      stat_boosts: { return_skill: 10, volley_skill: 3 },
      experience: 60,
      special_effects: ['ブレイクポイント成功率+10%']
    }
  },
  {
    id: 'net_tactics',
    name: '🏐 ネット戦術',
    description: 'ネットプレーの基本から応用まで完全マスター',
    icon: '🏐',
    cost: 150,
    duration: 5,
    requirements: { min_level: 10 },
    effects: {
      stat_boosts: { volley_skill: 12, serve_skill: 2 },
      experience: 75,
      special_effects: ['ボレー決定力+15%']
    }
  },
  {
    id: 'baseline_power',
    name: '💪 ベースライン強化',
    description: 'パワフルなストロークでコートを支配',
    icon: '💥',
    cost: 140,
    duration: 4,
    requirements: { min_level: 12 },
    effects: {
      stat_boosts: { stroke_skill: 10, stamina: 4 },
      experience: 70,
      special_effects: ['ウィナー確率+8%']
    }
  },
  {
    id: 'mental_training',
    name: '🧘 メンタル強化',
    description: 'プレッシャーに負けない強靭な精神力を養成',
    icon: '🧠',
    cost: 200,
    duration: 6,
    requirements: { min_level: 15 },
    effects: {
      stat_boosts: { mental: 15, stamina: 5 },
      experience: 100,
      special_effects: ['重要ポイント成功率+20%', 'プレッシャー耐性+25%']
    }
  },
  {
    id: 'stamina_drill',
    name: '🏃 スタミナドリル',
    description: '長時間の激しい試合にも対応できる体力を構築',
    icon: '💨',
    cost: 80,
    duration: 2,
    requirements: { min_level: 3 },
    effects: {
      stat_boosts: { stamina: 12, mental: 3 },
      experience: 40,
      special_effects: ['疲労回復速度+30%']
    }
  },
  {
    id: 'iv_training',
    name: '⭐ 個体値強化',
    description: 'ポケモンの潜在能力を限界まで引き出す特殊トレーニング',
    icon: '✨',
    cost: 500,
    duration: 10,
    requirements: { min_level: 20 },
    effects: {
      stat_boosts: { serve_skill: 5, return_skill: 5, volley_skill: 5, stroke_skill: 5 },
      experience: 200,
      special_effects: ['個体値+1~3ランダム上昇', '全能力+5%']
    }
  },
  {
    id: 'ability_awakening',
    name: '🌟 特性覚醒',
    description: '隠された特性を覚醒させる秘伝のトレーニング',
    icon: '🔮',
    cost: 800,
    duration: 14,
    requirements: { min_level: 25 },
    effects: {
      stat_boosts: { mental: 10, stamina: 10 },
      experience: 300,
      special_effects: ['新特性習得可能性', '既存特性強化', '覚醒状態獲得']
    }
  }
];

export default function SpecialTrainingMenu({ players, onPlayerSelect, onTrainingStart }: SpecialTrainingMenuProps) {
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [selectedTraining, setSelectedTraining] = useState<TrainingOption | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handlePlayerSelect = (player: Player) => {
    setSelectedPlayer(player);
    onPlayerSelect(player);
  };

  const canPerformTraining = (player: Player, training: TrainingOption): boolean => {
    if (training.requirements?.min_level && player.level < training.requirements.min_level) {
      return false;
    }
    
    if (training.requirements?.required_stats) {
      for (const [stat, minValue] of Object.entries(training.requirements.required_stats)) {
        const playerValue = (player as any)[stat] || 0;
        if (playerValue < minValue) return false;
      }
    }
    
    return true;
  };

  const startTraining = () => {
    if (selectedPlayer && selectedTraining) {
      onTrainingStart(selectedPlayer, selectedTraining.id);
      setShowConfirmation(false);
      setSelectedTraining(null);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center">
          🏋️ 特別練習メニュー
        </h2>
        <div className="text-sm text-slate-400">
          選手を選んで特別な練習を開始しましょう
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 左側：選手選択 */}
        <div className="bg-gradient-to-br from-slate-700/30 to-slate-800/30 rounded-2xl p-6 border border-slate-600/50">
          <h3 className="text-lg font-semibold text-white mb-4">👥 練習する選手を選択</h3>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {players.map(player => (
              <div
                key={player.id}
                className={`p-4 rounded-xl cursor-pointer transition-all duration-200 border-2 ${
                  selectedPlayer?.id === player.id
                    ? 'bg-blue-600/20 border-blue-400/50 shadow-lg'
                    : 'bg-slate-600/30 border-slate-500/30 hover:bg-slate-600/50 hover:border-slate-400/50'
                }`}
                onClick={() => handlePlayerSelect(player)}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    player.pokemon_stats?.is_shiny 
                      ? 'bg-gradient-to-br from-yellow-400 to-orange-500' 
                      : 'bg-gradient-to-br from-blue-500 to-purple-500'
                  }`}>
                    <span className="text-xl">
                      {player.pokemon_stats?.is_shiny ? '✨' : '⚡'}
                    </span>
                  </div>
                  
                  <div className="flex-1">
                    <div className="font-bold text-white">{player.pokemon_name}</div>
                    <div className="text-sm text-slate-300">
                      Lv.{player.level} - {player.condition}
                    </div>
                    <div className="flex space-x-3 text-xs mt-1">
                      <span className="text-red-400">サーブ:{player.pokemon_stats?.final_stats.serve_skill || player.serve_skill}</span>
                      <span className="text-blue-400">リターン:{player.pokemon_stats?.final_stats.return_skill || player.return_skill}</span>
                      <span className="text-green-400">ボレー:{player.pokemon_stats?.final_stats.volley_skill || player.volley_skill}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 右側：練習メニュー */}
        <div className="bg-gradient-to-br from-slate-700/30 to-slate-800/30 rounded-2xl p-6 border border-slate-600/50">
          <h3 className="text-lg font-semibold text-white mb-4">🎯 特別練習メニュー</h3>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {trainingOptions.map(training => {
              const canPerform = selectedPlayer ? canPerformTraining(selectedPlayer, training) : false;
              
              return (
                <div
                  key={training.id}
                  className={`p-4 rounded-xl transition-all duration-200 border-2 ${
                    !selectedPlayer
                      ? 'bg-slate-700/50 border-slate-600/50 opacity-50'
                      : !canPerform
                      ? 'bg-red-900/20 border-red-600/30 opacity-60'
                      : selectedTraining?.id === training.id
                      ? 'bg-green-600/20 border-green-400/50 shadow-lg cursor-pointer'
                      : 'bg-slate-600/30 border-slate-500/30 hover:bg-slate-600/50 hover:border-slate-400/50 cursor-pointer'
                  }`}
                  onClick={() => selectedPlayer && canPerform && setSelectedTraining(training)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl">{training.icon}</div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-white text-sm">{training.name}</h4>
                        <div className="text-right">
                          <div className="text-xs text-yellow-400">💰 {training.cost}</div>
                          <div className="text-xs text-slate-400">{training.duration}日</div>
                        </div>
                      </div>
                      
                      <p className="text-xs text-slate-300 mb-2 line-clamp-2">
                        {training.description}
                      </p>
                      
                      {training.requirements && (
                        <div className="text-xs text-slate-400 mb-2">
                          必要条件: 
                          {training.requirements.min_level && ` Lv.${training.requirements.min_level}以上`}
                        </div>
                      )}
                      
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(training.effects.stat_boosts).map(([stat, boost]) => (
                          <span key={stat} className="bg-blue-600/20 text-blue-300 text-xs px-2 py-1 rounded">
                            {stat}+{boost}
                          </span>
                        ))}
                        {training.effects.experience > 0 && (
                          <span className="bg-green-600/20 text-green-300 text-xs px-2 py-1 rounded">
                            EXP+{training.effects.experience}
                          </span>
                        )}
                      </div>
                      
                      {!canPerform && selectedPlayer && (
                        <div className="text-xs text-red-400 mt-1">
                          条件を満たしていません
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 開始ボタン */}
          {selectedPlayer && selectedTraining && (
            <div className="mt-4 pt-4 border-t border-slate-600/50">
              <button
                onClick={() => setShowConfirmation(true)}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white py-3 rounded-xl font-bold text-lg transition-all duration-200 hover:scale-105"
              >
                {selectedTraining.name}を開始
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 確認モーダル */}
      {showConfirmation && selectedPlayer && selectedTraining && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-600/50 shadow-2xl max-w-md w-full m-4">
            <div className="p-6">
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">{selectedTraining.icon}</div>
                <h3 className="text-xl font-bold text-white">{selectedTraining.name}</h3>
                <div className="text-sm text-slate-400 mt-1">
                  {selectedPlayer.pokemon_name} の特別練習
                </div>
              </div>

              <div className="bg-slate-700/50 rounded-lg p-4 mb-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">期間:</span>
                  <span className="text-white">{selectedTraining.duration}日間</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">費用:</span>
                  <span className="text-yellow-400">💰 {selectedTraining.cost}</span>
                </div>
                <div className="text-sm">
                  <span className="text-slate-400">効果:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {Object.entries(selectedTraining.effects.stat_boosts).map(([stat, boost]) => (
                      <span key={stat} className="bg-green-600/20 text-green-300 text-xs px-2 py-1 rounded">
                        {stat}+{boost}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="text-center text-sm text-slate-300 mb-6">
                この特別練習を開始しますか？
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="flex-1 bg-slate-600 hover:bg-slate-500 text-white py-2 rounded-lg transition-colors"
                >
                  キャンセル
                </button>
                <button
                  onClick={startTraining}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white py-2 rounded-lg font-semibold transition-all"
                >
                  開始する
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}