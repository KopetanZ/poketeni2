'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useGameData } from '@/hooks/useGameData';
import { Player } from '@/types/game';
import { MatchResult } from '@/lib/match-engine';
import TournamentList from '@/components/tournament/TournamentList';
import MatchSimulator from '@/components/tournament/MatchSimulator';

type ViewMode = 'tournaments' | 'player_select' | 'match' | 'results';

export default function TournamentsPage() {
  const { user } = useAuth();
  const { gameData, loading: gameLoading } = useGameData();
  const [viewMode, setViewMode] = useState<ViewMode>('tournaments');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [loading, setLoading] = useState(false);

  // 認証チェック
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center bg-white rounded-xl shadow-lg p-8 max-w-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">🔐 認証が必要です</h2>
          <p className="text-gray-600 mb-4">トーナメントに参加するにはログインが必要です。</p>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition-colors"
          >
            ホームに戻る
          </button>
        </div>
      </div>
    );
  }

  // データ読み込み中
  if (gameLoading || !gameData.school) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">ゲームデータ読み込み中...</p>
        </div>
      </div>
    );
  }

  const handleStartPracticeMatch = () => {
    if (gameData.players.length === 0) {
      alert('選手がいません。まずはポケモン選手を獲得してください。');
      return;
    }
    setViewMode('player_select');
  };

  const handlePlayerSelect = (player: Player) => {
    setSelectedPlayer(player);
    setViewMode('match');
  };

  const handleMatchComplete = (result: MatchResult) => {
    setMatchResult(result);
    setViewMode('results');
    
    // 勝利した場合、選手の経験値を増加
    if (result.winner_school === 'home' && selectedPlayer) {
      updatePlayerExperience(selectedPlayer.id, 20);
    } else if (selectedPlayer) {
      updatePlayerExperience(selectedPlayer.id, 10);
    }
  };

  const updatePlayerExperience = async (playerId: string, expGain: number) => {
    try {
      // 簡単な経験値更新（実際のアプリではもっと詳細に）
      console.log(`Player ${playerId} gained ${expGain} experience`);
      // ここでSupabaseのplayersテーブルを更新
    } catch (error) {
      console.error('Failed to update player experience:', error);
    }
  };

  const handleBackToTournaments = () => {
    setViewMode('tournaments');
    setSelectedPlayer(null);
    setMatchResult(null);
  };

  const handleBackToPlayerSelect = () => {
    setViewMode('player_select');
    setSelectedPlayer(null);
    setMatchResult(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {viewMode === 'tournaments' && (
        <div>
          <TournamentList />
          
          {/* 練習試合セクション */}
          <div className="max-w-6xl mx-auto p-6 mt-8">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">🎾 練習試合</h2>
                <p className="text-gray-600 mb-6">
                  CPU相手に練習試合をして、選手の実力を確認しよう！
                </p>
                <button
                  onClick={handleStartPracticeMatch}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition-colors"
                >
                  練習試合を始める
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {viewMode === 'player_select' && (
        <div className="max-w-4xl mx-auto p-6">
          <button
            onClick={handleBackToTournaments}
            className="mb-6 text-indigo-600 hover:text-indigo-800 font-semibold"
          >
            ← トーナメント一覧に戻る
          </button>
          
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-center mb-8">出場選手を選択</h2>
            
            {gameData.players.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg mb-4">選手がいません</p>
                <p className="text-gray-400">まずはホーム画面でポケモン選手を獲得してください。</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {gameData.players.map(player => (
                  <div 
                    key={player.id}
                    onClick={() => handlePlayerSelect(player)}
                    className="bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-200 rounded-lg p-6 cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
                  >
                    <div className="text-center">
                      <h3 className="font-bold text-green-900 text-lg mb-2">{player.pokemon_name}</h3>
                      <p className="text-sm text-gray-600 mb-4">Lv.{player.level} - {player.grade}年生</p>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>サーブ:</span>
                          <span className="font-semibold text-red-600">{player.serve_skill}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>リターン:</span>
                          <span className="font-semibold text-blue-600">{player.return_skill}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>ボレー:</span>
                          <span className="font-semibold text-green-600">{player.volley_skill}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>ストローク:</span>
                          <span className="font-semibold text-purple-600">{player.stroke_skill}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>メンタル:</span>
                          <span className="font-semibold text-orange-600">{player.mental}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>スタミナ:</span>
                          <span className="font-semibold text-indigo-600">{player.stamina}</span>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-green-200">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          player.position === 'captain' ? 'bg-yellow-200 text-yellow-800' :
                          player.position === 'vice_captain' ? 'bg-orange-200 text-orange-800' :
                          player.position === 'regular' ? 'bg-blue-200 text-blue-800' :
                          'bg-gray-200 text-gray-800'
                        }`}>
                          {player.position === 'captain' ? 'キャプテン' :
                           player.position === 'vice_captain' ? '副キャプテン' :
                           player.position === 'regular' ? 'レギュラー' : 'メンバー'}
                        </span>
                      </div>
                      
                      <div className="mt-4">
                        <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                          この選手で試合する
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {viewMode === 'match' && selectedPlayer && (
        <MatchSimulator
          homePlayer={selectedPlayer}
          onMatchComplete={handleMatchComplete}
          onBack={handleBackToPlayerSelect}
        />
      )}

      {viewMode === 'results' && matchResult && selectedPlayer && (
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-center mb-8">練習試合完了！</h2>
            
            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-6 mb-8">
              <div className="text-center">
                <div className={`text-3xl font-bold mb-4 ${matchResult.winner_school === 'home' ? 'text-green-600' : 'text-red-600'}`}>
                  {matchResult.winner_school === 'home' ? '🎉 勝利おめでとう！' : '😢 惜敗...次は頑張ろう！'}
                </div>
                <p className="text-gray-600">
                  {selectedPlayer.pokemon_name}が{matchResult.winner_school === 'home' ? '勝利' : '敗北'}しました！
                </p>
                
                <div className="mt-6 p-4 bg-white rounded-lg">
                  <h3 className="font-semibold mb-2">獲得した経験値:</h3>
                  <div className="text-2xl font-bold text-indigo-600">
                    +{matchResult.winner_school === 'home' ? 20 : 10} EXP
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {matchResult.winner_school === 'home' 
                      ? '勝利ボーナス付きで多くの経験値を獲得しました！' 
                      : '敗北しても経験値は獲得できます。'}
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center space-x-4">
              <button
                onClick={handleBackToPlayerSelect}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                🔄 別の選手で練習する
              </button>
              <button
                onClick={handleBackToTournaments}
                className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                トーナメント一覧に戻る
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}