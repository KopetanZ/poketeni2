/**
 * 統合マッチシステム - インタラクティブ機能
 * 栄冠ナイン風のリアルタイム選択システム
 */

import { 
  EnhancedPlayer, 
  MatchContext, 
  MatchSituation, 
  UserChoice, 
  MatchChoice, 
  InstructionEffect,
  InteractiveMatchState,
  MatchEvent
} from './types';
import { BaseMatchEngine } from './base-engine';
import { AdvancedMatchFeatures } from './advanced-features';

export class InteractiveMatchFeatures {
  
  // ===== 状況分析システム =====
  
  /**
   * 現在の試合状況を分析
   */
  static analyzeSituation(
    homePlayer: EnhancedPlayer,
    awayPlayer: EnhancedPlayer,
    context: MatchContext,
    state: InteractiveMatchState
  ): MatchSituation {
    const { game_score, set_score } = context;
    const { momentum, pressure, homeScore, awayScore } = state;
    
    // 重要なポイント状況を優先チェック
    
    // マッチポイント
    if (set_score.home === 1 && game_score.home === 5 && homeScore >= 5) {
      return 'match_point';
    }
    if (set_score.away === 1 && game_score.away === 5 && awayScore >= 5) {
      return 'match_point';
    }
    
    // セットポイント
    if (game_score.home === 5 && homeScore >= 5) {
      return 'set_point';
    }
    if (game_score.away === 5 && awayScore >= 5) {
      return 'set_point';
    }
    
    // ブレークポイント（相手のサーブゲームでリードしている）
    if (state.currentServer === 'away' && homeScore > awayScore && homeScore >= 4) {
      return 'break_point';
    }
    if (state.currentServer === 'home' && awayScore > homeScore && awayScore >= 4) {
      return 'break_point';
    }
    
    // プレッシャー状況
    if (pressure > 80) {
      return 'pressure';
    }
    
    // 勢いの変化
    if (Math.abs(momentum) > 60) {
      return 'momentum_shift';
    }
    
    // 劣勢・優勢
    const scoreDiff = homeScore - awayScore;
    if (scoreDiff >= 3) {
      return 'leading'; // ホームが優勢
    }
    if (scoreDiff <= -3) {
      return 'behind'; // ホームが劣勢
    }
    
    // サーブ・リターン状況
    if (state.currentServer === 'home') {
      return 'serve';
    } else {
      return 'return';
    }
  }
  
