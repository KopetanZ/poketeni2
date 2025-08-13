// 栄冠ナイン風インタラクティブ試合システム
// ユーザーが試合中に指示・作戦を選択できるリアルタイム試合エンジン

import { Player } from '@/types/game';
import { AdvancedMatchEngine, TacticType, MatchContext } from './advanced-match-engine';

// 試合状況の種類
export type MatchSituation = 
  | 'serve'           // サーブ権を持つ
  | 'return'          // リターンする
  | 'rally'           // ラリー中
  | 'break_point'     // ブレークポイント
  | 'set_point'       // セットポイント 
  | 'match_point'     // マッチポイント
  | 'pressure'        // プレッシャー場面
  | 'injury_concern'  // 怪我の心配
  | 'momentum_shift'  // 流れが変わった
  | 'timeout_needed'  // タイムアウト推奨
  | 'behind'          // 劣勢
  | 'leading'         // 優勢
  | 'any';            // いつでも使用可能

// ユーザー選択肢の種類
export type UserChoice = 
  | 'aggressive'      // 積極的に行け
  | 'defensive'       // 守備的に行け
  | 'maintain'        // 現状維持
  | 'mental'          // メンタル重視
  | 'special_move'    // 特殊作戦
  | 'change_tactic'   // 戦術変更
  | 'special_move'    // 特殊作戦
  | 'timeout'         // タイムアウト
  | 'substitution'    // 選手交代
  | 'encourage'       // 激励する
  | 'calm_down'       // 冷静にさせる
  | 'pressure_on';    // プレッシャーをかける

// 指示効果の種類
export interface InstructionEffect {
  skillModifier: number;        // 能力値修正 (-20 ~ +20)
  mentalEffect: number;         // 精神状態修正 (-10 ~ +15)
  staminaEffect: number;        // スタミナ効果 (-5 ~ +5)
  criticalRate: number;         // クリティカル率修正 (0 ~ 0.3)
  errorRate: number;            // エラー率修正 (-0.2 ~ 0.2)
  momentumEffect: number;       // 勢い効果 (-10 ~ +15)
  duration: number;             // 効果持続ポイント数 (1~5)
  description: string;          // 効果説明
}

// 試合選択肢
export interface MatchChoice {
  id: string;
  type: UserChoice;
  title: string;
  description: string;
  riskLevel: 'low' | 'medium' | 'high';
  successRate: number;          // 成功率 (0.0 ~ 1.0)
  effect: InstructionEffect;
  availableConditions: MatchSituation[];
}

// 試合状態
export interface InteractiveMatchState {
  currentSet: number;
  currentGame: number;
  homeScore: number;
  awayScore: number;
  homeGames: number;
  awayGames: number;
  homeSets: number;
  awaySets: number;
  server: 'home' | 'away';
  situation: MatchSituation;
  momentum: number;             // 勢い (-100 ~ +100, 正の値がホーム有利)
  pressure: number;             // プレッシャー (0 ~ 100)
  fatigue: {
    home: number;               // 疲労度 (0 ~ 100)
    away: number;
  };
  activeEffects: {
    home: InstructionEffect[];  // アクティブな指示効果
    away: InstructionEffect[];
  };
  availableChoices: MatchChoice[];
  lastChoice?: {
    choice: MatchChoice;
    success: boolean;
    result: string;
  };
}

// イベント発生
export interface MatchEvent {
  id: string;
  type: 'choice_result' | 'situation_change' | 'special_moment' | 'injury' | 'breakthrough';
  title: string;
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
  effectOnMatch: Partial<InteractiveMatchState>;
}

