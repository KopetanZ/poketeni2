'use client';

import { useState, useEffect } from 'react';
import { Player } from '@/types/game';
import { TrainingCard } from '@/types/training-cards';
import PokemonCard from '@/components/PokemonCard';
import { useSoundSystem, SoundControls } from '@/lib/sound-system';

interface EikanNineMainGameProps {
  cards: TrainingCard[];
  players: Player[];
  currentProgress: number;
  onCardUse: (cardId: string) => void;
  isLoading?: boolean;
  schoolReputation: number;
}

// 栄冠ナイン式のマス目タイプ
type SquareType = 
  | 'good'           // 青マス - 良いイベント
  | 'bad'            // 赤マス - 悪いイベント  
  | 'practice'       // 黄マス - 選んだカードの練習効率アップ
  | 'graduate'       // 人マス - 卒業生特殊イベント
  | 'random'         // 白マス - ランダムイベント
  | 'fixed_event'    // 確定イベント（公式戦・式典等）
  | 'normal';        // 通常マス

interface GameSquare {
  id: number;
  type: SquareType;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export default function EikanNineMainGame({ 
  cards, 
  players, 
  currentProgress, 
  onCardUse, 
  isLoading = false,
  schoolReputation
}: EikanNineMainGameProps) {
  const [selectedCard, setSelectedCard] = useState<TrainingCard | null>(null);
  const [managerTip, setManagerTip] = useState<string>('');
  const [hoveredSquare, setHoveredSquare] = useState<GameSquare | null>(null);
  const [managerImage, setManagerImage] = useState<string>('');
  
  // 音響システム初期化
  const soundSystem = useSoundSystem();
  const [soundInitialized, setSoundInitialized] = useState(false);
  
  // マネージャー画像リスト
  const managerImages = [
    '/img/mgr/ChatGPT Image 202587 12_34_08.png',
    '/img/mgr/ChatGPT Image 202587 12_40_09.png',
    '/img/mgr/ChatGPT Image 202587 12_41_06.png'
  ];
  
  // 評判に基づく手札枚数計算
  const getHandSize = () => {
    if (schoolReputation < 20) return 4;
    if (schoolReputation < 50) return 5;
    if (schoolReputation < 100) return 6;
    if (schoolReputation < 200) return 7;
    return 8;
  };

  // 栄冠ナイン準拠の年間スケジュール（固定イベントを大幅削減）
  const createSugorokuSquares = (): GameSquare[] => {
    const baseSquares: GameSquare[] = [
      // 4月 - 入学・新学期 
      { id: 1, type: 'normal', name: '新学期', description: '新たな1年の始まり', icon: '🌱', color: 'from-green-400 to-green-500' },
      { id: 2, type: 'fixed_event', name: '入学式', description: '新入部員が加入する', icon: '🌸', color: 'from-pink-500 to-rose-500' },
      { id: 3, type: 'normal', name: '春練習', description: '基本的な練習', icon: '🎾', color: 'from-green-400 to-green-500' },
      
      // 5月-6月 - 春季大会シーズン
      { id: 4, type: 'normal', name: '練習', description: '日々の練習', icon: '💪', color: 'from-green-400 to-green-500' },
      { id: 5, type: 'fixed_event', name: '春季県大会', description: '県大会開催', icon: '🏆', color: 'from-yellow-600 to-orange-600' },
      { id: 6, type: 'normal', name: '練習', description: '日々の練習', icon: '💪', color: 'from-green-400 to-green-500' },
      
      // 7月-8月 - 夏の大会シーズン（最重要期間）
      { id: 7, type: 'fixed_event', name: '夏季県大会', description: '最も重要な県大会', icon: '☀️', color: 'from-yellow-600 to-orange-600' },
      { id: 8, type: 'fixed_event', name: '夏季合宿', description: '集中強化合宿', icon: '🏕️', color: 'from-blue-600 to-indigo-600' },
      { id: 9, type: 'normal', name: '夏休み', description: '自由練習時間', icon: '🌅', color: 'from-green-400 to-green-500' },
      
      // 9月-10月 - 秋季大会
      { id: 10, type: 'normal', name: '新学期', description: '2学期開始', icon: '🍂', color: 'from-green-400 to-green-500' },
      { id: 11, type: 'fixed_event', name: '秋季県大会', description: '新人メインの県大会', icon: '🍁', color: 'from-orange-600 to-red-600' },
      { id: 12, type: 'normal', name: '文化祭', description: 'モチベーション向上', icon: '🎪', color: 'from-green-400 to-green-500' },
      
      // 11月-12月 - 冬季練習
      { id: 13, type: 'normal', name: '基礎練習', description: '体力作りの季節', icon: '❄️', color: 'from-green-400 to-green-500' },
      { id: 14, type: 'normal', name: '冬季練習', description: '基礎体力向上', icon: '⛄', color: 'from-green-400 to-green-500' },
      { id: 15, type: 'fixed_event', name: '終業式', description: '1年の締めくくり', icon: '🏫', color: 'from-indigo-600 to-purple-600' },
      
      // 1月-3月 - 冬〜春準備期間
      { id: 16, type: 'normal', name: '新年', description: '新たな気持ちで', icon: '🎍', color: 'from-green-400 to-green-500' },
      { id: 17, type: 'normal', name: '冬季練習', description: '寒い中での練習', icon: '🥶', color: 'from-green-400 to-green-500' },
      { id: 18, type: 'fixed_event', name: '卒業式', description: '先輩たちの卒業', icon: '🎓', color: 'from-pink-600 to-purple-600' },
      
      // 残りは通常マスで埋める（栄冠ナインは24マス1年）
      { id: 19, type: 'normal', name: '練習', description: '日々の練習', icon: '💪', color: 'from-green-400 to-green-500' },
      { id: 20, type: 'normal', name: '練習', description: '日々の練習', icon: '💪', color: 'from-green-400 to-green-500' },
      { id: 21, type: 'normal', name: '練習', description: '日々の練習', icon: '💪', color: 'from-green-400 to-green-500' },
      { id: 22, type: 'normal', name: '練習', description: '日々の練習', icon: '💪', color: 'from-green-400 to-green-500' },
      { id: 23, type: 'normal', name: '練習', description: '日々の練習', icon: '💪', color: 'from-green-400 to-green-500' },
      { id: 24, type: 'normal', name: '練習', description: '日々の練習', icon: '💪', color: 'from-green-400 to-green-500' }
    ];
    
    return baseSquares;
  };

  const squares = createSugorokuSquares();
  
  // 現在位置から1.5周分のマス目を表示（レスポンシブ調整）
  const getDisplaySquares = () => {
    const currentPos = currentProgress % 24;
    // 画面幅に応じて表示数を調整（1.5周分を基本とするが、表示可能な範囲で動的調整）
    const baseDisplayCount = 36; // 1.5周分（24 * 1.5）
    const displayCount = Math.min(baseDisplayCount, 20); // 最大20マス程度に制限
    const result = [];
    
    for (let i = 0; i < displayCount; i++) {
      const squareIndex = (currentPos + i) % 24;
      result.push({
        ...squares[squareIndex],
        displayIndex: i,
        isCurrent: i === 0,
        isNext: selectedCard ? i === selectedCard.number : undefined
      });
    }
    
    return result;
  };

  const displaySquares = getDisplaySquares();
  const handSize = getHandSize();
  const displayCards = cards.slice(0, handSize);

  // マネージャーのTIPS
  const managerTips = [
    '青いマスは良いイベントが起こりやすいです！',
    '黄色いマスでは選んだカードの練習効果がアップします',
    '赤いマスは避けたいですが、時には必要な試練かも...',
    '卒業生のマスでは特別な指導が受けられます',
    '評判を上げると手札が増えて有利になります',
    '確定イベントは必ず発生するので計画を立てて',
    '白いマスはランダム！何が起こるかお楽しみ',
    '季節によってイベントの内容が変わります'
  ];

  // 初期化用のuseEffect（1回だけ実行）
  useEffect(() => {
    const randomTip = managerTips[Math.floor(Math.random() * managerTips.length)];
    setManagerTip(randomTip);
    
    // ランダムにマネージャー画像を選択
    const randomImage = managerImages[Math.floor(Math.random() * managerImages.length)];
    setManagerImage(randomImage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 空の依存配列で初期化時のみ実行（managerTips, managerImagesは静的配列のため除外）

  // 音響システム初期化用のuseEffect（分離）
  useEffect(() => {
    if (!soundInitialized) {
      const initSound = async () => {
        try {
          await soundSystem.initializeSound();
          setSoundInitialized(true);
          soundSystem.playBGM(SoundControls.SCENE_BGM.training);
        } catch (error) {
          console.warn('Sound initialization failed:', error);
        }
      };
      
      // ユーザーの最初のインタラクションを待つ
      const handleFirstInteraction = () => {
        initSound();
        document.removeEventListener('click', handleFirstInteraction);
        document.removeEventListener('keydown', handleFirstInteraction);
      };
      
      document.addEventListener('click', handleFirstInteraction, { once: true });
      document.addEventListener('keydown', handleFirstInteraction, { once: true });
      
      // クリーンアップ関数
      return () => {
        document.removeEventListener('click', handleFirstInteraction);
        document.removeEventListener('keydown', handleFirstInteraction);
      };
    }
  }, [soundSystem, soundInitialized]);

  const getSquareStyle = (square: GameSquare & { isCurrent?: boolean; isNext?: boolean }) => {
    let style = `relative w-14 h-14 sm:w-16 sm:h-16 md:w-18 md:h-18 lg:w-20 lg:h-20 rounded-lg border-2 flex items-center justify-center text-xs sm:text-sm font-bold transition-all duration-300 bg-gradient-to-br ${square.color}`;
    
    if (square.isCurrent) {
      style += ' ring-4 ring-white ring-opacity-70 animate-pulse scale-110';
    } else if (square.isNext) {
      style += ' ring-4 ring-blue-400 ring-opacity-50 scale-105';
    }
    
    return style;
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-green-100 via-blue-50 to-purple-100">
      {/* 上部：すごろく部分（1.5周分） - レスポンシブサイズ */}
      <div className="h-48 md:h-56 lg:h-64 xl:h-72 bg-white bg-opacity-80 rounded-lg m-2 p-3 md:p-4 shadow-lg border-2 border-green-300">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold text-green-800 flex items-center">
            🎲 学校生活すごろく
            <span className="ml-2 text-sm text-gray-600">
              現在: {Math.floor(currentProgress / 24) + 1}年目 {(currentProgress % 24) + 1}日目
            </span>
          </h3>
          <div className="text-sm text-gray-600">
            評判: {schoolReputation} (手札: {handSize}枚)
          </div>
        </div>
        
        {/* すごろくマス表示 - レスポンシブサイズ */}
        <div className="flex-1 overflow-x-auto">
          <div className="flex space-x-2 md:space-x-3 pb-2 min-w-max">
            {displaySquares.map((square, index) => (
              <div 
                key={`${square.id}-${index}`} 
                className="flex-shrink-0"
                onMouseEnter={() => setHoveredSquare(square)}
                onMouseLeave={() => setHoveredSquare(null)}
              >
                <div className={getSquareStyle(square)}>
                  <div className="text-center">
                    <div className="text-lg mb-1">{square.icon}</div>
                  </div>
                  
                  {/* 現在位置マーカー */}
                  {square.isCurrent && (
                    <div className="absolute -top-3 -right-3 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">🎾</span>
                    </div>
                  )}
                  
                  {/* 予測位置マーカー */}
                  {square.isNext && (
                    <div className="absolute -top-3 -right-3 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">→</span>
                    </div>
                  )}
                </div>
                
                {/* マス名表示 - レスポンシブ */}
                <div className="text-center mt-1">
                  <div className="text-xs font-semibold text-gray-700 truncate w-14 sm:w-16 md:w-18 lg:w-20">
                    {square.name}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 中央：成長ログ・ポケモン練習風景・マネージャー */}
      <div className="flex-1 flex relative p-2">
        {/* 左側：成長ログエリア - レスポンシブ幅 */}
        <div className="w-64 md:w-72 lg:w-80 xl:w-96 bg-white bg-opacity-80 rounded-lg mr-2 p-3 md:p-4 shadow-lg border-2 border-blue-300 overflow-y-auto">
          <h3 className="text-lg font-bold text-blue-800 mb-3 flex items-center">
            📈 成長ログ
          </h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            <div className="bg-green-50 border-l-4 border-green-500 p-2 rounded">
              <div className="text-sm text-green-800">
                <div className="font-semibold text-xs">ピカチュウ がレベルアップ！</div>
                <div className="text-xs text-gray-600">Lv.12 → Lv.13 (サーブ +2)</div>
              </div>
            </div>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-2 rounded">
              <div className="text-sm text-blue-800">
                <div className="font-semibold text-xs">合同練習で技術向上</div>
                <div className="text-xs text-gray-600">チーム全体のボレー能力が向上</div>
              </div>
            </div>
            <div className="bg-purple-50 border-l-4 border-purple-500 p-2 rounded">
              <div className="text-sm text-purple-800">
                <div className="font-semibold text-xs">リザードン が進化！</div>
                <div className="text-xs text-gray-600">リザードがリザードンに進化しました</div>
              </div>
            </div>
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-2 rounded">
              <div className="text-sm text-yellow-800">
                <div className="font-semibold text-xs">地区大会優勝！</div>
                <div className="text-xs text-gray-600">評判+25、資金+5000円獲得</div>
              </div>
            </div>
            <div className="bg-indigo-50 border-l-4 border-indigo-500 p-2 rounded">
              <div className="text-sm text-indigo-800">
                <div className="font-semibold text-xs">新入部員加入</div>
                <div className="text-xs text-gray-600">フシギダネが部活に加入しました</div>
              </div>
            </div>
            <div className="bg-red-50 border-l-4 border-red-500 p-2 rounded">
              <div className="text-sm text-red-800">
                <div className="font-semibold text-xs">練習試合で敗北</div>
                <div className="text-xs text-gray-600">○○高校に0-3で敗北</div>
              </div>
            </div>
            <div className="bg-pink-50 border-l-4 border-pink-500 p-2 rounded">
              <div className="text-sm text-pink-800">
                <div className="font-semibold text-xs">特別練習実施</div>
                <div className="text-xs text-gray-600">精神力強化練習を実施</div>
              </div>
            </div>
            <div className="bg-teal-50 border-l-4 border-teal-500 p-2 rounded">
              <div className="text-sm text-teal-800">
                <div className="font-semibold text-xs">装備を入手</div>
                <div className="text-xs text-gray-600">プロ用ラケットを獲得</div>
              </div>
            </div>
          </div>
        </div>

        {/* 中央：練習場背景 */}
        <div className="flex-1 relative rounded-lg shadow-inner mx-2">
          <div className="absolute inset-0 bg-gradient-to-b from-green-200 to-green-300 rounded-lg">
            <div className="absolute inset-0 bg-court-pattern opacity-20"></div>
          </div>

          <div className="relative z-10 flex items-center justify-center h-full">
            {/* 練習中のポケモン表示 - PokemonCardを使用 */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3 lg:gap-4">
              {players.slice(0, 6).map((player, index) => (
                <div 
                  key={player.id} 
                  className="animate-bounce"
                  style={{ animationDelay: `${index * 200}ms` }}
                >
                  <PokemonCard 
                    player={player} 
                    size="small"
                    showStats={false}
                  />
                </div>
              ))}
            </div>

            {/* マネージャーキャラとTIPS */}
            <div className="absolute bottom-6 right-6">
              <div className="relative">
                {/* マネージャーキャラ - レスポンシブサイズ */}
                <div className="w-24 h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center text-4xl shadow-xl overflow-hidden border-4 border-white">
                  {managerImage ? (
                    <img 
                      src={managerImage} 
                      alt="マネージャー" 
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <span className="text-4xl">👩‍💼</span>
                  )}
                </div>
                
                {/* 吹き出し - レスポンシブサイズ */}
                <div className="absolute -top-20 -left-40 md:-left-48 bg-white rounded-lg p-3 md:p-4 shadow-xl border-2 border-pink-300 max-w-56 md:max-w-64">
                  <div className="text-xs md:text-sm text-gray-700 text-center font-medium">{managerTip}</div>
                  {/* 吹き出しの尻尾 */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2">
                    <div className="border-l-8 border-r-8 border-t-8 border-transparent border-t-white"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 下部：カード手札 - レスポンシブ高さ */}
      <div className="h-32 sm:h-36 md:h-40 lg:h-44 bg-white bg-opacity-90 rounded-lg m-2 p-3 md:p-4 shadow-lg border-2 border-blue-300">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-bold text-blue-800">🃏 練習カード手札</h3>
          <div className="text-sm text-gray-600">
            {displayCards.length}/{handSize}枚
          </div>
        </div>
        
        <div className="flex space-x-1 sm:space-x-2 overflow-x-auto pb-2">
          {displayCards.map((card, index) => {
            const cardWidth = handSize > 6 ? 'w-12 sm:w-14 md:w-16' : handSize > 5 ? 'w-16 sm:w-18 md:w-20' : 'w-18 sm:w-20 md:w-24';
            const isSelected = selectedCard?.id === card.id;
            
            return (
              <div
                key={card.id}
                className={`${cardWidth} flex-shrink-0 cursor-pointer transition-all duration-200 ${
                  isSelected 
                    ? 'transform scale-110 -translate-y-2' 
                    : 'hover:transform hover:scale-105 hover:-translate-y-1'
                } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => !isLoading && setSelectedCard(isSelected ? null : card)}
              >
                <div className={`h-20 sm:h-22 md:h-24 lg:h-28 rounded-lg p-2 text-white text-center flex flex-col justify-between shadow-lg border-2 ${
                  isSelected ? 'border-yellow-400 shadow-yellow-500/25' : 'border-transparent'
                } ${
                  card.rarity === 'legendary' ? 'bg-gradient-to-br from-purple-600 to-pink-600' :
                  card.rarity === 'rare' ? 'bg-gradient-to-br from-blue-500 to-indigo-600' :
                  card.rarity === 'uncommon' ? 'bg-gradient-to-br from-green-500 to-teal-600' :
                  'bg-gradient-to-br from-gray-500 to-slate-600'
                }`}>
                  <div className="text-xs font-bold truncate">{card.name}</div>
                  <div className="text-sm md:text-lg font-bold">{card.number}日</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* カード使用ボタン */}
      {selectedCard && (
        <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 z-20">
          <button
            onClick={() => {
              // 効果音再生
              if (soundInitialized) {
                soundSystem.playSFX(SoundControls.SFX_TYPES.cardUse);
              }
              onCardUse(selectedCard.id);
              setSelectedCard(null);
            }}
            disabled={isLoading}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white px-8 py-4 rounded-2xl font-bold text-xl shadow-2xl transition-all duration-200 hover:scale-110 disabled:opacity-50"
          >
            {isLoading ? '⏳ 進行中...' : `📅 ${selectedCard.name}を使用`}
          </button>
        </div>
      )}

      {/* マス詳細ツールチップ */}
      {hoveredSquare && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-2xl border-2 border-gray-300 p-4 z-50 max-w-sm">
          <div className="text-center">
            <div className="text-2xl mb-2">{hoveredSquare.icon}</div>
            <h4 className="font-bold text-gray-800 mb-1">{hoveredSquare.name}</h4>
            <p className="text-sm text-gray-600">{hoveredSquare.description}</p>
            <div className={`mt-2 px-3 py-1 rounded-full text-xs font-semibold inline-block ${
              hoveredSquare.type === 'good' ? 'bg-blue-100 text-blue-800' :
              hoveredSquare.type === 'bad' ? 'bg-red-100 text-red-800' :
              hoveredSquare.type === 'practice' ? 'bg-yellow-100 text-yellow-800' :
              hoveredSquare.type === 'graduate' ? 'bg-purple-100 text-purple-800' :
              hoveredSquare.type === 'fixed_event' ? 'bg-indigo-100 text-indigo-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {hoveredSquare.type === 'good' ? '良いイベント' :
               hoveredSquare.type === 'bad' ? '悪いイベント' :
               hoveredSquare.type === 'practice' ? '練習効率UP' :
               hoveredSquare.type === 'graduate' ? '卒業生イベント' :
               hoveredSquare.type === 'fixed_event' ? '確定イベント' :
               'ランダムイベント'}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .bg-court-pattern {
          background-image: 
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 35px,
              rgba(255,255,255,0.1) 35px,
              rgba(255,255,255,0.1) 37px
            ),
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 35px,
              rgba(255,255,255,0.1) 35px,
              rgba(255,255,255,0.1) 37px
            );
        }
      `}</style>
    </div>
  );
}