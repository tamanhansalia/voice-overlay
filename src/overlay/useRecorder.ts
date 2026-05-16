import { useCallback, useEffect, useRef, useState } from 'react';
import type { AppSettings, RecorderState } from '../shared/types';
import { makeProvider } from '../speech';
import type { ISpeechProvider } from '../speech/ISpeechProvider';
import { processCommand } from '../shared/commandProcessor';
import { playStartSound, playStopSound, playCommandSound } from './sounds';

/**
 * Owns the speech provider lifecycle and exposes a tiny state machine to
 * the UI. Final transcripts are routed to the main process for injection;
 * partial transcripts are surfaced via `partial` for the live ticker.
 */
export function useRecorder(initialSettings: AppSettings | null) {
  const [settings, setSettings] = useState<AppSettings | null>(initialSettings);
  const [state, setState] = useState<RecorderState>('idle');
  const [partial, setPartial] = useState<string>('');
  const [volume, setVolume] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const providerRef = useRef<ISpeechProvider | null>(null);
  const sessionRef = useRef(0);

  // Sync settings if they change from the outside (e.g. Settings window)
  useEffect(() => {
    setSettings(initialSettings);
  }, [initialSettings]);

  const stop = useCallback(async () => {
    const p = providerRef.current;
    providerRef.current = null;
    if (p) {
      setState('processing');
      if (settings?.soundEffectsEnabled) {
        playStopSound(settings.soundEffectsVolume);
      }
      try { await p.stop(); } catch { /* ignore */ }
    }
    setPartial('');
    setVolume(0);
    setState('idle');
  }, [settings]);

  const start = useCallback(async () => {
    if (!settings) return;
    if (state === 'processing' || state === 'listening') return;
    if (providerRef.current) return; // already running

    const currentSession = ++sessionRef.current;
    setError(null);
    setPartial('');
    setState('listening');

    const provider = makeProvider(settings);
    providerRef.current = provider;

    if (settings.soundEffectsEnabled) {
      playStartSound(settings.soundEffectsVolume);
    }

    try {
      await provider.start({
        onVolume: (v) => setVolume(v),
        onPartial: (t) => setPartial(t),
        onFinal: async (t) => {
          if (!t) return;
          setPartial('');

          // Voice Command detection
          if (settings.voiceCommandsEnabled) {
            const command = processCommand(t, settings.voiceCommandMode);
            if (command.type !== 'none') {
              console.log('[useRecorder] Executing voice command:', command.type);
              
              if (command.type === 'fix-grammar') {
                await stop();
                if (!settings.aiEnabled && !settings.blackboxEnabled) {
                  setError('AI features are disabled');
                  setState('error');
                  setTimeout(() => {
                    if (sessionRef.current === currentSession) setState('idle');
                  }, 3000);
                  return;
                }
                setState('processing');
                try {
                  const original = await window.api.readClipboard();
                  let fixed: string;
                  if (settings.blackboxEnabled) {
                    fixed = await window.api.askBlackbox(original, 'Fix grammar, spelling, and clarity. Maintain tone. Return ONLY the fixed text.');
                  } else {
                    fixed = await window.api.askAI(original, 'Fix grammar, spelling, and clarity. Maintain tone. Return ONLY the fixed text.');
                  }
                  await window.api.injectText(fixed);
                  if (settings.soundEffectsEnabled) {
                    playCommandSound(settings.soundEffectsVolume);
                  }
                  if (sessionRef.current === currentSession) setState('idle');
                } catch (e: any) {
                  setError(e.message || 'AI Fix failed');
                  setState('error');
                  setTimeout(() => {
                    if (sessionRef.current === currentSession) setState('idle');
                  }, 3000);
                }
                return;
              }

              if (command.type === 'describe-screen') {
                await stop();
                if (!settings.aiEnabled && !settings.blackboxEnabled) {
                  setError('AI features are disabled');
                  setState('error');
                  setTimeout(() => {
                    if (sessionRef.current === currentSession) setState('idle');
                  }, 3000);
                  return;
                }
                setState('processing');
                try {
                  const screenshot = await window.api.captureScreen();
                  let description: string;
                  if (settings.blackboxEnabled) {
                    description = await window.api.askBlackbox(screenshot, 'Describe this screenshot briefly and accurately.');
                  } else {
                    description = await window.api.askAI(screenshot, 'Describe this screenshot briefly and accurately.');
                  }
                  await window.api.injectText(description);
                  if (settings.soundEffectsEnabled) {
                    playCommandSound(settings.soundEffectsVolume);
                  }
                  if (sessionRef.current === currentSession) setState('idle');
                } catch (e: any) {
                  setError(e.message || 'Screen analysis failed');
                  setState('error');
                  setTimeout(() => {
                    if (sessionRef.current === currentSession) setState('idle');
                  }, 3000);
                }
                return;
              }

              await window.api.executeCommand(command.type);
              if (settings.soundEffectsEnabled) {
                playCommandSound(settings.soundEffectsVolume);
              }
              return;
            }
          }

          try {
            await window.api.recordTranscription(t);

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
          setTimeout(() => {
            if (sessionRef.current === currentSession) setState('idle');
          }, 3000);
        },
        onEnd: () => {
          if (providerRef.current === provider) {
            providerRef.current = null;
            if (sessionRef.current === currentSession) setState('idle');
          }
        }
      });
    } catch (e: any) {
      setError(e?.message ?? 'failed to start');
      setState('error');
      providerRef.current = null;
      setTimeout(() => {
        if (sessionRef.current === currentSession) setState('idle');
      }, 3000);
    }
  }, [settings, state, stop]);

  const toggle = useCallback(() => {
    if (providerRef.current) stop();
    else start();
  }, [start, stop]);

  // Bind global hotkey signals from main process
  useEffect(() => {
    const offPress = window.api.onHotkey(() => {
      if (settings?.pushToTalk) {
        // In PTT mode, press ALWAYS starts if not already listening
        if (providerRef.current === null) start();
      } else {
        // In Toggle mode, press flips the state
        toggle();
      }
    });

    const offRelease = window.api.onHotkeyReleased?.(() => {
      if (settings?.pushToTalk) {
        // In PTT mode, release ALWAYS stops
        stop();
      }
    });

    return () => {
      offPress();
      offRelease?.();
    };
  }, [settings, start, stop, toggle]);

  // Cleanup on unmount.
  useEffect(() => () => { providerRef.current?.stop().catch(() => {}); }, []);

  return { state, partial, volume, error, start, stop, toggle };
}
