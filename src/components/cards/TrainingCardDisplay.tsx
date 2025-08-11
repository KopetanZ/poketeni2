'use client';

import React, { useState } from 'react';
import { RARITY_CONFIGS } from '../../lib/training-card-system';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface TrainingCardDisplayProps {
  card: any;
  onUse?: (card: any) => void;
  disabled?: boolean;
  playerStats?: {
    stamina: number;
    motivation: number;
    level: number;
    [key: string]: number;
  };
  schoolFunds?: number;
}

export const TrainingCardDisplay: React.FC<TrainingCardDisplayProps> = ({
  card,
  onUse,
  disabled = false,
  playerStats,
  schoolFunds = 0
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const rarityConfig = (RARITY_CONFIGS as any)[card.rarity];
  
  // 使用可能かチェック
  const canUse = () => {
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
          if ((playerStats as any)[stat] < (required as number)) return false;
        }
      }
    }
    
    return true;
  };

  const usable = canUse();

  // カードスタイル
  const cardStyle = {
    background: `linear-gradient(135deg, ${rarityConfig.bgColor} 0%, ${rarityConfig.color}20 100%)`,
    borderColor: rarityConfig.color,
    boxShadow: rarityConfig.glowEffect 
      ? `0 0 20px ${rarityConfig.color}40, 0 4px 15px rgba(0,0,0,0.1)` 
      : '0 4px 15px rgba(0,0,0,0.1)'
  };

  return (
    <Card 
      className={`relative transition-all duration-300 border-2 cursor-pointer ${
        disabled || !usable 
          ? 'opacity-50 cursor-not-allowed' 
          : 'hover:scale-105 hover:shadow-lg'
      } ${rarityConfig.sparkleEffect ? 'sparkle-animation' : ''}`}
      style={cardStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
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

      {/* 進むマス数表示（右上） */}
      <div className="absolute top-2 left-2 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
        <span className="text-white text-xs font-bold">{card.number}</span>
      </div>

      {/* キラキラエフェクト（レジェンドカード用） */}
      {rarityConfig.sparkleEffect && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="sparkle sparkle-1"></div>
          <div className="sparkle sparkle-2"></div>
          <div className="sparkle sparkle-3"></div>
        </div>
      )}

      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-3" style={{ color: rarityConfig.color }}>
          <span className="text-2xl">{card.icon}</span>
          <div>
            <div className="text-lg font-bold">{card.name}</div>
            <div className="text-sm opacity-80 font-normal">
              {card.description}
            </div>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 基本効果表示 */}
        <div>
          <h4 className="font-semibold text-sm mb-2" style={{ color: rarityConfig.color }}>
            基本効果
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {card.baseEffects.skillGrowth && Object.entries(card.baseEffects.skillGrowth).map(([skill, value]) => (
              <div key={skill} className="flex justify-between text-xs">
                <span>{skill.replace('_skill', '').replace('_', ' ')}</span>
                <Badge variant="secondary" className="text-xs px-1">
                  +{Math.round((value as number) * rarityConfig.effectMultiplier)}
                </Badge>
              </div>
            ))}
          </div>

          {/* 状態変化効果 */}
          {card.baseEffects.statusChanges && (
            <div className="mt-2 grid grid-cols-2 gap-1">
              {Object.entries(card.baseEffects.statusChanges).map(([status, value]) => {
                const isNegative = (value as number) < 0;
                return (
                  <div key={status} className="flex justify-between text-xs">
                    <span>{status === 'condition' ? '調子' : status === 'motivation' ? 'やる気' : status}</span>
                    <Badge 
                      variant={isNegative ? "destructive" : "default"} 
                      className="text-xs px-1"
                    >
                      {(value as number) > 0 ? '+' : ''}{String(value)}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* コスト表示 */}
        <div>
          <h4 className="font-semibold text-sm mb-2 text-orange-600">必要コスト</h4>
          <div className="flex flex-wrap gap-2">
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

        {/* 必要条件表示 */}
        {card.requirements && (
          <div>
            <h4 className="font-semibold text-sm mb-2 text-red-600">必要条件</h4>
            <div className="text-xs space-y-1">
              {card.requirements.minLevel && (
                <div>最低レベル: {card.requirements.minLevel}</div>
              )}
              {card.requirements.minStamina && (
                <div>最低体力: {card.requirements.minStamina}</div>
              )}
              {card.requirements.minStats && Object.entries(card.requirements.minStats).map(([stat, required]) => (
                <div key={stat}>
                  {stat.replace('_skill', '').replace('_', ' ')}: {String(required)}以上
                  {playerStats && (playerStats as any)[stat] < (required as number) && (
                    <span className="text-red-500 ml-1">
                      (現在: {(playerStats as any)[stat]})
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 成功率表示 */}
        <div>
          <h4 className="font-semibold text-sm mb-1 text-blue-600">基本成功率</h4>
          <div className="flex items-center gap-2">
            <div 
              className="flex-1 bg-gray-200 rounded-full h-2"
            >
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${Math.min(card.baseSuccessRate + rarityConfig.successRateBonus, 100)}%` 
                }}
              ></div>
            </div>
            <span className="text-sm font-semibold">
              {card.baseSuccessRate + rarityConfig.successRateBonus}%
            </span>
          </div>
        </div>

        {/* 特殊効果表示 */}
        {card.specialEffects && card.specialEffects.length > 0 && (
          <div>
            <h4 className="font-semibold text-sm mb-2 text-purple-600">特殊効果</h4>
            <div className="space-y-1">
              {card.specialEffects.map((effect: any, index: number) => (
                <div key={index} className="text-xs p-2 bg-purple-50 rounded">
                  <div className="font-semibold text-purple-700">{effect.name}</div>
                  <div className="text-purple-600">{effect.description}</div>
                  <div className="text-purple-500">発動率: {effect.triggerChance}%</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 使用ボタン */}
        {onUse && (
          <Button
            onClick={() => onUse(card)}
            disabled={disabled || !usable}
            className={`w-full transition-all duration-300 ${
              usable 
                ? `bg-gradient-to-r ${card.bgGradient} hover:shadow-lg text-white` 
                : 'bg-gray-400 text-gray-600'
            }`}
          >
            {!usable ? '条件未達成' : '練習実行'}
          </Button>
        )}

        {/* 使用不可理由表示 */}
        {!usable && playerStats && (
          <div className="text-xs text-red-500 bg-red-50 p-2 rounded">
            {playerStats.stamina < card.costs.stamina && '体力不足 '}
            {card.costs.funds && schoolFunds < card.costs.funds && '資金不足 '}
            {card.costs.motivation && playerStats.motivation < card.costs.motivation && 'やる気不足 '}
            {card.requirements?.minLevel && playerStats.level < card.requirements.minLevel && 'レベル不足 '}
          </div>
        )}
      </CardContent>

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
      `}</style>
    </Card>
  );
};

export default TrainingCardDisplay;