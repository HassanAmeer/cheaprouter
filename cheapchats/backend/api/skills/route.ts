import { NextResponse } from "next/server";
import { db } from "@cheapchats/backend/db";
import { skills } from "@cheapchats/backend/db/schema";
import { desc, eq } from "drizzle-orm";
import { getSession } from "@cheapchats/backend/lib/auth";
import fs from "fs";
import path from "path";

const SKILLS_DIR = path.join(process.cwd(), ".agents", "skills");

function syncSkillToDisk(name: string, description: string, content: string) {
  try {
    const folderName = name.replace(/[^a-zA-Z0-9_-]/g, "_");
    const skillFolder = path.join(SKILLS_DIR, folderName);
    if (!fs.existsSync(skillFolder)) {
      fs.mkdirSync(skillFolder, { recursive: true });
    }
    const fileContent = `---
name: ${name}
description: ${description || ""}
---

${content || ""}`;
    fs.writeFileSync(path.join(skillFolder, "SKILL.md"), fileContent, "utf8");
  } catch (e) {
    console.warn("Failed to sync skill to disk:", e);
  }
}

function removeSkillFromDisk(name: string) {
  try {
    const folderName = name.replace(/[^a-zA-Z0-9_-]/g, "_");
    const skillFolder = path.join(SKILLS_DIR, folderName);
    if (fs.existsSync(skillFolder)) {
      fs.rmSync(skillFolder, { recursive: true, force: true });
    }
  } catch (e) {
    console.warn("Failed to remove skill from disk:", e);
  }
}

