import type { ReactNode } from "react";

export type AvatarPreset = {
  id: string;
  name: string;
  vibe: string;
  accentClass: string;
  preview: ReactNode;
};

type FigurineProps = {
  accent: string;
  secondary: string;
  face?: string;
  visor?: string;
};

function Figurine({
  accent,
  secondary,
  face = "#c7d3ea",
  visor = "#7ce7ff",
}: FigurineProps) {
  return (
    <svg viewBox="0 0 140 160" className="h-32 w-28 drop-shadow-[0_16px_30px_rgba(0,0,0,0.32)]">
      <ellipse cx="70" cy="145" rx="34" ry="9" fill="rgba(255,255,255,0.08)" />
      <rect x="46" y="24" width="48" height="46" rx="14" fill={face} />
      <rect x="52" y="36" width="36" height="12" rx="6" fill={visor} />
      <rect x="57" y="54" width="26" height="4" rx="2" fill="#19253a" opacity="0.8" />
      <rect x="60" y="70" width="20" height="12" rx="5" fill={secondary} />
      <path d="M42 118c0-22 13-38 28-38s28 16 28 38v10H42z" fill={accent} />
      <rect x="49" y="82" width="42" height="39" rx="14" fill={secondary} />
      <rect x="38" y="87" width="16" height="39" rx="7" fill={accent} />
      <rect x="86" y="87" width="16" height="39" rx="7" fill={accent} />
      <rect x="52" y="118" width="13" height="28" rx="5" fill={secondary} />
      <rect x="75" y="118" width="13" height="28" rx="5" fill={secondary} />
      <circle cx="70" cy="100" r="5" fill={visor} opacity="0.9" />
      <path d="M49 30l9-8h24l9 8" stroke="#eaf3ff" strokeOpacity="0.35" strokeWidth="2" fill="none" />
      <path d="M45 95h-8M103 95h-8M70 122v-8" stroke="#d7e7ff" strokeOpacity="0.18" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export const avatarPresets: AvatarPreset[] = [
  {
    id: "nova",
    name: "Nova",
    vibe: "clean, sharp, futuristic",
    accentClass: "from-[#6b8fff] to-[#4ce0c2]",
    preview: <Figurine accent="#6a8dff" secondary="#25375f" visor="#7ce7ff" />,
  },
  {
    id: "ember",
    name: "Ember",
    vibe: "bold, warm, competitive",
    accentClass: "from-[#ff8b5e] to-[#ffcc70]",
    preview: <Figurine accent="#f97353" secondary="#4a2331" face="#c8b7b0" visor="#ffd369" />,
  },
  {
    id: "ghost",
    name: "Ghost",
    vibe: "minimal, cool, stealthy",
    accentClass: "from-[#d6e2ff] to-[#8ba7ff]",
    preview: <Figurine accent="#d8e1ff" secondary="#394966" face="#d4deef" visor="#c8f2ff" />,
  },
  {
    id: "pulse",
    name: "Pulse",
    vibe: "electric, social, expressive",
    accentClass: "from-[#b76cff] to-[#5d8fff]",
    preview: <Figurine accent="#b36bf2" secondary="#2c2854" face="#cfc6dc" visor="#b893ff" />,
  },
  {
    id: "sage",
    name: "Sage",
    vibe: "steady, calm, mentor-like",
    accentClass: "from-[#52d6b3] to-[#86f2d9]",
    preview: <Figurine accent="#56cdaa" secondary="#1e4c4e" face="#c9d7d4" visor="#8ef2df" />,
  },
  {
    id: "onyx",
    name: "Onyx",
    vibe: "dark, premium, serious",
    accentClass: "from-[#5f6f8d] to-[#b3bfd4]",
    preview: <Figurine accent="#64748b" secondary="#1d2430" face="#bec9d9" visor="#dbe8ff" />,
  },
];

export function getAvatarPresetById(id: string) {
  return avatarPresets.find((preset) => preset.id === id) ?? avatarPresets[0];
}
