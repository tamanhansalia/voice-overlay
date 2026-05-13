import { BrowserWindow } from 'electron';
import { IPC } from '../src/shared/types';

export type LogLevel = 'info' | 'warn' | 'error';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
}

class Logger {
  private logs: LogEntry[] = [];
  private readonly maxLogs = 200;

  constructor() {
    this.hookConsole();
  }

  private hookConsole() {
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    console.log = (...args: any[]) => {
      originalLog(...args);
      this.addEntry('info', args.join(' '));
    };

    console.error = (...args: any[]) => {
      originalError(...args);
      this.addEntry('error', args.join(' '));
    };

    console.warn = (...args: any[]) => {
      originalWarn(...args);
      this.addEntry('warn', args.join(' '));
    };
  }

  private addEntry(level: LogLevel, message: string) {
    const entry: LogEntry = {
      timestamp: new Date().toLocaleTimeString(),
      level,
      message
    };

    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Broadcast to all open windows
    BrowserWindow.getAllWindows().forEach((win) => {
      if (!win.isDestroyed()) {
        win.webContents.send(IPC.logEvent, entry);
      }
    });
  }

  getHistory(): LogEntry[] {
    return [...this.logs];
  }

  clear() {
    this.logs = [];
  }
}

export const logger = new Logger();
