/**
 * Global Branding and Version Configuration
 * Centralized configuration managed via environment variables (.env / .env.local).
 * Allows dynamic customization and white-labeling of CheapRouter and CheapChats.
 */

export const BRAND_CONFIG = {
  // CheapRouter Settings
  cheapRouterName:
    process.env.NEXT_PUBLIC_CHEAPROUTER_NAME ||
    process.env.CHEAPROUTER_NAME ||
    "CheapRouter",
  cheapRouterTitle:
    process.env.NEXT_PUBLIC_CHEAPROUTER_TITLE ||
    "CheapRouter | One API Key, All AI Models",
  cheapRouterTagline:
    process.env.NEXT_PUBLIC_CHEAPROUTER_TAGLINE ||
    "Powered by CheapRouter Engine",
  cheapRouterVersion:
    process.env.NEXT_PUBLIC_CHEAPROUTER_VERSION ||
    process.env.CHEAPROUTER_VERSION ||
    "1.0.0",
  cheapRouterApiBaseUrl:
    process.env.NEXT_PUBLIC_CHEAPROUTER_API_BASE_URL ||
    "https://api.cheaprouter.com/v1",
  cheapRouterWebsiteUrl:
    process.env.NEXT_PUBLIC_CHEAPROUTER_WEBSITE_URL ||
    "https://cheaprouter.com",

  // CheapChats Settings
  cheapChatsName:
    process.env.NEXT_PUBLIC_CHEAPCHATS_NAME ||
    process.env.CHEAPCHATS_NAME ||
    "CheapChats",
  cheapChatsTitle:
    process.env.NEXT_PUBLIC_CHEAPCHATS_TITLE ||
    "CheapChats Control Center",
  cheapChatsVersion:
    process.env.NEXT_PUBLIC_CHEAPCHATS_VERSION ||
    process.env.CHEAPCHATS_VERSION ||
    "2.0",
  cheapChatsTagline:
    process.env.NEXT_PUBLIC_CHEAPCHATS_TAGLINE ||
    "AI Chat & Workspace Interface",
  showDebugConsole:
    (process.env.NEXT_PUBLIC_CHEAPCHATS_SHOW_DEBUG_CONSOLE ??
      process.env.NEXT_PUBLIC_SHOW_DEBUG_CONSOLE ??
      "true").toLowerCase() !== "false" &&
    (process.env.NEXT_PUBLIC_CHEAPCHATS_SHOW_DEBUG_CONSOLE ??
      process.env.NEXT_PUBLIC_SHOW_DEBUG_CONSOLE ??
      "true") !== "0",
} as const;

export default BRAND_CONFIG;
