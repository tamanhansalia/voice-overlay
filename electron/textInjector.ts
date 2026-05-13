import { clipboard } from 'electron';
import type { InjectionMode } from '../src/shared/types';

/**
 * Inject `text` into whatever app is currently focused on the OS.
 *
 * Strategies:
 *  - "type":      simulate per-character keystrokes (slow, but works in apps
 *                 that block paste — e.g. some terminals, password fields).
 *  - "paste":     write to the clipboard then send Ctrl+V (fast, preserves
 *                 unicode/emoji, works in 99% of apps including terminals).
 *  - "copy-only": just put it on the clipboard and let the user paste.
 *
 * nut-js is loaded lazily so the app still launches if the native module
 * failed to build — copy-only mode keeps working as a fallback.
 */
export class TextInjector {
  private nutPromise: Promise<typeof import('@nut-tree-fork/nut-js') | null> | null = null;
  private queue: Promise<void> = Promise.resolve();

  private loadNut() {
    if (!this.nutPromise) {
      this.nutPromise = import('@nut-tree-fork/nut-js')
        .then((mod) => {
          // Type fast, no UI tracking. Adjust if you want a human-like delay.
          mod.keyboard.config.autoDelayMs = 0;
          return mod;
        })
        .catch((err) => {
          console.error('[textInjector] nut-js failed to load:', err);
          return null;
        });
    }
    return this.nutPromise;
  }

  async inject(text: string, mode: InjectionMode): Promise<void> {
    if (!text) return;

    // Chain to the queue to ensure sequential execution.
    this.queue = this.queue.then(async () => {
      try {
        await this._doInject(text, mode);
      } catch (err) {
        console.error('[textInjector] injection failed:', err);
      }
    });

    return this.queue;
  }

  private async _doInject(text: string, mode: InjectionMode): Promise<void> {
    if (mode === 'copy-only') {
      clipboard.writeText(text);
      return;
    }

    if (mode === 'paste') {
      const previous = clipboard.readText();
      clipboard.writeText(text);

      const nut = await this.loadNut();
      if (!nut) {
        console.warn('[textInjector] nut-js unavailable, falling back to copy-only');
        return;
      }

      try {
        await nut.keyboard.pressKey(nut.Key.LeftControl, nut.Key.V);
        await nut.keyboard.releaseKey(nut.Key.LeftControl, nut.Key.V);
        // Wait for OS to process the paste before we even think about the next step
        await new Promise((resolve) => setTimeout(resolve, 150));
      } finally {
        // Restore previous clipboard and wait a bit more
        clipboard.writeText(previous);
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      return;
    }

    // mode === 'type'
    const nut = await this.loadNut();
    if (!nut) {
      clipboard.writeText(text);
      return;
    }
    await nut.keyboard.type(text);
    // Give a small breath after typing
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
}

export const textInjector = new TextInjector();
