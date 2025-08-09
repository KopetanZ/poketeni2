'use client';

import React, { useState, useEffect } from 'react';
import { IntegratedGameFlow, GameState } from '../../lib/integrated-game-flow';
import { Player } from '../../types/game';
import { CalendarDay } from '../../types/calendar';
import { TrainingCard, CardUsageResult } from '../../types/training-cards';
import { StrategicChoice, ChoiceOutcome } from '../../types/strategic-choice';

import CalendarView from '../calendar/CalendarView';
import CardSelectionInterface from '../cards/CardSelectionInterface';
import { StrategicChoiceModal } from '../choices/StrategicChoiceModal';
import CardUsageResultModal from '../cards/CardUsageResultModal';
import { SeasonalEventModal } from '../events/SeasonalEventModal';

import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface IntegratedGameInterfaceProps {
  initialPlayer: Player;
  initialSchoolStats: {
    funds: number;
    reputation: number;
    facilities: number;
  };
}

export const IntegratedGameInterface: React.FC<IntegratedGameInterfaceProps> = ({
  initialPlayer,
  initialSchoolStats
}) => {
  // ゲームフロー管理
  const [gameFlow] = useState(() => new IntegratedGameFlow(initialPlayer, initialSchoolStats));
  const [gameState, setGameState] = useState<GameState>(gameFlow.getGameState());
  
  // UI状態管理
  const [activeTab, setActiveTab] = useState<'calendar' | 'cards' | 'stats'>('calendar');
  const [showStrategicChoice, setShowStrategicChoice] = useState(false);
  const [showCardResult, setShowCardResult] = useState(false);
  const [showSeasonalEvent, setShowSeasonalEvent] = useState(false);
  
  // 結果データ
  const [lastCardResult, setLastCardResult] = useState<CardUsageResult | null>(null);
  const [lastChoiceResult, setLastChoiceResult] = useState<ChoiceOutcome | null>(null);
  
  // イベントと通知
  const [notifications, setNotifications] = useState<string[]>([]);
  const [isAdvancingDay, setIsAdvancingDay] = useState(false);

  // ゲーム状態の同期
  const syncGameState = () => {
    setGameState(gameFlow.getGameState());
  };

  // 日付進行処理
  const handleAdvanceDay = async () => {
    setIsAdvancingDay(true);
    
    try {
      const result = await gameFlow.advanceDay();
      syncGameState();
      
      // 通知の追加
      const newNotifications = [];
      
      if (result.triggeredEvents.length > 0) {
        newNotifications.push(`イベント発生: ${result.triggeredEvents.length}件`);
      }
      
      if (result.cardChanges.newCards.length > 0) {
        const legendaryCount = result.cardChanges.newCards.filter(card => card.rarity === 'legendary').length;
        if (legendaryCount > 0) {
          newNotifications.push(`レジェンドカード獲得: ${legendaryCount}枚！`);
        }
      }
      
      if (result.availableChoices.length > 0) {
        newNotifications.push('重要な選択が発生しました');
        setShowStrategicChoice(true);
      }
      
      // 季節イベント表示
      if (result.newDay.seasonalEvent) {
        setShowSeasonalEvent(true);
      }
      
      setNotifications(prev => [...prev, ...newNotifications].slice(-5)); // 最新5件のみ保持
      
    } catch (error) {
      console.error('Error advancing day:', error);
      setNotifications(prev => [...prev, 'エラーが発生しました'].slice(-5));
    }
    
    setIsAdvancingDay(false);
  };

  // カード使用処理（子コンポーネントから計算済み結果を受け取る）
  const handleCardUse = (result: CardUsageResult) => {
    try {
      setLastCardResult(result);
      setShowCardResult(true);
      syncGameState();
      
      // 成功時の通知
      if (result.success) {
        setNotifications(prev => [...prev, `${result.card.name}: ${result.successLevel}`].slice(-5));
      }
      
      // 緊急事態チェック
      const emergency = gameFlow.handleEmergency();
      if (emergency) {
        setNotifications(prev => [...prev, `緊急事態: ${emergency.type}`].slice(-5));
      }
      
    } catch (error) {
      console.error('Error using card:', error);
      setNotifications(prev => [...prev, 'カード使用エラー'].slice(-5));
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
        gameState.schoolStats[stat] = (gameState.schoolStats[stat] || 0) + change;
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
            <Button
              onClick={handleAdvanceDay}
              disabled={isAdvancingDay}
              size="lg"
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3"
            >
              {isAdvancingDay ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  進行中...
                </>
              ) : (
                '次の日へ'
              )}
            </Button>
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
            onClick={() => setActiveTab('calendar')}
            variant={activeTab === 'calendar' ? 'default' : 'outline'}
            className="flex items-center gap-2"
          >
            📅 カレンダー
          </Button>
          <Button
            onClick={() => setActiveTab('cards')}
            variant={activeTab === 'cards' ? 'default' : 'outline'}
            className="flex items-center gap-2"
          >
            🃏 練習カード ({gameState.availableCards.length})
          </Button>
          <Button
            onClick={() => setActiveTab('stats')}
            variant={activeTab === 'stats' ? 'default' : 'outline'}
            className="flex items-center gap-2"
          >
            📊 統計
          </Button>
        </div>

        {/* タブコンテンツ */}
        <div className="space-y-6">
          {activeTab === 'calendar' && (
            <CalendarView
              schoolFunds={gameState.schoolStats.funds}
              schoolReputation={gameState.schoolStats.reputation}
              onDayAdvance={handleAdvanceDay}
              onSquareEffect={(effectBonus) => {
                setNotifications(prev => [...prev, `マス効果: ${effectBonus > 0 ? '+' : ''}${effectBonus}%`].slice(-5));
              }}
              onEventEffect={handleSeasonalEvent}
            />
          )}

          {activeTab === 'cards' && (
            <CardSelectionInterface
              player={gameState.player}
              schoolFunds={gameState.schoolStats.funds}
              schoolReputation={gameState.schoolStats.reputation}
              onCardUse={handleCardUse}
              onStatsUpdate={(updatedPlayer) => {
                gameState.player = updatedPlayer;
                syncGameState();
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
                                  style={{ width: `${Math.min((gameState.player[skill] || 0) / 100 * 100, 100)}%` }}
                                ></div>
                              </div>
                              <span className="font-semibold w-10 text-right">{gameState.player[skill] || 0}</span>
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
        </div>
      </div>

      {/* モーダル群 */}
      {showStrategicChoice && gameState.activeChoice && (
        <StrategicChoiceModal
          choice={gameState.activeChoice}
          playerStats={gameState.player}
          schoolStats={gameState.schoolStats}
          environmentFactors={{
            weather: gameState.currentDay.weather,
            courtCondition: gameState.currentDay.courtCondition,
            teamMorale: 70 // TODO: 実際の計算
          }}
          onChoiceComplete={(outcome) => {
            handleStrategicChoice(gameState.activeChoice!, outcome.selectedRoute);
            setShowStrategicChoice(false);
          }}
          onClose={() => setShowStrategicChoice(false)}
        />
      )}

      {showCardResult && lastCardResult && (
        <CardUsageResultModal
          result={lastCardResult}
          onClose={() => {
            setShowCardResult(false);
            setLastCardResult(null);
          }}
        />
      )}

      {showSeasonalEvent && gameState.currentDay.seasonalEvent && (
        <SeasonalEventModal
          event={gameState.currentDay.seasonalEvent}
          schoolFunds={gameState.schoolStats.funds}
          schoolReputation={gameState.schoolStats.reputation}
          onEventComplete={handleSeasonalEvent}
          onClose={() => setShowSeasonalEvent(false)}
        />
      )}
    </div>
  );
};

export default IntegratedGameInterface;