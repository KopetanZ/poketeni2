'use client';

import { useState } from 'react';
import { Player } from '@/types/game';
import { PokemonStats } from '@/types/pokemon-stats';
import AchievementSystem from '@/components/achievement/AchievementSystem';

interface DataRoomDashboardProps {
  players: Player[];
  schoolStats: {
    name: string;
    funds: number;
    reputation: number;
    totalMatches: number;
    totalWins: number;
    totalTournaments: number;
    founded: string;
  };
}

interface StatCard {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string;
  color: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

interface PlayerRanking {
  player: Player;
  rank: number;
  value: number;
  category: string;
}

export default function DataRoomDashboard({ players, schoolStats }: DataRoomDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'players' | 'rankings' | 'analytics'>('overview');

  // 統計計算
  const calculateTeamStats = () => {
    const totalLevel = players.reduce((sum, p) => sum + p.level, 0);
    const averageLevel = players.length > 0 ? Math.round(totalLevel / players.length * 10) / 10 : 0;
    
    const totalMatches = players.reduce((sum, p) => sum + (p.matches_played || 0), 0);
    const totalWins = players.reduce((sum, p) => sum + (p.matches_won || 0), 0);
    const winRate = totalMatches > 0 ? Math.round((totalWins / totalMatches) * 100 * 10) / 10 : 0;
    
    const shinyCount = players.filter(p => p.pokemon_stats?.is_shiny).length;
    const highLevelCount = players.filter(p => p.level >= 20).length;
    
    return {
      totalPlayers: players.length,
      averageLevel,
      totalMatches,
      totalWins,
      winRate,
      shinyCount,
      highLevelCount
    };
  };

  const teamStats = calculateTeamStats();

  // プレイヤーランキング生成
  const generateRankings = () => {
    const categories = [
      { key: 'level', name: 'レベル', getValue: (p: Player) => p.level },
      { key: 'serve', name: 'サーブ', getValue: (p: Player) => p.pokemon_stats?.final_stats.serve_skill || p.serve_skill },
      { key: 'return', name: 'リターン', getValue: (p: Player) => p.pokemon_stats?.final_stats.return_skill || p.return_skill },
      { key: 'volley', name: 'ボレー', getValue: (p: Player) => p.pokemon_stats?.final_stats.volley_skill || p.volley_skill },
      { key: 'stroke', name: 'ストローク', getValue: (p: Player) => p.pokemon_stats?.final_stats.stroke_skill || p.stroke_skill },
      { key: 'mental', name: 'メンタル', getValue: (p: Player) => p.pokemon_stats?.final_stats.mental || p.mental },
      { key: 'stamina', name: 'スタミナ', getValue: (p: Player) => p.pokemon_stats?.final_stats.stamina || p.stamina },
      { key: 'winrate', name: '勝率', getValue: (p: Player) => {
        const matches = p.matches_played || 0;
        const wins = p.matches_won || 0;
        return matches > 0 ? Math.round((wins / matches) * 100 * 10) / 10 : 0;
      }}
    ];

    return categories.map(category => {
      const sorted = [...players]
        .sort((a, b) => category.getValue(b) - category.getValue(a))
        .slice(0, 5);
      
      return {
        category: category.name,
        rankings: sorted.map((player, index) => ({
          player,
          rank: index + 1,
          value: category.getValue(player),
          category: category.name
        }))
      };
    });
  };

  const rankings = generateRankings();

  // 統計カード生成
  const getStatCards = (): StatCard[] => {
    return [
      {
        title: '部員総数',
        value: teamStats.totalPlayers,
        subtitle: '名のポケモン',
        icon: '👥',
        color: 'from-blue-500 to-cyan-500'
      },
      {
        title: '平均レベル',
        value: teamStats.averageLevel,
        subtitle: 'Lv.',
        icon: '📈',
        color: 'from-green-500 to-emerald-500',
        trend: { value: 2.3, isPositive: true }
      },
      {
        title: '総試合数',
        value: teamStats.totalMatches,
        subtitle: '試合',
        icon: '⚔️',
        color: 'from-orange-500 to-red-500'
      },
      {
        title: '勝率',
        value: `${teamStats.winRate}%`,
        subtitle: `${teamStats.totalWins}勝`,
        icon: '🏆',
        color: 'from-yellow-500 to-orange-500',
        trend: { value: 12.5, isPositive: true }
      },
      {
        title: '色違い',
        value: teamStats.shinyCount,
        subtitle: '匹',
        icon: '✨',
        color: 'from-purple-500 to-pink-500'
      },
      {
        title: 'エース級',
        value: teamStats.highLevelCount,
        subtitle: 'Lv20+',
        icon: '⭐',
        color: 'from-indigo-500 to-purple-500'
      }
    ];
  };

  const statCards = getStatCards();

  const tabs = [
    { id: 'overview', name: '概要', icon: '📊' },
    { id: 'players', name: '選手詳細', icon: '👥' },
    { id: 'rankings', name: 'ランキング', icon: '🏆' },
    { id: 'analytics', name: '分析', icon: '📈' },
    { id: 'achievements', name: '実績', icon: '🏅' }
  ];

  return (
    <div className="h-full flex flex-col">
      {/* タブナビゲーション */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center">
          📊 データルーム
        </h2>
        <div className="flex space-x-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'bg-slate-600/30 text-slate-300 hover:bg-slate-600/50 hover:text-white'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {activeTab === 'overview' && (
          <div className="h-full overflow-y-auto space-y-6">
            {/* 統計カード */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {statCards.map((card, index) => (
                <div
                  key={index}
                  className={`bg-gradient-to-br ${card.color} rounded-2xl p-6 text-white shadow-lg`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-3xl">{card.icon}</div>
                    {card.trend && (
                      <div className={`text-sm px-2 py-1 rounded-full ${
                        card.trend.isPositive ? 'bg-green-500/20' : 'bg-red-500/20'
                      }`}>
                        {card.trend.isPositive ? '↗' : '↘'} {card.trend.value}%
                      </div>
                    )}
                  </div>
                  <div className="text-3xl font-bold mb-1">{card.value}</div>
                  <div className="text-sm opacity-90">{card.title}</div>
                  <div className="text-xs opacity-75">{card.subtitle}</div>
                </div>
              ))}
            </div>

            {/* 学校情報 */}
            <div className="bg-gradient-to-br from-slate-700/30 to-slate-800/30 rounded-2xl p-6 border border-slate-600/50">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                🏫 {schoolStats.name}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">設立:</span>
                    <span className="text-white font-semibold">{schoolStats.founded || '2024年'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">資金:</span>
                    <span className="text-green-400 font-semibold">💰 {schoolStats.funds.toLocaleString()}円</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">評判:</span>
                    <span className="text-yellow-400 font-semibold">⭐ {schoolStats.reputation}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">大会参加数:</span>
                    <span className="text-purple-400 font-semibold">{schoolStats.totalTournaments || 0}回</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">総試合数:</span>
                    <span className="text-blue-400 font-semibold">{teamStats.totalMatches}試合</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">総勝利数:</span>
                    <span className="text-red-400 font-semibold">{teamStats.totalWins}勝</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 最新の活動 */}
            <div className="bg-gradient-to-br from-slate-700/30 to-slate-800/30 rounded-2xl p-6 border border-slate-600/50">
              <h3 className="text-xl font-bold text-white mb-4">📰 最近の活動</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-slate-600/30 rounded-lg">
                  <div className="text-xl">🆕</div>
                  <div>
                    <div className="text-white font-semibold">新しい選手が加入しました</div>
                    <div className="text-slate-400 text-sm">1時間前</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-slate-600/30 rounded-lg">
                  <div className="text-xl">🏆</div>
                  <div>
                    <div className="text-white font-semibold">練習試合に勝利</div>
                    <div className="text-slate-400 text-sm">3時間前</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-slate-600/30 rounded-lg">
                  <div className="text-xl">⚡</div>
                  <div>
                    <div className="text-white font-semibold">選手がレベルアップ</div>
                    <div className="text-slate-400 text-sm">5時間前</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'players' && (
          <div className="h-full overflow-y-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {players.map(player => (
                <div
                  key={player.id}
                  className="bg-gradient-to-br from-slate-700/30 to-slate-800/30 rounded-2xl p-6 border border-slate-600/50"
                >
                  <div className="flex items-center space-x-4 mb-4">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                      player.pokemon_stats?.is_shiny 
                        ? 'bg-gradient-to-br from-yellow-400 to-orange-500' 
                        : 'bg-gradient-to-br from-blue-500 to-purple-500'
                    }`}>
                      <span className="text-2xl">
                        {player.pokemon_stats?.is_shiny ? '✨' : '⚡'}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-white">{player.pokemon_name}</h4>
                      <div className="text-slate-400">
                        Lv.{player.level} - {player.grade}年生 - {
                          player.position === 'captain' ? 'キャプテン' :
                          player.position === 'vice_captain' ? '副キャプテン' :
                          player.position === 'regular' ? 'レギュラー' : 'メンバー'
                        }
                      </div>
                      {player.pokemon_stats?.ability && (
                        <div className="text-cyan-400 text-sm">特性: {player.pokemon_stats.ability}</div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-red-400">サーブ:</span>
                        <span className="text-white font-semibold">
                          {player.pokemon_stats?.final_stats.serve_skill || player.serve_skill}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-blue-400">リターン:</span>
                        <span className="text-white font-semibold">
                          {player.pokemon_stats?.final_stats.return_skill || player.return_skill}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-green-400">ボレー:</span>
                        <span className="text-white font-semibold">
                          {player.pokemon_stats?.final_stats.volley_skill || player.volley_skill}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-purple-400">ストローク:</span>
                        <span className="text-white font-semibold">
                          {player.pokemon_stats?.final_stats.stroke_skill || player.stroke_skill}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-orange-400">メンタル:</span>
                        <span className="text-white font-semibold">
                          {player.pokemon_stats?.final_stats.mental || player.mental}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-indigo-400">スタミナ:</span>
                        <span className="text-white font-semibold">
                          {player.pokemon_stats?.final_stats.stamina || player.stamina}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-600/50 flex justify-between text-sm">
                    <div className="text-slate-400">
                      戦績: {player.matches_won || 0}勝 {(player.matches_played || 0) - (player.matches_won || 0)}敗
                    </div>
                    <div className="text-slate-400">
                      調子: {player.condition} / やる気: {player.motivation}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'rankings' && (
          <div className="h-full overflow-y-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {rankings.map((rankingCategory, categoryIndex) => (
                <div
                  key={categoryIndex}
                  className="bg-gradient-to-br from-slate-700/30 to-slate-800/30 rounded-2xl p-6 border border-slate-600/50"
                >
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                    🏆 {rankingCategory.category}ランキング
                  </h3>
                  <div className="space-y-3">
                    {rankingCategory.rankings.map((ranking, index) => (
                      <div
                        key={ranking.player.id}
                        className={`flex items-center space-x-4 p-3 rounded-lg ${
                          ranking.rank === 1 ? 'bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-500/30' :
                          ranking.rank === 2 ? 'bg-gradient-to-r from-gray-400/20 to-gray-500/20 border border-gray-400/30' :
                          ranking.rank === 3 ? 'bg-gradient-to-r from-orange-600/20 to-red-600/20 border border-orange-500/30' :
                          'bg-slate-600/30'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                          ranking.rank === 1 ? 'bg-yellow-500 text-black' :
                          ranking.rank === 2 ? 'bg-gray-400 text-black' :
                          ranking.rank === 3 ? 'bg-orange-500 text-white' :
                          'bg-slate-600 text-white'
                        }`}>
                          {ranking.rank}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-white">
                            {ranking.player.pokemon_name}
                            {ranking.player.pokemon_stats?.is_shiny && <span className="ml-1">✨</span>}
                          </div>
                          <div className="text-sm text-slate-400">Lv.{ranking.player.level}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-white">{ranking.value}</div>
                          <div className="text-xs text-slate-400">
                            {rankingCategory.category === '勝率' ? '%' : ''}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="h-full overflow-y-auto space-y-6">
            {/* チーム分析 */}
            <div className="bg-gradient-to-br from-slate-700/30 to-slate-800/30 rounded-2xl p-6 border border-slate-600/50">
              <h3 className="text-xl font-bold text-white mb-4">📈 チーム分析</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-slate-300 mb-3">能力分布</h4>
                  <div className="space-y-2">
                    {['サーブ', 'リターン', 'ボレー', 'ストローク', 'メンタル', 'スタミナ'].map((skill, index) => {
                      const colors = ['text-red-400', 'text-blue-400', 'text-green-400', 'text-purple-400', 'text-orange-400', 'text-indigo-400'];
                      const avgValue = Math.round(players.reduce((sum, p) => {
                        const skillKey = skill === 'サーブ' ? 'serve_skill' :
                                        skill === 'リターン' ? 'return_skill' :
                                        skill === 'ボレー' ? 'volley_skill' :
                                        skill === 'ストローク' ? 'stroke_skill' :
                                        skill === 'メンタル' ? 'mental' : 'stamina';
                        return sum + (p.pokemon_stats?.final_stats[skillKey as keyof typeof p.pokemon_stats.final_stats] || (p as any)[skillKey] || 0);
                      }, 0) / players.length * 10) / 10;
                      
                      return (
                        <div key={skill} className="flex justify-between items-center">
                          <span className={`${colors[index]} font-medium`}>{skill}:</span>
                          <span className="text-white font-semibold">{avgValue}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-300 mb-3">強みと弱み</h4>
                  <div className="space-y-3">
                    <div className="bg-green-600/20 border border-green-400/30 rounded-lg p-3">
                      <div className="text-green-300 font-semibold mb-1">💪 チームの強み</div>
                      <div className="text-sm text-green-200">
                        平均レベル{teamStats.averageLevel}の安定した戦力
                      </div>
                    </div>
                    <div className="bg-yellow-600/20 border border-yellow-400/30 rounded-lg p-3">
                      <div className="text-yellow-300 font-semibold mb-1">⚠️ 改善点</div>
                      <div className="text-sm text-yellow-200">
                        個体値システムの活用でさらなる成長が期待できます
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 成長予測 */}
            <div className="bg-gradient-to-br from-slate-700/30 to-slate-800/30 rounded-2xl p-6 border border-slate-600/50">
              <h3 className="text-xl font-bold text-white mb-4">🔮 成長予測</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-600/20 rounded-lg">
                  <div className="text-2xl mb-2">📊</div>
                  <div className="text-white font-semibold">1ヶ月後</div>
                  <div className="text-sm text-slate-400">平均Lv {teamStats.averageLevel + 5}</div>
                </div>
                <div className="text-center p-4 bg-purple-600/20 rounded-lg">
                  <div className="text-2xl mb-2">🏆</div>
                  <div className="text-white font-semibold">大会優勝確率</div>
                  <div className="text-sm text-slate-400">{Math.min(teamStats.winRate + 15, 95)}%</div>
                </div>
                <div className="text-center p-4 bg-green-600/20 rounded-lg">
                  <div className="text-2xl mb-2">✨</div>
                  <div className="text-white font-semibold">進化可能選手</div>
                  <div className="text-sm text-slate-400">{players.filter(p => p.level >= 16).length}名</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="h-full">
            <AchievementSystem
              players={players}
              schoolStats={{
                totalMatches: teamStats.totalMatches,
                totalWins: teamStats.totalWins,
                reputation: schoolStats.reputation,
                funds: schoolStats.funds
              }}
              onAchievementUnlock={(achievement) => {
                console.log('Achievement unlocked:', achievement.name);
                // TODO: 実績解除の処理を実装
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}