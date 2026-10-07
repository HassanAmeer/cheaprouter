---
name: HTML Page / Game & Sound
description: Interactive HTML5/canvas games & pages with built-in Web Audio API sound effects, neon themes & mobile touch controls.
---

# Interactive HTML5 Game & Sound Engine Guidelines

CRITICAL MANDATORY INSTRUCTIONS FOR GENERATING PLAYABLE GAMES & INTERACTIVE HTML EXPERIENCES:

## 1. MANDATORY PROGRAMMATIC SOUND EFFECTS (WEB AUDIO API):
- Every game or interactive canvas/HTML application MUST include audible sound effects (SFX) and audio feedback.
- NEVER use external MP3, WAV, or OGG URLs (which fail, 404, or fail CORS).
- ALWAYS synthesize sound effects programmatically using the browser native Web Audio API (window.AudioContext || window.webkitAudioContext).
- Synthesize crisp audio for all core interactions:
  * jump / hop: Rapid ascending frequency sweep (150Hz -> 450Hz sine/triangle, 0.15s).
  * shoot / laser: High-to-low pitch drop (900Hz -> 120Hz sawtooth, 0.12s).
  * coin / gem / point pickup: Melodic arpeggio (987Hz -> 1318Hz, 0.15s).
  * collision / hit / explosion: Distorted low frequency drop with rapid gain decay (120Hz -> 30Hz sawtooth/noise, 0.25s).
  * game over: Slow melancholy pitch descent (350Hz -> 100Hz square, 0.5s).
  * victory / stage clear: Major chord fanfare (C-E-G-C, 0.6s).
  * ui click / button press: Short crisp click blip (800Hz sine, 0.03s).
- Autoplay Compliance: Browsers require user interaction before activating AudioContext. Provide a start screen ("Click to Play / Press Any Key") that executes:
  `if (audioCtx && audioCtx.state === "suspended") { audioCtx.resume(); }`
- Always provide an on-screen Mute/Unmute toggle button (🔊 / 🔇) in the game HUD.

## 2. VISUAL THEMES, AESTHETICS & POLISH:
- Deliver rich, modern visual aesthetics. Avoid bland, flat, primary-colored boxes.
- Themes: Use Cyberpunk Neon, Retro Pixel Arcade, Synthwave 80s, or Modern Dark Vector styling.
- Canvas & Particles: Implement particle explosions on destruction/scoring, subtle screen shake on heavy impacts, and smooth trailing particle effects.
- Glassmorphic HUD: Clean, high-contrast score, high-score, lives/health bar, and level counters.

## 3. GAME LOOP & STATE MANAGEMENT:
- Use standard 60 FPS requestAnimationFrame game loop with delta timing.
- Proper game states: MENU (Start screen with instructions), PLAYING, PAUSED (with Pause button & P/Esc key toggle), GAMEOVER (with Final Score, High Score, and Play Again button).
- Persistence: Store and retrieve High Score in localStorage so player records persist across refreshes.

## 4. CROSS-PLATFORM CONTROLS (DESKTOP & MOBILE):
- Keyboard: Support both Arrow Keys and WASD for movement, Spacebar for jump/action.
- Mobile / Touch: Render on-screen virtual touch controls (touch D-pad / directional buttons & action button) or touch/drag interaction so the game is 100% playable on mobile devices and preview panes.

## 5. SINGLE-FILE CODE STRUCTURE & DELIVERY:
- Deliver 100% self-contained, immediately playable, single-file HTML (<!DOCTYPE html>) with all CSS in <style> and JavaScript in <script>.
- Use <cheapchatArtifact id="game-artifact" title="Playable HTML5 Game"> container.
- Ensure 100% valid JavaScript syntax with zero syntax errors, complete arrow functions for event listeners, and safe variable declarations.
