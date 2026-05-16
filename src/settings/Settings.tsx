import { useEffect, useState, useRef, useCallback } from 'react';
import type { AppSettings, ProviderName, InjectionMode, LogEntry } from '../shared/types';
import './Settings.css';

const PROVIDERS: { value: ProviderName; label: string; hint: string }[] = [
  { value: 'whisper-local', label: 'Whisper Local', hint: 'Offline, no API key required. High privacy.' },
  { value: 'webspeech', label: 'Web Speech', hint: 'Uses browser engine. Fast but requires special build.' },
  { value: 'deepgram', label: 'Deepgram', hint: 'Ultra-low latency streaming via API.' },
  { value: 'whisper-openai', label: 'Whisper Cloud', hint: 'OpenAI API. Maximum accuracy.' }
];

const INJECTION: { value: InjectionMode; label: string; hint: string }[] = [
  { value: 'paste', label: 'Smart Paste', hint: 'Safe for most apps, IDEs and terminals.' },
  { value: 'type', label: 'Force Type', hint: 'Simulates keystrokes. Use for blocked fields.' },
  { value: 'copy-only', label: 'Copy Only', hint: 'Just puts the text on your clipboard.' }
];

export function Settings() {
  const [s, setS] = useState<AppSettings | null>(null);
  const [saved, setSaved] = useState(false);
  const [activeSection, setActiveSection] = useState('provider');
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const sectionsRef = useRef<{ [key: string]: HTMLElement | null }>({});
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    window.api.getSettings().then(setS);
  }, []);

  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current); }, []);

  // Immediate save — for toggles and radio buttons.
  const update = useCallback(async (patch: Partial<AppSettings>) => {
    setS(prev => prev ? { ...prev, ...patch } : null);
    await window.api.setSettings(patch);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, []);

  // Debounced save — for text inputs so we don't hit IPC + disk on every keystroke.
  const debouncedUpdate = useCallback((patch: Partial<AppSettings>) => {
    setS(prev => prev ? { ...prev, ...patch } : null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      await window.api.setSettings(patch);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      debounceRef.current = null;
    }, 500);
  }, []);

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    sectionsRef.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (!s) return <div className="loading">Loading Configuration...</div>;

  return (
    <div className="settings-layout">
      <aside className="sidebar">
        <SidebarItem id="provider" label="Provider" active={activeSection === 'provider'} onClick={scrollToSection} icon={<ProviderIcon />} />
        <SidebarItem id="shortcut" label="Shortcut" active={activeSection === 'shortcut'} onClick={scrollToSection} icon={<ShortcutIcon />} />
        <SidebarItem id="intelligence" label="Intelligence" active={activeSection === 'intelligence'} onClick={scrollToSection} icon={<BrainIcon />} />
        <SidebarItem id="audio" label="Audio" active={activeSection === 'audio'} onClick={scrollToSection} icon={<AudioIcon />} />
        <SidebarItem id="output" label="Output" active={activeSection === 'output'} onClick={scrollToSection} icon={<OutputIcon />} />
        <SidebarItem id="appearance" label="Appearance" active={activeSection === 'appearance'} onClick={scrollToSection} icon={<AppearanceIcon />} />
        <SidebarItem id="history" label="History" active={activeSection === 'history'} onClick={scrollToSection} icon={<HistoryIcon />} />
        <SidebarItem id="system" label="System" active={activeSection === 'system'} onClick={scrollToSection} icon={<SystemIcon />} />
        <SidebarItem id="logs" label="Logs" active={activeSection === 'logs'} onClick={scrollToSection} icon={<LogsIcon />} />
      </aside>

      <main className="main-content" ref={scrollContainerRef}>
        <header>
          <h1>Settings</h1>
          <p className="sub">Configure your AI voice assistant.</p>
        </header>

        <section id="provider" ref={el => sectionsRef.current['provider'] = el}>
          <h2><ProviderIcon /> Speech Provider</h2>
          <div className="card">
            <div className="radio-group">
              {PROVIDERS.map((p) => (
                <RadioItem 
                  key={p.value}
                  title={p.label}
                  hint={p.hint}
                  active={s.provider === p.value}
                  onClick={() => update({ provider: p.value })}
                />
              ))}
            </div>
            {s.provider === 'deepgram' && (
              <Field label="Deepgram API Key">
                <input type="password" value={s.deepgramApiKey} onChange={(e) => debouncedUpdate({ deepgramApiKey: e.target.value })} placeholder="dg_..." />
              </Field>
            )}
            {s.provider === 'whisper-openai' && (
              <Field label="OpenAI API Key">
                <input type="password" value={s.openAiApiKey} onChange={(e) => debouncedUpdate({ openAiApiKey: e.target.value })} placeholder="sk-..." />
              </Field>
            )}
          </div>
        </section>

        <section id="shortcut" ref={el => sectionsRef.current['shortcut'] = el}>
          <h2><ShortcutIcon /> Global Shortcut</h2>
          <div className="card">
            <Field label="Trigger Hotkey">
              <input type="text" value={s.hotkey} onChange={(e) => debouncedUpdate({ hotkey: e.target.value })} placeholder="Alt+Space" />
            </Field>
            <Toggle label="Push-to-talk (Hold to record)" checked={s.pushToTalk} onChange={(v: boolean) => update({ pushToTalk: v })} />
          </div>
        </section>

        <section id="intelligence" ref={el => sectionsRef.current['intelligence'] = el}>
          <h2><BrainIcon /> System Intelligence</h2>
          <div className="card">
            <Toggle label="Voice Commands" checked={s.voiceCommandsEnabled} onChange={(v: boolean) => update({ voiceCommandsEnabled: v })} />
            {s.voiceCommandsEnabled && (
              <div className="field">
                <label>Command Mode</label>
                <div className="radio-group">
                  <RadioItem 
                    title="Prefix Mode" 
                    hint="Orb listens for 'Hey Orb' before processing commands." 
                    active={s.voiceCommandMode === 'prefix'} 
                    onClick={() => update({ voiceCommandMode: 'prefix' })} 
                  />
                  <RadioItem 
                    title="Always Listening" 
                    hint="Orb processes any voice command immediately." 
                    active={s.voiceCommandMode === 'always'} 
                    onClick={() => update({ voiceCommandMode: 'always' })} 
                  />
                </div>
              </div>
            )}
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '20px' }}>
              <Toggle label="AI Features (LLM)" checked={s.aiEnabled} onChange={(v: boolean) => update({ aiEnabled: v })} />
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Enables "fix grammar" and "describe screen" voice commands via GPT-4o.
              </p>
              {s.aiEnabled && (
                <Field label="OpenAI API Key">
                  <input
                    type="password"
                    value={s.openAiApiKey}
                    onChange={(e) => debouncedUpdate({ openAiApiKey: e.target.value })}
                    placeholder="sk-..."
                  />
                </Field>
              )}
            </div>
          </div>
        </section>

        <section id="audio" ref={el => sectionsRef.current['audio'] = el}>
          <h2><AudioIcon /> Audio & Cues</h2>
          <div className="card">
            <Toggle label="Play Sound Effects" checked={s.soundEffectsEnabled} onChange={(v: boolean) => update({ soundEffectsEnabled: v })} />
            <Slider 
              label="Sound Volume" 
              value={s.soundEffectsVolume} 
              min={0} 
              max={1} 
              step={0.05} 
              onChange={(v) => update({ soundEffectsVolume: v })} 
            />
          </div>
        </section>

        <section id="output" ref={el => sectionsRef.current['output'] = el}>
          <h2><OutputIcon /> Output & Delivery</h2>
          <div className="card">
            <div className="radio-group">
              {INJECTION.map((p) => (
                <RadioItem 
                  key={p.value}
                  title={p.label}
                  hint={p.hint}
                  active={s.injectionMode === p.value}
                  onClick={() => update({ injectionMode: p.value })}
                />
              ))}
            </div>
            <Toggle label="Auto-punctuation" checked={s.autoPunctuation} onChange={(v: boolean) => update({ autoPunctuation: v })} />
            <div className="field">
              <Toggle 
                label="Auto-detect language" 
                checked={s.language === 'auto'} 
                onChange={(v: boolean) => update({ language: v ? 'auto' : 'en-US' })} 
              />
            </div>
            <Field label="Language Code (BCP-47)">
              <input 
                type="text" 
                value={s.language} 
                onChange={(e) => debouncedUpdate({ language: e.target.value })} 
                placeholder="en-US" 
                disabled={s.language === 'auto'}
              />
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Use "auto" for automatic language detection (Provider dependent).
              </p>
            </Field>
          </div>
        </section>

        <section id="appearance" ref={el => sectionsRef.current['appearance'] = el}>
          <h2><AppearanceIcon /> Appearance</h2>
          <div className="card">
            <Toggle label="Show Visual Waveform" checked={s.waveformEnabled} onChange={(v: boolean) => update({ waveformEnabled: v })} />
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Displays a real-time audio visualization in the overlay while recording.
            </p>
          </div>
        </section>

        <section id="history" ref={el => sectionsRef.current['history'] = el}>
          <h2><HistoryIcon /> Transcription History</h2>
          <TranscriptionHistory />
        </section>

        <section id="system" ref={el => sectionsRef.current['system'] = el}>
          <h2><SystemIcon /> Application</h2>
          <div className="card">
            <Toggle label="Launch on Windows login" checked={s.autoLaunch} onChange={(v: boolean) => update({ autoLaunch: v })} />
            <button className="danger-btn" onClick={() => window.api.quitApp()}>Terminate Application</button>
          </div>
        </section>

        <section id="logs" ref={el => sectionsRef.current['logs'] = el}>
          <h2><LogsIcon /> System Logs</h2>
          <LogViewer />
        </section>

        <div className={`toast ${saved ? 'show' : ''}`}>
          <CheckIcon /> Settings Sync Successful
        </div>
      </main>
    </div>
  );
}