const DEFAULT_SEEDS = [
  {
    name: "InfoOnlyTopic",
    description: "Provides concise factual information on a specific topic without chit-chat.",
    content: `# Info Only Topic
Limits responses to factual, concise information only. Avoids unnecessary conversational pleasantries and speculation. Focuses directly on the user's inquiry with high precision.`,
    isDefault: 1,
    isAlwaysActive: 0,
  },
  {
    name: "Web Application Development",
    description: "Design & build complete web apps, responsive UI components & dark mode styling.",
    content: `# Web Application Development
1. Prioritize visual elegance, modern palettes, high contrast dark theme, and micro-interactions.
2. Build responsive layouts adhering to clean component modularity.
3. Keep code clean, performant, and type-safe.`,
    isDefault: 1,
    isAlwaysActive: 0,
  },
  {
    name: "React & Next.js Architecture",
    description: "Modern React 19, server actions, hooks & component performance.",
    content: `# React & Next.js Architecture
1. Follow Next.js App Router conventions and optimal server/client component splitting.
2. Maintain clean hook lifecycles and avoid unnecessary re-renders.
3. Write idiomatic TypeScript with strict typing.`,
    isDefault: 1,
    isAlwaysActive: 0,
  },
  {
    name: "Database & SQL Optimization",
    description: "Schema design, queries, and migrations for SQLite/PostgreSQL.",
    content: `# Database & SQL Optimization
1. Structure clean, normalized schemas with proper relations.
2. Index query columns and optimize queries for latency.
3. Ensure ACID compliance and transaction safety.`,
    isDefault: 1,
    isAlwaysActive: 0,
  },
  {
    name: "Code Reviewer & Quality",
    description: "Audit code for performance, security, and best practices.",
    content: `# Code Reviewer & Quality
Review code for edge cases, performance bottlenecks, security vulnerabilities, and code clarity. Provide concise, actionable suggestions.`,
    isDefault: 0,
    isAlwaysActive: 0,
  },
  {
    name: "HTML Page / Game & Sound",
    description: "Interactive HTML5/canvas games & pages with built-in Web Audio API sound effects, neon themes & mobile touch controls.",
    content: `# Interactive HTML5 Game & Sound Engine Guidelines

CRITICAL MANDATORY INSTRUCTIONS FOR GENERATING PLAYABLE GAMES & INTERACTIVE HTML EXPERIENCES:

## 1. MANDATORY PROGRAMMATIC SOUND EFFECTS (WEB AUDIO API):
- Every game or interactive canvas/HTML application MUST include audible sound effects (SFX) and audio feedback.
- NEVER use external MP3, WAV, or OGG URLs (which fail, 404, or fail CORS).
- ALWAYS synthesize sound effects programmatically using the browser's native Web Audio API (window.AudioContext || window.webkitAudioContext).
- Synthesize crisp audio for all core interactions:
  * jump / hop: Rapid ascending frequency sweep (150Hz -> 450Hz sine/triangle, 0.15s).
  * shoot / laser: High-to-low pitch drop (900Hz -> 120Hz sawtooth, 0.12s).
  * coin / gem / point pickup: Melodic arpeggio (987Hz -> 1318Hz, 0.15s).
  * collision / hit / explosion: Distorted low frequency drop with rapid gain decay (120Hz -> 30Hz sawtooth/noise, 0.25s).
  * game over: Slow melancholy pitch descent (350Hz -> 100Hz square, 0.5s).
  * victory / stage clear: Major chord fanfare (C-E-G-C, 0.6s).
  * ui click / button press: Short crisp click blip (800Hz sine, 0.03s).
- Autoplay Compliance: Browsers require user interaction before activating AudioContext. Provide a start screen ("Click to Play / Press Any Key") that executes:
  \`if (audioCtx && audioCtx.state === 'suspended') { audioCtx.resume(); }\`
- Always provide an on-screen Mute/Unmute toggle button (🔊 / 🔇) in the game HUD.

## 2. VISUAL THEMES, AESTHETICS & POLISH:
- Deliver rich, modern visual aesthetics. Avoid bland, flat, primary-colored boxes.
- Themes: Use Cyberpunk Neon, Retro Pixel Arcade, Synthwave 80s, or Modern Dark Vector styling.
- Canvas & Particles: Implement particle explosions on destruction/scoring, subtle screen shake on heavy impacts, and smooth trailing particle effects.
- Glassmorphic HUD: Clean, high-contrast score, high-score, lives/health bar, and level counters.

## 3. GAME LOOP & STATE MANAGEMENT:
- Use standard 60 FPS requestAnimationFrame game loop with delta timing.
- Proper game states: MENU (Start screen with instructions), PLAYING, PAUSED (with Pause button & 'P'/Esc key toggle), GAMEOVER (with Final Score, High Score, and Play Again button).
- Persistence: Store and retrieve High Score in localStorage so player records persist across refreshes.

## 4. CROSS-PLATFORM CONTROLS (DESKTOP & MOBILE):
- Keyboard: Support both Arrow Keys and WASD for movement, Spacebar for jump/action.
- Mobile / Touch: Render on-screen virtual touch controls (touch D-pad / directional buttons & action button) or touch/drag interaction so the game is 100% playable on mobile devices and preview panes.

## 5. SINGLE-FILE CODE STRUCTURE & DELIVERY:
- Deliver 100% self-contained, immediately playable, single-file HTML (<!DOCTYPE html>) with all CSS in <style> and JavaScript in <script>.
- Use <cheapchatArtifact id="game-artifact" title="Playable HTML5 Game"> container.
- Ensure 100% valid JavaScript syntax with zero syntax errors, complete arrow functions for event listeners, and safe variable declarations.`,
    isDefault: 1,
    isAlwaysActive: 0,
  },
];

