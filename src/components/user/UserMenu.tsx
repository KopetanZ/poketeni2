'use client';

import { useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { DataResetHelpers, DataResetUtils, ResetOptions } from '@/lib/data-reset-utils';
import { LogOut, RefreshCw, Settings, User, Download, Trash2 } from 'lucide-react';

interface UserMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UserMenu({ isOpen, onClose }: UserMenuProps) {
  const { user, signOut } = useAuth();
  const [showResetOptions, setShowResetOptions] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  if (!isOpen || !user) return null;

  const isSampleAccount = DataResetUtils.isSampleAccount(user.email);

  const handleLogout = async () => {
    const confirmed = confirm('ログアウトしますか？');
    if (!confirmed) return;

    setIsLoggingOut(true);
    try {
      await signOut();
      onClose();
    } catch (error) {
      console.error('Logout error:', error);
      alert('ログアウトに失敗しました');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleQuickReset = async () => {
    if (!isSampleAccount) {
      alert('この機能はサンプルアカウントでのみ利用可能です');
      return;
    }

    const confirmed = confirm(
      '⚠️ 完全データリセット\n\n' +
      '全てのゲームデータが削除され、初期状態に戻ります。\n' +
      'この操作は取り消せません。\n\n' +
      '本当に実行しますか？'
    );

    if (!confirmed) return;

    setIsResetting(true);
    try {
      await DataResetHelpers.resetSampleAccount();
      onClose();
    } catch (error) {
      console.error('Reset error:', error);
    } finally {
      setIsResetting(false);
    }
  };

  const handleCustomReset = async (options: ResetOptions) => {
    setIsResetting(true);
    try {
      await DataResetHelpers.customReset(options);
      onClose();
    } catch (error) {
      console.error('Custom reset error:', error);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <>
      {/* オーバーレイ */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-60 z-[10004]"
        onClick={onClose}
      />
      
      {/* メニュー本体 */}
      <div className="relative bg-slate-800 border border-slate-600 rounded-xl shadow-2xl z-[10005] min-w-80">
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-slate-700 to-slate-600 px-4 py-3 rounded-t-xl border-b border-slate-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <User size={16} className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white">ユーザーメニュー</h3>
                <p className="text-slate-300 text-sm">{user.email}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* メニュー項目 */}
        <div className="p-2">
          {/* アカウント情報 */}
          <div className="px-3 py-2 text-sm text-slate-400 border-b border-slate-600 mb-2">
            アカウント情報
          </div>
          
          <div className="bg-slate-700/50 rounded-lg p-3 mb-3">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-slate-400">メール:</span>
                <p className="text-white text-xs truncate">{user.email}</p>
              </div>
              <div>
                <span className="text-slate-400">ID:</span>
                <p className="text-white text-xs font-mono truncate">{user.id.split('-')[0]}...</p>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400">作成日:</span>
                <p className="text-white text-xs">
                  {new Date(user.created_at).toLocaleDateString('ja-JP')}
                </p>
              </div>
              {isSampleAccount && (
                <div className="col-span-2 bg-yellow-900/30 border border-yellow-600/30 rounded p-2">
                  <span className="text-yellow-400 text-xs font-semibold">🔧 サンプルアカウント</span>
                </div>
              )}
            </div>
          </div>

          {/* データ管理 */}
          <div className="px-3 py-2 text-sm text-slate-400 border-b border-slate-600 mb-2">
            データ管理
          </div>

          {/* クイックリセット（サンプルアカウントのみ） */}
          {isSampleAccount && (
            <button
              onClick={handleQuickReset}
              disabled={isResetting}
              className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-orange-600/20 rounded-lg transition-colors text-orange-400 hover:text-orange-300 disabled:opacity-50"
            >
              <RefreshCw size={16} className={isResetting ? 'animate-spin' : ''} />
              <div>
                <div className="font-medium">全データリセット</div>
                <div className="text-xs text-slate-400">初期状態に戻します</div>
              </div>
            </button>
          )}

          {/* 詳細リセットオプション */}
          <button
            onClick={() => setShowResetOptions(!showResetOptions)}
            className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-slate-700/50 rounded-lg transition-colors text-slate-300"
          >
            <Settings size={16} />
            <div>
              <div className="font-medium">詳細リセット設定</div>
              <div className="text-xs text-slate-400">部分的なデータリセット</div>
            </div>
          </button>

          {/* 詳細設定パネル */}
          {showResetOptions && (
            <div className="mt-2 ml-6 bg-slate-700/30 rounded-lg p-3 border-l-2 border-slate-600">
              <div className="space-y-2">
                <div className="text-sm text-slate-300 font-medium mb-2">削除対象を選択:</div>
                
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" id="resetSchool" className="rounded" />
                  <span className="text-slate-300">学校データ (資金・評判)</span>
                </label>
                
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" id="resetPlayers" className="rounded" />
                  <span className="text-slate-300">全選手データ</span>
                </label>
                
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" id="resetInventory" className="rounded" />
                  <span className="text-slate-300">アイテム・装備</span>
                </label>
                
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" id="resetProgress" className="rounded" />
                  <span className="text-slate-300">進捗・履歴</span>
                </label>

                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => {
                      const options: ResetOptions = {
                        resetSchool: (document.getElementById('resetSchool') as HTMLInputElement)?.checked || false,
                        resetPlayers: (document.getElementById('resetPlayers') as HTMLInputElement)?.checked || false,
                        resetInventory: (document.getElementById('resetInventory') as HTMLInputElement)?.checked || false,
                        resetProgress: (document.getElementById('resetProgress') as HTMLInputElement)?.checked || false,
                        resetAll: false
                      };
                      handleCustomReset(options);
                    }}
                    disabled={isResetting}
                    className="flex-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 px-3 py-2 rounded text-sm disabled:opacity-50 transition-colors"
                  >
                    実行
                  </button>
                  <button
                    onClick={() => setShowResetOptions(false)}
                    className="flex-1 bg-slate-600/20 hover:bg-slate-600/30 text-slate-400 px-3 py-2 rounded text-sm transition-colors"
                  >
                    キャンセル
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 区切り線 */}
          <div className="my-3 border-t border-slate-600"></div>

          {/* ログアウト */}
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-red-600/20 rounded-lg transition-colors text-red-400 hover:text-red-300 disabled:opacity-50"
          >
            <LogOut size={16} />
            <div className="font-medium">
              {isLoggingOut ? 'ログアウト中...' : 'ログアウト'}
            </div>
          </button>
        </div>

        {/* フッター */}
        <div className="px-4 py-2 bg-slate-900/50 rounded-b-xl border-t border-slate-600">
          <p className="text-xs text-slate-500 text-center">
            ポケテニマスター v1.0 - by Claude
          </p>
        </div>
      </div>
    </>
  );
}