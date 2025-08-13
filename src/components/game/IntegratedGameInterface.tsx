'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import { BattleSystemDebugger } from '../debug/BattleSystemDebugger';

interface IntegratedGameInterfaceProps {
  initialPlayer: Player;
  initialSchoolStats: {
    name: string;
    funds: number;
    reputation: number;
    facilities: number;
    current_year: number;
    current_month: number;
    current_day: number;
    totalMatches: number;
    totalWins: number;
    totalTournaments: number;
    founded: string;
  };
  allPlayers?: Player[];
  schoolId?: string;
  onGameStateUpdate?: (newState: {
    currentDate: GameDate;
    schoolStats: { 
      name: string;
      funds: number; 
      reputation: number; 
      facilities: number;
      totalMatches: number;
      totalWins: number;
      totalTournaments: number;
      founded: string;
    };
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
  const [gameFlow] = useState(() => {
    const flow = new IntegratedGameFlow(
      initialPlayer, 
      initialSchoolStats, 
      schoolId || 'default', 
      allPlayers || []
    );
    
    // グローバルにgameFlowを利用可能にする（DataRoomDashboard用）
    if (typeof window !== 'undefined') {
      (window as any).__GAME_FLOW__ = flow;
    }
    
    return flow;
  });
  const [gameState, setGameState] = useState<GameState>(gameFlow.getGameState());
  
  // UI状態管理
  const [activeTab, setActiveTab] = useState<'sugoroku' | 'calendar' | 'stats' | 'events' | 'cards'>('sugoroku');
  const [showStrategicChoice, setShowStrategicChoice] = useState(false);
  const [showCardResult, setShowCardResult] = useState(false);
  const [showSeasonalEvent, setShowSeasonalEvent] = useState(false);
  const [showBattleDebugger, setShowBattleDebugger] = useState(false);
  
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

  // 前回永続化した日付を追跡（無限ループ防止用）
  const lastPersistedDateRef = useRef<{ year: number; month: number; day: number } | null>(null);
  
  // 初期化状態管理（重複初期化防止用）
  const [calendarInitialized, setCalendarInitialized] = useState(false);

  // Supabase接続状態を確認するヘルパー関数
  const checkSupabaseConnection = async (): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('schools')
        .select('id')
        .limit(1);
      
      if (error) {
        console.error('Supabase接続エラー:', error);
        return false;
      }
      
      return true;
    } catch (e) {
      console.error('Supabase接続確認に失敗:', e);
      return false;
    }
  };

  // ゲーム状態の同期（改善版）
  const syncGameState = async (): Promise<boolean> => {
    const newGameState = gameFlow.getGameState();
    const currentDay = gameFlow.getCurrentDay();
    
    // React状態を先に更新
    setGameState(newGameState);
    
    // カレンダー状態の整合性チェック
    if (!currentDay || !currentDay.year || !currentDay.month || !currentDay.day) {
      console.error('❌ Invalid calendar state:', currentDay);
      return false;
    }
    
    // カレンダー状態も同期
    if (newGameState.calendarSystem) {
      const calendarState = newGameState.calendarSystem.getCurrentState();
      console.log('📅 カレンダー状態同期:', calendarState.currentDate);
      
      // 永続化を同期的に実行
      if (schoolId) {
        try {
          const persistenceSuccess = await persistCalendarStateSync(calendarState.currentDate);
          
          if (persistenceSuccess) {
            console.log('✅ ゲーム状態の同期が完了しました');
            return true;
          } else {
            console.warn('⚠️ 永続化がスキップされました（接続問題など）');
            return false;
          }
          
        } catch (error) {
          console.error('❌ Calendar persistence failed:', error);
          
          // エラー時の状態復旧を試行
          try {
            console.log('🔄 エラー後の状態復旧を試行します');
            
            // 現在のユーザーIDを取得
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
              console.error('❌ ユーザーが認証されていません');
              return false;
            }
            
            // データベースから現在の日付を再取得
            const { data: dbData, error: fetchError } = await supabase
              .from('schools')
              .select('current_year, current_month, current_day')
              .eq('user_id', user.id)
              .single();
            
            if (fetchError || !dbData) {
              console.error('❌ データベースからの日付取得に失敗:', fetchError);
              return false;
            }
            
            // データベースの日付とゲーム状態の日付を比較
            const dbDate = {
              year: dbData.current_year,
              month: dbData.current_month,
              day: dbData.current_day
            };
            
            const gameDate = {
              year: currentDay.year,
              month: currentDay.month,
              day: currentDay.day
            };
            
            console.log('📊 日付比較:', { database: dbDate, game: gameDate });
            
            // 不一致がある場合、データベースの日付でゲーム状態を復旧
            if (dbDate.year !== gameDate.year || 
                dbDate.month !== gameDate.month || 
                dbDate.day !== gameDate.day) {
              
              console.log('🔄 日付の不一致を検出。データベースの日付で復旧します');
              
              if (typeof gameFlow.initializeCalendarWithDate === 'function') {
                gameFlow.initializeCalendarWithDate(dbDate.year, dbDate.month, dbDate.day);
                console.log('✅ カレンダー状態を復旧しました');
                
                // 復旧後の状態を再同期
                const recoveredState = gameFlow.getGameState();
                setGameState(recoveredState);
                
                // 通知を追加
                setNotifications(prev => [...prev, '日付状態を復旧しました'].slice(-5));
                
                return true;
              }
            }
            
          } catch (recoveryError) {
            console.error('❌ 状態復旧にも失敗:', recoveryError);
            return false;
          }
          
          return false;
        }
      }
    }
    