export async function GET() {
  try {
    let list = db.select().from(skills).orderBy(desc(skills.isDefault), desc(skills.createdAt)).all();

    // Auto-seed if empty
    if (!list || list.length === 0) {
      const now = Date.now();
      for (let i = 0; i < DEFAULT_SEEDS.length; i++) {
        const item = DEFAULT_SEEDS[i];
        const id = `skl_init_${now}_${i}`;
        db.insert(skills).values({
          id,
          userId: "usr_user1",
          name: item.name,
          description: item.description,
          content: item.content,
          isDefault: item.isDefault,
          isAlwaysActive: item.isAlwaysActive,
          sourceType: "text",
          createdAt: now + i,
        }).run();

        // Also sync default skills to .agents/skills/<name>/SKILL.md
        syncSkillToDisk(item.name, item.description, item.content);
      }

      list = db.select().from(skills).orderBy(desc(skills.isDefault), desc(skills.createdAt)).all();
    } else {
      // Self-heal: Seed any newly added default skills if missing from DB
      const existingNames = new Set(list.map((s: any) => s.name));
      let hasAdded = false;
      const now = Date.now();
      for (let i = 0; i < DEFAULT_SEEDS.length; i++) {
        const item = DEFAULT_SEEDS[i];
        if (!existingNames.has(item.name)) {
          const id = `skl_seed_${now}_${i}`;
          db.insert(skills).values({
            id,
            userId: "usr_user1",
            name: item.name,
            description: item.description,
            content: item.content,
            isDefault: item.isDefault,
            isAlwaysActive: item.isAlwaysActive,
            sourceType: "text",
            createdAt: now + i,
          }).run();
          syncSkillToDisk(item.name, item.description, item.content);
          hasAdded = true;
        }
      }
      if (hasAdded) {
        list = db.select().from(skills).orderBy(desc(skills.isDefault), desc(skills.createdAt)).all();
      }
    }

    return NextResponse.json({ skills: list });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch skills" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const userId = session.id;

    const body = await req.json();
    const id = `skl_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    const name = (body.name || "Custom Skill").trim();
    const description = (body.description || "").trim();
    const content = (body.content || "").trim();
    const isAlwaysActive = body.isAlwaysActive ? 1 : 0;

    db.insert(skills).values({
      id,
      userId,
      name,
      description,
      content,
      isDefault: 0,
      isAlwaysActive,
      sourceType: body.sourceType || "text",
      fileName: body.fileName || "",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }).run();

    // Sync to .agents/skills/<folder>/SKILL.md
    syncSkillToDisk(name, description, content);

    return NextResponse.json({ success: true, skillId: id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create skill" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await req.json();
    const { id, name, description, content, isAlwaysActive } = body;

    if (!id) return NextResponse.json({ error: "Skill ID required" }, { status: 400 });

    const existing = db.select().from(skills).where(eq(skills.id, id)).get();
    if (!existing || (existing.userId !== session.id && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Skill not found" }, { status: 404 });
    }

    const updatedName = name !== undefined ? name.trim() : existing.name;
    const updatedDesc = description !== undefined ? description.trim() : existing.description;
    const updatedContent = content !== undefined ? content.trim() : existing.content;
    const updatedAlwaysActive = isAlwaysActive !== undefined ? (isAlwaysActive ? 1 : 0) : existing.isAlwaysActive;

    db.update(skills)
      .set({
        name: updatedName,
        description: updatedDesc,
        content: updatedContent,
        isAlwaysActive: updatedAlwaysActive,
        updatedAt: Date.now(),
      })
      .where(eq(skills.id, id))
      .run();

    // Sync updated skill to .agents/skills
    if (existing.name !== updatedName) {
      removeSkillFromDisk(existing.name);
    }
    syncSkillToDisk(updatedName, updatedDesc || "", updatedContent || "");

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update skill" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Skill ID required" }, { status: 400 });

    const existing = db.select().from(skills).where(eq(skills.id, id)).get();
    if (!existing || (existing.userId !== session.id && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Skill not found" }, { status: 404 });
    }

    if (existing.isDefault === 1) {
      return NextResponse.json({ error: "Cannot delete default system skill" }, { status: 403 });
    }

    db.delete(skills).where(eq(skills.id, id)).run();
    removeSkillFromDisk(existing.name);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete skill" }, { status: 500 });
  }
}
