'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  getRecruitablePokemon, 
  getPokemonDetails, 
  recruitNewMember,
  PokemonMember 
} from '@/lib/recruitment-system';
import { 
  convertStatsToTennisSkills, 
  formatSkillDisplay,
  generateTacticalAdvice 
} from '@/lib/stats-conversion';

// Supabase設定
const supabaseUrl = 'https://oijhrdkbttuitkiwbigg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pamhyZGtidHR1aXRraXdiaWdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMjIxMzEsImV4cCI6MjA2OTg5ODEzMX0.rDLwO_lA7tmgDUWaFvxF3Lnp3zSEUH4J_98hAwPDECs';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface PokemonMasterData {
  pokemon_id: number;
  japanese_name: string;
  english_name: string;
  types: string[];
  base_stats: any;
  sprite_urls: any;
  rarity_level: string;
  generation: number;
  is_recruitable: boolean;
}

export default function RecruitmentInterface() {
  const [recruitablePokemon, setRecruitablePokemon] = useState<PokemonMasterData[]>([]);
  const [selectedPokemon, setSelectedPokemon] = useState<PokemonMasterData | null>(null);
  const [pokemonDetails, setPokemonDetails] = useState<any>(null);
  const [predictedSkills, setPredictedSkills] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [rarityFilter, setRarityFilter] = useState<string>('all');
  const [generationFilter, setGenerationFilter] = useState<number>(0);
  const [recruitmentResult, setRecruitmentResult] = useState<any>(null);

  // 配属可能ポケモン一覧取得
  useEffect(() => {
    loadRecruitablePokemon();
  }, []);

  const loadRecruitablePokemon = async () => {
    try {
      setLoading(true);
      const result = await getRecruitablePokemon(supabase);
      if (result.success) {
        setRecruitablePokemon(result.data);
      } else {
        console.error('配属可能ポケモン取得エラー:', result.error);
      }
    } catch (error) {
      console.error('配属可能ポケモン取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  // ポケモン詳細情報取得
  const loadPokemonDetails = async (pokemonId: number) => {
    try {
      setLoading(true);
      const result = await getPokemonDetails(pokemonId, supabase);
      if (result.success) {
        setPokemonDetails(result.data);
        
        // 予想スキル計算
        const baseStats = {
          id: result.data.pokemon_id,
          hp: result.data.base_stats.hp,
          attack: result.data.base_stats.attack,
          defense: result.data.base_stats.defense,
          sp_attack: result.data.base_stats.sp_attack,
          sp_defense: result.data.base_stats.sp_defense,
          speed: result.data.base_stats.speed
        };
        
        const skills = convertStatsToTennisSkills(baseStats, result.data.types);
        setPredictedSkills(skills);
      } else {
        console.error('ポケモン詳細取得エラー:', result.error);
      }
    } catch (error) {
      console.error('ポケモン詳細取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  // 部員配属実行
  const handleRecruitment = async () => {
    if (!selectedPokemon) return;
    
    try {
      setLoading(true);
      const result = await recruitNewMember(selectedPokemon, supabase);
      setRecruitmentResult(result);
      
      if (result.success) {
        // 配属成功時の処理
        console.log('配属成功:', result.member);
        // 必要に応じてページリロードや状態更新
      }
    } catch (error) {
      console.error('配属処理エラー:', error);
      setRecruitmentResult({
        success: false,
        message: `配属処理でエラーが発生しました: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  // フィルタリング
  const filteredPokemon = recruitablePokemon.filter(pokemon => {
    const matchesSearch = pokemon.japanese_name.includes(searchTerm) || 
                         pokemon.english_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRarity = rarityFilter === 'all' || pokemon.rarity_level === rarityFilter;
    const matchesGeneration = generationFilter === 0 || pokemon.generation === generationFilter;
    
    return matchesSearch && matchesRarity && matchesGeneration;
  });

  // レアリティ表示用
  const getRarityDisplay = (rarity: string) => {
    const rarityConfig = {
      common: { label: 'コモン', color: 'text-gray-600', bgColor: 'bg-gray-100' },
      uncommon: { label: 'アンコモン', color: 'text-green-600', bgColor: 'bg-green-100' },
      rare: { label: 'レア', color: 'text-blue-600', bgColor: 'bg-blue-100' },
      epic: { label: 'エピック', color: 'text-purple-600', bgColor: 'bg-purple-100' },
      legendary: { label: 'レジェンダリー', color: 'text-yellow-600', bgColor: 'bg-yellow-100' }
    };
    
    return rarityConfig[rarity as keyof typeof rarityConfig] || rarityConfig.common;
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-8">部員配属システム</h1>
      
      {/* フィルター */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">検索</label>
            <input
              type="text"
              placeholder="ポケモン名で検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">レアリティ</label>
            <select
              value={rarityFilter}
              onChange={(e) => setRarityFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">すべて</option>
              <option value="common">コモン</option>
              <option value="uncommon">アンコモン</option>
              <option value="rare">レア</option>
              <option value="epic">エピック</option>
              <option value="legendary">レジェンダリー</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">世代</label>
            <select
              value={generationFilter}
              onChange={(e) => setGenerationFilter(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={0}>すべて</option>
              <option value={1}>第1世代</option>
              <option value={2}>第2世代</option>
              <option value={3}>第3世代</option>
              <option value={4}>第4世代</option>
              <option value={5}>第5世代</option>
              <option value={6}>第6世代</option>
              <option value={7}>第7世代</option>
              <option value={8}>第8世代</option>
              <option value={9}>第9世代</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={loadRecruitablePokemon}
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? '更新中...' : '更新'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 配属可能ポケモン一覧 */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">配属可能ポケモン ({filteredPokemon.length}種)</h2>
            </div>
            
            {loading ? (
              <div className="p-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">読み込み中...</p>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto">
                {filteredPokemon.map((pokemon) => {
                  const rarity = getRarityDisplay(pokemon.rarity_level);
                  
                  return (
                    <div
                      key={pokemon.pokemon_id}
                      onClick={() => {
                        setSelectedPokemon(pokemon);
                        loadPokemonDetails(pokemon.pokemon_id);
                      }}
                      className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedPokemon?.pokemon_id === pokemon.pokemon_id ? 'bg-blue-50 border-blue-200' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <img
                          src={pokemon.sprite_urls.default}
                          alt={pokemon.japanese_name}
                          className="w-16 h-16 object-contain"
                        />
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold text-lg">{pokemon.japanese_name}</h3>
                            <span className="text-sm text-gray-500">({pokemon.english_name})</span>
                            <span className={`px-2 py-1 text-xs rounded-full ${rarity.color} ${rarity.bgColor}`}>
                              {rarity.label}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">第{pokemon.generation}世代</span>
                            <div className="flex space-x-1">
                              {pokemon.types.map((type) => (
                                <span
                                  key={type}
                                  className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded"
                                >
                                  {type}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* 選択されたポケモンの詳細 */}
        <div className="lg:col-span-1">
          {selectedPokemon && pokemonDetails ? (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">詳細情報</h2>
              
              {/* ポケモン画像 */}
              <div className="text-center mb-4">
                <img
                  src={pokemonDetails.sprite_urls.official || pokemonDetails.sprite_urls.default}
                  alt={pokemonDetails.japanese_name}
                  className="w-32 h-32 object-contain mx-auto"
                />
              </div>
              
              {/* 基本情報 */}
              <div className="mb-4">
                <h3 className="font-semibold mb-2">基本情報</h3>
                <div className="space-y-2 text-sm">
                  <div>名前: {pokemonDetails.japanese_name}</div>
                  <div>英語名: {pokemonDetails.english_name}</div>
                  <div>世代: 第{pokemonDetails.generation}世代</div>
                  <div>レアリティ: {getRarityDisplay(pokemonDetails.rarity_level).label}</div>
                </div>
              </div>
              
              {/* 種族値 */}
              {pokemonDetails.base_stats && (
                <div className="mb-4">
                  <h3 className="font-semibold mb-2">種族値</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>HP: {pokemonDetails.base_stats.hp}</div>
                    <div>攻撃: {pokemonDetails.base_stats.attack}</div>
                    <div>防御: {pokemonDetails.base_stats.defense}</div>
                    <div>特攻: {pokemonDetails.base_stats.sp_attack}</div>
                    <div>特防: {pokemonDetails.base_stats.sp_defense}</div>
                    <div>素早さ: {pokemonDetails.base_stats.speed}</div>
                  </div>
                </div>
              )}
              
              {/* 予想テニススキル */}
              {predictedSkills && (
                <div className="mb-4">
                  <h3 className="font-semibold mb-2">予想テニススキル</h3>
                  <div className="space-y-2">
                    {Object.entries(formatSkillDisplay(predictedSkills)).map(([key, skill]) => (
                      <div key={key} className="flex justify-between items-center">
                        <span className="text-sm">{skill.label}:</span>
                        <span className={`font-semibold ${skill.color}`}>{skill.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* 配属ボタン */}
              <button
                onClick={handleRecruitment}
                disabled={loading}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? '配属中...' : '部員として配属'}
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-center text-gray-500">
                <p>左側のポケモンを選択してください</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 配属結果表示 */}
      {recruitmentResult && (
        <div className={`mt-6 p-4 rounded-lg ${
          recruitmentResult.success 
            ? 'bg-green-100 border border-green-300 text-green-800' 
            : 'bg-red-100 border border-red-300 text-red-800'
        }`}>
          <h3 className="font-semibold mb-2">
            {recruitmentResult.success ? '配属完了' : '配属エラー'}
          </h3>
          <p>{recruitmentResult.message}</p>
          
          {recruitmentResult.success && recruitmentResult.member && (
            <div className="mt-4 p-3 bg-white rounded border">
              <h4 className="font-semibold mb-2">配属された部員の詳細</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>名前: {recruitmentResult.member.pokemon_name}</div>
                <div>レアリティ: {recruitmentResult.member.rarity_level}</div>
                <div>サーブ: {recruitmentResult.member.serve_skill}</div>
                <div>リターン: {recruitmentResult.member.return_skill}</div>
                <div>ボレー: {recruitmentResult.member.volley_skill}</div>
                <div>ストローク: {recruitmentResult.member.stroke_skill}</div>
                <div>メンタル: {recruitmentResult.member.mental}</div>
                <div>スタミナ: {recruitmentResult.member.stamina}</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
