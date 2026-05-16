import { uIOhook, UiohookKey } from 'uiohook-napi';
import { IPC } from '../src/shared/types';
import type { BrowserWindow } from 'electron';

/**
 * Maps Electron accelerator strings to uIOhook key codes.
 * This is a simplified map for common keys.
 */
const KEY_MAP: Record<string, number> = {
  'Space': UiohookKey.Space,
  'Alt': UiohookKey.Alt,
  'Control': UiohookKey.Ctrl,
  'Shift': UiohookKey.Shift,
  'Command': UiohookKey.Meta,
  'Meta': UiohookKey.Meta,
  'Cmd': UiohookKey.Meta,
  'Super': UiohookKey.Meta,
  'Tab': UiohookKey.Tab,
  'Escape': UiohookKey.Escape,
  'Enter': UiohookKey.Enter,
  'Backspace': UiohookKey.Backspace,
  'Delete': UiohookKey.Delete,
  'Insert': UiohookKey.Insert,
  'Up': UiohookKey.ArrowUp,
  'Down': UiohookKey.ArrowDown,
  'Left': UiohookKey.ArrowLeft,
  'Right': UiohookKey.ArrowRight,
  'Home': UiohookKey.Home,
  'End': UiohookKey.End,
  'PageUp': UiohookKey.PageUp,
  'PageDown': UiohookKey.PageDown,
  'Capslock': UiohookKey.CapsLock,
  'Numlock': UiohookKey.NumLock,
  'Scrolllock': UiohookKey.ScrollLock,
  'F1': UiohookKey.F1,
  'F2': UiohookKey.F2,
  'F3': UiohookKey.F3,
  'F4': UiohookKey.F4,
  'F5': UiohookKey.F5,
  'F6': UiohookKey.F6,
  'F7': UiohookKey.F7,
  'F8': UiohookKey.F8,
  'F9': UiohookKey.F9,
  'F10': UiohookKey.F10,
  'F11': UiohookKey.F11,
  'F12': UiohookKey.F12,
  'A': UiohookKey.A,
  'B': UiohookKey.B,
  'C': UiohookKey.C,
  'D': UiohookKey.D,
  'E': UiohookKey.E,
  'F': UiohookKey.F,
  'G': UiohookKey.G,
  'H': UiohookKey.H,
  'I': UiohookKey.I,
  'J': UiohookKey.J,
  'K': UiohookKey.K,
  'L': UiohookKey.L,
  'M': UiohookKey.M,
  'N': UiohookKey.N,
  'O': UiohookKey.O,
  'P': UiohookKey.P,
  'Q': UiohookKey.Q,
  'R': UiohookKey.R,
  'S': UiohookKey.S,
  'T': UiohookKey.T,
  'U': UiohookKey.U,
  'V': UiohookKey.V,
  'W': UiohookKey.W,
  'X': UiohookKey.X,
  'Y': UiohookKey.Y,
  'Z': UiohookKey.Z,
  '0': UiohookKey['0'],
  '1': UiohookKey['1'],
  '2': UiohookKey['2'],
  '3': UiohookKey['3'],
  '4': UiohookKey['4'],
  '5': UiohookKey['5'],
  '6': UiohookKey['6'],
  '7': UiohookKey['7'],
  '8': UiohookKey['8'],
  '9': UiohookKey['9'],
};

/**
 * Registers global hotkeys using uIOhook-napi to support both
 * KeyDown and KeyUp events (required for Push-to-Talk).
 */
export class HotkeyManager {
  private targetKey: number = UiohookKey.Space;
  private targetModifiers: number[] = [UiohookKey.Alt];
  private activeKeys = new Set<number>();
  private isPressed = false;

  constructor(private getOverlay: () => BrowserWindow | null) {
    uIOhook.on('keydown', (e) => {
      this.activeKeys.add(e.keycode);
      if (e.keycode === UiohookKey.Backspace) {
        this.getOverlay()?.webContents.send(IPC.stopRecordingRequested);
      }
      this.checkState();
    });

    uIOhook.on('keyup', (e) => {
      this.activeKeys.delete(e.keycode);
      this.checkState();
    });

    uIOhook.start();
  }

  private checkState() {
    const overlay = this.getOverlay();
    if (!overlay || overlay.isDestroyed()) return;

    const allPressed = this.targetModifiers.every(m => this.activeKeys.has(m)) && 
                       this.activeKeys.has(this.targetKey);

    if (allPressed && !this.isPressed) {
      this.isPressed = true;
      overlay.webContents.send(IPC.hotkeyPressed);
    } else if (!allPressed && this.isPressed) {
      this.isPressed = false;
      overlay.webContents.send(IPC.hotkeyReleased);
    }
  }

  /** 
   * Parse Electron-style accelerator (e.g. "Alt+Space") into uIOhook codes.
   */
  register(accelerator: string) {
    const parts = accelerator.split('+').map(p => p.trim());
    const mainKey = parts.pop();
    if (!mainKey) return false;

    this.targetKey = KEY_MAP[mainKey] || UiohookKey.Space;
    this.targetModifiers = parts.map(p => {
      if (p === 'CommandOrControl' || p === 'CmdOrCtrl') {
        return process.platform === 'darwin' ? UiohookKey.Meta : UiohookKey.Ctrl;
      }
      return KEY_MAP[p] || 0;
    }).filter(m => m !== 0);

    console.log(`[hotkeys] Registered ${accelerator} (Key: ${this.targetKey}, Mods: ${this.targetModifiers})`);
    return true;
  }

  unregister() {
    // uIOhook is global, we just stop tracking the target key
    this.targetKey = 0;
    this.targetModifiers = [];
  }

  unregisterAll() {
    uIOhook.stop();
  }
}
