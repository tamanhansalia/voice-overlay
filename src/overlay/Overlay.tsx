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

  const handleDragStart = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    isDraggingRef.current = false;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    window.api.startDrag();
  }, []);

  const handleDragStop = useCallback(() => {
    window.api.stopDrag();
    // Reset after a short delay so a simple click doesn't trigger toggle
    setTimeout(() => { isDraggingRef.current = false; }, 50);
  }, []);

  const handlePointerMove = useCallback(() => {
    isDraggingRef.current = true;
  }, []);

  const handleOrbClick = useCallback(() => {
    // If we just finished dragging, don't toggle
    if (isDraggingRef.current) return;
    toggle();
  }, [toggle]);

  if (!settings) return null;

  return (
    <div
      className="overlay-root"
      data-state={state}
      style={{ '--volume-scale': 1 + volume * 0.5 } as any}
    >
      {/* Invisible drag ring around the orb — wider hit area for easy grabbing */}
      <div
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
        onClick={handleOrbClick}
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
