'use client';

import React, { useState } from 'react';
import { ScoutingSystem } from '@/lib/scouting-system';
import { ScoutingLocation, DiscoveredPokemon, ScoutingResult, RecruitmentAttempt } from '@/types/scouting';
import { Player } from '@/types/game';
import { MapPin, Clock, DollarSign, Star, Users, Search, TrendingUp } from 'lucide-react';

interface ScoutingManagerProps {
  schoolFunds: number;
  schoolReputation: number;
  onScoutingComplete: (result: ScoutingResult) => void;
  onRecruitmentComplete: (attempt: RecruitmentAttempt) => void;
}

export function ScoutingManager({
  schoolFunds,
  schoolReputation,
  onScoutingComplete,
  onRecruitmentComplete
}: ScoutingManagerProps) {
  const [selectedLocation, setSelectedLocation] = useState<ScoutingLocation | null>(null);
  const [scoutQuality, setScoutQuality] = useState<'basic' | 'advanced' | 'expert'>('basic');
  const [isLoading, setIsLoading] = useState(false);
  const [discoveredPokemon, setDiscoveredPokemon] = useState<DiscoveredPokemon[]>([]);
  const [currentTab, setCurrentTab] = useState<'locations' | 'discovered' | 'reports'>('locations');

  const locations = ScoutingSystem.getAvailableLocations();

  // スカウト実行
  const handleScouting = async () => {
    if (!selectedLocation) return;

    const qualityMultiplier = scoutQuality === 'expert' ? 2.0 : scoutQuality === 'advanced' ? 1.5 : 1.0;
    const cost = Math.floor(selectedLocation.cost * qualityMultiplier);

    if (cost > schoolFunds) {
      alert('資金が不足しています！');
      return;
    }

    setIsLoading(true);
    try {
      const result = await ScoutingSystem.executeScouting(selectedLocation, scoutQuality);
      
      if (result.success && result.pokemon_found) {
        setDiscoveredPokemon(prev => [...prev, ...result.pokemon_found!]);
        setCurrentTab('discovered');
      }
      
      onScoutingComplete(result);
      alert(result.message);
    } catch (error) {
      console.error('Scouting failed:', error);
      alert('スカウト中にエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  // 勧誘実行
  const handleRecruitment = async (pokemon: DiscoveredPokemon) => {
    if (pokemon.recruitment_cost > schoolFunds) {
      alert('勧誘費用が不足しています！');
      return;
    }

    setIsLoading(true);
    try {
      const attempt = await ScoutingSystem.attemptRecruitment(pokemon, schoolReputation);
      
      if (attempt.success) {
        // 勧誘成功時は発見リストから削除
        setDiscoveredPokemon(prev => prev.filter(p => p !== pokemon));
      }
      
      onRecruitmentComplete(attempt);
      alert(attempt.message);
    } catch (error) {
      console.error('Recruitment failed:', error);
      alert('勧誘中にエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-600 bg-gray-100';
      case 'uncommon': return 'text-green-600 bg-green-100';
      case 'rare': return 'text-blue-600 bg-blue-100';
      case 'epic': return 'text-purple-600 bg-purple-100';
      case 'legendary': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRarityText = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'コモン';
      case 'uncommon': return 'アンコモン';
      case 'rare': return 'レア';
      case 'epic': return 'エピック';
      case 'legendary': return 'レジェンダリー';
      default: return rarity;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2">
          <Search className="text-blue-600" />
          ポケモンスカウトシステム
        </h1>
        <p className="text-gray-600">新しいポケモンを発見し、部活に勧誘しましょう</p>
      </div>

      {/* 学校ステータス */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">資金</p>
              <p className="text-2xl font-bold text-green-800">¥{schoolFunds.toLocaleString()}</p>
            </div>
            <DollarSign className="text-green-600" size={32} />
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">学校評判</p>
              <p className="text-2xl font-bold text-blue-800">{schoolReputation}</p>
            </div>
            <TrendingUp className="text-blue-600" size={32} />
          </div>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-600 text-sm font-medium">発見済み</p>
              <p className="text-2xl font-bold text-yellow-800">{discoveredPokemon.length}匹</p>
            </div>
            <Users className="text-yellow-600" size={32} />
          </div>
        </div>
      </div>

      {/* タブ選択 */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
        {[
          { id: 'locations', name: 'スカウト場所', icon: MapPin },
          { id: 'discovered', name: '発見済みポケモン', icon: Users },
          { id: 'reports', name: 'スカウト報告', icon: Star }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setCurrentTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md font-medium transition-colors ${
              currentTab === tab.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <tab.icon size={20} />
            {tab.name}
            {tab.id === 'discovered' && discoveredPokemon.length > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                {discoveredPokemon.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* スカウト場所タブ */}
      {currentTab === 'locations' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 場所一覧 */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">スカウト可能な場所</h2>
            <div className="space-y-4">
              {locations.map(location => {
                const qualityMultiplier = scoutQuality === 'expert' ? 2.0 : scoutQuality === 'advanced' ? 1.5 : 1.0;
                const cost = Math.floor(location.cost * qualityMultiplier);
                
                return (
                  <div
                    key={location.id}
                    onClick={() => setSelectedLocation(location)}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedLocation?.id === location.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{location.icon}</span>
                        <h3 className="font-semibold text-gray-800">{location.name}</h3>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-800">¥{cost.toLocaleString()}</p>
                        <p className="text-sm text-gray-500">{location.time_required}日間</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{location.description}</p>
                    
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>最大{location.max_encounters}匹遭遇</span>
                      <span>Lv.{location.level_range.min}-{location.level_range.max}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* スカウト実行パネル */}
          <div>
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">スカウト実行</h2>
              
              {selectedLocation ? (
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                      <span className="text-xl">{selectedLocation.icon}</span>
                      {selectedLocation.name}
                    </h3>
                    <p className="text-sm text-gray-600">{selectedLocation.description}</p>
                  </div>

                  {/* スカウト品質選択 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      スカウト品質
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { value: 'basic', name: 'ベーシック', multiplier: '×1.0' },
                        { value: 'advanced', name: 'アドバンス', multiplier: '×1.5' },
                        { value: 'expert', name: 'エキスパート', multiplier: '×2.0' }
                      ].map(quality => (
                        <button
                          key={quality.value}
                          onClick={() => setScoutQuality(quality.value as any)}
                          className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                            scoutQuality === quality.value
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <div>{quality.name}</div>
                          <div className="text-xs opacity-75">{quality.multiplier}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* コスト表示 */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-blue-700 font-medium">必要費用</span>
                      <span className="text-blue-800 font-bold">
                        ¥{Math.floor(selectedLocation.cost * (scoutQuality === 'expert' ? 2.0 : scoutQuality === 'advanced' ? 1.5 : 1.0)).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-blue-700 font-medium">所要時間</span>
                      <span className="text-blue-800 font-bold">{selectedLocation.time_required}日間</span>
                    </div>
                  </div>

                  <button
                    onClick={handleScouting}
                    disabled={isLoading || Math.floor(selectedLocation.cost * (scoutQuality === 'expert' ? 2.0 : scoutQuality === 'advanced' ? 1.5 : 1.0)) > schoolFunds}
                    className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        スカウト中...
                      </>
                    ) : (
                      <>
                        <Search size={16} />
                        スカウト開始
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  スカウト場所を選択してください
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 発見済みポケモンタブ */}
      {currentTab === 'discovered' && (
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            発見済みポケモン ({discoveredPokemon.length}匹)
          </h2>
          
          {discoveredPokemon.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Users size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">まだポケモンを発見していません</p>
              <p className="text-sm text-gray-500 mt-2">スカウトを実行してポケモンを探しましょう</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {discoveredPokemon.map((pokemon, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-800">{pokemon.pokemon_name}</h3>
                      <p className="text-sm text-gray-500">Lv.{pokemon.level}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getRarityColor(pokemon.rarity)}`}>
                      {getRarityText(pokemon.rarity)}
                    </span>
                  </div>

                  <div className="space-y-1 mb-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">サーブ</span>
                      <span className="font-medium">{pokemon.stats.serve_skill}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">リターン</span>
                      <span className="font-medium">{pokemon.stats.return_skill}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">ボレー</span>
                      <span className="font-medium">{pokemon.stats.volley_skill}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">ストローク</span>
                      <span className="font-medium">{pokemon.stats.stroke_skill}</span>
                    </div>
                  </div>

                  <div className="border-t pt-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">勧誘費用</span>
                      <span className="font-medium">¥{pokemon.recruitment_cost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm text-gray-600">成功確率</span>
                      <span className="font-medium">{Math.round(pokemon.recruitment_difficulty * 100)}%</span>
                    </div>
                    
                    <button
                      onClick={() => handleRecruitment(pokemon)}
                      disabled={isLoading || pokemon.recruitment_cost > schoolFunds}
                      className="w-full bg-blue-600 text-white py-2 px-3 rounded text-sm font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {isLoading ? '処理中...' : '勧誘する'}
                    </button>
                  </div>

                  <p className="text-xs text-gray-500 mt-2">
                    {pokemon.discovered_at}で発見
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* スカウト報告タブ（プレースホルダー） */}
      {currentTab === 'reports' && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Star size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">スカウト報告機能は開発中です</p>
        </div>
      )}
    </div>
  );
}