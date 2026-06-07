"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { callTTS } from "@/lib/tts";
import { buildSSML, splitSentences } from "@/lib/ssml";
import type { Voice, ModeKey } from "@/lib/voices";
import { getMonthlyUsage, addMonthlyUsage } from "@/lib/charUsage";

export type PlayStatus = "idle" | "loading" | "speaking" | "paused" | "done" | "error";

export interface PlaybackState {
  status: PlayStatus;
  progress: number;
  statusMsg: string;
  activeWordIdx: number;
}

function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

export function usePlayback() {
  const [state, setState] = useState<PlaybackState>({
    status: "idle",
    progress: 0,
    statusMsg: "Load a PDF to begin",
    activeWordIdx: -1,
  });

  const stopFlagRef = useRef(false);
  const pausedRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const genRef = useRef(0);
  const currentStatusRef = useRef<PlayStatus>("idle");
  const [monthlyChars, setMonthlyChars] = useState(0);

  // Mutable settings ref — updated live so the loop picks up changes at sentence boundaries
  const liveRef = useRef({ mode: "teaching" as ModeKey, rate: 0.82, pitch: 0, pauseMs: 900 });
  const updateLiveSettings = useCallback(
    (s: { mode: ModeKey; rate: number; pitch: number; pauseMs: number }) => {
      liveRef.current = s;
    },
    []
  );

  useEffect(() => { setMonthlyChars(getMonthlyUsage()); }, []);

  const setStatus = useCallback((msg: string, status: PlayStatus) => {
    currentStatusRef.current = status;
    setState((p) => ({ ...p, statusMsg: msg, status }));
  }, []);

  const hardStop = useCallback(() => {
    genRef.current += 1;
    stopFlagRef.current = true;
    pausedRef.current = false;
    currentStatusRef.current = "idle";
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    window.speechSynthesis?.cancel();
    setState({ status: "idle", progress: 0, statusMsg: "Stopped", activeWordIdx: -1 });
  }, []);

  const pause = useCallback(() => {
    pausedRef.current = true;
    currentStatusRef.current = "paused";
    if (audioRef.current) audioRef.current.pause();
    window.speechSynthesis?.pause();
    setState((p) => ({ ...p, status: "paused", statusMsg: "⏸ Paused" }));
  }, []);

  const resume = useCallback(() => {
    if (currentStatusRef.current !== "paused") return;
    pausedRef.current = false;
    currentStatusRef.current = "speaking";
    window.speechSynthesis?.resume();
    setState((p) => ({ ...p, status: "speaking", statusMsg: "" }));
  }, []);

  const playAudio = useCallback(
    (
      b64: string,
      sentText: string,
      wordOffset: number,
      totalWords: number,
      myGen: number
    ): Promise<void> => {
      return new Promise((res) => {
        if (genRef.current !== myGen) { res(); return; }
        const audio = new Audio("data:audio/mp3;base64," + b64);
        audioRef.current = audio;
        const sw = sentText.trim().split(/\s+/).filter(Boolean);

        // Give extra weight to words followed by SSML break punctuation (commas, colons, semicolons)
        // and to abbreviations that TTS expands (e.g. → "for example")
        const ABBREVS: [RegExp, string][] = [
          [/^e\.g\.$/i, "for example"],
          [/^i\.e\.$/i, "that is"],
          [/^etc\.$/i, "et cetera"],
          [/^vs\.$/i, "versus"],
          [/^dr\.$/i, "doctor"],
          [/^mr\.$/i, "mister"],
          [/^mrs\.$/i, "missus"],
          [/^prof\.$/i, "professor"],
        ];
        const charCounts = sw.map((w) => {
          const expanded = ABBREVS.find(([re]) => re.test(w));
          const base = expanded ? expanded[1].length : w.length;
          // Words ending in comma/colon/semicolon add SSML break time after them
          return /[,;:]$/.test(w) ? base * 2.2 : base;
        });
        const totalChars = charCounts.reduce((s, c) => s + c, 0) || 1;
        const cumulative = charCounts.reduce<number[]>((acc, c) => {
          acc.push((acc[acc.length - 1] ?? 0) + c);
          return acc;
        }, []);

        let wordTimes: number[] = [];
        let lastW = -1;

        audio.addEventListener("loadedmetadata", () => {
          const dur = audio.duration;
          if (!dur || dur < 0.05) return;
          // Use fixed-offset bounds instead of percentage compression.
          // Percentage-based trailing cutoff (old: 15%) causes text to run ahead of
          // voice on long sentences because 15% of a 30s audio = 4.5s of skipped speech.
          const tStart = Math.min(0.08, dur * 0.06); // ~80ms leading silence
          const tTrail = Math.min(0.35, dur * 0.10); // ~350ms trailing silence
          const tSpan = Math.max(dur - tStart - tTrail, dur * 0.5);
          wordTimes = sw.map((_, i) => {
            const mid = (cumulative[i] - charCounts[i] * 0.5) / totalChars;
            return tStart + mid * tSpan;
          });
        });

        const tick = setInterval(() => {
          if (genRef.current !== myGen || stopFlagRef.current) {
            audio.pause();
            clearInterval(tick);
            res();
            return;
          }
          if (pausedRef.current && !audio.paused) {
            audio.pause();
          } else if (!pausedRef.current && audio.paused && !stopFlagRef.current) {
            audio.play().catch(() => {});
          }
          // Drive word highlighting from the interval (80ms) instead of timeupdate
          // so highlights advance smoothly regardless of browser throttling.
          if (!pausedRef.current && wordTimes.length > 0) {
            const t = audio.currentTime;
            while (lastW + 1 < wordTimes.length && t >= wordTimes[lastW + 1]) {
              lastW++;
            }
            if (lastW >= 0) {
              const idx = wordOffset + lastW;
              setState((p) => ({
                ...p,
                activeWordIdx: idx,
                progress: Math.min(((idx + 1) / totalWords) * 100, 100),
              }));
            }
          }
        }, 80);

        audio.addEventListener("ended", () => { clearInterval(tick); res(); });
        audio.addEventListener("error", () => { clearInterval(tick); res(); });

        audio.play().catch(() => { clearInterval(tick); res(); });
      });
    },
    []
  );

  const fallbackSpeak = useCallback(
    (
      text: string,
      words: string[],
      lang: string,
      rate: number,
      pitch: number,
      pauseMs: number
    ) => {
      const sentences = splitSentences(text);
      const allVoices = window.speechSynthesis.getVoices();
      const pick =
        allVoices.find((v) => v.lang === lang) ??
        allVoices.find((v) => v.lang.startsWith("en-IN")) ??
        allVoices.find((v) => v.lang.startsWith("en"));

      let wordOffset = 0;
      const myGen = genRef.current;

      function next(i: number) {
        if (i >= sentences.length || stopFlagRef.current || genRef.current !== myGen) {
          if (!stopFlagRef.current && genRef.current === myGen) {
            setState((p) => ({
              ...p,
              status: "done",
              progress: 100,
              statusMsg: "✓ Finished",
              activeWordIdx: -1,
            }));
          }
          return;
        }
        const u = new SpeechSynthesisUtterance(sentences[i]);
        u.rate = rate;
        u.pitch = 1 + pitch / 20;
        if (pick) u.voice = pick;
        u.addEventListener("boundary", (e: SpeechSynthesisEvent) => {
          if (e.name !== "word" || genRef.current !== myGen) return;
          const sp = sentences[i].slice(0, e.charIndex).trim().split(/\s+/).length;
          const idx = wordOffset + sp - 1;
          setState((p) => ({
            ...p,
            activeWordIdx: idx,
            progress: Math.min(((idx + 1) / words.length) * 100, 100),
          }));
        });
        u.onend = () => {
          wordOffset += sentences[i].trim().split(/\s+/).filter(Boolean).length;
          setTimeout(() => next(i + 1), pauseMs);
        };
        u.onerror = () => next(i + 1);
        window.speechSynthesis.speak(u);
      }
      next(0);
    },
    []
  );

  const speakPage = useCallback(
    async (params: {
      text: string;
      words: string[];
      apiKey: string;
      lang: string;
      voice: Voice;
      mode: ModeKey;
      rate: number;
      pitch: number;
      pauseMs: number;
      startWordIdx?: number;  // overall word index into `words`; trims first sentence
    }) => {
      const { text, words, apiKey, lang, voice, mode, rate, pitch, pauseMs, startWordIdx = 0 } = params;
      if (!text) return;

      // Kill any running audio before starting
      genRef.current += 1;
      const myGen = genRef.current;
      stopFlagRef.current = false;
      pausedRef.current = false;
      currentStatusRef.current = "loading";
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      window.speechSynthesis?.cancel();

      setState((p) => ({ ...p, status: "loading", progress: 0, activeWordIdx: -1 }));

      if (!apiKey) {
        setStatus(
          "Reading (browser voice — add API key for Indian accent)…",
          "speaking"
        );
        fallbackSpeak(text, words, lang, rate, pitch, pauseMs);
        return;
      }

      const sentences = splitSentences(text);

      // Find which sentence contains startWordIdx, and the word offset within it.
      // This lets us start mid-sentence when the user clicks a word inside a long sentence.
      const clampedStart = Math.max(0, Math.min(startWordIdx, words.length - 1));
      let sentStart = 0;
      let startSentIdx = sentences.length - 1;
      let wordInSent = 0;
      for (let i = 0; i < sentences.length; i++) {
        const wc = sentences[i].trim().split(/\s+/).filter(Boolean).length;
        if (clampedStart < sentStart + wc) {
          startSentIdx = i;
          wordInSent = clampedStart - sentStart;
          break;
        }
        sentStart += wc;
      }

      // wordOffset = overall word index at the start of the current sentence
      let wordOffset = sentStart;

      for (let i = startSentIdx; i < sentences.length; i++) {
        if (genRef.current !== myGen || stopFlagRef.current) break;
        while (pausedRef.current && !stopFlagRef.current) await sleep(80);
        if (genRef.current !== myGen || stopFlagRef.current) break;

        setStatus(`Reading… ${i + 1} / ${sentences.length}`, "speaking");

        // Read live settings at each sentence so slider changes apply without restart
        const { mode: lMode, rate: lRate, pitch: lPitch, pauseMs: lPauseMs } = liveRef.current;

        const sentWords = sentences[i].trim().split(/\s+/).filter(Boolean);

        // For the first sentence, trim to the clicked word so reading truly starts there
        let sentText = sentences[i];
        let sentWordOffset = wordOffset;
        if (i === startSentIdx && wordInSent > 0) {
          sentText = sentWords.slice(wordInSent).join(" ");
          sentWordOffset = wordOffset + wordInSent;
        }

        let b64: string;
        const ssml = buildSSML(sentText, lMode, lRate, lPitch, lPauseMs);
        try {
          b64 = await callTTS(ssml, apiKey, lang, voice);
          setMonthlyChars(addMonthlyUsage(sentText.length));
        } catch (e) {
          if (genRef.current !== myGen) return;
          const msg = e instanceof Error ? e.message : "TTS error";
          setStatus(
            msg === "Failed to fetch"
              ? "⚠ Network error — check connection and try again"
              : "⚠ " + msg,
            "error"
          );
          return;
        }

        if (genRef.current !== myGen || stopFlagRef.current) break;
        await playAudio(b64, sentText, sentWordOffset, words.length, myGen);
        wordOffset += sentWords.length; // advance by full sentence, not trimmed slice
        if (genRef.current !== myGen || stopFlagRef.current) break;
        if (i < sentences.length - 1) await sleep(liveRef.current.pauseMs);
      }

      if (genRef.current === myGen && !stopFlagRef.current) {
        currentStatusRef.current = "done";
        setState((p) => ({
          ...p,
          status: "done",
          progress: 100,
          statusMsg: "✓ Finished",
          activeWordIdx: -1,
        }));
      }
    },
    [setStatus, playAudio, fallbackSpeak]
  );

  return { state, speakPage, hardStop, pause, resume, currentStatusRef, monthlyChars, updateLiveSettings };
}
