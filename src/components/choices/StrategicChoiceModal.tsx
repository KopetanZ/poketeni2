'use client';

import React, { useState, useEffect } from 'react';
import { 
  StrategicChoice, 
  ChoiceRoute, 
  ChoiceRouteType, 
  ChoiceOutcome,
  ProbabilityModifiers 
} from '../../types/strategic-choice';
import { StrategicChoiceSystem } from '../../lib/strategic-choice-system';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface StrategicChoiceModalProps {
  choice: StrategicChoice;
  playerStats: any;
  schoolStats: any;
  environmentFactors: any;
  onChoiceComplete: (outcome: ChoiceOutcome) => void;
  onClose: () => void;
}

export const StrategicChoiceModal: React.FC<StrategicChoiceModalProps> = ({
  choice,
  playerStats,
  schoolStats,
  environmentFactors,
  onChoiceComplete,
  onClose
}) => {
  const [selectedRoute, setSelectedRoute] = useState<ChoiceRouteType | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [outcome, setOutcome] = useState<ChoiceOutcome | null>(null);
  const [probabilityModifiers, setProbabilityModifiers] = useState<ProbabilityModifiers | null>(null);

  // 確率修正要因計算
  useEffect(() => {
    const modifiers = StrategicChoiceSystem.calculateProbabilityModifiers(
      playerStats,
      schoolStats,
      environmentFactors
    );
    setProbabilityModifiers(modifiers);
  }, [playerStats, schoolStats, environmentFactors]);

  // ルート選択
  const handleRouteSelect = (routeType: ChoiceRouteType) => {
    setSelectedRoute(routeType);
    setShowConfirmation(true);
  };

  // 選択実行
  const handleExecuteChoice = async () => {
    if (!selectedRoute || !probabilityModifiers) return;

    setIsExecuting(true);
    setShowConfirmation(false);

    // アニメーション用遅延
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 選択実行
    const result = StrategicChoiceSystem.executeChoice(
      choice,
      selectedRoute,
      probabilityModifiers
    );

    setOutcome(result);
    setIsExecuting(false);
  };

  // 結果確認
  const handleResultConfirm = () => {
    if (outcome) {
      onChoiceComplete(outcome);
    }
    onClose();
  };

  // ルートカードのスタイル取得
  const getRouteStyle = (routeType: ChoiceRouteType) => {
    const route = choice.routes[routeType];
    return {
      borderColor: route.color,
      backgroundColor: `${route.color}10`,
      hover: `hover:bg-[${route.color}20]`
    };
  };

  // 確率バーの表示
  const ProbabilityBar: React.FC<{ 
    route: ChoiceRoute, 
    modifiers?: ProbabilityModifiers 
  }> = ({ route, modifiers }) => {
    const probabilities = modifiers 
      ? StrategicChoiceSystem.adjustSuccessProbabilities(route, modifiers)
      : route.successProbabilities;

    const successRate = probabilities.great_success + probabilities.success;
    const normalRate = probabilities.normal;
    const failureRate = probabilities.failure + probabilities.disaster;

    return (
      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span>成功率</span>
          <span className="font-semibold">{Math.round(successRate)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div className="flex h-full rounded-full overflow-hidden">
            <div 
              className="bg-green-500" 
              style={{ width: `${successRate}%` }}
            ></div>
            <div 
              className="bg-yellow-500" 
              style={{ width: `${normalRate}%` }}
            ></div>
            <div 
              className="bg-red-500" 
              style={{ width: `${failureRate}%` }}
            ></div>
          </div>
        </div>
        <div className="flex justify-between text-xs text-gray-600">
          <span>成功</span>
          <span>普通</span>
          <span>失敗</span>
        </div>
      </div>
    );
  };

  // 実行中の表示
  if (isExecuting) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <Card className="w-96 bg-gradient-to-br from-purple-600 to-blue-600 text-white">
          <CardContent className="p-8 text-center">
            <div className="animate-pulse mb-6">
              <span className="text-6xl">{choice.routes[selectedRoute!].icon}</span>
            </div>
            <h3 className="text-2xl font-bold mb-2">
              {choice.routes[selectedRoute!].name}
            </h3>
            <p className="text-purple-100 mb-4">実行中...</p>
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent mx-auto"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 結果表示
  if (outcome) {
    const resultColors = {
      great_success: 'from-yellow-400 via-orange-500 to-red-600',
      success: 'from-green-400 to-green-600',
      normal: 'from-blue-400 to-blue-600',
      failure: 'from-gray-400 to-gray-600',
      disaster: 'from-red-600 to-black'
    };

    const resultIcons = {
      great_success: '🌟',
      success: '✅',
      normal: '📊',
      failure: '😞',
      disaster: '💥'
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <CardHeader className={`bg-gradient-to-r ${resultColors[outcome.outcome]} text-white`}>
            <CardTitle className="flex items-center gap-3">
              <span className="text-4xl">{resultIcons[outcome.outcome]}</span>
              <div>
                <div className="text-2xl">{outcome.resultMessage}</div>
                <div className="text-lg opacity-90">
                  {choice.routes[outcome.selectedRoute].name}
                </div>
              </div>
            </CardTitle>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* 詳細説明 */}
            <div>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {outcome.detailedDescription}
              </p>
              {outcome.consequenceText && (
                <p className="text-sm text-orange-600 mt-2 italic">
                  {outcome.consequenceText}
                </p>
              )}
            </div>

            {/* 効果表示 */}
            {outcome.actualEffects.playerChanges && Object.keys(outcome.actualEffects.playerChanges).length > 0 && (
              <div>
                <h3 className="font-bold text-blue-800 mb-3">🏃 プレイヤーへの影響</h3>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(outcome.actualEffects.playerChanges).map(([stat, change]) => {
                    const isPositive = change > 0;
                    return (
                      <div key={stat} className={`p-3 rounded-lg ${isPositive ? 'bg-green-50' : 'bg-red-50'}`}>
                        <div className={`font-semibold ${isPositive ? 'text-green-700' : 'text-red-700'}`}>
                          {stat.replace('_skill', '').replace('_', ' ')}
                        </div>
                        <div className={`text-xl font-bold ${isPositive ? 'text-green-800' : 'text-red-800'}`}>
                          {change > 0 ? '+' : ''}{change}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* チーム効果 */}
            {outcome.actualEffects.teamChanges && Object.keys(outcome.actualEffects.teamChanges).length > 0 && (
              <div>
                <h3 className="font-bold text-purple-800 mb-3">👥 チームへの影響</h3>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(outcome.actualEffects.teamChanges).map(([stat, change]) => {
                    const isPositive = change > 0;
                    return (
                      <div key={stat} className={`p-3 rounded-lg ${isPositive ? 'bg-purple-50' : 'bg-red-50'}`}>
                        <div className={`font-semibold ${isPositive ? 'text-purple-700' : 'text-red-700'}`}>
                          {stat === 'morale' ? 'チーム士気' : stat === 'cohesion' ? '結束力' : stat}
                        </div>
                        <div className={`text-xl font-bold ${isPositive ? 'text-purple-800' : 'text-red-800'}`}>
                          {change > 0 ? '+' : ''}{change}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 学校効果 */}
            {outcome.actualEffects.schoolChanges && Object.keys(outcome.actualEffects.schoolChanges).length > 0 && (
              <div>
                <h3 className="font-bold text-indigo-800 mb-3">🏫 学校への影響</h3>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(outcome.actualEffects.schoolChanges).map(([stat, change]) => {
                    const isPositive = change > 0;
                    return (
                      <div key={stat} className={`p-3 rounded-lg ${isPositive ? 'bg-indigo-50' : 'bg-red-50'}`}>
                        <div className={`font-semibold ${isPositive ? 'text-indigo-700' : 'text-red-700'}`}>
                          {stat === 'reputation' ? '評判' : stat === 'funds' ? '資金' : stat}
                        </div>
                        <div className={`text-xl font-bold ${isPositive ? 'text-indigo-800' : 'text-red-800'}`}>
                          {stat === 'funds' ? 
                            `¥${change.toLocaleString()}` : 
                            `${change > 0 ? '+' : ''}${change}`
                          }
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 特別報酬 */}
            {outcome.actualEffects.specialRewards && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-bold text-yellow-800 mb-3 flex items-center gap-2">
                  🎁 特別報酬
                </h3>
                {outcome.actualEffects.specialRewards.extraCards && (
                  <div className="mb-2">
                    <span className="font-semibold">追加練習カード: </span>
                    <Badge variant="default">{outcome.actualEffects.specialRewards.extraCards}枚</Badge>
                  </div>
                )}
                {outcome.actualEffects.specialRewards.bonusExperience && (
                  <div className="mb-2">
                    <span className="font-semibold">ボーナス経験値: </span>
                    <Badge variant="default">+{outcome.actualEffects.specialRewards.bonusExperience}</Badge>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-center pt-4">
              <Button
                onClick={handleResultConfirm}
                size="lg"
                className={`bg-gradient-to-r ${resultColors[outcome.outcome]} hover:opacity-90 text-white px-8 py-3`}
              >
                確認
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 確認モーダル
  if (showConfirmation && selectedRoute) {
    const route = choice.routes[selectedRoute];
    
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-lg">
          <CardHeader style={{ backgroundColor: `${route.color}20`, borderBottom: `2px solid ${route.color}` }}>
            <CardTitle className="flex items-center gap-3" style={{ color: route.color }}>
              <span className="text-3xl">{route.icon}</span>
              <div>
                <div className="text-xl">{route.name}</div>
                <div className="text-sm opacity-80">本当に実行しますか？</div>
              </div>
            </CardTitle>
          </CardHeader>

          <CardContent className="p-6 space-y-4 bg-white">
            <div>
              <p className="text-gray-700 mb-4">{route.description}</p>
              <p className="text-sm italic text-gray-600 bg-gray-50 p-3 rounded">
                {route.flavorText}
              </p>
            </div>

            {probabilityModifiers && (
              <ProbabilityBar route={route} modifiers={probabilityModifiers} />
            )}

            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleExecuteChoice}
                className="flex-1"
                style={{ backgroundColor: route.color }}
              >
                実行する
              </Button>
              <Button
                onClick={() => {
                  setShowConfirmation(false);
                  setSelectedRoute(null);
                }}
                variant="outline"
                className="flex-1"
              >
                戻る
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // メイン選択画面
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
          <CardTitle className="text-2xl">{choice.title}</CardTitle>
          <p className="text-purple-100">{choice.description}</p>
        </CardHeader>

        <CardContent className="p-6">
          {/* 状況説明 */}
          <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">現在の状況</h3>
            <p className="text-blue-700">{choice.situationDescription}</p>
          </div>

          {/* ルート選択肢 */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-center mb-6">どのアプローチを取りますか？</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {Object.entries(choice.routes).map(([routeType, route]) => (
                <Card 
                  key={routeType}
                  className="cursor-pointer border-2 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                  style={getRouteStyle(routeType as ChoiceRouteType)}
                  onClick={() => handleRouteSelect(routeType as ChoiceRouteType)}
                >
                  <CardHeader className="text-center pb-3">
                    <div className="text-4xl mb-2">{route.icon}</div>
                    <CardTitle style={{ color: route.color }}>
                      {route.name}
                    </CardTitle>
                    <p className="text-sm text-gray-600">{route.description}</p>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* フレーバーテキスト */}
                    <div className="text-sm italic text-center p-2 bg-gray-50 rounded">
                      {route.flavorText}
                    </div>

                    {/* 確率表示 */}
                    {probabilityModifiers && (
                      <ProbabilityBar route={route} modifiers={probabilityModifiers} />
                    )}

                    {/* ポテンシャル効果 */}
                    {route.potentialEffects.playerGrowth && (
                      <div>
                        <h4 className="font-semibold text-sm text-green-700 mb-2">期待できる成長</h4>
                        <div className="space-y-1">
                          {Object.entries(route.potentialEffects.playerGrowth).slice(0, 3).map(([skill, value]) => (
                            <div key={skill} className="flex justify-between text-xs">
                              <span>{skill.replace('_skill', '').replace('_', ' ')}</span>
                              <Badge variant="secondary" className="text-xs px-1">
                                最大+{value}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* リスク警告 */}
                    {Object.keys(route.riskFactors).length > 0 && (
                      <div>
                        <h4 className="font-semibold text-sm text-red-700 mb-2">リスク</h4>
                        <div className="text-xs text-red-600 space-y-1">
                          {route.riskFactors.injuryRisk && (
                            <div>怪我リスク: {route.riskFactors.injuryRisk}%</div>
                          )}
                          {route.riskFactors.fatigueIncrease && (
                            <div>疲労増加: +{route.riskFactors.fatigueIncrease}</div>
                          )}
                          {route.riskFactors.moraleDecrease && (
                            <div>士気低下: -{route.riskFactors.moraleDecrease}</div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* 必要条件 */}
                    {route.requirements && (
                      <div>
                        <h4 className="font-semibold text-sm text-orange-700 mb-2">必要条件</h4>
                        <div className="text-xs text-orange-600">
                          {route.requirements.minStamina && (
                            <div>体力: {route.requirements.minStamina}以上</div>
                          )}
                          {route.requirements.minMorale && (
                            <div>やる気: {route.requirements.minMorale}以上</div>
                          )}
                          {route.requirements.minFunds && (
                            <div>資金: ¥{route.requirements.minFunds.toLocaleString()}以上</div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <Button onClick={onClose} variant="outline">
              キャンセル
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};