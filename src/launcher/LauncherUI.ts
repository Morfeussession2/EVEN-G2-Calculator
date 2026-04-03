import type { CalculatorEngine, CalculatorOperator } from "../calculator/CalculatorEngine";
import { renderCalculator } from "../calculator/CalculatorUI";
import type { EvenDisplay } from "../even/EvenDisplay";
import type { IEvenConnection } from "../even/EvenConnection";

export class LauncherUI {
  private readonly app: HTMLElement;
  private readonly statusEl: HTMLSpanElement;
  private readonly historyListEl: HTMLElement;
  private readonly sidebarEl: HTMLElement;
  private readonly overlayEl: HTMLElement;
  private readonly displayOpEl: HTMLDivElement;
  private readonly displayResEl: HTMLDivElement;
  private readonly reconnectBtn: HTMLButtonElement;
  private history: string[] = [];

  private unsubscribeGlassesKey: (() => void) | null = null;

  public constructor(
    private readonly connection: IEvenConnection,
    private readonly display: EvenDisplay,
    private readonly calculator: CalculatorEngine,
  ) {
    const app = document.getElementById("app");
    if (!app) throw new Error("Missing #app container");

    this.app = app;
    this.app.innerHTML = "";

    // ── Build Header ──
    const header = document.createElement("header");

    const historyTab = document.createElement("button");
    historyTab.className = "tab";
    historyTab.textContent = "History";
    historyTab.addEventListener("click", () => this.toggleHistory(true));

    const title = document.createElement("h1");
    const titleSpan = document.createElement("span");
    titleSpan.textContent = "Calculator";
    titleSpan.style.fontFamily = "'FK Grotesk Neue', sans-serif";
    titleSpan.style.fontSize = "17px";
    title.appendChild(titleSpan);

    const emptyRight = document.createElement("div"); // For balance
    emptyRight.style.width = "60px";

    header.append(historyTab, title, emptyRight);

    // ── Build Sidebar (History) ──
    this.sidebarEl = document.createElement("div");
    this.sidebarEl.id = "history-sidebar";

    const historyTitle = document.createElement("h2");
    historyTitle.textContent = "History";

    this.historyListEl = document.createElement("div");
    this.historyListEl.className = "history-list";

    this.sidebarEl.append(historyTitle, this.historyListEl);

    this.overlayEl = document.createElement("div");
    this.overlayEl.className = "overlay";
    this.overlayEl.addEventListener("click", () => this.toggleHistory(false));

    // ── Build Main (Keypad) ──
    const container = document.createElement("div");
    container.id = "app-container";

    const displayEl = document.createElement("div");
    displayEl.id = "calculator-display";

    this.displayOpEl = document.createElement("div");
    this.displayOpEl.id = "display-operation";

    this.displayResEl = document.createElement("div");
    this.displayResEl.id = "display-result";

    displayEl.append(this.displayOpEl, this.displayResEl);

    const keypad = this.createKeypad();
    container.append(displayEl, keypad);

    // ── Build Diagnostics (Subtle Footer) ──
    const diag = document.createElement("div");
    diag.className = "diagnostics";

    this.statusEl = document.createElement("span");
    this.statusEl.textContent = this.connection.getState();

    this.reconnectBtn = document.createElement("button");
    this.reconnectBtn.textContent = "Reconnect";
    this.reconnectBtn.className = "reconnect-btn";
    this.reconnectBtn.addEventListener("click", () => this.handleConnection());

    diag.append(this.statusEl, this.reconnectBtn);

    // ── Montage ──
    document.body.prepend(header, this.sidebarEl, this.overlayEl);
    this.app.append(container, diag);

    // ── Subscriptions ──
    this.connection.subscribe((state) => {
      this.statusEl.textContent = state;
      this.statusEl.className = `status-${state}`;
      this.reconnectBtn.disabled = state === "connecting" || state === "connected";
      this.reconnectBtn.style.display = state === "connected" ? "none" : "inline-block";

      if (state !== "connected") {
        this.unsubscribeGlassesKey?.();
        this.unsubscribeGlassesKey = null;
      }
    });

    void this.loadHistory();
    void this.updateDisplay();
    // Auto-connect once on start if disconnected
    if (this.connection.getState() === "disconnected") {
      void this.handleConnection();
    }
  }

