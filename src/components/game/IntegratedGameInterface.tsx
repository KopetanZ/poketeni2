'use client';

import React, { useState, useEffect, useRef } from 'react';
import { IntegratedGameFlow, GameState } from '../../lib/integrated-game-flow';
import { Player, GameDate } from '@/types/game';
import { CalendarDay } from '../../types/calendar';
import { TrainingCard, CardUsageResult } from '../../types/training-cards';
import { StrategicChoice, ChoiceOutcome } from '../../types/strategic-choice';

import CalendarView from '../calendar/CalendarView';
import CardSelectionInterface from '../cards/CardSelectionInterface';
import SugorokuTrainingBoard from '../training/SugorokuTrainingBoard';
import { StrategicChoiceModal } from '../choices/StrategicChoiceModal';
import CardUsageResultModal from '../cards/CardUsageResultModal';
import { SeasonalEventModal } from '../events/SeasonalEventModal';

import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { EvolutionSystem } from '@/lib/evolution-system';
import { EvolutionModal } from '@/components/evolution/EvolutionModal';
import { supabase } from '@/lib/supabase';
import { EventHistoryDisplay } from '../events/EventHistoryDisplay';

interface IntegratedGameInterfaceProps {
  initialPlayer: Player;
  initialSchoolStats: {
    funds: number;
    reputation: number;
    facilities: number;
  };
  allPlayers?: Player[];
  schoolId?: string;
  onGameStateUpdate?: (newState: {
    currentDate: GameDate;
    schoolStats: { funds: number; reputation: number; facilities: number };
  }) => void;
}

