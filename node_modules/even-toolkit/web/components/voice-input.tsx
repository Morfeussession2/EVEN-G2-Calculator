import * as React from 'react';
import { cn } from '../utils/cn';

// ─── WaveformVisualizer ─────────────────────────────────────────

interface WaveformVisualizerProps {
  active: boolean;
  barCount?: number;
  color?: string;
  className?: string;
}

function WaveformVisualizer({ active, barCount = 5, color, className }: WaveformVisualizerProps) {
  return (
    <div className={cn('flex items-center gap-[3px] h-6', className)}>
      {Array.from({ length: barCount }).map((_, i) => (
        <div
          key={i}
          className="w-[3px] rounded-full transition-all"
          style={{
            backgroundColor: color ?? 'var(--color-accent)',
            height: active ? undefined : '4px',
            animation: active ? `waveform-bar 0.8s ease-in-out ${i * 0.1}s infinite alternate` : 'none',
          }}
        />
      ))}
      {active && (
        <style>{`
          @keyframes waveform-bar {
            0% { height: 4px; }
            100% { height: 20px; }
          }
        `}</style>
      )}
    </div>
  );
}

// ─── VoiceInput ─────────────────────────────────────────────────

type VoiceState = 'idle' | 'listening' | 'processing' | 'result';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  onAudioBlob?: (blob: Blob) => void;
  language?: string;
  className?: string;
}

function VoiceInput({ onTranscript, language = 'en-US', className }: VoiceInputProps) {
  const [state, setState] = React.useState<VoiceState>('idle');
  const [transcript, setTranscript] = React.useState('');
  const recognitionRef = React.useRef<any>(null);

  const SpeechRecognition = typeof window !== 'undefined'
    ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    : null;

  const startListening = () => {
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = language;
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => setState('listening');
    recognition.onresult = (e: any) => {
      const text = Array.from(e.results)
        .map((r: any) => r[0].transcript)
        .join('');
      setTranscript(text);
    };
    recognition.onend = () => {
      setState('result');
      if (transcript) onTranscript(transcript);
    };
    recognition.onerror = () => setState('idle');

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setState('processing');
  };

  const reset = () => {
    setTranscript('');
    setState('idle');
  };

  if (!SpeechRecognition) {
    return (
      <div className={cn('text-[13px] tracking-[-0.13px] text-text-dim', className)}>
        Voice input not supported in this browser.
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col items-center gap-3', className)}>
      {/* Mic button */}
      <button
        type="button"
        onClick={state === 'listening' ? stopListening : state === 'result' ? reset : startListening}
        className={cn(
          'w-14 h-14 rounded-full flex items-center justify-center cursor-pointer transition-all',
          state === 'listening' && 'bg-accent animate-pulse scale-110',
          state === 'idle' && 'bg-surface hover:bg-surface-light',
          state === 'processing' && 'bg-surface-lighter',
          state === 'result' && 'bg-surface hover:bg-surface-light',
        )}
      >
        {state === 'processing' ? (
          <div className="w-5 h-5 animate-spin rounded-full border-2 border-surface-lighter border-t-accent" />
        ) : (
          <svg viewBox="0 0 24 24" className={cn('w-6 h-6', state === 'listening' ? 'text-text-highlight' : 'text-text')}>
            {/* Mic body (centered at x=12) */}
            <rect x={10} y={3} width={4} height={2} fill="currentColor" />
            <rect x={10} y={5} width={4} height={2} fill="currentColor" />
            <rect x={10} y={7} width={4} height={2} fill="currentColor" />
            <rect x={10} y={9} width={4} height={2} fill="currentColor" />
            {/* Mic sides */}
            <rect x={8} y={9} width={2} height={2} fill="currentColor" />
            <rect x={14} y={9} width={2} height={2} fill="currentColor" />
            {/* Outer arc */}
            <rect x={6} y={7} width={2} height={2} fill="currentColor" />
            <rect x={16} y={7} width={2} height={2} fill="currentColor" />
            <rect x={6} y={11} width={2} height={2} fill="currentColor" />
            <rect x={16} y={11} width={2} height={2} fill="currentColor" />
            {/* Bottom of arc */}
            <rect x={8} y={13} width={8} height={2} fill="currentColor" />
            {/* Stand */}
            <rect x={11} y={15} width={2} height={2} fill="currentColor" />
            {/* Base */}
            <rect x={8} y={17} width={8} height={2} fill="currentColor" />
          </svg>
        )}
      </button>

      {/* Waveform */}
      {state === 'listening' && <WaveformVisualizer active={true} />}

      {/* Status text */}
      <span className="text-[13px] tracking-[-0.13px] text-text-dim">
        {state === 'idle' && 'Tap to speak'}
        {state === 'listening' && 'Listening...'}
        {state === 'processing' && 'Processing...'}
        {state === 'result' && 'Tap to try again'}
      </span>

      {/* Transcript */}
      {transcript && (
        <div className="bg-surface rounded-[6px] p-3 text-[15px] tracking-[-0.15px] text-text w-full">
          {transcript}
        </div>
      )}
    </div>
  );
}

export { VoiceInput, WaveformVisualizer };
export type { VoiceInputProps, WaveformVisualizerProps };
