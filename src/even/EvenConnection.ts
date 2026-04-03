import {
  CreateStartUpPageContainer,
  DeviceConnectType,
  ImageContainerProperty,
  ImageRawDataUpdate,
  OsEventTypeList,
  RebuildPageContainer,
  TextContainerProperty,
  TextContainerUpgrade,
  waitForEvenAppBridge,
  type EvenAppBridge,
  type EvenHubEvent,
} from "@evenrealities/even_hub_sdk";
import { GLASSES_LAYOUT } from "./EvenDisplay";
import { encodeGrayscalePng } from "./pngEncoder";

const iconPngUrl = "/favicon.ico";

export type ConnectionState = "disconnected" | "connecting" | "connected";

type StateListener = (state: ConnectionState) => void;
type GlassesKeyListener = (key: string) => void;
type SpeechStateListener = (enabled: boolean) => void;

export interface IEvenConnection {
  getState(): ConnectionState;
  subscribe(listener: StateListener): () => void;
  subscribeGlassesKey(listener: GlassesKeyListener): () => void;
  subscribeSpeechState(listener: SpeechStateListener): () => void;
  isSpeechEnabled(): boolean;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  sendText(lines: string[]): Promise<void>;
  setLogHandler(handler: (msg: string) => void): void;
  setLocalStorage(key: string, value: string): Promise<boolean>;
  getLocalStorage(key: string): Promise<string>;
}

export class EvenConnection implements IEvenConnection {
  private state: ConnectionState = "disconnected";
  private readonly listeners = new Set<StateListener>();
  private bridge: EvenAppBridge | null = null;
  private unsubscribeDeviceStatus: (() => void) | null = null;
  private unsubscribeEvenHubEvent: (() => void) | null = null;
  private startupPageCreated = false;
  private readonly glassesKeyListeners = new Set<GlassesKeyListener>();
  private readonly speechStateListeners = new Set<SpeechStateListener>();
  private selectedKeyIndex = 0;
  private speechEnabled = false;
  private lastDisplayLines: string[] = ["", "> 0", "= 0"];
  private onLog?: (msg: string) => void;

  public setLogHandler(handler: (msg: string) => void): void {
    this.onLog = handler;
  }

  private log(msg: string): void {
    console.log(`[EvenConnection] ${msg}`);
    this.onLog?.(msg);
  }

  private static readonly TITLE_CONTAINER_ID = 1;
  private static readonly TITLE_CONTAINER_NAME = "calc-title";
  private static readonly DISPLAY_CONTAINER_ID = 2;
  private static readonly DISPLAY_CONTAINER_NAME = "calc-screen";
  private static readonly KEYPAD_CONTAINER_ID = 3;
  private static readonly KEYPAD_CONTAINER_NAME = "calc-keypad";

  private static readonly KEYS: string[] = [
    "C",
    "+",
    "÷",
    "x",
    "7",
    "8",
    "9",
    "-",
    "4",
    "5",
    "6",
    "=",
    "1",
    "2",
    "3",
    "0",
  ];

  public getState(): ConnectionState {
    return this.state;
  }

  public subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  public subscribeGlassesKey(listener: GlassesKeyListener): () => void {
    this.glassesKeyListeners.add(listener);
    return () => this.glassesKeyListeners.delete(listener);
  }

  public subscribeSpeechState(listener: SpeechStateListener): () => void {
    this.speechStateListeners.add(listener);
    listener(this.speechEnabled);
    return () => this.speechStateListeners.delete(listener);
  }

  public isSpeechEnabled(): boolean {
    return this.speechEnabled;
  }

  public async connect(): Promise<void> {
    if (this.state !== "disconnected") return;
    this.setState("connecting");

    try {
      this.bridge = await waitForEvenAppBridge();
      this.log("Connecting to Even G2 Bridge...");
      // waitForEvenAppBridge already returns an initialized bridge

      this.unsubscribeDeviceStatus = this.bridge.onDeviceStatusChanged((status) => {
        const isConnected =
          status.connectType === DeviceConnectType.Connected ||
          status.connectType === DeviceConnectType.Connecting;
        this.log(`Device Status changed: ${status.connectType}`);
        this.setState(isConnected ? "connected" : "disconnected");
      });

      this.unsubscribeEvenHubEvent = this.bridge.onEvenHubEvent((event) => {
        void this.handleEvenHubEvent(event);
      });

      await this.ensureStartupPage();
      this.log("Startup Page Check Complete.");
      this.setState("connected");
    } catch (error) {
      this.log(`CONNECTION ERROR: ${String(error)}`);
      this.bridge = null;
      this.unsubscribeDeviceStatus?.();
      this.unsubscribeEvenHubEvent?.();
      this.unsubscribeDeviceStatus = null;
      this.unsubscribeEvenHubEvent = null;
      this.setState("disconnected");
      throw new Error(`Failed to connect to Even bridge: ${String(error)}`);
    }
  }

