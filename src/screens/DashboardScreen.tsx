import React, { useState, useCallback } from "react";
import { Calculator } from "../components/Calculator";
import { GlassesPreview } from "../components/GlassesPreview";
import { VoiceRecorder } from "../components/VoiceRecorder";
import type { CalculatorEngine } from "../calculator/CalculatorEngine";
import { renderCalculator } from "../calculator/CalculatorUI";

interface DashboardScreenProps {
  calculator: CalculatorEngine;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ calculator }) => {
  const [lines, setLines] = useState<string[]>(renderCalculator(calculator.getState()));

  const handleApplyKey = (key: string) => {
    if (key === "÷") key = "/";
    if (key === "x") key = "*";
    if (key === "C") {
      calculator.pressClear();
    } else if (key === "=") {
      calculator.pressEquals();
    } else if (["+", "-", "*", "/"].includes(key)) {
      calculator.pressOperator(key as any);
    } else {
      calculator.pressDigit(key);
    }
    setLines(renderCalculator(calculator.getState()));
  };

  const handleTranscript = useCallback((text: string) => {
    // Process voice commands like "clear" or "plus"
    const lower = text.toLowerCase();
    if (lower.includes("limpar") || lower.includes("clear")) {
      handleApplyKey("C");
    }
  }, []);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 flex flex-col md:flex-row gap-8 items-start">
      <div className="flex-1 w-full space-y-6">
        <GlassesPreview 
          status="connected" 
          lines={lines} 
        />
        <div className="text-[13px] text-text-dim px-4 italic font-normal">
          Tip: G2 renders the input mask and result in real-time.
        </div>
        
        <VoiceRecorder onTranscript={handleTranscript} />
      </div>

      <div className="flex-1 w-full flex justify-center">
        <Calculator 
          engine={calculator} 
          onUpdate={() => setLines(renderCalculator(calculator.getState()))} 
          onApplyKey={handleApplyKey} 
        />
      </div>
    </div>
  );
};
