import { Tray, Menu, nativeImage, app, BrowserWindow } from 'electron';

/**
 * System tray icon + context menu. The overlay can be hidden by the user
 * or dragged off-screen, so the tray is the persistent surface.
 */
export function createTray(opts: {
  overlay: BrowserWindow;
  openSettings: () => void;
  iconPath: string;
}): Tray {
  const icon = nativeImage.createFromPath(opts.iconPath);

  if (icon.isEmpty()) {
    console.error(`[Tray] Failed to load icon from: ${opts.iconPath}`);
  }

  const tray = new Tray(icon);
  tray.setToolTip('Voice Overlay');

  const rebuildMenu = () => {
    const menu = Menu.buildFromTemplate([
      {
        label: opts.overlay.isVisible() ? 'Hide overlay' : 'Show overlay',
        click: () => {
          if (opts.overlay.isVisible()) opts.overlay.hide();
          else opts.overlay.show();
          rebuildMenu();
        }
      },
      { label: 'Settings…', click: opts.openSettings },
      { type: 'separator' },
      { label: 'Quit', click: () => app.quit() }
    ]);
    tray.setContextMenu(menu);
  };

  rebuildMenu();
  tray.on('click', () => {
    if (opts.overlay.isVisible()) opts.overlay.hide();
    else opts.overlay.show();
    rebuildMenu();
  });

  return tray;
}
