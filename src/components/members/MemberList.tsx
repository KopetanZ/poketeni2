'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Player } from '@/types/game';
import PokemonCard from '@/components/PokemonCard';
import { PlayerRankBadge, AssessmentComparison } from '@/components/player/PlayerAssessmentDisplay';

interface MemberListProps {
  players: Player[];
  onPlayerSelect: (player: Player) => void;
}

// 個別プレイヤーカードコンポーネントをメモ化
const MemberCard = React.memo<{ 
  player: Player;
  onSelect: (player: Player) => void;
  getCurrentTraining: (player: Player) => string;
  getGradeDisplay: (grade: number) => string;
  getConditionColor: (condition: string) => string;
}>(({ player, onSelect, getCurrentTraining, getGradeDisplay, getConditionColor }) => (
  <div 
    onClick={() => onSelect(player)}
    className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 cursor-pointer transition-all duration-200 hover:shadow-md border border-gray-200"
  >
    {/* 上部：ポケモンカード（小サイズ） */}
    <div className="flex justify-center mb-3">
      <PokemonCard 
        player={player} 
        size="small"
        showStats={false}
      />
    </div>

    {/* 基本情報 */}
    <div className="text-center space-y-2">
      {/* 名前と学年 */}
      <div>
        <h3 className="font-bold text-lg text-gray-800">
          {player.pokemon_name}
        </h3>
        <div className="text-sm text-gray-600">
          {getGradeDisplay(player.grade)} | Lv.{player.level}
        </div>
      </div>

      {/* コンディション */}
      <div className="flex justify-center">
        <span className={`px-2 py-1 rounded text-xs font-medium ${getConditionColor(player.condition)}`}>
          状態: {player.condition}
        </span>
      </div>

      {/* 基礎能力（コンパクト表示） */}
      <div className="grid grid-cols-2 gap-1 text-xs">
        <div className="bg-red-50 p-1 rounded">
          <span className="text-red-700 font-medium">サーブ</span>
          <div className="font-bold">{player.serve_skill}</div>
        </div>
        <div className="bg-blue-50 p-1 rounded">
          <span className="text-blue-700 font-medium">リターン</span>
          <div className="font-bold">{player.return_skill}</div>
        </div>
        <div className="bg-green-50 p-1 rounded">
          <span className="text-green-700 font-medium">ボレー</span>
          <div className="font-bold">{player.volley_skill}</div>
        </div>
        <div className="bg-purple-50 p-1 rounded">
          <span className="text-purple-700 font-medium">ストローク</span>
          <div className="font-bold">{player.stroke_skill}</div>
        </div>
      </div>

      {/* 現在の練習内容 */}
      <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
        <div className="text-yellow-800 text-xs font-medium">現在の練習</div>
        <div className="text-yellow-900 text-sm font-bold">
          {getCurrentTraining(player)}
        </div>
      </div>

      {/* 査定バッジ */}
      <div className="flex justify-center pt-2">
        <PlayerRankBadge player={player} />
      </div>

      {/* 詳細ボタンのヒント */}
      <div className="text-xs text-gray-500 pt-1">
        クリックで詳細表示
      </div>
    </div>
  </div>
));

MemberCard.displayName = 'MemberCard';

export const MemberList: React.FC<MemberListProps> = React.memo(({ players, onPlayerSelect }) => {
  const [selectedPosition, setSelectedPosition] = useState<string>('all');
  
  // ポジション別フィルタリング（メモ化）
  const filteredPlayers = useMemo(() => {
    return selectedPosition === 'all' 
      ? players 
      : players.filter(player => player.position === selectedPosition);
  }, [players, selectedPosition]);

  // ポジション別の並び順（メモ化）
  const sortedPlayers = useMemo(() => {
    const positionOrder = { 'captain': 0, 'vice_captain': 1, 'regular': 2, 'member': 3 };
    return [...filteredPlayers].sort((a, b) => {
      return positionOrder[a.position] - positionOrder[b.position];
    });
  }, [filteredPlayers]);

  // 練習内容の取得（簡易版）をメモ化
  const getCurrentTraining = useCallback((player: Player): string => {
    const highestStat = Math.max(
      player.serve_skill,
      player.return_skill,
      player.volley_skill,
      player.stroke_skill
    );
    
    if (highestStat === player.serve_skill) return 'サーブ練習';
    if (highestStat === player.return_skill) return 'リターン練習';
    if (highestStat === player.volley_skill) return 'ボレー練習';
    return 'ストローク練習';
  }, []);

  // 学年表示をメモ化
  const getGradeDisplay = useCallback((grade: number): string => {
    return `${grade}年生`;
  }, []);

  // コンディション表示カラーをメモ化
  const getConditionColor = useCallback((condition: string): string => {
    const colors = {
      'excellent': 'text-green-600 bg-green-100',
      'good': 'text-blue-600 bg-blue-100', 
      'normal': 'text-gray-600 bg-gray-100',
      'poor': 'text-orange-600 bg-orange-100',
      'terrible': 'text-red-600 bg-red-100'
    };
    return colors[condition as keyof typeof colors] || colors.normal;
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* ヘッダー */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">👥 テニス部員一覧</h2>
        <div className="text-sm text-gray-600">
          総部員数: {players.length}人
        </div>
      </div>

      {/* チーム査定ランキング */}
      <div className="mb-6">
        <AssessmentComparison players={players.slice(0, 5)} />
      </div>

      {/* フィルタリング */}
      <div className="mb-6">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedPosition('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedPosition === 'all'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            全員 ({players.length})
          </button>
          <button
            onClick={() => setSelectedPosition('captain')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedPosition === 'captain'
                ? 'bg-yellow-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            👑 部長 ({players.filter(p => p.position === 'captain').length})
          </button>
          <button
            onClick={() => setSelectedPosition('vice_captain')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedPosition === 'vice_captain'
                ? 'bg-purple-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            ⭐ 副部長 ({players.filter(p => p.position === 'vice_captain').length})
          </button>
          <button
            onClick={() => setSelectedPosition('regular')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedPosition === 'regular'
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            🎾 レギュラー ({players.filter(p => p.position === 'regular').length})
          </button>
          <button
            onClick={() => setSelectedPosition('member')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedPosition === 'member'
                ? 'bg-gray-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            📝 部員 ({players.filter(p => p.position === 'member').length})
          </button>
        </div>
      </div>

      {/* 部員リスト */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {sortedPlayers.map((player) => (
          <MemberCard
            key={player.id}
            player={player}
            onSelect={onPlayerSelect}
            getCurrentTraining={getCurrentTraining}
            getGradeDisplay={getGradeDisplay}
            getConditionColor={getConditionColor}
          />
        ))}
      </div>

      {/* 部員がいない場合 */}
      {sortedPlayers.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-4">🏆</div>
          <p>該当する部員がいません</p>
          <p className="text-sm mt-2">フィルターを変更して確認してください</p>
        </div>
      )}
    </div>
  );
});

MemberList.displayName = 'MemberList';

export default MemberList;