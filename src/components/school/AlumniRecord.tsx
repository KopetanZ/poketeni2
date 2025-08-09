'use client';

import React, { useState, useMemo } from 'react';
import { GraduatedPlayer, SchoolHistory } from '@/types/game';
import { CharacterGenerationSystem } from '@/lib/character-generation-system';
import { Star, Award, Calendar, TrendingUp, Users, Filter, Search } from 'lucide-react';

interface AlumniRecordProps {
  schoolHistory: SchoolHistory[];
  onClose: () => void;
}

export default function AlumniRecord({ schoolHistory, onClose }: AlumniRecordProps) {
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
  const [selectedCareerPath, setSelectedCareerPath] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'year' | 'name' | 'rank' | 'career'>('year');

  // 全卒業生を収集
  const allAlumni = useMemo(() => {
    return schoolHistory.flatMap(history => 
      history.graduatedPlayers.map(graduated => ({
        ...graduated,
        graduationYear: history.year
      }))
    );
  }, [schoolHistory]);

  // フィルタリングとソート
  const filteredAndSortedAlumni = useMemo(() => {
    let filtered = allAlumni.filter(alumni => {
      // 年度フィルタ
      const yearMatch = selectedYear === 'all' || alumni.graduationYear === selectedYear;
      
      // 進路フィルタ
      const careerMatch = selectedCareerPath === 'all' || alumni.careerPath === selectedCareerPath;
      
      // 検索フィルタ
      const searchMatch = searchTerm === '' || 
        alumni.player.pokemon_name.toLowerCase().includes(searchTerm.toLowerCase());
      
      return yearMatch && careerMatch && searchMatch;
    });

    // ソート
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'year':
          return b.graduationYear - a.graduationYear; // 新しい年度順
        case 'name':
          return a.player.pokemon_name.localeCompare(b.player.pokemon_name);
        case 'rank':
          const aAssessment = CharacterGenerationSystem.assessPlayer(a.player);
          const bAssessment = CharacterGenerationSystem.assessPlayer(b.player);
          return bAssessment.total - aAssessment.total; // 査定値順
        case 'career':
          const careerOrder = { 'professional': 0, 'university': 1, 'employment': 2, 'retired': 3 };
          return careerOrder[a.careerPath as keyof typeof careerOrder] - 
                 careerOrder[b.careerPath as keyof typeof careerOrder];
        default:
          return 0;
      }
    });

    return filtered;
  }, [allAlumni, selectedYear, selectedCareerPath, searchTerm, sortBy]);

  // 統計データ
  const statistics = useMemo(() => {
    const total = allAlumni.length;
    const careerStats = {
      professional: allAlumni.filter(a => a.careerPath === 'professional').length,
      university: allAlumni.filter(a => a.careerPath === 'university').length,
      employment: allAlumni.filter(a => a.careerPath === 'employment').length,
      retired: allAlumni.filter(a => a.careerPath === 'retired').length
    };
    
    const rankStats = allAlumni.reduce((acc, alumni) => {
      const assessment = CharacterGenerationSystem.assessPlayer(alumni.player);
      acc[assessment.rank] = (acc[assessment.rank] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { total, careerStats, rankStats };
  }, [allAlumni]);

  const getCareerPathDisplay = (careerPath: string) => {
    switch (careerPath) {
      case 'professional':
        return { text: 'プロ選手', icon: '🏆', color: 'text-yellow-500 bg-yellow-100' };
      case 'university':
        return { text: '大学進学', icon: '🎓', color: 'text-blue-500 bg-blue-100' };
      case 'employment':
        return { text: '就職', icon: '💼', color: 'text-green-500 bg-green-100' };
      case 'retired':
        return { text: '引退', icon: '🌸', color: 'text-pink-500 bg-pink-100' };
      default:
        return { text: '不明', icon: '❓', color: 'text-gray-500 bg-gray-100' };
    }
  };

  const getPositionDisplay = (position: string) => {
    switch (position) {
      case 'captain':
        return { text: '部長', icon: '👑' };
      case 'vice_captain':
        return { text: '副部長', icon: '⭐' };
      case 'regular':
        return { text: 'レギュラー', icon: '🎾' };
      case 'member':
        return { text: '部員', icon: '👤' };
      default:
        return { text: '不明', icon: '❓' };
    }
  };

  const availableYears = useMemo(() => {
    return Array.from(new Set(schoolHistory.map(h => h.year))).sort((a, b) => b - a);
  }, [schoolHistory]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl p-8 max-w-7xl w-full mx-4 my-8 border border-slate-600">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-4 flex items-center justify-center gap-2">
            <Award className="text-yellow-400" />
            卒業生名簿
            <Users className="text-blue-400" />
          </h2>
          <div className="text-slate-300">
            ポケテニ高校テニス部 - 歴代卒業生記録
          </div>
        </div>

        {/* 統計サマリー */}
        <div className="bg-slate-700/30 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp size={20} />
            統計サマリー
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-800/50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-400 mb-1">{statistics.total}</div>
              <div className="text-slate-300 text-sm">総卒業生数</div>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-yellow-400 mb-1">{statistics.careerStats.professional}</div>
              <div className="text-slate-300 text-sm">プロ転向</div>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-400 mb-1">{statistics.careerStats.university}</div>
              <div className="text-slate-300 text-sm">大学進学</div>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-purple-400 mb-1">
                {Object.entries(statistics.rankStats)
                  .filter(([rank]) => rank === 'S+' || rank === 'S')
                  .reduce((sum, [, count]) => sum + count, 0)}
              </div>
              <div className="text-slate-300 text-sm">S級選手</div>
            </div>
          </div>
        </div>

        {/* フィルタとソート */}
        <div className="bg-slate-700/30 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* 検索 */}
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="選手名で検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              />
            </div>

            {/* 年度フィルタ */}
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
              className="px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            >
              <option value="all">全年度</option>
              {availableYears.map(year => (
                <option key={year} value={year}>令和{year - 2018}年度</option>
              ))}
            </select>

            {/* 進路フィルタ */}
            <select
              value={selectedCareerPath}
              onChange={(e) => setSelectedCareerPath(e.target.value)}
              className="px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            >
              <option value="all">全進路</option>
              <option value="professional">プロ選手</option>
              <option value="university">大学進学</option>
              <option value="employment">就職</option>
              <option value="retired">引退</option>
            </select>

            {/* ソート */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            >
              <option value="year">卒業年度順</option>
              <option value="name">名前順</option>
              <option value="rank">査定順</option>
              <option value="career">進路順</option>
            </select>
          </div>
        </div>

        {/* 卒業生リスト */}
        <div className="bg-slate-700/20 rounded-lg p-4 max-h-96 overflow-y-auto mb-6">
          {filteredAndSortedAlumni.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Users size={48} className="mx-auto mb-4 opacity-50" />
              <p>該当する卒業生がいません</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAndSortedAlumni.map((alumni) => {
                const assessment = CharacterGenerationSystem.assessPlayer(alumni.player);
                const career = getCareerPathDisplay(alumni.careerPath);
                const position = getPositionDisplay(alumni.player.position);

                return (
                  <div key={alumni.player.id} className="bg-slate-800/50 rounded-lg p-4 border border-slate-600">
                    {/* ヘッダー */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-teal-400 rounded-full flex items-center justify-center text-white font-bold">
                        {alumni.player.pokemon_name[0]}
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-slate-400">令和{alumni.graduationYear - 2018}年度</div>
                        <div className="flex items-center gap-1">
                          <span className="text-lg font-bold text-yellow-400">{assessment.rank}</span>
                          <div className="flex">
                            {Array.from({ length: assessment.star_rating }, (_, i) => (
                              <Star key={i} size={12} className="text-yellow-400 fill-yellow-400" />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 基本情報 */}
                    <div className="mb-3">
                      <h3 className="font-bold text-white mb-1">
                        {alumni.player.pokemon_name}
                        <span className="ml-2 text-xs">{position.icon}</span>
                      </h3>
                      <div className="text-sm text-slate-300">
                        {position.text} | レベル {alumni.player.level}
                      </div>
                    </div>

                    {/* 最終能力値 */}
                    <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                      <div className="bg-slate-900/50 p-2 rounded text-center">
                        <div className="text-slate-400">サーブ</div>
                        <div className="text-white font-bold">{alumni.finalStats.serve_skill}</div>
                      </div>
                      <div className="bg-slate-900/50 p-2 rounded text-center">
                        <div className="text-slate-400">リターン</div>
                        <div className="text-white font-bold">{alumni.finalStats.return_skill}</div>
                      </div>
                    </div>

                    {/* 実績 */}
                    {alumni.achievements.length > 0 && (
                      <div className="mb-3">
                        <div className="text-xs text-slate-400 mb-1">実績</div>
                        <div className="flex flex-wrap gap-1">
                          {alumni.achievements.slice(0, 2).map((achievement, index) => (
                            <span key={index} className="text-xs bg-purple-900/30 text-purple-300 px-2 py-1 rounded">
                              {achievement}
                            </span>
                          ))}
                          {alumni.achievements.length > 2 && (
                            <span className="text-xs text-slate-500">+{alumni.achievements.length - 2}件</span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* 進路 */}
                    <div className="flex items-center justify-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${career.color}`}>
                        {career.icon} {career.text}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 閉じるボタン */}
        <div className="text-center">
          <button
            onClick={onClose}
            className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white font-bold py-3 px-8 rounded-lg transition-all duration-200"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}