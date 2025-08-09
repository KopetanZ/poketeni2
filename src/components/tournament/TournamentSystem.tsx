'use client';

import { useState, useEffect } from 'react';
import { Player } from '@/types/game';
import { AdvancedMatchEngine, generateAdvancedCPU } from '@/lib/advanced-match-engine';

interface Tournament {
  id: string;
  name: string;
  description: string;
  type: 'regional' | 'national' | 'international' | 'special';
  difficulty: 'easy' | 'normal' | 'hard' | 'extreme';
  entryFee: number;
  rewards: {
    winner: { funds: number; reputation: number; items?: string[]; };
    finalist: { funds: number; reputation: number; };
    semifinalist: { funds: number; reputation: number; };
  };
  requirements: {
    min_level?: number;
    min_players?: number;
    min_reputation?: number;
  };
  duration: number; // 日数
  opponents: number; // 対戦相手数
  status: 'available' | 'ongoing' | 'completed' | 'locked';
  icon: string;
}

interface TournamentSystemProps {
  players: Player[];
  schoolStats: {
    funds: number;
    reputation: number;
  };
  onTournamentStart: (tournament: Tournament, selectedPlayers: Player[]) => void;
  onTournamentComplete: (tournament: Tournament, result: TournamentResult) => void;
}

interface TournamentResult {
  tournament: Tournament;
  selectedPlayers: Player[];
  matches: Array<{
    round: number;
    opponent: Player;
    result: 'win' | 'loss';
    score: string;
  }>;
  finalRank: 'winner' | 'finalist' | 'semifinalist' | 'eliminated';
  rewards: {
    funds: number;
    reputation: number;
    items?: string[];
  };
}

const availableTournaments: Tournament[] = [
  {
    id: 'local_cup',
    name: '🏟️ 地区大会',
    description: '近隣の学校と競う初心者向けの大会',
    type: 'regional',
    difficulty: 'easy',
    entryFee: 100,
    rewards: {
      winner: { funds: 1000, reputation: 10, items: ['bronze_trophy'] },
      finalist: { funds: 500, reputation: 5 },
      semifinalist: { funds: 200, reputation: 2 }
    },
    requirements: {
      min_level: 5,
      min_players: 3,
      min_reputation: 0
    },
    duration: 3,
    opponents: 8,
    status: 'available',
    icon: '🏟️'
  },
  {
    id: 'prefectural_championship',
    name: '🏆 県大会',
    description: '県内の強豪校が集う本格的なトーナメント',
    type: 'regional',
    difficulty: 'normal',
    entryFee: 300,
    rewards: {
      winner: { funds: 3000, reputation: 25, items: ['silver_trophy', 'training_equipment'] },
      finalist: { funds: 1500, reputation: 15 },
      semifinalist: { funds: 800, reputation: 8 }
    },
    requirements: {
      min_level: 12,
      min_players: 5,
      min_reputation: 20
    },
    duration: 5,
    opponents: 16,
    status: 'available',
    icon: '🏆'
  },
  {
    id: 'national_tournament',
    name: '👑 全国大会',
    description: '全国の頂点を決める最高峰の戦い',
    type: 'national',
    difficulty: 'hard',
    entryFee: 1000,
    rewards: {
      winner: { funds: 10000, reputation: 100, items: ['gold_trophy', 'legendary_equipment', 'master_certificate'] },
      finalist: { funds: 5000, reputation: 60 },
      semifinalist: { funds: 2500, reputation: 30 }
    },
    requirements: {
      min_level: 20,
      min_players: 6,
      min_reputation: 100
    },
    duration: 10,
    opponents: 32,
    status: 'available',
    icon: '👑'
  },
  {
    id: 'pokemon_masters',
    name: '⚡ ポケモンマスターズ',
    description: 'ポケモンテニス界の最強を決める伝説の大会',
    type: 'international',
    difficulty: 'extreme',
    entryFee: 5000,
    rewards: {
      winner: { funds: 50000, reputation: 500, items: ['platinum_trophy', 'legendary_badge', 'master_title'] },
      finalist: { funds: 25000, reputation: 300 },
      semifinalist: { funds: 12000, reputation: 150 }
    },
    requirements: {
      min_level: 30,
      min_players: 8,
      min_reputation: 300
    },
    duration: 14,
    opponents: 64,
    status: 'available',
    icon: '⚡'
  },
  {
    id: 'spring_festival',
    name: '🌸 春の祭典',
    description: '新学期を祝う特別なフェスティバル大会',
    type: 'special',
    difficulty: 'normal',
    entryFee: 200,
    rewards: {
      winner: { funds: 2000, reputation: 20, items: ['spring_crown', 'festival_badge'] },
      finalist: { funds: 1000, reputation: 12 },
      semifinalist: { funds: 500, reputation: 6 }
    },
    requirements: {
      min_level: 8,
      min_players: 4,
      min_reputation: 10
    },
    duration: 4,
    opponents: 12,
    status: 'available',
    icon: '🌸'
  }
];

