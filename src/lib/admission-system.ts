import { Player } from '@/types/game';
import { PokemonAPI } from './pokemon-api';
import { PlayerGenerator } from './player-generator';

// 入学システム - 4月の入学式のみ新部員が入学
export class AdmissionSystem {
  // 評判に基づく入部者数計算
  static calculateNewMembers(schoolReputation: number, currentYear: number): number {
    // 1年目は固定の初期メンバーのみ（入学式なし）
    if (currentYear === 1) return 0;
    
    // 2年目以降は評判に基づいて入部者数を決定
    const baseMembers = 2; // 基本の入部者数
    const reputationBonus = Math.floor(schoolReputation / 20); // 評判20につき+1人
    const randomFactor = Math.random() < 0.3 ? 1 : 0; // 30%の確率で+1人
    
    return Math.max(baseMembers + reputationBonus + randomFactor, 1);
  }

  // 入部者の質計算（評判が高いほど優秀な選手が入部）
  static calculateMemberQuality(schoolReputation: number): {
    averageLevel: number;
    highTalentChance: number;
    shinyChance: number;
  } {
    const baseLevel = 1;
    const levelBonus = Math.floor(schoolReputation / 50); // 評判50につきレベル+1
    
    return {
      averageLevel: Math.min(baseLevel + levelBonus, 5), // 最大レベル5で入学
      highTalentChance: Math.min(schoolReputation / 100, 0.3), // 最大30%で高才能
      shinyChance: Math.min(schoolReputation / 1000, 0.1) // 最大10%で色違い
    };
  }

  // 4月入学イベント用の新入部員生成
  static async generateNewMembers(
    schoolReputation: number, 
    currentYear: number
  ): Promise<Player[]> {
    const memberCount = this.calculateNewMembers(schoolReputation, currentYear);
    const quality = this.calculateMemberQuality(schoolReputation);
    
    const newMembers: Player[] = [];
    const availablePokemon = PokemonAPI.getStarterPokemons();
    
    for (let i = 0; i < memberCount; i++) {
      // ランダムにポケモンを選択
      const randomPokemon = availablePokemon[Math.floor(Math.random() * availablePokemon.length)];
      
      try {
        // ポケモン詳細を取得
        const pokemonDetail = await PokemonAPI.getPokemonDetails(randomPokemon);
        
        // 新入部員を生成
        const newMember = PlayerGenerator.createPlayerFromPokemonDetail(
          pokemonDetail,
          'member' // 全員部員として入部
        );
        
        // 1年生として設定
        newMember.grade = 1;
        
        // 質に基づいてレベル調整
        const levelVariation = Math.floor(Math.random() * 3) - 1; // -1~+1のランダム
        newMember.level = Math.max(1, quality.averageLevel + levelVariation);
        
        // 高才能判定
        if (Math.random() < quality.highTalentChance) {
          // 能力値を20%向上
          newMember.serve_skill = Math.min(100, Math.floor(newMember.serve_skill * 1.2));
          newMember.return_skill = Math.min(100, Math.floor(newMember.return_skill * 1.2));
          newMember.volley_skill = Math.min(100, Math.floor(newMember.volley_skill * 1.2));
          newMember.stroke_skill = Math.min(100, Math.floor(newMember.stroke_skill * 1.2));
          newMember.condition = 'excellent';
        }
        
        // 色違い判定（ゲーム内では特別な表示用）
        if (Math.random() < quality.shinyChance) {
          if (newMember.pokemon_stats) {
            newMember.pokemon_stats.is_shiny = true;
          }
        }
        
        newMembers.push(newMember);
      } catch (error) {
        console.error(`Failed to generate new member with ${randomPokemon}:`, error);
        // エラー時はフォールバック
        const fallbackMember = PlayerGenerator.createFallbackPlayer(
          randomPokemon, 
          Math.floor(Math.random() * 151) + 1, 
          'member'
        );
        fallbackMember.grade = 1;
        newMembers.push(fallbackMember);
      }
    }
    
    return newMembers;
  }

  // 入学式イベントのメッセージ生成
  static generateAdmissionMessage(
    newMembers: Player[], 
    schoolReputation: number
  ): string {
    const memberNames = newMembers.map(m => m.pokemon_name).join('、');
    
    if (newMembers.length === 0) {
      return "今年は新入部員がいませんでした。既存の部員でがんばりましょう。";
    }
    
    let message = `🌸 入学式 🌸\n\n新入部員が${newMembers.length}人入部しました！\n\n`;
    message += `新入部員: ${memberNames}\n\n`;
    
    if (schoolReputation >= 100) {
      message += "学校の評判が高く、優秀な新入部員が集まりました！";
    } else if (schoolReputation >= 50) {
      message += "そこそこの評判で、まずまずの新入部員が入部しました。";
    } else {
      message += "まだ評判が低いですが、やる気のある新入部員が入部しました。";
    }
    
    message += "\n\n新しい仲間と共に、全国制覇を目指しましょう！";
    
    return message;
  }

