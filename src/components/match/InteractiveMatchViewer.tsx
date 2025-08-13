'use client';

import React, { useState, useCallback } from 'react';
import { Player } from '@/types/game';
import { 
  UnifiedMatchSystem,
  UnifiedMatchConfig,
  UnifiedMatchState,
  UnifiedMatchMode,
  UnifiedMatchFormat
} from '@/lib/unified-match-system';
import { MatchChoice } from '@/lib/interactive-match-engine';
import { TacticCard, TacticCardManager, getDefaultTacticCards } from '@/lib/tactic-cards-system';

interface InteractiveMatchViewerProps {
  homePlayer: Player;
  awayPlayer?: Player;
  onClose: () => void;
  onMatchComplete: (result: any) => void;
}

export const InteractiveMatchViewer: React.FC<InteractiveMatchViewerProps> = ({
  homePlayer,
  awayPlayer,
  onClose,
  onMatchComplete
}) => {
  // 統合対戦システム
  const [matchSystem, setMatchSystem] = useState<UnifiedMatchSystem | null>(null);
  const [matchState, setMatchState] = useState<UnifiedMatchState | null>(null);
  
  // UI状態
  const [selectedMode, setSelectedMode] = useState<UnifiedMatchMode>('interactive');
  const [selectedFormat, setSelectedFormat] = useState<UnifiedMatchFormat>('single_set');
  const [isConfiguring, setIsConfiguring] = useState(true);
  const [isMatching, setIsMatching] = useState(false);
  
  // インタラクティブモード専用状態
  const [pendingChoice, setPendingChoice] = useState<MatchChoice[]>([]);
  const [tacticCardManager] = useState(() => new TacticCardManager(getDefaultTacticCards(3)));
  const [availableTacticCards, setAvailableTacticCards] = useState<TacticCard[]>(getDefaultTacticCards(3));
  const [showTacticCards, setShowTacticCards] = useState(false);
  
  // 試合ログ
  const [matchLog, setMatchLog] = useState<string[]>([]);

  // 対戦相手生成（未指定の場合）
  const generateOpponent = useCallback(() => {
    if (awayPlayer) return awayPlayer;
    
    // 簡単なCPU対戦相手生成
    return {
      ...homePlayer,
      id: `cpu_${Date.now()}`,
      pokemon_name: 'CPU対戦相手',
      serve_skill: Math.max(30, homePlayer.serve_skill + Math.random() * 20 - 10),
      return_skill: Math.max(30, homePlayer.return_skill + Math.random() * 20 - 10),
      volley_skill: Math.max(30, homePlayer.volley_skill + Math.random() * 20 - 10),
      stroke_skill: Math.max(30, homePlayer.stroke_skill + Math.random() * 20 - 10),
      mental: Math.max(30, homePlayer.mental + Math.random() * 20 - 10)
    } as Player;
  }, [homePlayer, awayPlayer]);

  // 試合設定確定
  const confirmConfiguration = useCallback(async () => {
    const opponent = generateOpponent();
    
    const config: UnifiedMatchConfig = {
      mode: selectedMode,
      format: selectedFormat,
      homePlayer: homePlayer,
      awayPlayer: opponent,
      homeTactic: 'balanced',
      awayTactic: 'balanced',
      environment: {
        weather: 'sunny',
        court_surface: 'hard',
        pressure_level: 30,
        tournament_level: 'practice'
      },
      interactiveConfig: selectedMode === 'interactive' ? {
        enableDirectorInstructions: true,
        enableTacticCards: true,
        enableSpecialMoves: true,
        instructionFrequency: 'frequent',
        difficultyLevel: 'normal'
      } : undefined,
      
      // コールバック設定
      onMatchUpdate: (state: UnifiedMatchState) => {
        setMatchState(state);
        addLog(`試合更新: セット${state.currentSet}, ${state.score.home.games}-${state.score.away.games}`);
      },
      
      onUserChoiceRequired: (choices: MatchChoice[]) => {
        return new Promise<MatchChoice>((resolve) => {
          setPendingChoice(choices);
          addLog('監督の指示が求められています！');
          
          // Promise resolverを保存してexecuteChoiceで使用
          (window as any).resolveUserChoice = resolve;
        });
      },
      
      onMatchEvent: (event) => {
        addLog(`イベント: ${event.title} - ${event.description}`);
      }
    };
    
    const system = new UnifiedMatchSystem(config);
    setMatchSystem(system);
    
    // 初期状態を設定
    const initialState = system.getState();
    setMatchState(initialState);
    addLog(`試合設定完了 - モード: ${selectedMode}, 形式: ${selectedFormat}`);
    
    setIsConfiguring(false);
    
    // イベントリスナー設定
    system.addEventListener('match_start', () => {
      addLog('🎾 試合開始！');
      setIsMatching(true);
    });
    
    system.addEventListener('match_complete', (data: any) => {
      addLog('🏆 試合終了！');
      setIsMatching(false);
      onMatchComplete(data);
    });
    
    system.addEventListener('user_choice_required', (data: any) => {
      setPendingChoice(data.choices);
      addLog('💭 あなたの指示を選択してください');
    });

  }, [selectedMode, selectedFormat, homePlayer, generateOpponent, onMatchComplete]);

  // 試合開始
  const startMatch = useCallback(() => {
    if (matchSystem) {
      addLog('🏁 試合開始の準備をしています...');
      addLog(`⚔️ ${homePlayer.pokemon_name} vs ${generateOpponent().pokemon_name}`);
      addLog(`🎮 モード: ${selectedMode} | 形式: ${selectedFormat}`);
      
      if (selectedMode === 'interactive') {
        addLog('💭 重要な場面であなたの指示が求められます');
        addLog('🃏 戦術カードも活用しましょう');
      }
      
      matchSystem.startMatch();
    }
  }, [matchSystem, homePlayer, selectedMode, selectedFormat, generateOpponent]);

  // ユーザー選択実行
  const executeChoice = useCallback((choice: MatchChoice) => {
    if (matchSystem) {
      addLog(`📋 監督指示: ${choice.title} - ${choice.description}`);
      addLog(`💡 成功率: ${Math.round(choice.successRate * 100)}% | リスク: ${choice.riskLevel}`);
      
      // 現在のスコアを記録
      const currentScore = matchSystem.getState();
      const beforeScore = currentScore.interactiveState ? {
        home: currentScore.interactiveState.homeScore,
        away: currentScore.interactiveState.awayScore,
        homeGames: currentScore.interactiveState.homeGames,
        awayGames: currentScore.interactiveState.awayGames
      } : null;
      
      matchSystem.submitUserChoice(choice);
      setPendingChoice([]);
      
      // Promiseを解決
      if ((window as any).resolveUserChoice) {
        (window as any).resolveUserChoice(choice);
        (window as any).resolveUserChoice = null;
      }
      
      // 効果をシミュレート表示
      setTimeout(() => {
        const success = Math.random() < choice.successRate;
        if (success) {
          addLog(`✅ 指示成功! ${choice.title}が功を奏しました`);
        } else {
          addLog(`❌ 指示失敗... ${choice.title}は思うようにいきませんでした`);
        }
        
        // スコア変化を確認
        setTimeout(() => {
          const afterScore = matchSystem.getState();
          if (afterScore.interactiveState && beforeScore) {
            const scoreChange = {
              home: afterScore.interactiveState.homeScore - beforeScore.home,
              away: afterScore.interactiveState.awayScore - beforeScore.away,
              homeGames: afterScore.interactiveState.homeGames - beforeScore.homeGames,
              awayGames: afterScore.interactiveState.awayGames - beforeScore.awayGames
            };
            
            if (scoreChange.home > 0 || scoreChange.away > 0) {
              addLog(`📊 ポイント進行: ホーム${scoreChange.home > 0 ? '+' + scoreChange.home : 0}, アウェー${scoreChange.away > 0 ? '+' + scoreChange.away : 0}`);
            }
            if (scoreChange.homeGames > 0 || scoreChange.awayGames > 0) {
              addLog(`🎯 ゲーム進行: ホーム${scoreChange.homeGames > 0 ? '+' + scoreChange.homeGames : 0}, アウェー${scoreChange.awayGames > 0 ? '+' + scoreChange.awayGames : 0}`);
            }
          }
        }, 500);
      }, 1000);
    }
  }, [matchSystem]);

  // 戦術カード使用
  const useTacticCard = useCallback((card: TacticCard) => {
    const energyBefore = tacticCardManager.getEnergyInfo().current;
    const result = tacticCardManager.useCard(card.id);
    
    if (result.success) {
      const energyAfter = tacticCardManager.getEnergyInfo().current;
      const energyUsed = energyBefore - energyAfter;
      
      addLog(`🃏 【戦術カード展開】 ${card.name}`);
      addLog(`📊 長期戦略発動: ${card.effects.immediate.description}`);
      addLog(`⏰ 戦略持続: ${card.effects.duration || 1}ポイント間`);
      if (energyUsed > 0) {
        addLog(`⚡ エネルギー消費: ${energyUsed} (残り: ${energyAfter})`);
      }
      
      setShowTacticCards(false);
      
      // カードの視覚的効果
      setTimeout(() => {
        if (card.usageConditions.comboRequirement) {
          addLog(`🔗 連携戦術 ${card.name} が試合の流れを変えています！`);
        } else {
          addLog(`📈 戦略 ${card.name} が効果を発揮中...`);
        }
      }, 1000);
    } else {
      addLog(`❌ 戦術カード使用不可: ${result.error}`);
    }
  }, [tacticCardManager]);

  // ログ追加
  const addLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setMatchLog(prev => [...prev.slice(-19), `[${timestamp}] ${message}`]);
  }, []);

  // 選択肢の色分け
  const getChoiceColor = (choice: MatchChoice): string => {
    switch (choice.riskLevel) {
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'high': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full m-4 max-h-[95vh] overflow-hidden">
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold">🎾 統合対戦システム</h2>
              <p className="mt-2 opacity-90">
                {selectedMode === 'interactive' 
                  ? '栄冠ナイン風インタラクティブ対戦' 
                  : '高度テニスシミュレーション'
                }
              </p>
            </div>
            <button
              onClick={onClose}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors font-semibold"
            >
              ✕ 閉じる
            </button>
          </div>
        </div>

        <div className="p-6 max-h-[calc(95vh-120px)] overflow-y-auto">
          {isConfiguring ? (
            // 設定画面
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6">
                <h3 className="text-2xl font-bold text-center mb-6">対戦カード</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                  {/* ホームプレイヤー */}
                  <div className="text-center">
                    <div className="bg-blue-100 rounded-lg p-4">
                      <h4 className="text-xl font-bold text-blue-800">
                        {homePlayer.pokemon_stats?.is_shiny && '✨'} {homePlayer.pokemon_name}
                      </h4>
                      <div className="text-sm text-gray-600 mt-2">
                        Lv.{homePlayer.level} | {homePlayer.position}
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                        <div>サーブ: {homePlayer.serve_skill}</div>
                        <div>リターン: {homePlayer.return_skill}</div>
                        <div>ボレー: {homePlayer.volley_skill}</div>
                        <div>ストローク: {homePlayer.stroke_skill}</div>
                      </div>
                    </div>
                  </div>

                  {/* VS */}
                  <div className="text-center">
                    <div className="text-4xl font-bold text-gray-600">VS</div>
                  </div>

                  {/* 対戦相手 */}
                  <div className="text-center">
                    <div className="bg-red-100 rounded-lg p-4">
                      <h4 className="text-xl font-bold text-red-800">
                        {generateOpponent().pokemon_name}
                      </h4>
                      <div className="text-sm text-gray-600 mt-2">
                        CPU対戦相手
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 試合開始 */}
              <div className="text-center">
                <button
                  onClick={confirmConfiguration}
                  className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-xl transition-colors"
                >
                  🚀 試合設定確定
                </button>
              </div>
            </div>
          ) : (
            // 試合画面
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* 左列: スコアボード・試合状況 */}
              <div className="space-y-6">
                {/* スコアボード */}
                <div className="bg-white border rounded-lg p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">📊 スコアボード</h3>
                  {matchState ? (
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold">
                          {matchState.score?.home?.sets || 0} - {matchState.score?.away?.sets || 0}
                        </div>
                        <div className="text-sm text-gray-600">セット</div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="text-xl font-semibold text-blue-600">
                            {homePlayer.pokemon_name}
                          </div>
                          <div>ゲーム: {matchState.score?.home?.games || 0}</div>
                          <div>ポイント: {matchState.score?.home?.points || 0}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-semibold text-red-600">
                            {generateOpponent().pokemon_name}
                          </div>
                          <div>ゲーム: {matchState.score?.away?.games || 0}</div>
                          <div>ポイント: {matchState.score?.away?.points || 0}</div>
                        </div>
                      </div>
                      
                      {matchState.interactiveState && (
                        <div className="mt-4 p-3 bg-gray-50 rounded">
                          <div className="text-sm">
                            <div>現在の状況: {matchState.interactiveState.situation}</div>
                            <div>サーバー: {matchState.server === 'home' ? homePlayer.pokemon_name : generateOpponent().pokemon_name}</div>
                            <div>勢い: {matchState.interactiveState.momentum > 0 ? `+${matchState.interactiveState.momentum}` : matchState.interactiveState.momentum}</div>
                            <div>プレッシャー: {matchState.interactiveState.pressure}%</div>
                            {/* デバッグ情報追加 */}
                            <div className="mt-2 p-2 bg-yellow-50 rounded text-xs">
                              <div>🔍 デバッグ情報:</div>
                              <div>• 試合状態: {matchState.currentPhase}</div>
                              <div>• アクティブ: {matchState.isActive ? 'はい' : 'いいえ'}</div>
                              <div>• 選択待ち: {pendingChoice.length > 0 ? 'はい' : 'いいえ'}</div>
                              <div>• 最終更新: {new Date().toLocaleTimeString()}</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500">試合データを読み込み中...</div>
                  )}
                  
                  {/* 試合開始ボタン */}
                  {!isMatching && matchSystem && (
                    <div className="mt-6 text-center">
                      <button
                        onClick={startMatch}
                        className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
                      >
                        🎾 試合開始
                      </button>
                    </div>
                  )}
                </div>

                {/* 戦術カードパネル */}
                {selectedMode === 'interactive' && (
                  <div className="bg-white border rounded-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">🃏 戦術カード ({availableTacticCards.length}枚)</h3>
                        <div className="text-sm text-gray-600 mt-1">
                          ⚡ エネルギー: {tacticCardManager.getEnergyInfo().current}/{tacticCardManager.getEnergyInfo().max}
                          <div className="w-20 h-2 bg-gray-200 rounded mt-1">
                            <div 
                              className="h-full bg-blue-500 rounded" 
                              style={{ width: `${tacticCardManager.getEnergyInfo().percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowTacticCards(!showTacticCards)}
                        className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded font-semibold text-sm transition-colors"
                      >
                        {showTacticCards ? '閉じる' : 'カード選択'}
                      </button>
                    </div>
                    
                    {showTacticCards && (
                      <div className="space-y-3 max-h-60 overflow-y-auto">
                        {availableTacticCards.length === 0 ? (
                          <div className="text-center text-gray-500 py-4">
                            利用可能な戦術カードがありません
                          </div>
                        ) : (
                          availableTacticCards.slice(0, 5).map(card => (
                            <div key={card.id} className="border-2 rounded-lg p-3 hover:bg-gray-50 cursor-pointer transition-all hover:border-purple-300"
                                 onClick={() => useTacticCard(card)}>
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="font-semibold text-lg">{card.name}</div>
                                  <div className="text-sm text-gray-600 mt-1">{card.description}</div>
                                  
                                  {/* カード詳細情報 */}
                                  <div className="flex items-center gap-2 mt-2 text-xs">
                                    <span className={`px-2 py-1 rounded ${
                                      card.level >= 5 ? 'bg-yellow-100 text-yellow-800' :
                                      card.level >= 3 ? 'bg-blue-100 text-blue-800' :
                                      'bg-gray-100 text-gray-800'
                                    }`}>
                                      Lv.{card.level}
                                    </span>
                                    
                                    {card.usageConditions.energyCost && (
                                      <span className="px-2 py-1 rounded bg-blue-100 text-blue-800">
                                        ⚡{card.usageConditions.energyCost}
                                      </span>
                                    )}
                                    
                                    {card.effects.duration && (
                                      <span className="px-2 py-1 rounded bg-green-100 text-green-800">
                                        ⏱️{card.effects.duration}P
                                      </span>
                                    )}
                                    
                                    {card.usageConditions.comboRequirement && (
                                      <span className="px-2 py-1 rounded bg-purple-100 text-purple-800">
                                        🔗連携
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 中央列: ユーザー選択・指示 */}
              <div className="space-y-6">
                {pendingChoice.length > 0 && (
                  <div className="bg-white border-2 border-orange-300 rounded-lg p-6 bg-orange-50">
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-orange-800 mb-2">📢 緊急指示！</h3>
                      <p className="text-sm text-orange-700 italic">
                        重要な場面です。即座に指示を出してください。（効果: 次の1-2ポイント）
                      </p>
                      {/* デバッグ情報: 緊急指示の効果確認 */}
                      <div className="mt-2 p-2 bg-yellow-50 rounded text-xs">
                        <div>💡 緊急指示効果:</div>
                        <div>• 能力値ボーナス: 1.15x ~ 1.35x</div>
                        <div>• クリティカルボーナス: +8 ~ +18</div>
                        <div>• プレッシャー軽減: -4 ~ -9</div>
                        <div>• 持続時間: {pendingChoice[0]?.effect?.duration || 1}ポイント</div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {pendingChoice.map(choice => (
                        <button
                          key={choice.id}
                          onClick={() => executeChoice(choice)}
                          className={`w-full text-left p-4 border-2 rounded-lg transition-colors hover:shadow-md ${getChoiceColor(choice)}`}
                        >
                          <div className="font-semibold">{choice.title}</div>
                          <div className="text-sm mt-1">{choice.description}</div>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-xs">
                              成功率: {Math.round(choice.successRate * 100)}%
                            </span>
                            <span className={`text-xs px-2 py-1 rounded ${
                              choice.riskLevel === 'low' ? 'bg-green-200 text-green-800' :
                              choice.riskLevel === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                              'bg-red-200 text-red-800'
                            }`}>
                              {choice.riskLevel === 'low' ? '安全' : 
                               choice.riskLevel === 'medium' ? '普通' : '危険'}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 自動進行中表示 */}
                {isMatching && pendingChoice.length === 0 && (
                  <div className="bg-white border rounded-lg p-6 text-center">
                    <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <div className="text-lg font-semibold text-gray-800">試合進行中...</div>
                    <div className="text-sm text-gray-600 mt-2">
                      {selectedMode === 'interactive' ? '次の指示機会をお待ちください' : '自動計算中'}
                    </div>
                  </div>
                )}
              </div>

              {/* 右列: ログ・統計 */}
              <div className="space-y-6">
                <div className="bg-white border rounded-lg p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">📝 試合ログ</h3>
                  <div className="bg-gray-50 rounded p-3 h-64 overflow-y-auto">
                    {matchLog.length === 0 ? (
                      <p className="text-gray-500 text-sm">ログが表示されます...</p>
                    ) : (
                      matchLog.map((log, index) => (
                        <div key={index} className="text-xs mb-2 font-mono">
                          {log}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* 統計情報 */}
                {matchState && (
                  <div className="bg-white border rounded-lg p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">📈 試合統計</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span>総ポイント数:</span>
                        <span>{matchState.statistics.totalPoints.home} - {matchState.statistics.totalPoints.away}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>ウィナー:</span>
                        <span>{matchState.statistics.winners.home} - {matchState.statistics.winners.away}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>エラー:</span>
                        <span>{matchState.statistics.errors.home} - {matchState.statistics.errors.away}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};