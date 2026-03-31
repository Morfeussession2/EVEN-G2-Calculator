/** Energy-based Voice Activity Detection */

export interface VADConfig {
  silenceThresholdMs?: number;  // default 1500
  speechThresholdDb?: number;   // default -26
  frameSizeMs?: number;         // default 30
}

export interface VADResult {
  isSpeech: boolean;
  speechStarted: boolean;
  speechEnded: boolean;
  energy: number;
}

export function createVAD(config?: VADConfig) {
  const silenceMs = config?.silenceThresholdMs ?? 1500;
  const thresholdDb = config?.speechThresholdDb ?? -26;
  const threshold = Math.pow(10, thresholdDb / 20);

  let speaking = false;
  let silenceStart = 0;

  function process(frame: Float32Array): VADResult {
    // RMS energy
    let sum = 0;
    for (let i = 0; i < frame.length; i++) {
      sum += frame[i] * frame[i];
    }
    const rms = Math.sqrt(sum / frame.length);
    const isSpeech = rms > threshold;

    let speechStarted = false;
    let speechEnded = false;

    if (isSpeech) {
      if (!speaking) {
        speaking = true;
        speechStarted = true;
      }
      silenceStart = 0;
    } else if (speaking) {
      if (silenceStart === 0) {
        silenceStart = Date.now();
      } else if (Date.now() - silenceStart > silenceMs) {
        speaking = false;
        speechEnded = true;
        silenceStart = 0;
      }
    }

    return { isSpeech, speechStarted, speechEnded, energy: rms };
  }

  function reset() {
    speaking = false;
    silenceStart = 0;
  }

  return { process, reset };
}
