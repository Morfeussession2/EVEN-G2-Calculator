import type { IEvenConnection } from "./EvenConnection";

export const MAX_CHARS_PER_LINE = 22;
export const MAX_LINES = 3;

export const GLASSES_LAYOUT = {
  title: { x: 70, y: 10, width: 420, height: 32 },
  display: { x: 170, y: 50, width: 230, height: 72 },
  keypad: { x: 220, y: 112, width: 230, height: 160 },
  icon: { x: 16, y: 10, width: 40, height: 60 },
  displayLineWidth: 20,
  headerPad: 32,
} as const;

export class EvenDisplay {
  public constructor(private readonly connection: IEvenConnection) { }

  public async sendText(lines: string[]): Promise<void> {
    const cleaned = lines.slice(0, MAX_LINES).map((line) => this.normalizeLine(line));
    await this.connection.sendText(cleaned);
  }

  public async clear(): Promise<void> {
    await this.sendText([" ", " ", " "]);
  }

  private normalizeLine(line: string): string {
    const ascii = line
      .split("")
      .filter((char) => {
        const code = char.charCodeAt(0);
        return code >= 32 && code <= 126;
      })
      .join("");

    if (ascii.length <= MAX_CHARS_PER_LINE) return ascii;
    return ascii.slice(0, MAX_CHARS_PER_LINE);
  }
}
