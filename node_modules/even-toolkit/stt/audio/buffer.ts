import { float32ToWav } from './pcm-utils';

/** Audio accumulator — collects Float32 chunks and exports as WAV */
export function createAudioBuffer(config?: { maxSeconds?: number; sampleRate?: number }) {
  const sampleRate = config?.sampleRate ?? 16000;
  const maxSamples = (config?.maxSeconds ?? 30) * sampleRate;
  const chunks: Float32Array[] = [];
  let totalSamples = 0;

  function append(chunk: Float32Array): void {
    if (totalSamples + chunk.length > maxSamples) return;
    chunks.push(chunk);
    totalSamples += chunk.length;
  }

  function getAll(): Float32Array {
    const out = new Float32Array(totalSamples);
    let offset = 0;
    for (const chunk of chunks) {
      out.set(chunk, offset);
      offset += chunk.length;
    }
    return out;
  }

  function getWav(): Blob {
    return float32ToWav(getAll(), sampleRate);
  }

  function clear(): void {
    chunks.length = 0;
    totalSamples = 0;
  }

  function duration(): number {
    return totalSamples / sampleRate;
  }

  return { append, getAll, getWav, clear, duration };
}
