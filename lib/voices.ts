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
  { code: "bn-IN", label: "বাংলা", script: "BN" },
  { code: "gu-IN", label: "ગુજરાતી", script: "GU" },
  { code: "kn-IN", label: "ಕನ್ನಡ", script: "KN" },
  { code: "ml-IN", label: "മലയാളം", script: "ML" },
  { code: "mr-IN", label: "मराठी", script: "MR" },
  { code: "ta-IN", label: "தமிழ்", script: "TA" },
  { code: "pa-IN", label: "ਪੰਜਾਬੀ", script: "PA" },
];

export const VOICES: Record<string, Voice[]> = {
  "en-IN": [
    { name: "en-IN-Standard-A", label: "Ananya", g: "FEMALE" },
    { name: "en-IN-Standard-D", label: "Priya", g: "FEMALE" },
    { name: "en-IN-Standard-E", label: "Meera", g: "FEMALE" },
    { name: "en-IN-Standard-B", label: "Arjun", g: "MALE" },
    { name: "en-IN-Standard-C", label: "Rohan", g: "MALE" },
    { name: "en-IN-Standard-F", label: "Dev", g: "MALE" },
  ],
  "hi-IN": [
    { name: "hi-IN-Standard-A", label: "Prachi", g: "FEMALE" },
    { name: "hi-IN-Standard-D", label: "Kavya", g: "FEMALE" },
    { name: "hi-IN-Standard-E", label: "Shreya", g: "FEMALE" },
    { name: "hi-IN-Standard-B", label: "Vikram", g: "MALE" },
    { name: "hi-IN-Standard-C", label: "Rajiv", g: "MALE" },
    { name: "hi-IN-Standard-F", label: "Aakash", g: "MALE" },
  ],
  "te-IN": [
    { name: "te-IN-Standard-A", label: "Lalitha", g: "FEMALE" },
    { name: "te-IN-Standard-C", label: "Kavitha", g: "FEMALE" },
    { name: "te-IN-Standard-B", label: "Suresh", g: "MALE" },
    { name: "te-IN-Standard-D", label: "Ravi", g: "MALE" },
  ],
  "bn-IN": [
    { name: "bn-IN-Standard-A", label: "Priya", g: "FEMALE" },
    { name: "bn-IN-Standard-C", label: "Rina", g: "FEMALE" },
    { name: "bn-IN-Standard-B", label: "Arnab", g: "MALE" },
    { name: "bn-IN-Standard-D", label: "Sumon", g: "MALE" },
  ],
  "gu-IN": [
    { name: "gu-IN-Standard-A", label: "Mira", g: "FEMALE" },
    { name: "gu-IN-Standard-C", label: "Nidhi", g: "FEMALE" },
    { name: "gu-IN-Standard-B", label: "Jay", g: "MALE" },
    { name: "gu-IN-Standard-D", label: "Kiran", g: "MALE" },
  ],
  "kn-IN": [
    { name: "kn-IN-Standard-A", label: "Aaradhya", g: "FEMALE" },
    { name: "kn-IN-Standard-C", label: "Suma", g: "FEMALE" },
    { name: "kn-IN-Standard-B", label: "Kiran", g: "MALE" },
    { name: "kn-IN-Standard-D", label: "Ravi", g: "MALE" },
  ],
  "ml-IN": [
    { name: "ml-IN-Standard-A", label: "Lekha", g: "FEMALE" },
    { name: "ml-IN-Standard-C", label: "Rekha", g: "FEMALE" },
    { name: "ml-IN-Standard-B", label: "Sujit", g: "MALE" },
    { name: "ml-IN-Standard-D", label: "Suresh", g: "MALE" },
  ],
  "mr-IN": [
    { name: "mr-IN-Standard-A", label: "Ashwini", g: "FEMALE" },
    { name: "mr-IN-Standard-C", label: "Sai", g: "FEMALE" },
    { name: "mr-IN-Standard-B", label: "Pranav", g: "MALE" },
    { name: "mr-IN-Standard-D", label: "Arun", g: "MALE" },
  ],
  "ta-IN": [
    { name: "ta-IN-Standard-A", label: "Kavya", g: "FEMALE" },
    { name: "ta-IN-Standard-C", label: "Priya", g: "FEMALE" },
    { name: "ta-IN-Standard-B", label: "Kumar", g: "MALE" },
    { name: "ta-IN-Standard-D", label: "Rajan", g: "MALE" },
  ],
  "pa-IN": [
    { name: "pa-IN-Standard-A", label: "Simran", g: "FEMALE" },
    { name: "pa-IN-Standard-C", label: "Harleen", g: "FEMALE" },
    { name: "pa-IN-Standard-B", label: "Gurpreet", g: "MALE" },
    { name: "pa-IN-Standard-D", label: "Harjit", g: "MALE" },
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
