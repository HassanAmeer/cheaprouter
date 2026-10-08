const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { MsEdgeTTS, OUTPUT_FORMAT } = require("msedge-tts");

const cacheDir = path.join(process.cwd(), ".tts_cache");
if (!fs.existsSync(cacheDir)) {
  fs.mkdirSync(cacheDir, { recursive: true });
}

function getCacheKey(voice, text) {
  const clean = text
    .replace(/<[^>]*>/g, "")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/[#*_~>[\]()📱📧🐙🎵🔗👉🟢✅💡🗣️🔍✓\\]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return crypto.createHash("md5").update(`${voice}:::${clean}`).digest("hex");
}

const PERSONAS = [
  { voice: "ur-PK-AsadNeural", text: "السلام علیکم! میں اسد ہوں، چیپ چیٹس پر آپ کی خدمت میں حاضر ہوں۔" },
  { voice: "ur-PK-UzmaNeural", text: "السلام علیکم! میرا نام عظمیٰ ہے۔ میں چیپ چیٹس پر آپ کی کیا رہنمائی کر سکتی ہوں؟" },
  { voice: "ur-IN-SalmanNeural", text: "السلام علیکم! میں سلمان ہوں۔ آج ہم کس موضوع پر گفتگو کریں؟" },
  { voice: "ur-IN-GulNeural", text: "السلام علیکم! میں گل ہوں۔ فرمائیے آج آپ کے لیے کیا خدمت سرانجام دوں؟" },
  { voice: "hi-IN-MadhurNeural", text: "नमस्ते! मैं मधुर हूँ। आज हम किस विषय पर चर्चा करना चाहते हैं?" },
  { voice: "hi-IN-SwaraNeural", text: "नमस्ते! मैं स्वरा हूँ, CheapChats में आपका स्वागत है। बताइए आज क्या करना है?" },
  { voice: "en-US-JennyNeural", text: "Hi there! I'm Jenny. I can help brainstorm ideas, code, or answer questions." },
  { voice: "en-US-GuyNeural", text: "Hey! I'm Guy. Let's make things happen with CheapChats today." },
  { voice: "en-US-AriaNeural", text: "Hello! I am Aria, ready to assist you with everything you need." },
  { voice: "en-GB-SoniaNeural", text: "Good day! I'm Sonia. It is a genuine pleasure to assist you with your tasks." },
  { voice: "ar-AE-HamdanNeural", text: "مرحباً! أنا حمدان، يسعدني التحدث معك اليوم." },
  { voice: "ar-SA-ZariyahNeural", text: "أهلاً بك! أنا زارية، كيف يمكنني مساعدتك في شيب شاتس؟" },
  { voice: "ur-PK-AsadNeural", text: "Assalam-o-Alaikum! CheapChats par aap ki aawaz bilkul saaf aa rahi hai." },
  { voice: "en-US-JennyNeural", text: "Hello! CheapChats voice and speech test is running smoothly." }
];

async function warmupVoice(item) {
  const key = getCacheKey(item.voice, item.text);
  const targetFile = path.join(cacheDir, `${key}.mp3`);
  if (fs.existsSync(targetFile) && fs.statSync(targetFile).size > 1000) {
    console.log(`[Cached] ${item.voice}`);
    return;
  }

  try {
    const tts = new MsEdgeTTS();
    await tts.setMetadata(item.voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
    const { audioStream } = tts.toStream(item.text);
    const chunks = [];
    await new Promise((resolve, reject) => {
      audioStream.on("data", c => chunks.push(c));
      audioStream.on("end", resolve);
      audioStream.on("error", reject);
    });
    const buf = Buffer.concat(chunks);
    if (buf.length > 500) {
      fs.writeFileSync(targetFile, buf);
      console.log(`[Generated] ${item.voice} (${buf.length} bytes)`);
    }
  } catch (err) {
    console.warn(`[Failed] ${item.voice}:`, err.message);
  }
}

async function run() {
  console.log("Starting TTS cache warm-up...");
  for (const item of PERSONAS) {
    await warmupVoice(item);
  }
  console.log("Warm-up complete!");
}

run();
