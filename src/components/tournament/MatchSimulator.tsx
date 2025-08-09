'use client';

import { useState, useEffect } from 'react';
import { Player } from '@/types/game';
import { MatchEngine, CPUPlayer, MatchResult, SetResult } from '@/lib/match-engine';

interface MatchSimulatorProps {
  homePlayer: Player;
  onMatchComplete: (result: MatchResult) => void;
  onBack: () => void;
}

export default function MatchSimulator({ homePlayer, onMatchComplete, onBack }: MatchSimulatorProps) {
  const [cpuPlayer, setCpuPlayer] = useState<CPUPlayer | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [currentSet, setCurrentSet] = useState(0);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [showingLiveScore, setShowingLiveScore] = useState(false);
  const [liveScores, setLiveScores] = useState({ home: 0, away: 0 });
  const [difficulty, setDifficulty] = useState<'easy' | 'normal' | 'hard' | 'extreme'>('normal');

  useEffect(() => {
    // CPU対戦相手を生成
    const opponent = MatchEngine.generateCPUOpponent(difficulty);
    setCpuPlayer(opponent);
  }, [difficulty]);

  const startMatch = async () => {
    if (!cpuPlayer) return;
    
    setIsSimulating(true);
    setShowingLiveScore(true);
    setCurrentSet(0);
    setLiveScores({ home: 0, away: 0 });

    // 少し遅延を入れて演出効果を追加
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      // 試合をシミュレート
      const result = MatchEngine.simulateMatch(homePlayer, cpuPlayer);
      
      // リアルタイムでスコア更新を演出
      for (let i = 0; i < result.sets.length; i++) {
        setCurrentSet(i + 1);
        
        // セットの途中経過を演出
        const set = result.sets[i];
        const maxScore = Math.max(set.home_score, set.away_score);
        
        for (let score = 0; score <= maxScore; score++) {
          const homeScore = Math.min(score, set.home_score);
          const awayScore = Math.min(score, set.away_score);
          
          setLiveScores({ home: homeScore, away: awayScore });
          await new Promise(resolve => setTimeout(resolve, 300));
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      setMatchResult(result);
      setShowingLiveScore(false);
      onMatchComplete(result);
      
    } catch (error) {
      console.error('Match simulation error:', error);
    } finally {
      setIsSimulating(false);
    }
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'normal': return 'bg-blue-100 text-blue-800';
      case 'hard': return 'bg-orange-100 text-orange-800';
      case 'extreme': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyName = (diff: string) => {
    switch (diff) {
      case 'easy': return '初級';
      case 'normal': return '中級';
      case 'hard': return '上級';
      case 'extreme': return '最強';
      default: return '不明';
    }
  };

  if (!cpuPlayer) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <button
          onClick={onBack}
          className="mb-4 text-indigo-600 hover:text-indigo-800 font-semibold"
        >
          ← 戻る
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">🎾 練習試合</h1>
        <p className="text-gray-600">
          CPU対戦でポケモン選手の実力を試してみよう！
        </p>
      </div>

      {!isSimulating && !matchResult && (
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-center mb-8">試合設定</h2>
          
          {/* 難易度選択 */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">難易度を選択:</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(['easy', 'normal', 'hard', 'extreme'] as const).map((diff) => (
                <button
                  key={diff}
                  onClick={() => setDifficulty(diff)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    difficulty === diff
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <span className={`inline-block px-2 py-1 rounded text-xs font-semibold mb-2 ${getDifficultyColor(diff)}`}>
                    {getDifficultyName(diff)}
                  </span>
                  <div className="text-sm text-gray-600">
                    平均スキル: {diff === 'easy' ? '15-25' : diff === 'normal' ? '30-40' : diff === 'hard' ? '50-60' : '70-80'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 対戦カード */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 mb-8">
            <h3 className="text-xl font-bold text-center mb-6">対戦カード</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              {/* ホームプレイヤー */}
              <div className="text-center">
                <div className="bg-white rounded-lg p-4 shadow-md">
                  <h4 className="font-bold text-green-600 text-lg mb-2">{homePlayer.pokemon_name}</h4>
                  <p className="text-sm text-gray-600 mb-3">Lv.{homePlayer.level} - あなたの選手</p>
                  <div className="space-y-1 text-xs">
                    <div>サーブ: {homePlayer.serve_skill}</div>
                    <div>リターン: {homePlayer.return_skill}</div>
                    <div>ボレー: {homePlayer.volley_skill}</div>
                    <div>ストローク: {homePlayer.stroke_skill}</div>
                    <div>メンタル: {homePlayer.mental}</div>
                    <div>スタミナ: {homePlayer.stamina}</div>
                  </div>
                </div>
              </div>

              {/* VS */}
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600">VS</div>
              </div>

              {/* CPUプレイヤー */}
              <div className="text-center">
                <div className="bg-white rounded-lg p-4 shadow-md">
                  <h4 className="font-bold text-red-600 text-lg mb-2">{cpuPlayer.pokemon_name}</h4>
                  <p className="text-sm text-gray-600 mb-3">Lv.{cpuPlayer.level} - CPU選手</p>
                  <div className="space-y-1 text-xs">
                    <div>サーブ: {cpuPlayer.serve_skill}</div>
                    <div>リターン: {cpuPlayer.return_skill}</div>
                    <div>ボレー: {cpuPlayer.volley_skill}</div>
                    <div>ストローク: {cpuPlayer.stroke_skill}</div>
                    <div>メンタル: {cpuPlayer.mental}</div>
                    <div>スタミナ: {cpuPlayer.stamina}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={startMatch}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors"
            >
              🎾 試合開始！
            </button>
          </div>
        </div>
      )}

      {showingLiveScore && (
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-center mb-8">試合中...</h2>
          
          <div className="text-center mb-6">
            <div className="text-lg text-gray-600 mb-4">第{currentSet}セット</div>
            <div className="grid grid-cols-3 gap-6 items-center max-w-md mx-auto">
              <div className="text-center">
                <div className="text-green-600 font-bold">{homePlayer.pokemon_name}</div>
                <div className="text-4xl font-bold text-green-600">{liveScores.home}</div>
              </div>
              <div className="text-2xl font-bold text-gray-400">-</div>
              <div className="text-center">
                <div className="text-red-600 font-bold">{cpuPlayer.pokemon_name}</div>
                <div className="text-4xl font-bold text-red-600">{liveScores.away}</div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mr-3"></div>
            <span className="text-gray-600">熱戦中...</span>
          </div>
        </div>
      )}

      {matchResult && !showingLiveScore && (
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-center mb-8">試合結果</h2>
          
          {/* 最終結果 */}
          <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-6 mb-8">
            <div className="text-center mb-4">
              <div className={`text-3xl font-bold ${matchResult.winner_school === 'home' ? 'text-green-600' : 'text-red-600'}`}>
                {matchResult.winner_school === 'home' ? '🎉 勝利！' : '😢 敗北...'}
              </div>
              <div className="text-lg text-gray-600 mt-2">
                {matchResult.home_sets_won} - {matchResult.away_sets_won}
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-6 items-center max-w-md mx-auto">
              <div className="text-center">
                <div className="font-bold text-green-600">{homePlayer.pokemon_name}</div>
                <div className="text-2xl font-bold text-green-600">{matchResult.home_sets_won}</div>
              </div>
              <div className="text-xl font-bold text-gray-400">-</div>
              <div className="text-center">
                <div className="font-bold text-red-600">{cpuPlayer.pokemon_name}</div>
                <div className="text-2xl font-bold text-red-600">{matchResult.away_sets_won}</div>
              </div>
            </div>
          </div>

          {/* セット詳細 */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">セット詳細:</h3>
            <div className="space-y-3">
              {matchResult.sets.map((set, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">第{index + 1}セット:</span>
                    <div className="flex items-center space-x-4">
                      <span className={`${set.winner === 'home' ? 'text-green-600 font-bold' : 'text-gray-600'}`}>
                        {homePlayer.pokemon_name}: {set.home_score}
                      </span>
                      <span className="text-gray-400">-</span>
                      <span className={`${set.winner === 'away' ? 'text-red-600 font-bold' : 'text-gray-600'}`}>
                        {cpuPlayer.pokemon_name}: {set.away_score}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 試合統計 */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">試合統計:</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-6 text-sm">
                <div>
                  <h4 className="font-semibold text-green-600 mb-2">{homePlayer.pokemon_name}</h4>
                  <div>総ポイント獲得: {matchResult.sets.reduce((sum, set) => sum + set.home_performance.total_points, 0)}</div>
                </div>
                <div>
                  <h4 className="font-semibold text-red-600 mb-2">{cpuPlayer.pokemon_name}</h4>
                  <div>総ポイント獲得: {matchResult.sets.reduce((sum, set) => sum + set.away_performance.total_points, 0)}</div>
                </div>
              </div>
              <div className="mt-4 text-center text-gray-600 text-sm">
                試合時間: 約{matchResult.total_duration_minutes}分
              </div>
            </div>
          </div>

          <div className="text-center space-x-4">
            <button
              onClick={() => {
                setMatchResult(null);
                const newOpponent = MatchEngine.generateCPUOpponent(difficulty);
                setCpuPlayer(newOpponent);
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
            >
              🔄 再戦
            </button>
            <button
              onClick={onBack}
              className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
            >
              戻る
            </button>
          </div>
        </div>
      )}
    </div>
  );
}