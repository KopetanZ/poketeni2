// 試合シミュレーションエンジン
import { Player } from '@/types/game';

export interface CPUPlayer {
  id: string;
  pokemon_name: string;
  pokemon_id: number;
  level: number;
  grade: 1 | 2 | 3;
  position: 'captain' | 'vice_captain' | 'regular' | 'member';
  serve_skill: number;
  return_skill: number;
  volley_skill: number;
  stroke_skill: number;
  mental: number;
  stamina: number;
  ai_personality: 'aggressive' | 'defensive' | 'balanced' | 'unpredictable';
  special_ability?: string;
}

export interface MatchPoint {
  type: 'serve' | 'return' | 'volley' | 'stroke' | 'mental';
  home_skill: number;
  away_skill: number;
  home_roll: number;
  away_roll: number;
  winner: 'home' | 'away';
  description: string;
}

export interface SetResult {
  home_score: number;
  away_score: number;
  winner: 'home' | 'away';
  match_log: MatchPoint[];
  home_performance: {
    serve_success: number;
    return_success: number;
    volley_success: number;
    stroke_success: number;
    mental_success: number;
    total_points: number;
  };
  away_performance: {
    serve_success: number;
    return_success: number;
    volley_success: number;
    stroke_success: number;
    mental_success: number;
    total_points: number;
  };
}

export interface MatchResult {
  home_sets_won: number;
  away_sets_won: number;
  winner_school: 'home' | 'away';
  sets: SetResult[];
  total_duration_minutes: number;
}

export class MatchEngine {
  // 1セット（6ゲーム先取）のシミュレーション
  static simulateSet(homePlayer: Player, awayPlayer: Player | CPUPlayer): SetResult {
    const matchLog: MatchPoint[] = [];
    let homeScore = 0;
    let awayScore = 0;
    
    const homePerformance = {
      serve_success: 0,
      return_success: 0,
      volley_success: 0,
      stroke_success: 0,
      mental_success: 0,
      total_points: 0
    };
    
    const awayPerformance = {
      serve_success: 0,
      return_success: 0,
      volley_success: 0,
      stroke_success: 0,
      mental_success: 0,
      total_points: 0
    };

    // 6ゲーム先取（最大12ゲーム）
    while (homeScore < 6 && awayScore < 6 && (homeScore + awayScore) < 12) {
      const gameWinner = this.simulateGame(homePlayer, awayPlayer, matchLog, homePerformance, awayPerformance);
      
      if (gameWinner === 'home') {
        homeScore++;
      } else {
        awayScore++;
      }
    }

    // タイブレークの場合（6-6）
    if (homeScore === 6 && awayScore === 6) {
      const tiebreakWinner = this.simulateTiebreak(homePlayer, awayPlayer, matchLog, homePerformance, awayPerformance);
      if (tiebreakWinner === 'home') {
        homeScore = 7;
      } else {
        awayScore = 7;
      }
    }

    return {
      home_score: homeScore,
      away_score: awayScore,
      winner: homeScore > awayScore ? 'home' : 'away',
      match_log: matchLog,
      home_performance: homePerformance,
      away_performance: awayPerformance
    };
  }

  // 1ゲーム（4ポイント先取）のシミュレーション
  private static simulateGame(
    homePlayer: Player, 
    awayPlayer: Player | CPUPlayer, 
    matchLog: MatchPoint[],
    homePerf: any,
    awayPerf: any
  ): 'home' | 'away' {
    let homePoints = 0;
    let awayPoints = 0;
    let serverIsHome = Math.random() > 0.5;

    // 4ポイント先取（デュースあり）
    while (homePoints < 4 && awayPoints < 4 || Math.abs(homePoints - awayPoints) < 2) {
      let pointWinner: 'home' | 'away';
      
      if (serverIsHome) {
        // ホームプレイヤーのサーブ
        pointWinner = this.simulatePoint('serve', homePlayer, awayPlayer, matchLog);
      } else {
        // アウェイプレイヤーのサーブ
        pointWinner = this.simulatePoint('serve', awayPlayer, homePlayer, matchLog);
        pointWinner = pointWinner === 'home' ? 'away' : 'home'; // 結果を反転
      }

      if (pointWinner === 'home') {
        homePoints++;
        homePerf.total_points++;
      } else {
        awayPoints++;
        awayPerf.total_points++;
      }

      // サーバー交代（テニスでは2ポイントごと）
      if ((homePoints + awayPoints) % 2 === 0) {
        serverIsHome = !serverIsHome;
      }

      // デュースの場合、2ポイント差がつくまで続行
      if (homePoints >= 3 && awayPoints >= 3) {
        if (Math.abs(homePoints - awayPoints) >= 2) {
          break;
        }
      }
    }

    return homePoints > awayPoints ? 'home' : 'away';
  }

