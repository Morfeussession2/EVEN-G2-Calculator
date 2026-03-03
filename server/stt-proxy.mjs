import express from "express";

const app = express();
const port = Number(process.env.STT_PROXY_PORT ?? 8787);

app.use(express.json({ limit: "15mb" }));

app.post("/api/stt", async (req, res) => {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      res.status(500).send("OPENAI_API_KEY is not configured.");
      return;
    }

    const pcmBase64 = req.body?.pcmBase64;
    const sampleRateHz = Number(req.body?.sampleRateHz ?? 16000);
    if (!pcmBase64 || typeof pcmBase64 !== "string") {
      res.status(400).send("Missing pcmBase64.");
      return;
    }

    const pcmBuffer = Buffer.from(pcmBase64, "base64");
    const wavBytes = toWavPcm16Mono(pcmBuffer, sampleRateHz);
    const wavBlob = new Blob([wavBytes], { type: "audio/wav" });

    const form = new FormData();
    form.append("file", wavBlob, "speech.wav");
    form.append("model", "gpt-4o-mini-transcribe");
    form.append("language", "pt");

    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: form,
    });

    if (!response.ok) {
      const text = await response.text();
      res.status(response.status).send(text);
      return;
    }

    const json = await response.json();
    res.json({ text: json.text ?? "" });
  } catch (error) {
    res.status(500).send(`STT proxy error: ${String(error)}`);
  }
});

app.listen(port, () => {
  console.log(`[stt-proxy] listening on http://localhost:${port}`);
});

function toWavPcm16Mono(pcm: Buffer, sampleRate: number) {
  const byteRate = sampleRate * 2;
  const blockAlign = 2;
  const wav = Buffer.alloc(44 + pcm.length);

  wav.write("RIFF", 0);
  wav.writeUInt32LE(36 + pcm.length, 4);
  wav.write("WAVE", 8);

  wav.write("fmt ", 12);
  wav.writeUInt32LE(16, 16);
  wav.writeUInt16LE(1, 20);
  wav.writeUInt16LE(1, 22);
  wav.writeUInt32LE(sampleRate, 24);
  wav.writeUInt32LE(byteRate, 28);
  wav.writeUInt16LE(blockAlign, 32);
  wav.writeUInt16LE(16, 34);

  wav.write("data", 36);
  wav.writeUInt32LE(pcm.length, 40);
  pcm.copy(wav, 44);

  return wav;
}
