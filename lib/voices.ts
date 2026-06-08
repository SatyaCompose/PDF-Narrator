export type Gender = "FEMALE" | "MALE";
export type VoiceTier = "Standard" | "Wavenet" | "Neural2" | "Chirp3HD";

export interface Voice {
  name: string;
  label: string;
  g: Gender;
  tier?: VoiceTier; // undefined treated as Standard (backward-compat)
}

export interface Language {
  code: string;
  label: string;
  script: string;
}

export const LANGUAGES: Language[] = [
  { code: "en-IN", label: "English (India)", script: "EN" },
  { code: "hi-IN", label: "हिन्दी",           script: "HI" },
  { code: "te-IN", label: "తెలుగు",           script: "TE" },
  { code: "bn-IN", label: "বাংলা",            script: "BN" },
  { code: "gu-IN", label: "ગુજરાતી",          script: "GU" },
  { code: "kn-IN", label: "ಕನ್ನಡ",            script: "KN" },
  { code: "ml-IN", label: "മലയാളം",           script: "ML" },
  { code: "mr-IN", label: "मराठी",            script: "MR" },
  { code: "ta-IN", label: "தமிழ்",            script: "TA" },
  { code: "pa-IN", label: "ਪੰਜਾਬੀ",           script: "PA" },
];