  // タイブレーク（7ポイント先取、2ポイント差）
  private static simulateTiebreak(
    homePlayer: Player, 
    awayPlayer: Player | CPUPlayer, 
    matchLog: MatchPoint[],
    homePerf: any,
    awayPerf: any
  ): 'home' | 'away' {
    let homePoints = 0;
    let awayPoints = 0;
    let serverIsHome = Math.random() > 0.5;

    while (homePoints < 7 && awayPoints < 7 || Math.abs(homePoints - awayPoints) < 2) {
      const pointWinner = serverIsHome 
        ? this.simulatePoint('serve', homePlayer, awayPlayer, matchLog)
        : this.simulatePoint('serve', awayPlayer, homePlayer, matchLog);

      if (pointWinner === 'home') {
        homePoints++;
        homePerf.total_points++;
      } else {
        awayPoints++;
        awayPerf.total_points++;
      }

      // タイブレークでは1ポイントごとにサーバー交代
      serverIsHome = !serverIsHome;
    }

    return homePoints > awayPoints ? 'home' : 'away';
  }

  // 1ポイントのシミュレーション
  private static simulatePoint(
    pointType: 'serve' | 'return' | 'volley' | 'stroke' | 'mental',
    serverPlayer: Player | CPUPlayer,
    receiverPlayer: Player | CPUPlayer,
    matchLog: MatchPoint[]
  ): 'home' | 'away' {
    // ランダムにラリーの種類を決定
    const rallyTypes = ['serve', 'return', 'volley', 'stroke', 'mental'] as const;
    const selectedType = rallyTypes[Math.floor(Math.random() * rallyTypes.length)];
    
    // 各プレイヤーのスキル値を取得
    const serverSkill = this.getSkillValue(serverPlayer, selectedType);
    const receiverSkill = this.getSkillValue(receiverPlayer, selectedType);
    
    // ランダム要素を追加（0-20の範囲）
    const serverRoll = Math.floor(Math.random() * 21);
    const receiverRoll = Math.floor(Math.random() * 21);
    
    // 最終的な値を計算
    const serverTotal = serverSkill + serverRoll;
    const receiverTotal = receiverSkill + receiverRoll;
    
    // 勝者を決定
    const winner = serverTotal > receiverTotal ? 'home' : 'away';
    
    // ログを記録
    const point: MatchPoint = {
      type: selectedType,
      home_skill: serverTotal === serverSkill + serverRoll ? serverSkill : receiverSkill,
      away_skill: serverTotal === serverSkill + serverRoll ? receiverSkill : serverSkill,
      home_roll: serverTotal === serverSkill + serverRoll ? serverRoll : receiverRoll,
      away_roll: serverTotal === serverSkill + serverRoll ? receiverRoll : serverRoll,
      winner,
      description: this.generatePointDescription(selectedType, winner, serverPlayer, receiverPlayer)
    };
    
    matchLog.push(point);
    
    return winner;
  }

  // プレイヤーのスキル値を取得
  private static getSkillValue(player: Player | CPUPlayer, skillType: string): number {
    switch (skillType) {
      case 'serve': return player.serve_skill;
      case 'return': return player.return_skill;
      case 'volley': return player.volley_skill;
      case 'stroke': return player.stroke_skill;
      case 'mental': return player.mental;
      default: return 50;
    }
  }

