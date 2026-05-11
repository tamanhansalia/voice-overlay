import Store from 'electron-store';
import { AppSettings, DEFAULT_SETTINGS } from '../src/shared/types';

/**
 * Thin wrapper around electron-store providing typed access to user settings.
 * The file lives at %APPDATA%/voice-overlay/config.json on Windows.
 */
class SettingsStore {
  private store: Store<AppSettings>;

  constructor() {
    this.store = new Store<AppSettings>({
      name: 'config',
      defaults: DEFAULT_SETTINGS
    });
  }

  getAll(): AppSettings {
    // Merge defaults so newly added keys are populated on upgrade.
    return { ...DEFAULT_SETTINGS, ...(this.store.store as AppSettings) };
  }

  update(patch: Partial<AppSettings>): AppSettings {
    const next = { ...this.getAll(), ...patch };
    this.store.set(next as unknown as Record<string, unknown>);
    return next;
  }
}

export const settingsStore = new SettingsStore();
