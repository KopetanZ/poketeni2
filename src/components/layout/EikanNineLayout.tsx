'use client';

import { ReactNode, useState, useEffect, useRef } from 'react';
import { Player } from '@/types/game';
import { useAuth } from '@/components/AuthProvider';
import UserMenu from '@/components/user/UserMenu';
import { Menu, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface EikanNineLayoutProps {
  children: ReactNode;
  currentPlayer?: Player;
  schoolName?: string;
  schoolFunds?: number;
  schoolReputation?: number;
  currentDate?: string;
  onMenuClick?: (menu: string) => void;
  activeMenu?: string;
  availableEventsCount?: number;
}

export default function EikanNineLayout({
  children,
  currentPlayer,
  schoolName = "ポケテニ高校",
  schoolFunds = 0,
  schoolReputation = 0,
  currentDate = "",
  onMenuClick,
  activeMenu = "home",
  availableEventsCount = 0
}: EikanNineLayoutProps) {
  const [showPlayerDetails, setShowPlayerDetails] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [focusedItem, setFocusedItem] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  // モバイル検出
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // ESCキーでモバイルメニューを閉じる
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
        setShowUserMenu(false);
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, []);

  // メニュー項目（アクセシビリティ対応）
  const menuItems = [
    { id: 'home', name: '学校', icon: '🏫', description: 'ホーム画面', shortcut: 'H' },
    { id: 'training', name: '練習', icon: '🎾', description: '練習・カード使用', shortcut: 'T' },
    { id: 'players', name: '部員', icon: '👥', description: '部員管理', shortcut: 'P' },
    { id: 'evolution', name: '進化', icon: '✨', description: 'ポケモン進化管理', shortcut: 'E' },
    { id: 'scouting', name: 'スカウト', icon: '🔍', description: '新しいポケモン発見', shortcut: 'S' },
    { id: 'events', name: 'イベント', icon: '🌟', description: '特殊能力習得イベント', shortcut: 'V' },
    { id: 'match', name: '試合', icon: '⚔️', description: '練習試合・対戦', shortcut: 'M' },
    { id: 'tournament', name: '大会', icon: '🏆', description: 'トーナメント参加', shortcut: 'R' },
    { id: 'shop', name: 'ショップ', icon: '🏪', description: 'アイテム購入', shortcut: 'O' },
    { id: 'breeding', name: '育て屋', icon: '🥚', description: 'ポケモン厳選', shortcut: 'B' },
    { id: 'data', name: 'データ', icon: '📊', description: '戦績・統計', shortcut: 'D' }
  ];

  // キーボードショートカット
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey) {
        const item = menuItems.find(item => item.shortcut === e.key.toUpperCase());
        if (item) {
          e.preventDefault();
          onMenuClick?.(item.id);
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onMenuClick]);

  const handleMenuClick = (itemId: string) => {
    onMenuClick?.(itemId);
    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
  };

  // メニューの描画
  const renderMenu = () => (
    <div 
      ref={menuRef}
      className={`${
        isMobile ? 'fixed inset-y-0 left-0 z-50' : 'relative'
      } ${
        isMobile && !isMobileMenuOpen ? '-translate-x-full' : 'translate-x-0'
      } ${
        isCollapsed && !isMobile ? 'w-16' : 'w-64'
      } bg-gradient-to-b from-slate-900/95 to-slate-800/95 backdrop-blur-sm border-r border-slate-600/50 shadow-2xl transition-all duration-300 ease-in-out`}
    >
      {/* ロゴエリア */}
      <div className="p-6 border-b border-slate-600/50">
        <div className="text-center">
          <div className={`${
            isCollapsed && !isMobile ? 'text-lg' : 'text-2xl'
          } font-bold text-yellow-400 mb-2 transition-all duration-300`}>
            {isCollapsed && !isMobile ? '⚡' : '⚡ ポケテニマスター ⚡'}
          </div>
          {!isCollapsed && (
            <div className="text-sm text-slate-300">
              {schoolName}
            </div>
          )}
        </div>
        
        {/* 折りたたみボタン（デスクトップのみ） */}
        {!isMobile && (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-3 top-8 w-6 h-6 bg-slate-700 border border-slate-600 rounded-full flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-600 transition-colors"
            aria-label={isCollapsed ? 'メニューを展開' : 'メニューを折りたたむ'}
          >
            {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        )}
      </div>

      {/* メニュー項目 */}
      <div className="p-4 overflow-y-auto flex-1">
        <div className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleMenuClick(item.id)}
              onFocus={() => setFocusedItem(item.id)}
              onBlur={() => setFocusedItem(null)}
              className={`w-full flex items-center ${
                isCollapsed && !isMobile ? 'justify-center px-2' : 'space-x-3 px-4'
              } py-3 rounded-xl transition-all duration-200 group relative ${
                activeMenu === item.id
                  ? 'bg-gradient-to-r from-blue-600 to-teal-600 text-white shadow-lg shadow-blue-500/25'
                  : 'text-slate-300 hover:bg-slate-700/50 hover:text-white focus:bg-slate-700/50 focus:text-white'
              } ${
                focusedItem === item.id ? 'ring-2 ring-blue-400 ring-opacity-50' : ''
              }`}
              aria-label={`${item.name} - ${item.description} (Alt+${item.shortcut})`}
              title={isCollapsed && !isMobile ? `${item.name} (Alt+${item.shortcut})` : ''}
            >
              <div className={`text-xl ${
                activeMenu === item.id ? 'scale-110' : 'group-hover:scale-105'
              } transition-transform duration-200 relative`}>
                {item.icon}
                {/* イベント通知バッジ */}
                {item.id === 'events' && availableEventsCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                    {availableEventsCount > 9 ? '9+' : availableEventsCount}
                  </div>
                )}
              </div>
              
              {(!isCollapsed || isMobile) && (
                <div className="flex-1 text-left">
                  <div className="font-semibold flex items-center gap-2">
                    {item.name}
                    <span className="text-xs opacity-60">Alt+{item.shortcut}</span>
                  </div>
                  <div className={`text-xs ${
                    activeMenu === item.id ? 'text-blue-100' : 'text-slate-400'
                  }`}>
                    {item.description}
                  </div>
                </div>
              )}
              
              {/* ツールチップ（折りたたみ時） */}
              {isCollapsed && !isMobile && (
                <div className="absolute left-full ml-2 px-3 py-2 bg-slate-800 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                  <div className="font-semibold">{item.name}</div>
                  <div className="text-xs text-slate-300">{item.description}</div>
                  <div className="text-xs text-blue-300">Alt+{item.shortcut}</div>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 下部情報 */}
      <div className="p-4 bg-gradient-to-t from-slate-900/95 to-transparent border-t border-slate-600/50">
        <div className={`bg-slate-800/80 rounded-lg ${
          isCollapsed && !isMobile ? 'p-2' : 'p-3'
        } space-y-2`}>
          {(!isCollapsed || isMobile) ? (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">資金:</span>
                <span className="text-green-400 font-semibold">💰 {schoolFunds.toLocaleString()}円</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">評判:</span>
                <span className="text-yellow-400 font-semibold">⭐ {schoolReputation}</span>
              </div>
              {currentDate && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">日付:</span>
                  <span className="text-slate-300 font-semibold">📅 {currentDate}</span>
                </div>
              )}
            </>
          ) : (
            <div className="text-center space-y-1">
              <div className="text-xs text-green-400 font-semibold" title={`資金: ${schoolFunds.toLocaleString()}円`}>
                💰
              </div>
              <div className="text-xs text-yellow-400 font-semibold" title={`評判: ${schoolReputation}`}>
                ⭐
              </div>
              {currentDate && (
                <div className="text-xs text-slate-300 font-semibold" title={`日付: ${currentDate}`}>
                  📅
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-blue-900 to-teal-800 relative overflow-hidden">
      {/* 背景パターン */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 via-transparent to-teal-400/20"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          {/* 装飾的な円形パターン */}
          <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-radial from-blue-400/10 to-transparent rounded-full"></div>
          <div className="absolute bottom-20 left-20 w-64 h-64 bg-gradient-radial from-teal-400/10 to-transparent rounded-full"></div>
        </div>
      </div>

      {/* モバイル用オーバーレイ */}
      {isMobile && isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      
      {/* モバイル用ヘッダー */}
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 z-30 bg-slate-900/95 backdrop-blur-sm border-b border-slate-600/50 p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 text-slate-300 hover:text-white transition-colors"
              aria-label="メニューを開く"
            >
              <Menu size={24} />
            </button>
            <div className="text-lg font-bold text-yellow-400">
              ⚡ ポケテニマスター
            </div>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="p-2 text-slate-300 hover:text-white transition-colors"
              aria-label="ユーザーメニュー"
            >
              👤
            </button>
          </div>
        </div>
      )}

      <div className={`relative z-10 flex h-screen ${
        isMobile ? 'pt-16' : ''
      }`}>
        {/* サイドメニュー */}
        {renderMenu()}

        {/* メインコンテンツ */}
        <div className={`flex-1 flex flex-col overflow-hidden ${
          isCollapsed && !isMobile ? 'ml-0' : ''
        }`}>
          {/* トップバー（デスクトップのみ） */}
          {!isMobile && (
            <div className="relative z-30 bg-slate-900/80 backdrop-blur-sm border-b border-slate-600/50 p-4">
              <div className="flex items-center justify-between">
                {/* 現在のプレイヤー情報 */}
                <div className="flex items-center space-x-4">
                  {currentPlayer && (
                    <div 
                      className="flex items-center space-x-3 bg-slate-800/60 rounded-lg px-4 py-2 cursor-pointer hover:bg-slate-700/60 transition-colors group"
                      onClick={() => setShowPlayerDetails(!showPlayerDetails)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          setShowPlayerDetails(!showPlayerDetails);
                        }
                      }}
                      aria-label="プレイヤー詳細を表示"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-teal-400 rounded-full flex items-center justify-center text-white font-bold text-lg group-hover:scale-105 transition-transform">
                        {currentPlayer.pokemon_name?.[0] || '?'}
                      </div>
                      <div>
                        <div className="font-semibold text-white">{currentPlayer.pokemon_name}</div>
                        <div className="text-sm text-slate-300">Lv.{currentPlayer.level}</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* ユーザーメニュー */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 text-slate-300 hover:text-white px-3 py-2 rounded-lg hover:bg-slate-700/50 transition-colors focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
                    aria-label="ユーザーメニューを開く"
                  >
                    <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center text-sm font-semibold">
                      {(user as any)?.user_metadata?.name?.[0] || user?.email?.[0] || '👤'}
                    </div>
                    <span className="hidden sm:block">{(user as any)?.user_metadata?.name || user?.email || 'ゲスト'}</span>
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 top-full mt-2 z-[10003]">
                      <UserMenu 
                        isOpen={showUserMenu}
                        onClose={() => setShowUserMenu(false)}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* プレイヤー詳細モーダル（アクセシビリティ対応） */}
          {showPlayerDetails && currentPlayer && (
            <div 
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setShowPlayerDetails(false);
                }
              }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="player-modal-title"
            >
              <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full border border-slate-600 animate-in slide-in-from-bottom-4 duration-300">
                <div className="flex justify-between items-center mb-4">
                  <h3 id="player-modal-title" className="text-xl font-bold text-white">プレイヤー詳細</h3>
                  <button 
                    onClick={() => setShowPlayerDetails(false)}
                    className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-700 transition-colors focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
                    aria-label="プレイヤー詳細を閉じる"
                  >
                    <X size={20} />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-teal-400 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      {currentPlayer.pokemon_name?.[0] || '?'}
                    </div>
                    <div>
                      <div className="text-xl font-bold text-white">{currentPlayer.pokemon_name}</div>
                      <div className="text-slate-300">レベル {currentPlayer.level}</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-slate-700/50 p-3 rounded-lg">
                      <span className="text-slate-400 block">サーブ</span>
                      <span className="text-white font-semibold text-lg">{currentPlayer.serve_skill}</span>
                    </div>
                    <div className="bg-slate-700/50 p-3 rounded-lg">
                      <span className="text-slate-400 block">リターン</span>
                      <span className="text-white font-semibold text-lg">{currentPlayer.return_skill}</span>
                    </div>
                    <div className="bg-slate-700/50 p-3 rounded-lg">
                      <span className="text-slate-400 block">ボレー</span>
                      <span className="text-white font-semibold text-lg">{currentPlayer.volley_skill}</span>
                    </div>
                    <div className="bg-slate-700/50 p-3 rounded-lg">
                      <span className="text-slate-400 block">ストローク</span>
                      <span className="text-white font-semibold text-lg">{currentPlayer.stroke_skill}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* メインコンテンツエリア */}
          <div className="flex-1 overflow-y-auto bg-slate-50/95 backdrop-blur-sm">
            {children}
          </div>
        </div>
        
        {/* モバイル用ユーザーメニュー */}
        {isMobile && showUserMenu && (
          <div className="fixed top-16 right-4 z-[10003]">
            <UserMenu 
              isOpen={showUserMenu}
              onClose={() => setShowUserMenu(false)}
            />
          </div>
        )}
      </div>
      
      {/* アクセシビリティ: スクリーンリーダー用の説明 */}
      <div className="sr-only" aria-live="polite">
        {activeMenu && `現在のページ: ${menuItems.find(item => item.id === activeMenu)?.name}`}
      </div>
    </div>
  );
}