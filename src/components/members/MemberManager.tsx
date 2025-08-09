'use client';

import React, { useState } from 'react';
import { Player } from '@/types/game';
import MemberList from './MemberList';
import MemberDetail from './MemberDetail';

interface MemberManagerProps {
  players: Player[];
  onClose?: () => void;
}

export const MemberManager: React.FC<MemberManagerProps> = ({ 
  players, 
  onClose 
}) => {
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  const handlePlayerSelect = (player: Player) => {
    setSelectedPlayer(player);
  };

  const handleCloseDetail = () => {
    setSelectedPlayer(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* ヘッダー */}
      {onClose && (
        <div className="mb-4">
          <button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
          >
            ← 戻る
          </button>
        </div>
      )}

      {/* メインコンテンツ */}
      {!selectedPlayer ? (
        <MemberList 
          players={players}
          onPlayerSelect={handlePlayerSelect}
        />
      ) : (
        <MemberDetail 
          player={selectedPlayer}
          onClose={handleCloseDetail}
        />
      )}
      
      {/* 統計情報（下部固定） */}
      <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-sm">
        <h3 className="font-bold text-gray-800 mb-2">📈 チーム統計</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="bg-blue-50 p-2 rounded">
            <div className="text-blue-700 font-medium">総部員数</div>
            <div className="text-blue-900 font-bold">{players.length}人</div>
          </div>
          <div className="bg-green-50 p-2 rounded">
            <div className="text-green-700 font-medium">レギュラー</div>
            <div className="text-green-900 font-bold">
              {players.filter(p => p.position === 'captain' || p.position === 'regular').length}人
            </div>
          </div>
          <div className="bg-yellow-50 p-2 rounded">
            <div className="text-yellow-700 font-medium">平均レベル</div>
            <div className="text-yellow-900 font-bold">
              {Math.round(players.reduce((sum, p) => sum + p.level, 0) / players.length || 0)}
            </div>
          </div>
          <div className="bg-purple-50 p-2 rounded">
            <div className="text-purple-700 font-medium">1年生</div>
            <div className="text-purple-900 font-bold">
              {players.filter(p => p.grade === 1).length}人
            </div>
          </div>
        </div>
        
        {/* 追加情報 */}
        <div className="mt-3 text-xs text-gray-600 bg-gray-50 p-2 rounded">
          💡 部員をクリックすると詳細情報が表示されます
        </div>
      </div>
    </div>
  );
};

export default MemberManager;