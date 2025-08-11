'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Calendar, Clock, Star, Zap, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

interface EventHistoryEntry {
  id: string;
  school_id: string;
  event_type: 'seasonal' | 'hidden' | 'square_effect' | 'card_effect';
  event_id: string;
  event_name: string | null;
  description: string | null;
  source: 'card_progress' | 'advance_day' | 'manual';
  event_date_year: number;
  event_date_month: number;
  event_date_day: number;
  created_at: string;
}

interface EventHistoryDisplayProps {
  schoolId: string;
}

export function EventHistoryDisplay({ schoolId }: EventHistoryDisplayProps) {
  const [eventHistory, setEventHistory] = useState<EventHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'seasonal' | 'hidden' | 'square_effect' | 'card_effect'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'type'>('date');

  // イベント履歴を取得
  useEffect(() => {
    fetchEventHistory();
  }, [schoolId]);

  const fetchEventHistory = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('event_history')
        .select('*')
        .eq('school_id', schoolId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('イベント履歴の取得に失敗:', error);
        return;
      }

      setEventHistory(data || []);
    } catch (error) {
      console.error('イベント履歴の取得中にエラー:', error);
    } finally {
      setLoading(false);
    }
  };

  // フィルタリングされたイベント履歴
  const filteredHistory = eventHistory.filter(entry => {
    if (filter === 'all') return true;
    return entry.event_type === filter;
  });

  // ソートされたイベント履歴
  const sortedHistory = [...filteredHistory].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    } else {
      return a.event_type.localeCompare(b.event_type);
    }
  });

  // イベントタイプに応じたアイコンとスタイル
  const getEventTypeInfo = (type: string) => {
    switch (type) {
      case 'seasonal':
        return { icon: Calendar, color: 'text-green-400', bgColor: 'bg-green-100', label: '季節イベント' };
      case 'hidden':
        return { icon: Star, color: 'text-yellow-400', bgColor: 'bg-yellow-100', label: '隠しイベント' };
      case 'square_effect':
        return { icon: Zap, color: 'text-blue-400', bgColor: 'bg-blue-100', label: 'マス効果' };
      case 'card_effect':
        return { icon: CheckCircle, color: 'text-purple-400', bgColor: 'bg-purple-100', label: 'カード効果' };
      default:
        return { icon: AlertCircle, color: 'text-gray-400', bgColor: 'bg-gray-100', label: 'その他' };
    }
  };

  // ソースに応じたラベル
  const getSourceLabel = (source: string) => {
    switch (source) {
      case 'card_progress':
        return 'カード進行';
      case 'advance_day':
        return '日付進行';
      case 'manual':
        return '手動';
      default:
        return source;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* ヘッダー */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Clock className="text-blue-400" size={32} />
          イベント履歴
        </h1>
        <p className="text-slate-300">
          カード使用や日付進行で発生したイベントの履歴を確認できます
        </p>
      </div>

      {/* フィルターとソート */}
      <div className="flex flex-wrap gap-4 mb-6">
        {/* タイプフィルター */}
        <div className="flex items-center gap-2">
          <span className="text-slate-300 text-sm">タイプ:</span>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="bg-slate-700 text-white px-3 py-2 rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">すべて</option>
            <option value="seasonal">季節イベント</option>
            <option value="hidden">隠しイベント</option>
            <option value="square_effect">マス効果</option>
            <option value="card_effect">カード効果</option>
          </select>
        </div>

        {/* ソート */}
        <div className="flex items-center gap-2">
          <span className="text-slate-300 text-sm">並び順:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-slate-700 text-white px-3 py-2 rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="date">日付順</option>
            <option value="type">タイプ順</option>
          </select>
        </div>

        {/* 統計 */}
        <div className="ml-auto text-slate-400 text-sm">
          総数: {eventHistory.length}件
          {filter !== 'all' && ` (${filteredHistory.length}件)`}
        </div>
      </div>

      {/* イベント履歴一覧 */}
      <div className="flex-1 overflow-y-auto">
        {sortedHistory.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="mx-auto text-slate-500 mb-4" size={48} />
            <p className="text-slate-400 text-lg mb-2">イベント履歴がありません</p>
            <p className="text-slate-500 text-sm">
              カードを使用して日付を進めると、ここにイベント履歴が表示されます
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedHistory.map((entry) => {
              const typeInfo = getEventTypeInfo(entry.event_type);
              const Icon = typeInfo.icon;
              
              return (
                <div
                  key={entry.id}
                  className="bg-slate-700 rounded-lg p-4 border border-slate-600 hover:border-slate-500 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${typeInfo.bgColor}`}>
                        <Icon className={typeInfo.color} size={20} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">
                          {entry.event_name || `イベント ${entry.event_id}`}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          <span className={`px-2 py-1 rounded-full text-xs ${typeInfo.bgColor} ${typeInfo.color}`}>
                            {typeInfo.label}
                          </span>
                          <span>•</span>
                          <span>{getSourceLabel(entry.source)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right text-sm text-slate-400">
                      <div>{entry.event_date_year}/{entry.event_date_month}/{entry.event_date_day}</div>
                      <div className="text-xs">
                        {new Date(entry.created_at).toLocaleTimeString('ja-JP', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>

                  {entry.description && (
                    <p className="text-slate-300 text-sm mb-3">{entry.description}</p>
                  )}

                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>ID: {entry.event_id}</span>
                    <span>発生時刻: {new Date(entry.created_at).toLocaleString('ja-JP')}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 履歴クリアボタン（開発用） */}
      {process.env.NODE_ENV === 'development' && eventHistory.length > 0 && (
        <div className="mt-6 pt-4 border-t border-slate-600">
          <button
            onClick={async () => {
              if (confirm('すべてのイベント履歴を削除しますか？')) {
                try {
                  const { error } = await supabase
                    .from('event_history')
                    .delete()
                    .eq('school_id', schoolId);
                  
                  if (error) {
                    console.error('履歴削除に失敗:', error);
                  } else {
                    setEventHistory([]);
                  }
                } catch (error) {
                  console.error('履歴削除中にエラー:', error);
                }
              }
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
          >
            履歴をクリア（開発用）
          </button>
        </div>
      )}
    </div>
  );
}