  public async disconnect(): Promise<void> {
    if (this.state === "disconnected") return;

    if (this.bridge) {
      try {
        await this.bridge.shutDownPageContainer(0);
      } catch {
        // Ignore shutdown errors during disconnect.
      }
    }

    this.unsubscribeDeviceStatus?.();
    this.unsubscribeEvenHubEvent?.();
    this.unsubscribeDeviceStatus = null;
    this.unsubscribeEvenHubEvent = null;
    this.speechEnabled = false;
    this.notifySpeechState();
    this.bridge = null;
    this.startupPageCreated = false;
    this.setState("disconnected");
  }

  public async sendText(lines: string[]): Promise<void> {
    if (this.state !== "connected") {
      throw new Error("Cannot send text while disconnected.");
    }

    if (!this.bridge) {
      throw new Error("Even bridge is not initialized.");
    }

    await this.ensureStartupPage();
    this.lastDisplayLines = lines;

    const payload = this.formatDisplayContent(lines);
    await this.updateDisplayContent(payload);
  }

  public async setLocalStorage(key: string, value: string): Promise<boolean> {
    if (!this.bridge) {
      this.bridge = await waitForEvenAppBridge();
    }
    try {
      return await this.bridge.setLocalStorage(key, value);
    } catch (e) {
      this.log(`setLocalStorage Error: ${String(e)}`);
      return false;
    }
  }

  public async getLocalStorage(key: string): Promise<string> {
    if (!this.bridge) {
      this.bridge = await waitForEvenAppBridge();
    }
    try {
      return await this.bridge.getLocalStorage(key);
    } catch (e) {
      this.log(`getLocalStorage Error: ${String(e)}`);
      return "";
    }
  }

  private setState(next: ConnectionState): void {
    this.state = next;
    this.listeners.forEach((listener) => listener(next));
  }

  private async ensureStartupPage(): Promise<void> {
    if (this.startupPageCreated) return;
    if (!this.bridge) throw new Error("Even bridge is not initialized.");

    const titleContainer = new TextContainerProperty({
      xPosition: GLASSES_LAYOUT.title.x,
      yPosition: GLASSES_LAYOUT.title.y,
      width: GLASSES_LAYOUT.title.width,
      height: GLASSES_LAYOUT.title.height,
      containerID: EvenConnection.TITLE_CONTAINER_ID,
      containerName: EvenConnection.TITLE_CONTAINER_NAME,
      content: this.renderHeaderText(),
      isEventCapture: 0,
    });

    const displayContainer = new TextContainerProperty({
      xPosition: GLASSES_LAYOUT.display.x,
      yPosition: GLASSES_LAYOUT.display.y,
      width: GLASSES_LAYOUT.display.width,
      height: GLASSES_LAYOUT.display.height,
      borderWidth: 1,
      containerID: EvenConnection.DISPLAY_CONTAINER_ID,
      containerName: EvenConnection.DISPLAY_CONTAINER_NAME,
      content: `${"0".padStart(GLASSES_LAYOUT.displayLineWidth)}\n${"0".padStart(GLASSES_LAYOUT.displayLineWidth)}`,
      isEventCapture: 0,
    });
    const keypadGrid = new TextContainerProperty({
      xPosition: GLASSES_LAYOUT.keypad.x,
      yPosition: GLASSES_LAYOUT.keypad.y,
      width: GLASSES_LAYOUT.keypad.width,
      height: GLASSES_LAYOUT.keypad.height,
      isEventCapture: 1,
      containerID: EvenConnection.KEYPAD_CONTAINER_ID,
      containerName: EvenConnection.KEYPAD_CONTAINER_NAME,
      content: this.renderTextKeypadGrid(),
    });

    const container = new CreateStartUpPageContainer({
      containerTotalNum: 3,
      textObject: [titleContainer, displayContainer, keypadGrid],
      imageObject: [],
    });


    this.log("Creating StartUp Page Containers...");
    const result = await this.bridge.createStartUpPageContainer(container);
    this.log(`createStartUpPageContainer result: ${result}`);

    if (result === 1) {
      const rebuild = new RebuildPageContainer({
        containerTotalNum: 3,
        textObject: [titleContainer, displayContainer, keypadGrid],
        imageObject: [],
      });
      const rebuilt = await this.bridge.rebuildPageContainer(rebuild);
      this.log(`rebuildPageContainer result: ${rebuilt}`);
      if (!rebuilt) {
        throw new Error("rebuildPageContainer failed after create returned invalid.");
      }
    } else if (result !== 0) {
      throw new Error(`createStartUpPageContainer failed with code ${result}`);
    }

    this.log("Startup UI Logic Complete.");
    this.startupPageCreated = true;
  }