  /**
   * 状況に応じた選択肢を生成
   */
  static generateChoices(
    situation: MatchSituation,
    homePlayer: EnhancedPlayer,
    context: MatchContext,
    state: InteractiveMatchState
  ): MatchChoice[] {
    const choices: MatchChoice[] = [];
    
    // 基本選択肢（常時利用可能）
    choices.push(
      {
        id: 'aggressive',
        label: '積極的に攻める！',
        description: 'サーブ・ボレーを重視した攻撃的な戦術',
        choice: 'aggressive',
        available_situations: ['any'],
        effect: {
          skillModifier: 10,
          mentalEffect: 5,
          staminaEffect: -2,
          criticalRate: 0.1,
          errorRate: 0.05,
          momentumEffect: 10,
          duration: 3,
          description: '攻撃力アップ、ミス率も少し上昇'
        }
      },
      {
        id: 'defensive',
        label: '守備を固める',
        description: 'リターン・ストロークを重視した守備的な戦術',
        choice: 'defensive',
        available_situations: ['any'],
        effect: {
          skillModifier: 5,
          mentalEffect: 10,
          staminaEffect: 1,
          criticalRate: 0.02,
          errorRate: -0.03,
          momentumEffect: -5,
          duration: 4,
          description: '安定性アップ、攻撃力は少し低下'
        }
      },
      {
        id: 'maintain',
        label: '現状維持',
        description: '今の調子を維持する',
        choice: 'maintain',
        available_situations: ['any'],
        effect: {
          skillModifier: 0,
          mentalEffect: 2,
          staminaEffect: 0,
          criticalRate: 0,
          errorRate: 0,
          momentumEffect: 0,
          duration: 2,
          description: '現在の状態を保持'
        }
      }
    );
    
    // 状況特化選択肢
    switch (situation) {
      case 'serve':
        choices.push({
          id: 'power_serve',
          label: 'パワーサーブ！',
          description: 'リスクを承知で強烈なサーブを打つ',
          choice: 'special_move',
          available_situations: ['serve'],
          effect: {
            skillModifier: 20,
            mentalEffect: 0,
            staminaEffect: -3,
            criticalRate: 0.2,
            errorRate: 0.1,
            momentumEffect: 15,
            duration: 1,
            description: 'サーブ威力大幅アップ、ミス率上昇'
          },
          stamina_cost: 5
        });
        break;
        
      case 'return':
        choices.push({
          id: 'counter_attack',
          label: 'カウンター攻撃！',
          description: '相手のサーブを積極的に攻撃する',
          choice: 'special_move',
          available_situations: ['return'],
          effect: {
            skillModifier: 15,
            mentalEffect: 5,
            staminaEffect: -2,
            criticalRate: 0.15,
            errorRate: 0.08,
            momentumEffect: 12,
            duration: 1,
            description: 'リターン攻撃力アップ'
          },
          stamina_cost: 3
        });
        break;
        
      case 'pressure':
        choices.push({
          id: 'calm_down',
          label: '深呼吸して落ち着く',
          description: 'プレッシャーに負けず冷静になる',
          choice: 'calm_down',
          available_situations: ['pressure'],
          effect: {
            skillModifier: 0,
            mentalEffect: 20,
            staminaEffect: 2,
            criticalRate: 0,
            errorRate: -0.15,
            momentumEffect: 0,
            duration: 5,
            description: 'プレッシャー軽減、ミス率大幅減少'
          }
        });
        break;
        
      case 'break_point':
      case 'set_point':
      case 'match_point':
        choices.push({
          id: 'clutch_performance',
          label: '勝負を決める！',
          description: '重要な場面で実力を発揮する',
          choice: 'special_move',
          available_situations: ['break_point', 'set_point', 'match_point'],
          effect: {
            skillModifier: 25,
            mentalEffect: 15,
            staminaEffect: -5,
            criticalRate: 0.3,
            errorRate: 0.05,
            momentumEffect: 20,
            duration: 1,
            description: '重要な場面での大幅能力向上'
          },
          stamina_cost: 8
        });
        break;
        
      case 'behind':
        choices.push({
          id: 'comeback_spirit',
          label: '逆転を狙う！',
          description: '諦めずに逆転を目指す',
          choice: 'encourage',
          available_situations: ['behind'],
          effect: {
            skillModifier: 15,
            mentalEffect: 25,
            staminaEffect: 0,
            criticalRate: 0.1,
            errorRate: -0.05,
            momentumEffect: 25,
            duration: 5,
            description: '劣勢時の精神力向上'
          }
        });
        break;
        
      case 'momentum_shift':
        choices.push({
          id: 'ride_momentum',
          label: '流れに乗る！',
          description: '勢いを活かして攻撃する',
          choice: 'aggressive',
          available_situations: ['momentum_shift'],
          effect: {
            skillModifier: 12,
            mentalEffect: 10,
            staminaEffect: -1,
            criticalRate: 0.12,
            errorRate: 0.03,
            momentumEffect: 15,
            duration: 3,
            description: '勢いを活かした能力向上'
          }
        });
        break;
    }
    
    // タイムアウト（スタミナ回復）
    if ((homePlayer.current_stamina || 100) < 50) {
      choices.push({
        id: 'timeout',
        label: 'タイムアウト',
        description: 'スタミナを回復し、作戦を練り直す',
        choice: 'timeout',
        available_situations: ['any'],
        effect: {
          skillModifier: 0,
          mentalEffect: 10,
          staminaEffect: 20,
          criticalRate: 0,
          errorRate: -0.05,
          momentumEffect: 0,
          duration: 1,
          description: 'スタミナ回復、ミス率減少'
        },
        cooldown: 3
      });
    }
    
    return choices;
  }
  
