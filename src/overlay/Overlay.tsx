import { useEffect, useRef, useState } from 'react';
import type { AppSettings } from '../shared/types';
import { useRecorder } from './useRecorder';
import { Waveform } from './Waveform';
import './Overlay.css';

/**
 * The floating overlay component.
 * Displays a 56x56 circular "orb" within a 160x160 transparent window.
 * The window size provides padding for visual effects like glows and animations
 * without clipping the content.
 */
export function Overlay() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const { state, partial, volume, error, toggle } = useRecorder(settings);
  const tickerRef = useRef<HTMLDivElement>(null);

  // Load settings once and listen for changes.
  useEffect(() => {
    window.api.getSettings().then(setSettings);
    const off = window.api.onSettingsChanged(setSettings);
    return () => off();
  }, []);

  if (!settings) return null;

  return (
    <div
      className="overlay-root"
      data-state={state}
      style={{ '--volume-scale': 1 + volume * 0.5 } as any}
    >
      <button
        className="orb"
        title={'Voice Overlay (' + settings.hotkey + ')'}
        onClick={(e) => {
          // Single click toggles. Drag is handled by the window region below.
          if ((e.target as HTMLElement).closest('.drag-handle')) return;
          toggle();
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          window.api.openSettings();
        }}
      >
        <span
          className="drag-handle"
          aria-hidden
          onPointerDown={(e) => {
            e.preventDefault();
            e.currentTarget.setPointerCapture(e.pointerId);
            window.api.startDrag();
          }}
          onPointerUp={() => window.api.stopDrag()}
          onPointerCancel={() => window.api.stopDrag()}
        />
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
        <span className="pulse" aria-hidden />
      </button>

      {(partial || error) ? (
        <div className="ticker" ref={tickerRef}>
          {error ? <span className="err">{error}</span> : partial}
        </div>
      ) : null}
    </div>
  );
}
