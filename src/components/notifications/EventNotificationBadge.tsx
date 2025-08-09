'use client';

import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';

interface EventNotificationBadgeProps {
  eventCount: number;
  onClick?: () => void;
}

export function EventNotificationBadge({ eventCount, onClick }: EventNotificationBadgeProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [previousCount, setPreviousCount] = useState(eventCount);

  // イベント数が変更された時にアニメーション
  useEffect(() => {
    if (eventCount > previousCount) {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 2000);
    }
    setPreviousCount(eventCount);
  }, [eventCount, previousCount]);

  if (eventCount === 0) return null;

  return (
    <div
      onClick={onClick}
      className={`relative cursor-pointer transition-all duration-200 hover:scale-110 ${
        isAnimating ? 'animate-bounce' : ''
      }`}
    >
      {/* ベースアイコン */}
      <div className="relative">
        <Star 
          className={`text-yellow-400 ${isAnimating ? 'animate-pulse' : ''}`} 
          size={24} 
        />
        
        {/* 通知バッジ */}
        <div className={`absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center ${
          isAnimating ? 'animate-ping' : ''
        }`}>
          {eventCount > 9 ? '9+' : eventCount}
        </div>
        
        {/* 光る効果 */}
        {isAnimating && (
          <div className="absolute inset-0 bg-yellow-400 rounded-full opacity-30 animate-ping"></div>
        )}
      </div>
      
      {/* 新着通知メッセージ */}
      {isAnimating && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-lg text-xs font-semibold whitespace-nowrap shadow-lg z-50 animate-bounce">
          新しいイベント！
        </div>
      )}
    </div>
  );
}