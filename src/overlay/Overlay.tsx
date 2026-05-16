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
  const { state, partial, volume, error, toggle } = useRecorder(settings);
  const tickerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const dragRingRef = useRef<HTMLDivElement>(null);
  const ignoreStateRef = useRef<boolean | null>(null);

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

  // Cursor-aware mouse pass-through: mousemove is forwarded even when
  // setIgnoreMouseEvents(true) is active, so we use it to detect when the
  // cursor enters/leaves the drag-ring circle and toggle pass-through only
  // at the boundary. Only sends IPC when state actually changes.
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const ring = dragRingRef.current;
      if (!ring) return;
      const rect = ring.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const over = Math.hypot(e.clientX - cx, e.clientY - cy) <= rect.width / 2;
      const shouldIgnore = !over;
      if (shouldIgnore !== ignoreStateRef.current) {
        ignoreStateRef.current = shouldIgnore;
        window.api.setIgnoreMouseEvents(shouldIgnore);
      }
    };
    document.addEventListener('mousemove', onMove);
    return () => document.removeEventListener('mousemove', onMove);
  }, []);

  const handleDragStart = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    isDraggingRef.current = false;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    window.api.startDrag();
  }, []);

  const handleDragStop = useCallback(() => {
    window.api.stopDrag();
    // If pointer never moved, treat as a click on the orb
    if (!isDraggingRef.current) toggle();
    setTimeout(() => { isDraggingRef.current = false; }, 50);
  }, [toggle]);

  const handlePointerMove = useCallback(() => {
    isDraggingRef.current = true;
  }, []);

  if (!settings) return null;

  return (
    <div
      className="overlay-root"
      data-state={state}
      style={{ '--volume-scale': 1 + volume * 0.5 } as any}
    >
      {/* Invisible drag ring around the orb — wider hit area for easy grabbing */}
      <div
        ref={dragRingRef}
        className="drag-ring"
        aria-hidden
        onPointerDown={handleDragStart}
        onPointerUp={handleDragStop}
        onPointerMove={handlePointerMove}
        onPointerCancel={handleDragStop}
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
