'use client';

import React, { useState, useEffect } from 'react';
import { Player } from '@/types/game';
import { 
  AdvancedMatchEngine, 
  AdvancedSetResult, 
  TacticType, 
  EnhancedMatchPoint,
  generateAdvancedCPU 
} from '@/lib/legacy-match-engines/advanced-match-engine';
import { MatchEngine, MatchResult, CPUPlayer } from '@/lib/legacy-match-engines/match-engine';
import { PlayerGenerator } from '@/lib/player-generator';
import { PokemonStatsCalculator } from '@/lib/pokemon-stats-calculator';
import { ENHANCED_TENNIS_SPECIAL_ABILITIES } from '@/lib/enhanced-special-abilities-database';
import { SpecialAbility } from '@/types/special-abilities';
import { InteractiveMatchViewer } from '@/components/match/InteractiveMatchViewer';

interface BattleSystemDebuggerProps {
  onClose: () => void;
}

export const BattleSystemDebugger: React.FC<BattleSystemDebuggerProps> = ({ onClose }) => {
  // プレイヤー設定
  const [player1, setPlayer1] = useState<Player | null>(null);
  const [player2, setPlayer2] = useState<Player | null>(null);
  const [battleMode, setBattleMode] = useState<'basic' | 'advanced' | 'interactive'>('advanced');
  
  // インタラクティブモード状態
  const [showInteractiveMatch, setShowInteractiveMatch] = useState(false);
  
  // 戦術設定
  const [player1Tactic, setPlayer1Tactic] = useState<TacticType>('balanced');
  const [player2Tactic, setPlayer2Tactic] = useState<TacticType>('balanced');
  
  // 環境設定
  const [weather, setWeather] = useState<'sunny' | 'cloudy' | 'rainy' | 'windy'>('sunny');
  const [courtSurface, setCourtSurface] = useState<'hard' | 'clay' | 'grass' | 'indoor'>('hard');
  
  // 結果
  const [battleResult, setBattleResult] = useState<AdvancedSetResult | MatchResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  
  // テスト用プレイヤー生成
  const generateTestPlayer = (playerNumber: 1 | 2, type: 'weak' | 'balanced' | 'strong' | 'legendary') => {
    const pokemonOptions = {
      weak: [
        { name: 'コラッタ', id: 19 },
        { name: 'ポッポ', id: 16 },
        { name: 'キャタピー', id: 10 }
      ],
      balanced: [
        { name: 'ピカチュウ', id: 25 },
        { name: 'イーブイ', id: 133 },
        { name: 'ヒトカゲ', id: 4 }
      ],
      strong: [
        { name: 'リザードン', id: 6 },
        { name: 'カメックス', id: 9 },
        { name: 'フシギバナ', id: 3 }
      ],
      legendary: [
        { name: 'ミュウツー', id: 150 },
        { name: 'ミュウ', id: 151 },
        { name: 'ルギア', id: 249 }
      ]
    };

    const pokemon = pokemonOptions[type][Math.floor(Math.random() * pokemonOptions[type].length)];
    
    // レベル設定
    const levelRanges = {
      weak: [1, 5],
      balanced: [10, 20],
      strong: [25, 35],
      legendary: [40, 50]
    };
    
    const [minLevel, maxLevel] = levelRanges[type];
    const level = Math.floor(Math.random() * (maxLevel - minLevel + 1)) + minLevel;
    
    // プレイヤー生成
    const player = PlayerGenerator.generateEnhancedCharacter(
      pokemon.name,
      pokemon.id,
      level,
      'captain'
    );
    
    // 特殊能力配列の初期化（安全性確保）
    if (!player.special_abilities) {
      player.special_abilities = [];
    }
    
    // タイプ別調整
    switch (type) {
      case 'weak':
        // 能力値を下げる
        player.serve_skill = Math.max(20, player.serve_skill - 30);
        player.return_skill = Math.max(20, player.return_skill - 30);
        player.volley_skill = Math.max(20, player.volley_skill - 30);
        player.stroke_skill = Math.max(20, player.stroke_skill - 30);
        player.mental = Math.max(20, player.mental - 30);
        player.stamina = Math.max(30, player.stamina - 20);
        break;
        
      case 'strong':
        // 能力値を上げる
        player.serve_skill = Math.min(100, player.serve_skill + 20);
        player.return_skill = Math.min(100, player.return_skill + 20);
        player.volley_skill = Math.min(100, player.volley_skill + 20);
        player.stroke_skill = Math.min(100, player.stroke_skill + 20);
        player.mental = Math.min(100, player.mental + 20);
        player.stamina = Math.min(120, player.stamina + 30);
        break;
        
      case 'legendary':
        // 最強クラスの能力値
        player.serve_skill = Math.min(120, player.serve_skill + 40);
        player.return_skill = Math.min(120, player.return_skill + 40);
        player.volley_skill = Math.min(120, player.volley_skill + 40);
        player.stroke_skill = Math.min(120, player.stroke_skill + 40);
        player.mental = Math.min(120, player.mental + 40);
        player.stamina = Math.min(150, player.stamina + 50);
        
        // 強力な特殊能力を追加 - データベースが利用可能であれば
        try {
          const legendaryAbilities = ENHANCED_TENNIS_SPECIAL_ABILITIES
            .filter(ability => ability.color === 'diamond' || ability.color === 'gold')
            .slice(0, 3)
            .map(ability => ({ 
              ...ability, 
              isActive: true,
              effects: ability.effects || {} // effectsが未定義の場合は空オブジェクトを設定
            }));
          
          // データがある場合のみ設定
          if (legendaryAbilities.length > 0) {
            player.special_abilities = legendaryAbilities;
          } else {
            player.special_abilities = [];
          }
        } catch (error) {
          console.warn('Failed to load legendary abilities:', error);
          player.special_abilities = [];
        }
        break;
    }
    
    // プレイヤーの個体値システムを再計算
    if (player.pokemon_stats) {
      player.pokemon_stats.final_stats = PokemonStatsCalculator.calculateFinalStats(player.pokemon_stats);
    }
    
    addLog(`${type}タイプのテストプレイヤー生成: ${player.pokemon_name} (Lv.${player.level})`);
    
    if (playerNumber === 1) {
      setPlayer1(player);
    } else {
      setPlayer2(player);
    }
  };

  // ランダムプレイヤー生成
  const generateRandomPlayer = (playerNumber: 1 | 2) => {
    const types = ['weak', 'balanced', 'strong', 'legendary'] as const;
    const randomType = types[Math.floor(Math.random() * types.length)];
    generateTestPlayer(playerNumber, randomType);
  };

  // CPU対戦相手生成
  const generateCPUOpponent = (difficulty: 'easy' | 'normal' | 'hard' | 'extreme') => {
    const cpu = generateAdvancedCPU(difficulty);
    addLog(`CPU対戦相手生成: ${cpu.pokemon_name} (${difficulty})`);
    setPlayer2(cpu);
  };

  // ログ追加
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  // 対戦実行
  const executeBattle = async () => {
    if (!player1 || !player2) {
      addLog('エラー: 両方のプレイヤーが必要です');
      return;
    }

    setIsSimulating(true);
    addLog('対戦開始...');
    
    try {
      let result;
      
      if (battleMode === 'interactive') {
        // インタラクティブモードは別コンポーネントで処理
        setShowInteractiveMatch(true);
        return;
        
      } else if (battleMode === 'advanced') {
        result = AdvancedMatchEngine.simulateAdvancedSet(
          player1,
          player2,
          player1Tactic,
          player2Tactic,
          {
            weather,
            court_surface: courtSurface,
            pressure_level: 30
          }
        );
        
        addLog(`高度対戦システム結果: ${result.home_score}-${result.away_score} (${result.winner === 'home' ? player1.pokemon_name : player2.pokemon_name}の勝利)`);
        addLog(`統計: ホーム ${result.home_statistics.total_points_won}P vs アウェー ${result.away_statistics.total_points_won}P`);
        
      } else {
        const cpuPlayer: CPUPlayer = {
          id: player2.id,
          pokemon_name: player2.pokemon_name,
          pokemon_id: player2.pokemon_id,
          level: player2.level,
          grade: player2.grade,
          position: player2.position,
          serve_skill: player2.serve_skill,
          return_skill: player2.return_skill,
          volley_skill: player2.volley_skill,
          stroke_skill: player2.stroke_skill,
          mental: player2.mental,
          stamina: player2.stamina,
          ai_personality: 'balanced'
        };
        
        result = MatchEngine.simulateMatch(player1, cpuPlayer);
        addLog(`基本対戦システム結果: ${result.home_sets_won}-${result.away_sets_won} (${result.winner_school === 'home' ? player1.pokemon_name : player2.pokemon_name}の勝利)`);
      }
      
      setBattleResult(result);
      
    } catch (error) {
      addLog(`対戦エラー: ${error}`);
      console.error('Battle simulation error:', error);
    } finally {
      setIsSimulating(false);
    }
  };

  // ログクリア
  const clearLogs = () => {
    setLogs([]);
  };

  // 戦術の説明
  const getTacticDescription = (tactic: TacticType): string => {
    const descriptions = {
      'aggressive': 'アグレッシブ: サーブ・ネット重視',
      'defensive': '守備的: リターン・ベースライン重視',
      'balanced': 'バランス: 全能力均等',
      'technical': 'テクニカル: 技巧・メンタル重視',
      'power': 'パワー: サーブ・ストローク重視',
      'counter': 'カウンター: 相手のミス誘発'
    };
    return descriptions[tactic] || tactic;
  };

  // プレイヤー情報表示
  const renderPlayerInfo = (player: Player, playerName: string) => (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h4 className="font-semibold text-lg mb-2">{playerName}</h4>
      <div className="space-y-1 text-sm">
        <div><strong>名前:</strong> {player.pokemon_stats?.is_shiny && '✨'}{player.pokemon_name}</div>
        <div><strong>レベル:</strong> {player.level}</div>
        <div><strong>ポジション:</strong> {player.position}</div>
        <div className="grid grid-cols-2 gap-2 mt-2">
          <div>サーブ: {player.pokemon_stats?.final_stats.serve_skill || player.serve_skill}</div>
          <div>リターン: {player.pokemon_stats?.final_stats.return_skill || player.return_skill}</div>
          <div>ボレー: {player.pokemon_stats?.final_stats.volley_skill || player.volley_skill}</div>
          <div>ストローク: {player.pokemon_stats?.final_stats.stroke_skill || player.stroke_skill}</div>
          <div>メンタル: {player.pokemon_stats?.final_stats.mental || player.mental}</div>
          <div>スタミナ: {player.pokemon_stats?.final_stats.stamina || player.stamina}</div>
        </div>
        {player.pokemon_stats?.ability && (
          <div><strong>特性:</strong> {player.pokemon_stats.ability}</div>
        )}
        {player.special_abilities && player.special_abilities.length > 0 && (
          <div>
            <strong>特殊能力:</strong>
            <div className="flex flex-wrap gap-1 mt-1">
              {player.special_abilities.slice(0, 3).map((ability, index) => (
                <span key={index} className={`
                  px-2 py-1 text-xs rounded
                  ${ability.color === 'diamond' ? 'bg-purple-100 text-purple-800' :
                    ability.color === 'gold' ? 'bg-yellow-100 text-yellow-800' :
                    ability.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                    ability.color === 'green' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'}
                `}>
                  {ability.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full m-4 max-h-[95vh] overflow-hidden">
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold">🧪 対戦システムデバッガー</h2>
              <p className="mt-2 opacity-90">対戦システムの動作確認・テスト機能</p>
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
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            
            {/* 左列: プレイヤー設定 */}
            <div className="space-y-6">
              <div className="bg-white border rounded-lg p-4">
                <h3 className="text-xl font-bold mb-4">🎮 プレイヤー設定</h3>
                
                {/* プレイヤー1 */}
                <div className="mb-6">
                  <h4 className="font-semibold mb-2">プレイヤー1 (ホーム)</h4>
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => generateTestPlayer(1, 'weak')} className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm">弱い</button>
                      <button onClick={() => generateTestPlayer(1, 'balanced')} className="px-3 py-1 bg-blue-200 hover:bg-blue-300 rounded text-sm">普通</button>
                      <button onClick={() => generateTestPlayer(1, 'strong')} className="px-3 py-1 bg-green-200 hover:bg-green-300 rounded text-sm">強い</button>
                      <button onClick={() => generateTestPlayer(1, 'legendary')} className="px-3 py-1 bg-yellow-200 hover:bg-yellow-300 rounded text-sm">伝説</button>
                    </div>
                    <button onClick={() => generateRandomPlayer(1)} className="w-full px-3 py-2 bg-purple-200 hover:bg-purple-300 rounded">ランダム生成</button>
                  </div>
                  {player1 && renderPlayerInfo(player1, "プレイヤー1")}
                </div>

                {/* プレイヤー2 */}
                <div>
                  <h4 className="font-semibold mb-2">プレイヤー2 (アウェー)</h4>
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => generateTestPlayer(2, 'weak')} className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm">弱い</button>
                      <button onClick={() => generateTestPlayer(2, 'balanced')} className="px-3 py-1 bg-blue-200 hover:bg-blue-300 rounded text-sm">普通</button>
                      <button onClick={() => generateTestPlayer(2, 'strong')} className="px-3 py-1 bg-green-200 hover:bg-green-300 rounded text-sm">強い</button>
                      <button onClick={() => generateTestPlayer(2, 'legendary')} className="px-3 py-1 bg-yellow-200 hover:bg-yellow-300 rounded text-sm">伝説</button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => generateCPUOpponent('easy')} className="px-3 py-1 bg-green-100 hover:bg-green-200 rounded text-sm">CPU易</button>
                      <button onClick={() => generateCPUOpponent('normal')} className="px-3 py-1 bg-yellow-100 hover:bg-yellow-200 rounded text-sm">CPU普</button>
                      <button onClick={() => generateCPUOpponent('hard')} className="px-3 py-1 bg-orange-100 hover:bg-orange-200 rounded text-sm">CPU強</button>
                      <button onClick={() => generateCPUOpponent('extreme')} className="px-3 py-1 bg-red-100 hover:bg-red-200 rounded text-sm">CPU極</button>
                    </div>
                    <button onClick={() => generateRandomPlayer(2)} className="w-full px-3 py-2 bg-purple-200 hover:bg-purple-300 rounded">ランダム生成</button>
                  </div>
                  {player2 && renderPlayerInfo(player2, "プレイヤー2")}
                </div>
              </div>
            </div>

            {/* 中央列: 対戦設定 */}
            <div className="space-y-6">
              <div className="bg-white border rounded-lg p-4">
                <h3 className="text-xl font-bold mb-4">⚙️ 対戦設定</h3>
                
                {/* 対戦モード */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-2">対戦モード</label>
                  <select 
                    value={battleMode} 
                    onChange={(e) => setBattleMode(e.target.value as any)}
                    className="w-full p-2 border rounded"
                  >
                    <option value="advanced">高度対戦システム (推奨)</option>
                    <option value="basic">基本対戦システム</option>
                    <option value="interactive">🎮 インタラクティブ対戦 (栄冠ナイン風)</option>
                  </select>
                  <p className="text-xs text-gray-600 mt-1">
                    {battleMode === 'interactive' 
                      ? '試合中にユーザーが指示を出せるモード' 
                      : battleMode === 'advanced' 
                        ? '詳細計算・個体値・特殊能力を考慮' 
                        : '高速シミュレーション・結果重視'
                    }
                  </p>
                </div>

                {/* 戦術設定 */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-2">プレイヤー1の戦術</label>
                  <select 
                    value={player1Tactic} 
                    onChange={(e) => setPlayer1Tactic(e.target.value as TacticType)}
                    className="w-full p-2 border rounded"
                  >
                    <option value="aggressive">アグレッシブ</option>
                    <option value="defensive">守備的</option>
                    <option value="balanced">バランス</option>
                    <option value="technical">テクニカル</option>
                    <option value="power">パワー</option>
                    <option value="counter">カウンター</option>
                  </select>
                  <p className="text-xs text-gray-600 mt-1">{getTacticDescription(player1Tactic)}</p>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-2">プレイヤー2の戦術</label>
                  <select 
                    value={player2Tactic} 
                    onChange={(e) => setPlayer2Tactic(e.target.value as TacticType)}
                    className="w-full p-2 border rounded"
                  >
                    <option value="aggressive">アグレッシブ</option>
                    <option value="defensive">守備的</option>
                    <option value="balanced">バランス</option>
                    <option value="technical">テクニカル</option>
                    <option value="power">パワー</option>
                    <option value="counter">カウンター</option>
                  </select>
                  <p className="text-xs text-gray-600 mt-1">{getTacticDescription(player2Tactic)}</p>
                </div>

                {/* 環境設定 */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-2">天候</label>
                  <select 
                    value={weather} 
                    onChange={(e) => setWeather(e.target.value as any)}
                    className="w-full p-2 border rounded"
                  >
                    <option value="sunny">晴天</option>
                    <option value="cloudy">曇り</option>
                    <option value="rainy">雨天</option>
                    <option value="windy">風強</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-2">コートサーフェス</label>
                  <select 
                    value={courtSurface} 
                    onChange={(e) => setCourtSurface(e.target.value as any)}
                    className="w-full p-2 border rounded"
                  >
                    <option value="hard">ハードコート</option>
                    <option value="clay">クレーコート</option>
                    <option value="grass">グラスコート</option>
                    <option value="indoor">インドアコート</option>
                  </select>
                </div>

                {/* 対戦実行 */}
                <button
                  onClick={executeBattle}
                  disabled={!player1 || !player2 || isSimulating}
                  className={`w-full py-3 rounded-lg font-bold text-lg ${
                    !player1 || !player2 || isSimulating
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {isSimulating ? '⏳ 対戦実行中...' : '⚔️ 対戦開始！'}
                </button>
              </div>
            </div>

            {/* 右列: ログ・結果 */}
            <div className="space-y-6">
              <div className="bg-white border rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold">📊 ログ・結果</h3>
                  <button onClick={clearLogs} className="px-3 py-1 bg-red-200 hover:bg-red-300 rounded text-sm">
                    クリア
                  </button>
                </div>
                
                {/* ログ表示 */}
                <div className="bg-gray-50 rounded p-3 h-64 overflow-y-auto mb-4">
                  {logs.length === 0 ? (
                    <p className="text-gray-500 text-sm">ログが表示されます...</p>
                  ) : (
                    logs.map((log, index) => (
                      <div key={index} className="text-xs mb-1 font-mono">
                        {log}
                      </div>
                    ))
                  )}
                </div>

                {/* 結果表示 */}
                {battleResult && (
                  <div className="bg-blue-50 rounded p-3">
                    <h4 className="font-semibold mb-2">🏆 対戦結果</h4>
                    {battleMode === 'advanced' ? (
                      <div className="space-y-2 text-sm">
                        <div>スコア: {(battleResult as AdvancedSetResult).home_score}-{(battleResult as AdvancedSetResult).away_score}</div>
                        <div>勝者: {(battleResult as AdvancedSetResult).winner === 'home' ? player1?.pokemon_name : player2?.pokemon_name}</div>
                        <div>ホーム獲得ポイント: {(battleResult as AdvancedSetResult).home_statistics.total_points_won}</div>
                        <div>アウェー獲得ポイント: {(battleResult as AdvancedSetResult).away_statistics.total_points_won}</div>
                        <div>クリティカルヒット: ホーム {(battleResult as AdvancedSetResult).home_statistics.critical_hits}回, アウェー {(battleResult as AdvancedSetResult).away_statistics.critical_hits}回</div>
                        <div>特性発動: ホーム {(battleResult as AdvancedSetResult).home_statistics.ability_activations}回, アウェー {(battleResult as AdvancedSetResult).away_statistics.ability_activations}回</div>
                      </div>
                    ) : (
                      <div className="space-y-2 text-sm">
                        <div>セット: {(battleResult as MatchResult).home_sets_won}-{(battleResult as MatchResult).away_sets_won}</div>
                        <div>勝者: {(battleResult as MatchResult).winner_school === 'home' ? player1?.pokemon_name : player2?.pokemon_name}</div>
                        <div>試合時間: {(battleResult as MatchResult).total_duration_minutes}分</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* インタラクティブマッチビューア */}
      {showInteractiveMatch && player1 && player2 && (
        <InteractiveMatchViewer
          homePlayer={player1}
          awayPlayer={player2}
          onClose={() => setShowInteractiveMatch(false)}
          onMatchComplete={(result) => {
            addLog(`インタラクティブ対戦完了: ${result.state?.score?.home?.sets || 0}-${result.state?.score?.away?.sets || 0}`);
            setShowInteractiveMatch(false);
          }}
        />
      )}
    </div>
  );
};