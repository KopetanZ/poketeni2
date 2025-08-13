'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabase';
import { DateManager } from '@/lib/date-manager';
import { CardGenerator } from '@/lib/card-generator';
import { PlayerGenerator } from '@/lib/player-generator';
import { GameDate, School, Player } from '@/types/game';
import { TrainingCard } from '@/types/training-cards';

interface GameData {
  school: School | null;
  cards: TrainingCard[];
  players: Player[];
  currentDate: GameDate;
}

export function useGameData() {
  const { user: localUser } = useAuth();
  const [supabaseUser, setSupabaseUser] = useState<any>(null);
  const [gameData, setGameData] = useState<GameData>({
    school: null,
    cards: [],
    players: [],
    currentDate: { year: 2024, month: 4, day: 1 }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 初期化完了フラグ（イベント重複発火防止用）
  const [gameDataInitialized, setGameDataInitialized] = useState(false);
  const [initializationInProgress, setInitializationInProgress] = useState(false);

  // Supabaseの認証状態を確認
  useEffect(() => {
    const checkSupabaseAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setSupabaseUser(user);
        console.log('useGameData: Supabase user:', user?.id);
      } catch (error) {
        console.error('useGameData: Failed to get Supabase user:', error);
        setSupabaseUser(null);
      }
    };

    checkSupabaseAuth();

    // 認証状態の変更を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('useGameData: Auth state changed:', event, session?.user?.id);
        setSupabaseUser(session?.user || null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // ゲームデータの初期化・読み込み
  useEffect(() => {
    if (!localUser || !supabaseUser) {
      setLoading(false);
      return;
    }

    // 初期化中または既に初期化済みの場合はスキップ
    if (initializationInProgress || gameDataInitialized) {
      console.log('useGameData: 初期化をスキップ', { 
        initializationInProgress, 
        gameDataInitialized 
      });
      setLoading(false);
      return;
    }

    console.log('useGameData: Both local and Supabase users authenticated, starting initialization...');
    initializeGameData();
  }, [localUser, supabaseUser]); // initializationInProgressを依存配列から削除

  // ゲームデータの初期化（カスタムスターター対応）
  const initializeGameData = async (customStarterData?: {
    schoolName: string;
    selectedStarter: string;
    managerName?: string;
  }) => {
    if (!supabaseUser) {
      console.log('useGameData: Supabase user not available');
      return;
    }
    
    if (initializationInProgress) {
      console.log('useGameData: 初期化処理が既に進行中です');
      return;
    }
    
    if (gameDataInitialized) {
      console.log('useGameData: 既に初期化済みです');
      return;
    }
    
    console.log('useGameData: 初期化処理を開始します');
    setInitializationInProgress(true);
    setLoading(true);
    setError(null);

    try {
      console.log('Starting game data initialization for user:', supabaseUser?.id);
      console.log('Custom starter data:', customStarterData);
      
      // Important: Avoid creating default data before the user selects a starter on first run
      // If there is no existing school AND no selectedStarter provided, skip initialization here.
      // This prevents default fallback team (フシギダネ) from being created prematurely.
      try {
        console.log('useGameData: Checking for existing school...');
        const { data: existingSchoolCheck, error: existingSchoolErr } = await supabase
          .from('schools')
          .select('id')
          .eq('user_id', supabaseUser.id)
          .maybeSingle();

        if (existingSchoolErr && existingSchoolErr.code !== 'PGRST116') {
          // Non-not-found error; surface it as usual
          console.error('useGameData: Error checking existing school:', existingSchoolErr);
          throw existingSchoolErr;
        }

        const hasExistingSchool = !!existingSchoolCheck;
        const hasSelectedStarter = !!customStarterData?.selectedStarter;

        console.log('useGameData: School check result:', { hasExistingSchool, hasSelectedStarter, customStarterData });

        if (!hasExistingSchool && !hasSelectedStarter) {
          console.log('useGameData: First-time user without selected starter yet; deferring initialization until onboarding completes.');
          setLoading(false);
          setInitializationInProgress(false);
          return;
        }

        // カスタムスターターデータが提供されている場合は、強制的に初期化を続行
        if (customStarterData?.selectedStarter) {
          console.log('useGameData: Custom starter data provided, proceeding with initialization...');
        }
      } catch (precheckError) {
        console.warn('useGameData: Pre-initialization check warning:', precheckError);
        // Continue with initialization; downstream handlers will catch fatal errors
      }
      
      // 1. 学校データの取得または作成
      console.log('useGameData: Step 1: Creating/getting school...');
      let school = await getOrCreateSchool(customStarterData?.schoolName);
      console.log('useGameData: School created/retrieved:', school);
      
      if (!school) {
        throw new Error('Failed to create or retrieve school');
      }
      
      // 2. 手札の取得または作成（学校データを渡す）
      console.log('useGameData: Step 2: Creating/getting hand cards...');
      let cards = await getOrCreateHandCards(school);
      console.log('useGameData: Cards created/retrieved:', cards?.length, 'cards');
      
      if (!cards || cards.length === 0) {
        console.warn('useGameData: No cards created/retrieved, this might be expected for new games');
      }

      // 3. ポケモン選手の取得または作成（カスタムスターター対応）
      console.log('useGameData: Step 3: Creating/getting players...');
      let players = await getOrCreatePlayers(school, customStarterData?.selectedStarter);
      console.log('useGameData: Players created/retrieved:', players?.length, 'players');
      
      if (!players || players.length === 0) {
        throw new Error('Failed to create or retrieve players');
      }

      // 4. 現在の日付を学校データから取得
      const currentDate: GameDate = {
        year: Math.max(school.current_year, 2024), // 年が2024未満の場合は2024に修正
        month: school.current_month,
        day: school.current_day
      };

      // データベースの年も修正（年が2024未満の場合）
      if (school.current_year < 2024) {
        console.log('useGameData: データベースの年を修正中:', school.current_year, '→ 2024');
        const { error: updateError } = await supabase
          .from('schools')
          .update({ current_year: 2024 })
          .eq('id', school.id);
        
        if (updateError) {
          console.warn('useGameData: データベースの年修正に失敗:', updateError);
        } else {
          console.log('useGameData: データベースの年を2024に修正しました');
          // ロールのschoolオブジェクトも更新
          school.current_year = 2024;
        }
      }

      console.log('useGameData: データベースから取得した日付:', { year: school.current_year, month: school.current_month, day: school.current_day });
      console.log('useGameData: 修正後の日付:', currentDate);
      console.log('useGameData: Step 4: Setting game data...');
      setGameData({
        school,
        cards,
        players,
        currentDate
      });
      
      // カレンダーシステムの状態を正しく初期化するためのコールバックを提供
      // これにより、IntegratedGameInterfaceでカレンダーの状態を復元できる
      if (typeof window !== 'undefined' && !gameDataInitialized) {
        // 少し遅延を入れて、Reactの状態更新が完了してからイベントを発火
        setTimeout(() => {
          // 重複チェックを再度実行
          if (!gameDataInitialized) {
            // グローバルイベントとして発火（IntegratedGameInterfaceで受信）
            window.dispatchEvent(new CustomEvent('gameDataInitialized', {
              detail: {
                currentDate,
                schoolId: school.id,
                isFirstTime: true
              }
            }));
            setGameDataInitialized(true);
            console.log('useGameData: gameDataInitializedイベントを発火しました:', currentDate);
          } else {
            console.log('useGameData: イベント発火をスキップ（既に初期化済み）');
          }
        }, 100);
      }
      
      console.log('useGameData: Game data initialization completed successfully');
    } catch (err) {
      console.error('useGameData: Game data initialization error:', err);
      console.error('useGameData: Error details:', {
        message: (err as Error)?.message,
        stack: (err as Error)?.stack
      });
      setError('ゲームデータの初期化に失敗しました: ' + (err as Error)?.message);
      // エラー時はフラグをリセット
      setGameDataInitialized(false);
    } finally {
      setLoading(false);
      console.log('useGameData: Set loading to false');
      setInitializationInProgress(false);
      console.log('useGameData: Set initializationInProgress to false');
    }
  };

  // 学校データの取得または作成（カスタム学校名対応）
  const getOrCreateSchool = async (customSchoolName?: string): Promise<School> => {
    if (!supabaseUser) throw new Error('User not authenticated');

    console.log('getOrCreateSchool: Starting with user ID:', supabaseUser.id);

    try {
      // 既存の学校データを確認
      console.log('getOrCreateSchool: Checking for existing school...');
      const { data: existingSchool, error: fetchError } = await supabase
        .from('schools')
        .select('*')
        .eq('user_id', supabaseUser.id)
        .maybeSingle();

      console.log('getOrCreateSchool: Fetch result:', { existingSchool, fetchError });

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('getOrCreateSchool: Fetch error:', fetchError);
        throw new Error(`Failed to fetch school: ${fetchError.message}`);
      }

      if (existingSchool) {
        console.log('getOrCreateSchool: Found existing school:', existingSchool);
        return existingSchool as School;
      }

      // 新しい学校を作成（カスタム名対応）
      const schoolName = customSchoolName || 'ポケテニ高校';
      console.log('getOrCreateSchool: Creating new school with name:', schoolName);
      
      // IDを明示的に生成（text型のため）
      const schoolId = `school_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const { data: newSchool, error: createError } = await supabase
        .from('schools')
        .insert({
          id: schoolId,
          user_id: supabaseUser.id,
          name: schoolName,
          reputation: 0,
          funds: 1000,
          current_year: 2024, // 確実に2024年を設定
          current_month: 4,
          current_day: 1
        })
        .select()
        .single();

      console.log('getOrCreateSchool: Create result:', { newSchool, createError });

      if (createError) {
        console.error('getOrCreateSchool: Create error:', createError);
        console.error('getOrCreateSchool: Full error details:', JSON.stringify(createError, null, 2));
        console.error('getOrCreateSchool: Error code:', createError.code);
        console.error('getOrCreateSchool: Error message:', createError.message);
        console.error('getOrCreateSchool: Error details:', createError.details);
        throw new Error(`Failed to create school: ${createError.message || 'Unknown error'}`);
      }

      console.log('getOrCreateSchool: Successfully created school:', newSchool);
      return newSchool as School;
    } catch (error) {
      console.error('getOrCreateSchool: Unexpected error:', error);
      throw error;
    }
  };

  // 手札の取得または作成
  const getOrCreateHandCards = async (school: School): Promise<TrainingCard[]> => {
    if (!supabaseUser) throw new Error('User not authenticated');
    if (!school) throw new Error('School not found');

    console.log('getOrCreateHandCards: Starting with school ID:', school.id);

    try {
      // 既存の手札を確認
      console.log('getOrCreateHandCards: Checking for existing cards...');
      const { data: existingCards, error: fetchError } = await supabase
        .from('hand_cards')
        .select('card_data')
        .eq('school_id', school.id);

      console.log('getOrCreateHandCards: Fetch result:', { existingCards, fetchError });

      if (fetchError) {
        console.error('getOrCreateHandCards: Fetch error:', fetchError);
        throw new Error(`Failed to fetch cards: ${fetchError.message}`);
      }

      if (existingCards && existingCards.length > 0) {
        console.log('getOrCreateHandCards: Found existing cards:', existingCards.length);
        return existingCards.map(row => row.card_data as TrainingCard);
      }

      // 新しい手札を生成・保存
      console.log('getOrCreateHandCards: Generating new cards...');
      const newCards = CardGenerator.generateHand(5);
      console.log('getOrCreateHandCards: Generated cards:', newCards?.length);
      
      const cardInserts = newCards.map((card, index) => ({
        id: `card_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`,
        school_id: school.id,
        card_data: card
      }));

      console.log('getOrCreateHandCards: Inserting cards into database...');
      const { error: insertError } = await supabase
        .from('hand_cards')
        .insert(cardInserts);

      console.log('getOrCreateHandCards: Insert result:', { insertError });

      if (insertError) {
        console.error('getOrCreateHandCards: Insert error:', insertError);
        throw new Error(`Failed to insert cards: ${insertError.message}`);
      }

      console.log('getOrCreateHandCards: Successfully created cards');
      return newCards;
    } catch (error) {
      console.error('getOrCreateHandCards: Unexpected error:', error);
      throw error;
    }
  };

  // ポケモン選手の取得または作成（カスタムスターター対応）
  const getOrCreatePlayers = async (school: School, selectedStarter?: string): Promise<Player[]> => {
    if (!supabaseUser) throw new Error('User not authenticated');
    if (!school) throw new Error('School not found');

    console.log('getOrCreatePlayers: Starting with school ID:', school.id);
    console.log('getOrCreatePlayers: Selected starter:', selectedStarter);

    try {
      // 既存の選手を確認
      console.log('getOrCreatePlayers: Checking for existing players...');
      const { data: existingPlayers, error: fetchError } = await supabase
        .from('players')
        .select('*')
        .eq('school_id', school.id);

      console.log('getOrCreatePlayers: Fetch result:', { existingPlayers, fetchError });

      if (fetchError) {
        console.error('getOrCreatePlayers: Fetch error:', fetchError);
        throw new Error(`Failed to fetch players: ${fetchError.message}`);
      }

      if (existingPlayers && existingPlayers.length > 0) {
        console.log('getOrCreatePlayers: Found existing players:', existingPlayers.length);
        
        // 既存プレイヤーデータに特殊能力フィールドが不足している場合の対処
        const playersWithSpecialAbilities = existingPlayers.map(player => ({
          ...player,
          // 特殊能力が存在しない場合は空配列に設定
          special_abilities: player.special_abilities || [],
          // タイプ情報が存在しない場合はnormalタイプに設定
          types: player.types || ['normal'],
          // 個体値情報が存在しない場合はnullのまま
          pokemon_stats: player.pokemon_stats || null
        }));
        
        return playersWithSpecialAbilities as Player[];
      }

      // 新しいチームを生成・保存（カスタムスターター対応）
      console.log('getOrCreatePlayers: Generating custom starter team...');
      const starterTeam = selectedStarter 
        ? await PlayerGenerator.generateCustomStarterTeam(selectedStarter)
        : await PlayerGenerator.generateStarterTeam();
      console.log('getOrCreatePlayers: Generated team:', starterTeam?.length);
      
      const playerInserts = starterTeam.map((player, index) => ({
        id: `player_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`,
        school_id: school.id,
        pokemon_name: player.pokemon_name,
        pokemon_id: player.pokemon_id,
        level: player.level,
        grade: player.grade,
        position: player.position,
        serve_skill: player.serve_skill,
        return_skill: player.return_skill,
        volley_skill: player.volley_skill,
        stroke_skill: player.stroke_skill,
        mental: player.mental,
        stamina: player.stamina,
        condition: player.condition,
        motivation: player.motivation,
        experience: player.experience,
        // 特殊能力データを追加（JSONB形式でデータベースに保存）
        special_abilities: player.special_abilities || [],
        // ポケモン種族情報も保存
        types: player.types || ['normal']
        // pokemon_statsカラムは現在のデータベーススキーマに存在しないため除外
        // 戦績カラムは一時的に除外
      }));

      console.log('getOrCreatePlayers: Inserting players into database...');
      console.log('Player data to insert:', playerInserts.map(p => ({
        name: p.pokemon_name,
        position: p.position,
        special_abilities_count: (p.special_abilities as any[])?.length || 0,
        special_abilities: (p.special_abilities as any[])?.map((a: any) => a.name) || []
      })));
      const { data: insertedPlayers, error: insertError } = await supabase
        .from('players')
        .insert(playerInserts)
        .select();

      console.log('getOrCreatePlayers: Insert result:', { insertedPlayers, insertError });

      if (insertError) {
        console.error('getOrCreatePlayers: Insert error:', insertError);
        throw new Error(`Failed to insert players: ${insertError.message}`);
      }

      console.log('getOrCreatePlayers: Successfully created players');
      return insertedPlayers as Player[];
    } catch (error) {
      console.error('getOrCreatePlayers: Unexpected error:', error);
      throw error;
    }
  };

  // カード効果を選手に適用
  const applyCardEffectsToPlayers = async (card: TrainingCard, players: Player[]): Promise<Player[]> => {
    if (!gameData.school) {
      throw new Error('School data not found');
    }

    const updatedPlayers = [...players];
    
    // カードの練習効果を各選手に適用
    for (let i = 0; i < updatedPlayers.length; i++) {
      const player = { ...updatedPlayers[i] };
      let hasChanges = false;

      // 各練習効果を適用（training-cards.ts の構造に合わせる）
      const growth = (card as any).baseEffects?.skillGrowth || {};
      Object.entries(growth).forEach(([skill, improvement]) => {
        const skillValue = (improvement as number) || 0;
        if (skillValue > 0) {
          hasChanges = true;
          switch (skill) {
            case 'serve_skill':
              player.serve_skill = Math.min(player.serve_skill + skillValue, 100);
              break;
            case 'return_skill':
              player.return_skill = Math.min(player.return_skill + skillValue, 100);
              break;
            case 'volley_skill':
              player.volley_skill = Math.min(player.volley_skill + skillValue, 100);
              break;
            case 'stroke_skill':
              player.stroke_skill = Math.min(player.stroke_skill + skillValue, 100);
              break;
            case 'mental':
              player.mental = Math.min(player.mental + skillValue, 100);
              break;
            case 'stamina':
              player.stamina = Math.min(player.stamina + skillValue, 100);
              break;
          }
        }
      });

      // 変更があった場合は新バランスシステムで経験値増加
      if (hasChanges) {
        const { ExperienceBalanceSystem } = await import('../lib/experience-balance-system');
        const expResult = ExperienceBalanceSystem.gainExperienceFromTraining(
          player, 
          'basic',  // 基礎練習として扱う
          1.0       // 標準品質
        );
        
        if (expResult.can_train) {
          const updatedPlayer = ExperienceBalanceSystem.applyExperienceGain(player, expResult.exp_gained);
          Object.assign(player, updatedPlayer);
        }
        
        // データベースを更新
        const { error: updateError } = await supabase
          .from('players')
          .update({
            serve_skill: player.serve_skill,
            return_skill: player.return_skill,
            volley_skill: player.volley_skill,
            stroke_skill: player.stroke_skill,
            mental: player.mental,
            stamina: player.stamina,
            experience: player.experience,
            level: player.level
          })
          .eq('id', player.id);

        if (updateError) {
          console.error('Failed to update player stats:', updateError);
        }
      }

      updatedPlayers[i] = player;
    }

    return updatedPlayers;
  };

  // カード使用（旧ルート）
  // 画面側は IntegratedGameInterface 経由の IntegratedGameFlow.useTrainingCard を利用するため、
  // ここは後方互換のダミーとして成功を返すのみ（将来削除予定）。
  const useCard = async (_cardId: string): Promise<boolean> => {
    console.warn('useGameData.useCard is deprecated. Use IntegratedGameFlow via IntegratedGameInterface instead.');
    return true;
  };

  return {
    gameData,
    loading,
    error,
    useCard,
    refreshData: initializeGameData,
    initializeWithCustomData: initializeGameData // カスタムデータ初期化用
  };
}