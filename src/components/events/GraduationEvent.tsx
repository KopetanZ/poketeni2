'use client';

import React, { useState, useEffect } from 'react';
import { Player, GraduatedPlayer } from '@/types/game';
import { CharacterGenerationSystem } from '@/lib/character-generation-system';
import { Star, Award, Heart, Sparkles, Users, ArrowRight } from 'lucide-react';

interface GraduationEventProps {
  graduatingPlayers: Player[];
  onGraduationComplete: (graduatedPlayers: GraduatedPlayer[]) => void;
  onClose: () => void;
  schoolReputation: number;
}

export default function GraduationEvent({
  graduatingPlayers,
  onGraduationComplete,
  onClose,
  schoolReputation
}: GraduationEventProps) {
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [showPlayerDetails, setShowPlayerDetails] = useState(false);
  const [graduatedPlayers, setGraduatedPlayers] = useState<GraduatedPlayer[]>([]);
  const [showGroupPhoto, setShowGroupPhoto] = useState(false);

  const currentPlayer = graduatingPlayers[currentPlayerIndex];
  
  useEffect(() => {
    // 自動進行のタイマー（感動演出のため少し時間をかける）
    const timer = setTimeout(() => {
      setShowPlayerDetails(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, [currentPlayerIndex]);

  const handleNextPlayer = () => {
    if (currentPlayerIndex < graduatingPlayers.length - 1) {
      setCurrentPlayerIndex(prev => prev + 1);
      setShowPlayerDetails(false);
    } else {
      // 全員の卒業処理完了、集合写真へ
      setShowGroupPhoto(true);
    }
  };

  const handleGraduationFinish = () => {
    onGraduationComplete(graduatedPlayers);
    onClose();
  };

  const getCareerPathDisplay = (careerPath: string) => {
    switch (careerPath) {
      case 'professional':
        return { text: 'プロテニス選手', icon: '🏆', color: 'text-yellow-500' };
      case 'university':
        return { text: '大学進学（推薦）', icon: '🎓', color: 'text-blue-500' };
      case 'employment':
        return { text: '就職', icon: '💼', color: 'text-green-500' };
      case 'retired':
        return { text: 'テニス引退', icon: '🌸', color: 'text-pink-500' };
      default:
        return { text: '未定', icon: '❓', color: 'text-gray-500' };
    }
  };

  const generateCareerMessage = (player: Player) => {
    const assessment = CharacterGenerationSystem.assessPlayer(player);
    const messages = [
      `3年間、本当にお疲れさまでした。`,
      `${player.pokemon_name}の成長を見守ることができて嬉しかったです。`,
      `${assessment.rank}ランクの実力は、後輩たちの目標になるでしょう。`,
      `新たなステージでも頑張ってください！`
    ];
    
    if (player.position === 'captain') {
      messages.push('素晴らしい部長でした。');
    }
    
    if (player.awakening?.hasAwakened) {
      messages.push('大器晩成の成長は感動的でした！');
    }
    
    return messages;
  };

  if (showGroupPhoto) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
        <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl p-8 max-w-4xl w-full mx-4 border border-slate-600">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-4 flex items-center justify-center gap-2">
              <Sparkles className="text-yellow-400" />
              卒業記念写真
              <Sparkles className="text-yellow-400" />
            </h2>
            <div className="text-slate-300">
              令和{new Date().getFullYear() - 2018}年度 テニス部卒業生
            </div>
          </div>

          {/* 集合写真風レイアウト */}
          <div className="bg-gradient-to-b from-blue-100 to-blue-50 rounded-xl p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {graduatingPlayers.map((player, index) => {
                const assessment = CharacterGenerationSystem.assessPlayer(player);
                const career = getCareerPathDisplay(player.careerPath || 'employment');
                
                return (
                  <div key={player.id} className="bg-white rounded-lg p-4 shadow-lg">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-teal-400 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold text-xl">
                        {player.pokemon_name[0]}
                      </div>
                      <h3 className="font-bold text-gray-800">{player.pokemon_name}</h3>
                      <div className="text-sm text-gray-600 mb-2">
                        {player.position === 'captain' && '👑'} {assessment.rank}ランク
                      </div>
                      <div className={`text-xs ${career.color} font-semibold`}>
                        {career.icon} {career.text}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={handleGraduationFinish}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-lg transition-all duration-200 transform hover:scale-105"
            >
              卒業式を終える
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl p-8 max-w-2xl w-full mx-4 border border-slate-600">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-2">
            <Heart className="text-pink-400" />
            卒業式
            <Heart className="text-pink-400" />
          </h2>
          <div className="text-slate-300">
            {currentPlayerIndex + 1} / {graduatingPlayers.length}人目
          </div>
        </div>

        {currentPlayer && (
          <div className="bg-slate-700/50 rounded-xl p-6">
            {/* プレイヤー情報表示 */}
            <div className="flex items-center justify-center mb-6">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-teal-400 rounded-full flex items-center justify-center text-white font-bold text-3xl shadow-lg">
                {currentPlayer.pokemon_name[0]}
              </div>
            </div>

            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">
                {currentPlayer.pokemon_name}
                {currentPlayer.position === 'captain' && ' 👑'}
              </h3>
              <div className="flex items-center justify-center gap-4 text-slate-300">
                <span>3年生</span>
                <span>•</span>
                <span>レベル {currentPlayer.level}</span>
              </div>
            </div>

            {showPlayerDetails && (
              <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                {/* 最終能力値 */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-800/50 p-3 rounded-lg">
                    <div className="text-slate-400 text-xs">サーブ</div>
                    <div className="text-white font-bold text-lg">{currentPlayer.serve_skill}</div>
                  </div>
                  <div className="bg-slate-800/50 p-3 rounded-lg">
                    <div className="text-slate-400 text-xs">リターン</div>
                    <div className="text-white font-bold text-lg">{currentPlayer.return_skill}</div>
                  </div>
                  <div className="bg-slate-800/50 p-3 rounded-lg">
                    <div className="text-slate-400 text-xs">ボレー</div>
                    <div className="text-white font-bold text-lg">{currentPlayer.volley_skill}</div>
                  </div>
                  <div className="bg-slate-800/50 p-3 rounded-lg">
                    <div className="text-slate-400 text-xs">ストローク</div>
                    <div className="text-white font-bold text-lg">{currentPlayer.stroke_skill}</div>
                  </div>
                </div>

                {/* 最終査定 */}
                <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 p-4 rounded-lg border border-purple-500/20">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">最終査定</span>
                    <div className="flex items-center gap-2">
                      {(() => {
                        const assessment = CharacterGenerationSystem.assessPlayer(currentPlayer);
                        return (
                          <>
                            <span className="text-2xl font-bold text-yellow-400">{assessment.rank}</span>
                            <div className="flex">
                              {Array.from({ length: assessment.star_rating }, (_, i) => (
                                <Star key={i} size={16} className="text-yellow-400 fill-yellow-400" />
                              ))}
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                {/* 感動的なメッセージ */}
                <div className="bg-slate-800/30 p-4 rounded-lg">
                  <div className="space-y-2">
                    {generateCareerMessage(currentPlayer).map((message, index) => (
                      <p key={index} className="text-slate-200 text-sm leading-relaxed">
                        {message}
                      </p>
                    ))}
                  </div>
                </div>

                {/* 進路表示 */}
                {currentPlayer.careerPath && (
                  <div className="bg-gradient-to-r from-green-900/30 to-blue-900/30 p-4 rounded-lg border border-green-500/20">
                    <div className="flex items-center justify-center gap-2">
                      <ArrowRight className="text-green-400" />
                      <span className="text-white font-semibold">進路: </span>
                      <span className={`font-bold ${getCareerPathDisplay(currentPlayer.careerPath).color}`}>
                        {getCareerPathDisplay(currentPlayer.careerPath).icon} {getCareerPathDisplay(currentPlayer.careerPath).text}
                      </span>
                    </div>
                  </div>
                )}

                <div className="text-center pt-4">
                  <button
                    onClick={handleNextPlayer}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
                  >
                    {currentPlayerIndex < graduatingPlayers.length - 1 ? '次の卒業生へ' : '集合写真へ'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 進行状況 */}
        <div className="mt-6">
          <div className="flex justify-center space-x-2">
            {graduatingPlayers.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full ${
                  index <= currentPlayerIndex ? 'bg-blue-400' : 'bg-slate-600'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}