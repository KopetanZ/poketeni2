'use client';

import React, { useState, useEffect } from 'react';
import { CalendarSystem, SQUARE_EFFECTS, WEATHER_EFFECTS, COURT_EFFECTS } from '../../lib/calendar-system';
import { CalendarDay, CalendarState, SquareType, EventEffect } from '../../types/calendar';
import { SeasonalEventModal } from '../events/SeasonalEventModal';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface CalendarViewProps {
  schoolFunds?: number;
  schoolReputation?: number;
  onDayAdvance?: (day: CalendarDay) => void;
  onSquareEffect?: (effectBonus: number) => void;
  onEventEffect?: (effects: EventEffect) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ 
  schoolFunds = 50000, 
  schoolReputation = 50, 
  onDayAdvance, 
  onSquareEffect, 
  onEventEffect 
}) => {
  const [calendarSystem] = useState(() => new CalendarSystem());
  const [currentState, setCurrentState] = useState<CalendarState>(calendarSystem.getCurrentState());
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);

  const currentDay = currentState.currentDate;
  const squareEffect = SQUARE_EFFECTS[currentDay.square];
  const weatherEffect = currentDay.weather ? WEATHER_EFFECTS[currentDay.weather] : null;
  const courtEffect = currentDay.courtCondition ? COURT_EFFECTS[currentDay.courtCondition] : null;

  // 日付進行処理
  const handleAdvanceDay = async () => {
    setIsAdvancing(true);
    
    // エフェクト処理
    if (onSquareEffect && squareEffect.effects.practiceEfficiency) {
      onSquareEffect(squareEffect.effects.practiceEfficiency - 100);
    }
    
    // 週間効果累積
    calendarSystem.addWeeklyEffect(
      squareEffect.effects.practiceEfficiency || 100,
      10, // 基本体力消費
      currentDay.seasonalEvent?.id || currentDay.hiddenEvent?.id
    );

    // アニメーション用遅延
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 次の日へ
    const nextDay = calendarSystem.advanceDay();
    setCurrentState(calendarSystem.getCurrentState());
    
    if (onDayAdvance) {
      onDayAdvance(nextDay);
    }
    
    setIsAdvancing(false);
  };

  // マス色に応じたスタイル取得
  const getSquareStyle = (squareType: SquareType) => {
    const effect = SQUARE_EFFECTS[squareType];
    return {
      backgroundColor: effect.bgColor,
      borderColor: effect.color,
      color: effect.color
    };
  };

  // 天候アイコン表示
  const WeatherDisplay = () => {
    if (!weatherEffect) return null;
    
    return (
      <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
        <span className="text-2xl">{weatherEffect.icon}</span>
        <div>
          <div className="font-semibold text-sm">{weatherEffect.name}</div>
          <div className="text-xs text-gray-600">{weatherEffect.description}</div>
        </div>
      </div>
    );
  };

  // イベント表示
  const EventDisplay = () => {
    const event = currentDay.seasonalEvent || currentDay.hiddenEvent;
    if (!event) return null;

    const isSeasonalEvent = !!currentDay.seasonalEvent;

    return (
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-orange-700 text-lg flex items-center gap-2">
            🎉 {event.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-orange-600 text-sm mb-3">{event.description}</p>
          {isSeasonalEvent && (
            <Button 
              onClick={() => setShowEventModal(true)}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              イベントに参加する
            </Button>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* 日付・進行状況表示 */}
      <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl">
                {currentState.currentYear}年生 {currentDay.month}月 第{currentDay.week}週
              </CardTitle>
              <p className="text-blue-100 mt-1">
                卒業まで {Math.ceil(currentState.daysUntilGraduation / 365 * 10) / 10} 年
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-blue-100">現在</div>
              <div className="text-lg font-bold">
                {currentState.currentSemester === 1 ? '前期' : '後期'}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* 今日のマス情報 */}
      <Card className="border-2" style={getSquareStyle(currentDay.square)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <span className="text-3xl">{squareEffect.icon}</span>
            <div>
              <div className="text-xl">{squareEffect.name}</div>
              <div className="text-sm font-normal opacity-80">
                {squareEffect.description}
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {/* 基本効果 */}
            <div className="space-y-2">
              <h4 className="font-semibold">基本効果</h4>
              <div className="space-y-1 text-sm">
                {squareEffect.effects.practiceEfficiency && (
                  <div>練習効率: {squareEffect.effects.practiceEfficiency}%</div>
                )}
                {squareEffect.effects.staminaChange && (
                  <div className={squareEffect.effects.staminaChange > 0 ? "text-green-600" : "text-red-600"}>
                    体力変化: {squareEffect.effects.staminaChange > 0 ? '+' : ''}{squareEffect.effects.staminaChange}
                  </div>
                )}
                {squareEffect.effects.motivationChange && (
                  <div className={squareEffect.effects.motivationChange > 0 ? "text-green-600" : "text-red-600"}>
                    やる気: {squareEffect.effects.motivationChange > 0 ? '+' : ''}{squareEffect.effects.motivationChange}
                  </div>
                )}
              </div>
            </div>

            {/* スキル効果 */}
            {squareEffect.effects.skillBonus && (
              <div className="space-y-2">
                <h4 className="font-semibold">成長倍率</h4>
                <div className="grid grid-cols-2 gap-1 text-xs">
                  {Object.entries(squareEffect.effects.skillBonus).map(([skill, multiplier]) => (
                    <div key={skill} className="flex justify-between">
                      <span>{skill.replace('_skill', '').replace('_', ' ')}</span>
                      <Badge variant={multiplier && multiplier > 1 ? "default" : "secondary"} className="text-xs px-1">
                        ×{multiplier}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 特殊効果警告 */}
          {squareEffect.effects.injuryRisk && squareEffect.effects.injuryRisk > 0 && (
            <div className="mt-3 p-2 bg-red-100 border border-red-200 rounded-lg">
              <div className="text-red-700 text-sm flex items-center gap-1">
                ⚠️ 怪我リスク: {squareEffect.effects.injuryRisk}%
              </div>
            </div>
          )}

          {squareEffect.effects.eventTriggerChance && (
            <div className="mt-3 p-2 bg-yellow-100 border border-yellow-200 rounded-lg">
              <div className="text-yellow-700 text-sm flex items-center gap-1">
                ✨ 特殊イベント発生率: {squareEffect.effects.eventTriggerChance}%
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 環境情報 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 天候 */}
        <WeatherDisplay />
        
        {/* コート状況 */}
        {courtEffect && (
          <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
            <span className="text-2xl">🎾</span>
            <div>
              <div className="font-semibold text-sm">コート: {courtEffect.name}</div>
              <div className="text-xs text-gray-600">
                効率 {courtEffect.effects.practiceEfficiency}%
              </div>
            </div>
          </div>
        )}
      </div>

      {/* イベント表示 */}
      <EventDisplay />

      {/* 週間累積効果 */}
      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle className="text-lg">今週の累積効果</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                +{Math.round(currentState.weeklyEffects.totalPracticeBonus - 700)}%
              </div>
              <div className="text-xs text-gray-600">練習ボーナス</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {currentState.weeklyEffects.totalStaminaUsage}
              </div>
              <div className="text-xs text-gray-600">体力消費</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {currentState.weeklyEffects.eventsTriggered.length}
              </div>
              <div className="text-xs text-gray-600">発生イベント</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 進行ボタン */}
      <div className="flex justify-center pt-4">
        <Button
          onClick={handleAdvanceDay}
          disabled={isAdvancing}
          size="lg"
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3"
        >
          {isAdvancing ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              進行中...
            </>
          ) : (
            <>
              🎯 今日の練習開始
            </>
          )}
        </Button>
      </div>

      {/* 季節イベントモーダル */}
      {showEventModal && currentDay.seasonalEvent && (
        <SeasonalEventModal
          event={currentDay.seasonalEvent}
          schoolFunds={schoolFunds}
          schoolReputation={schoolReputation}
          onEventComplete={(effects) => {
            if (onEventEffect) {
              onEventEffect(effects);
            }
            setShowEventModal(false);
          }}
          onClose={() => setShowEventModal(false)}
        />
      )}
    </div>
  );
};

export default CalendarView;