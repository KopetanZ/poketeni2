'use client';

import React, { useState } from 'react';
import { SeasonalEvent, EventChoice, EventEffect } from '../../types/calendar';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface SeasonalEventModalProps {
  event: SeasonalEvent;
  schoolFunds: number;
  schoolReputation: number;
  onEventComplete: (effects: EventEffect) => void;
  onClose: () => void;
}

export const SeasonalEventModal: React.FC<SeasonalEventModalProps> = ({
  event,
  schoolFunds,
  schoolReputation,
  onEventComplete,
  onClose
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [eventResults, setEventResults] = useState<EventEffect | null>(null);

  // 季節イベント固有の選択肢定義
  const getEventChoices = (): EventChoice[] => {
    switch (event.eventType) {
      case 'entrance_ceremony':
        return [
          {
            id: 'welcome_speech',
            text: '歓迎スピーチを行う',
            description: '新入生に向けて部活の魅力をアピール',
            effects: {
              schoolEffects: { reputation: 8, funds: -2000 },
              systemEffects: { extraPractice: true }
            }
          },
          {
            id: 'recruiting_booth',
            text: '勧誘ブースを設営',
            description: '新入生獲得に全力投球',
            effects: {
              schoolEffects: { reputation: 12, funds: -5000 },
              playerEffects: {
                targetType: 'all',
                statChanges: { mental: 5 }
              }
            },
            requirements: { funds: 5000 }
          },
          {
            id: 'low_key',
            text: '控えめに対応',
            description: '費用を抑えて堅実に',
            effects: {
              schoolEffects: { reputation: 3 }
            }
          }
        ];

      case 'summer_festival':
        return [
          {
            id: 'tennis_demo',
            text: 'テニス演技披露',
            description: '地域住民に部の実力をアピール',
            effects: {
              schoolEffects: { reputation: 15, funds: 8000 },
              playerEffects: {
                targetType: 'all',
                statChanges: { mental: 8, stamina: -5 }
              }
            },
            requirements: { schoolReputation: 30 }
          },
          {
            id: 'food_stall',
            text: '屋台を出店',
            description: '収益重視で資金調達',
            effects: {
              schoolEffects: { reputation: 8, funds: 12000 },
              playerEffects: {
                targetType: 'all',
                statChanges: { stamina: -3 }
              }
            },
            requirements: { funds: 3000 }
          },
          {
            id: 'enjoy_festival',
            text: '祭りを楽しむ',
            description: 'リラックスしてストレス発散',
            effects: {
              schoolEffects: { reputation: 5, funds: 2000 },
              playerEffects: {
                targetType: 'all',
                statChanges: { mental: 10 },
                conditionChange: 10
              }
            }
          }
        ];

      case 'cultural_festival':
        return [
          {
            id: 'tennis_clinic',
            text: 'テニス教室開催',
            description: '来場者にテニスの楽しさを伝える',
            effects: {
              schoolEffects: { reputation: 20, funds: 5000 },
              playerEffects: {
                targetType: 'all',
                statChanges: { mental: 10, serve_skill: 2, return_skill: 2 }
              }
            },
            requirements: { schoolReputation: 50 }
          },
          {
            id: 'photo_exhibition',
            text: '部活動写真展',
            description: '活動の軌跡を展示して感動を呼ぶ',
            effects: {
              schoolEffects: { reputation: 12, funds: 3000 },
              playerEffects: {
                targetType: 'all',
                statChanges: { mental: 8 }
              }
            }
          },
          {
            id: 'skip_participation',
            text: '参加を控える',
            description: '練習に集中',
            effects: {
              playerEffects: {
                targetType: 'all',
                statChanges: { serve_skill: 3, return_skill: 3, volley_skill: 3, stroke_skill: 3 }
              }
            }
          }
        ];

      case 'graduation':
        return [
          {
            id: 'grand_ceremony',
            text: '盛大な送別会',
            description: '卒業生への感謝を込めて',
            effects: {
              schoolEffects: { reputation: 10, funds: -8000 },
              playerEffects: {
                targetType: 'all',
                statChanges: { mental: 15 },
                conditionChange: 20
              }
            },
            requirements: { funds: 8000 }
          },
          {
            id: 'simple_farewell',
            text: 'シンプルなお別れ',
            description: '心を込めて見送り',
            effects: {
              schoolEffects: { reputation: 5, funds: -2000 },
              playerEffects: {
                targetType: 'all',
                statChanges: { mental: 8 }
              }
            }
          }
        ];

      default:
        return [];
    }
  };

  const eventChoices = getEventChoices();

  // 選択肢の実行可否チェック
  const canExecuteChoice = (choice: EventChoice): boolean => {
    const req = choice.requirements;
    if (!req) return true;

    if (req.funds && schoolFunds < req.funds) return false;
    if (req.schoolReputation && schoolReputation < req.schoolReputation) return false;

    return true;
  };

  // 選択肢実行
  const handleChoiceSelect = async (choice: EventChoice) => {
    setIsProcessing(true);

    // アニメーション用遅延
    await new Promise(resolve => setTimeout(resolve, 1500));

    setEventResults(choice.effects);
    setShowResults(true);
    setIsProcessing(false);
  };

  // 結果確認後の処理
  const handleResultsConfirm = () => {
    if (eventResults) {
      onEventComplete(eventResults);
    }
    onClose();
  };

  // イベントタイプに応じた背景色とアイコン
  const getEventStyle = () => {
    switch (event.eventType) {
      case 'entrance_ceremony':
        return { bg: 'from-pink-400 to-purple-500', icon: '🌸', color: 'text-pink-100' };
      case 'summer_festival':
        return { bg: 'from-orange-400 to-red-500', icon: '🎆', color: 'text-orange-100' };
      case 'cultural_festival':
        return { bg: 'from-purple-400 to-indigo-500', icon: '🎭', color: 'text-purple-100' };
      case 'graduation':
        return { bg: 'from-blue-400 to-indigo-500', icon: '🎓', color: 'text-blue-100' };
      default:
        return { bg: 'from-gray-400 to-gray-500', icon: '🎉', color: 'text-gray-100' };
    }
  };

  const style = getEventStyle();

  if (showResults && eventResults) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[10000] p-4">
        <Card className="w-full max-w-md">
          <CardHeader className={`bg-gradient-to-r ${style.bg} text-white`}>
            <CardTitle className="flex items-center gap-3">
              <span className="text-3xl">{style.icon}</span>
              <div>
                <div className="text-xl">イベント結果</div>
                <div className={`text-sm ${style.color}`}>{event.name}</div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4 bg-white">
            <div className="text-center">
              <h3 className="text-lg font-bold mb-4">🎊 結果発表 🎊</h3>
              
              {/* 学校効果 */}
              {eventResults.schoolEffects && (
                <div className="space-y-2">
                  <h4 className="font-semibold">学校への影響</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {eventResults.schoolEffects.reputation && (
                      <div className="bg-yellow-50 p-2 rounded">
                        <div className="text-yellow-700">評判</div>
                        <div className="font-bold text-lg">
                          {eventResults.schoolEffects.reputation > 0 ? '+' : ''}
                          {eventResults.schoolEffects.reputation}
                        </div>
                      </div>
                    )}
                    {eventResults.schoolEffects.funds && (
                      <div className="bg-green-50 p-2 rounded">
                        <div className="text-green-700">資金</div>
                        <div className="font-bold text-lg">
                          {eventResults.schoolEffects.funds > 0 ? '+' : ''}
                          ¥{eventResults.schoolEffects.funds.toLocaleString()}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* プレイヤー効果 */}
              {eventResults.playerEffects && (
                <div className="space-y-2">
                  <h4 className="font-semibold">部員への影響</h4>
                  <div className="bg-blue-50 p-3 rounded">
                    <div className="text-blue-700 text-sm">
                      対象: {eventResults.playerEffects.targetType === 'all' ? '全部員' : '選択部員'}
                    </div>
                    {eventResults.playerEffects.statChanges && (
                      <div className="grid grid-cols-2 gap-1 mt-2 text-xs">
                        {Object.entries(eventResults.playerEffects.statChanges).map(([stat, value]) => (
                          <div key={stat} className="flex justify-between">
                            <span>{stat.replace('_skill', '').replace('_', ' ')}</span>
                            <Badge variant={value && value > 0 ? "default" : "secondary"} className="text-xs px-1">
                              {value && value > 0 ? '+' : ''}{value}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* システム効果 */}
              {eventResults.systemEffects?.extraPractice && (
                <div className="bg-purple-50 p-2 rounded">
                  <div className="text-purple-700 text-sm">
                    ✨ 追加練習が可能になりました！
                  </div>
                </div>
              )}
            </div>

            <Button 
              onClick={handleResultsConfirm}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600"
            >
              確認
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[10000] p-4">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <CardHeader className={`bg-gradient-to-r ${style.bg} text-white`}>
          <CardTitle className="flex items-center gap-3">
            <span className="text-3xl">{style.icon}</span>
            <div>
              <div className="text-xl">{event.name}</div>
              <div className={`text-sm ${style.color}`}>{event.description}</div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 bg-white">
          {isProcessing ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-lg">イベント実行中...</p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h3 className="text-lg font-bold mb-2">どのように対応しますか？</h3>
                <div className="text-sm text-gray-600 mb-4">
                  選択によって学校の評判や資金、部員の成長に影響があります
                </div>
                
                {/* 現在のステータス表示 */}
                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div className="bg-yellow-50 p-2 rounded">
                    <div className="text-yellow-700">現在の評判</div>
                    <div className="font-bold">{schoolReputation}</div>
                  </div>
                  <div className="bg-green-50 p-2 rounded">
                    <div className="text-green-700">現在の資金</div>
                    <div className="font-bold">¥{schoolFunds.toLocaleString()}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {eventChoices.map((choice) => {
                  const canExecute = canExecuteChoice(choice);
                  
                  return (
                    <Button
                      key={choice.id}
                      onClick={() => handleChoiceSelect(choice)}
                      disabled={!canExecute}
                      variant={canExecute ? "default" : "secondary"}
                      className="w-full p-4 h-auto text-left justify-start"
                    >
                      <div className="w-full">
                        <div className="font-semibold mb-1">{choice.text}</div>
                        <div className="text-sm opacity-80 mb-2">{choice.description}</div>
                        
                        {/* 効果プレビュー */}
                        <div className="text-xs space-y-1">
                          {choice.effects.schoolEffects && (
                            <div className="flex gap-2">
                              {choice.effects.schoolEffects.reputation && (
                                <Badge variant="outline" className="text-xs">
                                  評判 {choice.effects.schoolEffects.reputation > 0 ? '+' : ''}
                                  {choice.effects.schoolEffects.reputation}
                                </Badge>
                              )}
                              {choice.effects.schoolEffects.funds && (
                                <Badge variant="outline" className="text-xs">
                                  資金 {choice.effects.schoolEffects.funds > 0 ? '+' : ''}
                                  ¥{choice.effects.schoolEffects.funds.toLocaleString()}
                                </Badge>
                              )}
                            </div>
                          )}
                          
                          {/* 必要条件表示 */}
                          {choice.requirements && (
                            <div className="text-red-600">
                              必要: {choice.requirements.funds && `資金¥${choice.requirements.funds.toLocaleString()}`}
                              {choice.requirements.schoolReputation && `評判${choice.requirements.schoolReputation}以上`}
                            </div>
                          )}
                        </div>
                      </div>
                    </Button>
                  );
                })}
              </div>

              <div className="mt-6 pt-4 border-t">
                <Button onClick={onClose} variant="outline" className="w-full">
                  キャンセル
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};