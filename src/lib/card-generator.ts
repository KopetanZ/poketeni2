import { TrainingCard } from '@/types/game';

// カード生成システム
export class CardGenerator {
  // 基本カードデータベース（栄冠ナイン準拠の半月進行）
  // number = すごろくでの移動マス数（半月単位、1年=24マス）
  private static readonly CARD_DATABASE: Omit<TrainingCard, 'id'>[] = [
    // 基本練習カード（1マス = 約2週間）
    {
      name: 'サーブ練習',
      type: 'training',
      number: 1, // 2週間の集中練習
      trainingEffects: { serve: 15 },
      description: 'サーブの威力と正確性を向上させる2週間の集中練習',
      rarity: 'common'
    },
    {
      name: 'リターン練習',
      type: 'training',
      number: 1,
      trainingEffects: { return: 15 },
      description: '相手のサーブを確実に返球する技術を磨く2週間の練習',
      rarity: 'common'
    },
    {
      name: 'ボレー練習',
      type: 'training',
      number: 1,
      trainingEffects: { volley: 15 },
      description: 'ネット前での素早い反応を鍛える2週間の特訓',
      rarity: 'common'
    },
    {
      name: 'ストローク練習',
      type: 'training',
      number: 1,
      trainingEffects: { stroke: 15 },
      description: 'フォアハンド・バックハンドの基本を2週間で強化',
      rarity: 'common'
    },
    {
      name: 'メンタル強化',
      type: 'training',
      number: 1,
      trainingEffects: { mental: 12 },
      description: '試合での集中力を向上させる2週間のメンタルトレーニング',
      rarity: 'common'
    },
    {
      name: '体力作り',
      type: 'training',
      number: 1,
      trainingEffects: { stamina: 18 },
      description: '持久力と体力を向上させる2週間のフィジカル強化',
      rarity: 'common'
    },
    // 中期練習カード（2マス = 約1ヶ月）
    {
      name: '総合練習',
      type: 'training',
      number: 2,
      trainingEffects: { serve: 8, return: 8, volley: 8, stroke: 8 },
      description: '全ての技術をバランスよく向上させる1ヶ月の総合練習',
      rarity: 'uncommon'
    },
    {
      name: '強化合宿',
      type: 'training',
      number: 2,
      trainingEffects: { serve: 12, return: 12, volley: 12, stroke: 12, mental: 10, stamina: 10 },
      description: '1ヶ月の集中合宿で全能力を大幅アップ',
      rarity: 'rare'
    },
    // 特殊カード
    {
      name: '休養・調整',
      type: 'special',
      number: 1,
      trainingEffects: {},
      specialEffects: { conditionRecovery: 20 },
      description: '2週間の休養でコンディションを回復',
      rarity: 'common'
    },
    {
      name: 'プロ指導',
      type: 'special',
      number: 2,
      trainingEffects: { serve: 20, return: 20, volley: 20, stroke: 20 },
      specialEffects: { trustIncrease: 10 },
      description: 'プロ選手による1ヶ月の個人指導',
      rarity: 'rare'
    },
    // 長期特訓カード（3マス = 約1.5ヶ月）
    {
      name: '海外遠征',
      type: 'special',
      number: 3,
      trainingEffects: { serve: 15, return: 15, volley: 15, stroke: 15, mental: 20 },
      specialEffects: { practiceEfficiencyBoost: 30, trustIncrease: 15 },
      description: '1.5ヶ月の海外遠征で世界レベルの技術を習得',
      rarity: 'legendary'
    }
  ];

  // カード生成
  static generateCard(): TrainingCard {
    const randomCard = this.CARD_DATABASE[Math.floor(Math.random() * this.CARD_DATABASE.length)];
    return {
      ...randomCard,
      id: this.generateCardId()
    };
  }

  // 手札生成
  static generateHand(count: number = 5): TrainingCard[] {
    const cards: TrainingCard[] = [];
    for (let i = 0; i < count; i++) {
      cards.push(this.generateCard());
    }
    return cards;
  }

  // ユニークID生成
  private static generateCardId(): string {
    return `card_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}