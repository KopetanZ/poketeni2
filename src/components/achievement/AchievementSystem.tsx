'use client';

import { useState, useEffect } from 'react';
import { Player } from '@/types/game';

interface Achievement {
  id: string;
  name: string;
  description: string;
  category: 'training' | 'battle' | 'collection' | 'special' | 'growth';
  rarity: 'bronze' | 'silver' | 'gold' | 'platinum' | 'legendary';
  icon: string;
  requirements: {
    type: 'level' | 'matches_won' | 'total_stats' | 'shiny_count' | 'evolution_count' | 'special';
    target: number;
    description: string;
  }[];
  rewards: {
    funds?: number;
    reputation?: number;
    items?: string[];
    title?: string;
  };
  unlocked: boolean;
  progress: number; // 0-100
  unlockedAt?: Date;
}

interface GrowthRecord {
  date: string;
  player_id: string;
  before_stats: Record<string, number>;
  after_stats: Record<string, number>;
  growth_type: 'level_up' | 'evolution' | 'training' | 'equipment' | 'iv_boost';
  details: string;
}

interface AchievementSystemProps {
  players: Player[];
  growthHistory?: GrowthRecord[];
  schoolStats: {
    totalMatches: number;
    totalWins: number;
    reputation: number;
    funds: number;
  };
  onAchievementUnlock: (achievement: Achievement) => void;
}

const achievementTemplates: Omit<Achievement, 'unlocked' | 'progress' | 'unlockedAt'>[] = [
  // 成長系
  {
    id: 'first_evolution',
    name: '🌟 初めての進化',
    description: 'ポケモンを初めて進化させました',
    category: 'growth',
    rarity: 'bronze',
    icon: '🌟',
    requirements: [
      {
        type: 'evolution_count',
        target: 1,
        description: 'ポケモンを1体進化させる'
      }
    ],
    rewards: {
      funds: 500,
      reputation: 5,
      items: ['evolution_stone']
    }
  },
  {
    id: 'level_master',
    name: '⭐ レベルマスター',
    description: 'レベル30に到達したポケモンを育成しました',
    category: 'growth',
    rarity: 'gold',
    icon: '⭐',
    requirements: [
      {
        type: 'level',
        target: 30,
        description: 'ポケモンのレベルを30まで上げる'
      }
    ],
    rewards: {
      funds: 2000,
      reputation: 20,
      items: ['master_certificate'],
      title: 'レベルマスター'
    }
  },
  {
    id: 'shiny_collector',
    name: '✨ 色違いコレクター',
    description: '色違いポケモンを3体集めました',
    category: 'collection',
    rarity: 'platinum',
    icon: '✨',
    requirements: [
      {
        type: 'shiny_count',
        target: 3,
        description: '色違いポケモンを3体集める'
      }
    ],
    rewards: {
      funds: 5000,
      reputation: 50,
      items: ['shiny_charm', 'rare_candy'],
      title: '色違いハンター'
    }
  },
  // バトル系
  {
    id: 'first_victory',
    name: '🏆 初勝利',
    description: '最初の対戦で勝利を収めました',
    category: 'battle',
    rarity: 'bronze',
    icon: '🏆',
    requirements: [
      {
        type: 'matches_won',
        target: 1,
        description: '対戦で1勝する'
      }
    ],
    rewards: {
      funds: 200,
      reputation: 3
    }
  },
  {
    id: 'battle_veteran',
    name: '⚔️ 戦闘のベテラン',
    description: '100勝を達成した熟練の指導者',
    category: 'battle',
    rarity: 'gold',
    icon: '⚔️',
    requirements: [
      {
        type: 'matches_won',
        target: 100,
        description: '対戦で100勝する'
      }
    ],
    rewards: {
      funds: 3000,
      reputation: 30,
      items: ['battle_trophy'],
      title: 'バトルマスター'
    }
  },
  // 特殊系
  {
    id: 'team_harmony',
    name: '🤝 チームハーモニー',
    description: '全選手の能力値が平均80以上に到達',
    category: 'special',
    rarity: 'platinum',
    icon: '🤝',
    requirements: [
      {
        type: 'total_stats',
        target: 80,
        description: '全選手の平均能力値80以上'
      }
    ],
    rewards: {
      funds: 10000,
      reputation: 100,
      items: ['team_medal', 'harmony_crystal'],
      title: 'チームマスター'
    }
  },
  {
    id: 'legendary_trainer',
    name: '👑 伝説の指導者',
    description: '全ての基本実績を解除した真の指導者',
    category: 'special',
    rarity: 'legendary',
    icon: '👑',
    requirements: [
      {
        type: 'special',
        target: 10,
        description: '他の実績を10個以上解除'
      }
    ],
    rewards: {
      funds: 20000,
      reputation: 200,
      items: ['legendary_crown', 'master_key'],
      title: '伝説の指導者'
    }
  }
];

