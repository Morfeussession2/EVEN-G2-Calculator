export interface PcmSpeechTranscriberConfig {
  endpoint: string;
  flushIntervalMs: number;
  minBytesPerFlush: number;
  sampleRateHz: number;
  onTranscript: (text: string) => void | Promise<void>;
  onError?: (message: string) => void;
}

export class PcmSpeechTranscriber {
  private readonly chunks: Uint8Array[] = [];
  private flushTimer: ReturnType<typeof setInterval> | null = null;
  private enabled = false;
  private inFlight = false;

  public constructor(private readonly config: PcmSpeechTranscriberConfig) {}

  public start(): void {
    if (this.enabled) return;
    this.enabled = true;
    this.flushTimer = setInterval(() => {
      void this.flush(false);
    }, this.config.flushIntervalMs);
  }

  public async stop(): Promise<void> {
    this.enabled = false;
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    await this.flush(true);
  }

  public pushPcm(chunk: Uint8Array): void {
    if (!this.enabled) return;
    this.chunks.push(chunk);
  }

  private async flush(force: boolean): Promise<void> {
    if (this.inFlight) return;
    const total = this.chunks.reduce((sum, c) => sum + c.length, 0);
    if (total === 0) return;
    if (!force && total < this.config.minBytesPerFlush) return;

    const payload = new Uint8Array(total);
    let offset = 0;
    while (this.chunks.length > 0) {
      const c = this.chunks.shift()!;
      payload.set(c, offset);
      offset += c.length;
    }

    this.inFlight = true;
    try {
      const body = {
        pcmBase64: uint8ToBase64(payload),
        sampleRateHz: this.config.sampleRateHz,
      };

      const response = await fetch(this.config.endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const text = await response.text();
        this.config.onError?.(`STT failed (${response.status}): ${text}`);
        return;
      }

      const json = (await response.json()) as { text?: string };
      const transcript = (json.text ?? "").trim();
      if (!transcript) return;
      await this.config.onTranscript(transcript);
    } catch (error) {
      this.config.onError?.(`STT request error: ${String(error)}`);
    } finally {
      this.inFlight = false;
    }
  }
}

function uint8ToBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary);
}
