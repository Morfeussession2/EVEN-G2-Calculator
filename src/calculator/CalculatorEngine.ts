export type CalculatorOperator = "+" | "-" | "*" | "÷";

export interface CalculatorState {
  currentValue: string;
  pendingValue: string | null;
  pendingOperator: CalculatorOperator | null;
  error: string | null;
  inputMask: string;
  resultValue: string;
}

const MAX_DIGITS = 10;

export class CalculatorEngine {
  private state: CalculatorState = {
    currentValue: "0",
    pendingValue: null,
    pendingOperator: null,
    error: null,
    inputMask: "0",
    resultValue: "0",
  };
  private lastEvaluatedMask: string | null = null;

  public getState(): CalculatorState {
    return { ...this.state };
  }

  public pressDigit(digit: string): void {
    if (!/^\d$/.test(digit)) return;

    if (this.state.error) {
      this.state.error = null;
      this.state.currentValue = "0";
      this.state.pendingValue = null;
      this.state.pendingOperator = null;
      this.lastEvaluatedMask = null;
    }

    const nextValue =
      this.state.currentValue === "0" ? digit : `${this.state.currentValue}${digit}`;

    if (nextValue.replace("-", "").length > MAX_DIGITS) return;
    this.state.currentValue = nextValue;
    this.refreshDisplay();
  }

  public pressOperator(operator: CalculatorOperator): void {
    if (this.state.error) return;

    if (this.state.pendingOperator && this.state.pendingValue !== null) {
      const result = this.compute(
        Number(this.state.pendingValue),
        Number(this.state.currentValue),
        this.state.pendingOperator,
      );

      if (typeof result === "string") {
        this.setError(result);
        return;
      }

      this.state.pendingValue = this.formatNumber(result);
      this.state.resultValue = this.state.pendingValue;
    } else {
      this.state.pendingValue = this.state.currentValue;
      this.state.resultValue = this.state.pendingValue;
    }

    this.state.pendingOperator = operator;
    this.state.currentValue = "0";
    this.lastEvaluatedMask = null;
    this.refreshDisplay();
  }

  public pressEquals(): void {
    if (this.state.error) return;
    if (!this.state.pendingOperator || this.state.pendingValue === null) return;

    const result = this.compute(
      Number(this.state.pendingValue),
      Number(this.state.currentValue),
      this.state.pendingOperator,
    );

    if (typeof result === "string") {
      this.setError(result);
      return;
    }

    this.lastEvaluatedMask = `${this.state.pendingValue} ${this.state.pendingOperator} ${this.state.currentValue} =`;
    this.state.currentValue = this.formatNumber(result);
    this.state.pendingValue = null;
    this.state.pendingOperator = null;
    this.state.resultValue = this.state.currentValue;
    this.refreshDisplay();
  }

  public pressClear(): void {
    this.state = {
      currentValue: "0",
      pendingValue: null,
      pendingOperator: null,
      error: null,
      inputMask: "0",
      resultValue: "0",
    };
    this.lastEvaluatedMask = null;
  }

  private compute(left: number, right: number, operator: CalculatorOperator): number | "DIV/0" {
    if (operator === "÷" && right === 0) {
      return "DIV/0";
    }

    if (operator === "+") return left + right;
    if (operator === "-") return left - right;
    if (operator === "*") return left * right;
    return left / right;
  }

  private formatNumber(value: number): string {
    if (!Number.isFinite(value)) return "0";

    const compact = Number(value.toPrecision(10));
    return compact.toString().slice(0, 12);
  }

  private setError(error: "DIV/0"): void {
    this.state.error = error;
    this.state.currentValue = "0";
    this.state.pendingValue = null;
    this.state.pendingOperator = null;
    this.state.inputMask = `ERRO ${error}`;
    this.state.resultValue = "0";
    this.lastEvaluatedMask = null;
  }

  private refreshDisplay(): void {
    if (this.state.error) {
      this.state.inputMask = `ERRO ${this.state.error}`;
      return;
    }

    if (this.state.pendingValue !== null && this.state.pendingOperator !== null) {
      this.state.inputMask = `${this.state.pendingValue} ${this.state.pendingOperator} ${this.state.currentValue}`;
      return;
    }

    if (this.lastEvaluatedMask) {
      this.state.inputMask = this.lastEvaluatedMask;
      return;
    }

    this.state.inputMask = this.state.currentValue;
  }
}
