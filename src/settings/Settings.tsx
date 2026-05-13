import { useEffect, useState } from 'react';
import type { AppSettings, ProviderName, InjectionMode } from '../shared/types';
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

export function Settings() {
  const [s, setS] = useState<AppSettings | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => { window.api.getSettings().then(setS); }, []);

  const update = async (patch: Partial<AppSettings>) => {
    if (!s) return;
    const next = await window.api.setSettings(patch);
    setS(next);
    setSaved(true);
    setTimeout(() => setSaved(false), 1200);
  };

  if (!s) return <div className="loading">Loading…</div>;

  return (
    <div className="settings">
      <header>
        <h1>Voice Overlay</h1>
        <p className="sub">Global voice-to-text for Windows.</p>
      </header>

      <Section title="Provider">
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

      <Section title="Shortcut">
        <Field label="Global hotkey">
          <input type="text" value={s.hotkey} onChange={(e) => update({ hotkey: e.target.value })} placeholder="Alt+Space" />
        </Field>
        <Toggle label="Push-to-talk (hold key)" checked={s.pushToTalk} onChange={(v) => update({ pushToTalk: v })} />
      </Section>

      <Section title="Output">
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
        <Toggle label="Auto-punctuation (where supported)" checked={s.autoPunctuation} onChange={(v) => update({ autoPunctuation: v })} />
        <Field label="Language (BCP-47)">
          <input type="text" value={s.language} onChange={(e) => update({ language: e.target.value })} placeholder="en-US" />
        </Field>
      </Section>

      <Section title="System">
        <Toggle label="Start on Windows login" checked={s.autoLaunch} onChange={(v) => update({ autoLaunch: v })} />
        <button className="danger" onClick={() => window.api.quitApp()}>Quit Voice Overlay</button>
      </Section>

      <div className={'saved' + (saved ? ' show' : '')}>Saved</div>
    </div>
  );
}

function Section(props: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2>{props.title}</h2>
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
      <input type="checkbox" checked={props.checked} onChange={(e) => props.onChange(e.target.checked)} />
      <span className="slider" />
      <span className="lbl">{props.label}</span>
    </label>
  );
}
