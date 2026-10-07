/**
 * Central Theme Configuration File
 * All application colors, gradients, highlights, and component themes are configured here.
 * Matching CheapRouter Obsidian Slate Palette.
 */

export const THEME_CONFIG = {
  name: "Obsidian Slate",
  colors: {
    // Primary Red Accents
    primary: "#FF3B3B",
    primaryLight: "#FF5A5A",
    primaryDark: "#DC2626",
    primaryDeep: "#B91C1C",
    primarySoft: "rgba(255, 59, 59, 0.12)",
    primaryGlow: "rgba(255, 59, 59, 0.25)",
    primaryRing: "rgba(255, 59, 59, 0.4)",

    // Secondary Accent Touches
    rose: "#f43f5e",
    amber: "#f59e0b",
    ruby: "#e11d48",

    // Background & Surfaces (Obsidian Slate Palette)
    bgApp: "#0B0D10",
    bgRail: "#0B0D10",
    bgSidebar: "#0F1217",
    bgWorkspace: "#0E1116",
    bgCard: "#15191E",
    bgCardHover: "#1A1F26",
    bgInput: "#15191E",

    // Borders & Dividers
    borderSubtle: "#1E232B",
    borderMedium: "#262C34",
    borderStrong: "#333B46",

    // Text Tones
    textMain: "#F2F4F7",
    textMuted: "#9AA4B2",
    textSubtle: "#64748B",
    textLight: "#ffffff",
  },

  // Gradients
  gradients: {
    primaryBtn: "bg-gradient-to-r from-red-600 via-rose-600 to-red-500",
    avatarBadge: "bg-gradient-to-tr from-[#1A1F26] to-[#262C34]",
    glowBackground: "from-red-900/10 via-transparent to-transparent",
    brandHeader: "from-red-500 to-rose-400",
    cardBorder: "from-red-500/20 via-transparent to-transparent",
  },

  // Shadows & Glows
  shadows: {
    primaryGlow: "0 0 20px rgba(255, 59, 59, 0.25)",
    cardElevated: "0 10px 30px rgba(0, 0, 0, 0.7)",
  },

  // User Badge Presets
  badges: {
    user: {
      label: "USER",
      bg: "bg-slate-800/80",
      text: "text-slate-300",
      border: "border-slate-700/60",
    },
    admin: {
      label: "ADMIN",
      bg: "bg-red-500/15",
      text: "text-red-300",
      border: "border-red-500/30",
    },
  },
};
