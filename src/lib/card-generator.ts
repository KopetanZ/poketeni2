import { TrainingCard } from '@/types/training-cards';

// 内部ユーティリティ: 必須フィールドのデフォルト付与
const DEFAULT_RARITY_MULTIPLIERS = {
  common: 1.0,
  uncommon: 1.3,
  rare: 1.7,
  legendary: 2.5
} as const;

type BaseCard = Omit<TrainingCard, 'id' | 'rarityMultipliers' | 'baseSuccessRate' | 'costs'> &
  Partial<Pick<TrainingCard, 'rarityMultipliers' | 'baseSuccessRate' | 'costs'>>;

function withDefaults(card: BaseCard): Omit<TrainingCard, 'id'> {
  const inferredStaminaCost = card.number <= 1 ? 10 : card.number === 2 ? 20 : card.number === 3 ? 30 : 40;
  const baseSuccessRate = card.baseSuccessRate ?? (
    card.rarity === 'common' ? 85 : card.rarity === 'uncommon' ? 80 : card.rarity === 'rare' ? 75 : 70
  );
  return {
    ...card,
    rarityMultipliers: card.rarityMultipliers ?? { ...DEFAULT_RARITY_MULTIPLIERS },
    baseSuccessRate,
    costs: card.costs ?? { stamina: inferredStaminaCost }
  } as Omit<TrainingCard, 'id'>;
}

// カード生成システム
export class CardGenerator {
  // 基本カードデータベース（栄冠ナイン準拠の半月進行）
  // number = すごろくでの移動マス数（半月単位、1年=24マス）
  private static readonly CARD_DATABASE: Omit<TrainingCard, 'id'>[] = [
    // 基本練習カード（1マス = 約2週間）
    {
      name: 'サーブ練習',
      category: 'technical',
      icon: '🎾',
      color: '#059669',
      bgGradient: 'from-green-400 to-green-600',
      number: 1, // 2週間の集中練習
      baseEffects: { skillGrowth: { serve_skill: 15 } },
      description: 'サーブの威力と正確性を向上させる2週間の集中練習',
      rarity: 'common'
    },
    {
      name: 'リターン練習',
      category: 'technical',
      icon: '🎾',
      color: '#059669',
      bgGradient: 'from-green-400 to-green-600',
      number: 1,
      baseEffects: { skillGrowth: { return_skill: 15 } },
      description: '相手のサーブを確実に返球する技術を磨く2週間の練習',
      rarity: 'common'
    },
    {
      name: 'ボレー練習',
      category: 'technical',
      icon: '🎾',
      color: '#059669',
      bgGradient: 'from-green-400 to-green-600',
      number: 1,
      baseEffects: { skillGrowth: { volley_skill: 15 } },
      description: 'ネット前での素早い反応を鍛える2週間の特訓',
      rarity: 'common'
    },
    {
      name: 'ストローク練習',
      category: 'technical',
      icon: '🎾',
      color: '#059669',
      bgGradient: 'from-green-400 to-green-600',
      number: 1,
      baseEffects: { skillGrowth: { stroke_skill: 15 } },
      description: 'フォアハンド・バックハンドの基本を2週間で強化',
      rarity: 'common'
    },
    {
      name: 'メンタル強化',
      category: 'mental',
      icon: '🧠',
      color: '#7C3AED',
      bgGradient: 'from-purple-400 to-indigo-600',
      number: 1,
      baseEffects: { skillGrowth: { mental: 12 } },
      description: '試合での集中力を向上させる2週間のメンタルトレーニング',
      rarity: 'common'
    },
    {
      name: '体力作り',
      category: 'physical',
      icon: '🏃',
      color: '#2563EB',
      bgGradient: 'from-blue-400 to-blue-600',
      number: 1,
      baseEffects: { skillGrowth: { stamina: 18 } },
      description: '持久力と体力を向上させる2週間のフィジカル強化',
      rarity: 'common'
    },
    // 中期練習カード（2マス = 約1ヶ月）
    {
      name: '総合練習',
      category: 'technical',
      icon: '📊',
      color: '#059669',
      bgGradient: 'from-emerald-400 to-teal-600',
      number: 2,
      baseEffects: { skillGrowth: { serve_skill: 8, return_skill: 8, volley_skill: 8, stroke_skill: 8 } },
      description: '全ての技術をバランスよく向上させる1ヶ月の総合練習',
      rarity: 'uncommon'
    },
    {
      name: '強化合宿',
      category: 'physical',
      icon: '💪',
      color: '#7C2D12',
      bgGradient: 'from-orange-500 to-red-600',
      number: 2,
      baseEffects: { skillGrowth: { serve_skill: 12, return_skill: 12, volley_skill: 12, stroke_skill: 12, mental: 10, stamina: 10 } },
      description: '1ヶ月の集中合宿で全能力を大幅アップ',
      rarity: 'rare'
    },
    // 特殊カード
    {
      name: '休養・調整',
      category: 'special',
      icon: '🛌',
      color: '#6B7280',
      bgGradient: 'from-slate-400 to-slate-600',
      number: 1,
      baseEffects: { statusChanges: { condition: 20 } },
      description: '2週間の休養でコンディションを回復',
      rarity: 'common'
    },
    {
      name: 'プロ指導',
      category: 'special',
      icon: '🏅',
      color: '#DC2626',
      bgGradient: 'from-red-500 to-orange-600',
      number: 2,
      baseEffects: { skillGrowth: { serve_skill: 20, return_skill: 20, volley_skill: 20, stroke_skill: 20 } },
      description: 'プロ選手による1ヶ月の個人指導',
      rarity: 'rare'
    },
    // 長期特訓カード（3マス = 約1.5ヶ月）
    {
      name: '海外遠征',
      category: 'special',
      icon: '✈️',
      color: '#DC2626',
      bgGradient: 'from-yellow-400 via-red-500 to-pink-600',
      number: 3,
      baseEffects: { skillGrowth: { serve_skill: 15, return_skill: 15, volley_skill: 15, stroke_skill: 15, mental: 20 } },
      description: '1.5ヶ月の海外遠征で世界レベルの技術を習得',
      rarity: 'legendary'
    }
  ].map(withDefaults);

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