  // 卒業システム（3年生の卒業処理）
  static processGraduation(players: Player[]): {
    graduatedPlayers: Player[];
    remainingPlayers: Player[];
    promotedPlayers: Player[];
  } {
    const graduated = players.filter(p => p.grade === 3);
    const remaining = players.filter(p => p.grade < 3);
    
    // 学年を1つ上げる
    const promoted = remaining.map(p => ({
      ...p,
      grade: (p.grade + 1) as 1 | 2 | 3
    }));
    
    // ポジション再編（部長・副部長の選出）
    this.reassignPositions(promoted);
    
    return {
      graduatedPlayers: graduated,
      remainingPlayers: promoted,
      promotedPlayers: promoted.filter(p => 
        p.grade === 3 || 
        ['captain', 'vice_captain'].includes(p.position)
      )
    };
  }

  // ポジション再編（3年生から新部長・副部長を選出）
  private static reassignPositions(players: Player[]): void {
    // 全員をmemberにリセット
    players.forEach(p => p.position = 'member');
    
    // 3年生のみから部長・副部長を選出
    const seniors = players.filter(p => p.grade === 3);
    if (seniors.length === 0) return;
    
    // 能力順でソート（総合力で判定）
    seniors.sort((a, b) => {
      const totalA = a.serve_skill + a.return_skill + a.volley_skill + a.stroke_skill + a.mental;
      const totalB = b.serve_skill + b.return_skill + b.volley_skill + b.stroke_skill + b.mental;
      return totalB - totalA;
    });
    
    // 最も能力の高い3年生を部長に
    seniors[0].position = 'captain';
    
    // 2番目に能力の高い3年生を副部長に（いれば）
    if (seniors.length > 1) {
      seniors[1].position = 'vice_captain';
    }
    
    // 残りの有力選手をレギュラーに昇格
    const allPlayers = [...players].sort((a, b) => {
      const totalA = a.serve_skill + a.return_skill + a.volley_skill + a.stroke_skill;
      const totalB = b.serve_skill + b.return_skill + b.volley_skill + b.stroke_skill;
      return totalB - totalA;
    });
    
    // 上位5人をレギュラーに（部長・副部長含む）
    let regularCount = 0;
    allPlayers.forEach(p => {
      if (regularCount < 5 && (p.position === 'captain' || p.position === 'vice_captain' || p.position === 'member')) {
        if (p.position === 'member') {
          p.position = 'regular';
        }
        regularCount++;
      }
    });
  }

  // 年次イベント判定（4月1日に実行）
  static shouldTriggerAdmission(currentDate: { year: number; month: number; day: number }): boolean {
    return currentDate.month === 4 && currentDate.day === 1;
  }

  // 卒業イベント判定（3月31日に実行）
  static shouldTriggerGraduation(currentDate: { year: number; month: number; day: number }): boolean {
    return currentDate.month === 3 && currentDate.day === 31;
  }
}

// イベントメッセージ用のユーティリティ
export const AdmissionMessages = {
  // 新入部員紹介メッセージ
  memberIntroduction: (player: Player): string => {
    const types = player.types?.join('・') || 'ノーマル';
    return `${player.pokemon_name}（${types}タイプ）が入部しました！\n` +
           `レベル: ${player.level} | コンディション: ${player.condition}`;
  },

  // 卒業メッセージ
  graduationMessage: (players: Player[]): string => {
    if (players.length === 0) return '';
    
    const names = players.map(p => p.pokemon_name).join('、');
    return `🎓 卒業おめでとう 🎓\n\n${names} が卒業しました。\n\n` +
           "長い間お疲れさまでした。あなたたちの頑張りは後輩たちに受け継がれるでしょう。";
  },

  // ポジション変更メッセージ
  positionChangeMessage: (player: Player, oldPosition: string): string => {
    const positions = {
      'captain': '部長',
      'vice_captain': '副部長', 
      'regular': 'レギュラー',
      'member': '部員'
    };
    
    const oldPos = positions[oldPosition as keyof typeof positions];
    const newPos = positions[player.position];
    
    return `${player.pokemon_name} が ${oldPos} から ${newPos} に昇格しました！`;
  }
};