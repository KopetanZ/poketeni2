'use client';

import React from 'react';
import { EnhancedSpecialAbility } from '@/types/special-abilities';

interface SpecialAbilityDisplayProps {
  abilities: EnhancedSpecialAbility[];
  showDescription?: boolean;
  size?: 'small' | 'medium' | 'large';
  layout?: 'horizontal' | 'vertical';
}

const SpecialAbilityDisplay: React.FC<SpecialAbilityDisplayProps> = ({
  abilities,
  showDescription = true,
  size = 'medium',
  layout = 'vertical'
}) => {
  if (!abilities || abilities.length === 0) {
    return (
      <div className={`text-gray-500 text-${size === 'small' ? 'xs' : 'sm'}`}>
        特殊能力なし
      </div>
    );
  }

  // 色に応じたスタイル
  const getAbilityColorClass = (color: string): string => {
    switch (color) {
      case 'gold':
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white border-yellow-500';
      case 'blue':
        return 'bg-gradient-to-r from-blue-400 to-blue-600 text-white border-blue-500';
      case 'red':
        return 'bg-gradient-to-r from-red-400 to-red-600 text-white border-red-500';
      case 'green':
        return 'bg-gradient-to-r from-green-400 to-green-600 text-white border-green-500';
      case 'changeable':
        return 'bg-gradient-to-r from-purple-400 to-indigo-600 text-white border-purple-500';
      default:
        return 'bg-gray-400 text-white border-gray-500';
    }
  };

  // ランクに応じたアイコン
  const getRankIcon = (rank: string): string => {
    const icons: { [key: string]: string } = {
      'S': '⭐',
      'A': '🏆',
      'B': '🥇',
      'C': '🥈',
      'D': '🥉',
      'E': '📋',
      'F': '📝',
      'G': '🔰'
    };
    return icons[rank] || '•';
  };

  // サイズに応じたクラス
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return {
          badge: 'text-xs px-2 py-1 rounded-md',
          description: 'text-xs mt-1',
          container: 'space-y-1'
        };
      case 'large':
        return {
          badge: 'text-sm px-4 py-2 rounded-lg',
          description: 'text-sm mt-2',
          container: 'space-y-3'
        };
      default: // medium
        return {
          badge: 'text-xs px-3 py-1.5 rounded-lg',
          description: 'text-xs mt-1.5',
          container: 'space-y-2'
        };
    }
  };

  const sizeClasses = getSizeClasses();

  return (
    <div className={`${layout === 'horizontal' ? 'flex flex-wrap gap-2' : sizeClasses.container}`}>
      {abilities.map((ability, index) => (
        <div key={ability.id || index} className={layout === 'horizontal' ? '' : 'mb-2'}>
          {/* 特殊能力バッジ */}
          <div className={`
            inline-flex items-center ${sizeClasses.badge}
            ${getAbilityColorClass(ability.color)}
            border-2 font-bold shadow-sm
            ${!ability.isActive ? 'opacity-50 grayscale' : ''}
            transition-all duration-200 hover:shadow-md
          `}>
            <span className="mr-1">{getRankIcon(ability.rank)}</span>
            <span>{ability.name}</span>
            {!ability.isActive && (
              <span className="ml-1 text-xs opacity-75">(無効)</span>
            )}
          </div>

          {/* 説明文 */}
          {showDescription && (
            <div className={`${sizeClasses.description} text-gray-600 max-w-xs`}>
              {ability.description}
              
              {/* 効果の詳細表示 */}
              {size === 'large' && (
                <div className="mt-1 text-xs text-gray-500">
                  <div className="flex flex-wrap gap-1">
                    {ability.effects.serveBoost && (
                      <span className="bg-red-100 text-red-700 px-1 rounded">
                        サーブ+{ability.effects.serveBoost}
                      </span>
                    )}
                    {ability.effects.returnBoost && (
                      <span className="bg-blue-100 text-blue-700 px-1 rounded">
                        リターン+{ability.effects.returnBoost}
                      </span>
                    )}
                    {ability.effects.volleyBoost && (
                      <span className="bg-green-100 text-green-700 px-1 rounded">
                        ボレー+{ability.effects.volleyBoost}
                      </span>
                    )}
                    {ability.effects.strokeBoost && (
                      <span className="bg-yellow-100 text-yellow-700 px-1 rounded">
                        ストローク+{ability.effects.strokeBoost}
                      </span>
                    )}
                    {ability.effects.mentalBoost && (
                      <span className="bg-purple-100 text-purple-700 px-1 rounded">
                        メンタル+{ability.effects.mentalBoost}
                      </span>
                    )}
                    {ability.effects.specialEffects?.criticalHitRate && (
                      <span className="bg-orange-100 text-orange-700 px-1 rounded">
                        クリティカル+{ability.effects.specialEffects.criticalHitRate}%
                      </span>
                    )}
                    {ability.effects.situationalEffects?.tiebreakBonus && (
                      <span className="bg-indigo-100 text-indigo-700 px-1 rounded">
                        TB+{ability.effects.situationalEffects.tiebreakBonus}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default SpecialAbilityDisplay;