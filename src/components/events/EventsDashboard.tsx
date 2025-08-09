'use client';

import React, { useState, useEffect } from 'react';
import { SpecialEvent, EventOutcome } from '@/types/special-events';
import { Player } from '@/types/game';
import { SpecialEventsSystem } from '@/lib/special-events-system';
import { SpecialEventModal } from './SpecialEventModal';
import { Star, Zap, Calendar, Users, Award } from 'lucide-react';

interface EventsDashboardProps {
  players: Player[];
  currentDate: { year: number; month: number; day: number };
  schoolReputation: number;
  onEventComplete: (outcome: EventOutcome, player: Player) => void;
}

export function EventsDashboard({
  players,
  currentDate,
  schoolReputation,
  onEventComplete
}: EventsDashboardProps) {
  const [availableEvents, setAvailableEvents] = useState<SpecialEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<SpecialEvent | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [eventHistory, setEventHistory] = useState<{
    event_id?: string;
    event_name?: string;
    player_name: string;
    date: { year: number; month: number; day: number };
    success: boolean;
    learned_ability?: any;
    rewards: any;
  }[]>([]);
  const [activeTab, setActiveTab] = useState<'available' | 'history' | 'players'>('available');

  // イベントチェック
  useEffect(() => {
    const events = SpecialEventsSystem.checkEventTriggers(
      players[0], // 暫定的にキャプテンをベースに
      currentDate,
      'win', // 暫定的
      0, // 暫定的
      schoolReputation
    );
    setAvailableEvents(events);
  }, [players, currentDate, schoolReputation]);

  // レア度に応じたスタイリング
  const getRarityStyle = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'border-gray-300 bg-gray-50 text-gray-800';
      case 'uncommon':
        return 'border-green-300 bg-green-50 text-green-800';
      case 'rare':
        return 'border-blue-300 bg-blue-50 text-blue-800';
      case 'epic':
        return 'border-purple-300 bg-purple-50 text-purple-800';
      case 'legendary':
        return 'border-yellow-300 bg-yellow-50 text-yellow-800';
      default:
        return 'border-gray-300 bg-gray-50 text-gray-800';
    }
  };

  const handleEventStart = (event: SpecialEvent, player: Player) => {
    setSelectedEvent(event);
    setSelectedPlayer(player);
    setShowEventModal(true);
  };

  const handleEventComplete = (outcome: EventOutcome, player: Player) => {
    // イベント履歴に追加
    const historyEntry = {
      event_id: selectedEvent?.id,
      event_name: selectedEvent?.name,
      player_name: player.pokemon_name,
      date: currentDate,
      success: outcome.success,
      learned_ability: outcome.learned_ability,
      rewards: outcome.rewards_gained
    };
    setEventHistory(prev => [historyEntry, ...prev]);

    // 親コンポーネントに通知
    onEventComplete(outcome, player);
    
    // モーダルを閉じる
    setShowEventModal(false);
    setSelectedEvent(null);
    setSelectedPlayer(null);

    // 利用可能イベントを更新
    setTimeout(() => {
      const events = SpecialEventsSystem.checkEventTriggers(
        players[0],
        currentDate,
        'win',
        0,
        schoolReputation
      );
      setAvailableEvents(events);
    }, 1000);
  };

  const getEligiblePlayers = (event: SpecialEvent): Player[] => {
    return players.filter(player => {
      const learnableAbilities = SpecialEventsSystem.getLearnableAbilities(player, event);
      return learnableAbilities.length > 0;
    });
  };

  return (
    <div className="h-full flex flex-col">
      {/* ヘッダー */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Star className="text-yellow-400" size={32} />
          特殊能力習得イベント
        </h1>
        <p className="text-slate-300">
          特別な訓練や試合を通じて、ポケモンが新しい特殊能力を習得できます
        </p>
      </div>

      {/* タブナビゲーション */}
      <div className="flex space-x-4 mb-6">
        {[
          { id: 'available', name: '利用可能', icon: Calendar, count: availableEvents.length },
          { id: 'history', name: '履歴', icon: Award, count: eventHistory.length },
          { id: 'players', name: '選手状況', icon: Users, count: players.length }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            <tab.icon size={20} />
            {tab.name}
            <span className="bg-slate-900 text-white px-2 py-1 rounded-full text-xs">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* コンテンツエリア */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'available' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">利用可能なイベント</h2>
              <div className="text-slate-400 text-sm">
                {availableEvents.length}個のイベントが利用可能
              </div>
            </div>

            {availableEvents.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="mx-auto text-slate-500 mb-4" size={48} />
                <p className="text-slate-400 text-lg mb-2">現在利用可能なイベントはありません</p>
                <p className="text-slate-500 text-sm">
                  レベルアップや試合結果によって新しいイベントが発生します
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {availableEvents.map((event) => {
                  const eligiblePlayers = getEligiblePlayers(event);
                  
                  return (
                    <div
                      key={event.id}
                      className={`border-2 rounded-xl p-6 transition-all hover:scale-105 cursor-pointer ${getRarityStyle(event.rarity)}`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="text-3xl">{event.icon}</div>
                          <div>
                            <h3 className="font-bold text-lg">{event.name}</h3>
                            <div className="flex items-center gap-2 text-sm opacity-75">
                              <span className="capitalize">{event.rarity}</span>
                              <span>•</span>
                              <span>{event.type === 'training' ? '練習' :
                                     event.type === 'match' ? '試合' :
                                     event.type === 'seasonal' ? '季節' :
                                     event.type === 'achievement' ? '実績' : 'ランダム'}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-sm opacity-75">参加可能選手</div>
                          <div className="font-bold">{eligiblePlayers.length}名</div>
                        </div>
                      </div>

                      <p className="text-sm mb-4 opacity-90">{event.description}</p>

                      {/* 習得可能能力プレビュー */}
                      <div className="mb-4">
                        <div className="text-sm font-medium mb-2">習得可能能力:</div>
                        <div className="flex flex-wrap gap-2">
                          {event.available_abilities.slice(0, 3).map((ability, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-white/20 rounded-full text-xs"
                            >
                              {ability.ability_id}
                            </span>
                          ))}
                          {event.available_abilities.length > 3 && (
                            <span className="px-2 py-1 bg-white/20 rounded-full text-xs">
                              +{event.available_abilities.length - 3}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* 選手選択ボタン */}
                      <div className="flex flex-wrap gap-2">
                        {eligiblePlayers.slice(0, 3).map(player => (
                          <button
                            key={player.id}
                            onClick={() => handleEventStart(event, player)}
                            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                          >
                            <Zap size={16} />
                            {player.pokemon_name}
                          </button>
                        ))}
                        {eligiblePlayers.length > 3 && (
                          <button className="px-3 py-2 bg-slate-600 text-white rounded-lg text-sm">
                            +{eligiblePlayers.length - 3}名
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white">イベント履歴</h2>
            
            {eventHistory.length === 0 ? (
              <div className="text-center py-12">
                <Award className="mx-auto text-slate-500 mb-4" size={48} />
                <p className="text-slate-400">まだイベントに参加していません</p>
              </div>
            ) : (
              <div className="space-y-3">
                {eventHistory.map((entry, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${
                      entry.success 
                        ? 'bg-green-50 border-green-200 text-green-800'
                        : 'bg-red-50 border-red-200 text-red-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-semibold">
                        {entry.success ? '✅' : '❌'} {entry.event_name}
                      </div>
                      <div className="text-sm opacity-75">
                        {entry.date.year}/{entry.date.month}/{entry.date.day}
                      </div>
                    </div>
                    <div className="text-sm mb-1">
                      参加選手: {entry.player_name}
                    </div>
                    {entry.learned_ability && (
                      <div className="text-sm font-medium">
                        習得能力: {entry.learned_ability.name}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'players' && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white">選手の特殊能力状況</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {players.map(player => (
                <div
                  key={player.id}
                  className="bg-slate-700 rounded-lg p-4 border border-slate-600"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-white">{player.pokemon_name}</h3>
                    <div className="text-slate-400 text-sm">Lv.{player.level}</div>
                  </div>
                  
                  <div className="mb-3">
                    <div className="text-slate-400 text-sm mb-1">現在の特殊能力:</div>
                    {player.special_abilities && player.special_abilities.length > 0 ? (
                      <div className="space-y-1">
                        {player.special_abilities.map((ability, index) => (
                          <div
                            key={index}
                            className="px-2 py-1 bg-blue-600 text-white rounded text-xs"
                          >
                            {ability.name}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-slate-500 text-sm">なし</div>
                    )}
                  </div>

                  <div className="text-slate-400 text-sm">
                    参加可能イベント: {availableEvents.filter(event => 
                      SpecialEventsSystem.getLearnableAbilities(player, event).length > 0
                    ).length}個
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* イベントモーダル */}
      {showEventModal && selectedEvent && selectedPlayer && (
        <SpecialEventModal
          event={selectedEvent}
          player={selectedPlayer}
          isOpen={showEventModal}
          onClose={() => setShowEventModal(false)}
          onEventComplete={handleEventComplete}
        />
      )}
    </div>
  );
}