  private async handleEvenHubEvent(event: EvenHubEvent): Promise<void> {
    if (event.audioEvent && this.speechEnabled) {
      // Audio PCM is available here if you want a custom decoder.
      console.log("audioEvent pcm bytes:", event.audioEvent.audioPcm.length);
    }

    const textOrList = event.textEvent ?? event.listEvent;
    const fromKeypad =
      textOrList?.containerID === EvenConnection.KEYPAD_CONTAINER_ID ||
      textOrList?.containerName === EvenConnection.KEYPAD_CONTAINER_NAME;
    const eventType = this.resolveEventType(event);

    this.log(`Event Received: ${eventType !== undefined ? OsEventTypeList[eventType] : "UNKNOWN"} (ID: ${textOrList?.containerID})`);

    if (!fromKeypad && eventType !== OsEventTypeList.CLICK_EVENT && eventType !== OsEventTypeList.DOUBLE_CLICK_EVENT) {
      return;
    }

    if (eventType === OsEventTypeList.SCROLL_TOP_EVENT) {
      this.selectedKeyIndex =
        (this.selectedKeyIndex - 1 + EvenConnection.KEYS.length) % EvenConnection.KEYS.length;
      await this.updateKeypadText();
      return;
    }

    if (eventType === OsEventTypeList.SCROLL_BOTTOM_EVENT) {
      this.selectedKeyIndex = (this.selectedKeyIndex + 1) % EvenConnection.KEYS.length;
      await this.updateKeypadText();
      return;
    }

    if (
      eventType === OsEventTypeList.CLICK_EVENT ||
      eventType === OsEventTypeList.DOUBLE_CLICK_EVENT
    ) {
      const selected = EvenConnection.KEYS[this.selectedKeyIndex];
      const mapped = this.mapKeyToInput(selected);
      if (!mapped) return;
      this.glassesKeyListeners.forEach((listener) => listener(mapped));
    }
  }

  private resolveEventType(event: EvenHubEvent): OsEventTypeList | undefined {
    const direct =
      OsEventTypeList.fromJson(event.textEvent?.eventType) ??
      OsEventTypeList.fromJson(event.listEvent?.eventType) ??
      OsEventTypeList.fromJson(event.sysEvent?.eventType) ??
      OsEventTypeList.fromJson((event.jsonData as Record<string, unknown> | undefined)?.eventType);
    if (direct !== undefined) {
      return direct;
    }

    const sysHint = this.resolveFromSysEventHint(event.sysEvent);
    if (sysHint !== undefined) {
      return sysHint;
    }

    const rawJson = JSON.stringify({
      textEvent: event.textEvent,
      listEvent: event.listEvent,
      sysEvent: event.sysEvent,
      jsonData: event.jsonData,
    }).toLowerCase();

    // Fallback used in other projects too: some hosts push sysEvent/listEvent without normalized eventType.
    if (rawJson.includes("scroll_top")) return OsEventTypeList.SCROLL_TOP_EVENT;
    if (rawJson.includes("scroll_bottom")) return OsEventTypeList.SCROLL_BOTTOM_EVENT;
    if (
      rawJson.includes("click") ||
      rawJson.includes("t14") ||
      rawJson.includes("single") ||
      rawJson.includes("tap") ||
      rawJson.includes("press")
    ) {
      return OsEventTypeList.CLICK_EVENT;
    }
    if (event.sysEvent && !event.textEvent && !event.listEvent) {
      return OsEventTypeList.CLICK_EVENT;
    }

    return undefined;
  }

