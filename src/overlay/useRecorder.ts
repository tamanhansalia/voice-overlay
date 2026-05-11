import { useCallback, useEffect, useRef, useState } from 'react';
import type { AppSettings, RecorderState } from '../shared/types';
import { makeProvider } from '../speech';
import type { ISpeechProvider } from '../speech/ISpeechProvider';

/**
 * Owns the speech provider lifecycle and exposes a tiny state machine to
 * the UI. Final transcripts are routed to the main process for injection;
 * partial transcripts are surfaced via `partial` for the live ticker.
 */
export function useRecorder(settings: AppSettings | null) {
  const [state, setState] = useState<RecorderState>('idle');
  const [partial, setPartial] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const providerRef = useRef<ISpeechProvider | null>(null);

  const stop = useCallback(async () => {
    const p = providerRef.current;
    providerRef.current = null;
    if (p) {
      setState('processing');
      try { await p.stop(); } catch { /* ignore */ }
    }
    setPartial('');
    setState('idle');
  }, []);

  const start = useCallback(async () => {
    if (!settings) return;
    if (providerRef.current) return; // already running
    setError(null);
    setPartial('');
    setState('listening');

    const provider = makeProvider(settings);
    providerRef.current = provider;

    try {
      await provider.start({
        onPartial: (t) => setPartial(t),
        onFinal: async (t) => {
          if (!t) return;
          setPartial('');
          try {
            if (settings.injectionMode === 'copy-only') {
              await window.api.copyToClipboard(t + ' ');
            } else {
              await window.api.injectText(t + ' ');
            }
          } catch (e) {
            console.error('inject failed', e);
          }
        },
        onError: (e) => {
          setError(e.message);
          setState('error');
          providerRef.current = null;
          // auto-recover after a moment
          setTimeout(() => setState('idle'), 1500);
        },
        onEnd: () => {
          if (providerRef.current === provider) {
            providerRef.current = null;
            setState('idle');
          }
        }
      });
    } catch (e: any) {
      setError(e?.message ?? 'failed to start');
      setState('error');
      providerRef.current = null;
      setTimeout(() => setState('idle'), 1500);
    }
  }, [settings]);

  const toggle = useCallback(() => {
    if (providerRef.current) stop();
    else start();
  }, [start, stop]);

  // Cleanup on unmount.
  useEffect(() => () => { providerRef.current?.stop().catch(() => {}); }, []);

  return { state, partial, error, start, stop, toggle };
}