  // ===== 選択効果システム =====
  
  /**
   * ユーザー選択を実行
   */
  static executeChoice(
    choice: MatchChoice,
    homePlayer: EnhancedPlayer,
    context: MatchContext,
    state: InteractiveMatchState
  ): { success: boolean; event?: MatchEvent; effectApplied: InstructionEffect } {
    // スタミナコストをチェック
    if (choice.stamina_cost && (homePlayer.current_stamina || 100) < choice.stamina_cost) {
      return {
        success: false,
        event: {
          id: `stamina_insufficient_${Date.now()}`,
          type: 'user_choice',
          player: 'home',
          description: `${homePlayer.pokemon_name}はスタミナが足りない！`,
          timestamp: Date.now()
        },
        effectApplied: choice.effect
      };
    }
    
    // スタミナを消費
    if (choice.stamina_cost) {
      homePlayer.current_stamina = Math.max(0, (homePlayer.current_stamina || 100) - choice.stamina_cost);
    }
    
    // 効果を適用
    const effect = choice.effect;
    
    // 勢いを調整
    state.momentum = Math.max(-100, Math.min(100, state.momentum + effect.momentumEffect));
    
    // プレッシャーを調整（メンタル効果で軽減）
    if (effect.mentalEffect > 0) {
      context.pressure_level = Math.max(0, context.pressure_level - effect.mentalEffect);
    }
    
    // 選択履歴を更新
    state.lastChoice = choice.choice;
    state.lastChoiceEffect = effect;
    
    // イベント生成
    const event: MatchEvent = {
      id: `choice_${choice.id}_${Date.now()}`,
      type: 'user_choice',
      player: 'home',
      description: this.generateChoiceDescription(choice, homePlayer),
      timestamp: Date.now(),
      data: {
        choice: choice.choice,
        effect: effect
      }
    };
    
    return {
      success: true,
      event,
      effectApplied: effect
    };
  }
  
  /**
   * 選択説明文を生成
   */
  private static generateChoiceDescription(choice: MatchChoice, player: EnhancedPlayer): string {
    const descriptions: Record<string, string[]> = {
      aggressive: [
        `${player.pokemon_name}が積極的な姿勢を見せる！`,
        `${player.pokemon_name}の攻撃的な戦術が光る！`,
        `${player.pokemon_name}がアグレッシブに行く！`
      ],
      defensive: [
        `${player.pokemon_name}が守備を固める！`,
        `${player.pokemon_name}が慎重な戦術を選択！`,
        `${player.pokemon_name}が安定したプレーを心がける！`
      ],
      maintain: [
        `${player.pokemon_name}が現在の調子を維持！`,
        `${player.pokemon_name}がペースを保つ！`,
        `${player.pokemon_name}が冷静に状況を見る！`
      ],
      special_move: [
        `${player.pokemon_name}が特別な技を繰り出す！`,
        `${player.pokemon_name}の必殺技が炸裂！`,
        `${player.pokemon_name}が渾身の一撃を放つ！`
      ],
      encourage: [
        `${player.pokemon_name}が自分を鼓舞する！`,
        `${player.pokemon_name}の闘志が燃え上がる！`,
        `${player.pokemon_name}が諦めない心を見せる！`
      ],
      calm_down: [
        `${player.pokemon_name}が冷静さを取り戻す！`,
        `${player.pokemon_name}が深呼吸して集中！`,
        `${player.pokemon_name}が心を落ち着ける！`
      ],
      timeout: [
        `${player.pokemon_name}がタイムアウトを取る！`,
        `${player.pokemon_name}が戦術を練り直す！`,
        `${player.pokemon_name}が体力を回復する！`
      ]
    };
    
    const choiceDescriptions = descriptions[choice.choice] || descriptions.maintain;
    return choiceDescriptions[Math.floor(Math.random() * choiceDescriptions.length)];
  }
  
  // ===== 勢い・プレッシャーシステム =====
  
