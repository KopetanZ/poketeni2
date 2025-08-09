'use client';

import React, { useState } from 'react';
import { SpecialEvent, EventOutcome } from '@/types/special-events';
import { Player } from '@/types/game';
import { SpecialEventsSystem } from '@/lib/special-events-system';
import { TENNIS_SPECIAL_ABILITIES } from '@/types/special-abilities';
import { X, Star, Zap, AlertTriangle, CheckCircle } from 'lucide-react';

interface SpecialEventModalProps {
  event: SpecialEvent;
  player: Player;
  isOpen: boolean;
  onClose: () => void;
  onEventComplete: (outcome: EventOutcome, player: Player) => void;
}

export function SpecialEventModal({
  event,
  player,
  isOpen,
  onClose,
  onEventComplete
}: SpecialEventModalProps) {
  const [currentStep, setCurrentStep] = useState<'intro' | 'choices' | 'ability_select' | 'result'>('intro');
  const [selectedChoices, setSelectedChoices] = useState<string[]>([]);
  const [selectedAbilityId, setSelectedAbilityId] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [eventResult, setEventResult] = useState<EventOutcome | null>(null);

  if (!isOpen) return null;

  const learnableAbilities = SpecialEventsSystem.getLearnableAbilities(player, event);
  
  // レア度に応じた色とアイコン
  const getRarityInfo = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return { color: 'border-gray-300 bg-gray-50', textColor: 'text-gray-800', icon: '🟢' };
      case 'uncommon':
        return { color: 'border-green-300 bg-green-50', textColor: 'text-green-800', icon: '🟡' };
      case 'rare':
        return { color: 'border-blue-300 bg-blue-50', textColor: 'text-blue-800', icon: '🔵' };
      case 'epic':
        return { color: 'border-purple-300 bg-purple-50', textColor: 'text-purple-800', icon: '🟣' };
      case 'legendary':
        return { color: 'border-yellow-300 bg-yellow-50', textColor: 'text-yellow-800', icon: '🟨' };
      default:
        return { color: 'border-gray-300 bg-gray-50', textColor: 'text-gray-800', icon: '⚪' };
    }
  };

  const rarityInfo = getRarityInfo(event.rarity);

  const handleChoiceToggle = (choiceId: string) => {
    setSelectedChoices(prev => 
      prev.includes(choiceId) 
        ? prev.filter(id => id !== choiceId)
        : [...prev, choiceId]
    );
  };

  const handleEventExecution = async () => {
    if (!selectedAbilityId) return;

    setIsProcessing(true);
    try {
      const outcome = await SpecialEventsSystem.executeEvent(
        event,
        player,
        selectedChoices,
        selectedAbilityId
      );
      
      setEventResult(outcome);
      setCurrentStep('result');
      
      // 結果を親コンポーネントに通知
      setTimeout(() => {
        onEventComplete(outcome, player);
      }, 3000);
    } catch (error) {
      console.error('Event execution failed:', error);
      setEventResult({
        success: false,
        message: 'イベント処理中にエラーが発生しました',
        rewards_gained: {}
      });
      setCurrentStep('result');
    } finally {
      setIsProcessing(false);
    }
  };

  const getAbilityInfo = (abilityId: string) => {
    return TENNIS_SPECIAL_ABILITIES.find(ability => ability.id === abilityId);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* ヘッダー */}
        <div className={`p-6 border-b ${rarityInfo.color} border-2`}>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{event.icon}</span>
              <div>
                <h2 className={`text-2xl font-bold ${rarityInfo.textColor}`}>
                  {event.name}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm">{rarityInfo.icon}</span>
                  <span className={`text-sm font-medium ${rarityInfo.textColor}`}>
                    {event.rarity.toUpperCase()}
                  </span>
                  <span className="text-sm text-gray-500">•</span>
                  <span className="text-sm text-gray-600">
                    {event.type === 'training' ? '練習' :
                     event.type === 'match' ? '試合' :
                     event.type === 'seasonal' ? '季節' :
                     event.type === 'achievement' ? '実績' : 'ランダム'}イベント
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={isProcessing}
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* コンテンツ */}
        <div className="p-6">
          {/* イベント紹介 */}
          {currentStep === 'intro' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-6xl mb-4">{event.icon}</div>
                <p className="text-gray-700 text-lg leading-relaxed">
                  {event.description}
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">対象ポケモン</h3>
                <div className="flex items-center gap-3">
                  <span className="text-xl">{player.types.join('/')}</span>
                  <div>
                    <div className="font-medium">{player.pokemon_name}</div>
                    <div className="text-sm text-gray-600">Lv.{player.level}</div>
                  </div>
                </div>
              </div>

              {event.rewards && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">期待される効果</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {event.rewards.experience && (
                      <div>経験値: +{event.rewards.experience}</div>
                    )}
                    {event.rewards.stat_boosts && Object.entries(event.rewards.stat_boosts).map(([stat, boost]) => (
                      <div key={stat}>
                        {stat === 'serve_skill' ? 'サーブ' :
                         stat === 'return_skill' ? 'リターン' :
                         stat === 'volley_skill' ? 'ボレー' :
                         stat === 'stroke_skill' ? 'ストローク' :
                         stat === 'mental' ? 'メンタル' :
                         stat === 'stamina' ? 'スタミナ' : stat}: +{boost}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-center">
                <button
                  onClick={() => setCurrentStep(event.choices ? 'choices' : 'ability_select')}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  イベントを開始
                </button>
              </div>
            </div>
          )}

          {/* 選択肢 */}
          {currentStep === 'choices' && event.choices && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  どのようにアプローチしますか？
                </h3>
                <p className="text-gray-600">選択によって成功率や報酬が変わります</p>
              </div>

              <div className="space-y-4">
                {event.choices.map((choice) => (
                  <div
                    key={choice.id}
                    onClick={() => handleChoiceToggle(choice.id)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      selectedChoices.includes(choice.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 mb-1">{choice.text}</h4>
                        <p className="text-gray-600 text-sm mb-2">{choice.description}</p>
                        
                        {/* 効果表示 */}
                        <div className="flex flex-wrap gap-2">
                          {choice.effects.success_rate_modifier !== 0 && (
                            <span className={`text-xs px-2 py-1 rounded ${
                              choice.effects.success_rate_modifier > 0 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              成功率 {choice.effects.success_rate_modifier > 0 ? '+' : ''}{Math.round(choice.effects.success_rate_modifier * 100)}%
                            </span>
                          )}
                          
                          {choice.risk && choice.risk > 0.2 && (
                            <span className="text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-800 flex items-center gap-1">
                              <AlertTriangle size={12} />
                              リスク {Math.round(choice.risk * 100)}%
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {selectedChoices.includes(choice.id) && (
                        <CheckCircle className="text-blue-500 ml-3" size={24} />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center">
                <button
                  onClick={() => setCurrentStep('ability_select')}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  次へ進む
                </button>
              </div>
            </div>
          )}

          {/* 特殊能力選択 */}
          {currentStep === 'ability_select' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  習得を目指す特殊能力を選択
                </h3>
                <p className="text-gray-600">成功率と要求ステータスを確認して選択してください</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {event.available_abilities.map((abilityOption) => {
                  const abilityInfo = getAbilityInfo(abilityOption.ability_id);
                  const isLearnable = learnableAbilities.includes(abilityOption.ability_id);
                  
                  if (!abilityInfo || !isLearnable) return null;

                  return (
                    <div
                      key={abilityOption.ability_id}
                      onClick={() => setSelectedAbilityId(abilityOption.ability_id)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        selectedAbilityId === abilityOption.ability_id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-800">{abilityInfo.name}</h4>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          abilityInfo.color === 'gold' ? 'bg-yellow-100 text-yellow-800' :
                          abilityInfo.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                          abilityInfo.color === 'red' ? 'bg-red-100 text-red-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {abilityInfo.color.toUpperCase()}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-3">{abilityInfo.description}</p>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">基本成功率</span>
                          <span className="font-medium">{Math.round(abilityOption.success_rate * 100)}%</span>
                        </div>
                        
                        {abilityOption.requirements?.stat_minimums && (
                          <div className="text-xs">
                            <div className="text-gray-600 mb-1">必要ステータス:</div>
                            {Object.entries(abilityOption.requirements.stat_minimums).map(([stat, min]) => {
                              const playerStat = (player as any)[stat] || 0;
                              const meets = playerStat >= min;
                              
                              return (
                                <div key={stat} className={`flex justify-between ${meets ? 'text-green-600' : 'text-red-600'}`}>
                                  <span>
                                    {stat === 'serve_skill' ? 'サーブ' :
                                     stat === 'return_skill' ? 'リターン' :
                                     stat === 'volley_skill' ? 'ボレー' :
                                     stat === 'stroke_skill' ? 'ストローク' :
                                     stat === 'mental' ? 'メンタル' :
                                     stat === 'stamina' ? 'スタミナ' : stat}
                                  </span>
                                  <span>{playerStat}/{min}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                      
                      {selectedAbilityId === abilityOption.ability_id && (
                        <CheckCircle className="text-blue-500 mt-2 mx-auto" size={24} />
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="text-center">
                <button
                  onClick={handleEventExecution}
                  disabled={!selectedAbilityId || isProcessing}
                  className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2 mx-auto"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      特訓中...
                    </>
                  ) : (
                    <>
                      <Zap size={16} />
                      特訓開始！
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* 結果表示 */}
          {currentStep === 'result' && eventResult && (
            <div className="space-y-6 text-center">
              <div className={`text-6xl ${eventResult.success ? 'animate-bounce' : 'animate-pulse'}`}>
                {eventResult.success ? '✨' : '😔'}
              </div>
              
              <div>
                <h3 className={`text-2xl font-bold mb-2 ${
                  eventResult.success ? 'text-green-600' : 'text-gray-600'
                }`}>
                  {eventResult.success ? '成功！' : '失敗...'}
                </h3>
                <p className="text-gray-700 text-lg">{eventResult.message}</p>
              </div>

              {eventResult.learned_ability && (
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Star className="text-yellow-600" size={20} />
                    <span className="font-semibold text-yellow-800">新しい特殊能力を習得！</span>
                  </div>
                  <div className="font-bold text-lg text-yellow-900">
                    {eventResult.learned_ability.name}
                  </div>
                  <div className="text-sm text-yellow-700 mt-1">
                    {eventResult.learned_ability.description}
                  </div>
                </div>
              )}

              {/* 報酬表示 */}
              {Object.keys(eventResult.rewards_gained).length > 0 && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">獲得した報酬</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(eventResult.rewards_gained).map(([key, value]) => (
                      <div key={key} className="text-blue-700">
                        {key === 'experience' ? '経験値' :
                         key === 'reputation' ? '評判' :
                         key === 'funds' ? '資金' : key}: +{value}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4">
                <p className="text-gray-500 text-sm">3秒後に自動的に閉じます...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}