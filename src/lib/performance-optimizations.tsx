// パフォーマンス最適化とUI/UX改善

import { useMemo, useCallback, useRef, useEffect, useState } from 'react';

// メモ化ヘルパー関数群
export const MemoHelpers = {
  // 深い比較用のメモ化（オブジェクト/配列向け）
  useDeepMemo: <T extends any>(value: T, deps: any[]): T => {
    return useMemo(() => value, [JSON.stringify(deps)]);
  },

  // プロップス変更検出
  usePropsChanged: (props: Record<string, any>): boolean => {
    const prevProps = useRef(props);
    const hasChanged = Object.keys(props).some(
      key => props[key] !== prevProps.current[key]
    );
    
    useEffect(() => {
      prevProps.current = props;
    });
    
    return hasChanged;
  },

  // 頻繁な状態更新の最適化（デバウンス）
  useDebouncedState: <T extends any>(initialValue: T, delay: number = 300): [T, (value: T) => void] => {
    const [state, setState] = useState(initialValue);
    const timeoutRef = useRef<NodeJS.Timeout>();

    const debouncedSetState = useCallback((value: T) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        setState(value);
      }, delay);
    }, [delay]);

    return [state, debouncedSetState];
  }
};

// 仮想化対応のリストコンポーネント
export const VirtualizedList = {
  // 大量のカード表示用
  useVirtualizedCards: (cards: any[], containerHeight: number, itemHeight: number) => {
    const [scrollTop, setScrollTop] = useState(0);
    
    return useMemo(() => {
      const visibleCount = Math.ceil(containerHeight / itemHeight) + 2; // バッファ
      const startIndex = Math.floor(scrollTop / itemHeight);
      const endIndex = Math.min(startIndex + visibleCount, cards.length);
      
      return {
        visibleItems: cards.slice(startIndex, endIndex),
        startIndex,
        totalHeight: cards.length * itemHeight,
        offsetY: startIndex * itemHeight,
        setScrollTop
      };
    }, [cards, containerHeight, itemHeight, scrollTop]);
  }
};

// アニメーション最適化
export const AnimationOptimizers = {
  // requestAnimationFrame を使った滑らかなアニメーション
  useRAFAnimation: (duration: number, easing: (t: number) => number = t => t) => {
    const [progress, setProgress] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const rafRef = useRef<number>();
    const startTimeRef = useRef<number>();

    const start = useCallback(() => {
      setIsRunning(true);
      setProgress(0);
      startTimeRef.current = performance.now();

      const animate = (currentTime: number) => {
        if (!startTimeRef.current) return;
        
        const elapsed = currentTime - startTimeRef.current;
        const normalizedTime = Math.min(elapsed / duration, 1);
        const easedProgress = easing(normalizedTime);
        
        setProgress(easedProgress);
        
        if (normalizedTime < 1) {
          rafRef.current = requestAnimationFrame(animate);
        } else {
          setIsRunning(false);
        }
      };

      rafRef.current = requestAnimationFrame(animate);
    }, [duration, easing]);

    const stop = useCallback(() => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      setIsRunning(false);
    }, []);

    useEffect(() => {
      return () => {
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
        }
      };
    }, []);

    return { progress, isRunning, start, stop };
  },

  // CSSアニメーション最適化
  optimizeCSS: () => ({
    // will-change を適切に設定
    willChangeTransform: { willChange: 'transform' },
    willChangeOpacity: { willChange: 'opacity' },
    willChangeAuto: { willChange: 'auto' },
    
    // GPU アクセラレーション
    gpuAcceleration: { transform: 'translateZ(0)' },
    
    // 効率的なトランジション
    smoothTransition: { 
      transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)' 
    }
  })
};

