import { globalShortcut } from 'electron';
import { IPC } from '../src/shared/types';
import type { BrowserWindow } from 'electron';

/**
 * Registers a single global hotkey that signals the overlay window.
 *
 * Electron's globalShortcut API does not give us key-down / key-up events
 * separately, so push-to-talk is emulated: pressing the hotkey toggles
 * recording, and the renderer enforces "release stops" using a short timer
 * + re-press detection. For true KeyDown/KeyUp on Windows you'd swap this
 * for a low-level hook (uIOhook-napi); a stub is included below.
 */
export class HotkeyManager {
  private currentAccelerator: string | null = null;

  constructor(private getOverlay: () => BrowserWindow | null) {}

  /** Register (or re-register) the global hotkey. */
  register(accelerator: string) {
    this.unregister();
    try {
      const ok = globalShortcut.register(accelerator, () => {
        const overlay = this.getOverlay();
        if (overlay && !overlay.isDestroyed()) {
          overlay.webContents.send(IPC.hotkeyPressed);
        }
      });
      if (!ok) {
        console.warn(`[hotkeys] Failed to register accelerator "${accelerator}"`);
        return false;
      }
      this.currentAccelerator = accelerator;
      return true;
    } catch (err) {
      console.error('[hotkeys] register error:', err);
      return false;
    }
  }

  unregister() {
    if (this.currentAccelerator) {
      globalShortcut.unregister(this.currentAccelerator);
      this.currentAccelerator = null;
    }
  }

  unregisterAll() {
    globalShortcut.unregisterAll();
    this.currentAccelerator = null;
  }
}
