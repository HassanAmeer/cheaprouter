import { NextRequest, NextResponse } from "next/server";
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";
import fs from "fs";
import path from "path";
import crypto from "crypto";

// Persistent disk cache directory
const CACHE_DIR = path.join(process.cwd(), ".tts_cache");
if (!fs.existsSync(CACHE_DIR)) {
  try {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  } catch {}
}

// Ultra-fast in-memory cache for 0ms repeated / preview playback
const memoryCache = new Map<string, Buffer>();

function getCacheKey(voice: string, text: string): string {
  const hash = crypto.createHash("md5").update(`${voice}:::${text}`).digest("hex");
  return hash;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, voice, rate, pitch } = body;

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    // Clean text: strip markdown / code blocks / html
    const cleanText = text
      .replace(/<[^>]*>/g, "")
      .replace(/```[\s\S]*?```/g, "")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/[#*_~>[\]()📱📧🐙🎵🔗👉🟢✅💡🗣️🔍✓\\]/g, "")
      .replace(/\s+/g, " ")
      .trim();

    if (!cleanText) {
      return NextResponse.json({ error: "Cleaned text is empty" }, { status: 400 });
    }

    // Map persona or voice IDs to Edge Neural voices
    let selectedVoice = voice || "ur-PK-AsadNeural";

    if (selectedVoice.startsWith("azure:")) {
      selectedVoice = selectedVoice.replace("azure:", "");
    } else if (selectedVoice.startsWith("persona:")) {
      const pId = selectedVoice.replace("persona:", "");
      if (pId === "urdu-male") {
        selectedVoice = "ur-PK-AsadNeural";
      } else if (pId === "urdu-female") {
        selectedVoice = "ur-PK-UzmaNeural";
      } else if (pId === "vikram-roman") {
        selectedVoice = "hi-IN-MadhurNeural";
      } else if (pId === "neha-roman") {
        selectedVoice = "hi-IN-SwaraNeural";
      } else if (pId === "asad") {
        selectedVoice = "ur-PK-AsadNeural";
      } else if (pId === "bilal") {
        selectedVoice = "ur-PK-AsadNeural";
      } else if (pId === "ayesha") {
        selectedVoice = "ur-PK-UzmaNeural";
      } else if (pId === "kashif") {
        selectedVoice = "hi-IN-MadhurNeural";
      } else if (pId === "swara") {
        selectedVoice = "hi-IN-SwaraNeural";
      } else if (pId === "madhur") {
        selectedVoice = "hi-IN-MadhurNeural";
      } else if (pId === "jenny") {
        selectedVoice = "en-US-JennyNeural";
      } else if (pId === "guy") {
        selectedVoice = "en-US-GuyNeural";
      } else if (pId === "sonia") {
        selectedVoice = "en-GB-SoniaNeural";
      } else if (pId === "fatima") {
        selectedVoice = "ar-SA-ZariyahNeural";
      } else if (pId === "hamdan") {
        selectedVoice = "ar-AE-HamdanNeural";
      } else {
        selectedVoice = "ur-PK-AsadNeural";
      }
    }

    // ── 1. Check in-memory cache first (0ms latency) ───────────────────────
    const cacheKey = getCacheKey(selectedVoice, cleanText);
    if (memoryCache.has(cacheKey)) {
      const cachedBuffer = memoryCache.get(cacheKey)!;
      return new Response(cachedBuffer as any, {
        status: 200,
        headers: {
          "Content-Type": "audio/mpeg",
          "Content-Length": cachedBuffer.length.toString(),
          "Cache-Control": "public, max-age=31536000, immutable",
          "X-TTS-Cache": "HIT-MEMORY",
        },
      });
    }

    // ── 2. Check disk cache (< 1ms latency) ─────────────────────────────────
    const cacheFilePath = path.join(CACHE_DIR, `${cacheKey}.mp3`);
    if (fs.existsSync(cacheFilePath)) {
      try {
        const fileBuffer = fs.readFileSync(cacheFilePath);
        if (fileBuffer.length > 500) {
          memoryCache.set(cacheKey, fileBuffer);
          return new Response(fileBuffer as any, {
            status: 200,
            headers: {
              "Content-Type": "audio/mpeg",
              "Content-Length": fileBuffer.length.toString(),
              "Cache-Control": "public, max-age=31536000, immutable",
              "X-TTS-Cache": "HIT-DISK",
            },
          });
        }
      } catch {}
    }

    // ── 3. Synthesize via Edge Neural AI ────────────────────────────────────
    // Edge TTS occasionally times out on the first websocket handshake, so retry once.
    let audioBuffer: Buffer | null = null;
    let lastError: any = null;

    for (let attempt = 0; attempt < 2 && !audioBuffer; attempt++) {
      try {
        const tts = new MsEdgeTTS();
        await tts.setMetadata(selectedVoice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);

        const { audioStream } = tts.toStream(cleanText);

        const chunks: Buffer[] = [];
        await new Promise<void>((resolve, reject) => {
          const timer = setTimeout(() => reject(new Error("Edge TTS timeout")), 15000);
          audioStream.on("data", (chunk: Buffer) => chunks.push(chunk));
          audioStream.on("end", () => {
            clearTimeout(timer);
            resolve();
          });
          audioStream.on("error", (err: any) => {
            clearTimeout(timer);
            reject(err);
          });
        });

        audioBuffer = Buffer.concat(chunks);
      } catch (err: any) {
        lastError = err;
        audioBuffer = null;
        if (attempt === 0) await new Promise((r) => setTimeout(r, 600));
      }
    }

    if (!audioBuffer || audioBuffer.length === 0) {
      throw lastError || new Error("Edge TTS synthesis failed");
    }

    // Save to memory and disk cache for instantaneous future plays
    if (audioBuffer.length > 500) {
      memoryCache.set(cacheKey, audioBuffer);
      try {
        fs.writeFileSync(cacheFilePath, audioBuffer);
      } catch {}
    }

    return new Response(audioBuffer as any, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.length.toString(),
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-TTS-Cache": "MISS",
      },
    });
  } catch (err: any) {
    console.error("Edge Neural TTS Error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to generate speech" },
      { status: 500 }
    );
  }
}
