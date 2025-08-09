'use client';

import React, { useState, useEffect } from 'react';
import { RARITY_CONFIGS } from '../../lib/training-card-system';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface CardUsageResultModalProps {
  result: any;
  onClose: () => void;
}

export const CardUsageResultModal: React.FC<CardUsageResultModalProps> = ({
  result,
  onClose
}) => {
  const [animationPhase, setAnimationPhase] = useState<'revealing' | 'showing' | 'complete'>('revealing');
  const [showDetails, setShowDetails] = useState(false);

  const rarityConfig = (RARITY_CONFIGS as any)[result.card.rarity];

  useEffect(() => {
    // アニメーション段階的実行
    const timer1 = setTimeout(() => setAnimationPhase('showing'), 1500);
    const timer2 = setTimeout(() => {
      setAnimationPhase('complete');
      setShowDetails(true);
    }, 3000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  // 成功レベルに応じたスタイル
  const getSuccessStyle = () => {
    switch (result.successLevel) {
      case 'critical':
        return {
          bg: 'from-yellow-400 via-orange-500 to-red-600',
          text: 'text-white',
          glow: 'shadow-2xl shadow-orange-500/50',
          icon: '🌟',
          title: '奇跡的成功！'
        };
      case 'perfect':
        return {
          bg: 'from-purple-400 via-pink-500 to-red-500',
          text: 'text-white',
          glow: 'shadow-2xl shadow-purple-500/50',
          icon: '✨',
          title: '完璧な成功！'
        };
      case 'great':
        return {
          bg: 'from-blue-400 to-blue-600',
          text: 'text-white',
          glow: 'shadow-xl shadow-blue-500/30',
          icon: '🎯',
          title: '大成功！'
        };
      case 'normal':
        return {
          bg: 'from-green-400 to-green-600',
          text: 'text-white',
          glow: 'shadow-lg shadow-green-500/20',
          icon: '✅',
          title: '成功'
        };
      case 'failure':
        return {
          bg: 'from-gray-400 to-gray-600',
          text: 'text-white',
          glow: 'shadow-lg shadow-gray-500/20',
          icon: '😞',
          title: '失敗...'
        };
      default:
        return {
          bg: 'from-gray-400 to-gray-600',
          text: 'text-white',
          glow: '',
          icon: '❓',
          title: '結果'
        };
    }
  };

  const style = getSuccessStyle();

  // アニメーション中の表示
  if (animationPhase === 'revealing') {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <Card className="w-80 h-48 bg-gradient-to-r from-gray-800 to-black text-white">
          <CardContent className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mx-auto mb-4"></div>
              <h3 className="text-xl font-bold">{result.card.name}</h3>
              <p className="text-gray-300">実行中...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 結果発表アニメーション中
  if (animationPhase === 'showing') {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <Card className={`w-96 h-64 bg-gradient-to-r ${style.bg} ${style.glow} ${style.text} animate-bounce`}>
          <CardContent className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-6xl mb-4 animate-pulse">{style.icon}</div>
              <h2 className="text-3xl font-bold mb-2">{style.title}</h2>
              <p className="text-xl opacity-90">{result.card.name}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 詳細結果表示
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className={`bg-gradient-to-r ${style.bg} ${style.text}`}>
          <CardTitle className="flex items-center gap-3">
            <span className="text-4xl">{style.icon}</span>
            <div>
              <div className="text-2xl">{style.title}</div>
              <div className="text-lg opacity-90">{result.card.name}</div>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="p-6 space-y-6 bg-white">
          {/* 結果メッセージ */}
          <div className="text-center">
            <div className="text-lg font-semibold mb-2">{result.resultMessage}</div>
            {result.flavorText && (
              <div className="text-sm text-gray-600 italic">{result.flavorText}</div>
            )}
          </div>

          {/* 特殊効果発動 */}
          {result.specialEffectsTriggered.length > 0 && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="font-bold text-purple-800 mb-3 flex items-center gap-2">
                ⚡ 特殊効果発動！
              </h3>
              {result.specialEffectsTriggered.map((effect: any, index: number) => (
                <div key={index} className="mb-2">
                  <div className="font-semibold text-purple-700">{effect.name}</div>
                  <div className="text-sm text-purple-600">{effect.description}</div>
                </div>
              ))}
            </div>
          )}

          {/* 成長結果 */}
          {result.actualEffects.skillGrowth && Object.keys(result.actualEffects.skillGrowth).length > 0 && (
            <div>
              <h3 className="font-bold text-blue-800 mb-3">📈 スキル成長</h3>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(result.actualEffects.skillGrowth).map(([skill, growth]) => (
                  <div key={skill} className="bg-blue-50 p-3 rounded-lg">
                    <div className="font-semibold text-blue-700">
                      {skill.replace('_skill', '').replace('_', ' ')}
                    </div>
                    <div className="text-xl font-bold text-blue-800">
                      +{String(growth)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 状態変化 */}
          {result.actualEffects.statusChanges && Object.keys(result.actualEffects.statusChanges).length > 0 && (
            <div>
              <h3 className="font-bold text-orange-800 mb-3">🎭 状態変化</h3>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(result.actualEffects.statusChanges).map(([status, change]) => {
                  const isPositive = (change as number) > 0;
                  return (
                    <div key={status} className={`p-3 rounded-lg ${isPositive ? 'bg-green-50' : 'bg-red-50'}`}>
                      <div className={`font-semibold ${isPositive ? 'text-green-700' : 'text-red-700'}`}>
                        {status === 'condition' ? '調子' : status === 'motivation' ? 'やる気' : status}
                      </div>
                      <div className={`text-xl font-bold ${isPositive ? 'text-green-800' : 'text-red-800'}`}>
                        {(change as number) > 0 ? '+' : ''}{String(change)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 経験値獲得 */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-bold text-yellow-800 mb-2 flex items-center gap-2">
              ⭐ 経験値獲得
            </h3>
            <div className="text-2xl font-bold text-yellow-700">
              +{result.experienceGained} EXP
            </div>
          </div>

          {/* 怪我・疲労警告 */}
          {result.injuryOccurred && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-bold text-red-800 mb-2 flex items-center gap-2">
                🚑 怪我発生！
              </h3>
              <p className="text-red-600">
                練習中に軽い怪我をしました。しばらく練習効率が下がります。
              </p>
            </div>
          )}

          {result.fatigueLevel && result.fatigueLevel > 30 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h3 className="font-bold text-orange-800 mb-2 flex items-center gap-2">
                😰 高疲労
              </h3>
              <p className="text-orange-600">
                かなり疲れています。休息を取ることをお勧めします。
              </p>
            </div>
          )}

          {/* 学校効果 */}
          {result.actualEffects.schoolEffects && Object.keys(result.actualEffects.schoolEffects).length > 0 && (
            <div>
              <h3 className="font-bold text-indigo-800 mb-3">🏫 学校への影響</h3>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(result.actualEffects.schoolEffects).map(([effect, value]) => (
                  <div key={effect} className="bg-indigo-50 p-3 rounded-lg">
                    <div className="font-semibold text-indigo-700">
                      {effect === 'reputation' ? '評判' : effect === 'funds' ? '資金' : effect}
                    </div>
                    <div className="text-xl font-bold text-indigo-800">
                      {effect === 'funds' ? `¥${(value as number).toLocaleString()}` : `+${value}`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 閉じるボタン */}
          <div className="flex justify-center pt-4">
            <Button
              onClick={onClose}
              size="lg"
              className={`bg-gradient-to-r ${style.bg} hover:opacity-90 text-white px-8 py-3`}
            >
              確認
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CardUsageResultModal;