  private resolveFromSysEventHint(sysEvent: unknown): OsEventTypeList | undefined {
    if (!sysEvent || typeof sysEvent !== "object") return undefined;

    const ctorName = ((sysEvent as { constructor?: { name?: string } }).constructor?.name ?? "").toLowerCase();
    const tag = Object.prototype.toString.call(sysEvent).toLowerCase();
    const sig = `${ctorName} ${tag}`;

    // In some simulator builds, click arrives as sysEvent class t14 with undefined eventType.
    if (sig.includes("t14")) return OsEventTypeList.CLICK_EVENT;
    if (sig.includes("tap") || sig.includes("single") || sig.includes("press")) {
      return OsEventTypeList.CLICK_EVENT;
    }
    if (sig.includes("t15")) return OsEventTypeList.DOUBLE_CLICK_EVENT;
    if (sig.includes("t12")) return OsEventTypeList.SCROLL_TOP_EVENT;
    if (sig.includes("t13")) return OsEventTypeList.SCROLL_BOTTOM_EVENT;

    return undefined;
  }

  private async updateKeypadText(): Promise<void> {
    if (!this.bridge || !this.startupPageCreated) return;

    await this.bridge.textContainerUpgrade(
      new TextContainerUpgrade({
        containerID: EvenConnection.KEYPAD_CONTAINER_ID,
        containerName: EvenConnection.KEYPAD_CONTAINER_NAME,
        content: this.renderTextKeypadGrid(),
      }),
    );
  }

  private renderTextKeypadGrid(): string {
    let result = "";
    const cols = 4;
    for (let r = 0; r < 4; r++) {
      let rowStr = "";
      for (let c = 0; c < 4; c++) {
        const idx = r * cols + c;
        const key = EvenConnection.KEYS[idx];
        const isSelected = idx === this.selectedKeyIndex;
        const keyStr = isSelected ? `[${key}]` : ` ${key} `;
        rowStr += keyStr.padEnd(5, " ");
      }
      result += rowStr.trimEnd() + (r < 3 ? "\n" : "");
    }
    return result;
  }

  private mapKeyToInput(key: string): string | null {
    if (key === "÷") return "/";
    if (key === "x") return "*";
    return key;
  }

  private formatDisplayContent(lines: string[]): string {
    const safe = lines.map((line) => this.toAscii(line));
    const expression = (safe[1] ?? "").replace(/^>\s*/, "");
    const result = (safe[2] ?? "").replace(/^=\s*/, "");
    return `${expression.padStart(GLASSES_LAYOUT.displayLineWidth)}\n${result.padStart(GLASSES_LAYOUT.displayLineWidth)}`;
  }

  private async updateDisplayContent(content: string): Promise<void> {
    if (!this.bridge) throw new Error("Even bridge is not initialized.");

    const upgrade = new TextContainerUpgrade({
      containerID: EvenConnection.DISPLAY_CONTAINER_ID,
      containerName: EvenConnection.DISPLAY_CONTAINER_NAME,
      content,
    });

    const success = await this.bridge.textContainerUpgrade(upgrade);
    if (!success) {
      throw new Error("textContainerUpgrade returned false.");
    }
  }

  private async toggleSpeechMode(): Promise<void> {
    if (!this.bridge) return;

    const next = !this.speechEnabled;
    const ok = await this.bridge.audioControl(next);
    if (!ok) return;

    this.speechEnabled = next;
    this.notifySpeechState();
    await this.updateHeaderText();
    await this.updateDisplayContent(this.formatDisplayContent(this.lastDisplayLines));
  }

  private notifySpeechState(): void {
    this.speechStateListeners.forEach((listener) => listener(this.speechEnabled));
  }

  private renderHeaderText(): string {
    return "";
  }

  private async updateHeaderText(): Promise<void> {
    if (!this.bridge || !this.startupPageCreated) return;

    await this.bridge.textContainerUpgrade(
      new TextContainerUpgrade({
        containerID: EvenConnection.TITLE_CONTAINER_ID,
        containerName: EvenConnection.TITLE_CONTAINER_NAME,
        content: this.renderHeaderText(),
      }),
    );
  }

  private toAscii(input: string): string {
    return input
      .split("")
      .filter((char) => {
        const code = char.charCodeAt(0);
        return code >= 32 && code <= 126;
      })
      .join("");
  }
}
