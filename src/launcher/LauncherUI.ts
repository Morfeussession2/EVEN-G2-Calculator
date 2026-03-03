import type { CalculatorEngine, CalculatorOperator } from "../calculator/CalculatorEngine";
import { renderCalculator } from "../calculator/CalculatorUI";
import type { EvenDisplay } from "../even/EvenDisplay";
import type { IEvenConnection } from "../even/EvenConnection";
// V1: speech pipeline disabled.
// import { PcmSpeechTranscriber } from "../speech/PcmSpeechTranscriber";

export class LauncherUI {
  private readonly app: HTMLElement;
  private readonly statusEl: HTMLSpanElement;
  private readonly errorEl: HTMLParagraphElement;
  private readonly displayPreviewEl: HTMLPreElement;
  private readonly connectButton: HTMLButtonElement;
  private readonly speechEl: HTMLParagraphElement;
  private unsubscribeGlassesKey: (() => void) | null = null;
  private unsubscribeSpeechState: (() => void) | null = null;
  private unsubscribeSpeechText: (() => void) | null = null;
  private unsubscribeSpeechPcm: (() => void) | null = null;
  // V1: speech pipeline disabled.
  // private readonly transcriber: PcmSpeechTranscriber;

  public constructor(
    private readonly connection: IEvenConnection,
    private readonly display: EvenDisplay,
    private readonly calculator: CalculatorEngine,
  ) {
    const app = document.getElementById("app");
    if (!app) throw new Error("Missing #app container");

    this.app = app;
    this.app.innerHTML = "";

    // V1: speech pipeline disabled.
    // this.transcriber = new PcmSpeechTranscriber({ ... });

    const title = document.createElement("h1");
    title.textContent = "Even G2 Calculator Launcher";

    this.connectButton = document.createElement("button");
    this.connectButton.textContent = "Connect G2";

    const statusWrapper = document.createElement("p");
    statusWrapper.textContent = "Status: ";
    this.statusEl = document.createElement("span");
    statusWrapper.appendChild(this.statusEl);

    this.errorEl = document.createElement("p");
    this.errorEl.style.color = "#ff9a9a";
    this.speechEl = document.createElement("p");
    this.speechEl.textContent = "Speak: OFF";

    const actions = document.createElement("div");
    actions.className = "actions";

    const openCalcButton = document.createElement("button");
    openCalcButton.textContent = "Open Calculator";

    const clearDisplayButton = document.createElement("button");
    clearDisplayButton.textContent = "Clear Display";

    actions.append(this.connectButton, openCalcButton, clearDisplayButton);

    const keypad = this.createKeypad();

    const debugTitle = document.createElement("h2");
    debugTitle.textContent = "Display Preview";

    this.displayPreviewEl = document.createElement("pre");
    this.displayPreviewEl.className = "preview";

    this.app.append(
      title,
      statusWrapper,
      this.speechEl,
      this.errorEl,
      actions,
      keypad,
      debugTitle,
      this.displayPreviewEl,
    );

    this.connection.subscribe((state) => {
      this.statusEl.textContent = state;
      this.connectButton.textContent = state === "connected" ? "Disconnect G2" : "Connect G2";
      if (state !== "disconnected") {
        this.errorEl.textContent = "";
      }
      if (state !== "connected") {
        this.unsubscribeGlassesKey?.();
        this.unsubscribeGlassesKey = null;
        this.unsubscribeSpeechState?.();
        this.unsubscribeSpeechState = null;
        this.unsubscribeSpeechText?.();
        this.unsubscribeSpeechText = null;
        this.unsubscribeSpeechPcm?.();
        this.unsubscribeSpeechPcm = null;
        this.speechEl.textContent = "Speak: OFF";
      }
    });

    this.connectButton.addEventListener("click", async () => {
      if (this.connection.getState() === "connected") {
        await this.connection.disconnect();
        return;
      }

      try {
        await this.connection.connect();
        this.unsubscribeGlassesKey?.();
        this.unsubscribeGlassesKey = this.connection.subscribeGlassesKey(async (key) => {
          this.applyKey(key);
          await this.safeSend(renderCalculator(this.calculator.getState()));
        });

        // V1: speech/double-click disabled.
        this.unsubscribeSpeechState?.();
        this.unsubscribeSpeechState = this.connection.subscribeSpeechState(() => {
          this.speechEl.textContent = "Speak: OFF";
        });
        this.unsubscribeSpeechText?.();
        this.unsubscribeSpeechPcm?.();

        await this.safeSend(["CALC G2 READY", "> 0", "= 0"]);
      } catch (error) {
        this.errorEl.textContent = `Connection error: ${String(error)}`;
      }
    });

    openCalcButton.addEventListener("click", async () => {
      await this.safeSend(renderCalculator(this.calculator.getState()));
    });

    clearDisplayButton.addEventListener("click", async () => {
      this.calculator.pressClear();
      await this.safeSend(renderCalculator(this.calculator.getState()));
    });

    void this.safeSend(renderCalculator(this.calculator.getState()));
  }

  private createKeypad(): HTMLElement {
    const keypad = document.createElement("div");
    keypad.className = "keypad";

    const keys: string[] = [
      "7",
      "8",
      "9",
      "÷",
      "4",
      "5",
      "6",
      "x",
      "1",
      "2",
      "3",
      "-",
      "0",
      "C",
      "=",
      "+",
    ];

    for (const key of keys) {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = key;
      button.addEventListener("click", async () => {
        this.applyKey(key);
        await this.safeSend(renderCalculator(this.calculator.getState()));
      });
      keypad.appendChild(button);
    }

    return keypad;
  }

  private applyKey(key: string): void {
    if (key === "÷") key = "/";
    if (key === "x") key = "*";

    if (key === "C") {
      this.calculator.pressClear();
      return;
    }

    if (key === "=") {
      this.calculator.pressEquals();
      return;
    }

    if (["+", "-", "*", "/"].includes(key)) {
      this.calculator.pressOperator(key as CalculatorOperator);
      return;
    }

    this.calculator.pressDigit(key);
  }

  private async safeSend(lines: string[]): Promise<void> {
    this.displayPreviewEl.textContent = lines.join("\n");

    if (this.connection.getState() !== "connected") {
      return;
    }

    try {
      await this.display.sendText(lines);
    } catch (error) {
      this.errorEl.textContent = `Send error: ${String(error)}`;
      console.error("Failed to send text:", error);
    }
  }

  // V1: speech parsing disabled.
  // private parseVoiceToKeys(input: string): string[] { ... }
}
