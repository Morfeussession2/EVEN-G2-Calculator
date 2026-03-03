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
import iconPngUrl from "../../Midias/Evencalc-02.png";
import { GLASSES_LAYOUT } from "./EvenDisplay";
import { encodeGrayscalePng } from "./pngEncoder";

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
  private iconImageData: number[] | null = null;
  private speechEnabled = false;
  private lastDisplayLines: string[] = ["CALC G2", "> 0", "= 0"];

  private static readonly TITLE_CONTAINER_ID = 1;
  private static readonly TITLE_CONTAINER_NAME = "calc-title";
  private static readonly DISPLAY_CONTAINER_ID = 2;
  private static readonly DISPLAY_CONTAINER_NAME = "calc-screen";
  private static readonly KEYPAD_CONTAINER_ID = 3;
  private static readonly KEYPAD_CONTAINER_NAME = "calc-keypad";
  private static readonly ICON_CONTAINER_ID = 4;
  private static readonly ICON_CONTAINER_NAME = "calc-icon";

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

      this.unsubscribeDeviceStatus = this.bridge.onDeviceStatusChanged((status) => {
        const isConnected =
          status.connectType === DeviceConnectType.Connected ||
          status.connectType === DeviceConnectType.Connecting;
        this.setState(isConnected ? "connected" : "disconnected");
      });

      this.unsubscribeEvenHubEvent = this.bridge.onEvenHubEvent((event) => {
        void this.handleEvenHubEvent(event);
      });

      await this.ensureStartupPage();
      this.setState("connected");
    } catch (error) {
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
      borderRdaius: 10,
      containerID: EvenConnection.DISPLAY_CONTAINER_ID,
      containerName: EvenConnection.DISPLAY_CONTAINER_NAME,
      content: `${"0".padStart(GLASSES_LAYOUT.displayLineWidth)}\n${"0".padStart(GLASSES_LAYOUT.displayLineWidth)}`,
      isEventCapture: 0,
    });

    const keypadContainer = new TextContainerProperty({
      xPosition: GLASSES_LAYOUT.keypad.x,
      yPosition: GLASSES_LAYOUT.keypad.y,
      width: GLASSES_LAYOUT.keypad.width,
      height: GLASSES_LAYOUT.keypad.height,
      borderWidth: 1,
      borderRdaius: 14,
      containerID: EvenConnection.KEYPAD_CONTAINER_ID,
      containerName: EvenConnection.KEYPAD_CONTAINER_NAME,
      content: this.renderKeypadText(),
      isEventCapture: 1,
    });

    const iconContainer = new ImageContainerProperty({
      xPosition: GLASSES_LAYOUT.icon.x,
      yPosition: GLASSES_LAYOUT.icon.y,
      width: GLASSES_LAYOUT.icon.width,
      height: GLASSES_LAYOUT.icon.height,
      containerID: EvenConnection.ICON_CONTAINER_ID,
      containerName: EvenConnection.ICON_CONTAINER_NAME,
    });

    const container = new CreateStartUpPageContainer({
      containerTotalNum: 4,
      textObject: [titleContainer, displayContainer, keypadContainer],
      imageObject: [iconContainer],
    });

    const result = await this.bridge.createStartUpPageContainer(container);
    if (result === 1) {
      const rebuild = new RebuildPageContainer({
        containerTotalNum: 4,
        textObject: [titleContainer, displayContainer, keypadContainer],
        imageObject: [iconContainer],
      });
      const rebuilt = await this.bridge.rebuildPageContainer(rebuild);
      if (!rebuilt) {
        throw new Error("rebuildPageContainer failed after create returned invalid.");
      }
    } else if (result !== 0) {
      throw new Error(`createStartUpPageContainer failed with code ${result}`);
    }

    await this.pushIconImage();
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
        content: this.renderKeypadText(),
      }),
    );
  }

  private renderKeypadText(): string {
    const rows = [0, 1, 2, 3].map((row) => {
      const cols = [0, 1, 2, 3].map((col) => {
        const index = row * 4 + col;
        const key = EvenConnection.KEYS[index];
        const base = key.padEnd(2, " ");
        return index === this.selectedKeyIndex ? `[${base}]` : ` ${base} `;
      });
      return cols.join(" ");
    });
    return rows.join("\n");
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
    const state = this.speechEnabled ? "" : "";
    return `${"Even-Calc".padEnd(GLASSES_LAYOUT.headerPad, " ")}${state}`;
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

  private async pushIconImage(): Promise<void> {
    if (!this.bridge) return;

    const imageData = await this.getIconImageData();
    if (!imageData) return;

    await this.bridge.updateImageRawData(
      new ImageRawDataUpdate({
        containerID: EvenConnection.ICON_CONTAINER_ID,
        containerName: EvenConnection.ICON_CONTAINER_NAME,
        imageData,
      }),
    );
  }

  private async getIconImageData(): Promise<number[] | null> {
    if (this.iconImageData) return this.iconImageData;

    try {
      const response = await fetch(iconPngUrl);
      if (!response.ok) return null;

      const blob = await response.blob();
      const bitmap = await createImageBitmap(blob);

      const width = GLASSES_LAYOUT.icon.width;
      const height = GLASSES_LAYOUT.icon.height;
      const canvas =
        typeof OffscreenCanvas !== "undefined"
          ? new OffscreenCanvas(width, height)
          : (() => {
              const c = document.createElement("canvas");
              c.width = width;
              c.height = height;
              return c;
            })();
      const ctx = canvas.getContext("2d") as
        | OffscreenCanvasRenderingContext2D
        | CanvasRenderingContext2D
        | null;
      if (!ctx) return null;

      ctx.drawImage(bitmap, 0, 0, width, height);
      const pixels = ctx.getImageData(0, 0, width, height).data;
      const grayscale = new Uint8Array(width * height);

      for (let i = 0; i < width * height; i += 1) {
        const offset = i * 4;
        const r = pixels[offset];
        const g = pixels[offset + 1];
        const b = pixels[offset + 2];
        grayscale[i] = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
      }

      const encoded = encodeGrayscalePng(width, height, grayscale);
      this.iconImageData = Array.from(encoded);
      return this.iconImageData;
    } catch {
      return null;
    }
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
