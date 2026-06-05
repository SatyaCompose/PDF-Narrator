import type { Voice } from "./voices";

export async function callTTS(
  ssml: string,
  apiKey: string,
  lang: string,
  voice: Voice
): Promise<string> {
  const res = await fetch(
    `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        input: { ssml },
        voice: { languageCode: lang, name: voice.name, ssmlGender: voice.g },
        audioConfig: {
          audioEncoding: "MP3",
          sampleRateHertz: 24000,
          effectsProfileId: ["headphone-class-device"],
        },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message ?? "TTS API error");
  }

  const data = await res.json();
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