// メモリ管理
export const MemoryManagement = {
  // 大きなオブジェクトの遅延読み込み
  useLazyLoad: <T extends any>(loadFunction: () => Promise<T>, deps: any[]) => {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
      let cancelled = false;
      
      const load = async () => {
        setLoading(true);
        setError(null);
        
        try {
          const result = await loadFunction();
          if (!cancelled) {
            setData(result);
          }
        } catch (err) {
          if (!cancelled) {
            setError(err instanceof Error ? err : new Error('Unknown error'));
          }
        } finally {
          if (!cancelled) {
            setLoading(false);
          }
        }
      };

      load();

      return () => {
        cancelled = true;
      };
    }, deps);

    return { data, loading, error };
  },

  // 不要なリスナーの自動クリーンアップ
  useCleanupEffect: (effect: () => (() => void) | void, deps: any[]) => {
    useEffect(() => {
      const cleanup = effect();
      return cleanup;
    }, deps);
  }
};

// バッチング最適化
export const BatchingHelpers = {
  // 複数の状態更新をバッチ化
  useBatchedUpdates: () => {
    const updatesRef = useRef<(() => void)[]>([]);
    const timeoutRef = useRef<NodeJS.Timeout>();

    return useCallback((updateFunction: () => void) => {
      updatesRef.current.push(updateFunction);
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        // ReactのunstableBatchedUpdatesを使用（available時）
        if (typeof window !== 'undefined' && (window as any).React?.unstable_batchedUpdates) {
          (window as any).React.unstable_batchedUpdates(() => {
            updatesRef.current.forEach(update => update());
            updatesRef.current = [];
          });
        } else {
          updatesRef.current.forEach(update => update());
          updatesRef.current = [];
        }
      }, 0);
    }, []);
  }
};