export class InteractiveMatchEngine {
  private static readonly DIRECTOR_INSTRUCTIONS: MatchChoice[] = [
    // === 【監督指示】即時対応型・短期効果 ===
    
    // サーブ時の監督指示（次の1-2ポイント限定）
    {
      id: 'serve_power_up',
      type: 'aggressive', 
      title: '🔥 全力でいけ！',
      description: 'この1ポイント、全力でサーブを叩き込め！',
      riskLevel: 'high',
      successRate: 0.65,
      effect: {
        skillModifier: 15,
        mentalEffect: 10,
        staminaEffect: -3,
        criticalRate: 0.25,
        errorRate: 0.15,
        momentumEffect: 15,
        duration: 1, // 1ポイント限定
        description: '次のポイント限定で大幅パワーアップ'
      },
      availableConditions: ['serve', 'pressure']
    },
    {
      id: 'serve_safe_play',
      type: 'defensive',
      title: '🛡️ 確実にいこう',
      description: 'ミスは絶対するな、安全第一で',
      riskLevel: 'low',
      successRate: 0.95,
      effect: {
        skillModifier: 3,
        mentalEffect: 8,
        staminaEffect: 2,
        criticalRate: 0.05,
        errorRate: -0.15,
        momentumEffect: 2,
        duration: 2,
        description: '2ポイント間、安定したプレー'
      },
      availableConditions: ['serve', 'return', 'pressure']
    },
    
    // リターン時の監督指示
    {
      id: 'return_aggressive',
      type: 'aggressive',
      title: '⚡ 攻撃的に返せ！',
      description: 'リターンで攻勢に出て、相手にプレッシャーをかけろ',
      riskLevel: 'medium',
      successRate: 0.75,
      effect: {
        skillModifier: 10,
        mentalEffect: 6,
        staminaEffect: -2,
        criticalRate: 0.18,
        errorRate: 0.08,
        momentumEffect: 8,
        duration: 1,
        description: '次のリターン限定で攻撃力アップ'
      },
      availableConditions: ['return']
    },
    
    // ピンチ時の監督指示
    {
      id: 'crisis_concentration',
      type: 'mental',
      title: '🧠 集中しろ！',
      description: 'ピンチだが落ち着け、一点集中だ',
      riskLevel: 'low',
      successRate: 0.85,
      effect: {
        skillModifier: 5,
        mentalEffect: 15,
        staminaEffect: 0,
        criticalRate: 0.1,
        errorRate: -0.2,
        momentumEffect: 5,
        duration: 1,
        description: '次のポイント限定で集中力大幅アップ'
      },
      availableConditions: ['break_point', 'set_point', 'match_point', 'behind']
    },
    
    // チャンス時の監督指示
    {
      id: 'chance_decisive',
      type: 'aggressive',
      title: '🎯 決めにいけ！',
      description: 'チャンスだ！思い切って決めにいこう',
      riskLevel: 'high',
      successRate: 0.6,
      effect: {
        skillModifier: 20,
        mentalEffect: 8,
        staminaEffect: -4,
        criticalRate: 0.35,
        errorRate: 0.2,
        momentumEffect: 20,
        duration: 1,
        description: '次のポイント限定で決定力最大化'
      },
      availableConditions: ['break_point', 'set_point', 'leading']
    }
  ];

  // 状況分析
  static analyzeSituation(gameState: InteractiveMatchState): MatchSituation {
    // 試合終了間近
    if (gameState.homeSets === 1 && gameState.awaySets === 1) {
      if (gameState.homeGames >= 5 || gameState.awayGames >= 5) {
        return 'match_point';
      }
      return 'set_point';
    }

    // ブレークポイントの判定
    if ((gameState.server === 'away' && gameState.homeScore >= 3 && gameState.homeScore >= gameState.awayScore) ||
        (gameState.server === 'home' && gameState.awayScore >= 3 && gameState.awayScore >= gameState.homeScore)) {
      return 'break_point';
    }

    // プレッシャー場面
    if (gameState.pressure > 70) {
      return 'pressure';
    }

    // 勢いの変化
    if (Math.abs(gameState.momentum) > 30) {
      return 'momentum_shift';
    }

    // 基本状況
    if (gameState.server === 'home') {
      return 'serve';
    } else {
      return 'return';
    }
  }

