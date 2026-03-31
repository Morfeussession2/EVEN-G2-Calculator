import type { CalculatorState } from "./CalculatorEngine";

const MAX_CHARS_PER_LINE = 24;

function fitLine(input: string): string {
  const asciiOnly = input
    .split("")
    .filter((char) => {
      const code = char.charCodeAt(0);
      return code >= 32 && code <= 126;
    })
    .join("");

  if (asciiOnly.length <= MAX_CHARS_PER_LINE) return asciiOnly;
  return asciiOnly.slice(0, MAX_CHARS_PER_LINE);
}

export function renderCalculator(state: CalculatorState): string[] {
  const line1 = fitLine("CALC G2");

  if (state.error) {
    return [line1, fitLine(`> ${state.inputMask}`), fitLine("= 0")];
  }

  const line2 = fitLine(`> ${state.inputMask}`);
  const line3 = fitLine(`= ${state.resultValue}`);

  return [line1, line2, line3];
}
