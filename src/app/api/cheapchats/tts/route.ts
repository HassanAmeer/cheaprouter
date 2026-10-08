import { NextRequest, NextResponse } from "next/server";
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, voice, rate, pitch } = body;

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    // Map persona or voice IDs to Edge Neural voices
    let selectedVoice = voice || "ur-PK-AsadNeural";
    let speedOption = rate || "+0%";
    let pitchOption = pitch || "+0Hz";

    if (selectedVoice.startsWith("persona:")) {
      const pId = selectedVoice.replace("persona:", "");
      if (pId === "asad") {
        selectedVoice = "ur-PK-AsadNeural";
        speedOption = "+10%";
      } else if (pId === "gul") {
        selectedVoice = "ur-IN-SalmanNeural";
        speedOption = "+15%";
      } else if (pId === "sameer") {
        selectedVoice = "hi-IN-MadhurNeural";
        speedOption = "+12%";
      } else if (pId === "aryan") {
        selectedVoice = "hi-IN-MadhurNeural";
        speedOption = "+18%";
        pitchOption = "+8Hz";
      } else if (pId === "hamza") {
        selectedVoice = "hi-IN-SwaraNeural";
        speedOption = "+15%";
        pitchOption = "+14Hz";
      } else if (pId === "bilal") {
        selectedVoice = "ur-PK-AsadNeural";
        speedOption = "+5%";
        pitchOption = "-6Hz";
      } else if (pId === "zoya") {
        selectedVoice = "ur-PK-UzmaNeural";
        speedOption = "+10%";
      } else if (pId === "ayesha") {
        selectedVoice = "ur-PK-UzmaNeural";
        speedOption = "+8%";
      } else if (pId === "pari") {
        selectedVoice = "hi-IN-SwaraNeural";
        speedOption = "+14%";
        pitchOption = "+16Hz";
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

    const tts = new MsEdgeTTS();
    await tts.setMetadata(selectedVoice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);

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

    const { audioStream } = tts.toStream(cleanText);

    const chunks: Buffer[] = [];
    await new Promise<void>((resolve, reject) => {
      audioStream.on("data", (chunk: Buffer) => chunks.push(chunk));
      audioStream.on("end", () => resolve());
      audioStream.on("error", (err: any) => reject(err));
    });

    const audioBuffer = Buffer.concat(chunks);

    return new Response(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.length.toString(),
        "Cache-Control": "public, max-age=86400",
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
