/** Convert Uint8Array of 16-bit signed PCM to Int16Array */
export function uint8ToPcm16(data: Uint8Array): Int16Array {
  return new Int16Array(data.buffer, data.byteOffset, data.byteLength / 2);
}

/** Convert Int16Array PCM to Float32Array [-1, 1] */
export function pcm16ToFloat32(data: Int16Array): Float32Array {
  const out = new Float32Array(data.length);
  for (let i = 0; i < data.length; i++) {
    out[i] = data[i] / 32768;
  }
  return out;
}

/** Convert Float32Array [-1, 1] to Int16Array PCM */
export function float32ToPcm16(data: Float32Array): Int16Array {
  const out = new Int16Array(data.length);
  for (let i = 0; i < data.length; i++) {
    const s = Math.max(-1, Math.min(1, data[i]));
    out[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return out;
}

/** Convert Float32Array to WAV Blob */
export function float32ToWav(data: Float32Array, sampleRate: number): Blob {
  const pcm = float32ToPcm16(data);
  const buffer = new ArrayBuffer(44 + pcm.byteLength);
  const view = new DataView(buffer);

  // RIFF header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + pcm.byteLength, true);
  writeString(view, 8, 'WAVE');

  // fmt chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);          // chunk size
  view.setUint16(20, 1, true);           // PCM format
  view.setUint16(22, 1, true);           // mono
  view.setUint32(24, sampleRate, true);  // sample rate
  view.setUint32(28, sampleRate * 2, true); // byte rate
  view.setUint16(32, 2, true);           // block align
  view.setUint16(34, 16, true);          // bits per sample

  // data chunk
  writeString(view, 36, 'data');
  view.setUint32(40, pcm.byteLength, true);

  const bytes = new Uint8Array(buffer, 44);
  bytes.set(new Uint8Array(pcm.buffer, pcm.byteOffset, pcm.byteLength));

  return new Blob([buffer], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, str: string): void {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}
