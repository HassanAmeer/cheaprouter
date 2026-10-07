/**
 * Central Theme Configuration File
 * All application colors, gradients, highlights, and component themes are configured here.
 * Modify tokens in this file to easily update or match color themes across the entire app.
 */

export const THEME_CONFIG = {
  name: "Red Crimson Obsidian",
  colors: {
    // Primary Red Accents
    primary: "#dc2626", // red-600
    primaryLight: "#ef4444", // red-500
    primaryDark: "#b91c1c", // red-700
    primaryDeep: "#991b1b", // red-800
    primarySoft: "rgba(220, 38, 38, 0.15)",
    primaryGlow: "rgba(220, 38, 38, 0.4)",
    primaryRing: "rgba(239, 68, 68, 0.5)",

    // Secondary Accent Touches
    rose: "#f43f5e",
    amber: "#f59e0b",
    ruby: "#e11d48",

    // Background & Surfaces (Dark Crimson Obsidian Palette)
    bgApp: "#0d0b0c",
    bgRail: "#0a0708",
    bgSidebar: "#140d0f",
    bgWorkspace: "#170e10",
    bgCard: "#1f1315",
    bgCardHover: "#2a191c",
    bgInput: "#241518",

    // Borders & Dividers
    borderSubtle: "rgba(239, 68, 68, 0.1)",
    borderMedium: "rgba(239, 68, 68, 0.25)",
    borderStrong: "rgba(239, 68, 68, 0.45)",

    // Text Tones
    textMain: "#fef2f2",
    textMuted: "#fda4af",
    textSubtle: "#9f1239",
    textLight: "#ffffff",
  },

  // Gradients
  gradients: {
    primaryBtn: "bg-gradient-to-r from-red-600 via-rose-600 to-red-500",
    avatarBadge: "bg-gradient-to-tr from-red-700 via-rose-600 to-red-500",
    glowBackground: "from-red-900/20 via-rose-950/10 to-transparent",
    brandHeader: "from-red-500 to-rose-400",
    cardBorder: "from-red-500/30 via-rose-500/10 to-transparent",
  },

  // Shadows & Glows
  shadows: {
    primaryGlow: "0 0 20px rgba(220, 38, 38, 0.35)",
    cardElevated: "0 10px 30px rgba(0, 0, 0, 0.7)",
  },

  // User Badge Presets
  userAvatar: {
    bg: "from-red-700 to-rose-600",
    border: "border-red-500/50",
    shadow: "shadow-red-600/30",
  },
} as const;

export type ThemeConfig = typeof THEME_CONFIG;