    return true;
  };

  // 新しい同期的永続化関数（改善版）
  const persistCalendarStateSync = async (currentDate: CalendarDay): Promise<boolean> => {
    // 前回と異なる日付の場合のみ永続化
    if (!lastPersistedDateRef.current || 
        lastPersistedDateRef.current.year !== currentDate.year ||
        lastPersistedDateRef.current.month !== currentDate.month ||
        lastPersistedDateRef.current.day !== currentDate.day) {
      
      // 進行前の状態を保存（ロールバック用）
      const previousDate = lastPersistedDateRef.current ? { ...lastPersistedDateRef.current } : null;
      
      try {
        // まず接続状態を確認
        const isConnected = await checkSupabaseConnection();
        if (!isConnected) {
          console.warn('Supabase接続が利用できないため、カレンダー状態の永続化をスキップします');
          return false;
        }
        
        // 現在のユーザーIDを取得
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.error('❌ ユーザーが認証されていません');
          return false;
        }
        
        // データベース更新を実行（user_idを使用）
        const { error } = await supabase
          .from('schools')
          .update({
            current_year: currentDate.year,
            current_month: currentDate.month,
            current_day: currentDate.day
            // updated_atはトリガーで自動更新されるため削除
          })
          .eq('user_id', user.id);
        
        if (error) {
          throw error;
        }
        
        // 成功時：参照を更新
        lastPersistedDateRef.current = {
          year: currentDate.year,
          month: currentDate.month,
          day: currentDate.day
        };
        
        console.log('✅ カレンダー状態をデータベースに永続化しました:', currentDate);
        return true;
        
      } catch (e) {
        console.error('❌ カレンダー状態の永続化に失敗:', e);
        
        // エラー時の状態復旧
        if (previousDate) {
          console.log('🔄 前回の状態にロールバックを試行:', previousDate);
          
          try {
            // 現在のユーザーIDを取得
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
              // 前回の状態でデータベースを更新
              const { error: rollbackError } = await supabase
                .from('schools')
                .update({
                  current_year: previousDate.year,
                  current_month: previousDate.month,
                  current_day: previousDate.day
                  // updated_atはトリガーで自動更新されるため削除
                })
                .eq('user_id', user.id);
              
              if (rollbackError) {
                console.error('❌ ロールバックにも失敗:', rollbackError);
              } else {
                console.log('✅ ロールバックが完了しました');
                // ロールバック成功時は前回の状態を維持
                lastPersistedDateRef.current = previousDate;
              }
            }
          } catch (rollbackException) {
            console.error('❌ ロールバック処理で例外が発生:', rollbackException);
          }
        }
        
        // エラーを再スロー（呼び出し元で処理）
        throw e;
      }
    } else {
      console.log('ℹ️ カレンダー状態: 前回と同じ日付のため永続化をスキップ:', currentDate);
      return true; // スキップは成功として扱う
    }
  };

  // イベントログを追加する関数
  const addEventLog = (log: Omit<typeof eventLogs[0], 'id' | 'timestamp'>) => {
    const newLog = {
      ...log,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    };
    setEventLogs(prev => [newLog, ...prev.slice(0, 19)]); // 最新20件を保持
  };

  // 全部員データの更新監視
  useEffect(() => {
    if (allPlayers && allPlayers.length > 0) {
      gameFlow.updateAllPlayers(allPlayers);
      
      // カレンダー状態の復元はgameDataInitializedイベントで処理するため、
      // ここでは基本的なゲーム状態の同期のみ行う
      syncGameState();
      
      // ゲーム開始ログを追加
      addEventLog({
        type: 'event',
        message: 'ゲーム開始',
        details: '栄冠ナイン風テニス部シミュレーターを開始しました'
      });
    }
  }, [allPlayers, gameFlow]); // gameStateを依存関係から削除

  // gameDataInitializedイベントの監視（カレンダー状態の初期化用）
  useEffect(() => {
    const handleGameDataInitialized = (event: CustomEvent) => {
      const { currentDate, schoolId: eventSchoolId } = event.detail;
      
      // 初期化済みの場合はスキップ
      if (calendarInitialized) {
        console.log('Calendar already initialized, skipping...');
        return;
      }
      
      // このコンポーネントの学校IDと一致する場合のみ処理
      if (schoolId && eventSchoolId === schoolId) {
        console.log('gameDataInitializedイベントを受信:', currentDate);
        
        try {
          // 重複実行を確実に防ぐため、最初にフラグを設定
          setCalendarInitialized(true);
          
          // IntegratedGameFlowのカレンダーを正しい日付で初期化
          if (typeof gameFlow.initializeCalendarWithDate === 'function') {
            gameFlow.initializeCalendarWithDate(currentDate.year, currentDate.month, currentDate.day);
            console.log('gameDataInitialized: カレンダー状態を初期化しました:', currentDate);
            
            // 状態を同期
            syncGameState();
          }
        } catch (error) {
          console.error('gameDataInitialized: カレンダー状態初期化エラー:', error);
          // エラーが発生した場合はフラグをリセット
          setCalendarInitialized(false);
        }
      }
    };

    // イベントリスナーを追加
    window.addEventListener('gameDataInitialized', handleGameDataInitialized as EventListener);
    
    // クリーンアップ
    return () => {
      window.removeEventListener('gameDataInitialized', handleGameDataInitialized as EventListener);
    };
  }, [gameFlow, schoolId, calendarInitialized]);

  // 日付進行処理（改善版）
  const handleAdvanceDay = async () => {
    setIsAdvancingDay(true);
    
    try {
      // 進行前の状態を保存（ロールバック用）
      const stateBefore = gameFlow.getGameState();
      const dateBefore = gameFlow.getCurrentDay();
      
      console.log('📅 日付進行開始:', dateBefore);
      
      // 日付を進める
      const result = await gameFlow.advanceDay();
      
      // 状態同期を同期的に実行（永続化の完了を待つ）
      const syncSuccess = await syncGameState();
      
      if (!syncSuccess) {
        console.warn('⚠️ 状態同期に失敗しました。ロールバックを試行します');
        
        // ロールバック処理
        try {
          if (typeof gameFlow.initializeCalendarWithDate === 'function') {
            gameFlow.initializeCalendarWithDate(dateBefore.year, dateBefore.month, dateBefore.day);
            console.log('✅ 日付進行をロールバックしました');
            
            // 状態を復旧
            const recoveredState = gameFlow.getGameState();
            setGameState(recoveredState);
            
            setNotifications(prev => [...prev, '日付進行をロールバックしました'].slice(-5));
            return;
          }
        } catch (rollbackError) {
          console.error('❌ ロールバックにも失敗:', rollbackError);
          setNotifications(prev => [...prev, 'エラー: 状態復旧に失敗しました'].slice(-5));
          return;
        }
      }
      
      console.log('✅ 日付進行完了:', result.newDay);
      
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
      console.error('❌ Error advancing day:', error);
      setNotifications(prev => [...prev, 'エラーが発生しました'].slice(-5));
      
      // エラー時の状態復旧を試行
      try {
        console.log('🔄 エラー後の状態復旧を試行します');
        const recoverySuccess = await syncGameState();
        
        if (recoverySuccess) {
          console.log('✅ エラー後の状態復旧に成功しました');
          setNotifications(prev => [...prev, '状態を復旧しました'].slice(-5));
        } else {
          console.warn('⚠️ エラー後の状態復旧に失敗しました');
        }
      } catch (recoveryError) {
        console.error('❌ 状態復旧処理で例外が発生:', recoveryError);
      }
    }
    
    setIsAdvancingDay(false);
  };

  // カード使用処理（すごろく進行対応・改善版）
  const handleCardUse = async (cardId: string) => {
    console.log('=== カード使用開始 ===');
    console.log('使用前の状態:', {
      currentDate: gameFlow.getCurrentDay(),
      dayCount: gameFlow.getGameState().dayCount,
      availableCards: gameFlow.getGameState().availableCards.length
    });
    
    setIsAdvancingDay(true);
    try {
      const card = gameState.availableCards.find(c => c.id === cardId);
      if (!card) return;

      // 進行前の状態を保存（ロールバック用）
      const stateBefore = gameFlow.getGameState();
      const originalDayCount = stateBefore.dayCount;
      const originalDate = gameFlow.getCurrentDay();

      console.log('📅 カード使用前の日付:', originalDate);

      // IntegratedGameFlow の useTrainingCard を呼び出し（すごろく進行含む）
      const result = gameFlow.useTrainingCard(card);
      
      // カレンダー進行完了を確認してから状態同期
      // アニメーション完了を待つため、より長い遅延を設定
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 状態同期を同期的に実行（永続化の完了を待つ）
      const syncSuccess = await syncGameState();
      
      if (!syncSuccess) {
        console.warn('⚠️ カード使用後の状態同期に失敗しました。ロールバックを試行します');
        
        // ロールバック処理
        try {
          if (typeof gameFlow.initializeCalendarWithDate === 'function') {
            gameFlow.initializeCalendarWithDate(originalDate.year, originalDate.month, originalDate.day);
            console.log('✅ カード使用をロールバックしました');
            
            // 状態を復旧
            const recoveredState = gameFlow.getGameState();
            setGameState(recoveredState);
            
            setNotifications(prev => [...prev, 'カード使用をロールバックしました'].slice(-5));
            return;
          }
        } catch (rollbackError) {
          console.error('❌ ロールバックにも失敗:', rollbackError);
          setNotifications(prev => [...prev, 'エラー: 状態復旧に失敗しました'].slice(-5));
          return;
        }
      }
      
      // 同期後の状態を再取得
      const stateAfter = gameFlow.getGameState();
      const newDate = gameFlow.getCurrentDay();
      
      // 結果モーダルを表示
      setLastCardResult(result);
      setShowCardResult(true);
      
      console.log('📅 カード使用後の日付:', newDate);
      console.log('📊 進行日数:', result.daysProgressed);
      
      // 日付が実際に進んでいるかチェック
      if (result.daysProgressed > 0) {
        // 日付が進んでいる場合、通知を追加
        setNotifications(prev => [...prev, `日付が${result.daysProgressed}日進みました: ${originalDate.month}/${originalDate.day} → ${newDate.month}/${newDate.day}`].slice(-5));
        
        // 手動状態更新を削除 - gameFlowの状態のみを信頼する
        console.log('✅ カード使用完了: gameFlowの状態を信頼し、手動更新は行いません');
        
        // 状態整合性チェック（自動修正は行われません）
        if (!gameFlow.validateGameState()) {
          console.warn('⚠️ 状態整合性チェックに失敗しました');
          
          // カレンダー状態の復旧を試行
          console.log('🔄 カレンダー状態の復旧を試行します');
          const calendarSystem = gameFlow.getGameState().calendarSystem;
          if (calendarSystem.recoverCalendarState()) {
            console.log('✅ カレンダー状態の復旧に成功しました');
            setNotifications(prev => [...prev, 'カレンダー状態を復旧しました'].slice(-5));
            
            // 復旧後の再度検証
            if (gameFlow.validateGameState()) {
              console.log('✅ 復旧後の状態整合性チェックに成功しました');
              setNotifications(prev => [...prev, 'ゲーム状態の整合性が回復しました'].slice(-5));
            } else {
              console.warn('⚠️ 復旧後も状態整合性チェックに失敗しました');
              // より詳細な情報を提供
              const gameState = gameFlow.getGameState();
              console.warn('復旧後の詳細状態:', {
                dayCount: gameState.dayCount,
                currentDate: gameState.calendarSystem.getCurrentState().currentDate,
                calendarReady: gameState.calendarSystem.isCalendarReady()
              });
              setNotifications(prev => [...prev, '情報: 状態調整を完了しました'].slice(-5));
            }
          } else {
            console.warn('⚠️ カレンダー状態の復旧に失敗しました');
            setNotifications(prev => [...prev, '情報: ゲーム状態を自動調整しました'].slice(-5));
          }
        } else {
          // 状態整合性チェックが成功した場合
          console.log('✅ 状態整合性チェックに成功しました');
        }
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
          console.error('❌ Failed to persist card training player updates:', e);
        }
      })();
      
    } catch (error) {
      console.error('❌ Error using card:', error);
      setNotifications(prev => [...prev, 'カード使用中にエラーが発生しました'].slice(-5));
      
      // エラー時の状態復旧を試行
      try {
        console.log('🔄 エラー後の状態復旧を試行します');
        const recoverySuccess = await syncGameState();
        
        if (recoverySuccess) {
          console.log('✅ エラー後の状態復旧に成功しました');
          setNotifications(prev => [...prev, '状態を復旧しました'].slice(-5));
        } else {
          console.warn('⚠️ エラー後の状態復旧に失敗しました');
        }
      } catch (recoveryError) {
        console.error('❌ 状態復旧処理で例外が発生:', recoveryError);
      }
    }
    
    setIsAdvancingDay(false);
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

  // タブ切り替え時の状態保存
  const handleTabChange = async (newTab: 'sugoroku' | 'calendar' | 'stats' | 'events' | 'cards') => {
    // 現在のタブを離れる前に状態を永続化
    if (activeTab !== newTab) {
      console.log(`=== タブ切り替え開始 ===`);
      console.log(`現在のタブ: ${activeTab} → 新しいタブ: ${newTab}`);
      console.log(`現在の日付:`, gameFlow.getCurrentDay());
      console.log(`現在のゲーム状態:`, gameFlow.getGameState());
      
      try {
        // 現在のゲーム状態を永続化
        console.log('状態保存を開始...');
        
        // 現在の日付を確実に保存
        const currentDate = gameFlow.getCurrentDay();
        if (currentDate) {
          console.log('📅 現在の日付を確実に保存:', currentDate);
          await persistCalendarStateSync(currentDate);
        }
        
        // 完全なゲーム状態を永続化
        await persistGameState();
        console.log('✅ タブ切り替え時の状態保存完了');
        
        // 状態保存が完了してからタブを切り替え
        setActiveTab(newTab);
        console.log(`✅ タブ切り替え完了: ${newTab}`);
      } catch (error) {
        console.error('❌ タブ切り替え時の状態保存に失敗:', error);
        
        // エラーが発生してもタブは切り替える（ユーザビリティのため）
        setActiveTab(newTab);
        
        // エラー通知を追加
        setNotifications(prev => [...prev, '状態保存に失敗しました。データが失われる可能性があります。'].slice(-5));
      }
    }
  };

  // ゲーム状態の完全永続化
  const persistGameState = async (): Promise<void> => {
    console.log('🎯 persistGameState: 関数開始');
    console.log('🎯 persistGameState: schoolId =', schoolId);
    
    if (!schoolId) {
      console.log('❌ persistGameState: schoolIdが未設定のため終了');
      return;
    }
    
    try {
      console.log('=== ゲーム状態の完全永続化を開始 ===');
      const currentState = gameFlow.getGameState();
      const currentDate = gameFlow.getCurrentDay();
      
      console.log('現在のゲーム状態:', currentState);
      console.log('現在の日付:', currentDate);
      console.log('🎯 gameFlow.getCurrentDay()の結果:', currentDate);
      
      if (!currentDate) {
        console.warn('⚠️ 現在の日付が取得できません');
        console.log('❌ persistGameState: currentDateが未設定のため終了');
        return;
      }
      
      // 日付の整合性チェック
      const lastPersistedDate = lastPersistedDateRef.current;
      if (lastPersistedDate) {
        const isDateConsistent = (
          lastPersistedDate.year === currentDate.year &&
          lastPersistedDate.month === currentDate.month &&
          lastPersistedDate.day === currentDate.day
        );
        
        if (!isDateConsistent) {
          console.warn('⚠️ 永続化しようとしている日付が前回と異なります');
          console.log('前回永続化:', lastPersistedDate);
          console.log('現在の日付:', currentDate);
        }
      }
      
      // 1. カレンダー状態の永続化
      console.log('📅 カレンダー状態の永続化を開始...');
      await persistCalendarStateSync(currentDate);
      console.log('✅ カレンダー状態の永続化完了');
      
      // 2. ゲーム進行状況の永続化
      console.log('🎮 ゲーム進行状況の永続化を開始...');
      console.log('🎮 現在のゲーム状態:', currentState);
      console.log('🎮 現在の日付:', currentDate);
      console.log('🎮 schoolId:', schoolId);
      console.log('🎮 persistGameProgress関数の存在確認:', typeof persistGameProgress);
      console.log('🎮 persistGameProgressを呼び出し中...');
      
      try {
        console.log('🎮 persistGameProgress呼び出し直前');
        const result = await persistGameProgress(currentState);
        console.log('🎮 persistGameProgress呼び出し完了, 結果:', result);
        console.log('✅ ゲーム進行状況の永続化完了');
      } catch (progressError) {
        console.error('❌ ゲーム進行状況の永続化に失敗:', progressError);
        console.error('❌ エラーの詳細:', progressError);
        console.warn('⚠️ ゲーム進行状況の永続化は失敗しましたが、他の状態は保存されます');
        // エラーが発生しても処理を続行（他の状態は保存される）
      }
      
      // 3. 手札の永続化
      console.log('🃏 手札の永続化を開始...');
      await persistHandCards(currentState.availableCards);
      console.log('✅ 手札の永続化完了');
      
      console.log('🎉 ゲーム状態の完全永続化が完了しました');
    } catch (error) {
      console.error('❌ ゲーム状態の永続化に失敗:', error);
      console.error('❌ エラーの詳細:', error);
      throw error;
    }
  };

  // ゲーム進行状況の永続化
  const persistGameProgress = async (gameState: GameState): Promise<any> => {
    console.log('🎮 persistGameProgress: 関数開始');
    console.log('🎮 persistGameProgress: schoolId =', schoolId);
    console.log('🎮 persistGameProgress: gameState =', gameState);
    
    if (!schoolId) {
      console.log('❌ persistGameProgress: schoolIdが未設定のため終了');
      return;
    }
    
    try {
      console.log('=== ゲーム進行状況の永続化を開始 ===');
      console.log('🎮 persistGameProgress: schoolId =', schoolId);
      
      const currentDate = gameState.calendarSystem.getCurrentState().currentDate;
      console.log('保存しようとしている日付:', currentDate);
      
      // 日付の整合性チェック
      const lastPersistedDate = lastPersistedDateRef.current;
      if (lastPersistedDate) {
        const isDateConsistent = (
          lastPersistedDate.year === currentDate.year &&
          lastPersistedDate.month === currentDate.month &&
          lastPersistedDate.day === currentDate.day
        );
        
        if (!isDateConsistent) {
          console.warn('⚠️ ゲーム進行状況の永続化で日付の不一致を検出');
          console.log('前回永続化:', lastPersistedDate);
          console.log('現在の日付:', currentDate);
        }
      }
      
      const progressData = {
        school_id: schoolId,
        current_position: gameState.dayCount,
        total_progress: gameState.dayCount,
        hand_cards_count: gameState.availableCards.length,
        max_hand_size: 5,
        cards_used_today: gameState.stats.totalCardsUsed,
        total_moves: gameState.stats.totalChoicesMade,
        current_game_date_year: currentDate.year,
        current_game_date_month: currentDate.month,
        current_game_date_day: currentDate.day,
        last_game_date_year: currentDate.year,
        last_game_date_month: currentDate.month,
        last_game_date_day: currentDate.day,
        total_days_played: gameState.dayCount,
        consecutive_days_played: gameState.dayCount,
        last_play_date: new Date().toISOString()
      };
      
      console.log('保存するデータ:', progressData);
      console.log('🎮 既存レコードの確認を開始...');
      console.log('🎮 検索条件: school_id =', schoolId);
      
      // まず既存のレコードがあるかを確認
      const { data: existingRecord, error: selectError } = await supabase
        .from('game_progress')
        .select('id')
        .eq('school_id', schoolId)
        .single();
      
      console.log('🎮 既存レコード確認結果:', { existingRecord, selectError });
      console.log('🎮 検索クエリ完了');
      
      if (selectError && selectError.code !== 'PGRST116') {
        console.error('❌ 既存レコードの確認に失敗:', selectError);
        throw selectError;
      }
      
      let result;
      if (existingRecord) {
        // 既存レコードがある場合は更新
        console.log('🔄 既存レコードを更新中...');
        console.log('🔄 更新対象ID:', existingRecord.id);
        console.log('🔄 更新データ:', progressData);
        
        result = await supabase
          .from('game_progress')
          .update(progressData)
          .eq('id', existingRecord.id)
          .select();
        
        console.log('🔄 更新操作完了');
      } else {
        // 新規レコードの場合は挿入
        console.log('📝 新規レコードを挿入中...');
        console.log('📝 挿入データ:', progressData);
        
        result = await supabase
          .from('game_progress')
          .insert(progressData)
          .select();
        
        console.log('📝 挿入操作完了');
      }
      
      console.log('🎮 データベース操作結果:', result);
      console.log('🎮 結果の詳細:', {
        success: !result.error,
        data: result.data,
        error: result.error,
        count: result.data?.length || 0
      });
      
      if (result.error) throw result.error;
      console.log('✅ ゲーム進行状況を永続化しました');
      return result.data; // 成功した場合はデータを返す
    } catch (error) {
      console.error('❌ ゲーム進行状況の永続化に失敗:', error);
      console.error('❌ エラーの詳細:', error);
      
      // エラーの型をチェックして詳細情報を出力
      if (error && typeof error === 'object' && 'code' in error) {
        const supabaseError = error as { code?: string; message?: string; details?: string; hint?: string };
        console.error('❌ エラーのコード:', supabaseError.code);
        console.error('❌ エラーのメッセージ:', supabaseError.message);
        console.error('❌ エラーの詳細情報:', supabaseError.details);
        console.error('❌ エラーのヒント:', supabaseError.hint);
        
        // エラーの種類に応じた詳細情報を出力
        if (supabaseError.code === '42501') {
          console.error('🔒 RLSポリシーによりアクセスが拒否されました');
        } else if (supabaseError.code === '23505') {
          console.error('🔑 制約違反: 重複キー');
        } else if (supabaseError.code === '23502') {
          console.error('🔑 制約違反: NOT NULL制約');
        } else if (supabaseError.code === '23503') {
          console.error('🔑 制約違反: 外部キー制約');
        } else if (supabaseError.code === '42703') {
          console.error('🔑 カラムが存在しません');
        }
      }
      
      throw error;
    }
  };

  // 手札の永続化
  const persistHandCards = async (cards: TrainingCard[]): Promise<void> => {
    if (!schoolId) return;
    
    try {
      console.log('=== 手札の永続化を開始 ===');
      console.log('保存しようとしている手札:', cards.map(c => ({ id: c.id, name: c.name })));
      
      // 既存の手札を削除
      console.log('🗑️ 既存の手札を削除中...');
      const { error: deleteError } = await supabase
        .from('hand_cards')
        .delete()
        .eq('school_id', schoolId);
      
      if (deleteError) throw deleteError;
      console.log('✅ 既存の手札の削除完了');
      
      // 新しい手札を挿入
      if (cards.length > 0) {
        console.log('📝 新しい手札を挿入中...');
        const handCardsData = cards.map(card => ({
          id: `hand_card_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          school_id: schoolId,
          card_data: card,
          created_at: new Date().toISOString()
        }));
        
        console.log('挿入するデータ:', handCardsData.map(hc => ({ id: hc.id, cardName: hc.card_data.name })));
        
        const { error: insertError } = await supabase
          .from('hand_cards')
          .insert(handCardsData);
        
        if (insertError) throw insertError;
        console.log('✅ 新しい手札の挿入完了');
      } else {
        console.log('⚠️ 保存する手札がありません');
      }
      
      console.log('🎉 手札を永続化しました:', cards.length, '枚');
    } catch (error) {
      console.error('❌ 手札の永続化に失敗:', error);
      throw error;
    }
  };

  // タブ復帰時の状態復元
  const restoreGameState = useCallback(async (): Promise<void> => {
    if (!schoolId) return;
    
    try {
      console.log('=== タブ復帰時の状態復元を開始 ===');
      console.log('復元前の現在の日付:', gameFlow.getCurrentDay());
      
      // 現在のゲーム状態の日付を取得
      const currentGameDate = gameFlow.getCurrentDay();
      if (!currentGameDate) {
        console.warn('⚠️ 現在のゲーム状態の日付が取得できません');
        return;
      }
      
      // 1. ゲーム進行状況の復元
      console.log('🔍 game_progressテーブルからデータを取得中...');
      console.log('🔍 検索条件: school_id =', schoolId);
      
      const { data: gameProgress, error: progressError } = await supabase
        .from('game_progress')
        .select('*')
        .eq('school_id', schoolId)
        .single();
      
      console.log('🔍 game_progress取得結果:', { gameProgress, progressError });
      
      if (progressError) {
        if (progressError.code === 'PGRST116') {
          console.log('ℹ️ ゲーム進行状況のレコードが存在しません（新規ゲーム）');
        } else {
          console.error('❌ ゲーム進行状況の取得に失敗:', progressError);
        }
      } else if (gameProgress) {
        console.log('✅ ゲーム進行状況を取得:', gameProgress);
        console.log('🔍 取得したデータの詳細:');
        console.log('  - id:', gameProgress.id);
        console.log('  - school_id:', gameProgress.school_id);
        console.log('  - current_position:', gameProgress.current_position);
        console.log('  - total_progress:', gameProgress.total_progress);
        console.log('  - hand_cards_count:', gameProgress.hand_cards_count);
        console.log('  - current_game_date_year:', gameProgress.current_game_date_year);
        console.log('  - current_game_date_month:', gameProgress.current_game_date_month);
        console.log('  - current_game_date_day:', gameProgress.current_game_date_day);
        console.log('  - total_days_played:', gameProgress.total_days_played);
      }
      
      // 2. 手札の復元
      const { data: handCards, error: handCardsError } = await supabase
        .from('hand_cards')
        .select('*')
        .eq('school_id', schoolId);
      
      if (handCardsError) {
        console.error('❌ 手札の取得に失敗:', handCardsError);
      } else {
        console.log('✅ 手札を取得:', handCards?.length || 0, '枚');
      }
      
      // 3. 状態の復元（日付の整合性チェック付き）
      if (gameProgress) {
        // カレンダー状態の復元（日付の整合性チェック付き）
        if (gameProgress.current_game_date_year && 
            gameProgress.current_game_date_month && 
            gameProgress.current_game_date_day) {
          
          const dbDate = {
            year: gameProgress.current_game_date_year,
            month: gameProgress.current_game_date_month,
            day: gameProgress.current_game_date_day,
            dayOfWeek: new Date(gameProgress.current_game_date_year, 
                               gameProgress.current_game_date_month - 1, 
                               gameProgress.current_game_date_day).getDay()
          };
          
          console.log('🔍 データベースの日付:', dbDate);
          console.log('🔍 現在のゲーム状態の日付:', currentGameDate);
          
          // 日付の整合性チェック：ゲーム状態の方が新しい場合は復元をスキップ
          const isGameDateNewer = (
            currentGameDate.year > dbDate.year ||
            (currentGameDate.year === dbDate.year && currentGameDate.month > dbDate.month) ||
            (currentGameDate.year === dbDate.year && currentGameDate.month === dbDate.month && currentGameDate.day > dbDate.day)
          );
          
          if (isGameDateNewer) {
            console.log('⚠️ ゲーム状態の日付の方が新しいため、日付の復元をスキップします');
            console.log(`ゲーム状態: ${currentGameDate.year}/${currentGameDate.month}/${currentGameDate.day}`);
            console.log(`データベース: ${dbDate.year}/${dbDate.month}/${dbDate.day}`);
            
            // 日付の復元はスキップするが、他の状態は復元する
          } else if (currentGameDate.year !== dbDate.year || 
                     currentGameDate.month !== dbDate.month || 
                     currentGameDate.day !== dbDate.day) {
            
            console.log('🔄 日付の不一致を検出。データベースの日付で復元します');
            
            // カレンダーシステムを復元された日付で初期化
            if (typeof gameFlow.initializeCalendarWithDate === 'function') {
              console.log('📅 カレンダーシステムの初期化を開始...');
              gameFlow.initializeCalendarWithDate(
                dbDate.year, 
                dbDate.month, 
                dbDate.day
              );
              console.log('✅ カレンダー状態を復元しました:', dbDate);
              console.log('復元後の現在の日付:', gameFlow.getCurrentDay());
            } else {
              console.error('❌ initializeCalendarWithDateメソッドが見つかりません');
            }
          } else {
            console.log('✅ 日付は一致しているため、復元は不要です');
          }
          
          // ゲーム統計の復元
          if (gameProgress.total_days_played !== undefined) {
            console.log('📊 ゲーム統計を復元:', { total_days_played: gameProgress.total_days_played });
            gameFlow.getGameState().dayCount = gameProgress.total_days_played;
          }
        } else {
          console.warn('⚠️ 復元する日付データが不完全:', gameProgress);
        }
      } else {
        console.log('ℹ️ ゲーム進行状況のデータが存在しないため、復元をスキップします');
        console.log('現在のゲーム状態を維持します');
      }
      
      // 手札の復元
      if (handCards && handCards.length > 0) {
        const restoredCards = handCards.map(hc => hc.card_data as TrainingCard);
        gameFlow.getGameState().availableCards = restoredCards;
        console.log('✅ 手札を復元しました:', restoredCards.length, '枚');
        
        // React状態も更新してUIに反映
        setGameState(prevState => ({
          ...prevState,
          availableCards: restoredCards
        }));
      }
      
      // 状態を同期
      console.log('🔄 状態同期を開始...');
      syncGameState();
      console.log('✅ タブ復帰時の状態復元が完了しました');
      console.log('復元後の最終的な日付:', gameFlow.getCurrentDay());
      
    } catch (error) {
      console.error('❌ タブ復帰時の状態復元に失敗:', error);
    }
  }, [schoolId, gameFlow]);

  // タブ切り替え時の状態復元
  useEffect(() => {
    if (activeTab === 'sugoroku') {
      // すごろくタブに戻った時に状態を復元
      restoreGameState();
    }
  }, [activeTab, restoreGameState]);

  // コンポーネント初期化時の状態復元
  useEffect(() => {
    if (schoolId && !calendarInitialized) {
      // コンポーネントがマウントされた時に、データベースから状態を復元
      const initializeFromDatabase = async () => {
        try {
          console.log('コンポーネント初期化: データベースから状態を復元中...');
          
          // 現在のゲーム状態の日付を取得
          const currentGameDate = gameFlow.getCurrentDay();
          console.log('初期化前の現在の日付:', currentGameDate);
          
          // データベースから状態を復元
          await restoreGameState();
          
          // 復元後の日付を確認
          const restoredDate = gameFlow.getCurrentDay();
          console.log('復元後の日付:', restoredDate);
          
          // 日付の整合性を最終チェック
          if (currentGameDate && restoredDate) {
            const isDateConsistent = (
              currentGameDate.year === restoredDate.year &&
              currentGameDate.month === restoredDate.month &&
              currentGameDate.day === restoredDate.day
            );
            
            if (!isDateConsistent) {
              console.warn('⚠️ 初期化後の日付が一致しません');
              console.log('初期化前:', currentGameDate);
              console.log('復元後:', restoredDate);
              
              // ゲーム状態の日付の方が新しい場合は、データベースを更新
              const isGameDateNewer = (
                currentGameDate.year > restoredDate.year ||
                (currentGameDate.year === restoredDate.year && currentGameDate.month > restoredDate.month) ||
                (currentGameDate.year === restoredDate.year && currentGameDate.month === restoredDate.month && currentGameDate.day > restoredDate.day)
              );
              
              if (isGameDateNewer) {
                console.log('🔄 ゲーム状態の日付の方が新しいため、データベースを更新します');
                await persistCalendarStateSync(currentGameDate);
              }
            }
          }
          
          // 初期化完了フラグを設定
          setCalendarInitialized(true);
          console.log('コンポーネント初期化: 状態復元完了');
        } catch (error) {
          console.error('コンポーネント初期化: 状態復元に失敗:', error);
        }
      };
      
      initializeFromDatabase();
    }
  }, [schoolId, calendarInitialized, restoreGameState]);

  // 定期的な状態保存（5分ごと）
  useEffect(() => {
    if (!schoolId) return;
    
    const interval = setInterval(async () => {
      try {
        console.log('定期状態保存: ゲーム状態を永続化中...');
        await persistGameState();
        console.log('定期状態保存: 完了');
      } catch (error) {
        console.error('定期状態保存: 失敗:', error);
      }
    }, 5 * 60 * 1000); // 5分
    
    return () => clearInterval(interval);
  }, [schoolId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* 固定ヘッダー情報 */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b shadow-lg">
        <div className="max-w-7xl mx-auto p-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                PokeTeniMaster みどり学園
              </h1>
              <p className="text-gray-600">
                {gameState.player.pokemon_name} | Day {gameFlow.getCurrentDay()?.day || gameState.dayCount}
              </p>
            </div>
            
            <div className="flex items-center gap-6">
              {/* デバッグボタン (開発時のみ表示) */}
              {process.env.NODE_ENV === 'development' && (
                <button
                  onClick={() => setShowBattleDebugger(true)}
                  className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-semibold transition-colors"
                >
                  🧪 デバッグ
                </button>
              )}
              
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
            </div>
          </div>
        </div>
      </div>

      {/* ヘッダーの高さ分のマージン */}
      <div className="h-24"></div>

      {/* 固定通知バー */}
      {notifications.length > 0 && (
        <div className="fixed top-24 left-0 right-0 z-40 bg-yellow-50 border-b border-yellow-200">
          <div className="max-w-7xl mx-auto p-2">
            <div className="flex items-center gap-4 overflow-x-auto">
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
        </div>
      )}

      {/* 通知バーの高さ分のマージン（通知がある場合のみ） */}
      {notifications.length > 0 && <div className="h-16"></div>}

      {/* メインコンテンツ */}
      <div className="max-w-7xl mx-auto p-4">
        {/* タブナビゲーション */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          <Button
            onClick={() => handleTabChange('sugoroku')}
            variant={activeTab === 'sugoroku' ? 'default' : 'outline'}
            className="flex items-center gap-2 min-w-[200px] whitespace-nowrap"
          >
            🎲 練習すごろく ({gameState.availableCards.length}枚)
          </Button>
          <Button
            onClick={() => handleTabChange('calendar')}
            variant={activeTab === 'calendar' ? 'default' : 'outline'}
            className="flex items-center gap-2 min-w-[150px] whitespace-nowrap"
          >
            📅 カレンダー
          </Button>
          <Button
            onClick={() => handleTabChange('stats')}
            variant={activeTab === 'stats' ? 'default' : 'outline'}
            className="flex items-center gap-2 min-w-[120px] whitespace-nowrap"
          >
            📊 統計
          </Button>
          <Button
            onClick={() => handleTabChange('events')}
            variant={activeTab === 'events' ? 'default' : 'outline'}
            className="flex items-center gap-2 min-w-[150px] whitespace-nowrap"
          >
            📋 イベント履歴
          </Button>
          <Button
            onClick={() => handleTabChange('cards')}
            variant={activeTab === 'cards' ? 'default' : 'outline'}
            className="flex items-center gap-2 min-w-[150px] whitespace-nowrap"
          >
            🃏 カード選択
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
                currentPosition={gameState.calendarSystem.getCurrentState().currentDate.day}
                availableCards={gameState.availableCards}
                onCardUse={handleCardUse}
                isLoading={isAdvancingDay}
                allPlayers={gameState.allPlayers}
                schoolId={schoolId || 'default'}
                currentDate={gameFlow.getGameState().calendarSystem.getCurrentState().currentDate}
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
                          <span>{gameState.dayCount}日</span>
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
              <EventHistoryDisplay schoolId={schoolId || 'default'} />
            </div>
          )}

          {activeTab === 'cards' && (
            <CardSelectionInterface
              player={gameState.player}
              schoolFunds={gameState.schoolStats.funds}
              schoolReputation={gameState.schoolStats.reputation}
              schoolId={schoolId || 'default'}
              currentDate={gameFlow.getGameState().calendarSystem.getCurrentState().currentDate}
              onCardUse={(result) => {
                // カード使用結果の処理
                setLastCardResult(result);
                setShowCardResult(true);
                console.log('Card used:', result);
              }}
              onStatsUpdate={(updatedPlayer) => {
                // プレイヤーステータスの更新処理
                console.log('Player stats updated:', updatedPlayer);
              }}
            />
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

      {/* デバッグモード: 対戦システムテスター */}
      {showBattleDebugger && (
        <BattleSystemDebugger onClose={() => setShowBattleDebugger(false)} />
      )}
    </div>
  );
};

export default IntegratedGameInterface;