  // 利用可能な選択肢を取得
  static getAvailableChoices(situation: MatchSituation, gameState: InteractiveMatchState): MatchChoice[] {
    // 新しい監督指示システムを使用
    return this.DIRECTOR_INSTRUCTIONS.filter(choice => 
      choice.availableConditions.includes(situation) || choice.availableConditions.includes('any')
    ).map(choice => ({
      ...choice,
      // 状況に応じて成功率を動的調整
      successRate: this.adjustSuccessRate(choice, gameState)
    }));
  }

  // 成功率の動的調整
  private static adjustSuccessRate(choice: MatchChoice, gameState: InteractiveMatchState): number {
    let adjustedRate = choice.successRate;

    // 勢いによる調整
    if (gameState.momentum > 20) {
      adjustedRate += 0.1;
    } else if (gameState.momentum < -20) {
      adjustedRate -= 0.1;
    }

    // プレッシャーによる調整
    if (gameState.pressure > 70) {
      if (choice.riskLevel === 'low') {
        adjustedRate += 0.15;
      } else if (choice.riskLevel === 'high') {
        adjustedRate -= 0.2;
      }
    }

    return Math.max(0.1, Math.min(0.95, adjustedRate));
  }

  // ユーザー選択の実行
  static executeChoice(choice: MatchChoice, gameState: InteractiveMatchState): {
    success: boolean;
    result: string;
    newState: InteractiveMatchState;
    event?: MatchEvent;
  } {
    const success = Math.random() < choice.successRate;
    const newState = { ...gameState };

    // 効果適用
    if (success) {
      // 成功時の効果
      newState.momentum += choice.effect.momentumEffect || 0;
      newState.pressure = Math.max(0, newState.pressure - 10);
      
      // 結果メッセージ
      const result = this.generateSuccessMessage(choice);
      
      return { success, result, newState };
    } else {
      // 失敗時の効果
      newState.momentum -= 5;
      newState.pressure = Math.min(100, newState.pressure + 5);
      
      const result = this.generateFailureMessage(choice);
      
      return { success, result, newState };
    }
  }

  // 成功メッセージ生成
  private static generateSuccessMessage(choice: MatchChoice): string {
    const messages: Record<string, string[]> = {
      'serve_power_up': [
        '力強いサーブが決まった！',
        '完璧なパワーサーブで主導権を握る！'
      ],
      'serve_safe_play': [
        '安定したサーブでミスを回避！',
        '確実なサーブで流れを維持！'
      ],
      'return_aggressive': [
        '攻撃的なリターンが効果的だった！',
        'アグレッシブなリターンでプレッシャーをかける！'
      ],
      'crisis_concentration': [
        '集中力を発揮してピンチを切り抜けた！',
        '冷静な判断で危険を回避！'
      ],
      'chance_decisive': [
        '決定的な一撃で勝負を決めた！',
        'チャンスを完璧に活かした！'
      ]
    };

    const choiceMessages = messages[choice.id] || ['指示が功を奏した！'];
    return choiceMessages[Math.floor(Math.random() * choiceMessages.length)];
  }

  // 失敗メッセージ生成
  private static generateFailureMessage(choice: MatchChoice): string {
    const messages: Record<string, string[]> = {
      'serve_power_up': [
        'パワーサーブが裏目に出てしまった...',
        '力み過ぎてサーブが乱れた...'
      ],
      'return_aggressive': [
        'アグレッシブすぎてミスが出た...',
        '攻撃的になりすぎて失敗...'
      ],
      'chance_decisive': [
        'プレッシャーで決めきれなかった...',
        'チャンスを活かしきれず...'
      ]
    };

    const choiceMessages = messages[choice.id] || ['指示が思うようにいかなかった...'];
    return choiceMessages[Math.floor(Math.random() * choiceMessages.length)];
  }
}
