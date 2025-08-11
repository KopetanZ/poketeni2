'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Player } from '@/types/game';
import { PokemonAPI, pokemonUtils } from '@/lib/pokemon-api';
import SpecialAbilityDisplay from './SpecialAbilityDisplay';

interface PokemonCardProps {
  player: Player;
  onClick?: () => void;
  showStats?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export const PokemonCard: React.FC<PokemonCardProps> = ({ 
  player, 
  onClick, 
  showStats = true,
  size = 'medium'
}) => {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [pokemonTypes, setPokemonTypes] = useState<string[]>(['normal']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // サイズ設定
  const sizeClasses = {
    small: 'w-24 h-32',
    medium: 'w-32 h-40',
    large: 'w-48 h-60'
  };

  const imageSizes = {
    small: 64,
    medium: 96,
    large: 128
  };

  useEffect(() => {
    const loadPokemonData = async () => {
      try {
        setLoading(true);
        setError(false);
        
        const details = await PokemonAPI.getPokemonDetails(player.pokemon_name);
        
        // 最適な画像URLを取得
        const bestImageUrl = PokemonAPI.getBestImageUrl(details.sprites, true);
        setImageUrl(bestImageUrl);
        setPokemonTypes(details.types);
        
      } catch (err) {
        console.error(`Failed to load Pokemon data for ${player.pokemon_name}:`, err);
        setError(true);
        setImageUrl('/pokemon-fallback.svg');
        setPokemonTypes(['normal']);
      } finally {
        setLoading(false);
      }
    };

    if (player.pokemon_name) {
      loadPokemonData();
    }
  }, [player.pokemon_name]);

  // コンディション表示用の色
  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'normal': return 'text-gray-600';
      case 'poor': return 'text-orange-600';
      case 'terrible': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  // ポジション表示用のアイコン
  const getPositionIcon = (position: string) => {
    switch (position) {
      case 'captain': return '👑';
      case 'vice_captain': return '⭐';
      case 'regular': return '🎾';
      case 'member': return '📝';
      default: return '📝';
    }
  };

  // 背景グラデーション
  const backgroundGradient = pokemonUtils.getTypeGradient(pokemonTypes);

  return (
    <div
      className={`
        ${sizeClasses[size]} 
        rounded-lg shadow-md overflow-hidden cursor-pointer transform transition-all duration-200
        hover:scale-105 hover:shadow-lg
        ${onClick ? 'cursor-pointer' : 'cursor-default'}
      `}
      style={{ background: backgroundGradient }}
      onClick={onClick}
    >
      {/* ヘッダー：ポジションと名前 */}
      <div className="p-2 bg-black bg-opacity-20 text-white text-center">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs opacity-75">Lv.{player.level}</span>
          <span className="text-sm">{getPositionIcon(player.position)}</span>
        </div>
        <h3 className="text-sm font-bold truncate">
          {player.pokemon_name}
        </h3>
      </div>

      {/* ポケモン画像 */}
      <div className="flex-1 flex items-center justify-center p-2 bg-white bg-opacity-10">
        {loading ? (
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        ) : error ? (
          <div className="text-white text-center">
            <div className="text-2xl mb-1">❓</div>
            <div className="text-xs">エラー</div>
          </div>
        ) : (
          <Image
            src={imageUrl}
            alt={player.pokemon_name}
            width={imageSizes[size]}
            height={imageSizes[size]}
            className="object-contain"
            onError={() => setError(true)}
            unoptimized // PokeAPIの画像は外部ソースなため
          />
        )}
      </div>

      {/* 統計情報（オプション） */}
      {showStats && (
        <div className="p-2 bg-black bg-opacity-30 text-white text-xs space-y-1">
          {/* コンディション */}
          <div className="flex justify-between">
            <span>状態:</span>
            <span className={getConditionColor(player.condition)}>
              {player.condition}
            </span>
          </div>
          
          {/* 主要ステータス（size に応じて表示量を調整） */}
          {size !== 'small' && (
            <>
              <div className="flex justify-between">
                <span>サーブ:</span>
                <span>{player.serve_skill}</span>
              </div>
              <div className="flex justify-between">
                <span>ストローク:</span>
                <span>{player.stroke_skill}</span>
              </div>
            </>
          )}
          
          {size === 'large' && (
            <>
              <div className="flex justify-between">
                <span>リターン:</span>
                <span>{player.return_skill}</span>
              </div>
              <div className="flex justify-between">
                <span>ボレー:</span>
                <span>{player.volley_skill}</span>
              </div>
              <div className="flex justify-between">
                <span>メンタル:</span>
                <span>{player.mental}</span>
              </div>
              <div className="flex justify-between">
                <span>体力:</span>
                <span>{player.stamina}</span>
              </div>
            </>
          )}

          {/* 特殊能力表示 */}
          {player.special_abilities && player.special_abilities.length > 0 && (
            <div className="mt-2 pt-2 border-t border-white border-opacity-30">
              <SpecialAbilityDisplay 
                abilities={player.special_abilities}
                showDescription={false}
                size="small"
                layout="horizontal"
              />
            </div>
          )}
        </div>
      )}

      {/* タイプ表示 */}
      <div className="p-1 bg-black bg-opacity-20 flex gap-1 justify-center">
        {pokemonTypes.slice(0, 2).map(type => (
          <span 
            key={type}
            className="px-1 py-0.5 text-xs rounded text-white font-bold"
            style={{ 
              backgroundColor: PokemonAPI.getTypeColor(type),
              textShadow: '1px 1px 1px rgba(0,0,0,0.5)'
            }}
          >
            {type.toUpperCase()}
          </span>
        ))}
      </div>
    </div>
  );
};

export default PokemonCard;