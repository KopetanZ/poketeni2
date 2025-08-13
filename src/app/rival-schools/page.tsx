'use client';

import React, { useState } from 'react';
import { RivalSchoolList } from '../../components/rival-schools/RivalSchoolList';
import { RivalSchoolDetail } from '../../components/rival-schools/RivalSchoolDetail';
import { RivalSchool } from '../../types/rival-schools';

export default function RivalSchoolsPage() {
  const [selectedSchool, setSelectedSchool] = useState<RivalSchool | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  const handleSchoolSelect = (school: RivalSchool) => {
    setSelectedSchool(school);
    setShowDetail(true);
  };

  const handleCloseDetail = () => {
    setShowDetail(false);
    setSelectedSchool(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🏫 ライバル校システム
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            日本全国47都道府県のライバル校と対戦し、栄冠を目指しましょう。
            各地域の特色を活かした戦術と、独自の校風を持つ学校があなたを待っています。
          </p>
        </div>

        {/* 統計情報 */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">📊 システム概要</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">47</div>
              <div className="text-sm text-gray-600">都道府県</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">200+</div>
              <div className="text-sm text-gray-600">ライバル校</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">7</div>
              <div className="text-sm text-gray-600">学校タイプ</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">6</div>
              <div className="text-sm text-gray-600">戦術スタイル</div>
            </div>
          </div>
        </div>

        {/* メインコンテンツ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ライバル校一覧 */}
          <div className="lg:col-span-2">
            <RivalSchoolList onSchoolSelect={handleSchoolSelect} />
          </div>

          {/* サイドバー */}
          <div className="space-y-6">
            {/* 地域別情報 */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🗾 地域別特色</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">北海道・東北</span>
                  <span className="text-blue-600">❄️ 雪国戦術</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">関東</span>
                  <span className="text-green-600">🏙️ 技術重視</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">中部・近畿</span>
                  <span className="text-yellow-600">⚖️ バランス型</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">中国・四国</span>
                  <span className="text-purple-600">🌊 海の戦術</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">九州・沖縄</span>
                  <span className="text-red-600">🔥 パワー型</span>
                </div>
              </div>
            </div>

            {/* 学校タイプ説明 */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🏫 学校タイプ</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-medium text-blue-600">伝統校:</span>
                  <span className="text-gray-600">精神力と持久力重視</span>
                </div>
                <div>
                  <span className="font-medium text-green-600">新興校:</span>
                  <span className="text-gray-600">スピードと柔軟性</span>
                </div>
                <div>
                  <span className="font-medium text-purple-600">技術校:</span>
                  <span className="text-gray-600">戦術理解と分析力</span>
                </div>
                <div>
                  <span className="font-medium text-red-600">パワー校:</span>
                  <span className="text-gray-600">パワーとスピード</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">バランス校:</span>
                  <span className="text-gray-600">総合力と安定性</span>
                </div>
                <div>
                  <span className="font-medium text-pink-600">特殊校:</span>
                  <span className="text-gray-600">個性と独創性</span>
                </div>
                <div>
                  <span className="font-medium text-indigo-600">アカデミー校:</span>
                  <span className="text-gray-600">個人指導と才能開発</span>
                </div>
              </div>
            </div>

            {/* ランクシステム */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🏆 ランクシステム</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-red-600 font-bold">S++</span>
                  <span className="text-gray-600">全国トップクラス</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-red-500 font-semibold">S+</span>
                  <span className="text-gray-600">全国上位</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-orange-500 font-semibold">S</span>
                  <span className="text-gray-600">全国レベル</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-yellow-600 font-semibold">A+</span>
                  <span className="text-gray-600">地方レベル</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-yellow-500">A</span>
                  <span className="text-gray-600">県レベル</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-500">B+</span>
                  <span className="text-gray-600">地区レベル</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">B</span>
                  <span className="text-gray-600">一般校</span>
                </div>
              </div>
            </div>

            {/* 戦術スタイル */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">⚔️ 戦術スタイル</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-red-600">攻撃的:</span>
                  <span className="text-gray-600">積極的な攻撃</span>
                </div>
                <div>
                  <span className="font-medium text-blue-600">守備的:</span>
                  <span className="text-gray-600">堅実な守り</span>
                </div>
                <div>
                  <span className="font-medium text-green-600">バランス:</span>
                  <span className="text-gray-600">攻守のバランス</span>
                </div>
                <div>
                  <span className="font-medium text-purple-600">技術的:</span>
                  <span className="text-gray-600">戦術と技術</span>
                </div>
                <div>
                  <span className="font-medium text-orange-600">パワー:</span>
                  <span className="text-gray-600">力とスピード</span>
                </div>
                <div>
                  <span className="font-medium text-pink-600">カウンター:</span>
                  <span className="text-gray-600">相手の動きに対応</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ライバル校詳細モーダル */}
      {showDetail && selectedSchool && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <RivalSchoolDetail 
              school={selectedSchool} 
              onClose={handleCloseDetail} 
            />
          </div>
        </div>
      )}
    </div>
  );
}