export default function AchievementSystem({ players, growthHistory = [], schoolStats, onAchievementUnlock }: AchievementSystemProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [newUnlocks, setNewUnlocks] = useState<Achievement[]>([]);

  // 実績の進捗計算
  const calculateProgress = (template: typeof achievementTemplates[0]): { progress: number; unlocked: boolean } => {
    let totalProgress = 0;
    let completedRequirements = 0;

    template.requirements.forEach(req => {
      let currentValue = 0;

      switch (req.type) {
        case 'level':
          currentValue = Math.max(...players.map(p => p.level));
          break;
        case 'matches_won':
          currentValue = schoolStats.totalWins;
          break;
        case 'shiny_count':
          currentValue = players.filter(p => p.pokemon_stats?.is_shiny).length;
          break;
        case 'evolution_count':
          // TODO: 進化カウントのトラッキング実装
          currentValue = players.filter(p => p.level >= 16).length; // 暫定
          break;
        case 'total_stats':
          const averageStats = players.length > 0 ? players.reduce((sum, p) => {
            const totalStat = (
              (p.pokemon_stats?.final_stats.serve_skill || p.serve_skill) +
              (p.pokemon_stats?.final_stats.return_skill || p.return_skill) +
              (p.pokemon_stats?.final_stats.volley_skill || p.volley_skill) +
              (p.pokemon_stats?.final_stats.stroke_skill || p.stroke_skill) +
              (p.pokemon_stats?.final_stats.mental || p.mental) +
              (p.pokemon_stats?.final_stats.stamina || p.stamina)
            ) / 6;
            return sum + totalStat;
          }, 0) / players.length : 0;
          currentValue = Math.round(averageStats);
          break;
        case 'special':
          currentValue = achievements.filter(a => a.unlocked).length;
          break;
      }

      const reqProgress = Math.min(100, (currentValue / req.target) * 100);
      totalProgress += reqProgress;

      if (reqProgress >= 100) {
        completedRequirements++;
      }
    });

    const progress = Math.floor(totalProgress / template.requirements.length);
    const unlocked = completedRequirements === template.requirements.length;

    return { progress, unlocked };
  };

  // 実績更新
  useEffect(() => {
    const updatedAchievements = achievementTemplates.map(template => {
      const existing = achievements.find(a => a.id === template.id);
      const { progress, unlocked } = calculateProgress(template);

      const achievement: Achievement = {
        ...template,
        progress,
        unlocked,
        unlockedAt: existing?.unlockedAt || (unlocked && !existing?.unlocked ? new Date() : undefined)
      };

      // 新規解除チェック
      if (unlocked && !existing?.unlocked) {
        setTimeout(() => {
          setNewUnlocks(prev => [...prev, achievement]);
          onAchievementUnlock(achievement);
        }, 500);
      }

      return achievement;
    });

    setAchievements(updatedAchievements);
  }, [players, schoolStats, growthHistory]);

  const filteredAchievements = achievements.filter(achievement => {
    const matchesFilter = filter === 'all' || 
                         (filter === 'unlocked' && achievement.unlocked) ||
                         (filter === 'locked' && !achievement.unlocked);
    
    const matchesCategory = categoryFilter === 'all' || achievement.category === categoryFilter;
    
    return matchesFilter && matchesCategory;
  });

  const getRarityColor = (rarity: Achievement['rarity']): string => {
    switch (rarity) {
      case 'bronze': return 'from-amber-600 to-yellow-600';
      case 'silver': return 'from-gray-400 to-slate-500';
      case 'gold': return 'from-yellow-400 to-orange-500';
      case 'platinum': return 'from-purple-500 to-indigo-600';
      case 'legendary': return 'from-pink-500 to-purple-600';
      default: return 'from-gray-500 to-slate-600';
    }
  };

  const getRarityBorder = (rarity: Achievement['rarity']): string => {
    switch (rarity) {
      case 'bronze': return 'border-amber-500';
      case 'silver': return 'border-gray-400';
      case 'gold': return 'border-yellow-400';
      case 'platinum': return 'border-purple-400';
      case 'legendary': return 'border-pink-400';
      default: return 'border-gray-500';
    }
  };

  const categories = [
    { id: 'all', name: '全て', icon: '📜' },
    { id: 'growth', name: '成長', icon: '📈' },
    { id: 'battle', name: 'バトル', icon: '⚔️' },
    { id: 'collection', name: 'コレクション', icon: '📚' },
    { id: 'training', name: '練習', icon: '🎾' },
    { id: 'special', name: '特殊', icon: '⭐' }
  ];

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;
  const completionRate = Math.round((unlockedCount / totalCount) * 100);

  return (
    <div className="h-full flex flex-col">
      {/* ヘッダー */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center">
            🏅 実績・アチーブメント
          </h2>
          <div className="text-sm text-slate-400 mt-1">
            {unlockedCount}/{totalCount} 解除済み ({completionRate}%)
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-400/30 rounded-xl px-4 py-2">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{completionRate}%</div>
            <div className="text-xs text-purple-300">達成率</div>
          </div>
        </div>
      </div>

      {/* フィルター */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex space-x-2">
          {['all', 'unlocked', 'locked'].map(filterType => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType as any)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                filter === filterType
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-600/30 text-slate-300 hover:bg-slate-600/50'
              }`}
            >
              {filterType === 'all' ? '全て' : 
               filterType === 'unlocked' ? '解除済み' : '未解除'}
            </button>
          ))}
        </div>

        <div className="flex space-x-2">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setCategoryFilter(category.id)}
              className={`px-3 py-2 rounded-lg font-semibold transition-all text-sm ${
                categoryFilter === category.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-600/30 text-slate-300 hover:bg-slate-600/50'
              }`}
            >
              <span className="mr-1">{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* 実績一覧 */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAchievements.map(achievement => (
            <div
              key={achievement.id}
              className={`relative rounded-2xl p-6 border-2 transition-all duration-200 ${
                achievement.unlocked
                  ? `bg-gradient-to-br ${getRarityColor(achievement.rarity)} ${getRarityBorder(achievement.rarity)} shadow-lg`
                  : 'bg-slate-700/30 border-slate-600/50 opacity-75'
              }`}
            >
              {/* レアリティ表示 */}
              <div className="absolute top-2 right-2">
                <div className={`px-2 py-1 rounded text-xs font-bold ${
                  achievement.rarity === 'legendary' ? 'bg-pink-500 text-white' :
                  achievement.rarity === 'platinum' ? 'bg-purple-500 text-white' :
                  achievement.rarity === 'gold' ? 'bg-yellow-500 text-black' :
                  achievement.rarity === 'silver' ? 'bg-gray-400 text-black' :
                  'bg-amber-600 text-white'
                }`}>
                  {achievement.rarity.toUpperCase()}
                </div>
              </div>

              {/* アイコンとタイトル */}
              <div className="flex items-start space-x-3 mb-3">
                <div className="text-3xl">{achievement.icon}</div>
                <div className="flex-1">
                  <h3 className={`font-bold text-lg ${achievement.unlocked ? 'text-white' : 'text-slate-300'}`}>
                    {achievement.name}
                  </h3>
                  <p className={`text-sm ${achievement.unlocked ? 'text-white/90' : 'text-slate-400'}`}>
                    {achievement.description}
                  </p>
                </div>
              </div>

              {/* 進捗バー */}
              {!achievement.unlocked && (
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>進捗</span>
                    <span>{achievement.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-600/50 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${achievement.progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* 条件 */}
              <div className="mb-3">
                <div className="text-xs font-semibold text-slate-300 mb-1">達成条件:</div>
                <div className="space-y-1">
                  {achievement.requirements.map((req, index) => (
                    <div key={index} className="text-xs text-slate-400 flex items-center">
                      <span className="mr-2">
                        {achievement.unlocked ? '✅' : '◯'}
                      </span>
                      {req.description}
                    </div>
                  ))}
                </div>
              </div>

              {/* 報酬 */}
              <div className="bg-black/20 rounded-lg p-3">
                <div className="text-xs font-semibold text-yellow-300 mb-1">🎁 報酬:</div>
                <div className="flex flex-wrap gap-1 text-xs">
                  {achievement.rewards.funds && (
                    <span className="bg-green-600/20 text-green-300 px-2 py-1 rounded">
                      💰 {achievement.rewards.funds}
                    </span>
                  )}
                  {achievement.rewards.reputation && (
                    <span className="bg-yellow-600/20 text-yellow-300 px-2 py-1 rounded">
                      ⭐ {achievement.rewards.reputation}
                    </span>
                  )}
                  {achievement.rewards.title && (
                    <span className="bg-purple-600/20 text-purple-300 px-2 py-1 rounded">
                      👑 {achievement.rewards.title}
                    </span>
                  )}
                  {achievement.rewards.items && achievement.rewards.items.length > 0 && (
                    <span className="bg-blue-600/20 text-blue-300 px-2 py-1 rounded">
                      🎁 {achievement.rewards.items.length}個
                    </span>
                  )}
                </div>
              </div>

              {/* 解除日時 */}
              {achievement.unlocked && achievement.unlockedAt && (
                <div className="absolute bottom-2 left-2 text-xs text-white/70">
                  {achievement.unlockedAt.toLocaleDateString('ja-JP')}
                </div>
              )}

              {/* 未解除オーバーレイ */}
              {!achievement.unlocked && (
                <div className="absolute inset-0 bg-black/30 rounded-2xl flex items-center justify-center">
                  <div className="text-white/80 font-bold">🔒</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 新規解除通知 */}
      {newUnlocks.map((achievement, index) => (
        <div
          key={`${achievement.id}-${index}`}
          className="fixed bottom-4 right-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-2xl p-4 shadow-2xl animate-bounce z-50"
          style={{ animationDelay: `${index * 200}ms` }}
        >
          <div className="flex items-center space-x-3">
            <div className="text-2xl">{achievement.icon}</div>
            <div>
              <div className="font-bold">実績解除！</div>
              <div className="text-sm">{achievement.name}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}