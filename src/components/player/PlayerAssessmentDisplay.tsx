'use client';

import React, { useMemo } from 'react';
import { Player } from '@/types/game';
import { PlayerGenerator } from '@/lib/player-generator';
import { AssessmentValues, PlayerRank } from '@/lib/character-generation-system';
import { Star, Award, Zap, Target } from 'lucide-react';

interface PlayerAssessmentDisplayProps {
  player: Player;
  showDetails?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export default React.memo(function PlayerAssessmentDisplay({ 
  player, 
  showDetails = true, 
  size = 'medium' 
}: PlayerAssessmentDisplayProps) {
  const assessment = useMemo(() => 
    PlayerGenerator.getPlayerAssessment(player), [player]
  );

  const getRankColor = useMemo(() => (rank: PlayerRank): string => {
    switch (rank) {
      case 'S+': return 'text-red-500 bg-red-100';
      case 'S': return 'text-orange-500 bg-orange-100';
      case 'A+': return 'text-yellow-500 bg-yellow-100';
      case 'A': return 'text-yellow-600 bg-yellow-50';
      case 'B+': return 'text-blue-500 bg-blue-100';
      case 'B': return 'text-blue-600 bg-blue-50';
      case 'C+': return 'text-green-500 bg-green-100';
      case 'C': return 'text-green-600 bg-green-50';
      case 'D+': return 'text-gray-500 bg-gray-100';
      case 'D': return 'text-gray-600 bg-gray-50';
      case 'E': return 'text-slate-500 bg-slate-100';
      case 'F': return 'text-slate-600 bg-slate-50';
      case 'G': return 'text-slate-700 bg-slate-200';
    }
  }, []);

  const getStarDisplay = useMemo(() => (starRating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={size === 'small' ? 12 : size === 'medium' ? 16 : 20}
        className={i < starRating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
      />
    ));
  }, [size]);

  const getSizeClasses = useMemo(() => {
    switch (size) {
      case 'small':
        return {
          container: 'text-xs',
          rank: 'px-1.5 py-0.5 text-xs',
          assessment: 'text-xs',
          details: 'text-xs'
        };
      case 'large':
        return {
          container: 'text-lg',
          rank: 'px-4 py-2 text-lg',
          assessment: 'text-base',
          details: 'text-sm'
        };
      default:
        return {
          container: 'text-sm',
          rank: 'px-3 py-1 text-sm',
          assessment: 'text-sm',
          details: 'text-xs'
        };
    }
  }, [size]);

  const classes = getSizeClasses;

  if (size === 'small') {
    return (
      <div className={`flex items-center gap-2 ${classes.container}`}>
        <span className={`${getRankColor(assessment.rank)} ${classes.rank} rounded-full font-bold`}>
          {assessment.rank}
        </span>
        <div className="flex">{getStarDisplay(assessment.star_rating)}</div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm p-3 ${classes.container}`}>
      {/* ランクと星数 */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Award size={size === 'large' ? 24 : 20} className="text-purple-600" />
          <span className={`${getRankColor(assessment.rank)} ${classes.rank} rounded-lg font-bold`}>
            {assessment.rank}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {getStarDisplay(assessment.star_rating)}
          <span className={`ml-1 font-semibold text-gray-600 ${classes.assessment}`}>
            {assessment.star_rating}/5
          </span>
        </div>
      </div>

      {/* 総合査定値 */}
      <div className="flex items-center gap-2 mb-3">
        <Target size={16} className="text-blue-600" />
        <span className={`font-semibold text-gray-800 ${classes.assessment}`}>
          総合査定: {assessment.total.toFixed(0)}
        </span>
      </div>

      {/* 詳細表示 */}
      {showDetails && (
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
          <div className={classes.details}>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">基礎能力:</span>
              <span className="font-medium text-blue-600">
                {assessment.base_stats.toFixed(0)}
              </span>
            </div>
          </div>
          
          <div className={classes.details}>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">特殊能力:</span>
              <span className="font-medium text-purple-600">
                {assessment.special_abilities.toFixed(0)}
              </span>
            </div>
          </div>

          {/* 特殊能力一覧 */}
          {player.special_abilities && player.special_abilities.length > 0 && (
            <div className="col-span-2 mt-2 pt-2 border-t border-gray-100">
              <div className={`text-gray-600 mb-1 ${classes.details}`}>特殊能力:</div>
              <div className="flex flex-wrap gap-1">
                {player.special_abilities.map((ability, index) => (
                  <span
                    key={index}
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      ability.color === 'gold' ? 'bg-yellow-100 text-yellow-800' :
                      ability.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                      ability.color === 'green' ? 'bg-green-100 text-green-800' :
                      ability.color === 'red' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {ability.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ランク説明ツールチップ */}
      <div className={`mt-2 text-gray-500 ${classes.details}`}>
        {assessment.rank === 'S+' && '🏆 伝説級の選手'}
        {assessment.rank === 'S' && '⭐ 超一流選手'}
        {assessment.rank === 'A+' && '🔥 エース級選手'}
        {assessment.rank === 'A' && '💫 一流選手'}
        {(assessment.rank === 'B+' || assessment.rank === 'B') && '⚡ 有望選手'}
        {(assessment.rank === 'C+' || assessment.rank === 'C') && '🌱 成長株選手'}
        {(assessment.rank.includes('D') || assessment.rank.includes('E')) && '📈 発展途上選手'}
        {(assessment.rank === 'F' || assessment.rank === 'G') && '🌟 新人選手'}
      </div>
    </div>
  );
});

// 簡易版コンポーネント（プレイヤーリスト用）
export const PlayerRankBadge = React.memo<{ player: Player }>(({ player }) => {
  const assessment = useMemo(() => 
    PlayerGenerator.getPlayerAssessment(player), [player]
  );
  
  const getRankColor = useMemo(() => (rank: PlayerRank): string => {
    switch (rank) {
      case 'S+': return 'bg-red-500 text-white';
      case 'S': return 'bg-orange-500 text-white';
      case 'A+': return 'bg-yellow-500 text-white';
      case 'A': return 'bg-yellow-600 text-white';
      case 'B+': return 'bg-blue-500 text-white';
      case 'B': return 'bg-blue-600 text-white';
      case 'C+': return 'bg-green-500 text-white';
      case 'C': return 'bg-green-600 text-white';
      default: return 'bg-gray-500 text-white';
    }
  }, []);

  return (
    <div className="flex items-center gap-1">
      <span className={`px-2 py-1 rounded text-xs font-bold ${getRankColor(assessment.rank)}`}>
        {assessment.rank}
      </span>
      <div className="flex">
        {Array.from({ length: assessment.star_rating }, (_, i) => (
          <Star key={i} size={12} className="text-yellow-400 fill-yellow-400" />
        ))}
      </div>
    </div>
  );
});

PlayerRankBadge.displayName = 'PlayerRankBadge';

// 査定比較コンポーネント
export const AssessmentComparison = React.memo<{ players: Player[] }>(({ players }) => {
  const assessments = useMemo(() => {
    return players.map(player => ({
      player,
      assessment: PlayerGenerator.getPlayerAssessment(player)
    })).sort((a, b) => b.assessment.total - a.assessment.total);
  }, [players]);

  const teamAverage = useMemo(() => {
    return assessments.reduce((sum, item) => sum + item.assessment.total, 0) / assessments.length;
  }, [assessments]);

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
      <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
        <Award size={20} className="text-purple-600" />
        チーム査定ランキング
      </h3>
      
      <div className="space-y-2">
        {assessments.map((item, index) => (
          <div key={item.player.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold text-gray-600 w-6">
                {index + 1}
              </span>
              <span className="font-medium">
                {item.player.pokemon_name}
              </span>
              <PlayerRankBadge player={item.player} />
            </div>
            <div className="text-right">
              <div className="font-semibold text-gray-800">
                {item.assessment.total.toFixed(0)}
              </div>
              <div className="text-xs text-gray-500">
                基礎{item.assessment.base_stats.toFixed(0)} + 
                特殊{item.assessment.special_abilities.toFixed(0)}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-3 pt-3 border-t border-gray-200 text-sm text-gray-600">
        チーム平均査定: {teamAverage.toFixed(0)}
      </div>
    </div>
  );
});

AssessmentComparison.displayName = 'AssessmentComparison';