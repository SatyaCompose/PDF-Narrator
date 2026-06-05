"use client";

import { useState, useRef, useCallback } from "react";
import { callTTS } from "@/lib/tts";
import { buildSSML, splitSentences } from "@/lib/ssml";
import type { Voice, ModeKey } from "@/lib/voices";

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

  const setStatus = useCallback((msg: string, status: PlayStatus) => {
    setState((p) => ({ ...p, statusMsg: msg, status }));
  }, []);

  const hardStop = useCallback(() => {
    stopFlagRef.current = true;
    pausedRef.current = false;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    window.speechSynthesis?.cancel();
    setState({ status: "idle", progress: 0, statusMsg: "Stopped", activeWordIdx: -1 });
  }, []);

  const pause = useCallback(() => {
    pausedRef.current = true;
    if (audioRef.current) audioRef.current.pause();
    window.speechSynthesis?.pause();
    setState((p) => ({ ...p, status: "paused", statusMsg: "⏸ Paused" }));
  }, []);

  const resume = useCallback(() => {
    pausedRef.current = false;
    window.speechSynthesis?.resume();
    setState((p) => ({ ...p, status: "speaking", statusMsg: "" }));
  }, []);

  const playAudio = useCallback(
    (
      b64: string,
      sentText: string,
      wordOffset: number,
      totalWords: number
    ): Promise<void> => {
      return new Promise((res) => {
        const audio = new Audio("data:audio/mp3;base64," + b64);
        audioRef.current = audio;
        const sw = sentText.trim().split(/\s+/).filter(Boolean);

        audio.addEventListener("loadedmetadata", () => {
          const dur = audio.duration;
          sw.forEach((_, i) => {
            setTimeout(() => {
              if (stopFlagRef.current) return;
              const idx = wordOffset + i;
              setState((p) => ({
                ...p,
                activeWordIdx: idx,
                progress: Math.min(((idx + 1) / totalWords) * 100, 100),
              }));
            }, (i / sw.length) * dur * 1000);
          });
        });

        audio.addEventListener("ended", () => res());
        audio.addEventListener("error", () => res());

        const tick = setInterval(() => {
          if (stopFlagRef.current) {
            audio.pause();
            clearInterval(tick);
            res();
          } else if (pausedRef.current && !audio.paused) {
            audio.pause();
          } else if (!pausedRef.current && audio.paused && !stopFlagRef.current) {
            audio.play().catch(() => {});
          }
        }, 80);

        audio.play().catch(() => res());
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
      stopFlagRef.current = false;

      function next(i: number) {
        if (i >= sentences.length || stopFlagRef.current) {
          if (!stopFlagRef.current) {
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
          if (e.name !== "word") return;
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
    }) => {
      const { text, words, apiKey, lang, voice, mode, rate, pitch, pauseMs } = params;
      if (!text) return;

      stopFlagRef.current = false;
      pausedRef.current = false;
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
      let wordOffset = 0;

      for (let i = 0; i < sentences.length; i++) {
        if (stopFlagRef.current) break;
        while (pausedRef.current && !stopFlagRef.current) await sleep(80);
        if (stopFlagRef.current) break;

        setStatus(`Reading… ${i + 1} / ${sentences.length}`, "speaking");

        let b64: string;
        try {
          b64 = await callTTS(
            buildSSML(sentences[i], mode, rate, pitch, pauseMs),
            apiKey,
            lang,
            voice
          );
        } catch (e) {
          setStatus("⚠ " + (e instanceof Error ? e.message : "TTS error"), "error");
          return;
        }

        if (stopFlagRef.current) break;
        await playAudio(b64, sentences[i], wordOffset, words.length);
        wordOffset += sentences[i].trim().split(/\s+/).filter(Boolean).length;
        if (stopFlagRef.current) break;
        if (i < sentences.length - 1) await sleep(pauseMs);
      }

      if (!stopFlagRef.current) {
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

  return { state, speakPage, hardStop, pause, resume };
}
