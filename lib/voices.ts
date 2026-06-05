export type Gender = "FEMALE" | "MALE";

export interface Voice {
  name: string;
  label: string;
  g: Gender;
}

export interface Language {
  code: string;
  label: string;
  script: string;
}

export const LANGUAGES: Language[] = [
  { code: "en-IN", label: "English (India)", script: "EN" },
  { code: "hi-IN", label: "हिन्दी", script: "HI" },
  { code: "te-IN", label: "తెలుగు", script: "TE" },
];

export const VOICES: Record<string, Voice[]> = {
  "en-IN": [
    { name: "en-IN-Standard-A", label: "Ananya", g: "FEMALE" },
    { name: "en-IN-Standard-D", label: "Priya", g: "FEMALE" },
    { name: "en-IN-Standard-B", label: "Arjun", g: "MALE" },
    { name: "en-IN-Standard-C", label: "Rohan", g: "MALE" },
  ],
  "hi-IN": [
    { name: "hi-IN-Standard-A", label: "Prachi", g: "FEMALE" },
    { name: "hi-IN-Standard-D", label: "Kavya", g: "FEMALE" },
    { name: "hi-IN-Standard-B", label: "Vikram", g: "MALE" },
    { name: "hi-IN-Standard-C", label: "Rajiv", g: "MALE" },
  ],
  "te-IN": [
    { name: "te-IN-Standard-A", label: "Lalitha", g: "FEMALE" },
    { name: "te-IN-Standard-B", label: "Suresh", g: "MALE" },
  ],
};

export type ModeKey = "teaching" | "conversational" | "story";

export interface ReadingMode {
  key: ModeKey;
  label: string;
  icon: string;
  desc: string;
  rate: number;
  pause: number;
  color: string;
  bg: string;
  border: string;
}

export const MODES: ReadingMode[] = [
  {
    key: "teaching",
    label: "Teaching",
    icon: "🎓",
    desc: "Deliberate pace with pauses after each idea — like a teacher walking you through it.",
    rate: 0.82,
    pause: 900,
    color: "#2563eb",
    bg: "rgba(37,99,235,0.07)",
    border: "#2563eb",
  },
  {
    key: "conversational",
    label: "Conversational",
    icon: "💬",
    desc: "Warm, easy tone — like someone explaining this to you over chai, unhurried.",
    rate: 0.9,
    pause: 550,
    color: "#16a34a",
    bg: "rgba(22,163,74,0.07)",
    border: "#16a34a",
  },
  {
    key: "story",
    label: "Story",
    icon: "📚",
    desc: "Slow, immersive delivery — a storyteller savouring each line, no rush at all.",
    rate: 0.73,
    pause: 1300,
    color: "#7c3aed",
    bg: "rgba(124,58,237,0.07)",
    border: "#7c3aed",
  },
];
