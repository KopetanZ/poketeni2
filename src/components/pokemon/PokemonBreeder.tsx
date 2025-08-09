'use client';

import { PokemonStats } from '@/types/pokemon-stats';

interface PokemonBreederProps {
  onClose: () => void;
  onSelectPokemon: (pokemon: PokemonStats) => void;
}

export default function PokemonBreeder({ onClose }: PokemonBreederProps) {
  // 育て屋は現在ロック中
  const isLocked = true;
  
  if (isLocked) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl text-center">
          <div className="mb-6">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">育て屋</h2>
            <div className="text-lg text-gray-600 mb-4">機能ロック中</div>
            <div className="text-sm text-gray-500 mb-6">
              部員の入学は4月の入学式の時だけです。<br/>
              現在は既存の部員の育成に集中しましょう。
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="text-yellow-800 text-sm">
                <div className="font-semibold mb-2">🌸 解放予定</div>
                <ul className="text-left space-y-1">
                  <li>• 4月の入学式イベント</li>
                  <li>• 学校の評判が一定レベル以上</li>
                  <li>• 2年目以降のストーリー進行</li>
                </ul>
              </div>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="mt-6 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-semibold"
          >
            閉じる
          </button>
        </div>
      </div>
    );
  }
  
  return null; // 現在はロック状態のみ
}