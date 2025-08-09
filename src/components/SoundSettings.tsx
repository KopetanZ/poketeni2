'use client';

import React, { useState, useEffect } from 'react';
import { useSoundSystem, SoundControls } from '@/lib/sound-system';

interface SoundSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SoundSettings: React.FC<SoundSettingsProps> = ({ isOpen, onClose }) => {
  const soundSystem = useSoundSystem();
  const [bgmVolume, setBgmVolume] = useState(0.3);
  const [sfxVolume, setSfxVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);

  // 初期値の読み込み
  useEffect(() => {
    setBgmVolume(soundSystem.getBGMVolume());
    setSfxVolume(soundSystem.getSFXVolume());
    setIsMuted(soundSystem.isMuted());
  }, [soundSystem]);

  // BGM音量変更
  const handleBGMVolumeChange = (volume: number) => {
    setBgmVolume(volume);
    soundSystem.setBGMVolume(volume);
  };

  // 効果音音量変更
  const handleSFXVolumeChange = (volume: number) => {
    setSfxVolume(volume);
    soundSystem.setSFXVolume(volume);
    // テスト再生
    soundSystem.playSFX(SoundControls.SFX_TYPES.success);
  };

  // ミュート切り替え
  const handleToggleMute = () => {
    const newMutedState = soundSystem.toggleMute();
    setIsMuted(newMutedState);
  };

  // プリセット適用
  const applyPreset = (preset: typeof SoundControls.VOLUME_PRESETS[0]) => {
    handleBGMVolumeChange(preset.bgm);
    handleSFXVolumeChange(preset.sfx);
  };

  // テスト音再生
  const playTestSound = (soundType: string) => {
    soundSystem.playSFX(soundType);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">🎵 音響設定</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-6">
          {/* マスターミュート */}
          <div className="flex items-center justify-between">
            <span className="text-lg font-medium text-gray-700">音声ON/OFF</span>
            <button
              onClick={handleToggleMute}
              className={`px-4 py-2 rounded-lg font-bold transition-colors ${
                isMuted 
                  ? 'bg-red-500 text-white hover:bg-red-600' 
                  : 'bg-green-500 text-white hover:bg-green-600'
              }`}
            >
              {isMuted ? '🔇 ミュート' : '🔊 音声ON'}
            </button>
          </div>

          {/* BGM音量 */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-lg font-medium text-gray-700">BGM音量</label>
              <span className="text-sm text-gray-500">{Math.round(bgmVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={bgmVolume}
              onChange={(e) => handleBGMVolumeChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              disabled={isMuted}
            />
          </div>

          {/* 効果音音量 */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-lg font-medium text-gray-700">効果音音量</label>
              <span className="text-sm text-gray-500">{Math.round(sfxVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={sfxVolume}
              onChange={(e) => handleSFXVolumeChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              disabled={isMuted}
            />
          </div>

          {/* テスト音ボタン */}
          <div className="space-y-2">
            <label className="text-lg font-medium text-gray-700">テスト音</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => playTestSound(SoundControls.SFX_TYPES.success)}
                className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                disabled={isMuted}
              >
                🎉 成功音
              </button>
              <button
                onClick={() => playTestSound(SoundControls.SFX_TYPES.levelUp)}
                className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                disabled={isMuted}
              >
                ⬆️ レベルアップ
              </button>
              <button
                onClick={() => playTestSound(SoundControls.SFX_TYPES.cardUse)}
                className="px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50"
                disabled={isMuted}
              >
                🃏 カード使用
              </button>
              <button
                onClick={() => playTestSound(SoundControls.SFX_TYPES.error)}
                className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                disabled={isMuted}
              >
                ❌ エラー音
              </button>
            </div>
          </div>

          {/* プリセット */}
          <div className="space-y-2">
            <label className="text-lg font-medium text-gray-700">音量プリセット</label>
            <div className="grid grid-cols-2 gap-2">
              {SoundControls.VOLUME_PRESETS.map((preset, index) => (
                <button
                  key={index}
                  onClick={() => applyPreset(preset)}
                  className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* 保存・閉じるボタン */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              閉じる
            </button>
          </div>
        </div>
      </div>

      {/* カスタムスライダーのスタイル */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
        }
        
        .slider:disabled::-webkit-slider-thumb {
          background: #9ca3af;
          cursor: not-allowed;
        }
        
        .slider:disabled::-moz-range-thumb {
          background: #9ca3af;
          cursor: not-allowed;
        }
        
        .slider:disabled {
          background: #e5e7eb;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default SoundSettings;