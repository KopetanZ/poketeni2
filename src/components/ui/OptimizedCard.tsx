// 最適化されたカードコンポーネント

import React, { memo, useMemo, useCallback } from 'react';
import { TrainingCard } from '../../types/training-cards';
import { RARITY_CONFIGS } from '../../lib/training-card-system';
import { Card, CardHeader, CardTitle, CardContent } from './card';
import { Button } from './button';
import { Badge } from './badge';
import { AnimationOptimizers, ResponsiveHelpers } from '../../lib/performance-optimizations';

interface OptimizedCardProps {
  card: TrainingCard;
  onUse?: (card: TrainingCard) => void;
  disabled?: boolean;
  playerStats?: {
    stamina: number;
    motivation: number;
    level: number;
    [key: string]: number;
  };
  schoolFunds?: number;
}

export const OptimizedCard = memo<OptimizedCardProps>(({
  card,
  onUse,
  disabled = false,
  playerStats,
  schoolFunds = 0
}) => {
  const breakpoint = ResponsiveHelpers.useBreakpoint();
  const isTouch = ResponsiveHelpers.useTouch();
  
  // メモ化された計算
  const rarityConfig = useMemo(() => RARITY_CONFIGS[card.rarity], [card.rarity]);
  
  const canUse = useMemo(() => {
    if (!playerStats) return true;
    
    // スタミナチェック
    if (playerStats.stamina < card.costs.stamina) return false;
    
    // 資金チェック
    if (card.costs.funds && schoolFunds < card.costs.funds) return false;
    
    // やる気チェック
    if (card.costs.motivation && playerStats.motivation < card.costs.motivation) return false;
    
    // 必要条件チェック
    if (card.requirements) {
      if (card.requirements.minLevel && playerStats.level < card.requirements.minLevel) return false;
      if (card.requirements.minStamina && playerStats.stamina < card.requirements.minStamina) return false;
      
      if (card.requirements.minStats) {
        for (const [stat, required] of Object.entries(card.requirements.minStats)) {
          if (playerStats[stat] < required) return false;
        }
      }
    }
    
    return true;
  }, [playerStats, schoolFunds, card.costs, card.requirements]);

  // メモ化されたスタイル
  const cardStyle = useMemo(() => ({
    background: `linear-gradient(135deg, ${rarityConfig.bgColor} 0%, ${rarityConfig.color}20 100%)`,
    borderColor: rarityConfig.color,
    boxShadow: rarityConfig.glowEffect 
      ? `0 0 ${breakpoint === 'sm' ? '10px' : '20px'} ${rarityConfig.color}40, 0 4px 15px rgba(0,0,0,0.1)` 
      : '0 4px 15px rgba(0,0,0,0.1)'
  }), [rarityConfig, breakpoint]);

  // メモ化されたスキル効果
  const skillEffects = useMemo(() => {
    if (!card.baseEffects.skillGrowth) return [];
    
    return Object.entries(card.baseEffects.skillGrowth).map(([skill, value]) => ({
      skill: skill.replace('_skill', '').replace('_', ' '),
      value: Math.round(value * rarityConfig.effectMultiplier),
      key: skill
    }));
  }, [card.baseEffects.skillGrowth, rarityConfig.effectMultiplier]);

  // メモ化されたコールバック
  const handleClick = useCallback(() => {
    if (!disabled && canUse && onUse) {
      onUse(card);
    }
  }, [disabled, canUse, onUse, card]);

  // レスポンシブクラス
  const responsiveClasses = useMemo(() => ({
    card: `relative transition-all duration-300 border-2 cursor-pointer ${
      disabled || !canUse 
        ? 'opacity-50 cursor-not-allowed' 
        : `${isTouch ? 'active:scale-95' : 'hover:scale-105'} hover:shadow-lg`
    } ${rarityConfig.sparkleEffect ? 'sparkle-animation' : ''}`,
    
    title: breakpoint === 'sm' ? 'text-base' : 'text-lg',
    description: breakpoint === 'sm' ? 'text-xs' : 'text-sm',
    content: breakpoint === 'sm' ? 'p-3 space-y-2' : 'space-y-4'
  }), [disabled, canUse, rarityConfig.sparkleEffect, breakpoint, isTouch]);

  return (
    <Card 
      className={responsiveClasses.card}
      style={cardStyle}
      onClick={handleClick}
      role="button"
      tabIndex={disabled || !canUse ? -1 : 0}
      aria-label={`${card.name} - ${card.description}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {/* 希少度表示 */}
      <div className="absolute top-2 right-2">
        <Badge 
          style={{ 
            backgroundColor: rarityConfig.color,
            color: 'white'
          }}
          className="text-xs font-bold"
        >
          {rarityConfig.name}
        </Badge>
      </div>

      {/* キラキラエフェクト（レジェンドカード用） */}
      {rarityConfig.sparkleEffect && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="sparkle sparkle-1" />
          <div className="sparkle sparkle-2" />
          <div className="sparkle sparkle-3" />
        </div>
      )}

      <CardHeader className="pb-3">
        <CardTitle 
          className={`flex items-center gap-3 ${responsiveClasses.title}`}
          style={{ color: rarityConfig.color }}
        >
          <span className={breakpoint === 'sm' ? 'text-xl' : 'text-2xl'}>
            {card.icon}
          </span>
          <div>
            <div className="font-bold">{card.name}</div>
            <div className={`opacity-80 font-normal ${responsiveClasses.description}`}>
              {card.description}
            </div>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className={responsiveClasses.content}>
        {/* 基本効果表示 */}
        {skillEffects.length > 0 && (
          <div>
            <h4 className="font-semibold text-sm mb-2" style={{ color: rarityConfig.color }}>
              基本効果
            </h4>
            <div className={`grid ${breakpoint === 'sm' ? 'grid-cols-1' : 'grid-cols-2'} gap-2`}>
              {skillEffects.slice(0, breakpoint === 'sm' ? 3 : 6).map(({ skill, value, key }) => (
                <div key={key} className="flex justify-between text-xs">
                  <span className="capitalize">{skill}</span>
                  <Badge variant="secondary" className="text-xs px-1">
                    +{value}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* コスト表示 */}
        <div>
          <h4 className="font-semibold text-sm mb-2 text-orange-600">コスト</h4>
          <div className="flex flex-wrap gap-1">
            <Badge variant="outline" className="text-xs">
              体力: {card.costs.stamina}
            </Badge>
            {card.costs.funds && (
              <Badge variant="outline" className="text-xs">
                資金: ¥{card.costs.funds.toLocaleString()}
              </Badge>
            )}
            {card.costs.motivation && (
              <Badge variant="outline" className="text-xs">
                やる気: {card.costs.motivation}
              </Badge>
            )}
          </div>
        </div>

        {/* 成功率バー */}
        <div>
          <h4 className="font-semibold text-sm mb-1 text-blue-600">成功率</h4>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${Math.min(card.baseSuccessRate + rarityConfig.successRateBonus, 100)}%` 
                }}
              />
            </div>
            <span className="text-sm font-semibold">
              {card.baseSuccessRate + rarityConfig.successRateBonus}%
            </span>
          </div>
        </div>

        {/* 使用ボタン（デスクトップのみ） */}
        {!isTouch && onUse && (
          <Button
            onClick={handleClick}
            disabled={disabled || !canUse}
            className={`w-full transition-all duration-300 ${
              canUse 
                ? `bg-gradient-to-r ${card.bgGradient} hover:shadow-lg text-white` 
                : 'bg-gray-400 text-gray-600'
            }`}
          >
            {!canUse ? '条件未達成' : '練習実行'}
          </Button>
        )}

        {/* 使用不可理由（簡略版） */}
        {!canUse && playerStats && (
          <div className="text-xs text-red-500 bg-red-50 p-2 rounded">
            {playerStats.stamina < card.costs.stamina && '体力不足 '}
            {card.costs.funds && schoolFunds < card.costs.funds && '資金不足 '}
            {card.costs.motivation && playerStats.motivation < card.costs.motivation && 'やる気不足'}
          </div>
        )}
      </CardContent>

      {/* スタイル定義 */}
      <style jsx>{`
        .sparkle-animation {
          position: relative;
          overflow: hidden;
        }
        
        .sparkle {
          position: absolute;
          width: 6px;
          height: 6px;
          background: radial-gradient(circle, #fff 0%, transparent 70%);
          border-radius: 50%;
          animation: sparkle 2s infinite;
        }
        
        .sparkle-1 {
          top: 20%;
          left: 20%;
          animation-delay: 0s;
        }
        
        .sparkle-2 {
          top: 60%;
          right: 20%;
          animation-delay: 0.7s;
        }
        
        .sparkle-3 {
          bottom: 20%;
          left: 60%;
          animation-delay: 1.4s;
        }
        
        @keyframes sparkle {
          0%, 100% { 
            opacity: 0; 
            transform: scale(0);
          }
          50% { 
            opacity: 1; 
            transform: scale(1);
          }
        }
        
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </Card>
  );
}, (prevProps, nextProps) => {
  // カスタム比較関数でレンダリング最適化
  return (
    prevProps.card.id === nextProps.card.id &&
    prevProps.disabled === nextProps.disabled &&
    prevProps.schoolFunds === nextProps.schoolFunds &&
    JSON.stringify(prevProps.playerStats) === JSON.stringify(nextProps.playerStats)
  );
});

OptimizedCard.displayName = 'OptimizedCard';

export default OptimizedCard;