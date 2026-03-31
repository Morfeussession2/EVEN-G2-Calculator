import React, { useEffect } from "react";
import { Button, Card, SectionHeader, StatusDot, Pill } from "even-toolkit/web";
import { useSTT } from "even-toolkit/stt/react";

interface VoiceRecorderProps {
  onTranscript: (text: string) => void;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onTranscript }) => {
  const { transcript, isListening, start, stop, error } = useSTT({
    provider: "whisper-api",
    language: "pt-BR",
    apiKey: "sk-proj-demo-mode-only",
    vad: { silenceMs: 2000 },
  });

  useEffect(() => {
    if (transcript) {
      onTranscript(transcript);
    }
  }, [transcript, onTranscript]);

  return (
    <Card className="p-6 glass bg-surface border-none shadow-lg mt-8">
      <div className="flex items-center justify-between mb-4">
        <SectionHeader title="Voice Input" />
        <StatusDot connected={isListening} className={isListening ? "bg-accent-warning" : "bg-neutral"} />
      </div>

      <div className="flex flex-col gap-4">
        <div className="p-4 bg-bg rounded-[6px] min-h-[60px] border border-border flex items-center overflow-hidden">
          {transcript ? (
            <span className="text-[15px] text-text font-normal truncate">{transcript}</span>
          ) : (
            <span className="text-[15px] text-text-dim italic font-normal">
              {isListening ? "Listening..." : "Click record and speak..."}
            </span>
          )}
        </div>

        {error && (
          <div className="text-sm text-negative font-normal">
            {error.message}
          </div>
        )}

        <div className="flex items-center justify-between">
          <Pill label="PT-BR" />
          <Button
            variant={isListening ? "danger" : "default"}
            onClick={isListening ? stop : start}
            className={!isListening ? "bg-accent-warning text-text border-none" : ""}
          >
            {isListening ? "Stop Recording" : "Record Voice"}
          </Button>
        </div>
      </div>
    </Card>
  );
};
