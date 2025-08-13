'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useGameData } from '@/hooks/useGameData';
import { DateManager } from '@/lib/date-manager';
import LoginForm from '@/components/LoginForm';
import EikanNineLayout from '@/components/layout/EikanNineLayout';
import ShopSystem from '@/components/shop/ShopSystem';
import EquipmentManager from '@/components/equipment/EquipmentManager';
import PokemonStatsViewer from '@/components/pokemon/PokemonStatsViewer';
import PokemonBreeder from '@/components/pokemon/PokemonBreeder';
import AdvancedMatchViewer from '@/components/match/AdvancedMatchViewer';
import { PlayerEquipment } from '@/types/items';
import { PokemonStats } from '@/types/pokemon-stats';
import { PlayerGenerator } from '@/lib/player-generator';
import { AdvancedSetResult } from '@/lib/advanced-match-engine';
import EikanNineMainGame from '@/components/game/EikanNineMainGame';
import SpecialTrainingMenu from '@/components/training/SpecialTrainingMenu';
import DataRoomDashboard from '@/components/data/DataRoomDashboard';
import TournamentSystem from '@/components/tournament/TournamentSystem';
import MemberManager from '@/components/members/MemberManager';
import GameIntroduction from '@/components/onboarding/GameIntroduction';
import { EvolutionOverview } from '@/components/evolution/EvolutionOverview';
import { ScoutingManager } from '@/components/scouting/ScoutingManager';
import { EventsDashboard } from '@/components/events/EventsDashboard';
import { SpecialEventsSystem } from '@/lib/special-events-system';
import CalendarView from '@/components/calendar/CalendarView';
import IntegratedGameInterface from '@/components/game/IntegratedGameInterface';
import { supabase } from '@/lib/supabase';
import { Player, GameDate } from '@/types/game';

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const { gameData, loading: gameLoading, error, refreshData, initializeWithCustomData } = useGameData();
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [activeMenu, setActiveMenu] = useState('home');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [availableEventsCount, setAvailableEventsCount] = useState(0);
  const [isInitializing, setIsInitializing] = useState(false);
  
  // ショップとアイテム管理の状態
  const [showShop, setShowShop] = useState(false);
  const [showEquipment, setShowEquipment] = useState(false);
  const [showPokemonStats, setShowPokemonStats] = useState(false);
  const [showBreeder, setShowBreeder] = useState(false);
  const [showAdvancedMatch, setShowAdvancedMatch] = useState(false);
  
  // ゲーム状態の同期用
  const [currentGameState, setCurrentGameState] = useState<{
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
  } | null>(null);

  // ゲーム状態の更新ハンドラー
  const handleGameStateUpdate = (newState: {
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
  }) => {
    setCurrentGameState(newState);
    
    // ゲーム状態が更新されたら、データを再読み込み
    if (gameData) {
      refreshData();
    }
  };

  // プレイヤー更新ハンドラー
  const handlePlayerUpdate = (updatedPlayer: Player) => {
    // TODO: 実際のデータベース更新処理を実装
    console.log('Player updated:', updatedPlayer);
    // ここで gameData の players を更新する必要がある
  };

  // スカウト結果ハンドラー
  const handleScoutingComplete = (result: { success: boolean; data?: unknown; cost?: number }) => {
    // TODO: スカウト費用を学校資金から差し引く処理を実装
    console.log('Scouting completed:', result);
  };

  // 勧誘結果ハンドラー
  const handleRecruitmentComplete = (attempt: { success: boolean; new_player?: Player; cost?: number }) => {
    // TODO: 勧誘成功時にプレイヤーを追加、費用を差し引く処理を実装
    console.log('Recruitment completed:', attempt);
    if (attempt.success && attempt.new_player) {
      // プレイヤー追加の処理をここで実装
      alert(`${attempt.new_player.pokemon_name}が部活に加入しました！`);
    }
  };

  // イベント完了ハンドラー
  const handleEventComplete = (outcome: { success: boolean; message?: string; rewards?: unknown }, player: Player) => {
    console.log('Event completed:', outcome, player);
    
    // 特殊能力習得時の処理
    if (outcome.success && (outcome as any).learned_ability) {
      // プレイヤーに特殊能力を追加
      if (!player.special_abilities) {
        player.special_abilities = [];
      }
      player.special_abilities.push((outcome as any).learned_ability);
      
      // TODO: データベース更新処理を実装
      alert(`${player.pokemon_name}が「${(outcome as any).learned_ability.name}」を習得しました！`);
    } else {
      alert(`${player.pokemon_name}は特殊能力の習得に失敗しました...でも経験は積めました`);
    }

    // 報酬処理
    if ((outcome as any).rewards_gained) {
      // TODO: 実際の報酬反映処理を実装
      console.log('Rewards gained:', (outcome as any).rewards_gained);
    }
  };

  // メニューハンドラー
  const handleMenuClick = (menu: string) => {
    setActiveMenu(menu);
    
    // メニューに応じてモーダルを開く
    switch (menu) {
      case 'shop':
        setShowShop(true);
        break;
      case 'breeding':
        setShowBreeder(true);
        break;
      case 'match':
        if (currentDisplayPlayer) {
          setSelectedPlayer(currentDisplayPlayer);
          setShowAdvancedMatch(true);
        }
        break;
    }
  };

  const loading = gameLoading;

  // 利用可能イベントのチェック
  useEffect(() => {
    if (!gameData.school || !gameData.players || gameData.players.length === 0) return;

    const checkAvailableEvents = () => {
      try {
        const events = SpecialEventsSystem.checkEventTriggers(
          gameData.players[0], // 暫定的にキャプテンベース
          gameData.currentDate,
          'win', // 暫定的
          0, // 暫定的な連勝数
          gameData.school?.reputation || 0
        );
        setAvailableEventsCount(events.length);
      } catch (error) {
        console.error('Error checking available events:', error);
        setAvailableEventsCount(0);
      }
    };

    checkAvailableEvents();
    
    // 定期的にイベントをチェック（日付変更時など）
    const interval = setInterval(checkAvailableEvents, 30000); // 30秒ごと
    
    return () => clearInterval(interval);
  }, [gameData.school?.id, gameData.players?.length, gameData.currentDate?.year, gameData.currentDate?.month, gameData.currentDate?.day, gameData.school?.reputation]);
  
  // ESLint の警告を抑制するための参考用コメント
  // gameData.currentDate, gameData.players, gameData.school を直接依存配列に入れると
  // オブジェクトの参照が毎回変わってしまい無限ループの原因となるため、
  // 特定のプロパティのみを依存配列に含めています

  // 初回ユーザーかどうかチェック
  useEffect(() => {
    const checkFirstTimeUser = async () => {
      if (!user) return;
      
      try {
        const { data: existingSchool, error } = await supabase
          .from('schools')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (error && error.code !== 'PGRST116') {
          console.error('Error checking existing school:', error);
          setIsFirstTimeUser(false);
          return;
        }
        
        const isFirstTime = !existingSchool;
        setIsFirstTimeUser(isFirstTime);
        setShowOnboarding(isFirstTime);
      } catch (error) {
        console.error('Failed to check first time user:', error);
        setIsFirstTimeUser(false);
      }
    };
    
    checkFirstTimeUser();
  }, [user]);
  
  // オンボーディング完了ハンドラー
  const handleOnboardingComplete = async (data: {
    schoolName: string;
    selectedStarter: string;
    managerName?: string;
  }) => {
    try {
      console.log('page.tsx: Starting onboarding completion with data:', data);
      
      setIsInitializing(true);
      console.log('page.tsx: Set isInitializing to true');
      
      // カスタムデータでゲーム初期化
      console.log('page.tsx: Calling initializeWithCustomData...');
      await initializeWithCustomData({
        schoolName: data.schoolName,
        selectedStarter: data.selectedStarter,
        managerName: data.managerName
      });
      console.log('page.tsx: initializeWithCustomData completed successfully');
      
      // オンボーディング終了
      setShowOnboarding(false);
      setIsFirstTimeUser(false);
      
      console.log('page.tsx: Onboarding completed successfully');
    } catch (error) {
      console.error('page.tsx: Failed to complete onboarding:', error);
      // エラー時はオンボーディングを再表示
      alert('初期設定に失敗しました。もう一度お試しください。');
    } finally {
      setIsInitializing(false);
      console.log('page.tsx: Set isInitializing to false');
    }
  };

  // 認証が必要な場合
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">認証確認中...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }
  
  // 初回ユーザーのオンボーディング表示
  if (showOnboarding && isFirstTimeUser) {
    return (
      <GameIntroduction onComplete={handleOnboardingComplete} />
    );
  }
  
  // 初回ユーザー判定中
  if (isFirstTimeUser === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">初期設定確認中...</p>
        </div>
      </div>
    );
  }

  // エラー表示
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center bg-red-50 border border-red-200 rounded-xl p-8 max-w-md">
          <h2 className="text-2xl font-bold text-red-800 mb-4">❌ エラー</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors"
          >
            🔄 再読み込み
          </button>
        </div>
      </div>
    );
  }

  // 初期化中
  if (gameLoading || isInitializing || !gameData.school) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">
            {isInitializing ? 'ゲーム初期化中...' : 'ゲームデータ読み込み中...'}
          </p>
        </div>
      </div>
    );
  }

  const { school, cards, players, currentDate } = gameData;

  // 現在選択中のプレイヤー（キャプテンまたは最初のプレイヤー）
  const currentDisplayPlayer = selectedPlayer || players.find(p => p.position === 'captain') || players[0];

  // すごろくの進行度を計算（開始日から現在日までの日数）
  const calculateProgress = () => {
    const startDate = { year: 2024, month: 4, day: 1 }; // ゲーム開始日
    const start = new Date(startDate.year, startDate.month - 1, startDate.day);
    const current = new Date(currentDate.year, currentDate.month - 1, currentDate.day);
    return Math.floor((current.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  };

  return (
    <>
    <EikanNineLayout
      currentPlayer={currentDisplayPlayer}
      schoolName={school.name}
      schoolFunds={school.funds}
      schoolReputation={school.reputation}
      currentDate={DateManager.formatDate(currentDate)}
      onMenuClick={handleMenuClick}
      activeMenu={activeMenu}
      availableEventsCount={availableEventsCount}
    >
      {/* メニューに応じたコンテンツ表示 */}
      {activeMenu === 'home' && (
        <div className="h-full">
          <IntegratedGameInterface
            initialPlayer={currentDisplayPlayer}
            initialSchoolStats={{
              name: school.name,
              funds: currentGameState?.schoolStats.funds ?? school.funds,
              reputation: currentGameState?.schoolStats.reputation ?? school.reputation,
              facilities: currentGameState?.schoolStats.facilities ?? 50,
              current_year: currentDate.year,
              current_month: currentDate.month,
              current_day: currentDate.day,
              totalMatches: players.reduce((sum, p) => sum + (p.matches_played || 0), 0),
              totalWins: players.reduce((sum, p) => sum + (p.matches_won || 0), 0),
              totalTournaments: 0, // TODO: 実装
              founded: "2024年"
            }}
            allPlayers={players}
            schoolId={school.id}
            onGameStateUpdate={handleGameStateUpdate}
          />
        </div>
      )}

      {activeMenu === 'players' && (
        <MemberManager 
          players={players}
          onClose={() => setActiveMenu('home')}
        />
      )}

      {activeMenu === 'training' && (
        <div className="h-full">
          <SpecialTrainingMenu
            players={players}
            onPlayerSelect={(player) => setSelectedPlayer(player)}
            onTrainingStart={(player, trainingType) => {
              console.log('Training started:', player.pokemon_name, trainingType);
              // TODO: 実際の特別練習処理を実装
              alert(`${player.pokemon_name}が特別練習「${trainingType}」を開始しました！`);
            }}
          />
        </div>
      )}

      {activeMenu === 'evolution' && (
        <div className="h-full overflow-y-auto">
          <EvolutionOverview 
            players={players}
            onPlayerUpdate={handlePlayerUpdate}
          />
        </div>
      )}

      {activeMenu === 'scouting' && (
        <div className="h-full overflow-y-auto">
          <ScoutingManager
            schoolFunds={school.funds}
            schoolReputation={school.reputation}
            onScoutingComplete={handleScoutingComplete}
            onRecruitmentComplete={handleRecruitmentComplete}
          />
        </div>
      )}

      {activeMenu === 'events' && (
        <div className="h-full overflow-y-auto">
          <EventsDashboard
            players={players}
            currentDate={currentDate}
            schoolReputation={school.reputation}
            onEventComplete={handleEventComplete}
          />
        </div>
      )}

      {activeMenu === 'data' && (
        <div className="h-full">
          <DataRoomDashboard
            players={players}
            schoolStats={{
              name: school.name,
              funds: school.funds,
              reputation: school.reputation,
              totalMatches: players.reduce((sum, p) => sum + (p.matches_played || 0), 0),
              totalWins: players.reduce((sum, p) => sum + (p.matches_won || 0), 0),
              totalTournaments: 0, // TODO: 実装
              founded: "2024年"
            }}
            gameFlow={(window as any).__GAME_FLOW__}
          />
        </div>
      )}

      {activeMenu === 'tournament' && (
        <div className="h-full">
          <TournamentSystem
            players={players}
            schoolStats={{
              funds: school.funds,
              reputation: school.reputation
            }}
            onTournamentStart={(tournament, selectedPlayers) => {
              console.log('Tournament started:', tournament.name, selectedPlayers.length);
              // TODO: 実際のトーナメント開始処理を実装
            }}
            onTournamentComplete={(tournament, result) => {
              console.log('Tournament completed:', result);
              // TODO: 実際のトーナメント完了処理を実装
              
              const message = result.finalRank === 'winner' ? 
                `🏆 ${tournament.name}で優勝しました！` :
                result.finalRank === 'finalist' ? 
                `🥈 ${tournament.name}で準優勝しました！` :
                result.finalRank === 'semifinalist' ? 
                `🥉 ${tournament.name}でベスト4入りしました！` :
                `${tournament.name}で敗退しました...`;
              
              alert(message + `\n報酬: 💰${result.rewards.funds} ⭐${result.rewards.reputation}`);
            }}
          />
        </div>
      )}
    </EikanNineLayout>

    {/* モーダルは外側に配置 */}
      {/* ショップモーダル */}
      {showShop && (
        <ShopSystem onClose={() => setShowShop(false)} />
      )}

      {/* 装備管理モーダル */}
      {showEquipment && selectedPlayer && (
        <EquipmentManager 
          player={selectedPlayer}
          onPlayerUpdate={(updatedPlayer: Player) => {
            console.log('Player updated:', updatedPlayer);
            // ここで実際のプレイヤー更新処理を実装
          }}
          onClose={() => {
            setShowEquipment(false);
            setSelectedPlayer(null);
          }}
          onEquipmentChange={(playerId: string, equipment: PlayerEquipment) => {
            console.log('Equipment changed for player:', playerId, equipment);
            // ここで実際の装備変更処理を実装
          }}
        />
      )}

      {/* ポケモン詳細表示モーダル */}
      {showPokemonStats && selectedPlayer && (
        <PokemonStatsViewer
          player={selectedPlayer}
          onClose={() => {
            setShowPokemonStats(false);
            setSelectedPlayer(null);
          }}
          onLevelUp={(updatedPlayer: Player) => {
            console.log('Player leveled up:', updatedPlayer);
            // ここで実際のレベルアップ処理を実装
            // ゲームデータを更新する必要がある
          }}
          onEvolve={(updatedPlayer: Player) => {
            console.log('Player evolved:', updatedPlayer);
            // ここで実際の進化処理を実装
            // ゲームデータを更新する必要がある
          }}
        />
      )}

      {/* 育て屋さんモーダル */}
      {showBreeder && (
        <PokemonBreeder
          onClose={() => setShowBreeder(false)}
          onSelectPokemon={(pokemonStats: PokemonStats) => {
            // 厳選されたポケモンを新しいプレイヤーとして追加
            const newPlayer = PlayerGenerator.createPlayerFromBreedResult(pokemonStats);
            
            // ここで実際にゲームデータに追加する処理を実装
            console.log('New player from breeding:', newPlayer);
            
            // TODO: ゲームデータ更新のAPIを呼び出す
            // updatePlayerList([...gameData.players, newPlayer]);
            
            setShowBreeder(false);
            
            // 成功メッセージを表示（オプション）
            alert(`${pokemonStats.pokemon_name}が部活に加入しました！`);
          }}
        />
      )}

      {/* 高度バトルシステムモーダル */}
      {showAdvancedMatch && selectedPlayer && (
        <AdvancedMatchViewer
          homePlayer={selectedPlayer}
          onClose={() => {
            setShowAdvancedMatch(false);
            setSelectedPlayer(null);
          }}
          onMatchComplete={(result: AdvancedSetResult, opponent: Player) => {
            console.log('Advanced match completed:', result);
            
            // 試合結果を処理
            const isWin = result.winner === 'home';
            
            // 選手の経験値・戦績を更新
            selectedPlayer.matches_played = (selectedPlayer.matches_played || 0) + 1;
            if (isWin) {
              selectedPlayer.matches_won = (selectedPlayer.matches_won || 0) + 1;
            }
            
            // TODO: データベース更新
            
            setShowAdvancedMatch(false);
            setSelectedPlayer(null);
            
            // 結果通知
            const message = isWin 
              ? `🏆 ${selectedPlayer.pokemon_name}が勝利しました！経験値を獲得！` 
              : `😢 ${selectedPlayer.pokemon_name}は敗北...次回頑張りましょう！`;
            alert(message);
          }}
        />
      )}
    </>
  );
}
