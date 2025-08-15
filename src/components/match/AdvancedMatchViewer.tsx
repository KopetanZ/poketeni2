'use client';

import { useState, useEffect } from 'react';
import { Player } from '@/types/game';
import { 
  UnifiedMatchEngine,
  MatchConfig,
  MatchResult,
  TacticType,
  EnhancedPlayer,
  simulateAdvancedMatch
} from '@/lib/match-system';

interface AdvancedMatchViewerProps {
  homePlayer: Player;
  onClose: () => void;
  onMatchComplete: (result: MatchResult, opponent: Player) => void;
}

export default function AdvancedMatchViewer({ homePlayer, onClose, onMatchComplete }: AdvancedMatchViewerProps) {
  const [opponent, setOpponent] = useState<Player | null>(null);
  const [difficulty, setDifficulty] = useState<'easy' | 'normal' | 'hard' | 'extreme'>('normal');
  const [homeTactic, setHomeTactic] = useState<TacticType>('balanced');
  const [awayTactic, setAwayTactic] = useState<TacticType>('balanced');
  const [isSimulating, setIsSimulating] = useState(false);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [currentPointIndex, setCurrentPointIndex] = useState(0);
  const [showReplay, setShowReplay] = useState(false);

  // 対戦相手を生成
  const generateOpponent = () => {
    const cpu = generateCPUPlayer(difficulty);
    setOpponent(cpu);
    
    // CPUの戦術を難易度に応じて設定
    const tactics: TacticType[] = ['aggressive', 'defensive', 'balanced', 'technical', 'power', 'counter'];
    const tacticIndex = difficulty === 'easy' ? 2 : 
                      difficulty === 'normal' ? Math.floor(Math.random() * 3) + 1 :
                      difficulty === 'hard' ? Math.floor(Math.random() * 5) :
                      Math.floor(Math.random() * 6);
    setAwayTactic(tactics[tacticIndex]);
  };

  // CPU プレイヤー生成関数
  const generateCPUPlayer = (difficulty: string): Player => {
    const baseStats = {
      easy: { min: 30, max: 50 },
      normal: { min: 45, max: 65 },
      hard: { min: 60, max: 80 },
      extreme: { min: 75, max: 95 }
    };

    const stats = baseStats[difficulty as keyof typeof baseStats] || baseStats.normal;
    
    return {
      id: `cpu_${Date.now()}`,
      pokemon_name: `CPU選手`,
      pokemon_id: Math.floor(Math.random() * 1000),
      level: Math.floor(Math.random() * 20) + 20,
      grade: 2 as 1 | 2 | 3,
      position: 'regular' as const,
      serve_skill: Math.floor(Math.random() * (stats.max - stats.min)) + stats.min,
      return_skill: Math.floor(Math.random() * (stats.max - stats.min)) + stats.min,
      volley_skill: Math.floor(Math.random() * (stats.max - stats.min)) + stats.min,
      stroke_skill: Math.floor(Math.random() * (stats.max - stats.min)) + stats.min,
      mental: Math.floor(Math.random() * (stats.max - stats.min)) + stats.min,
      stamina: 100,
      experience: Math.floor(Math.random() * 1000),
      condition: 50
    };
  };

  // 試合開始
  const startMatch = async () => {
    if (!opponent) return;
    
    setIsSimulating(true);
    setCurrentPointIndex(0);
    
    // 短い遅延でリアルタイム感演出
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 新しい統合システムで試合実行
    const config: MatchConfig = {
      mode: 'advanced',
      format: 'single_set',
      homePlayer: {
        ...homePlayer,
        tactic: homeTactic,
        current_stamina: 100,
        current_mental: homePlayer.mental
      } as EnhancedPlayer,
      awayPlayer: {
        ...opponent,
        tactic: awayTactic,
        current_stamina: 100,
        current_mental: opponent.mental,
        ai_personality: 'balanced'
      } as EnhancedPlayer,
      homeTactic,
      awayTactic,
      environment: {
        weather: 'sunny',
        court_surface: 'hard',
        pressure_level: 30,
        tournament_level: 'practice'
      }
    };
    
    const result = simulateAdvancedMatch(config);
    
    setMatchResult(result);
    setIsSimulating(false);
    setShowReplay(true);
  };

  // リプレイ進行
  const advanceReplay = () => {
    if (!matchResult) return;
    
    const allPoints = matchResult.sets.flatMap(set => set.points);
    if (currentPointIndex < allPoints.length - 1) {
      setCurrentPointIndex(currentPointIndex + 1);
    }
  };

  const previousReplay = () => {
    if (currentPointIndex > 0) {
      setCurrentPointIndex(currentPointIndex - 1);
    }
  };

  // 戦術の説明
  const getTacticDescription = (tactic: TacticType): string => {
    switch (tactic) {
      case 'aggressive': return 'アグレッシブ: サーブ・ネット攻撃重視';
      case 'defensive': return '守備的: リターン・ベースライン重視';
      case 'balanced': return 'バランス: 全能力を均等に活用';
      case 'technical': return 'テクニカル: 技巧・メンタル重視';
      case 'power': return 'パワー: 力強いサーブ・ストローク';
      case 'counter': return 'カウンター: 相手のミス誘発型';
      default: return '不明な戦術';
    }
  };

  // ポイント詳細表示
  const renderPointDetail = (point: EnhancedMatchPoint) => {
    return (
      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
        <div className="flex justify-between items-center">
          <h4 className="font-semibold text-lg">{point.description}</h4>
          <div className={`px-3 py-1 rounded-full text-sm font-bold ${
            point.winner === 'home' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {point.winner === 'home' ? homePlayer.pokemon_name : opponent?.pokemon_name} の勝利
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {/* ホーム側詳細 */}
          <div className="bg-blue-50 p-3 rounded">
            <h5 className="font-semibold text-blue-800 mb-2">{homePlayer.pokemon_name}</h5>
            <div className="space-y-1 text-sm">
              <div>基本スキル: {point.home_base_skill}</div>
              <div>特性ボーナス: +{point.home_ability_bonus}</div>
              <div>特殊能力ボーナス: +{point.home_special_ability_bonus}</div>
              <div>戦術ボーナス: {point.home_tactic_bonus > 0 ? '+' : ''}{Math.round(point.home_tactic_bonus * 100)}%</div>
              <div>コンディション: ×{point.home_condition_modifier.toFixed(2)}</div>
              <div className="font-semibold border-t pt-1">
                最終値: {point.home_final_skill} + ダイス{point.home_roll} = {point.home_final_skill + point.home_roll}
              </div>
            </div>
          </div>
          
          {/* アウェー側詳細 */}
          <div className="bg-red-50 p-3 rounded">
            <h5 className="font-semibold text-red-800 mb-2">{opponent?.pokemon_name}</h5>
            <div className="space-y-1 text-sm">
              <div>基本スキル: {point.away_base_skill}</div>
              <div>特性ボーナス: +{point.away_ability_bonus}</div>
              <div>特殊能力ボーナス: +{point.away_special_ability_bonus}</div>
              <div>戦術ボーナス: {point.away_tactic_bonus > 0 ? '+' : ''}{Math.round(point.away_tactic_bonus * 100)}%</div>
              <div>コンディション: ×{point.away_condition_modifier.toFixed(2)}</div>
              <div className="font-semibold border-t pt-1">
                最終値: {point.away_final_skill} + ダイス{point.away_roll} = {point.away_final_skill + point.away_roll}
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-center space-x-4 text-sm">
          {point.critical_hit && (
            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">⚡ クリティカルヒット!</span>
          )}
          {point.ability_triggered && (
            <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">✨ {point.ability_triggered} 発動!</span>
          )}
          <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded">
            勝利マージン: {point.margin}
          </span>
        </div>
      </div>
    );
  };

  // 統計表示
  const renderStatistics = (result: MatchResult) => {
    const homeStats = result.total_home_performance;
    const awayStats = result.total_away_performance;
    
    return (
      <div className="bg-white rounded-lg p-6 mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">📊 試合統計</h3>
        
        <div className="grid grid-cols-3 gap-4">
          {/* ホーム統計 */}
          <div className="text-center">
            <h4 className="font-semibold text-blue-700 mb-2">{homePlayer.pokemon_name}</h4>
            <div className="space-y-1 text-sm">
              <div>ポイント獲得: {homeStats.total_points}</div>
              <div>サーブ成功: {homeStats.serve_success}</div>
              <div>リターン成功: {homeStats.return_success}</div>
              <div>ボレー成功: {homeStats.volley_success}</div>
              <div>ストローク成功: {homeStats.stroke_success}</div>
              <div>クリティカル: {homeStats.critical_hits || 0}回</div>
            </div>
          </div>

          {/* VS */}
          <div className="text-center self-center">
            <div className="text-2xl font-bold">VS</div>
            <div className="text-lg font-semibold mt-2">
              {result.final_score.home} - {result.final_score.away}
            </div>
          </div>

          {/* アウェイ統計 */}
          <div className="text-center">
            <h4 className="font-semibold text-red-700 mb-2">{opponent?.pokemon_name}</h4>
            <div className="space-y-1 text-sm">
              <div>ポイント獲得: {awayStats.total_points}</div>
              <div>サーブ成功: {awayStats.serve_success}</div>
              <div>リターン成功: {awayStats.return_success}</div>
              <div>ボレー成功: {awayStats.volley_success}</div>
              <div>ストローク成功: {awayStats.stroke_success}</div>
              <div>クリティカル: {awayStats.critical_hits || 0}回</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  useEffect(() => {
    generateOpponent();
  }, [difficulty]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full m-4 max-h-[90vh] overflow-hidden">
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold">⚔️ 高度バトルシステム</h2>
              <p className="mt-2 opacity-90">個体値・特性・戦術を活かした本格テニス対戦</p>
            </div>
            <button
              onClick={onClose}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors font-semibold"
            >
              ✕ 閉じる
            </button>
          </div>
        </div>

        <div className="p-6 max-h-[calc(90vh-150px)] overflow-y-auto">
          {!showReplay ? (
            // 試合準備画面
            <div className="space-y-6">
              {/* 対戦カード */}
              <div className="bg-gradient-to-r from-blue-50 to-red-50 rounded-xl p-6">
                <h3 className="text-2xl font-bold text-center mb-6">🎾 対戦カード</h3>
                
                <div className="grid grid-cols-3 gap-6 items-center">
                  {/* ホームプレイヤー */}
                  <div className="text-center">
                    <div className="bg-blue-100 rounded-lg p-4">
                      <h4 className="text-xl font-bold text-blue-800">
                        {homePlayer.pokemon_stats?.is_shiny && '✨'} {homePlayer.pokemon_name}
                      </h4>
                      <div className="text-sm text-gray-600 mt-2">
                        Lv.{homePlayer.level} | {homePlayer.condition}
                      </div>
                      <div className="mt-3 space-y-1 text-xs">
                        <div>サーブ: {homePlayer.pokemon_stats?.final_stats.serve_skill || homePlayer.serve_skill}</div>
                        <div>リターン: {homePlayer.pokemon_stats?.final_stats.return_skill || homePlayer.return_skill}</div>
                        <div>ボレー: {homePlayer.pokemon_stats?.final_stats.volley_skill || homePlayer.volley_skill}</div>
                        <div>ストローク: {homePlayer.pokemon_stats?.final_stats.stroke_skill || homePlayer.stroke_skill}</div>
                      </div>
                      {homePlayer.pokemon_stats?.ability && (
                        <div className="mt-2 text-xs text-cyan-600">
                          特性: {homePlayer.pokemon_stats.ability}
                        </div>
                      )}
                      {homePlayer.special_abilities && homePlayer.special_abilities.length > 0 && (
                        <div className="mt-2 text-xs">
                          <div className="text-purple-600 font-semibold">特殊能力:</div>
                          <div className="flex flex-wrap gap-1">
                            {homePlayer.special_abilities.slice(0, 2).map((ability, index) => (
                              <span key={index} className={`
                                inline-block px-2 py-0.5 text-xs rounded
                                ${ability.color === 'gold' ? 'bg-yellow-100 text-yellow-800' :
                                  ability.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                                  ability.color === 'red' ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800'}
                              `}>
                                {ability.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* VS */}
                  <div className="text-center">
                    <div className="text-4xl font-bold text-gray-600">VS</div>
                  </div>

                  {/* 対戦相手 */}
                  <div className="text-center">
                    {opponent ? (
                      <div className="bg-red-100 rounded-lg p-4">
                        <h4 className="text-xl font-bold text-red-800">
                          {opponent.pokemon_stats?.is_shiny && '✨'} {opponent.pokemon_name}
                        </h4>
                        <div className="text-sm text-gray-600 mt-2">
                          Lv.{opponent.level} | {opponent.condition}
                        </div>
                        <div className="mt-3 space-y-1 text-xs">
                          <div>サーブ: {opponent.pokemon_stats?.final_stats.serve_skill || opponent.serve_skill}</div>
                          <div>リターン: {opponent.pokemon_stats?.final_stats.return_skill || opponent.return_skill}</div>
                          <div>ボレー: {opponent.pokemon_stats?.final_stats.volley_skill || opponent.volley_skill}</div>
                          <div>ストローク: {opponent.pokemon_stats?.final_stats.stroke_skill || opponent.stroke_skill}</div>
                        </div>
                        {opponent.pokemon_stats?.ability && (
                          <div className="mt-2 text-xs text-cyan-600">
                            特性: {opponent.pokemon_stats.ability}
                          </div>
                        )}
                        {opponent.special_abilities && opponent.special_abilities.length > 0 && (
                          <div className="mt-2 text-xs">
                            <div className="text-purple-600 font-semibold">特殊能力:</div>
                            <div className="flex flex-wrap gap-1">
                              {opponent.special_abilities.slice(0, 2).map((ability, index) => (
                                <span key={index} className={`
                                  inline-block px-2 py-0.5 text-xs rounded
                                  ${ability.color === 'gold' ? 'bg-yellow-100 text-yellow-800' :
                                    ability.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                                    ability.color === 'red' ? 'bg-red-100 text-red-800' :
                                    'bg-gray-100 text-gray-800'}
                                `}>
                                  {ability.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-gray-100 rounded-lg p-4">
                        対戦相手生成中...
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 設定パネル */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 難易度設定 */}
                <div className="bg-white rounded-lg p-6 border">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">⚙️ 対戦設定</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        難易度
                      </label>
                      <select
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value as any)}
                        className="w-full p-3 border rounded-lg bg-white"
                      >
                        <option value="easy">イージー (初心者向け)</option>
                        <option value="normal">ノーマル (標準)</option>
                        <option value="hard">ハード (上級者)</option>
                        <option value="extreme">エクストリーム (最高難度)</option>
                      </select>
                    </div>

                    <button
                      onClick={generateOpponent}
                      className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg font-semibold transition-colors"
                    >
                      🎲 対戦相手を再生成
                    </button>
                  </div>
                </div>

                {/* 戦術選択 */}
                <div className="bg-white rounded-lg p-6 border">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">🎯 戦術選択</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        あなたの戦術
                      </label>
                      <select
                        value={homeTactic}
                        onChange={(e) => setHomeTactic(e.target.value as TacticType)}
                        className="w-full p-3 border rounded-lg bg-white"
                      >
                        <option value="aggressive">アグレッシブ</option>
                        <option value="defensive">守備的</option>
                        <option value="balanced">バランス</option>
                        <option value="technical">テクニカル</option>
                        <option value="power">パワー</option>
                        <option value="counter">カウンター</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        {getTacticDescription(homeTactic)}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        相手の戦術
                      </label>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium">{awayTactic}</span>
                        <p className="text-xs text-gray-500 mt-1">
                          {getTacticDescription(awayTactic)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 試合開始 */}
              <div className="text-center">
                <button
                  onClick={startMatch}
                  disabled={isSimulating || !opponent}
                  className={`px-8 py-4 rounded-xl font-bold text-xl transition-colors ${
                    isSimulating || !opponent
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {isSimulating ? '🔄 試合進行中...' : '🚀 試合開始！'}
                </button>
              </div>
            </div>
          ) : matchResult && (
            // 試合結果・リプレイ画面
            <div className="space-y-6">
              {/* 試合結果 */}
              <div className={`rounded-xl p-6 text-white ${
                matchResult.winner === 'home' 
                  ? 'bg-gradient-to-r from-green-600 to-blue-600' 
                  : 'bg-gradient-to-r from-red-600 to-pink-600'
              }`}>
                <h3 className="text-2xl font-bold text-center mb-4">
                  🎉 試合結果
                </h3>
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">
                    {matchResult.home_score} - {matchResult.away_score}
                  </div>
                  <div className="text-xl">
                    {matchResult.winner === 'home' ? '🏆 勝利！' : '😢 敗北...'}
                  </div>
                  <div className="mt-2">
                    勝者: {matchResult.winner === 'home' ? homePlayer.pokemon_name : opponent?.pokemon_name}
                  </div>
                </div>
              </div>

              {/* 統計表示 */}
              {renderStatistics(matchResult)}

              {/* リプレイコントロール */}
              <div className="bg-white rounded-lg p-6 border">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-gray-800">📺 ポイント リプレイ</h3>
                  <div className="text-sm text-gray-600">
                    {currentPointIndex + 1} / {matchResult.match_log.length}
                  </div>
                </div>

                <div className="flex justify-center space-x-4 mb-6">
                  <button
                    onClick={previousReplay}
                    disabled={currentPointIndex === 0}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-300 text-white rounded-lg font-semibold transition-colors"
                  >
                    ⏮️ 前へ
                  </button>
                  <button
                    onClick={advanceReplay}
                    disabled={currentPointIndex >= matchResult.match_log.length - 1}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg font-semibold transition-colors"
                  >
                    次へ ⏭️
                  </button>
                </div>

                {/* 現在のポイント詳細 */}
                {matchResult.match_log[currentPointIndex] && renderPointDetail(matchResult.match_log[currentPointIndex])}
              </div>

              {/* 完了ボタン */}
              <div className="text-center space-x-4">
                <button
                  onClick={() => onMatchComplete(matchResult, opponent!)}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
                >
                  ✅ 試合完了
                </button>
                <button
                  onClick={() => {
                    setShowReplay(false);
                    setMatchResult(null);
                  }}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                >
                  🔄 再戦
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}