/* Internal Components */

interface SidebarItemProps {
  id: string;
  label: string;
  active: boolean;
  onClick: (id: string) => void;
  icon: React.ReactNode;
}

function SidebarItem({ id, label, active, onClick, icon }: SidebarItemProps) {
  return (
    <button className={`sidebar-item ${active ? 'active' : ''}`} onClick={() => onClick(id)}>
      {icon} {label}
    </button>
  );
}

interface RadioItemProps {
  title: string;
  hint: string;
  active: boolean;
  onClick: () => void;
}

function RadioItem({ title, hint, active, onClick }: RadioItemProps) {
  return (
    <div className={`radio-item ${active ? 'active' : ''}`} onClick={onClick}>
      <input type="radio" checked={active} readOnly />
      <div className="content">
        <div className="title">{title}</div>
        <div className="hint">{hint}</div>
      </div>
    </div>
  );
}

interface FieldProps {
  label: string;
  children: React.ReactNode;
}

function Field({ label, children }: FieldProps) {
  return (
    <div className="field">
      <label>{label}</label>
      {children}
    </div>
  );
}

interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}

function Toggle({ label, checked, onChange }: ToggleProps) {
  return (
    <label className="toggle">
      <span className="lbl">{label}</span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="slider" />
    </label>
  );
}

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}

