import React from "react";
import { Card, SectionHeader, StatusDot, Kbd, Badge } from "even-toolkit/web";

interface GlassesPreviewProps {
  status: string;
  lines: string[];
  error?: string;
}

export const GlassesPreview: React.FC<GlassesPreviewProps> = ({ status, lines, error }) => {
  return (
    <Card className="glass p-6 mb-8 border-none bg-surface shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <SectionHeader 
          title="G2 Lens Simulation" 
        />
        <div className="flex items-center gap-2">
          <StatusDot connected={status === "connected"} />
          <Badge variant={status === "connected" ? "positive" : "neutral"} className="capitalize">
            {status}
          </Badge>
        </div>
      </div>

      {error && (
        <div className="p-3 mb-4 bg-negative/10 text-negative rounded-md text-sm border border-negative/20">
          {error}
        </div>
      )}

      <div className="p-8 bg-[#111111] rounded-lg min-h-[140px] flex flex-col justify-center items-center gap-2 border-4 border-accent-warning shadow-2xl">
        <div className="w-full max-w-[288px] flex flex-col gap-1">
          {lines.length > 0 ? (
            lines.map((line, idx) => (
              <div 
                key={idx} 
                className={`font-mono text-lg tracking-wider text-accent-warning transition-all ${
                  line.startsWith('  ') ? 'opacity-90' : 'font-bold underline drop-shadow-[0_0_10px_#fef991]'
                }`}
              >
                {line}
              </div>
            ))
          ) : (
            <div className="text-accent-warning/30 italic text-center">
              Awaiting data...
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 flex items-center gap-4 text-[11px] text-text-dim font-normal uppercase tracking-widest">
        <div className="flex items-center gap-1.5">
          <Kbd>Tap</Kbd> Select
        </div>
        <div className="flex items-center gap-1.5">
          <Kbd>Dbl Tap</Kbd> Clear
        </div>
      </div>
    </Card>
  );
};
