/** Language mapping utilities for STT providers */

/** BCP 47 → Whisper ISO 639-1 */
export function toWhisperLang(bcp47: string): string {
  return bcp47.split('-')[0].toLowerCase();
}

/** Short code → BCP 47 (best guess) */
export function toWebSpeechLang(lang: string): string {
  const map: Record<string, string> = {
    en: 'en-US', it: 'it-IT', es: 'es-ES', fr: 'fr-FR',
    de: 'de-DE', pt: 'pt-BR', zh: 'zh-CN', ja: 'ja-JP',
    ko: 'ko-KR', ru: 'ru-RU', ar: 'ar-SA', hi: 'hi-IN',
  };
  if (lang.includes('-')) return lang;
  return map[lang.toLowerCase()] ?? `${lang}-${lang.toUpperCase()}`;
}

export interface SupportedLanguage {
  code: string;
  name: string;
  whisper: boolean;
  webSpeech: boolean;
}

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  { code: 'en-US', name: 'English', whisper: true, webSpeech: true },
  { code: 'it-IT', name: 'Italian', whisper: true, webSpeech: true },
  { code: 'es-ES', name: 'Spanish', whisper: true, webSpeech: true },
  { code: 'fr-FR', name: 'French', whisper: true, webSpeech: true },
  { code: 'de-DE', name: 'German', whisper: true, webSpeech: true },
  { code: 'pt-BR', name: 'Portuguese', whisper: true, webSpeech: true },
  { code: 'zh-CN', name: 'Chinese', whisper: true, webSpeech: true },
  { code: 'ja-JP', name: 'Japanese', whisper: true, webSpeech: true },
  { code: 'ko-KR', name: 'Korean', whisper: true, webSpeech: true },
  { code: 'ru-RU', name: 'Russian', whisper: true, webSpeech: true },
  { code: 'ar-SA', name: 'Arabic', whisper: true, webSpeech: true },
  { code: 'hi-IN', name: 'Hindi', whisper: true, webSpeech: true },
];