function Slider({ label, value, min, max, step, onChange }: SliderProps) {
  return (
    <div className="field">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <label>{label}</label>
        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent)' }}>{Math.round(value * 100)}%</span>
      </div>
      <input 
        type="range" 
        className="custom-slider"
        min={min} 
        max={max} 
        step={step} 
        value={value} 
        onChange={(e) => onChange(parseFloat(e.target.value))} 
      />
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
    <div className="log-card">
      <div className="log-header">
        <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>TERMINAL</span>
        <button onClick={clear} style={{ fontSize: '10px', color: 'var(--text-muted)', cursor: 'pointer', background: 'none', border: 'none' }}>CLEAR</button>
      </div>
      <div className="log-content" ref={scrollRef}>
        {logs.length === 0 ? (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', opacity: 0.5, fontStyle: 'italic', fontSize: '11px' }}>
            Awaiting system events...
          </div>
        ) : (
          logs.map((log, i) => (
            <div key={i} className={`log-entry ${log.level}`}>
              <span style={{ opacity: 0.4, flexShrink: 0 }}>[{log.timestamp}]</span>
              <span style={{ fontWeight: 700, flexShrink: 0, minWidth: '50px' }}>{log.level.toUpperCase()}</span>
              <span style={{ wordBreak: 'break-all' }}>{log.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function TranscriptionHistory() {
  const [history, setHistory] = useState<string[]>([]);

  const fetch = useCallback(() => window.api.getTranscriptionHistory().then(setHistory), []);

  useEffect(() => {
    fetch();
    const id = setInterval(fetch, 3000);
    return () => clearInterval(id);
  }, [fetch]);

  const clearAll = async () => {
    if (confirm('Clear all transcription history? This cannot be undone.')) {
      await window.api.clearTranscriptionHistory();
      setHistory([]);
    }
  };

  if (history.length === 0) {
  return (
      <div className="card" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', fontWeight: 400 }}>
        No recent transcriptions found.
      </div>
    );
  }

  return (
      <div className="card" style={{ padding: '8px' }}>
        <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
          <button 
            onClick={clearAll}
            style={{ fontSize: '11px', color: 'var(--danger)', cursor: 'pointer', background: 'none', border: 'none', fontWeight: 500 }}
          >
            Clear All
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column-reverse', gap: '6px' }}>
          {history.map((t, i) => (
            <div key={i} className="history-item" style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', fontSize: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'default' }}>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: '12px', color: 'var(--text-secondary)' }}>{t}</span>
              <button 
                onClick={() => window.api.copyToClipboard(t)}
                style={{ padding: '4px 10px', fontSize: '11px', borderRadius: '4px', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 500 }}
              >
                Copy
              </button>
            </div>
          ))}
        </div>
      </div>
  );
}

/* Icons (Minimal SVGs) */

const ProviderIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>
);
const ShortcutIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M7 8h10"/><path d="M7 12h10"/><path d="M7 16h10"/></svg>
);
const OutputIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
);
const HistoryIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8v4l3 3"/><circle cx="12" cy="12" r="9"/></svg>
);
const SystemIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
);
const LogsIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>
);
const BrainIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.04"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.04"/></svg>
);
const AudioIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
);
const AppearanceIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2.13a2 2 0 0 1 1.3 1.3L15 8.1l4.67 1.3a2 2 0 0 1 1.3 1.3l-1.3 4.67 1.3 4.67a2 2 0 0 1-1.3 1.3L15 20.1l-4.67 1.3a2 2 0 0 1-1.3-1.3l1.3-4.67-1.3-4.67a2 2 0 0 1 1.3-1.3l4.67-1.3L12 2.13z"/></svg>
);
const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
);