  private createKeypad(): HTMLElement {
    const keypad = document.createElement("div");
    keypad.className = "keypad";

    const keys: string[] = [
      "7", "8", "9", "÷",
      "4", "5", "6", "x",
      "1", "2", "3", "-",
      "0", "C", "=", "+"
    ];

    for (const key of keys) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "key";

      if (["÷", "x", "-", "+"].includes(key)) button.classList.add("operator");
      if (key === "=") button.classList.add("equals");
      if (key === "C") button.classList.add("clear");

      button.textContent = key;
      button.addEventListener("click", () => this.applyKey(key));
      keypad.appendChild(button);
    }

    return keypad;
  }

  private async applyKey(key: string): Promise<void> {
    const prevMask = this.calculator.getState().inputMask;

    let k = key;
    if (k === "÷") k = "/";
    if (k === "x") k = "*";

    if (k === "C") {
      this.calculator.pressClear();
    } else if (k === "=") {
      this.calculator.pressEquals();
      const state = this.calculator.getState();
      if (!state.error) {
        this.addToHistory(`${prevMask} = ${state.resultValue}`);
      }
    } else if (["+", "-", "*", "/"].includes(k)) {
      this.calculator.pressOperator(k as CalculatorOperator);
    } else {
      this.calculator.pressDigit(k);
    }

    await this.updateDisplay();
  }

  private addToHistory(entry: string): void {
    if (this.history[0] === entry) return; // Dedupe
    this.history.unshift(entry);
    if (this.history.length > 20) this.history.pop();
    this.renderHistory();
    void this.saveHistory();
  }

  private async loadHistory(): Promise<void> {
    try {
      const saved = await this.connection.getLocalStorage("calc_history");
      if (saved) {
        this.history = JSON.parse(saved) as string[];
        this.renderHistory();
      }
    } catch (e) {
      console.error("Failed to load history:", e);
    }
  }

  private async saveHistory(): Promise<void> {
    try {
      await this.connection.setLocalStorage("calc_history", JSON.stringify(this.history));
    } catch (e) {
      console.error("Failed to save history:", e);
    }
  }

  private renderHistory(): void {
    this.historyListEl.innerHTML = "";
    if (this.history.length === 0) {
      this.historyListEl.innerHTML = '<div class="history-item">No calculations yet</div>';
      return;
    }
    for (const entry of this.history) {
      const item = document.createElement("div");
      item.className = "history-item";
      item.textContent = entry;
      this.historyListEl.appendChild(item);
    }
  }

  private toggleHistory(open: boolean): void {
    this.sidebarEl.classList.toggle("open", open);
    this.overlayEl.classList.toggle("visible", open);
  }

  private async handleConnection(): Promise<void> {
    if (this.connection.getState() === "connected") {
      await this.connection.disconnect();
      return;
    }

    try {
      await this.connection.connect();
      this.unsubscribeGlassesKey?.();
      this.unsubscribeGlassesKey = this.connection.subscribeGlassesKey(async (key) => {
        await this.applyKey(key);
      });
      await this.updateDisplay();
    } catch (err) {
      console.error("Connection failed:", err);
    }
  }

  private async updateDisplay(): Promise<void> {
    const state = this.calculator.getState();
    const lines = renderCalculator(state);

    this.displayOpEl.textContent = state.inputMask;
    this.displayResEl.textContent = state.error ? `Error: ${state.error}` : state.resultValue;

    if (this.connection.getState() === "connected") {
      try {
        await this.display.sendText(lines);
      } catch (err) {
        console.error("Failed to send text:", err);
      }
    }
  }
}
