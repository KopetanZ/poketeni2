'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabase';
import { DateManager } from '@/lib/date-manager';

interface Tournament {
  id: string;
  name: string;
  tournament_type: 'practice' | 'regional' | 'national';
  description: string;
  start_date_year: number;
  start_date_month: number;
  start_date_day: number;
  end_date_year: number;
  end_date_month: number;
  end_date_day: number;
  max_participants: number;
  current_participants: number;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  prize_reputation: number;
  prize_funds: number;
}

interface TournamentParticipant {
  id: string;
  tournament_id: string;
  school_id: string;
  status: string;
}

export default function TournamentList() {
  const { user } = useAuth();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [myParticipations, setMyParticipations] = useState<TournamentParticipant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [schoolId, setSchoolId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchSchoolId();
      fetchTournaments();
      fetchMyParticipations();
    }
  }, [user]);

  const fetchSchoolId = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('schools')
        .select('id')
        .eq('user_id', user.id)
        .single();
        
      if (error) throw error;
      setSchoolId(data.id);
    } catch (err) {
      console.error('Failed to fetch school ID:', err);
    }
  };

  const fetchTournaments = async () => {
    try {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .order('start_date_year', { ascending: true })
        .order('start_date_month', { ascending: true })
        .order('start_date_day', { ascending: true });
        
      if (error) throw error;
      setTournaments(data || []);
    } catch (err) {
      console.error('Failed to fetch tournaments:', err);
      setError('大会データの取得に失敗しました');
    }
  };

  const fetchMyParticipations = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('tournament_participants')
        .select('*')
        .eq('school_id', schoolId);
        
      if (error) throw error;
      setMyParticipations(data || []);
    } catch (err) {
      console.error('Failed to fetch participations:', err);
    } finally {
      setLoading(false);
    }
  };

  const joinTournament = async (tournamentId: string) => {
    if (!user || !schoolId) {
      setError('認証情報が不正です');
      return;
    }

    try {
      setLoading(true);
      
      // 既に参加しているかチェック
      const existingParticipation = myParticipations.find(p => p.tournament_id === tournamentId);
      if (existingParticipation) {
        setError('この大会には既に参加しています');
        return;
      }

      // 大会に参加
      const { error: insertError } = await supabase
        .from('tournament_participants')
        .insert({
          tournament_id: tournamentId,
          school_id: schoolId,
          status: 'registered'
        });

      if (insertError) throw insertError;

      // 大会の参加者数を更新
      const tournament = tournaments.find(t => t.id === tournamentId);
      if (tournament) {
        const { error: updateError } = await supabase
          .from('tournaments')
          .update({ 
            current_participants: tournament.current_participants + 1 
          })
          .eq('id', tournamentId);

        if (updateError) throw updateError;
      }

      // データを再取得
      await fetchTournaments();
      await fetchMyParticipations();
      
      setError(null);
    } catch (err) {
      console.error('Failed to join tournament:', err);
      setError('大会への参加に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const getTournamentTypeColor = (type: string) => {
    switch (type) {
      case 'practice': return 'bg-green-100 text-green-800';
      case 'regional': return 'bg-blue-100 text-blue-800';
      case 'national': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTournamentTypeName = (type: string) => {
    switch (type) {
      case 'practice': return '練習試合';
      case 'regional': return '地区大会';
      case 'national': return '全国大会';
      default: return '不明';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusName = (status: string) => {
    switch (status) {
      case 'open': return '参加受付中';
      case 'in_progress': return '開催中';
      case 'completed': return '終了';
      case 'cancelled': return '中止';
      default: return '不明';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">🏆 トーナメント</h1>
        <p className="text-gray-600">
          様々な大会に参加してポケモンテニス部の実力を試そう！
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-2 text-red-600 hover:text-red-800 text-sm underline"
          >
            閉じる
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {tournaments.map(tournament => {
          const isParticipating = myParticipations.some(p => p.tournament_id === tournament.id);
          const isFull = tournament.current_participants >= tournament.max_participants;
          const canJoin = tournament.status === 'open' && !isParticipating && !isFull;
          
          return (
            <div 
              key={tournament.id}
              className="bg-white rounded-xl shadow-lg border border-gray-200 p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{tournament.name}</h3>
                  <p className="text-gray-600 text-sm mt-1">{tournament.description}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getTournamentTypeColor(tournament.tournament_type)}`}>
                    {getTournamentTypeName(tournament.tournament_type)}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(tournament.status)}`}>
                    {getStatusName(tournament.status)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                  <span className="text-gray-500">開始日:</span>
                  <p className="font-semibold">
                    {DateManager.formatDate({
                      year: tournament.start_date_year,
                      month: tournament.start_date_month,
                      day: tournament.start_date_day
                    })}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">終了日:</span>
                  <p className="font-semibold">
                    {DateManager.formatDate({
                      year: tournament.end_date_year,
                      month: tournament.end_date_month,
                      day: tournament.end_date_day
                    })}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">参加校数:</span>
                  <p className="font-semibold">
                    {tournament.current_participants} / {tournament.max_participants}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">賞品:</span>
                  <p className="font-semibold">
                    評判 +{tournament.prize_reputation}, 資金 +{tournament.prize_funds.toLocaleString()}円
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                {isParticipating ? (
                  <span className="flex items-center text-green-600 font-semibold">
                    ✅ 参加中
                  </span>
                ) : canJoin ? (
                  <button
                    onClick={() => joinTournament(tournament.id)}
                    disabled={loading}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {loading ? '処理中...' : '参加する'}
                  </button>
                ) : isFull ? (
                  <span className="text-gray-500 font-semibold">満員</span>
                ) : tournament.status !== 'open' ? (
                  <span className="text-gray-500 font-semibold">参加受付終了</span>
                ) : (
                  <span className="text-gray-500 font-semibold">参加不可</span>
                )}

                <div className="text-right text-xs text-gray-500">
                  定員まで残り {tournament.max_participants - tournament.current_participants} 校
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {tournaments.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">現在開催中の大会はありません</p>
        </div>
      )}
    </div>
  );
}