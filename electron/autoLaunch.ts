import AutoLaunch from 'auto-launch';
import { app } from 'electron';

const launcher = new AutoLaunch({
  name: 'Voice Overlay',
  path: app.getPath('exe'),
  isHidden: true
});

export async function setAutoLaunch(enabled: boolean): Promise<void> {
  try {
    const current = await launcher.isEnabled();
    if (enabled && !current) await launcher.enable();
    if (!enabled && current) await launcher.disable();
  } catch (err) {
    console.error('[autoLaunch] failed:', err);
  }
}
