'use client';

import React, { useState, useEffect } from 'react';
import { Player } from '@/types/game';
import { CharacterGenerationSystem } from '@/lib/character-generation-system';
import { Zap, Star, TrendingUp, Sparkles, Heart, ArrowUp, Target, Award } from 'lucide-react';

interface AwakeningEventProps {
  player: Player;
  onAwakeningComplete: (awakenedPlayer: Player) => void;
  onClose: () => void;
}

export default function AwakeningEvent({
  player,
  onAwakeningComplete,
  onClose
}: AwakeningEventProps) {
  const [currentPhase, setCurrentPhase] = useState<'intro' | 'transformation' | 'result'>('intro');
  const [awakenedPlayer, setAwakenedPlayer] = useState<Player | null>(null);
  const [showComparison, setShowComparison] = useState(false);

  useEffect(() => {
    // 自動進行のドラマチックな演出
    if (currentPhase === 'intro') {
      const timer = setTimeout(() => {
        setCurrentPhase('transformation');
      }, 3000); // 3秒間の導入

      return () => clearTimeout(timer);
    }
  }, [currentPhase]);

  useEffect(() => {
    if (currentPhase === 'transformation') {
      // 覚醒処理の実行（劇的な演出のため少し時間をかける）
      const timer = setTimeout(() => {
        const bonusRange = [20, 40];
        const bonus = Math.floor(Math.random() * (bonusRange[1] - bonusRange[0] + 1)) + bonusRange[0];
        
        const newPlayer: Player = {
          ...player,
          serve_skill: Math.min(100, player.serve_skill + bonus),
          return_skill: Math.min(100, player.return_skill + bonus),
          volley_skill: Math.min(100, player.volley_skill + bonus),
          stroke_skill: Math.min(100, player.stroke_skill + bonus),
          mental: Math.min(100, player.mental + bonus),
          stamina: Math.min(100, player.stamina + bonus),
          
          motivation: Math.min(100, player.motivation + 20),
          
          awakening: {
            ...player.awakening!,
            hasAwakened: true,
            awakeningChance: 1.0
          }
        };
        
        setAwakenedPlayer(newPlayer);
        setCurrentPhase('result');
        
        // さらに2秒後に比較表示
        setTimeout(() => {
          setShowComparison(true);
        }, 2000);
      }, 4000); // 4秒間の変身演出

      return () => clearTimeout(timer);
    }
  }, [currentPhase, player]);

  const handleComplete = () => {
    if (awakenedPlayer) {
      onAwakeningComplete(awakenedPlayer);
    }
    onClose();
  };

  const getPersonalityDisplay = (personality: string) => {
    const personalities = {
      aggressive: { text: 'アグレッシブ', color: 'text-red-500' },
      technical: { text: 'テクニカル', color: 'text-blue-500' },
      stamina: { text: 'スタミナ', color: 'text-green-500' },
      genius: { text: '天才肌', color: 'text-purple-500' },
      hardworker: { text: '努力家', color: 'text-orange-500' },
      cheerful: { text: 'お調子者', color: 'text-yellow-500' },
      shy: { text: '内気', color: 'text-indigo-500' },
      leader: { text: 'リーダー', color: 'text-gold-500' }
    };
    return personalities[personality as keyof typeof personalities] || { text: '不明', color: 'text-gray-500' };
  };

  if (currentPhase === 'intro') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50">
        <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl p-8 max-w-2xl w-full mx-4 border border-slate-600">
          <div className="text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-teal-400 rounded-full mx-auto mb-6 flex items-center justify-center text-white font-bold text-3xl animate-pulse">
              {player.pokemon_name[0]}
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center justify-center gap-2">
              <Sparkles className="text-yellow-400" />
              何かが起こりそうだ...
              <Sparkles className="text-yellow-400" />
            </h2>
            
            <div className="bg-slate-700/50 rounded-lg p-6 mb-6">
              <h3 className="text-xl font-bold text-white mb-3">{player.pokemon_name}</h3>
              <div className="text-slate-300 space-y-2">
                <p>最近、練習に取り組む姿勢が変わってきている。</p>
                <p>何かをつかもうとしているような...</p>
                <p>今まで見せたことのない集中力を見せている。</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 p-4 rounded-lg border border-purple-500/20">
              <div className="flex items-center justify-center gap-2 text-purple-300 text-lg">
                <Zap className="animate-bounce" />
                覚醒の兆し
                <Zap className="animate-bounce" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentPhase === 'transformation') {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-teal-900 flex items-center justify-center z-50">
        <div className="text-center">
          <div className="relative">
            <div className="w-32 h-32 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mx-auto mb-8 flex items-center justify-center text-white font-bold text-4xl animate-spin">
              {player.pokemon_name[0]}
            </div>
            
            {/* エネルギー効果 */}
            <div className="absolute inset-0 animate-ping">
              <div className="w-32 h-32 bg-yellow-400 rounded-full mx-auto opacity-75"></div>
            </div>
            <div className="absolute inset-0 animate-pulse">
              <div className="w-40 h-40 bg-blue-400 rounded-full mx-auto opacity-50"></div>
            </div>
          </div>
          
          <h2 className="text-4xl font-bold text-white mb-4 animate-pulse">
            覚醒中...
          </h2>
          
          <div className="text-2xl text-yellow-300 font-bold animate-bounce">
            「俺、変わったんだ！」
          </div>
          
          {/* キラキラエフェクト */}
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 20 }, (_, i) => (
              <Sparkles
                key={i}
                className="absolute text-yellow-400 animate-ping"
                size={Math.random() * 20 + 10}
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`
                }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (currentPhase === 'result' && awakenedPlayer) {
    const beforeAssessment = CharacterGenerationSystem.assessPlayer(player);
    const afterAssessment = CharacterGenerationSystem.assessPlayer(awakenedPlayer);
    const personality = getPersonalityDisplay(player.personality);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 overflow-y-auto">
        <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl p-8 max-w-4xl w-full mx-4 my-8 border border-slate-600">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-4 flex items-center justify-center gap-2">
              <Award className="text-yellow-400" />
              覚醒完了！
              <Star className="text-yellow-400" />
            </h2>
            <div className="text-slate-300">
              {awakenedPlayer.pokemon_name} が大幅にパワーアップしました！
            </div>
          </div>

          {/* プレイヤー情報 */}
          <div className="bg-slate-700/50 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-2xl">
                {awakenedPlayer.pokemon_name[0]}
              </div>
            </div>

            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">
                {awakenedPlayer.pokemon_name}
              </h3>
              <div className="flex items-center justify-center gap-4 text-slate-300">
                <span>{awakenedPlayer.grade}年生</span>
                <span>•</span>
                <span className={personality.color}>{personality.text}</span>
                <span>•</span>
                <span>レベル {awakenedPlayer.level}</span>
              </div>
            </div>

            {/* 査定ランク変化 */}
            <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 p-4 rounded-lg border border-purple-500/30 mb-6">
              <div className="flex items-center justify-center gap-4">
                <div className="text-center">
                  <div className="text-slate-400 text-sm">覚醒前</div>
                  <div className="flex items-center gap-1">
                    <span className="text-xl font-bold text-slate-300">{beforeAssessment.rank}</span>
                    <div className="flex">
                      {Array.from({ length: beforeAssessment.star_rating }, (_, i) => (
                        <Star key={i} size={14} className="text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>
                  </div>
                </div>
                
                <ArrowRight size={24} className="text-yellow-400" />
                
                <div className="text-center">
                  <div className="text-slate-400 text-sm">覚醒後</div>
                  <div className="flex items-center gap-1">
                    <span className="text-2xl font-bold text-yellow-400">{afterAssessment.rank}</span>
                    <div className="flex">
                      {Array.from({ length: afterAssessment.star_rating }, (_, i) => (
                        <Star key={i} size={16} className="text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-center mt-3">
                <span className="text-green-400 font-bold">
                  査定値 +{(afterAssessment.total - beforeAssessment.total).toFixed(0)}
                </span>
              </div>
            </div>

            {/* 能力値比較 */}
            {showComparison && (
              <div className="animate-in slide-in-from-bottom-4 duration-500">
                <h4 className="text-lg font-bold text-white mb-4 text-center flex items-center justify-center gap-2">
                  <TrendingUp size={20} />
                  能力値変化
                </h4>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { name: 'サーブ', key: 'serve_skill', color: 'bg-red-50 border-red-200' },
                    { name: 'リターン', key: 'return_skill', color: 'bg-blue-50 border-blue-200' },
                    { name: 'ボレー', key: 'volley_skill', color: 'bg-green-50 border-green-200' },
                    { name: 'ストローク', key: 'stroke_skill', color: 'bg-purple-50 border-purple-200' },
                    { name: 'メンタル', key: 'mental', color: 'bg-yellow-50 border-yellow-200' },
                    { name: 'スタミナ', key: 'stamina', color: 'bg-indigo-50 border-indigo-200' }
                  ].map(({ name, key, color }) => {
                    const before = player[key as keyof Player] as number;
                    const after = awakenedPlayer[key as keyof Player] as number;
                    const increase = after - before;
                    
                    return (
                      <div key={key} className={`${color} border p-3 rounded-lg`}>
                        <div className="text-gray-700 text-sm font-medium mb-1">{name}</div>
                        <div className="flex items-center justify-between">
                          <div className="text-gray-600 text-sm">{before}</div>
                          <ArrowRight size={14} className="text-gray-500" />
                          <div className="text-gray-800 font-bold">{after}</div>
                        </div>
                        <div className="text-center mt-1">
                          <span className="text-green-600 font-bold text-sm">
                            +{increase}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* 感動的なメッセージ */}
                <div className="bg-slate-800/30 p-4 rounded-lg mt-6">
                  <div className="text-center space-y-2">
                    <p className="text-slate-200 text-lg font-semibold">
                      「みんな、俺の本当の力を見せてやる！」
                    </p>
                    <p className="text-slate-300 text-sm">
                      {awakenedPlayer.pokemon_name}の隠れた才能が開花しました
                    </p>
                    <p className="text-slate-300 text-sm">
                      これまでの努力が実を結んだのです
                    </p>
                  </div>
                </div>

                <div className="text-center mt-8">
                  <button
                    onClick={handleComplete}
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold py-4 px-8 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
                  >
                    覚醒完了！
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}