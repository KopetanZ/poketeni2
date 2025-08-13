'use client';

import { useState, useEffect } from 'react';
import { Player } from '@/types/game';
import { ExperienceBalanceSystem, ExperienceHelpers } from '@/lib/experience-balance-system';
import { EvolutionSystem } from '@/lib/evolution-system';
import { EvolutionModal } from '@/components/evolution/EvolutionModal';
import { GameBalanceManager } from '@/lib/game-balance-manager';
import { supabase } from '@/lib/supabase';
import { Timer, Zap, Brain, Heart, Star, Users } from 'lucide-react';

interface TrainingMenuProps {
  player: Player;
  onPlayerUpdate: (player: Player) => void;
  onClose: () => void;
}

interface TrainingOption {
  id: 'basic' | 'technical' | 'mental' | 'stamina' | 'special';
  name: string;
  description: string;
  icon: React.ReactNode;
  cost: number;
  effects: string[];
  color: string;
}

const TRAINING_OPTIONS: TrainingOption[] = [
  {
    id: 'basic',
    name: '基礎練習',
    description: 'テニスの基本を反復練習します',
    icon: <Timer className="w-6 h-6" />,
    cost: 0,
    effects: ['全体的な技術向上', '経験値+2'],
    color: 'bg-gray-100 border-gray-300'
  },
  {
    id: 'technical',
    name: '技術練習',
    description: 'ストロークやボレーの技術を磨きます',
    icon: <Zap className="w-6 h-6" />,
    cost: 100,
    effects: ['ストローク・ボレー特化', '経験値+3'],
    color: 'bg-blue-100 border-blue-300'
  },
  {
    id: 'mental',
    name: 'メンタル練習',
    description: '集中力と精神力を鍛えます',
    icon: <Brain className="w-6 h-6" />,
    cost: 150,
    effects: ['メンタル強化', '経験値+2'],
    color: 'bg-purple-100 border-purple-300'
  },
  {
    id: 'stamina',
    name: '体力練習',
    description: '持久力とフィジカルを強化します',
    icon: <Heart className="w-6 h-6" />,
    cost: 100,
    effects: ['スタミナ向上', '経験値+3'],
    color: 'bg-red-100 border-red-300'
  },
  {
    id: 'special',
    name: '特別練習',
    description: 'コーチによる個別指導を受けます',
    icon: <Star className="w-6 h-6" />,
    cost: 300,
    effects: ['全体的な大幅向上', '経験値+5'],
    color: 'bg-yellow-100 border-yellow-300'
  }
];

