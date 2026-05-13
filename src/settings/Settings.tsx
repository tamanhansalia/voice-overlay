import { useEffect, useState, useRef } from 'react';
import type { AppSettings, ProviderName, InjectionMode, LogEntry } from '../shared/types';
import './Settings.css';

const PROVIDERS: { value: ProviderName; label: string; hint: string }[] = [
  { value: 'whisper-local', label: 'Whisper Local (recommended)', hint: 'Offline, no API key. ~40 MB model downloads once and is cached.' },
  { value: 'webspeech', label: 'Web Speech', hint: 'Uses Google\'s service — requires a special Chromium build. Falls back to Whisper Local automatically.' },
  { value: 'deepgram', label: 'Deepgram (streaming)', hint: 'Fastest. Needs a Deepgram API key.' },
  { value: 'whisper-openai', label: 'Whisper (OpenAI API)', hint: 'High accuracy. Needs an OpenAI API key.' }
];

const INJECTION: { value: InjectionMode; label: string; hint: string }[] = [
  { value: 'paste', label: 'Paste (recommended)', hint: 'Fast, works in terminals and IDEs.' },
  { value: 'type', label: 'Type keystrokes', hint: 'Slowest, but works in fields that block paste.' },
  { value: 'copy-only', label: 'Copy only', hint: "Don't auto-paste — only copy to clipboard." }
];

const ICONS = {
  provider: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a10 10 0 1 0 10 10H12V2z" />
      <path d="M12 12L2.1 12.1" />
      <path d="M12 12L12 22" />
      <path d="M12 12L22 12" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  shortcut: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M6 8h.01" />
      <path d="M10 8h.01" />
      <path d="M14 8h.01" />
      <path d="M18 8h.01" />
      <path d="M8 12h.01" />
      <path d="M12 12h.01" />
      <path d="M16 12h.01" />
      <path d="M7 16h10" />
    </svg>
  ),
  output: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  system: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  logs: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
      <polyline points="13 2 13 9 20 9" />
    </svg>
  )
};

export function Settings() {
  const [s, setS] = useState<AppSettings | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => { window.api.getSettings().then(setS); }, []);

  const update = async (patch: Partial<AppSettings>) => {
    if (!s) return;
    // Optimistic update
    const nextS = { ...s, ...patch };
    setS(nextS);
    
    await window.api.setSettings(patch);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!s) return <div className="loading">Loading…</div>;

  return (
    <div className="settings">
      <header>
        <h1>Voice Overlay</h1>
        <p className="sub">Global voice-to-text for Windows.</p>
      </header>

      <Section title="Provider" icon={ICONS.provider}>
        <div className="radios">
          {PROVIDERS.map((p) => (
            <label key={p.value} className={'radio' + (s.provider === p.value ? ' active' : '')}>
              <input type="radio" name="provider" checked={s.provider === p.value} onChange={() => update({ provider: p.value })} />
              <div>
                <div className="lbl">{p.label}</div>
                <div className="hint">{p.hint}</div>
              </div>
            </label>
          ))}
        </div>
        {s.provider === 'deepgram' && (
          <Field label="Deepgram API key">
            <input type="password" value={s.deepgramApiKey} onChange={(e) => update({ deepgramApiKey: e.target.value })} placeholder="dg_..." />
          </Field>
        )}
        {s.provider === 'whisper-openai' && (
          <Field label="OpenAI API key">
            <input type="password" value={s.openAiApiKey} onChange={(e) => update({ openAiApiKey: e.target.value })} placeholder="sk-..." />
          </Field>
        )}
      </Section>

      <Section title="Shortcut" icon={ICONS.shortcut}>
        <Field label="Global hotkey">
          <input type="text" value={s.hotkey} onChange={(e) => update({ hotkey: e.target.value })} placeholder="Alt+Space" />
        </Field>
        <Toggle label="Push-to-talk (hold key)" checked={s.pushToTalk} onChange={(v) => update({ pushToTalk: v })} />
      </Section>

      <Section title="Output" icon={ICONS.output}>
        <div className="radios">
          {INJECTION.map((p) => (
            <label key={p.value} className={'radio' + (s.injectionMode === p.value ? ' active' : '')}>
              <input type="radio" name="injection" checked={s.injectionMode === p.value} onChange={() => update({ injectionMode: p.value })} />
              <div>
                <div className="lbl">{p.label}</div>
                <div className="hint">{p.hint}</div>
              </div>
            </label>
          ))}
        </div>
        <Toggle label="Auto-punctuation" checked={s.autoPunctuation} onChange={(v) => update({ autoPunctuation: v })} />
        <Field label="Language (BCP-47)">
          <input type="text" value={s.language} onChange={(e) => update({ language: e.target.value })} placeholder="en-US" />
        </Field>
      </Section>

      <Section title="System" icon={ICONS.system}>
        <Toggle label="Start on Windows login" checked={s.autoLaunch} onChange={(v) => update({ autoLaunch: v })} />
        <button className="danger" onClick={() => window.api.quitApp()}>Quit Voice Overlay</button>
      </Section>

      <Section title="System Logs" icon={ICONS.logs}>
        <LogViewer />
      </Section>

      <div className={'saved' + (saved ? ' show' : '')}>Settings Saved</div>
    </div>
  );
}

function LogViewer() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.api.getLogs().then(setLogs);
    const off = window.api.onLog((entry: LogEntry) => {
      setLogs((prev) => [...prev.slice(-199), entry]);
    });
    return () => off();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const clear = async () => {
    await window.api.clearLogs();
    setLogs([]);
  };

  return (
    <div className="log-viewer">
      <div className="log-header">
        <button className="clear-btn" onClick={clear}>Clear Logs</button>
      </div>
      <div className="log-content" ref={scrollRef}>
        {logs.length === 0 ? (
          <div className="empty">No logs yet.</div>
        ) : (
          logs.map((log, i) => (
            <div key={i} className={`log-entry ${log.level}`}>
              <span className="time">[{log.timestamp}]</span>
              <span className="lvl">[{log.level.toUpperCase()}]</span>
              <span className="msg">{log.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function Section(props: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section>
      <h2>{props.icon} {props.title}</h2>
      <div className="section-body">{props.children}</div>
    </section>
  );
}

function Field(props: { label: string; children: React.ReactNode }) {
  return (
    <label className="field">
      <span>{props.label}</span>
      {props.children}
    </label>
  );
}

function Toggle(props: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="toggle">
      <span className="lbl">{props.label}</span>
      <input type="checkbox" checked={props.checked} onChange={(e) => props.onChange(e.target.checked)} />
      <span className="slider" />
    </label>
  );
}