export const IntegratedGameInterface: React.FC<IntegratedGameInterfaceProps> = ({
  initialPlayer,
  initialSchoolStats,
  allPlayers,
  schoolId,
  onGameStateUpdate
}) => {
  // ゲームフロー管理
  const [gameFlow] = useState(() => new IntegratedGameFlow(
    initialPlayer, 
    initialSchoolStats, 
    schoolId || 'default', 
    allPlayers
  ));
  const [gameState, setGameState] = useState<GameState>(gameFlow.getGameState());
  
  // UI状態管理
  const [activeTab, setActiveTab] = useState<'sugoroku' | 'calendar' | 'stats' | 'events'>('sugoroku');
  const [showStrategicChoice, setShowStrategicChoice] = useState(false);
  const [showCardResult, setShowCardResult] = useState(false);
  const [showSeasonalEvent, setShowSeasonalEvent] = useState(false);
  
  // 結果データ
  const [lastCardResult, setLastCardResult] = useState<CardUsageResult | null>(null);
  const [lastChoiceResult, setLastChoiceResult] = useState<ChoiceOutcome | null>(null);
  
  // イベントと通知
  const [notifications, setNotifications] = useState<string[]>([]);
  const [isAdvancingDay, setIsAdvancingDay] = useState(false);

  // イベントログとステータス変化の管理
  const [eventLogs, setEventLogs] = useState<{
    id: string;
    type: 'card_use' | 'event' | 'stats_change' | 'special_ability';
    message: string;
    details?: string;
    timestamp: Date;
    cardName?: string;
    playerName?: string;
    statsChanges?: Record<string, number>;
    specialAbility?: string;
  }[]>([]);

  // 進化モーダル管理
  const [showEvolutionModal, setShowEvolutionModal] = useState(false);
  const [evolutionTarget, setEvolutionTarget] = useState<Player | null>(null);
  const promptedEvolutionIdsRef = useRef<Set<string>>(new Set());

  // ゲーム状態の同期
  const syncGameState = () => {
    setGameState(gameFlow.getGameState());
  };

  // イベントログを追加する関数
  const addEventLog = (log: Omit<typeof eventLogs[0], 'id' | 'timestamp'>) => {
    const newLog = {
      ...log,
      id: Date.now().toString(),
      timestamp: new Date()
    };
    setEventLogs(prev => [newLog, ...prev.slice(0, 19)]); // 最新20件を保持
  };

  // 全部員データの更新監視
  useEffect(() => {
    if (allPlayers && allPlayers.length > 0) {
      gameFlow.updateAllPlayers(allPlayers);
      syncGameState();
      
      // ゲーム開始ログを追加
      addEventLog({
        type: 'event',
        message: 'ゲーム開始',
        details: '栄冠ナイン風テニス部シミュレーターを開始しました'
      });
    }
  }, [allPlayers, gameFlow]);

  // 日付進行処理
  const handleAdvanceDay = async () => {
    setIsAdvancingDay(true);
    
    try {
      const result = await gameFlow.advanceDay();
      syncGameState();
      
      // 通知の追加
      const newNotifications: string[] = [];
      
      if (result.triggeredEvents.length > 0) {
        newNotifications.push(`イベント発生: ${result.triggeredEvents.length}件`);
      }
      
      if (result.cardChanges.newCards.length > 0) {
        const legendaryCount = result.cardChanges.newCards.filter(card => card.rarity === 'legendary').length;
        if (legendaryCount > 0) {
          newNotifications.push(`レジェンドカード獲得: ${legendaryCount}枚！`);
        }
      }
      
      // 選択肢は自動化ポリシーにより表示しない
      
      // 季節イベント表示
      // 季節イベントはモーダル表示せず通知のみ
      if (result.newDay.seasonalEvent) newNotifications.push('季節イベント発生');
      
      // 日進行後に進化可能チェック（新規のみ）
      try {
        const stateAfter = gameFlow.getGameState();
        const candidates = EvolutionSystem
          .getEvolvablePlayers(stateAfter.allPlayers || [stateAfter.player])
          .filter(p => !promptedEvolutionIdsRef.current.has(p.id));
        if (candidates.length > 0) {
          setEvolutionTarget(candidates[0]);
          setShowEvolutionModal(true);
          promptedEvolutionIdsRef.current.add(candidates[0].id);
          newNotifications.push(`${candidates[0].pokemon_name}が進化可能になりました！`);
        }
      } catch {}

      setNotifications(prev => [...prev, ...newNotifications].slice(-5)); // 最新5件のみ保持
      
    } catch (error) {
      console.error('Error advancing day:', error);
      setNotifications(prev => [...prev, 'エラーが発生しました'].slice(-5));
    }
    
    setIsAdvancingDay(false);
  };

  // カード使用処理（すごろく進行対応）
  const handleCardUse = (cardId: string) => {
    setIsAdvancingDay(true);
    try {
      const card = gameState.availableCards.find(c => c.id === cardId);
      if (!card) return;

      // 進行前の状態を保存
      const stateBefore = gameFlow.getGameState();
      const originalDayCount = stateBefore.dayCount;
      const originalDate = gameFlow.getCurrentDay();

      // IntegratedGameFlow の useTrainingCard を呼び出し（すごろく進行含む）
      const result = gameFlow.useTrainingCard(card);
      
      setLastCardResult(result);
      setShowCardResult(true);
      
      // 即座に状態を同期（アニメーションは別途処理）
      syncGameState();
      
      // 日付進行の確認
      const stateAfter = gameFlow.getGameState();
      const newDate = gameFlow.getCurrentDay();
      
      console.log('カード使用前の日付:', originalDate);
      console.log('カード使用後の日付:', newDate);
      console.log('進行日数:', result.daysProgressed);
      
      // 日付が実際に進んでいるかチェック
      if (result.daysProgressed > 0) {
        // 日付が進んでいる場合、通知を追加
        setNotifications(prev => [...prev, `日付が${result.daysProgressed}日進みました: ${originalDate.month}/${originalDate.day} → ${newDate.month}/${newDate.day}`].slice(-5));
      } else {
        // 日付が進んでいない場合、警告を追加
        setNotifications(prev => [...prev, '警告: カード使用後も日付が進んでいません'].slice(-5));
      }
      
      // プレイヤー能力・経験値の永続化（全部員対象）
      (async () => {
        try {
          const playersToPersist = stateAfter.allPlayers || [stateAfter.player];
          for (const p of playersToPersist) {
            await supabase
              .from('players')
              .update({
                serve_skill: p.serve_skill,
                return_skill: p.return_skill,
                volley_skill: p.volley_skill,
                stroke_skill: p.stroke_skill,
                mental: p.mental,
                stamina: p.stamina,
                experience: p.experience,
                level: p.level
              })
              .eq('id', p.id);
          }
        } catch (e) {
          console.error('Failed to persist card training player updates:', e);
        }
      })();

      // 進行結果の通知
      const progressNotifications: string[] = [];
      if (result.success) {
        progressNotifications.push(`${card.name}: ${result.successLevel}`);
        
        // カード使用ログを追加
        addEventLog({
          type: 'card_use',
          message: `${card.name}を使用`,
          details: `${result.daysProgressed}マス進みました`,
          cardName: card.name
        });
      }
      progressNotifications.push(`${result.daysProgressed}日進行しました`);
      
      // イベント通知
      if (result.triggeredEvents.length > 0) {
        progressNotifications.push(`イベント発生: ${result.triggeredEvents.length}件`);
        
        // イベントログを追加
        result.triggeredEvents.forEach(eventId => {
          addEventLog({
            type: 'event',
            message: `イベント発生: ${eventId}`,
            details: 'マス目で特別なイベントが発生しました'
          });
        });
      }
      
      // 進化可能チェック（新規のみ）
      try {
        const candidates = EvolutionSystem
          .getEvolvablePlayers(stateAfter.allPlayers || [stateAfter.player])
          .filter(p => !promptedEvolutionIdsRef.current.has(p.id));
        if (candidates.length > 0) {
          setEvolutionTarget(candidates[0]);
          setShowEvolutionModal(true);
          promptedEvolutionIdsRef.current.add(candidates[0].id);
          progressNotifications.push(`${candidates[0].pokemon_name}が進化可能になりました！`);
        }
      } catch {}

      setNotifications(prev => [...prev, ...progressNotifications].slice(-5));

      // 学校日付・学校ステータスの永続化
      (async () => {
        try {
          if (schoolId) {
            await supabase
              .from('schools')
              .update({
                current_year: newDate.year,
                current_month: newDate.month,
                current_day: newDate.day,
                funds: stateAfter.schoolStats.funds,
                reputation: stateAfter.schoolStats.reputation
              })
              .eq('id', schoolId);
          }
        } catch (e) {
          console.error('Failed to persist school date/stats:', e);
        }
      })();
      
      // 手札の状態を確認
      const cardsAfterUsage = gameFlow.getGameState().availableCards;
      console.log('カード使用後の手札数:', cardsAfterUsage.length);
      
      // 手札が空になっている場合は警告
      if (cardsAfterUsage.length === 0) {
        setNotifications(prev => [...prev, '警告: 手札が空になっています。カード補充を確認してください。'].slice(-5));
      }
      
      // 親コンポーネントにゲーム状態の更新を通知
      if (onGameStateUpdate) {
        onGameStateUpdate({
          currentDate: newDate,
          schoolStats: stateAfter.schoolStats
        });
      }
      
      // 緊急事態チェック
      const emergency = gameFlow.handleEmergency();
      if (emergency) {
        setNotifications(prev => [...prev, `緊急事態: ${emergency.type}`].slice(-5));
      }

      // 戦略的選択肢のチェック
      const availableChoices = gameFlow.getActiveChoice();
      if (availableChoices) {
        setShowStrategicChoice(true);
      }
      
      // アニメーション完了後にローディング状態を解除
      setTimeout(() => {
        setIsAdvancingDay(false);
      }, 2000);
      
    } catch (error) {
      console.error('カード使用処理でエラーが発生:', error);
      setNotifications(prev => [...prev, 'カード使用処理でエラーが発生しました'].slice(-5));
      setIsAdvancingDay(false);
    }
  };

  // 戦略的選択処理
  const handleStrategicChoice = (choice: StrategicChoice, selectedRoute: any) => {
    try {
      const result = gameFlow.executeStrategicChoice(choice, selectedRoute);
      setLastChoiceResult(result);
      syncGameState();
      
      setNotifications(prev => [...prev, `選択結果: ${result.outcome}`].slice(-5));
      
    } catch (error) {
      console.error('Error executing strategic choice:', error);
      setNotifications(prev => [...prev, '選択実行エラー'].slice(-5));
    }
  };

  // 季節イベント処理
  const handleSeasonalEvent = (effects: any) => {
    // 季節イベントの効果をゲーム状態に適用
    if (effects.schoolEffects) {
      Object.entries(effects.schoolEffects).forEach(([stat, change]) => {
        (gameState.schoolStats as any)[stat] = ((gameState.schoolStats as any)[stat] || 0) + (change as number);
      });
    }
    
    syncGameState();
    setNotifications(prev => [...prev, '季節イベント完了'].slice(-5));
  };

  // プレイヤー統計計算
  const calculatePlayerStats = () => {
    const player = gameState.player;
    return {
      totalPower: (player.serve_skill || 0) + (player.return_skill || 0) + 
                  (player.volley_skill || 0) + (player.stroke_skill || 0),
      averageSkill: Math.round(
        ((player.serve_skill || 0) + (player.return_skill || 0) + 
         (player.volley_skill || 0) + (player.stroke_skill || 0)) / 4
      ),
      nextLevelExp: 100 * (player.level || 1) - (player.experience || 0)
    };
  };

  const playerStats = calculatePlayerStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* ヘッダー情報 */}
      <div className="bg-white border-b shadow-sm p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              PokeTeaniMaster - 栄冠ナイン風統合システム
            </h1>
            <p className="text-gray-600">
              {gameState.player.pokemon_name} | Day {gameState.dayCount} | Week {gameState.weekCount}
            </p>
          </div>
          
          <div className="flex items-center gap-6">
            {/* ゲーム統計 */}
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-blue-600">Lv.{gameState.player.level || 1}</div>
                <div className="text-xs text-gray-500">レベル</div>
              </div>
              <div>
                <div className="text-lg font-bold text-green-600">{gameState.player.stamina || 0}</div>
                <div className="text-xs text-gray-500">体力</div>
              </div>
              <div>
                <div className="text-lg font-bold text-purple-600">¥{gameState.schoolStats.funds.toLocaleString()}</div>
                <div className="text-xs text-gray-500">資金</div>
              </div>
              <div>
                <div className="text-lg font-bold text-orange-600">{gameState.schoolStats.reputation}</div>
                <div className="text-xs text-gray-500">評判</div>
              </div>
            </div>
            
            {/* 日付進行ボタン */}
            {/* カード使用で自動進行するため、手動の次の日ボタンは非表示 */}
          </div>
        </div>
      </div>

      {/* 通知バー */}
      {notifications.length > 0 && (
        <div className="bg-yellow-50 border-b border-yellow-200 p-2">
          <div className="max-w-7xl mx-auto flex items-center gap-4 overflow-x-auto">
            {notifications.map((notification, index) => (
              <Badge key={index} variant="outline" className="whitespace-nowrap">
                {notification}
              </Badge>
            ))}
            <Button
              onClick={() => setNotifications([])}
              variant="ghost"
              size="sm"
              className="ml-auto"
            >
              クリア
            </Button>
          </div>
        </div>
      )}

      {/* メインコンテンツ */}
      <div className="max-w-7xl mx-auto p-4">
        {/* タブナビゲーション */}
        <div className="flex gap-2 mb-6">
          <Button
            onClick={() => setActiveTab('sugoroku')}
            variant={activeTab === 'sugoroku' ? 'default' : 'outline'}
            className="flex items-center gap-2"
          >
            🎲 練習すごろく ({gameState.availableCards.length}枚)
          </Button>
          <Button
            onClick={() => setActiveTab('calendar')}
            variant={activeTab === 'calendar' ? 'default' : 'outline'}
            className="flex items-center gap-2"
          >
            📅 カレンダー
          </Button>
          <Button
            onClick={() => setActiveTab('stats')}
            variant={activeTab === 'stats' ? 'default' : 'outline'}
            className="flex items-center gap-2"
          >
            📊 統計
          </Button>
          <Button
            onClick={() => setActiveTab('events')}
            variant={activeTab === 'events' ? 'default' : 'outline'}
            className="flex items-center gap-2"
          >
            📋 イベント履歴
          </Button>
        </div>

        {/* タブコンテンツ */}
        <div className="space-y-6">
          {/* イベントログ表示エリア */}
          <div className="bg-white bg-opacity-90 rounded-lg p-4 shadow-lg border-2 border-blue-300">
            <h3 className="text-lg font-bold text-blue-800 mb-3 flex items-center">
              📋 イベントログ
            </h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {eventLogs.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  <div className="text-lg mb-1">📝</div>
                  <div className="text-sm">まだイベントがありません</div>
                  <div className="text-xs">カードを使用するとログが表示されます</div>
                </div>
              ) : (
                eventLogs.map((log) => (
                  <div
                    key={log.id}
                    className={`p-2 rounded-lg border-l-4 text-xs ${
                      log.type === 'card_use' ? 'bg-blue-50 border-blue-500 text-blue-800' :
                      log.type === 'event' ? 'bg-purple-50 border-purple-500 text-purple-800' :
                      log.type === 'stats_change' ? 'bg-green-50 border-green-500 text-green-800' :
                      log.type === 'special_ability' ? 'bg-yellow-50 border-yellow-500 text-yellow-800' :
                      'bg-gray-50 border-gray-500 text-gray-800'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <div className="font-semibold">
                        {log.type === 'card_use' ? '🎯' : 
                         log.type === 'event' ? '🎉' : 
                         log.type === 'stats_change' ? '📈' : 
                         log.type === 'special_ability' ? '⭐' : '📝'} {log.message}
                      </div>
                      <div className="opacity-75">
                        {log.timestamp.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    {log.details && (
                      <div className="opacity-80 mb-1">{log.details}</div>
                    )}
                    {log.cardName && (
                      <div className="font-medium text-blue-600">カード: {log.cardName}</div>
                    )}
                    {log.playerName && (
                      <div className="font-medium text-green-600">選手: {log.playerName}</div>
                    )}
                    {log.statsChanges && (
                      <div className="mt-1">
                        {Object.entries(log.statsChanges).map(([stat, change]) => (
                          <span
                            key={stat}
                            className={`inline-block mr-1 px-1 py-0.5 rounded text-xs ${
                              change > 0 ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                            }`}
                          >
                            {stat}: {change > 0 ? '+' : ''}{change}
                          </span>
                        ))}
                      </div>
                    )}
                    {log.specialAbility && (
                      <div className="mt-1 bg-yellow-200 text-yellow-800 px-1 py-0.5 rounded text-xs">
                        ✨ 特殊能力: {log.specialAbility}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {activeTab === 'sugoroku' && (
            <div className="h-[800px]">
              <SugorokuTrainingBoard
                currentPosition={gameState.dayCount}
                availableCards={gameState.availableCards}
                onCardUse={handleCardUse}
                isLoading={isAdvancingDay}
              />
            </div>
          )}

          {activeTab === 'calendar' && (
            <CalendarView
              schoolFunds={gameState.schoolStats.funds}
              schoolReputation={gameState.schoolStats.reputation}
              onDayAdvance={handleAdvanceDay}
              onSquareEffect={(effectBonus) => {
                setNotifications(prev => [...prev, `マス効果: ${effectBonus > 0 ? '+' : ''}${effectBonus}%`].slice(-5));
              }}
              onEventEffect={handleSeasonalEvent}
              calendarSystem={gameFlow.getGameState().calendarSystem}
              currentState={gameFlow.getGameState().calendarSystem.getCurrentState()}
              onCalendarStateChange={(newState) => {
                // カレンダー状態の変更をゲームフローに反映
                // この部分は必要に応じて実装
              }}
            />
          )}


          {activeTab === 'stats' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* プレイヤー統計 */}
              <Card>
                <CardHeader>
                  <CardTitle>プレイヤー統計</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="font-semibold text-blue-700">総合力</div>
                        <div className="text-2xl font-bold text-blue-800">{playerStats.totalPower}</div>
                      </div>
                      <div className="bg-green-50 p-3 rounded-lg">
                        <div className="font-semibold text-green-700">平均スキル</div>
                        <div className="text-2xl font-bold text-green-800">{playerStats.averageSkill}</div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">スキル詳細</h4>
                      <div className="space-y-2">
                        {['serve_skill', 'return_skill', 'volley_skill', 'stroke_skill', 'mental'].map(skill => (
                          <div key={skill} className="flex justify-between items-center">
                            <span className="capitalize">{skill.replace('_', ' ')}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-20 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-500 h-2 rounded-full"
                                  style={{ width: `${Math.min(((gameState.player as any)[skill] || 0) / 100 * 100, 100)}%` }}
                                ></div>
                              </div>
                              <span className="font-semibold w-10 text-right">{(gameState.player as any)[skill] || 0}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* ゲーム統計 */}
              <Card>
                <CardHeader>
                  <CardTitle>ゲーム統計</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{gameState.stats.totalChoicesMade}</div>
                        <div className="text-sm text-gray-600">選択回数</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">{gameState.stats.totalCardsUsed}</div>
                        <div className="text-sm text-gray-600">カード使用</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {Math.round((gameState.stats.successfulChoices / Math.max(gameState.stats.totalChoicesMade, 1)) * 100)}%
                        </div>
                        <div className="text-sm text-gray-600">選択成功率</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">{gameState.stats.legendaryCardsObtained}</div>
                        <div className="text-sm text-gray-600">レジェンド獲得</div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">ゲーム進行</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>ゲームフェーズ</span>
                          <Badge variant="outline" className="capitalize">{gameState.gamePhase}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>経過日数</span>
                          <span>{gameState.dayCount}日 ({gameState.weekCount}週)</span>
                        </div>
                        <div className="flex justify-between">
                          <span>学校設備レベル</span>
                          <span>{gameState.schoolStats.facilities}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'events' && schoolId && (
            <div className="h-[800px]">
              <EventHistoryDisplay schoolId={schoolId} />
            </div>
          )}
        </div>
      </div>

      {/* モーダル群 */}
      {/* 選択モーダルは使用しない（自動化） */}

      {showCardResult && lastCardResult && (
        <CardUsageResultModal
          result={lastCardResult}
          onClose={() => {
            setShowCardResult(false);
            setLastCardResult(null);
          }}
        />
      )}

      {/* 季節イベントモーダルは使用しない（自動化） */}

      {/* 進化モーダル */}
      {evolutionTarget && (
        <EvolutionModal
          player={evolutionTarget}
          isOpen={showEvolutionModal}
          onClose={() => setShowEvolutionModal(false)}
          onEvolutionComplete={(evolvedPlayer) => {
            // プレイヤー配列を更新
            const state = gameFlow.getGameState();
            const all = state.allPlayers || [state.player];
            const replaced = all.map(p => (p.id === evolvedPlayer.id ? evolvedPlayer : p));
            gameFlow.updateAllPlayers(replaced as Player[]);
            syncGameState();
            setEvolutionTarget(null);
            setShowEvolutionModal(false);

            // 通知
            setNotifications(prev => [...prev, `${evolvedPlayer.pokemon_name}に進化！`].slice(-5));

            // Supabaseへ永続化
            (async () => {
              try {
                await supabase
                  .from('players')
                  .update({
                    pokemon_name: evolvedPlayer.pokemon_name,
                    pokemon_id: evolvedPlayer.pokemon_id,
                    level: evolvedPlayer.level,
                    serve_skill: evolvedPlayer.serve_skill,
                    return_skill: evolvedPlayer.return_skill,
                    volley_skill: evolvedPlayer.volley_skill,
                    stroke_skill: evolvedPlayer.stroke_skill,
                    mental: evolvedPlayer.mental,
                    stamina: evolvedPlayer.stamina,
                    condition: evolvedPlayer.condition,
                    motivation: evolvedPlayer.motivation,
                    experience: evolvedPlayer.experience,
                    types: evolvedPlayer.types || null,
                    special_abilities: evolvedPlayer.special_abilities || [],
                    pokemon_stats: evolvedPlayer.pokemon_stats || null
                  })
                  .eq('id', evolvedPlayer.id);
              } catch (e) {
                console.error('Failed to persist evolved player:', e);
              }
            })();
          }}
        />
      )}
    </div>
  );
};

export default IntegratedGameInterface;