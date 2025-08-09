'use client';

// 音響システム - BGM・効果音管理
export class SoundSystem {
  private static instance: SoundSystem;
  private audioContext: AudioContext | null = null;
  private bgmAudio: HTMLAudioElement | null = null;
  private sfxAudios: Map<string, HTMLAudioElement> = new Map();
  private isMuted = false;
  private bgmVolume = 0.3;
  private sfxVolume = 0.5;
  private initialized = false;

  // シングルトンパターン
  static getInstance(): SoundSystem {
    if (!SoundSystem.instance) {
      SoundSystem.instance = new SoundSystem();
    }
    return SoundSystem.instance;
  }

  // 初期化（ユーザーアクション後に呼ぶ）
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Web Audio API の初期化
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // 効果音の事前ロード
      await this.preloadSounds();
      
      this.initialized = true;
      console.log('Sound system initialized');
    } catch (error) {
      console.error('Failed to initialize sound system:', error);
    }
  }

  // 効果音の事前ロード
  private async preloadSounds(): Promise<void> {
    const soundList = [
      { key: 'card_use', url: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj' },
      { key: 'level_up', url: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj' },
      { key: 'success', url: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj' },
      { key: 'error', url: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj' }
    ];

    for (const sound of soundList) {
      try {
        const audio = new Audio();
        audio.volume = this.sfxVolume;
        audio.preload = 'auto';
        
        // ベース64データまたは実際のファイルURL
        if (sound.url.startsWith('data:')) {
          audio.src = sound.url;
        } else {
          audio.src = `/sounds/${sound.url}`;
        }
        
        this.sfxAudios.set(sound.key, audio);
      } catch (error) {
        console.warn(`Failed to preload sound: ${sound.key}`, error);
      }
    }
  }

  // BGM再生
  async playBGM(track: string): Promise<void> {
    if (this.isMuted || !this.initialized) return;

    try {
      // 既存のBGMを停止
      if (this.bgmAudio) {
        this.bgmAudio.pause();
        this.bgmAudio = null;
      }

      // 新しいBGMを作成・再生
      this.bgmAudio = new Audio();
      this.bgmAudio.volume = this.bgmVolume;
      this.bgmAudio.loop = true;
      this.bgmAudio.src = this.getBGMUrl(track);

      await this.bgmAudio.play();
    } catch (error) {
      console.warn('Failed to play BGM:', track, error);
    }
  }

  // BGM停止
  stopBGM(): void {
    if (this.bgmAudio) {
      this.bgmAudio.pause();
      this.bgmAudio = null;
    }
  }

  // 効果音再生
  async playSFX(soundKey: string): Promise<void> {
    if (this.isMuted || !this.initialized) return;

    try {
      const audio = this.sfxAudios.get(soundKey);
      if (audio) {
        audio.currentTime = 0; // 再生位置をリセット
        await audio.play();
      } else {
        // 動的に効果音を生成（ビープ音など）
        await this.generateSFX(soundKey);
      }
    } catch (error) {
      console.warn('Failed to play SFX:', soundKey, error);
    }
  }

  // プログラム生成効果音（Web Audio API使用）
  private async generateSFX(soundType: string): Promise<void> {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // 音の種類に応じて周波数を設定
    switch (soundType) {
      case 'card_use':
        oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.1);
        break;
      case 'level_up':
        oscillator.frequency.setValueAtTime(523, this.audioContext.currentTime); // C5
        oscillator.frequency.setValueAtTime(659, this.audioContext.currentTime + 0.1); // E5
        oscillator.frequency.setValueAtTime(784, this.audioContext.currentTime + 0.2); // G5
        break;
      case 'success':
        oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime);
        break;
      case 'error':
        oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
        break;
      default:
        oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime); // A4
    }

    // 音量エンベロープ
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(this.sfxVolume * 0.3, this.audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.3);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.3);
  }

  // BGM URL取得（フリー素材または生成音楽）
  private getBGMUrl(track: string): string {
    const bgmList: Record<string, string> = {
      'menu': 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav', // プレースホルダー
      'training': '/bgm/training.mp3',
      'match': '/bgm/match.mp3',
      'victory': '/bgm/victory.mp3',
    };

    return bgmList[track] || '';
  }

  // 音量設定
  setBGMVolume(volume: number): void {
    this.bgmVolume = Math.max(0, Math.min(1, volume));
    if (this.bgmAudio) {
      this.bgmAudio.volume = this.bgmVolume;
    }
  }

  setSFXVolume(volume: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
    this.sfxAudios.forEach(audio => {
      audio.volume = this.sfxVolume;
    });
  }

  // ミュート制御
  setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (muted && this.bgmAudio) {
      this.bgmAudio.pause();
    }
  }

  toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  // 状態取得
  isMutedStatus(): boolean {
    return this.isMuted;
  }

  getBGMVolume(): number {
    return this.bgmVolume;
  }

  getSFXVolume(): number {
    return this.sfxVolume;
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  // クリーンアップ
  dispose(): void {
    this.stopBGM();
    this.sfxAudios.clear();
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.initialized = false;
  }
}

// React Hook用のユーティリティ
export const useSoundSystem = () => {
  const soundSystem = SoundSystem.getInstance();

  // 初期化用ヘルパー（ユーザーインタラクション後に呼ぶ）
  const initializeSound = async () => {
    if (!soundSystem.isInitialized()) {
      await soundSystem.initialize();
    }
  };

  return {
    initializeSound,
    playBGM: (track: string) => soundSystem.playBGM(track),
    stopBGM: () => soundSystem.stopBGM(),
    playSFX: (soundKey: string) => soundSystem.playSFX(soundKey),
    setBGMVolume: (volume: number) => soundSystem.setBGMVolume(volume),
    setSFXVolume: (volume: number) => soundSystem.setSFXVolume(volume),
    toggleMute: () => soundSystem.toggleMute(),
    isMuted: () => soundSystem.isMutedStatus(),
    getBGMVolume: () => soundSystem.getBGMVolume(),
    getSFXVolume: () => soundSystem.getSFXVolume(),
  };
};

// 音響設定コンポーネント用のヘルパー
export const SoundControls = {
  // 音量設定用のプリセット
  VOLUME_PRESETS: [
    { name: '無音', bgm: 0, sfx: 0 },
    { name: '静音', bgm: 0.1, sfx: 0.2 },
    { name: '標準', bgm: 0.3, sfx: 0.5 },
    { name: '大音量', bgm: 0.7, sfx: 0.8 },
  ],

  // ゲームシーン別BGM推奨設定
  SCENE_BGM: {
    menu: 'menu',
    training: 'training',
    match: 'match',
    victory: 'victory',
  },

  // 効果音種別
  SFX_TYPES: {
    cardUse: 'card_use',
    levelUp: 'level_up',
    success: 'success',
    error: 'error',
  }
};