'use client';

import React, { useState, useEffect } from 'react';
import { PokemonAPI } from '@/lib/pokemon-api';
import PokemonCard from '@/components/PokemonCard';
import { Player } from '@/types/game';

interface GameIntroductionProps {
  onComplete: (data: {
    schoolName: string;
    selectedStarter: string;
    managerName?: string;
  }) => void;
}

interface StarterOption {
  name: string;
  description: string;
  personality: string;
  recommendedFor: string;
}

const STARTER_OPTIONS: StarterOption[] = [
  {
    name: 'フシギダネ',
    description: '草・毒タイプの頼れるパートナー',
    personality: '堅実で守備的',
    recommendedFor: '安定したプレイが好きな人'
  },
  {
    name: 'ヒトカゲ',
    description: '炎タイプの情熱的なアタッカー',
    personality: '攻撃的で積極的',
    recommendedFor: '勝負にこだわる人'
  },
  {
    name: 'ゼニガメ',
    description: '水タイプのバランス型エース',
    personality: '冷静でオールラウンド',
    recommendedFor: 'バランス重視の人'
  }
];

export const GameIntroduction: React.FC<GameIntroductionProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [schoolName, setSchoolName] = useState('');
  const [selectedStarter, setSelectedStarter] = useState<string>('');
  const [starterDetails, setStarterDetails] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Load starter details when step 3 is reached
  useEffect(() => {
    const loadStarterDetails = async () => {
      if (currentStep !== 3 || starterDetails.length > 0) return;
      
      setLoading(true);
      try {
        const details = await Promise.all(
          STARTER_OPTIONS.map(async (option) => {
            const pokemonDetail = await PokemonAPI.getPokemonDetails(option.name);
            return { ...option, pokemonDetail };
          })
        );
        setStarterDetails(details);
      } catch (error) {
        console.error('Failed to load starter details:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStarterDetails();
  }, [currentStep, starterDetails.length]);

  // ステップ1: 物語の導入
  const renderStoryIntroduction = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
          <h1 className="text-5xl font-bold text-white mb-6 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            ⚡ ポケテニマスター ⚡
          </h1>
          
          <div className="space-y-6 text-lg text-white/90 leading-relaxed">
            <p>
              ようこそ、未来のテニス部監督！
            </p>
            <p>
              あなたはこれから、ポケモンたちと一緒に<br/>
              <span className="text-yellow-400 font-bold">全国制覇</span>を目指すテニス部の監督になります。
            </p>
            <p>
              栄冠ナイン風の育成システムで、<br/>
              一匹一匹のポケモンを大切に育て上げ、<br/>
              最強のテニスチームを作り上げましょう！
            </p>
          </div>

          <div className="mt-8 space-y-4">
            <div className="bg-yellow-500/20 border border-yellow-400/50 rounded-lg p-4">
              <h3 className="text-yellow-400 font-bold text-xl mb-2">🎯 ゲームの目的</h3>
              <ul className="text-white/80 text-sm space-y-1 text-left">
                <li>• カードを使って時間を進め、ポケモンを育成</li>
                <li>• 練習で技術を向上させ、試合で勝利を目指す</li>
                <li>• 学校の評判を上げて優秀な新入生をスカウト</li>
                <li>• 3年間で全国大会優勝を達成しよう</li>
              </ul>
            </div>
          </div>

          <button
            onClick={() => setCurrentStep(2)}
            className="mt-8 bg-gradient-to-r from-orange-500 to-red-600 text-white px-8 py-4 rounded-xl font-bold text-xl hover:from-orange-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            はじめよう！ 🚀
          </button>
        </div>
      </div>
    </div>
  );

  // ステップ2: 学校名設定
  const renderSchoolNameSetting = () => (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-teal-900 to-blue-900 flex items-center justify-center p-4">
      <div className="max-w-2xl mx-auto text-center">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
          <h2 className="text-4xl font-bold text-white mb-6">
            🏫 学校名を決めよう
          </h2>
          
          <p className="text-white/80 text-lg mb-8">
            あなたが監督を務めるテニス部の学校名を決めてください。<br/>
            この名前は全国大会での栄光と共に刻まれることになります！
          </p>

          <div className="space-y-6">
            <div>
              <label className="block text-white/90 text-lg font-medium mb-3">
                学校名
              </label>
              <input
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                placeholder="例: さくら高等学校"
                className="w-full p-4 text-xl bg-white/20 border-2 border-white/30 rounded-xl text-white placeholder-white/50 focus:border-yellow-400 focus:outline-none transition-colors"
                maxLength={20}
              />
              <div className="mt-2 text-white/60 text-sm">
                {schoolName.length}/20文字
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                'さくら高校', 'みどり学園', 'あおぞら高校',
                'ひなた学院', 'しろゆり高校', 'あかつき高校'
              ].map(suggestion => (
                <button
                  key={suggestion}
                  onClick={() => setSchoolName(suggestion)}
                  className="p-3 bg-white/10 border border-white/30 rounded-lg text-white/90 hover:bg-white/20 transition-colors text-sm"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => schoolName.trim() && setCurrentStep(3)}
            disabled={!schoolName.trim()}
            className={`mt-8 px-8 py-4 rounded-xl font-bold text-xl transition-all duration-300 transform hover:scale-105 shadow-lg ${
              schoolName.trim()
                ? 'bg-gradient-to-r from-green-500 to-teal-600 text-white hover:from-green-600 hover:to-teal-700'
                : 'bg-gray-500 text-gray-300 cursor-not-allowed'
            }`}
          >
            決定！ ✨
          </button>
        </div>
      </div>
    </div>
  );

  // ステップ3: 御三家選択
  const renderStarterSelection = () => {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-pink-900 to-purple-900 flex items-center justify-center p-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-white mb-4">
              🎾 パートナーを選ぼう
            </h2>
            <p className="text-white/80 text-lg">
              あなたと共に全国制覇を目指す、最初のパートナーを選んでください
            </p>
          </div>

          {loading ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-white">ポケモンたちを準備中...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {starterDetails.map((starter) => (
                <div
                  key={starter.name}
                  onClick={() => setSelectedStarter(starter.name)}
                  className={`cursor-pointer transform transition-all duration-300 hover:scale-105 ${
                    selectedStarter === starter.name ? 'scale-105' : ''
                  }`}
                >
                  <div className={`bg-white/10 backdrop-blur-lg rounded-2xl p-6 border-2 transition-colors ${
                    selectedStarter === starter.name 
                      ? 'border-yellow-400 bg-yellow-400/20' 
                      : 'border-white/30 hover:border-white/50'
                  }`}>
                    {/* ポケモンカード */}
                    <div className="flex justify-center mb-4">
                      <div className="w-32 h-40">
                        <PokemonCard
                          player={{
                            id: starter.name,
                            pokemon_name: starter.name,
                            pokemon_id: starter.pokemonDetail?.id || 0,
                            level: 5,
                            grade: 1,
                            position: 'captain',
                            serve_skill: 35,
                            return_skill: 35,
                            volley_skill: 35,
                            stroke_skill: 35,
                            mental: 40,
                            stamina: 45,
                            condition: 'excellent',
                            motivation: 100,
                            experience: 0,
                            types: starter.pokemonDetail?.types || ['normal']
                          } as Player}
                          size="medium"
                          showStats={false}
                        />
                      </div>
                    </div>

                    <div className="text-center space-y-3">
                      <h3 className="text-2xl font-bold text-white">
                        {starter.name}
                      </h3>
                      <p className="text-white/80">
                        {starter.description}
                      </p>
                      
                      <div className="space-y-2">
                        <div className="bg-white/10 rounded-lg p-3">
                          <div className="text-yellow-300 font-medium text-sm">
                            性格
                          </div>
                          <div className="text-white text-sm">
                            {starter.personality}
                          </div>
                        </div>
                        
                        <div className="bg-white/10 rounded-lg p-3">
                          <div className="text-green-300 font-medium text-sm">
                            おすすめ
                          </div>
                          <div className="text-white text-sm">
                            {starter.recommendedFor}
                          </div>
                        </div>
                      </div>

                      {selectedStarter === starter.name && (
                        <div className="mt-4 p-3 bg-yellow-400/30 rounded-lg border border-yellow-400">
                          <div className="text-yellow-200 font-bold">
                            ✨ 選択中 ✨
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedStarter && (
            <div className="text-center mt-8">
              <button
                onClick={() => setCurrentStep(4)}
                className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white px-8 py-4 rounded-xl font-bold text-xl hover:from-yellow-600 hover:to-orange-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                {selectedStarter}と一緒にがんばる！ 🔥
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ステップ4: マネージャー導入（簡易版）
  const renderManagerIntroduction = () => (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
          <div className="mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center text-4xl mx-auto mb-4">
              👩‍💼
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">
              📋 マネージャーの紹介
            </h2>
          </div>

          <div className="space-y-6 text-lg text-white/90">
            <div className="bg-pink-500/20 border border-pink-400/50 rounded-lg p-6">
              <h3 className="text-pink-300 font-bold text-xl mb-4">
                「はじめまして、監督！」
              </h3>
              <div className="space-y-3 text-left">
                <p>
                  私がこのテニス部のマネージャーです。<br/>
                  あなたと{selectedStarter}をサポートします！
                </p>
                <p>
                  これから一緒に<strong className="text-yellow-400">{schoolName}</strong>を<br/>
                  全国制覇に導きましょう。
                </p>
              </div>
            </div>

            <div className="bg-blue-500/20 border border-blue-400/50 rounded-lg p-4">
              <h4 className="text-blue-300 font-bold mb-2">💡 簡単な操作説明</h4>
              <ul className="text-sm text-white/80 space-y-1 text-left">
                <li>• カードをクリックして練習や時間を進めます</li>
                <li>• 部員タブで選手の詳細情報を確認できます</li>
                <li>• 試合で勝利して学校の評判を上げましょう</li>
                <li>• 詳しい操作は後で教えますのでご安心を！</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <p className="text-white/70 text-sm">
              ※ 詳細なチュートリアルは今後のアップデートで実装予定です
            </p>
            
            <button
              onClick={() => {
                onComplete({
                  schoolName: schoolName.trim(),
                  selectedStarter,
                  managerName: 'マネージャー' // TODO: 後で名前設定機能を追加
                });
              }}
              className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-8 py-4 rounded-xl font-bold text-xl hover:from-purple-600 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              全国制覇への道のりを始める！ 🏆
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // メインレンダー
  switch (currentStep) {
    case 1:
      return renderStoryIntroduction();
    case 2:
      return renderSchoolNameSetting();
    case 3:
      return renderStarterSelection();
    case 4:
      return renderManagerIntroduction();
    default:
      return renderStoryIntroduction();
  }
};

export default GameIntroduction;