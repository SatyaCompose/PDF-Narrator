import type { Voice } from "./voices";
import { trackTTS } from "./usageTracker";
import type { TierId } from "./usageTracker";

export async function callTTS(
  ssml: string,
  apiKey: string,
  lang: string,
  voice: Voice
): Promise<string> {
  const isChirp = voice.tier === "Chirp3HD";

  // Chirp3-HD voices don't accept ssmlGender or effectsProfileId,
  // and are optimised for 48 kHz output.
  const voiceParams = isChirp
    ? { languageCode: lang, name: voice.name }
    : { languageCode: lang, name: voice.name, ssmlGender: voice.g };

  const audioConfig = isChirp
    ? { audioEncoding: "MP3", sampleRateHertz: 48000 }
    : { audioEncoding: "MP3", sampleRateHertz: 24000, effectsProfileId: ["headphone-class-device"] };

  const res = await fetch(
    `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        input: { ssml },
        voice: voiceParams,
        audioConfig,
      }),
    }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message ?? "TTS API error");
  }

  const data = await res.json();
  trackTTS((voice.tier ?? "Standard") as TierId, ssml.length);
  return data.audioContent as string;
}

export async function testApiKey(key: string): Promise<void> {
  const res = await fetch(
    `https://texttospeech.googleapis.com/v1/voices?key=${key}&languageCode=en-IN`
  );
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message ?? "Invalid key or API not enabled");
  }
}