export default function TrainingMenu({ player, onPlayerUpdate, onClose }: TrainingMenuProps) {
  const [todayProgress, setTodayProgress] = useState(ExperienceHelpers.getTodayProgress());
  const [isTraining, setIsTraining] = useState(false);
  const [funds, setFunds] = useState(5000); // 暫定的な資金
  const [showEvolutionModal, setShowEvolutionModal] = useState(false);
  const [evolutionTarget, setEvolutionTarget] = useState<Player | null>(null);

  useEffect(() => {
    // 定期的に今日の進捗を更新
    const interval = setInterval(() => {
      setTodayProgress(ExperienceHelpers.getTodayProgress());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleTraining = async (trainingType: TrainingOption) => {
    if (isTraining) return;
    
    if (trainingType.cost > funds) {
      alert('資金が不足しています');
      return;
    }

    setIsTraining(true);

    try {
      // 栄冠ナイン式ステータスゲージシステム処理
      const targetSkills = getTargetSkillsForTraining(trainingType.id);
      const gageResult = GameBalanceManager.processPracticeGageGain(
        player,
        getPracticeType(trainingType.id),
        targetSkills
      );

      // 経験値獲得の試行
      const expResult = ExperienceBalanceSystem.gainExperienceFromTraining(
        player,
        trainingType.id,
        1.0 // 標準品質（今後カードシステム等で変動）
      );

      if (!expResult.can_train) {
        alert(expResult.reason || '練習できません');
        return;
      }

      // プレイヤーに経験値適用
      const updatedPlayer = ExperienceBalanceSystem.applyExperienceGain(player, expResult.exp_gained);
      
      // ステータスゲージとステータス上昇を適用
      const playerWithGages = {
        ...updatedPlayer,
        stat_gages: {
          ...(updatedPlayer.stat_gages || {}),
          ...gageResult.gageGains
        },
        ...gageResult.statIncreases
      };
      
      // 追加の練習効果（基本ステータス微調整）
      const trainingEffects = getTrainingEffects(trainingType.id, playerWithGages);
      const finalPlayer = { ...playerWithGages, ...trainingEffects };

      // 資金減少
      setFunds(prev => prev - trainingType.cost);

      // モチベーション調整
      finalPlayer.motivation = Math.min(100, (finalPlayer.motivation || 50) + Math.floor(Math.random() * 3) + 1);

      // 永続化（練習による能力と経験値の更新）
      try {
        await supabase
          .from('players')
          .update({
            serve_skill: finalPlayer.serve_skill,
            return_skill: finalPlayer.return_skill,
            volley_skill: finalPlayer.volley_skill,
            stroke_skill: finalPlayer.stroke_skill,
            mental: finalPlayer.mental,
            stamina: finalPlayer.stamina,
            motivation: finalPlayer.motivation,
            experience: finalPlayer.experience,
            level: finalPlayer.level,
            // ステータスゲージも保存（JSONとして）
            stat_gages: finalPlayer.stat_gages,
            growth_efficiency: finalPlayer.growth_efficiency
          })
          .eq('id', finalPlayer.id);
      } catch (e) {
        console.error('Failed to persist training update:', e);
      }

      onPlayerUpdate(finalPlayer);
      setTodayProgress(ExperienceHelpers.getTodayProgress());

      // 成功通知（ステータスゲージ情報も含める）
      const messages = [
        `${trainingType.name}を実施しました`,
        `経験値 +${expResult.exp_gained}`,
        trainingType.cost > 0 ? `費用: -${trainingType.cost}円` : null
      ];

      // ステータス上昇があった場合の通知
      const statIncreases = Object.keys(gageResult.statIncreases);
      if (statIncreases.length > 0) {
        messages.push(`🎉 ステータス上昇: ${statIncreases.join(', ')}`);
      }

      // ゲージ進行状況の通知
      const gageProgress = Object.entries(gageResult.gageGains)
        .filter(([_, value]) => value > 0)
        .map(([key, value]) => {
          const skillName = key.replace('_gage', '').replace(/_/g, ' ');
          return `${skillName}: +${value}`;
        });
      
      if (gageProgress.length > 0) {
        messages.push(`⚡ ゲージ進行: ${gageProgress.join(', ')}`);
      }

      alert(messages.filter(Boolean).join('\n'));

      // レベルアップ通知 + 進化判定
      if ((finalPlayer as any).leveledUp) {
        alert(`🎉 ${player.pokemon_name}がレベルアップしました！\nレベル${finalPlayer.level}になりました！`);
        const evalResult = EvolutionSystem.canEvolve(finalPlayer);
        if (evalResult.canEvolve) {
          setEvolutionTarget(finalPlayer);
          setShowEvolutionModal(true);
        }
      }

    } catch (error) {
      console.error('Training error:', error);
      alert('練習中にエラーが発生しました');
    } finally {
      setIsTraining(false);
    }
  };

  // 練習タイプに応じた対象スキルを取得
  const getTargetSkillsForTraining = (trainingType: string): Array<keyof Player['stat_gages']> => {
    switch (trainingType) {
      case 'basic':
        return ['serve_skill_gage', 'return_skill_gage', 'stroke_skill_gage', 'volley_skill_gage', 'mental_gage', 'stamina_gage'];
      case 'technical':
        return ['stroke_skill_gage', 'volley_skill_gage'];
      case 'mental':
        return ['mental_gage'];
      case 'stamina':
        return ['stamina_gage'];
      case 'special':
        return ['serve_skill_gage', 'return_skill_gage', 'stroke_skill_gage', 'volley_skill_gage', 'mental_gage', 'stamina_gage'];
      default:
        return ['serve_skill_gage', 'return_skill_gage', 'stroke_skill_gage', 'volley_skill_gage', 'mental_gage', 'stamina_gage'];
    }
  };

  // 練習タイプを栄冠ナイン式の練習タイプに変換
  const getPracticeType = (trainingType: string): 'individual' | 'team' | 'match' | 'special' => {
    switch (trainingType) {
      case 'basic':
      case 'technical':
      case 'mental':
      case 'stamina':
        return 'individual';
      case 'special':
        return 'special';
      default:
        return 'individual';
    }
  };

  const getTrainingEffects = (trainingType: string, player: Player) => {
    const effects: Partial<Player> = {};
    const baseGain = 1; // 基本上昇値

    switch (trainingType) {
      case 'basic':
        // 全体的に少し向上
        effects.serve_skill = (player.serve_skill || 0) + Math.floor(Math.random() * 2);
        effects.return_skill = (player.return_skill || 0) + Math.floor(Math.random() * 2);
        break;
      
      case 'technical':
        // ストロークとボレーに特化
        effects.stroke_skill = (player.stroke_skill || 0) + Math.floor(Math.random() * 3) + 1;
        effects.volley_skill = (player.volley_skill || 0) + Math.floor(Math.random() * 3) + 1;
        break;
      
      case 'mental':
        // メンタルに特化
        effects.mental = (player.mental || 0) + Math.floor(Math.random() * 4) + 2;
        break;
      
      case 'stamina':
        // スタミナに特化
        effects.stamina = (player.stamina || 0) + Math.floor(Math.random() * 4) + 2;
        break;
      
      case 'special':
        // 全体的に大幅向上
        effects.serve_skill = (player.serve_skill || 0) + Math.floor(Math.random() * 3) + 1;
        effects.return_skill = (player.return_skill || 0) + Math.floor(Math.random() * 3) + 1;
        effects.volley_skill = (player.volley_skill || 0) + Math.floor(Math.random() * 3) + 1;
        effects.stroke_skill = (player.stroke_skill || 0) + Math.floor(Math.random() * 3) + 1;
        effects.mental = (player.mental || 0) + Math.floor(Math.random() * 2) + 1;
        effects.stamina = (player.stamina || 0) + Math.floor(Math.random() * 2) + 1;
        break;
    }

    return effects;
  };

  const remaining = todayProgress.remaining;

  return (
    <>
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">練習メニュー</h1>
              <p className="text-green-100">{player.pokemon_name} の特訓</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-300 transition-colors text-xl"
            >
              ✕
            </button>
          </div>
        </div>

        {/* 今日の進捗 */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Users size={20} />
            今日の活動状況
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="font-bold text-blue-600">{todayProgress.練習回数}</div>
              <div className="text-gray-600">練習回数</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-purple-600">{todayProgress.練習試合}</div>
              <div className="text-gray-600">練習試合</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-green-600">{todayProgress.経験値}</div>
              <div className="text-gray-600">経験値</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-orange-600">¥{funds.toLocaleString()}</div>
              <div className="text-gray-600">資金</div>
            </div>
          </div>
        </div>

        {/* 練習オプション */}
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">練習メニューを選択</h2>
          
          {remaining.training_sessions === 0 && (
            <div className="bg-yellow-100 border border-yellow-400 rounded-lg p-4 mb-4">
              <p className="text-yellow-800">今日の練習はもう十分です。明日また頑張りましょう！</p>
            </div>
          )}

          {remaining.exp_capacity === 0 && (
            <div className="bg-orange-100 border border-orange-400 rounded-lg p-4 mb-4">
              <p className="text-orange-800">今日の経験値上限に達しました。休息も大切です。</p>
            </div>
          )}

          <div className="grid gap-4">
            {TRAINING_OPTIONS.map(option => {
              const canTrain = remaining.training_sessions > 0 && remaining.exp_capacity > 0;
              const canAfford = option.cost <= funds;
              const isDisabled = !canTrain || !canAfford || isTraining;

              return (
                <div
                  key={option.id}
                  className={`p-4 rounded-xl border-2 transition-all ${option.color} ${
                    isDisabled ? 'opacity-50' : 'hover:shadow-md cursor-pointer'
                  }`}
                  onClick={() => !isDisabled && handleTraining(option)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="text-gray-600 mt-1">{option.icon}</div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-800">{option.name}</h3>
                        <p className="text-gray-600 text-sm mb-2">{option.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {option.effects.map((effect, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-white bg-opacity-50 rounded text-xs text-gray-700"
                            >
                              {effect}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-800">
                        {option.cost > 0 ? `¥${option.cost.toLocaleString()}` : '無料'}
                      </div>
                      {!canAfford && option.cost > 0 && (
                        <div className="text-red-500 text-xs">資金不足</div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* フッター */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <p className="text-sm text-gray-600 text-center">
            💡 練習は計画的に行いましょう。バランスの取れた成長が重要です。
          </p>
        </div>
      </div>
    </div>
    {evolutionTarget && (
      <EvolutionModal
        player={evolutionTarget}
        isOpen={showEvolutionModal}
        onClose={() => setShowEvolutionModal(false)}
        onEvolutionComplete={(evolved) => {
          // 進化後の永続化
          (async () => {
            try {
              await supabase
                .from('players')
                .update({
                  pokemon_name: evolved.pokemon_name,
                  pokemon_id: evolved.pokemon_id,
                  level: evolved.level,
                  serve_skill: evolved.serve_skill,
                  return_skill: evolved.return_skill,
                  volley_skill: evolved.volley_skill,
                  stroke_skill: evolved.stroke_skill,
                  mental: evolved.mental,
                  stamina: evolved.stamina,
                  condition: evolved.condition,
                  motivation: evolved.motivation,
                  experience: evolved.experience,
                  types: evolved.types || null,
                  special_abilities: evolved.special_abilities || [],
                  pokemon_stats: evolved.pokemon_stats || null
                })
                .eq('id', evolved.id);
            } catch (e) {
              console.error('Failed to persist evolved player:', e);
            }
          })();

          onPlayerUpdate(evolved);
          setShowEvolutionModal(false);
          setEvolutionTarget(null);
        }}
      />
    )}
    </>
  );
}

// 進化モーダルの描画（ルート内）
/* JSX is above; append modal at end of component tree */