import type { AppSettings } from '../shared/types';
import type { ISpeechProvider } from './ISpeechProvider';
import { WebSpeechProvider } from './WebSpeechProvider';
import { DeepgramProvider } from './DeepgramProvider';
import { WhisperOpenAIProvider } from './WhisperOpenAIProvider';

export function makeProvider(s: AppSettings): ISpeechProvider {
  switch (s.provider) {
    case 'deepgram':
      return new DeepgramProvider(s.deepgramApiKey, s.language, s.autoPunctuation);
    case 'whisper-openai':
      return new WhisperOpenAIProvider(s.openAiApiKey, s.language);
    case 'webspeech':
    default:
      return new WebSpeechProvider(s.language);
  }
}
