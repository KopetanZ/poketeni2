'use client';

import React from 'react';
import { RivalSchool } from '../../types/rival-schools';

interface RivalSchoolDetailProps {
  school: RivalSchool;
  onClose?: () => void;
}

export const RivalSchoolDetail: React.FC<RivalSchoolDetailProps> = ({ school, onClose }) => {
  const getRankColor = (rank: string): string => {
    const colors: Record<string, string> = {
      'S++': 'text-red-600',
      'S+': 'text-red-500',
      'S': 'text-orange-500',
      'A+': 'text-yellow-600',
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
      case 'ascending': return '↗️ 上昇中';
      case 'stable': return '→ 安定';
      case 'declining': return '↘️ 下降中';
      default: return '→ 安定';
    }
  };

  const getInjuryColor = (impact: string): string => {
    const colors: Record<string, string> = {
      'low': 'text-green-600',
      'medium': 'text-yellow-600',
      'high': 'text-red-600'
    };
    return colors[impact] || 'text-gray-600';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border max-w-4xl mx-auto">
      {/* ヘッダー */}
      <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-3">
              <h1 className="text-3xl font-bold text-gray-900">{school.name}</h1>
              <span className={`text-2xl font-bold px-3 py-1 rounded-lg ${getRankColor(school.rank)}`}>
                {school.rank}
              </span>
            </div>
            
            <div className="flex items-center gap-4 text-lg text-gray-700">
              <span>📍 {school.prefecture}</span>
              <span>🏛️ {school.region}</span>
              <span className={`px-3 py-1 rounded-full text-sm ${getTypeColor(school.type)}`}>
                {getTypeLabel(school.type)}
              </span>
            </div>
          </div>
          
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              ×
            </button>
          )}
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左カラム */}
          <div className="space-y-6">
            {/* 校風・理念 */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">🏫 校風・理念</h3>
              <p className="text-gray-700 leading-relaxed">{school.philosophy}</p>
              <div className="mt-3">
                <span className="text-sm text-gray-500">創立: {school.founded_year}年</span>
              </div>
            </div>

            {/* 得意分野・苦手分野 */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">💪 学校特色</h3>
              
              <div className="mb-4">
                <h4 className="font-medium text-green-700 mb-2">得意分野</h4>
                <div className="flex flex-wrap gap-2">
                  {school.specialty.map((item, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-red-700 mb-2">苦手分野</h4>
                <div className="flex flex-wrap gap-2">
                  {school.weaknesses.map((item, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* 戦術 */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">⚔️ 得意戦術</h3>
              <div className="flex flex-wrap gap-2">
                {school.signature_tactics.map((tactic, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                  >
                    {getTacticLabel(tactic)}
                  </span>
                ))}
              </div>
            </div>

            {/* ポケモン編成 */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">🎾 チーム編成</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">総部員数:</span>
                  <span className="ml-2 font-medium">{school.team_composition.total_members}名</span>
                </div>
                <div>
                  <span className="text-gray-600">シングルス:</span>
                  <span className="ml-2 font-medium">{school.team_composition.singles_players}名</span>
                </div>
                <div>
                  <span className="text-gray-600">ダブルス:</span>
                  <span className="ml-2 font-medium">{school.team_composition.doubles_teams}組</span>
                </div>
                <div>
                  <span className="text-gray-600">ミックス:</span>
                  <span className="ml-2 font-medium">{school.team_composition.mixed_doubles}組</span>
                </div>
                <div>
                  <span className="text-gray-600">控え:</span>
                  <span className="ml-2 font-medium">{school.team_composition.reserve_players}名</span>
                </div>
                <div>
                  <span className="text-gray-600">平均経験:</span>
                  <span className="ml-2 font-medium">{school.team_composition.average_experience}年</span>
                </div>
              </div>
            </div>
          </div>

          {/* 右カラム */}
          <div className="space-y-6">
            {/* エースポケモン */}
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-4 rounded-lg border border-yellow-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">⭐ エースポケモン</h3>
              <div className="text-center">
                <div className="text-4xl mb-2">🐾</div>
                <div className="text-2xl font-bold text-gray-900 mb-2">{school.ace_pokemon}</div>
                <div className="text-sm text-gray-600">好むタイプ</div>
                <div className="flex flex-wrap gap-2 justify-center mt-2">
                  {school.preferred_types.map((type, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded"
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* 現在の状況 */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">📊 現在の状況</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">レーティング</span>
                  <span className="font-bold text-lg">{school.current_rating}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">平均レベル</span>
                  <span className="font-bold text-lg">{school.average_level}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">シーズン調子</span>
                  <span className="font-bold text-lg">
                    {Math.round(school.season_form * 100)}%
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">成長軌道</span>
                  <span className="font-medium">{getGrowthIcon(school.growth_trajectory)}</span>
                </div>
              </div>
            </div>

            {/* 怪我状況 */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">🏥 怪我状況</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">怪我人</span>
                  <span className={`font-bold ${getInjuryColor(school.injury_situation.impact_level)}`}>
                    {school.injury_situation.injured_players}名
                  </span>
                </div>
                
                {school.injury_situation.injured_players > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">回復まで</span>
                    <span className="font-medium">
                      {school.injury_situation.recovery_weeks}週間
                    </span>
                  </div>
                )}
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">影響度</span>
                  <span className={`font-medium ${getInjuryColor(school.injury_situation.impact_level)}`}>
                    {getImpactLabel(school.injury_situation.impact_level)}
                  </span>
                </div>
              </div>
            </div>

            {/* 学校情報 */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">🏛️ 学校情報</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">マスコット</span>
                  <span className="font-medium">{school.mascot}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">校訓</span>
                  <span className="font-medium">{school.motto}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">学校カラー</span>
                  <div className="flex gap-2">
                    <div
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: school.school_colors[0] }}
                    ></div>
                    <div
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: school.school_colors[1] }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 地域特色情報 */}
        <div className="mt-8 bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">🗾 地域特色</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-600">地域修正値:</span>
              <div className="mt-1 space-y-1">
                <div>施設: {school.regional_modifiers.facility_bonus > 0 ? '+' : ''}{school.regional_modifiers.facility_bonus}</div>
                <div>指導: {school.regional_modifiers.coaching_bonus > 0 ? '+' : ''}{school.regional_modifiers.coaching_bonus}</div>
                <div>資金: {school.regional_modifiers.funding_bonus > 0 ? '+' : ''}{school.regional_modifiers.funding_bonus}</div>
              </div>
            </div>
            
            <div>
              <span className="text-gray-600">文化修正値:</span>
              <div className="mt-1 space-y-1">
                <div>練習効率: {school.local_culture.training_efficiency > 0 ? '+' : ''}{school.local_culture.training_efficiency}</div>
                <div>チーム士気: {school.local_culture.team_morale > 0 ? '+' : ''}{school.local_culture.team_morale}</div>
                <div>競争心: {school.local_culture.competitive_spirit > 0 ? '+' : ''}{school.local_culture.competitive_spirit}</div>
              </div>
            </div>
            
            <div>
              <span className="text-gray-600">気候調整:</span>
              <div className="mt-1 text-xs">
                {Object.entries(school.regional_modifiers.climate_adjustment)
                  .filter(([_, value]) => value !== 0)
                  .map(([month, value]) => (
                    <div key={month}>
                      {month}月: {value > 0 ? '+' : ''}{value}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
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

const getTacticLabel = (tactic: string): string => {
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

const getImpactLabel = (impact: string): string => {
  const labels: Record<string, string> = {
    'low': '軽微',
    'medium': '中程度',
    'high': '重大'
  };
  return labels[impact] || impact;
};