  // ポイントの説明文生成
  private static generatePointDescription(
    type: string,
    winner: 'home' | 'away',
    serverPlayer: Player | CPUPlayer,
    receiverPlayer: Player | CPUPlayer
  ): string {
    const winnerName = winner === 'home' ? serverPlayer.pokemon_name : receiverPlayer.pokemon_name;
    
    const descriptions = {
      serve: [
        `${winnerName}の強烈なサービスエース！`,
        `${winnerName}のサーブが決まった！`,
        `${winnerName}の高速サーブで一気に決める！`
      ],
      return: [
        `${winnerName}の見事なリターンエース！`,
        `${winnerName}がサーブを完璧に打ち返す！`,
        `${winnerName}のカウンターリターンが決まった！`
      ],
      volley: [
        `${winnerName}のネット前の決定的なボレー！`,
        `${winnerName}が前に出てボレーで決めた！`,
        `${winnerName}の技巧的なボレーが炸裂！`
      ],
      stroke: [
        `${winnerName}のベースラインからの強烈なストローク！`,
        `${winnerName}の力強いグランドストロークが決まる！`,
        `${winnerName}のクロスコートショットが見事に決まった！`
      ],
      mental: [
        `${winnerName}が重要な場面で集中力を発揮！`,
        `${winnerName}の精神力の強さが光る！`,
        `${winnerName}がプレッシャーに負けずポイントを奪取！`
      ]
    };

    const typeDescriptions = descriptions[type as keyof typeof descriptions] || descriptions.stroke;
    return typeDescriptions[Math.floor(Math.random() * typeDescriptions.length)];
  }

  // 3セットマッチのシミュレーション（2セット先取）
  static simulateMatch(
    homePlayer: Player,
    awayPlayer: Player | CPUPlayer
  ): MatchResult {
    const sets: SetResult[] = [];
    let homeSetsWon = 0;
    let awaySetsWon = 0;
    const startTime = Date.now();

    // 2セット先取
    while (homeSetsWon < 2 && awaySetsWon < 2) {
      const setResult = this.simulateSet(homePlayer, awayPlayer);
      sets.push(setResult);
      
      if (setResult.winner === 'home') {
        homeSetsWon++;
      } else {
        awaySetsWon++;
      }
    }

    const endTime = Date.now();
    const durationMinutes = Math.floor((endTime - startTime) / 100) + 45; // 試合時間をシミュレート

    return {
      home_sets_won: homeSetsWon,
      away_sets_won: awaySetsWon,
      winner_school: homeSetsWon > awaySetsWon ? 'home' : 'away',
      sets,
      total_duration_minutes: durationMinutes
    };
  }

  // CPU対戦相手を生成
  static generateCPUOpponent(difficulty: 'easy' | 'normal' | 'hard' | 'extreme'): CPUPlayer {
    const cpuPokemon = [
      { name: 'リザードン', id: 6 },
      { name: 'カメックス', id: 9 },
      { name: 'フシギバナ', id: 3 },
      { name: 'ピカチュウ', id: 25 },
      { name: 'イーブイ', id: 133 },
      { name: 'ルカリオ', id: 448 },
      { name: 'ガルーラ', id: 115 },
      { name: 'カビゴン', id: 143 }
    ];

    const pokemon = cpuPokemon[Math.floor(Math.random() * cpuPokemon.length)];
    
    // 難易度に応じてスキル値を調整
    const baseSkill = difficulty === 'easy' ? 15 : difficulty === 'normal' ? 30 : difficulty === 'hard' ? 50 : 70;
    const variation = 10;

    return {
      id: `cpu_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      pokemon_name: pokemon.name,
      pokemon_id: pokemon.id,
      level: difficulty === 'easy' ? 1 : difficulty === 'normal' ? 2 : difficulty === 'hard' ? 3 : 5,
      grade: Math.floor(Math.random() * 3) + 1 as (1 | 2 | 3),
      position: 'regular',
      serve_skill: baseSkill + Math.floor(Math.random() * variation),
      return_skill: baseSkill + Math.floor(Math.random() * variation),
      volley_skill: baseSkill + Math.floor(Math.random() * variation),
      stroke_skill: baseSkill + Math.floor(Math.random() * variation),
      mental: baseSkill + Math.floor(Math.random() * variation),
      stamina: baseSkill + Math.floor(Math.random() * variation),
      ai_personality: ['aggressive', 'defensive', 'balanced', 'unpredictable'][Math.floor(Math.random() * 4)] as any
    };
  }
}