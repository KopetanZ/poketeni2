'use client';

import React, { useState, useEffect } from 'react';
import { RivalSchool, SchoolRank, TacticType } from '../../types/rival-schools';
import { RivalSchoolManager } from '../../lib/rival-school-manager';

interface RivalSchoolListProps {
  onSchoolSelect?: (school: RivalSchool) => void;
  showFilters?: boolean;
}

export const RivalSchoolList: React.FC<RivalSchoolListProps> = ({ 
  onSchoolSelect, 
  showFilters = true 
}) => {
  const [schools, setSchools] = useState<RivalSchool[]>([]);
  const [filteredSchools, setFilteredSchools] = useState<RivalSchool[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [selectedRank, setSelectedRank] = useState<SchoolRank | ''>('');
  const [selectedType, setSelectedType] = useState<string>('');

  const manager = new RivalSchoolManager();

  useEffect(() => {
    initializeSchools();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [schools, searchQuery, selectedRegion, selectedRank, selectedType]);

  const initializeSchools = async () => {
    try {
      await manager.initialize();
      const allSchools = manager.getAllSchools();
      setSchools(allSchools);
      setFilteredSchools(allSchools);
    } catch (error) {
      console.error('ライバル校の初期化に失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...schools];

    // 検索クエリ
    if (searchQuery) {
      filtered = filtered.filter(school =>
        school.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        school.prefecture.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // 地方フィルター
    if (selectedRegion) {
      filtered = filtered.filter(school => school.region === selectedRegion);
    }

    // ランクフィルター
    if (selectedRank) {
      filtered = filtered.filter(school => school.rank === selectedRank);
    }

    // タイプフィルター
    if (selectedType) {
      filtered = filtered.filter(school => school.type === selectedType);
    }

    setFilteredSchools(filtered);
  };

  const getRankColor = (rank: SchoolRank): string => {
    const colors = {
      'S++': 'text-red-600 font-bold',
      'S+': 'text-red-500 font-semibold',
      'S': 'text-orange-500 font-semibold',
      'A+': 'text-yellow-600 font-semibold',
      'A': 'text-yellow-500',
      'B+': 'text-blue-500',
      'B': 'text-gray-600'
    };
    return colors[rank] || 'text-gray-600';
  };

  const getTypeColor = (type: string): string => {
    const colors: Record<string, string> = {
      'traditional': 'bg-blue-100 text-blue-800',
      'emerging': 'bg-green-100 text-green-800',
      'technical': 'bg-purple-100 text-purple-800',
      'power': 'bg-red-100 text-red-800',
      'balanced': 'bg-gray-100 text-gray-800',
      'specialized': 'bg-pink-100 text-pink-800',
      'academy': 'bg-indigo-100 text-indigo-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getGrowthIcon = (trajectory: string): string => {
    switch (trajectory) {
      case 'ascending': return '↗️';
      case 'stable': return '→';
      case 'declining': return '↘️';
      default: return '→';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">ライバル校を読み込み中...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* フィルター */}
      {showFilters && (
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* 検索 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                検索
              </label>
              <input
                type="text"
                placeholder="学校名・都道府県で検索"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* 地方 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                地方
              </label>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">全て</option>
                <option value="北海道">北海道</option>
                <option value="東北">東北</option>
                <option value="関東">関東</option>
                <option value="中部">中部</option>
                <option value="近畿">近畿</option>
                <option value="中国">中国</option>
                <option value="四国">四国</option>
                <option value="九州">九州</option>
                <option value="沖縄">沖縄</option>
              </select>
            </div>

            {/* ランク */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ランク
              </label>
              <select
                value={selectedRank}
                onChange={(e) => setSelectedRank(e.target.value as SchoolRank | '')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">全て</option>
                <option value="S++">S++</option>
                <option value="S+">S+</option>
                <option value="S">S</option>
                <option value="A+">A+</option>
                <option value="A">A</option>
                <option value="B+">B+</option>
                <option value="B">B</option>
              </select>
            </div>

            {/* タイプ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                タイプ
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">全て</option>
                <option value="traditional">伝統校</option>
                <option value="emerging">新興校</option>
                <option value="technical">技術校</option>
                <option value="power">パワー校</option>
                <option value="balanced">バランス校</option>
                <option value="specialized">特殊校</option>
                <option value="academy">アカデミー校</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* 結果件数 */}
      <div className="text-sm text-gray-600">
        {filteredSchools.length}校のライバル校が見つかりました
      </div>

      {/* ライバル校一覧 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSchools.map((school) => (
          <div
            key={school.id}
            className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onSchoolSelect?.(school)}
          >
            {/* ヘッダー */}
            <div className="p-4 border-b">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg text-gray-900 truncate">
                  {school.name}
                </h3>
                <span className={`text-sm px-2 py-1 rounded ${getRankColor(school.rank)}`}>
                  {school.rank}
                </span>
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>{school.prefecture}</span>
                <span className={`px-2 py-1 rounded-full text-xs ${getTypeColor(school.type)}`}>
                  {getTypeLabel(school.type)}
                </span>
              </div>
            </div>

            {/* 内容 */}
            <div className="p-4 space-y-3">
              {/* 校風 */}
              <div>
                <p className="text-sm text-gray-700 line-clamp-2">
                  {school.philosophy}
                </p>
              </div>

              {/* 戦術 */}
              <div>
                <div className="text-xs text-gray-500 mb-1">得意戦術</div>
                <div className="flex flex-wrap gap-1">
                  {school.signature_tactics.map((tactic, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                    >
                      {getTacticLabel(tactic)}
                    </span>
                  ))}
                </div>
              </div>

              {/* エースポケモン */}
              <div>
                <div className="text-xs text-gray-500 mb-1">エースポケモン</div>
                <span className="text-sm font-medium text-gray-900">
                  {school.ace_pokemon}
                </span>
              </div>

              {/* 統計情報 */}
              <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
                <div>
                  <div>レーティング</div>
                  <div className="font-medium">{school.current_rating}</div>
                </div>
                <div>
                  <div>平均レベル</div>
                  <div className="font-medium">{school.average_level}</div>
                </div>
                <div>
                  <div>調子</div>
                  <div className="font-medium">
                    {getGrowthIcon(school.growth_trajectory)} {Math.round(school.season_form * 100)}%
                  </div>
                </div>
              </div>

              {/* チーム編成 */}
              <div className="text-xs text-gray-600">
                <span>部員数: {school.team_composition.total_members}名</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 結果が0件の場合 */}
      {filteredSchools.length === 0 && !loading && (
        <div className="text-center py-8 text-gray-500">
          条件に一致するライバル校が見つかりませんでした
        </div>
      )}
    </div>
  );
};

// ヘルパー関数
const getTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    'traditional': '伝統校',
    'emerging': '新興校',
    'technical': '技術校',
    'power': 'パワー校',
    'balanced': 'バランス校',
    'specialized': '特殊校',
    'academy': 'アカデミー校'
  };
  return labels[type] || type;
};

const getTacticLabel = (tactic: TacticType): string => {
  const labels: Record<string, string> = {
    'aggressive': '攻撃的',
    'defensive': '守備的',
    'balanced': 'バランス',
    'technical': '技術的',
    'power': 'パワー',
    'counter': 'カウンター'
  };
  return labels[tactic] || tactic;
};