  /**
   * 勢いを更新
   */
  static updateMomentum(
    state: InteractiveMatchState,
    pointWinner: 'home' | 'away',
    pointType: 'serve' | 'return' | 'volley' | 'stroke' | 'mental',
    isCritical: boolean,
    isError: boolean
  ): void {
    let momentumChange = 0;
    
    // 基本勢い変化
    if (pointWinner === 'home') {
      momentumChange = 5;
    } else {
      momentumChange = -5;
    }
    
    // ポイントタイプによる追加変化
    if (pointType === 'serve' && pointWinner === 'home') {
      momentumChange += 2; // 自分のサーブで取ると勢いアップ
    }
    if (pointType === 'return' && pointWinner === 'home') {
      momentumChange += 3; // 相手のサーブを破ると大きく勢いアップ
    }
    
    // クリティカル・エラーによる影響
    if (isCritical) {
      momentumChange += pointWinner === 'home' ? 8 : -8;
    }
    if (isError) {
      momentumChange += pointWinner === 'home' ? -3 : 3;
    }
    
    // 勢いを更新（-100〜100の範囲）
    state.momentum = Math.max(-100, Math.min(100, state.momentum + momentumChange));
  }
  
  /**
   * プレッシャーを更新
   */
  static updatePressure(
    context: MatchContext,
    situation: MatchSituation,
    scoreDifference: number
  ): void {
    let pressureChange = 0;
    
    // 状況によるプレッシャー変化
    switch (situation) {
      case 'match_point':
        pressureChange = 30;
        break;
      case 'set_point':
        pressureChange = 20;
        break;
      case 'break_point':
        pressureChange = 15;
        break;
      case 'pressure':
        pressureChange = 5;
        break;
      case 'behind':
        pressureChange = 10;
        break;
      case 'leading':
        pressureChange = -5;
        break;
    }
    
    // スコア差による影響
    if (Math.abs(scoreDifference) > 3) {
      pressureChange += Math.abs(scoreDifference) * 2;
    }
    
    // プレッシャーを更新（0〜100の範囲）
    context.pressure_level = Math.max(0, Math.min(100, context.pressure_level + pressureChange));
  }
  
  // ===== AI判断システム（CPU選択）=====
  
  /**
   * CPUプレイヤーの選択を自動決定
   */
  static decideCPUChoice(
    situation: MatchSituation,
    awayPlayer: EnhancedPlayer,
    context: MatchContext,
    state: InteractiveMatchState
  ): UserChoice {
    const personality = awayPlayer.ai_personality || 'balanced';
    const staminaPercent = (awayPlayer.current_stamina || 100);
    const momentum = state.momentum; // 負の値でaway有利
    
    // スタミナが低い場合は守備的に
    if (staminaPercent < 30) {
      return Math.random() < 0.7 ? 'defensive' : 'calm_down';
    }
    
    // 状況による判断
    switch (situation) {
      case 'match_point':
      case 'set_point':
      case 'break_point':
        // 重要な場面では特殊技か冷静さ
        return Math.random() < 0.6 ? 'special_move' : 'calm_down';
        
      case 'pressure':
        return Math.random() < 0.8 ? 'calm_down' : 'defensive';
        
      case 'behind':
        return Math.random() < 0.7 ? 'aggressive' : 'encourage';
        
      case 'leading':
        return Math.random() < 0.6 ? 'maintain' : 'defensive';
    }
    
    // 性格による基本判断
    switch (personality) {
      case 'aggressive':
        if (Math.random() < 0.6) return 'aggressive';
        if (Math.random() < 0.3) return 'special_move';
        return 'maintain';
        
      case 'defensive':
        if (Math.random() < 0.6) return 'defensive';
        if (Math.random() < 0.3) return 'calm_down';
        return 'maintain';
        
      case 'unpredictable':
        const choices: UserChoice[] = ['aggressive', 'defensive', 'maintain', 'special_move'];
        return choices[Math.floor(Math.random() * choices.length)];
        
      default: // balanced
        if (momentum < -20) return 'aggressive'; // away不利なら攻撃
        if (momentum > 20) return 'defensive';   // away有利なら守備
        return 'maintain';
    }
  }
}