export const VOICES: Record<string, Voice[]> = {
  "en-IN": [
    // ── Standard ──────────────────────────────────────────────────────────
    { name: "en-IN-Standard-A", label: "Ananya",  g: "FEMALE" },
    { name: "en-IN-Standard-D", label: "Priya",   g: "FEMALE" },
    { name: "en-IN-Standard-E", label: "Meera",   g: "FEMALE" },
    { name: "en-IN-Standard-B", label: "Arjun",   g: "MALE"   },
    { name: "en-IN-Standard-C", label: "Rohan",   g: "MALE"   },
    { name: "en-IN-Standard-F", label: "Dev",     g: "MALE"   },
    // ── WaveNet (HD) ──────────────────────────────────────────────────────
    { name: "en-IN-Wavenet-A",  label: "Ananya",  g: "FEMALE", tier: "Wavenet" },
    { name: "en-IN-Wavenet-D",  label: "Priya",   g: "FEMALE", tier: "Wavenet" },
    { name: "en-IN-Wavenet-B",  label: "Arjun",   g: "MALE",   tier: "Wavenet" },
    { name: "en-IN-Wavenet-C",  label: "Rohan",   g: "MALE",   tier: "Wavenet" },
    // ── Neural2 (AI) ──────────────────────────────────────────────────────
    { name: "en-IN-Neural2-A",  label: "Ananya",  g: "FEMALE", tier: "Neural2" },
    // ── Chirp3-HD ─────────────────────────────────────────────────────────
    { name: "en-IN-Chirp3-HD-Aoede",   label: "Aoede",   g: "FEMALE", tier: "Chirp3HD" },
    { name: "en-IN-Chirp3-HD-Kore",    label: "Kore",    g: "FEMALE", tier: "Chirp3HD" },
    { name: "en-IN-Chirp3-HD-Zephyr",  label: "Zephyr",  g: "FEMALE", tier: "Chirp3HD" },
    { name: "en-IN-Chirp3-HD-Sulafat", label: "Sulafat", g: "FEMALE", tier: "Chirp3HD" },
    { name: "en-IN-Chirp3-HD-Charon",  label: "Charon",  g: "MALE",   tier: "Chirp3HD" },
    { name: "en-IN-Chirp3-HD-Fenrir",  label: "Fenrir",  g: "MALE",   tier: "Chirp3HD" },
    { name: "en-IN-Chirp3-HD-Puck",    label: "Puck",    g: "MALE",   tier: "Chirp3HD" },
    { name: "en-IN-Chirp3-HD-Orus",    label: "Orus",    g: "MALE",   tier: "Chirp3HD" },
  ],

  "hi-IN": [
    { name: "hi-IN-Standard-A", label: "Prachi",  g: "FEMALE" },
    { name: "hi-IN-Standard-D", label: "Kavya",   g: "FEMALE" },
    { name: "hi-IN-Standard-E", label: "Shreya",  g: "FEMALE" },
    { name: "hi-IN-Standard-B", label: "Vikram",  g: "MALE"   },
    { name: "hi-IN-Standard-C", label: "Rajiv",   g: "MALE"   },
    { name: "hi-IN-Standard-F", label: "Aakash",  g: "MALE"   },
    { name: "hi-IN-Wavenet-A",  label: "Prachi",  g: "FEMALE", tier: "Wavenet" },
    { name: "hi-IN-Wavenet-D",  label: "Kavya",   g: "FEMALE", tier: "Wavenet" },
    { name: "hi-IN-Wavenet-B",  label: "Vikram",  g: "MALE",   tier: "Wavenet" },
    { name: "hi-IN-Wavenet-C",  label: "Rajiv",   g: "MALE",   tier: "Wavenet" },
    { name: "hi-IN-Neural2-A",  label: "Prachi",  g: "FEMALE", tier: "Neural2" },
    { name: "hi-IN-Neural2-B",  label: "Vikram",  g: "MALE",   tier: "Neural2" },
    { name: "hi-IN-Neural2-C",  label: "Rajiv",   g: "MALE",   tier: "Neural2" },
    { name: "hi-IN-Neural2-D",  label: "Kavya",   g: "FEMALE", tier: "Neural2" },
    // ── Chirp3-HD ─────────────────────────────────────────────────────────
    { name: "hi-IN-Chirp3-HD-Aoede",   label: "Aoede",   g: "FEMALE", tier: "Chirp3HD" },
    { name: "hi-IN-Chirp3-HD-Kore",    label: "Kore",    g: "FEMALE", tier: "Chirp3HD" },
    { name: "hi-IN-Chirp3-HD-Zephyr",  label: "Zephyr",  g: "FEMALE", tier: "Chirp3HD" },
    { name: "hi-IN-Chirp3-HD-Sulafat", label: "Sulafat", g: "FEMALE", tier: "Chirp3HD" },
    { name: "hi-IN-Chirp3-HD-Charon",  label: "Charon",  g: "MALE",   tier: "Chirp3HD" },
    { name: "hi-IN-Chirp3-HD-Fenrir",  label: "Fenrir",  g: "MALE",   tier: "Chirp3HD" },
    { name: "hi-IN-Chirp3-HD-Puck",    label: "Puck",    g: "MALE",   tier: "Chirp3HD" },
    { name: "hi-IN-Chirp3-HD-Orus",    label: "Orus",    g: "MALE",   tier: "Chirp3HD" },
  ],

  "te-IN": [
    { name: "te-IN-Standard-A", label: "Lalitha", g: "FEMALE" },
    { name: "te-IN-Standard-C", label: "Kavitha", g: "FEMALE" },
    { name: "te-IN-Standard-B", label: "Suresh",  g: "MALE"   },
    { name: "te-IN-Standard-D", label: "Ravi",    g: "MALE"   },
    // ── Chirp3-HD ─────────────────────────────────────────────────────────
    { name: "te-IN-Chirp3-HD-Aoede",   label: "Aoede",   g: "FEMALE", tier: "Chirp3HD" },
    { name: "te-IN-Chirp3-HD-Kore",    label: "Kore",    g: "FEMALE", tier: "Chirp3HD" },
    { name: "te-IN-Chirp3-HD-Zephyr",  label: "Zephyr",  g: "FEMALE", tier: "Chirp3HD" },
    { name: "te-IN-Chirp3-HD-Sulafat", label: "Sulafat", g: "FEMALE", tier: "Chirp3HD" },
    { name: "te-IN-Chirp3-HD-Charon",  label: "Charon",  g: "MALE",   tier: "Chirp3HD" },
    { name: "te-IN-Chirp3-HD-Fenrir",  label: "Fenrir",  g: "MALE",   tier: "Chirp3HD" },
    { name: "te-IN-Chirp3-HD-Puck",    label: "Puck",    g: "MALE",   tier: "Chirp3HD" },
    { name: "te-IN-Chirp3-HD-Orus",    label: "Orus",    g: "MALE",   tier: "Chirp3HD" },
  ],

  "bn-IN": [
    { name: "bn-IN-Standard-A", label: "Priya",   g: "FEMALE" },
    { name: "bn-IN-Standard-C", label: "Rina",    g: "FEMALE" },
    { name: "bn-IN-Standard-B", label: "Arnab",   g: "MALE"   },
    { name: "bn-IN-Standard-D", label: "Sumon",   g: "MALE"   },
    { name: "bn-IN-Wavenet-A",  label: "Priya",   g: "FEMALE", tier: "Wavenet" },
    { name: "bn-IN-Wavenet-B",  label: "Arnab",   g: "MALE",   tier: "Wavenet" },
    { name: "bn-IN-Chirp3-HD-Aoede",   label: "Aoede",   g: "FEMALE", tier: "Chirp3HD" },
    { name: "bn-IN-Chirp3-HD-Kore",    label: "Kore",    g: "FEMALE", tier: "Chirp3HD" },
    { name: "bn-IN-Chirp3-HD-Zephyr",  label: "Zephyr",  g: "FEMALE", tier: "Chirp3HD" },
    { name: "bn-IN-Chirp3-HD-Sulafat", label: "Sulafat", g: "FEMALE", tier: "Chirp3HD" },
    { name: "bn-IN-Chirp3-HD-Charon",  label: "Charon",  g: "MALE",   tier: "Chirp3HD" },
    { name: "bn-IN-Chirp3-HD-Fenrir",  label: "Fenrir",  g: "MALE",   tier: "Chirp3HD" },
    { name: "bn-IN-Chirp3-HD-Puck",    label: "Puck",    g: "MALE",   tier: "Chirp3HD" },
    { name: "bn-IN-Chirp3-HD-Orus",    label: "Orus",    g: "MALE",   tier: "Chirp3HD" },
  ],

  "gu-IN": [
    { name: "gu-IN-Standard-A", label: "Mira",    g: "FEMALE" },
    { name: "gu-IN-Standard-C", label: "Nidhi",   g: "FEMALE" },
    { name: "gu-IN-Standard-B", label: "Jay",     g: "MALE"   },
    { name: "gu-IN-Standard-D", label: "Kiran",   g: "MALE"   },
    { name: "gu-IN-Chirp3-HD-Aoede",   label: "Aoede",   g: "FEMALE", tier: "Chirp3HD" },
    { name: "gu-IN-Chirp3-HD-Kore",    label: "Kore",    g: "FEMALE", tier: "Chirp3HD" },
    { name: "gu-IN-Chirp3-HD-Zephyr",  label: "Zephyr",  g: "FEMALE", tier: "Chirp3HD" },
    { name: "gu-IN-Chirp3-HD-Sulafat", label: "Sulafat", g: "FEMALE", tier: "Chirp3HD" },
    { name: "gu-IN-Chirp3-HD-Charon",  label: "Charon",  g: "MALE",   tier: "Chirp3HD" },
    { name: "gu-IN-Chirp3-HD-Fenrir",  label: "Fenrir",  g: "MALE",   tier: "Chirp3HD" },
    { name: "gu-IN-Chirp3-HD-Puck",    label: "Puck",    g: "MALE",   tier: "Chirp3HD" },
    { name: "gu-IN-Chirp3-HD-Orus",    label: "Orus",    g: "MALE",   tier: "Chirp3HD" },
  ],

  "kn-IN": [
    { name: "kn-IN-Standard-A", label: "Aaradhya",g: "FEMALE" },
    { name: "kn-IN-Standard-C", label: "Suma",    g: "FEMALE" },
    { name: "kn-IN-Standard-B", label: "Kiran",   g: "MALE"   },
    { name: "kn-IN-Standard-D", label: "Ravi",    g: "MALE"   },
    { name: "kn-IN-Wavenet-A",  label: "Aaradhya",g: "FEMALE", tier: "Wavenet" },
    { name: "kn-IN-Wavenet-C",  label: "Suma",    g: "FEMALE", tier: "Wavenet" },
    { name: "kn-IN-Wavenet-B",  label: "Kiran",   g: "MALE",   tier: "Wavenet" },
    { name: "kn-IN-Wavenet-D",  label: "Ravi",    g: "MALE",   tier: "Wavenet" },
    // ── Chirp3-HD ─────────────────────────────────────────────────────────
    { name: "kn-IN-Chirp3-HD-Aoede",   label: "Aoede",   g: "FEMALE", tier: "Chirp3HD" },
    { name: "kn-IN-Chirp3-HD-Kore",    label: "Kore",    g: "FEMALE", tier: "Chirp3HD" },
    { name: "kn-IN-Chirp3-HD-Zephyr",  label: "Zephyr",  g: "FEMALE", tier: "Chirp3HD" },
    { name: "kn-IN-Chirp3-HD-Sulafat", label: "Sulafat", g: "FEMALE", tier: "Chirp3HD" },
    { name: "kn-IN-Chirp3-HD-Charon",  label: "Charon",  g: "MALE",   tier: "Chirp3HD" },
    { name: "kn-IN-Chirp3-HD-Fenrir",  label: "Fenrir",  g: "MALE",   tier: "Chirp3HD" },
    { name: "kn-IN-Chirp3-HD-Puck",    label: "Puck",    g: "MALE",   tier: "Chirp3HD" },
    { name: "kn-IN-Chirp3-HD-Orus",    label: "Orus",    g: "MALE",   tier: "Chirp3HD" },
  ],

  "ml-IN": [
    { name: "ml-IN-Standard-A", label: "Lekha",   g: "FEMALE" },
    { name: "ml-IN-Standard-C", label: "Rekha",   g: "FEMALE" },
    { name: "ml-IN-Standard-B", label: "Sujit",   g: "MALE"   },
    { name: "ml-IN-Standard-D", label: "Suresh",  g: "MALE"   },
    { name: "ml-IN-Wavenet-A",  label: "Lekha",   g: "FEMALE", tier: "Wavenet" },
    { name: "ml-IN-Wavenet-C",  label: "Rekha",   g: "FEMALE", tier: "Wavenet" },
    { name: "ml-IN-Wavenet-B",  label: "Sujit",   g: "MALE",   tier: "Wavenet" },
    { name: "ml-IN-Wavenet-D",  label: "Suresh",  g: "MALE",   tier: "Wavenet" },
    // ── Chirp3-HD ─────────────────────────────────────────────────────────
    { name: "ml-IN-Chirp3-HD-Aoede",   label: "Aoede",   g: "FEMALE", tier: "Chirp3HD" },
    { name: "ml-IN-Chirp3-HD-Kore",    label: "Kore",    g: "FEMALE", tier: "Chirp3HD" },
    { name: "ml-IN-Chirp3-HD-Zephyr",  label: "Zephyr",  g: "FEMALE", tier: "Chirp3HD" },
    { name: "ml-IN-Chirp3-HD-Sulafat", label: "Sulafat", g: "FEMALE", tier: "Chirp3HD" },
    { name: "ml-IN-Chirp3-HD-Charon",  label: "Charon",  g: "MALE",   tier: "Chirp3HD" },
    { name: "ml-IN-Chirp3-HD-Fenrir",  label: "Fenrir",  g: "MALE",   tier: "Chirp3HD" },
    { name: "ml-IN-Chirp3-HD-Puck",    label: "Puck",    g: "MALE",   tier: "Chirp3HD" },
    { name: "ml-IN-Chirp3-HD-Orus",    label: "Orus",    g: "MALE",   tier: "Chirp3HD" },
  ],

  "mr-IN": [
    { name: "mr-IN-Standard-A", label: "Ashwini", g: "FEMALE" },
    { name: "mr-IN-Standard-C", label: "Sai",     g: "FEMALE" },
    { name: "mr-IN-Standard-B", label: "Pranav",  g: "MALE"   },
    { name: "mr-IN-Standard-D", label: "Arun",    g: "MALE"   },
    { name: "mr-IN-Wavenet-A",  label: "Ashwini", g: "FEMALE", tier: "Wavenet" },
    { name: "mr-IN-Wavenet-C",  label: "Sai",     g: "FEMALE", tier: "Wavenet" },
    { name: "mr-IN-Wavenet-B",  label: "Pranav",  g: "MALE",   tier: "Wavenet" },
    { name: "mr-IN-Wavenet-D",  label: "Arun",    g: "MALE",   tier: "Wavenet" },
    // ── Chirp3-HD ─────────────────────────────────────────────────────────
    { name: "mr-IN-Chirp3-HD-Aoede",   label: "Aoede",   g: "FEMALE", tier: "Chirp3HD" },
    { name: "mr-IN-Chirp3-HD-Kore",    label: "Kore",    g: "FEMALE", tier: "Chirp3HD" },
    { name: "mr-IN-Chirp3-HD-Zephyr",  label: "Zephyr",  g: "FEMALE", tier: "Chirp3HD" },
    { name: "mr-IN-Chirp3-HD-Sulafat", label: "Sulafat", g: "FEMALE", tier: "Chirp3HD" },
    { name: "mr-IN-Chirp3-HD-Charon",  label: "Charon",  g: "MALE",   tier: "Chirp3HD" },
    { name: "mr-IN-Chirp3-HD-Fenrir",  label: "Fenrir",  g: "MALE",   tier: "Chirp3HD" },
    { name: "mr-IN-Chirp3-HD-Puck",    label: "Puck",    g: "MALE",   tier: "Chirp3HD" },
    { name: "mr-IN-Chirp3-HD-Orus",    label: "Orus",    g: "MALE",   tier: "Chirp3HD" },
  ],

  "ta-IN": [
    { name: "ta-IN-Standard-A", label: "Kavya",   g: "FEMALE" },
    { name: "ta-IN-Standard-C", label: "Priya",   g: "FEMALE" },
    { name: "ta-IN-Standard-B", label: "Kumar",   g: "MALE"   },
    { name: "ta-IN-Standard-D", label: "Rajan",   g: "MALE"   },
    { name: "ta-IN-Wavenet-A",  label: "Kavya",   g: "FEMALE", tier: "Wavenet" },
    { name: "ta-IN-Wavenet-C",  label: "Priya",   g: "FEMALE", tier: "Wavenet" },
    { name: "ta-IN-Wavenet-B",  label: "Kumar",   g: "MALE",   tier: "Wavenet" },
    { name: "ta-IN-Wavenet-D",  label: "Rajan",   g: "MALE",   tier: "Wavenet" },
    // ── Chirp3-HD ─────────────────────────────────────────────────────────
    { name: "ta-IN-Chirp3-HD-Aoede",   label: "Aoede",   g: "FEMALE", tier: "Chirp3HD" },
    { name: "ta-IN-Chirp3-HD-Kore",    label: "Kore",    g: "FEMALE", tier: "Chirp3HD" },
    { name: "ta-IN-Chirp3-HD-Zephyr",  label: "Zephyr",  g: "FEMALE", tier: "Chirp3HD" },
    { name: "ta-IN-Chirp3-HD-Sulafat", label: "Sulafat", g: "FEMALE", tier: "Chirp3HD" },
    { name: "ta-IN-Chirp3-HD-Charon",  label: "Charon",  g: "MALE",   tier: "Chirp3HD" },
    { name: "ta-IN-Chirp3-HD-Fenrir",  label: "Fenrir",  g: "MALE",   tier: "Chirp3HD" },
    { name: "ta-IN-Chirp3-HD-Puck",    label: "Puck",    g: "MALE",   tier: "Chirp3HD" },
    { name: "ta-IN-Chirp3-HD-Orus",    label: "Orus",    g: "MALE",   tier: "Chirp3HD" },
  ],

  "pa-IN": [
    { name: "pa-IN-Standard-A", label: "Simran",  g: "FEMALE" },
    { name: "pa-IN-Standard-C", label: "Harleen", g: "FEMALE" },
    { name: "pa-IN-Standard-B", label: "Gurpreet",g: "MALE"   },
    { name: "pa-IN-Standard-D", label: "Harjit",  g: "MALE"   },
    { name: "pa-IN-Wavenet-A",  label: "Simran",  g: "FEMALE", tier: "Wavenet" },
    { name: "pa-IN-Wavenet-C",  label: "Harleen", g: "FEMALE", tier: "Wavenet" },
    { name: "pa-IN-Wavenet-B",  label: "Gurpreet",g: "MALE",   tier: "Wavenet" },
    { name: "pa-IN-Wavenet-D",  label: "Harjit",  g: "MALE",   tier: "Wavenet" },
    // ── Chirp3-HD ─────────────────────────────────────────────────────────
    { name: "pa-IN-Chirp3-HD-Aoede",   label: "Aoede",   g: "FEMALE", tier: "Chirp3HD" },
    { name: "pa-IN-Chirp3-HD-Kore",    label: "Kore",    g: "FEMALE", tier: "Chirp3HD" },
    { name: "pa-IN-Chirp3-HD-Zephyr",  label: "Zephyr",  g: "FEMALE", tier: "Chirp3HD" },
    { name: "pa-IN-Chirp3-HD-Sulafat", label: "Sulafat", g: "FEMALE", tier: "Chirp3HD" },
    { name: "pa-IN-Chirp3-HD-Charon",  label: "Charon",  g: "MALE",   tier: "Chirp3HD" },
    { name: "pa-IN-Chirp3-HD-Fenrir",  label: "Fenrir",  g: "MALE",   tier: "Chirp3HD" },
    { name: "pa-IN-Chirp3-HD-Puck",    label: "Puck",    g: "MALE",   tier: "Chirp3HD" },
    { name: "pa-IN-Chirp3-HD-Orus",    label: "Orus",    g: "MALE",   tier: "Chirp3HD" },
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
