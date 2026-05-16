import { useEffect, useRef, useState, useCallback } from 'react';
import type { AppSettings } from '../shared/types';
import { useRecorder } from './useRecorder';
import { Waveform } from './Waveform';
import './Overlay.css';

/**
 * The floating overlay component.
 * Displays a 56x56 circular "orb" within a 160x160 transparent window.
 */
export function Overlay() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const { state, partial, volume, error, start, stop } = useRecorder(settings);
  const tickerRef = useRef<HTMLDivElement>(null);
  const isPointerDownRef = useRef(false);
  const activePointerIdRef = useRef<number | null>(null);

  useEffect(() => {
    window.api.getSettings().then(setSettings);
    const off = window.api.onSettingsChanged(setSettings);
    return () => off();
  }, []);

  // Disable right-click entirely on the overlay window
  useEffect(() => {
    const handler = (e: MouseEvent) => e.preventDefault();
    window.addEventListener('contextmenu', handler);
    return () => window.removeEventListener('contextmenu', handler);
  }, []);

  useEffect(() => {
    const offStop = window.api.onStopRecordingRequested(stop);
    return () => offStop();
  }, [stop]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (e.button === 0) {
      e.preventDefault();
      e.stopPropagation();
      if (state === 'listening') stop();
      else start();
      return;
    }

    if (e.button === 3) {
      e.preventDefault();
      e.stopPropagation();
      stop();
      return;
    }

    if (e.button !== 2) return;
    e.preventDefault();
    e.stopPropagation();
    isPointerDownRef.current = true;
    activePointerIdRef.current = e.pointerId;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    window.api.startDrag();
  }, [state, start, stop]);

  const finishDrag = useCallback((e: React.PointerEvent) => {
    if (!isPointerDownRef.current || activePointerIdRef.current !== e.pointerId) return;
    e.preventDefault();
    e.stopPropagation();
    if ((e.currentTarget as HTMLElement).hasPointerCapture(e.pointerId)) {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    }
    isPointerDownRef.current = false;
    activePointerIdRef.current = null;
    window.api.stopDrag();
  }, []);

  const handleDragStop = useCallback((e: React.PointerEvent) => {
    finishDrag(e);
  }, [finishDrag]);

  const handleDragCancel = useCallback((e: React.PointerEvent) => {
    finishDrag(e);
  }, [finishDrag]);

  if (!settings) return null;

  return (
    <div
      className="overlay-root"
      data-state={state}
      style={{ '--volume-scale': 1 + volume * 0.5 } as any}
    >
      {/* Invisible drag ring — grab anywhere around the orb to move the overlay */}
      <div
        className="drag-ring"
        aria-hidden
        onPointerDown={handlePointerDown}
        onPointerUp={handleDragStop}
        onPointerCancel={handleDragCancel}
      />

      <button
        className="orb"
        title={'Voice Overlay (' + settings.hotkey + ')'}
      >
        <div className="icon-wrap">
          {state === 'listening' && settings.waveformEnabled ? (
            <Waveform volume={volume} active={state === 'listening'} />
          ) : (
            <svg className="mic" viewBox="0 0 24 24" width="22" height="22" aria-hidden>
              <path
                fill="currentColor"
                d="M12 14a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v5a3 3 0 0 0 3 3Zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21h2v-3.08A7 7 0 0 0 19 11h-2Z"
              />
            </svg>
          )}
        </div>
      </button>

      {(partial || error) ? (
        <div className="ticker" ref={tickerRef}>
          {error ? <span className="err">{error}</span> : partial}
        </div>
      ) : null}
    </div>
  );
}