// 画像最適化
export const ImageOptimization = {
  // 遅延読み込み画像コンポーネント
  LazyImage: ({ src, alt, placeholder, className, ...props }: {
    src: string;
    alt: string;
    placeholder?: string;
    className?: string;
    [key: string]: any;
  }) => {
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
      const img = imgRef.current;
      if (!img) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            const imageLoader = new Image();
            imageLoader.src = src;
            imageLoader.onload = () => setLoaded(true);
            imageLoader.onerror = () => setError(true);
            observer.unobserve(img);
          }
        },
        { threshold: 0.1 }
      );

      observer.observe(img);

      return () => {
        observer.unobserve(img);
      };
    }, [src]);

    return (
      <div className={`relative ${className}`} {...props}>
        <img
          ref={imgRef}
          src={loaded ? src : placeholder}
          alt={alt}
          className={`transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        />
        {!loaded && !error && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
        )}
        {error && (
          <div className="absolute inset-0 bg-gray-200 flex items-center justify-center text-gray-500">
            読み込めませんでした
          </div>
        )}
      </div>
    );
  }
};

ImageOptimization.LazyImage.displayName = 'LazyImage';

// レスポンシブ対応
export const ResponsiveHelpers = {
  // ブレークポイント検出
  useBreakpoint: () => {
    const [breakpoint, setBreakpoint] = useState<'sm' | 'md' | 'lg' | 'xl'>('md');

    useEffect(() => {
      const updateBreakpoint = () => {
        const width = window.innerWidth;
        if (width < 640) setBreakpoint('sm');
        else if (width < 768) setBreakpoint('md');
        else if (width < 1024) setBreakpoint('lg');
        else setBreakpoint('xl');
      };

      updateBreakpoint();
      window.addEventListener('resize', updateBreakpoint);
      
      return () => window.removeEventListener('resize', updateBreakpoint);
    }, []);

    return breakpoint;
  },

  // タッチデバイス検出
  useTouch: () => {
    const [isTouch, setIsTouch] = useState(false);

    useEffect(() => {
      setIsTouch(
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        (navigator as any).msMaxTouchPoints > 0
      );
    }, []);

    return isTouch;
  }
};

// アクセシビリティ改善
export const AccessibilityHelpers = {
  // フォーカス管理
  useFocusManagement: () => {
    const focusableElementsSelector = 
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

    const trapFocus = useCallback((container: HTMLElement) => {
      const focusableElements = container.querySelectorAll(focusableElementsSelector);
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              e.preventDefault();
              lastElement.focus();
            }
          } else {
            if (document.activeElement === lastElement) {
              e.preventDefault();
              firstElement.focus();
            }
          }
        }
        if (e.key === 'Escape') {
          container.focus();
        }
      };

      container.addEventListener('keydown', handleKeyDown);
      firstElement?.focus();

      return () => container.removeEventListener('keydown', handleKeyDown);
    }, []);

    return { trapFocus };
  },

  // スクリーンリーダー対応
  useScreenReader: () => {
    const announceToScreenReader = useCallback((message: string) => {
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', 'polite');
      announcement.setAttribute('aria-atomic', 'true');
      announcement.classList.add('sr-only');
      announcement.textContent = message;
      
      document.body.appendChild(announcement);
      
      setTimeout(() => {
        document.body.removeChild(announcement);
      }, 1000);
    }, []);

    return { announceToScreenReader };
  }
};

// キャッシュ戦略
export const CacheStrategies = {
  // LRU キャッシュ実装
  createLRUCache: <K extends any, V extends any>(maxSize: number) => {
    const cache = new Map<K, V>();

    const get = (key: K): V | undefined => {
      const value = cache.get(key);
      if (value !== undefined) {
        // LRU: 再度設定して最新にする
        cache.delete(key);
        cache.set(key, value);
      }
      return value;
    };

    const set = (key: K, value: V): void => {
      if (cache.has(key)) {
        cache.delete(key);
      } else if (cache.size >= maxSize) {
        // 最も古い要素を削除
        const firstKey = cache.keys().next().value;
        cache.delete(firstKey);
      }
      cache.set(key, value);
    };

    const clear = (): void => {
      cache.clear();
    };

    return { get, set, clear, size: () => cache.size };
  },

  // セッションストレージ活用
  useSessionCache: <T extends any>(key: string, initialValue: T) => {
    const [value, setValue] = useState<T>(() => {
      try {
        const item = sessionStorage.getItem(key);
        return item ? JSON.parse(item) : initialValue;
      } catch {
        return initialValue;
      }
    });

    const setCachedValue = useCallback((newValue: T) => {
      setValue(newValue);
      try {
        sessionStorage.setItem(key, JSON.stringify(newValue));
      } catch (error) {
        console.warn('Failed to save to sessionStorage:', error);
      }
    }, [key]);

    return [value, setCachedValue] as const;
  }
};

// デバッグ支援
export const DebugHelpers = {
  // レンダリング回数トラッキング
  useRenderCount: (componentName: string) => {
    const renderCount = useRef(0);
    renderCount.current += 1;

    useEffect(() => {
      console.log(`${componentName} rendered ${renderCount.current} times`);
    });

    return renderCount.current;
  },

  // プロップス変更トラッキング
  useWhyDidYouUpdate: (name: string, props: Record<string, any>) => {
    const previousProps = useRef<Record<string, any>>();

    useEffect(() => {
      if (previousProps.current) {
        const allKeys = Object.keys({ ...previousProps.current, ...props });
        const changedProps: Record<string, { from: any; to: any }> = {};

        allKeys.forEach(key => {
          if (previousProps.current![key] !== props[key]) {
            changedProps[key] = {
              from: previousProps.current![key],
              to: props[key]
            };
          }
        });

        if (Object.keys(changedProps).length) {
          console.log('[why-did-you-update]', name, changedProps);
        }
      }

      previousProps.current = props;
    });
  }
};

// パフォーマンス監視フック
export const usePerformanceMonitor = (componentName: string) => {
  const startTime = useRef<number>();

  useEffect(() => {
    startTime.current = performance.now();
    
    return () => {
      if (startTime.current) {
        const endTime = performance.now();
        const duration = endTime - startTime.current;
        
        if (duration > 16.67) { // 60fps threshold
          console.warn(`${componentName} took ${duration.toFixed(2)}ms to render`);
        }
      }
    };
  });
};