export default function TournamentSystem({ players, schoolStats, onTournamentStart, onTournamentComplete }: TournamentSystemProps) {
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [ongoingTournament, setOngoingTournament] = useState<Tournament | null>(null);
  const [tournamentProgress, setTournamentProgress] = useState<{
    currentRound: number;
    totalRounds: number;
    matches: Array<{
      round: number;
      opponent: Player;
      result: 'win' | 'loss';
      score: string;
    }>;
  } | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  // トーナメント参加可能かチェック
  const canEnterTournament = (tournament: Tournament): boolean => {
    const eligiblePlayers = players.filter(p => p.level >= (tournament.requirements.min_level || 0));
    
    return (
      eligiblePlayers.length >= (tournament.requirements.min_players || 0) &&
      schoolStats.reputation >= (tournament.requirements.min_reputation || 0) &&
      schoolStats.funds >= tournament.entryFee
    );
  };

  // 選手選択
  const togglePlayerSelection = (player: Player) => {
    if (selectedPlayers.includes(player)) {
      setSelectedPlayers(selectedPlayers.filter(p => p.id !== player.id));
    } else {
      const tournament = selectedTournament;
      if (tournament && selectedPlayers.length < (tournament.requirements.min_players || 0) + 2) {
        setSelectedPlayers([...selectedPlayers, player]);
      }
    }
  };

  // トーナメント開始
  const startTournament = () => {
    if (selectedTournament && selectedPlayers.length >= (selectedTournament.requirements.min_players || 0)) {
      setOngoingTournament(selectedTournament);
      setTournamentProgress({
        currentRound: 1,
        totalRounds: Math.ceil(Math.log2(selectedTournament.opponents + 1)),
        matches: []
      });
      setShowConfirmation(false);
      
      onTournamentStart(selectedTournament, selectedPlayers);
    }
  };

  // 試合シミュレーション
  const simulateMatch = async (round: number) => {
    if (!ongoingTournament || !tournamentProgress) return;
    
    setIsSimulating(true);
    
    // 遅延でリアルタイム感を演出
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // ランダムに選手を選択
    const playerForMatch = selectedPlayers[Math.floor(Math.random() * selectedPlayers.length)];
    
    // 対戦相手を生成
    const opponent = generateAdvancedCPU(ongoingTournament.difficulty);
    
    // 試合シミュレーション
    const matchResult = AdvancedMatchEngine.simulateAdvancedSet(
      playerForMatch,
      opponent,
      'balanced',
      'balanced'
    );
    
    const isWin = matchResult.winner === 'home';
    const score = `${matchResult.home_score}-${matchResult.away_score}`;
    
    const newMatch = {
      round,
      opponent,
      result: isWin ? 'win' as const : 'loss' as const,
      score
    };
    
    setTournamentProgress(prev => ({
      ...prev!,
      matches: [...prev!.matches, newMatch]
    }));
    
    setIsSimulating(false);
    
    // 敗退チェック
    if (!isWin) {
      completeTournament('eliminated');
    } else if (round >= tournamentProgress.totalRounds) {
      completeTournament('winner');
    }
  };

  // トーナメント完了
  const completeTournament = (finalRank: TournamentResult['finalRank']) => {
    if (!ongoingTournament || !tournamentProgress) return;
    
    let rewards;
    switch (finalRank) {
      case 'winner':
        rewards = ongoingTournament.rewards.winner;
        break;
      case 'finalist':
        rewards = ongoingTournament.rewards.finalist;
        break;
      case 'semifinalist':
        rewards = ongoingTournament.rewards.semifinalist;
        break;
      default:
        rewards = { funds: 0, reputation: 0 };
    }
    
    const result: TournamentResult = {
      tournament: ongoingTournament,
      selectedPlayers,
      matches: tournamentProgress.matches,
      finalRank,
      rewards
    };
    
    onTournamentComplete(ongoingTournament, result);
    
    // リセット
    setOngoingTournament(null);
    setTournamentProgress(null);
    setSelectedTournament(null);
    setSelectedPlayers([]);
  };

  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
      case 'easy': return 'text-green-400';
      case 'normal': return 'text-blue-400';
      case 'hard': return 'text-orange-400';
      case 'extreme': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  const getDifficultyBg = (difficulty: string): string => {
    switch (difficulty) {
      case 'easy': return 'from-green-600/20 to-emerald-600/20 border-green-400/30';
      case 'normal': return 'from-blue-600/20 to-cyan-600/20 border-blue-400/30';
      case 'hard': return 'from-orange-600/20 to-red-600/20 border-orange-400/30';
      case 'extreme': return 'from-red-600/20 to-pink-600/20 border-red-400/30';
      default: return 'from-slate-600/20 to-slate-700/20 border-slate-400/30';
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center">
          🏆 トーナメント・大会
        </h2>
        <div className="text-sm text-slate-400">
          {ongoingTournament ? '大会進行中' : '参加する大会を選択してください'}
        </div>
      </div>

      {!ongoingTournament ? (
        <div className="flex-1 overflow-y-auto">
          {/* 大会一覧 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {availableTournaments.map(tournament => {
              const canEnter = canEnterTournament(tournament);
              const isSelected = selectedTournament?.id === tournament.id;
              
              return (
                <div
                  key={tournament.id}
                  className={`relative rounded-2xl p-6 border-2 cursor-pointer transition-all duration-200 ${
                    !canEnter
                      ? 'bg-slate-700/30 border-slate-600/30 opacity-60'
                      : isSelected
                      ? `bg-gradient-to-br ${getDifficultyBg(tournament.difficulty)} border-2 shadow-lg scale-105`
                      : 'bg-gradient-to-br from-slate-700/30 to-slate-800/30 border-slate-600/50 hover:scale-102'
                  }`}
                  onClick={() => canEnter && setSelectedTournament(tournament)}
                >
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="text-4xl">{tournament.icon}</div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-1">{tournament.name}</h3>
                      <p className="text-slate-300 text-sm mb-2">{tournament.description}</p>
                      <div className="flex items-center space-x-4 text-xs">
                        <span className={`font-semibold ${getDifficultyColor(tournament.difficulty)}`}>
                          {tournament.difficulty.toUpperCase()}
                        </span>
                        <span className="text-slate-400">{tournament.duration}日間</span>
                        <span className="text-slate-400">{tournament.opponents}名参加</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {/* 参加条件 */}
                    <div className="bg-slate-600/30 rounded-lg p-3">
                      <div className="text-sm font-semibold text-slate-300 mb-1">参加条件</div>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className={`px-2 py-1 rounded ${
                          players.filter(p => p.level >= (tournament.requirements.min_level || 0)).length >= (tournament.requirements.min_players || 0)
                            ? 'bg-green-600/20 text-green-300' 
                            : 'bg-red-600/20 text-red-300'
                        }`}>
                          選手Lv{tournament.requirements.min_level}以上 {tournament.requirements.min_players}名
                        </span>
                        <span className={`px-2 py-1 rounded ${
                          schoolStats.reputation >= (tournament.requirements.min_reputation || 0)
                            ? 'bg-green-600/20 text-green-300'
                            : 'bg-red-600/20 text-red-300'
                        }`}>
                          評判{tournament.requirements.min_reputation}以上
                        </span>
                        <span className={`px-2 py-1 rounded ${
                          schoolStats.funds >= tournament.entryFee
                            ? 'bg-green-600/20 text-green-300'
                            : 'bg-red-600/20 text-red-300'
                        }`}>
                          参加費💰{tournament.entryFee}
                        </span>
                      </div>
                    </div>

                    {/* 報酬 */}
                    <div className="bg-yellow-600/20 rounded-lg p-3">
                      <div className="text-sm font-semibold text-yellow-300 mb-1">🏆 優勝報酬</div>
                      <div className="flex items-center space-x-3 text-xs">
                        <span className="text-green-400">💰 {tournament.rewards.winner.funds}</span>
                        <span className="text-yellow-400">⭐ +{tournament.rewards.winner.reputation}</span>
                        {tournament.rewards.winner.items && (
                          <span className="text-purple-400">🎁 {tournament.rewards.winner.items.length}アイテム</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {!canEnter && (
                    <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-red-400 font-semibold">条件を満たしていません</div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* 選手選択 */}
          {selectedTournament && (
            <div className="mt-8 bg-gradient-to-br from-slate-700/30 to-slate-800/30 rounded-2xl p-6 border border-slate-600/50">
              <h3 className="text-xl font-bold text-white mb-4">
                👥 参加選手を選択 ({selectedPlayers.length}/{selectedTournament.requirements.min_players}+)
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {players
                  .filter(p => p.level >= (selectedTournament.requirements.min_level || 0))
                  .map(player => {
                    const isSelected = selectedPlayers.includes(player);
                    
                    return (
                      <div
                        key={player.id}
                        className={`p-4 rounded-xl cursor-pointer transition-all duration-200 border-2 ${
                          isSelected
                            ? 'bg-blue-600/20 border-blue-400/50 shadow-lg'
                            : 'bg-slate-600/30 border-slate-500/30 hover:bg-slate-600/50'
                        }`}
                        onClick={() => togglePlayerSelection(player)}
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
                            <div className="text-xs text-slate-400">
                              総合: {Math.round((
                                (player.pokemon_stats?.final_stats.serve_skill || player.serve_skill) +
                                (player.pokemon_stats?.final_stats.return_skill || player.return_skill) +
                                (player.pokemon_stats?.final_stats.volley_skill || player.volley_skill) +
                                (player.pokemon_stats?.final_stats.stroke_skill || player.stroke_skill)
                              ) / 4)}
                            </div>
                          </div>
                          
                          {isSelected && (
                            <div className="text-blue-400 text-xl">✓</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>

              <div className="flex justify-center">
                <button
                  onClick={() => setShowConfirmation(true)}
                  disabled={selectedPlayers.length < (selectedTournament.requirements.min_players || 0)}
                  className={`px-8 py-3 rounded-xl font-bold text-lg transition-all ${
                    selectedPlayers.length >= (selectedTournament.requirements.min_players || 0)
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white shadow-lg hover:scale-105'
                      : 'bg-slate-600/50 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {selectedTournament.name}に参加
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        // トーナメント進行中
        <div className="flex-1 flex flex-col">
          <div className="bg-gradient-to-br from-slate-700/30 to-slate-800/30 rounded-2xl p-6 border border-slate-600/50 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white flex items-center">
                {ongoingTournament.icon} {ongoingTournament.name} 進行中
              </h3>
              <div className="text-slate-400 text-sm">
                {tournamentProgress?.currentRound}/{tournamentProgress?.totalRounds}回戦
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-slate-300 mb-3">参加メンバー</h4>
                <div className="space-y-2">
                  {selectedPlayers.map(player => (
                    <div key={player.id} className="flex items-center space-x-3 p-2 bg-slate-600/30 rounded">
                      <span className="text-lg">
                        {player.pokemon_stats?.is_shiny ? '✨' : '⚡'}
                      </span>
                      <span className="text-white font-semibold">{player.pokemon_name}</span>
                      <span className="text-slate-400 text-sm">Lv.{player.level}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-slate-300 mb-3">試合結果</h4>
                <div className="space-y-2">
                  {tournamentProgress?.matches.map((match, index) => (
                    <div key={index} className={`p-2 rounded ${
                      match.result === 'win' 
                        ? 'bg-green-600/20 border border-green-400/30' 
                        : 'bg-red-600/20 border border-red-400/30'
                    }`}>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-white">
                          {match.round}回戦 vs {match.opponent.pokemon_name}
                        </span>
                        <span className={`font-bold ${
                          match.result === 'win' ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {match.score} {match.result === 'win' ? '勝利' : '敗北'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 text-center">
              {tournamentProgress && tournamentProgress.currentRound <= tournamentProgress.totalRounds && (
                <button
                  onClick={() => simulateMatch(tournamentProgress.currentRound)}
                  disabled={isSimulating}
                  className={`px-6 py-3 rounded-xl font-bold transition-all ${
                    isSimulating
                      ? 'bg-slate-600/50 text-slate-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg hover:scale-105'
                  }`}
                >
                  {isSimulating ? '🔄 試合中...' : `${tournamentProgress.currentRound}回戦 開始`}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 確認モーダル */}
      {showConfirmation && selectedTournament && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-600/50 shadow-2xl max-w-md w-full m-4">
            <div className="p-6">
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">{selectedTournament.icon}</div>
                <h3 className="text-xl font-bold text-white">{selectedTournament.name}</h3>
                <div className="text-sm text-slate-400 mt-1">大会に参加しますか？</div>
              </div>

              <div className="bg-slate-700/50 rounded-lg p-4 mb-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">参加費:</span>
                  <span className="text-yellow-400">💰 {selectedTournament.entryFee}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">期間:</span>
                  <span className="text-white">{selectedTournament.duration}日間</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">参加選手:</span>
                  <span className="text-white">{selectedPlayers.length}名</span>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="flex-1 bg-slate-600 hover:bg-slate-500 text-white py-2 rounded-lg transition-colors"
                >
                  キャンセル
                </button>
                <button
                  onClick={startTournament}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white py-2 rounded-lg font-semibold transition-all"
                >
                  参加する
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}