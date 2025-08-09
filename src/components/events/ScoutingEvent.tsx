'use client';

import React, { useState, useEffect } from 'react';
import { NewStudentCandidate, Player } from '@/types/game';
import { GenerationSystem } from '@/lib/generation-system';
import { Search, Star, Users, Zap, Target, DollarSign, TrendingUp, Sparkles, Eye, CheckCircle, XCircle } from 'lucide-react';

interface ScoutingEventProps {
  scoutingPool: NewStudentCandidate[];
  schoolFunds: number;
  schoolReputation: number;
  onScoutingComplete: (newPlayers: Player[], spentFunds: number) => void;
  onClose: () => void;
}

export default function ScoutingEvent({
  scoutingPool,
  schoolFunds,
  schoolReputation,
  onScoutingComplete,
  onClose
}: ScoutingEventProps) {
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [scoutingResults, setScoutingResults] = useState<{
    candidate: NewStudentCandidate;
    success: boolean;
    player?: Player;
  }[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [currentResultIndex, setCurrentResultIndex] = useState(0);
  const [totalSpentFunds, setTotalSpentFunds] = useState(0);
  const [scoutingInProgress, setScoutingInProgress] = useState(false);

  const getPotentialDisplay = (potential: string) => {
    switch (potential) {
      case 'genius':
        return { text: '天才肌', icon: '✨', color: 'text-yellow-500 bg-yellow-100', bgClass: 'bg-gradient-to-r from-yellow-50 to-orange-50' };
      case 'talented':
        return { text: '才能型', icon: '⭐', color: 'text-blue-500 bg-blue-100', bgClass: 'bg-gradient-to-r from-blue-50 to-purple-50' };
      case 'normal':
        return { text: '普通型', icon: '👤', color: 'text-gray-500 bg-gray-100', bgClass: 'bg-gradient-to-r from-gray-50 to-slate-50' };
      case 'underdog':
        return { text: '大器晩成', icon: '🌱', color: 'text-green-500 bg-green-100', bgClass: 'bg-gradient-to-r from-green-50 to-emerald-50' };
      default:
        return { text: '不明', icon: '❓', color: 'text-gray-400 bg-gray-100', bgClass: 'bg-gray-50' };
    }
  };

  const getPersonalityDisplay = (personality: string) => {
    const personalities = {
      aggressive: { text: 'アグレッシブ', icon: '⚡', color: 'text-red-500' },
      technical: { text: 'テクニカル', icon: '🎯', color: 'text-blue-500' },
      stamina: { text: 'スタミナ', icon: '💪', color: 'text-green-500' },
      genius: { text: '天才肌', icon: '🧠', color: 'text-purple-500' },
      hardworker: { text: '努力家', icon: '🔥', color: 'text-orange-500' },
      cheerful: { text: 'お調子者', icon: '😊', color: 'text-yellow-500' },
      shy: { text: '内気', icon: '😌', color: 'text-indigo-500' },
      leader: { text: 'リーダー', icon: '👑', color: 'text-gold-500' }
    };
    return personalities[personality as keyof typeof personalities] || { text: '不明', icon: '❓', color: 'text-gray-500' };
  };

  const handleCandidateToggle = (candidateId: string) => {
    setSelectedCandidates(prev => {
      const isSelected = prev.includes(candidateId);
      if (isSelected) {
        return prev.filter(id => id !== candidateId);
      } else {
        const candidate = scoutingPool.find(c => c.id === candidateId);
        const currentCost = prev.reduce((sum, id) => {
          const c = scoutingPool.find(sc => sc.id === id);
          return sum + (c?.scoutingCost || 0);
        }, 0);
        
        if (currentCost + (candidate?.scoutingCost || 0) <= schoolFunds) {
          return [...prev, candidateId];
        }
        return prev;
      }
    });
  };

  const handleStartScouting = async () => {
    setScoutingInProgress(true);
    
    // ドラマティックな演出のため少し待つ
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const results: typeof scoutingResults = [];
    let spentFunds = 0;
    
    for (const candidateId of selectedCandidates) {
      const candidate = scoutingPool.find(c => c.id === candidateId);
      if (!candidate) continue;
      
      const result = GenerationSystem.attemptScouting(candidate, schoolFunds - spentFunds);
      spentFunds += result.cost;
      
      results.push({
        candidate,
        success: result.success,
        player: result.newPlayer
      });
      
      // 各スカウト結果の間に少し間を空ける
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setScoutingResults(results);
    setTotalSpentFunds(spentFunds);
    setScoutingInProgress(false);
    setShowResults(true);
  };

  const handleNextResult = () => {
    if (currentResultIndex < scoutingResults.length - 1) {
      setCurrentResultIndex(prev => prev + 1);
    } else {
      // 全結果表示完了
      const newPlayers = scoutingResults
        .filter(result => result.success && result.player)
        .map(result => result.player!);
      
      onScoutingComplete(newPlayers, totalSpentFunds);
      onClose();
    }
  };

  const calculateTotalCost = () => {
    return selectedCandidates.reduce((sum, candidateId) => {
      const candidate = scoutingPool.find(c => c.id === candidateId);
      return sum + (candidate?.scoutingCost || 0);
    }, 0);
  };

  if (showResults) {
    const currentResult = scoutingResults[currentResultIndex];
    if (!currentResult) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
        <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl p-8 max-w-2xl w-full mx-4 border border-slate-600">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-2">
              <Search className="text-blue-400" />
              スカウト結果
            </h2>
            <div className="text-slate-300">
              {currentResultIndex + 1} / {scoutingResults.length}人目
            </div>
          </div>

          <div className="bg-slate-700/50 rounded-xl p-6">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-teal-400 rounded-full mx-auto mb-4 flex items-center justify-center text-white font-bold text-2xl">
                {currentResult.candidate.pokemon_name[0] || '?'}
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                {currentResult.candidate.pokemon_name}
              </h3>
              
              {currentResult.success ? (
                <div className="bg-gradient-to-r from-green-900/50 to-emerald-900/50 p-4 rounded-lg border border-green-500/30 mb-4">
                  <div className="flex items-center justify-center gap-2 text-green-400 text-lg font-bold">
                    <CheckCircle size={24} />
                    スカウト成功！
                  </div>
                  <p className="text-green-200 text-sm mt-2">
                    {currentResult.candidate.pokemon_name}が入部してくれました！
                  </p>
                </div>
              ) : (
                <div className="bg-gradient-to-r from-red-900/50 to-pink-900/50 p-4 rounded-lg border border-red-500/30 mb-4">
                  <div className="flex items-center justify-center gap-2 text-red-400 text-lg font-bold">
                    <XCircle size={24} />
                    スカウト失敗...
                  </div>
                  <p className="text-red-200 text-sm mt-2">
                    {currentResult.candidate.competitorSchools[0] || '他校'}に取られてしまいました
                  </p>
                </div>
              )}
            </div>

            {/* 候補者詳細 */}
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-4">
                {(() => {
                  const potentialInfo = getPotentialDisplay(currentResult.candidate.potential);
                  return (
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${potentialInfo.color}`}>
                      {potentialInfo.icon} {potentialInfo.text}
                    </span>
                  );
                })()}
                
                {(() => {
                  const personalityInfo = getPersonalityDisplay(currentResult.candidate.personality);
                  return (
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${personalityInfo.color}`}>
                      {personalityInfo.icon} {personalityInfo.text}
                    </span>
                  );
                })()}
              </div>

              {currentResult.success && currentResult.player && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-800/50 p-2 rounded text-center">
                    <div className="text-slate-400 text-xs">サーブ</div>
                    <div className="text-white font-bold">{currentResult.player.serve_skill}</div>
                  </div>
                  <div className="bg-slate-800/50 p-2 rounded text-center">
                    <div className="text-slate-400 text-xs">リターン</div>
                    <div className="text-white font-bold">{currentResult.player.return_skill}</div>
                  </div>
                  <div className="bg-slate-800/50 p-2 rounded text-center">
                    <div className="text-slate-400 text-xs">ボレー</div>
                    <div className="text-white font-bold">{currentResult.player.volley_skill}</div>
                  </div>
                  <div className="bg-slate-800/50 p-2 rounded text-center">
                    <div className="text-slate-400 text-xs">ストローク</div>
                    <div className="text-white font-bold">{currentResult.player.stroke_skill}</div>
                  </div>
                </div>
              )}
            </div>

            <div className="text-center mt-6">
              <button
                onClick={handleNextResult}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
              >
                {currentResultIndex < scoutingResults.length - 1 ? '次の結果を見る' : 'スカウト完了'}
              </button>
            </div>
          </div>

          {/* 進行状況 */}
          <div className="mt-6">
            <div className="flex justify-center space-x-2">
              {scoutingResults.map((result, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full ${
                    index <= currentResultIndex 
                      ? (result.success ? 'bg-green-400' : 'bg-red-400')
                      : 'bg-slate-600'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (scoutingInProgress) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
        <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl p-8 max-w-md w-full mx-4 border border-slate-600">
          <div className="text-center">
            <div className="animate-spin w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <h3 className="text-xl font-bold text-white mb-2">スカウト中...</h3>
            <p className="text-slate-300">候補者と交渉しています</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl p-8 max-w-6xl w-full mx-4 border border-slate-600 my-8">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-white mb-4 flex items-center justify-center gap-2">
            <Search className="text-blue-400" />
            新入生スカウト
            <Sparkles className="text-yellow-400" />
          </h2>
          <div className="text-slate-300">
            令和{new Date().getFullYear() - 2018}年度 新入部員候補
          </div>
        </div>

        {/* 学校状況表示 */}
        <div className="bg-slate-700/30 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-slate-400 text-sm">学校評判</div>
              <div className="text-white font-bold text-lg">{schoolReputation}</div>
            </div>
            <div>
              <div className="text-slate-400 text-sm">所持資金</div>
              <div className="text-green-400 font-bold text-lg">💰 {schoolFunds.toLocaleString()}円</div>
            </div>
            <div>
              <div className="text-slate-400 text-sm">候補者数</div>
              <div className="text-blue-400 font-bold text-lg">{scoutingPool.length}人</div>
            </div>
          </div>
        </div>

        {/* 候補者リスト */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {scoutingPool.map((candidate) => {
            const isSelected = selectedCandidates.includes(candidate.id);
            const potentialInfo = getPotentialDisplay(candidate.potential);
            const personalityInfo = getPersonalityDisplay(candidate.personality);
            const canAfford = calculateTotalCost() + candidate.scoutingCost <= schoolFunds;

            return (
              <div
                key={candidate.id}
                className={`${potentialInfo.bgClass} rounded-lg p-4 border-2 cursor-pointer transition-all duration-200 ${
                  isSelected 
                    ? 'border-blue-500 ring-2 ring-blue-300 transform scale-105' 
                    : canAfford || isSelected
                      ? 'border-slate-300 hover:border-blue-400 hover:scale-102'
                      : 'border-slate-500 opacity-50 cursor-not-allowed'
                }`}
                onClick={() => (canAfford || isSelected) && handleCandidateToggle(candidate.id)}
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-teal-400 rounded-full mx-auto mb-3 flex items-center justify-center text-white font-bold text-xl">
                    {candidate.pokemon_name[0] || '?'}
                  </div>
                  
                  <h3 className="font-bold text-gray-800 mb-2">{candidate.pokemon_name}</h3>
                  
                  <div className="space-y-2 mb-3">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${potentialInfo.color}`}>
                      {potentialInfo.icon} {potentialInfo.text}
                    </span>
                    <br />
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${personalityInfo.color} bg-white`}>
                      {personalityInfo.icon} {personalityInfo.text}
                    </span>
                  </div>

                  {/* 基礎能力プレビュー */}
                  <div className="grid grid-cols-2 gap-1 text-xs mb-3">
                    <div className="bg-white bg-opacity-80 p-1 rounded">
                      <div className="text-gray-600">サーブ</div>
                      <div className="font-bold">{candidate.baseStats.serve_skill}</div>
                    </div>
                    <div className="bg-white bg-opacity-80 p-1 rounded">
                      <div className="text-gray-600">リターン</div>
                      <div className="font-bold">{candidate.baseStats.return_skill}</div>
                    </div>
                  </div>

                  {/* スカウト情報 */}
                  <div className="bg-white bg-opacity-90 p-2 rounded text-xs">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-gray-600">獲得確率</span>
                      <span className="font-bold text-green-600">{Math.round(candidate.acquisitionChance * 100)}%</span>
                    </div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-gray-600">費用</span>
                      <span className="font-bold text-blue-600">💰 {candidate.scoutingCost}円</span>
                    </div>
                    {candidate.competitorSchools.length > 0 && (
                      <div className="text-red-600 text-xs">
                        ライバル: {candidate.competitorSchools.length}校
                      </div>
                    )}
                  </div>

                  {isSelected && (
                    <div className="mt-2">
                      <CheckCircle className="w-6 h-6 text-blue-500 mx-auto" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* スカウト実行パネル */}
        <div className="bg-slate-700/50 rounded-lg p-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-white">
              <div className="text-sm text-slate-300 mb-1">
                選択中: {selectedCandidates.length}人
              </div>
              <div className="text-lg font-bold">
                総費用: 💰 {calculateTotalCost().toLocaleString()}円
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="bg-slate-600 hover:bg-slate-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                キャンセル
              </button>
              
              <button
                onClick={handleStartScouting}
                disabled={selectedCandidates.length === 0 || calculateTotalCost() > schoolFunds}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
              >
                スカウト開始！
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}