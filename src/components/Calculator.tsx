import React from "react";
import { Button, Card, SectionHeader } from "even-toolkit/web";
import type { CalculatorEngine } from "../calculator/CalculatorEngine";

interface CalculatorProps {
  engine: CalculatorEngine;
  onUpdate: () => void;
  onApplyKey: (key: string) => void;
}

export const Calculator: React.FC<CalculatorProps> = ({ engine, onUpdate, onApplyKey }) => {
  const keys: string[] = [
    "7", "8", "9", "÷",
    "4", "5", "6", "x",
    "1", "2", "3", "-",
    "0", "C", "=", "+"
  ];

  const handleKeyClick = (key: string) => {
    onApplyKey(key);
    onUpdate();
  };

  return (
    <Card className="p-6 glass bg-surface border-none shadow-xl max-w-sm mx-auto">
      <SectionHeader 
        title="Calculator Keypad" 
        className="mb-6"
      />
      
      <div className="grid grid-cols-4 gap-3">
        {keys.map((key) => {
          const isOperator = ["÷", "x", "-", "+", "=", "C"].includes(key);
          const isClear = key === "C";
          const isEquals = key === "=";
          
          return (
            <Button
              key={key}
              variant={isEquals ? "highlight" : isClear ? "danger" : isOperator ? "secondary" : "default"}
              className={`h-14 text-xl font-normal ${isEquals ? "bg-accent-warning text-text" : ""}`}
              onClick={() => handleKeyClick(key)}
            >
              {key}
            </Button>
          );
        })}
      </div>
    </Card>
  );
};
