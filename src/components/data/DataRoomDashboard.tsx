'use client';

import { useState } from 'react';
import { Player } from '@/types/game';
import { PokemonStats } from '@/types/pokemon-stats';
import AchievementSystem from '@/components/achievement/AchievementSystem';
import { useGameData } from '@/hooks/useGameData';
import { IntegratedGameFlow } from '@/lib/integrated-game-flow';

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
  gameFlow?: IntegratedGameFlow; // gameFlowプロパティを追加
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

export default function DataRoomDashboard({ 
  players, 
  schoolStats,
  gameFlow 
}: DataRoomDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'players' | 'rankings' | 'analytics' | 'achievements' | 'calendar'>('overview');
  const { gameData, loading, error } = useGameData();
  const [diagnosticLogs, setDiagnosticLogs] = useState<string[]>([]);
  const [showDetailedLogs, setShowDetailedLogs] = useState(false);

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
    { id: 'achievements', name: '実績', icon: '🏅' },
    { id: 'calendar', name: 'カレンダー監視', icon: '📅' }
  ];

  // カレンダー状態の診断とログ生成
  const generateDiagnosticLogs = () => {
    if (!gameData) return;

    const logs: string[] = [];
    const timestamp = new Date().toISOString();

    logs.push(`=== カレンダー診断ログ (${timestamp}) ===`);
    logs.push('');

    // 基本情報
    logs.push('【基本情報】');
    logs.push(`現在の日付: ${gameData.currentDate?.year || 'N/A'}年${gameData.currentDate?.month || 'N/A'}月${gameData.currentDate?.day || 'N/A'}日`);
    logs.push(`学校名: ${gameData.school?.name || 'N/A'}`);
    logs.push(`学校オブジェクト: ${JSON.stringify(gameData.school, null, 2)}`);
    logs.push(`プレイヤー数: ${gameData.players?.length || 0}人`);
    logs.push(`カード数: ${gameData.cards?.length || 0}枚`);
    logs.push('');

    // カレンダー状態の詳細分析
    logs.push('【カレンダー状態分析】');
    if (gameData.currentDate) {
      const currentDate = gameData.currentDate;
      const expectedDayCount = calculateExpectedDayCount(currentDate);
      logs.push(`期待される日数: ${expectedDayCount}日`);
      
      // 日付の妥当性チェック
      if (currentDate.month < 1 || currentDate.month > 12) {
        logs.push('⚠️ 月の値が不正: ' + currentDate.month);
      }
      if (currentDate.day < 1 || currentDate.day > 31) {
        logs.push('⚠️ 日の値が不正: ' + currentDate.day);
      }
      if (currentDate.year < 2024 || currentDate.year > 2030) {
        logs.push('⚠️ 年の値が不正: ' + currentDate.year);
      }
    } else {
      logs.push('❌ 現在の日付が設定されていません');
    }
    logs.push('');

    // データ整合性チェック
    logs.push('【データ整合性チェック】');
    if (loading) {
      logs.push('🔄 データ読み込み中');
    } else if (error) {
      logs.push(`❌ エラーが発生: ${error}`);
    } else {
      logs.push('✅ データ読み込み完了');
    }

    if (!gameData.school) {
      logs.push('❌ 学校情報が不足');
    }
    if (!gameData.players || gameData.players.length === 0) {
      logs.push('❌ プレイヤー情報が不足');
    }
    if (!gameData.cards || gameData.cards.length === 0) {
      logs.push('❌ カード情報が不足');
    }
    logs.push('');

    // 推奨アクション
    logs.push('【推奨アクション】');
    if (gameData.currentDate) {
      logs.push('1. カレンダー状態の検証を実行');
      logs.push('2. 必要に応じてカレンダー状態の復旧を実行');
      logs.push('3. ゲーム状態の整合性チェックを実行');
    } else {
      logs.push('1. ゲームの初期化を実行');
      logs.push('2. カレンダーシステムの再構築');
    }
    logs.push('');

    logs.push('=== 診断完了 ===');

    setDiagnosticLogs(logs);
    setShowDetailedLogs(true);

    // コンソールにも出力
    console.group('📊 カレンダー診断ログ');
    logs.forEach(log => console.log(log));
    console.groupEnd();

    // クリップボードにコピー
    const logText = logs.join('\n');
    navigator.clipboard.writeText(logText).then(() => {
      console.log('📋 診断ログをクリップボードにコピーしました');
    }).catch(() => {
      console.log('⚠️ クリップボードへのコピーに失敗しました');
    });
  };

  // 統合ゲームフローの診断ログを生成
  const generateIntegratedDiagnosticLogs = async () => {
    try {
      if (gameFlow && typeof gameFlow.generateDiagnosticLog === 'function') {
        const logs = gameFlow.generateDiagnosticLog();
        setDiagnosticLogs(logs);
        setShowDetailedLogs(true);

        // コンソールにも出力
        console.group('🎮 統合ゲームフロー診断ログ');
        logs.forEach((log: string) => console.log(log));
        console.groupEnd();

        // クリップボードにコピー
        const logText = logs.join('\n');
        navigator.clipboard.writeText(logText).then(() => {
          console.log('📋 統合診断ログをクリップボードにコピーしました');
        }).catch(() => {
          console.log('⚠️ クリップボードへのコピーに失敗しました');
        });
      } else {
        console.warn('統合ゲームフローが利用できません');
        setDiagnosticLogs([
          '統合ゲームフローが利用できません。',
          'gameFlowプロパティが渡されていないか、ゲームが初期化されていません。',
          '',
          '【確認事項】',
          '1. ゲームが正しく初期化されているか',
          '2. IntegratedGameInterfaceが正しく動作しているか',
          '3. カレンダーシステムが初期化されているか',
          '',
          '【現在の状況】',
          `- gameFlow: ${gameFlow ? '存在' : '未定義'}`,
          `- gameData: ${gameData ? '存在' : '未定義'}`,
          `- ローディング状態: ${loading}`,
          `- エラー: ${error || 'なし'}`
        ]);
        setShowDetailedLogs(true);
      }
    } catch (error) {
      console.error('統合診断ログの生成に失敗:', error);
      setDiagnosticLogs([`診断ログの生成に失敗しました: ${error}`]);
      setShowDetailedLogs(true);
    }
  };

  // 期待される日数を計算する関数
  const calculateExpectedDayCount = (currentDate: any) => {
    if (!currentDate || !currentDate.year || !currentDate.month || !currentDate.day) return 0;
    
    const startDate = new Date(2024, 3, 1); // 4月1日から開始
    const currentDateObj = new Date(currentDate.year, currentDate.month - 1, currentDate.day);
    
    const diffTime = currentDateObj.getTime() - startDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  };

  // ログをクリア
  const clearLogs = () => {
    setDiagnosticLogs([]);
    setShowDetailedLogs(false);
  };

  // ログをファイルとしてダウンロード
  const downloadLogs = () => {
    if (diagnosticLogs.length === 0) return;
    
    const logText = diagnosticLogs.join('\n');
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `calendar-diagnostic-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

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

        {activeTab === 'calendar' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">カレンダー状態監視</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 現在のカレンダー状態 */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-700">現在の状態</h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">現在の日付:</span>
                      <span className="font-mono text-sm">
                        {gameData?.currentDate?.year || 'N/A'}/
                        {gameData?.currentDate?.month || 'N/A'}/
                        {gameData?.currentDate?.day || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">学校情報:</span>
                      <span className="font-mono text-sm">
                        {gameData?.school?.name || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">プレイヤー数:</span>
                      <span className="font-mono text-sm">
                        {gameData?.players?.length || 0}人
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">利用可能カード:</span>
                      <span className="font-mono text-sm">
                        {gameData?.cards?.length || 0}枚
                      </span>
                    </div>
                  </div>
                </div>

                {/* システム状態 */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-700">システム状態</h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">データ読み込み:</span>
                      <span className={`text-sm font-medium ${!loading ? 'text-green-600' : 'text-yellow-600'}`}>
                        {!loading ? '完了' : '読み込み中'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">エラー状態:</span>
                      <span className={`text-sm font-medium ${!error ? 'text-green-600' : 'text-red-600'}`}>
                        {!error ? 'なし' : 'あり'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* デバッグ情報 */}
              <div className="mt-6">
                <h4 className="font-medium text-gray-700 mb-3">デバッグ情報</h4>
                <div className="bg-gray-900 text-green-400 rounded-lg p-4 font-mono text-sm overflow-auto max-h-40">
                  <div>現在の日付: {JSON.stringify(gameData?.currentDate, null, 2)}</div>
                  <div>学校情報: {JSON.stringify(gameData?.school, null, 2)}</div>
                  <div>プレイヤー数: {gameData?.players?.length || 0}</div>
                  <div>カード数: {gameData?.cards?.length || 0}</div>
                  <div>読み込み状態: {loading ? '読み込み中' : '完了'}</div>
                  <div>エラー: {error || 'なし'}</div>
                </div>
              </div>

              {/* 診断・ログ機能 */}
              <div className="mt-6">
                <h4 className="font-medium text-gray-700 mb-3">診断・ログ機能</h4>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <button
                      onClick={generateDiagnosticLogs}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      📊 診断ログ生成
                    </button>
                    <button
                      onClick={generateIntegratedDiagnosticLogs}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      🎮 統合診断ログ
                    </button>
                    <button
                      onClick={clearLogs}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      🗑️ ログクリア
                    </button>
                    {diagnosticLogs.length > 0 && (
                      <button
                        onClick={downloadLogs}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        💾 ログダウンロード
                      </button>
                    )}
                  </div>

                  {showDetailedLogs && diagnosticLogs.length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-3">
                        <h5 className="font-medium text-gray-700">診断結果</h5>
                        <span className="text-sm text-gray-500">
                          {diagnosticLogs.length}行のログ
                        </span>
                      </div>
                      <div className="bg-white border rounded-lg p-3 max-h-60 overflow-auto">
                        <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                          {diagnosticLogs.join('\n')}
                        </pre>
                      </div>
                      <div className="mt-3 text-sm text-gray-600">
                        💡 ログは自動的にクリップボードにコピーされ、コンソールにも出力されます
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}