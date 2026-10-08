/**
 * Speech utilities for Speech Synthesis (TTS) and Speech Recognition (STT).
 * Includes transliteration for Roman Urdu and Persona-based voice selection.
 */

export const STOP_WORDS = [
  "stop",
  "ruk jao",
  "ruk ja",
  "ruk",
  "chup",
  "chup raho",
  "chup ho jao",
  "bas",
  "bas karo",
  "pause",
  "cancel",
  "quiet",
  "hush",
  "shut up",
  "stop please",
];

export interface SpeechLanguageOption {
  id: string;
  label: string;
  nativeLabel: string;
  flag: string;
  sttLang: string;
  ttsLangPrefix: string;
  samplePhrase: string;
  description: string;
  popular?: boolean;
}

export const SPEECH_LANGUAGES: SpeechLanguageOption[] = [
  {
    id: "auto",
    label: "Auto-Detect",
    nativeLabel: "Auto (Default: English)",
    flag: "🌐",
    sttLang: "en-US",
    ttsLangPrefix: "en",
    samplePhrase: "Hello! CheapChats voice system is clear, fast, and responsive.",
    description: "Automatically detects speech with English as primary default",
    popular: true,
  },
  {
    id: "ur-roman",
    label: "Roman Urdu",
    nativeLabel: "اردو (Roman Script)",
    flag: "🇵🇰",
    sttLang: "ur-PK",
    ttsLangPrefix: "ur",
    samplePhrase: "Assalam-o-Alaikum! CheapChats ka voice system kaisa kaam kar raha hai?",
    description: "Roman Urdu English-script transcription & natural Desi voice accents",
    popular: true,
  },
  {
    id: "ur-PK",
    label: "Urdu (Pakistan)",
    nativeLabel: "اردو (پاکستان)",
    flag: "🇵🇰",
    sttLang: "ur-PK",
    ttsLangPrefix: "ur",
    samplePhrase: "السلام علیکم! چیپ چیٹس کی آواز کیسی ہے؟",
    description: "Native Urdu speech recognition and voice synthesis",
    popular: true,
  },
  {
    id: "hi-IN",
    label: "Hindi (India)",
    nativeLabel: "हिन्दी (भारत)",
    flag: "🇮🇳",
    sttLang: "hi-IN",
    ttsLangPrefix: "hi",
    samplePhrase: "नमस्ते! CheapChats की आवाज़ कैसी लग रही है?",
    description: "Native Hindi accent and recognition",
    popular: true,
  },
  {
    id: "en-US",
    label: "English (US)",
    nativeLabel: "English (United States)",
    flag: "🇺🇸",
    sttLang: "en-US",
    ttsLangPrefix: "en",
    samplePhrase: "Hello! The quick brown fox jumps over the lazy dog.",
    description: "Standard American English voice and recognition",
    popular: true,
  },
  {
    id: "en-GB",
    label: "English (UK)",
    nativeLabel: "English (United Kingdom)",
    flag: "🇬🇧",
    sttLang: "en-GB",
    ttsLangPrefix: "en",
    samplePhrase: "Good day! The speech engine is functioning splendidly.",
    description: "British English accent and recognition",
    popular: true,
  },
  {
    id: "en-IN",
    label: "English (India)",
    nativeLabel: "English (India)",
    flag: "🇮🇳",
    sttLang: "en-IN",
    ttsLangPrefix: "en",
    samplePhrase: "Hello! CheapChats voice and speech test is running smoothly.",
    description: "Indian English accent and recognition",
    popular: true,
  },
  {
    id: "ar-SA",
    label: "Arabic (Saudi)",
    nativeLabel: "العربية (السعودية)",
    flag: "🇸🇦",
    sttLang: "ar-SA",
    ttsLangPrefix: "ar",
    samplePhrase: "مرحباً! نظام الصوت في CheapChats يعمل بكفاءة عالية.",
    description: "Standard Arabic (Saudi Arabia) voice and recognition",
    popular: true,
  },
  {
    id: "ar-AE",
    label: "Arabic (UAE)",
    nativeLabel: "العربية (الإمارات)",
    flag: "🇦🇪",
    sttLang: "ar-AE",
    ttsLangPrefix: "ar",
    samplePhrase: "مرحباً بك! تجربة الصوت والتعرف على الكلام ممتازة.",
    description: "Gulf Arabic accent and speech recognition",
  },
  {
    id: "es-ES",
    label: "Spanish (Spain)",
    nativeLabel: "Español (España)",
    flag: "🇪🇸",
    sttLang: "es-ES",
    ttsLangPrefix: "es",
    samplePhrase: "¡Hola! El sistema de voz de CheapChats funciona de maravilla.",
    description: "Castilian Spanish accent and recognition",
  },
  {
    id: "fr-FR",
    label: "French (France)",
    nativeLabel: "Français (France)",
    flag: "🇫🇷",
    sttLang: "fr-FR",
    ttsLangPrefix: "fr",
    samplePhrase: "Bonjour! Le système vocal de CheapChats fonctionne parfaitement.",
    description: "French native accent and recognition",
  },
  {
    id: "de-DE",
    label: "German (Germany)",
    nativeLabel: "Deutsch (Deutschland)",
    flag: "🇩🇪",
    sttLang: "de-DE",
    ttsLangPrefix: "de",
    samplePhrase: "Hallo! Das Sprachsystem von CheapChats funktioniert einwandfrei.",
    description: "German standard accent and recognition",
  },
  {
    id: "zh-CN",
    label: "Chinese (Mandarin)",
    nativeLabel: "中文 (普通话)",
    flag: "🇨🇳",
    sttLang: "zh-CN",
    ttsLangPrefix: "zh",
    samplePhrase: "你好！CheapChats语音识别和合成系统运行良好。",
    description: "Simplified Chinese Mandarin accent and recognition",
  },
  {
    id: "tr-TR",
    label: "Turkish (Turkey)",
    nativeLabel: "Türkçe (Türkiye)",
    flag: "🇹🇷",
    sttLang: "tr-TR",
    ttsLangPrefix: "tr",
    samplePhrase: "Merhaba! CheapChats ses sistemi harika bir şekilde çalışıyor.",
    description: "Turkish native accent and speech recognition",
  },
  {
    id: "ja-JP",
    label: "Japanese",
    nativeLabel: "日本語",
    flag: "🇯🇵",
    sttLang: "ja-JP",
    ttsLangPrefix: "ja",
    samplePhrase: "こんにちは！CheapChatsの音声システムは正常に動作しています。",
    description: "Japanese native accent and recognition",
  },
];

/**
 * Named Voice Personas with customized accents, pitch, rate, and preferred browser voices.
 */
export interface VoicePersona {
  id: string;
  name: string;
  gender: "female" | "male";
  accentTitle: string;
  flag: string;
  badge: string;
  tags: string[];
  description: string;
  samplePhrase: string;
  preferredKeywords: string[];
  langCodes: string[];
  pitch: number;
  rate: number;
}

export const VOICE_PERSONAS: VoicePersona[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // GROUP 1: FAMOUS INTERNATIONAL ACCENTS (TOP SECTION)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "jenny",
    name: "Jenny",
    gender: "female",
    accentTitle: "English US (Natural Female)",
    flag: "🇺🇸",
    badge: "Famous",
    tags: ["English US", "Friendly", "Natural"],
    description: "Engaging, crisp and clear modern American English female persona.",
    samplePhrase: "Hi there! I'm Jenny. I can help brainstorm ideas, code, or answer questions.",
    preferredKeywords: ["jenny", "natural", "zira", "google us english", "en-us"],
    langCodes: ["en-us", "en"],
    pitch: 1.0,
    rate: 1.0,
  },
  {
    id: "guy",
    name: "Guy",
    gender: "male",
    accentTitle: "English US (Bhari Aawaz / Deep Male)",
    flag: "🇺🇸",
    badge: "Heavy Male",
    tags: ["English US", "Bhari Aawaz", "Confident"],
    description: "Deep, powerful masculine tone for authoritative American English.",
    samplePhrase: "Hey! I'm Guy. Let's make things happen with CheapChats today.",
    preferredKeywords: ["guy", "david", "mark", "male", "google us english", "en-us"],
    langCodes: ["en-us", "en"],
    pitch: 0.78,
    rate: 1.0,
  },
  {
    id: "sonia",
    name: "Sonia",
    gender: "female",
    accentTitle: "English UK (British Polished)",
    flag: "🇬🇧",
    badge: "British",
    tags: ["English UK", "Polished", "Articulate"],
    description: "Sophisticated British Received Pronunciation female voice.",
    samplePhrase: "Good day! I'm Sonia. It is a genuine pleasure to assist you with your tasks.",
    preferredKeywords: ["sonia", "libby", "hazel", "google uk", "en-gb"],
    langCodes: ["en-gb", "en"],
    pitch: 1.0,
    rate: 0.98,
  },
  {
    id: "hamdan",
    name: "Hamdan (حمدان)",
    gender: "male",
    accentTitle: "Gulf Arabic (Executive Deep Male)",
    flag: "🇦🇪",
    badge: "Famous Gulf",
    tags: ["Gulf Arabic", "Confident", "Deep Male"],
    description: "Executive Gulf Arabic masculine persona with natural cadence.",
    samplePhrase: "أهلاً وسهلاً! أنا حمدان، جاهز لمساعدتك في أي استفسار أو مهمة.",
    preferredKeywords: ["hamdan", "tariq", "naayf", "male", "ar-ae", "arabic"],
    langCodes: ["ar-ae", "ar"],
    pitch: 0.80,
    rate: 0.95,
  },
  {
    id: "fatima",
    name: "Fatima (فاطمة)",
    gender: "female",
    accentTitle: "Arabic Saudi (Clear Female)",
    flag: "🇸🇦",
    badge: "Fusha",
    tags: ["Arabic", "Modern Standard", "Warm"],
    description: "Clear and polite Modern Standard Arabic female voice.",
    samplePhrase: "مرحباً بك! أنا فاطمة، كيف يمكنني مساعدتك في شات اليوم؟",
    preferredKeywords: ["fatima", "zeina", "mouna", "female", "ar-sa", "arabic"],
    langCodes: ["ar-sa", "ar"],
    pitch: 1.05,
    rate: 0.95,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // GROUP 2: PAKISTANI & HINDI ACCENTS (LOWER SECTION - ROMAN URDU & DESI)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "bilal",
    name: "Bilal (بلال)",
    gender: "male",
    accentTitle: "Roman Urdu (Bhari Aawaz / Father-like Deep Male)",
    flag: "🇵🇰",
    badge: "Bhari Aawaz / Father",
    tags: ["Roman Urdu", "Bhari Aawaz", "Father-like", "Deep Male"],
    description: "Heavy, respectful father-like masculine tone. Guaranteed deep male voice.",
    samplePhrase: "Assalam-o-Alaikum! Main Bilal hoon. Boliye beta aaj main aap ki kya madad kar sakta hoon?",
    preferredKeywords: ["madhur", "prabhat", "ravi", "male", "guy", "david", "mark"],
    langCodes: ["hi-in", "en-in", "ur-pk", "hi"],
    pitch: 0.74,
    rate: 1.05,
  },
  {
    id: "pari",
    name: "Pari (پری / Choti Bachi)",
    gender: "female",
    accentTitle: "Roman Urdu (Child Girl / Cute Kid)",
    flag: "🇵🇰",
    badge: "Child Girl",
    tags: ["Roman Urdu", "Child Voice", "Cute Tone", "Fast"],
    description: "Playful, sweet and high-pitched child girl voice for lighthearted conversation.",
    samplePhrase: "Hello! Mera naam Pari hai! CheapChats bohot acha hai, mujh se koi bhi baat karein!",
    preferredKeywords: ["swara", "kalpana", "neerja", "female"],
    langCodes: ["hi-in", "en-in", "hi"],
    pitch: 1.38,
    rate: 1.14,
  },
  {
    id: "sameer",
    name: "Sameer (سمیر / Real Human)",
    gender: "male",
    accentTitle: "Roman Urdu (100% Real Human / Natural Friend)",
    flag: "🇵🇰",
    badge: "Real Human",
    tags: ["Roman Urdu", "Real Human", "Natural Tone", "Snappy Reply"],
    description: "Ultra-realistic natural human voice, sounds like a real friend talking live on a phone call.",
    samplePhrase: "Haan ji! Main Sameer hoon. Boliye, main bilkul live sun raha hoon, kya madad karoon?",
    preferredKeywords: ["sameer", "madhur", "prabhat", "ravi", "male"],
    langCodes: ["hi-in", "en-in", "ur-pk", "hi"],
    pitch: 0.94,
    rate: 1.12,
  },
  {
    id: "zoya",
    name: "Zoya (زویا)",
    gender: "female",
    accentTitle: "Roman Urdu (Natural Human Female)",
    flag: "🇵🇰",
    badge: "Human Female",
    tags: ["Roman Urdu", "Desi Accent", "Warm Female", "Fast"],
    description: "Friendly, soft and natural conversational Desi female voice.",
    samplePhrase: "Assalam-o-Alaikum! Main Zoya hoon. CheapChats par aap ki madad ke liye hazir hoon.",
    preferredKeywords: ["swara", "heera", "kalpana", "neerja", "female"],
    langCodes: ["hi-in", "en-in", "hi"],
    pitch: 1.06,
    rate: 1.10,
  },
  {
    id: "ayesha",
    name: "Ayesha (عائشہ)",
    gender: "female",
    accentTitle: "Roman Urdu (Soft & Clear Female)",
    flag: "🇵🇰",
    badge: "Soft Tone",
    tags: ["Roman Urdu", "Soft", "Clear Female", "Fast"],
    description: "Gentle and articulate feminine tone, ideal for long explanations.",
    samplePhrase: "Hello! Main Ayesha hoon. Koi bhi sawaal ho to bila-jhijhak pooch sakte hain.",
    preferredKeywords: ["kalpana", "swara", "neerja", "female"],
    langCodes: ["hi-in", "en-in", "hi"],
    pitch: 1.0,
    rate: 1.08,
  },
  {
    id: "swara",
    name: "Swara (स्वरा)",
    gender: "female",
    accentTitle: "Hindi / Hinglish (Neural Modern Female)",
    flag: "🇮🇳",
    badge: "Neural HD",
    tags: ["Hindi", "Hinglish", "Clear Female"],
    description: "Crisp and standard Indian accent with authentic Hindi & Hinglish diction.",
    samplePhrase: "नमस्ते! मैं स्वरा हूँ, CheapChats में आपका स्वागत है। बताइए आज क्या करना है?",
    preferredKeywords: ["swara", "google हिन्दी", "kalpana", "hi-in", "female"],
    langCodes: ["hi-in", "hi"],
    pitch: 1.02,
    rate: 1.0,
  },
  {
    id: "madhur",
    name: "Madhur (मधुर)",
    gender: "male",
    accentTitle: "Hindi / Hinglish (Neural Deep Male)",
    flag: "🇮🇳",
    badge: "Neural Male",
    tags: ["Hindi", "Hinglish", "Deep Male"],
    description: "Calm, rich and heavy masculine persona for natural Hindi conversation.",
    samplePhrase: "नमस्ते! मैं मधुर हूँ। आज हम किस विषय पर चर्चा करना चाहते हैं?",
    preferredKeywords: ["madhur", "prabhat", "ravi", "male"],
    langCodes: ["hi-in", "hi"],
    pitch: 0.78,
    rate: 0.96,
  },
  {
    id: "neerja",
    name: "Neerja (नीरजा)",
    gender: "female",
    accentTitle: "Indian English (Professional Female)",
    flag: "🇮🇳",
    badge: "Bilingual",
    tags: ["Indian English", "Fluent", "Female"],
    description: "Fluent bilingual Indian English persona with clear diction.",
    samplePhrase: "Hello! I am Neerja, ready to assist you with quick and accurate answers.",
    preferredKeywords: ["neerja", "en-in", "swara", "female"],
    langCodes: ["en-in", "hi-in"],
    pitch: 1.02,
    rate: 1.0,
  },
  {
    id: "rohan",
    name: "Rohan",
    gender: "male",
    accentTitle: "Indian English (Dynamic Tech Male)",
    flag: "🇮🇳",
    badge: "Tech Male",
    tags: ["Indian English", "Dynamic", "Male"],
    description: "Energetic Indian English male voice, great for technical queries.",
    samplePhrase: "Hello! I am Rohan. Let's dive straight into your coding questions.",
    preferredKeywords: ["rohan", "ravi", "prabhat", "male", "en-in"],
    langCodes: ["en-in", "hi-in"],
    pitch: 0.86,
    rate: 1.02,
  },
  {
    id: "asad",
    name: "Asad (اسد)",
    gender: "male",
    accentTitle: "Urdu Native (Classic Elder Male)",
    flag: "🇵🇰",
    badge: "Elder Male",
    tags: ["Urdu", "Elder Male", "Ba-Waqar", "Formal", "Fast"],
    description: "Dignified native Urdu elder masculine voice with prompt, respectful answers.",
    samplePhrase: "Assalam-o-Alaikum! Main Asad hoon. Batayein beta main aap ki kya madad kar sakta hoon?",
    preferredKeywords: ["asad", "urdu", "ur-pk", "ur_pk", "tariq", "madhur", "prabhat", "ravi"],
    langCodes: ["ur-pk", "ur", "hi-in", "en-in", "hi", "ar-sa", "ar"],
    pitch: 0.70,
    rate: 1.10,
  },
  {
    id: "gul",
    name: "Gul (گل / Gul Khan)",
    gender: "male",
    accentTitle: "Urdu (Gul / Fast & Lively Male)",
    flag: "🇵🇰",
    badge: "Lively Male",
    tags: ["Urdu", "Lively Male", "Gul Khan", "Snappy", "Fast"],
    description: "Energetic and brisk native masculine voice, responds fast and promptly like a friend.",
    samplePhrase: "Assalam-o-Alaikum! Main Gul hoon. Boliye lala, kya madad chahiye? Main foran tayyar hoon!",
    preferredKeywords: ["gul", "urdu", "ur-pk", "ur_pk", "madhur", "prabhat", "ravi", "tariq"],
    langCodes: ["ur-pk", "ur", "hi-in", "en-in", "hi", "ar-sa", "ar"],
    pitch: 0.92,
    rate: 1.14,
  },
];

// ═════════════════════════════════════════════════════════════════════════════
// AZURE NEURAL HD VOICE PERSONAS (BY API - 100% FREE & HYPER-REALISTIC)
// ═════════════════════════════════════════════════════════════════════════════
export interface AzureVoicePersona {
  id: string;
  name: string;
  azureVoice: string;
  gender: "male" | "female";
  accentTitle: string;
  flag: string;
  badge: string;
  tags: string[];
  description: string;
  samplePhrase: string;
}

export const AZURE_VOICE_PERSONAS: AzureVoicePersona[] = [
  {
    id: "azure:ur-PK-AsadNeural",
    name: "Asad (اسد)",
    azureVoice: "ur-PK-AsadNeural",
    gender: "male",
    accentTitle: "Urdu Pakistan (Azure Neural Male)",
    flag: "🇵🇰",
    badge: "Azure Official",
    tags: ["Urdu", "Azure Neural", "Authentic Male", "Natural"],
    description: "Official Microsoft Azure neural voice for Pakistan with dignified, realistic human tone.",
    samplePhrase: "السلام علیکم! میں اسد ہوں، چیپ چیٹس پر آپ کی خدمت میں حاضر ہوں۔",
  },
  {
    id: "azure:ur-PK-UzmaNeural",
    name: "Uzma (عظمیٰ)",
    azureVoice: "ur-PK-UzmaNeural",
    gender: "female",
    accentTitle: "Urdu Pakistan (Azure Neural Female)",
    flag: "🇵🇰",
    badge: "Azure Official",
    tags: ["Urdu", "Azure Neural", "Authentic Female", "Warm"],
    description: "Official Microsoft Azure native Pakistani female voice with gentle, clear human cadence.",
    samplePhrase: "السلام علیکم! میرا نام عظمیٰ ہے۔ میں چیپ چیٹس پر آپ کی کیا رہنمائی کر سکتی ہوں؟",
  },
  {
    id: "azure:ur-IN-SalmanNeural",
    name: "Salman (سلمان)",
    azureVoice: "ur-IN-SalmanNeural",
    gender: "male",
    accentTitle: "Urdu (Azure Salman Male)",
    flag: "🇵🇰",
    badge: "Fast Male",
    tags: ["Urdu", "Azure Neural", "Male", "Snappy"],
    description: "Crisp and articulate Urdu masculine neural voice, fast and engaging.",
    samplePhrase: "السلام علیکم! میں سلمان ہوں۔ آج ہم کس موضوع پر گفتگو کریں؟",
  },
  {
    id: "azure:ur-IN-GulNeural",
    name: "Gul (گل)",
    azureVoice: "ur-IN-GulNeural",
    gender: "female",
    accentTitle: "Urdu (Azure Gul Female)",
    flag: "🇵🇰",
    badge: "Lively Female",
    tags: ["Urdu", "Azure Neural", "Female", "Melodic"],
    description: "Expressive and melodic Urdu feminine neural voice with smooth cadence.",
    samplePhrase: "السلام علیکم! میں گل ہوں۔ فرمائیے آج آپ کے لیے کیا خدمت سرانجام دوں؟",
  },
  {
    id: "azure:hi-IN-MadhurNeural",
    name: "Madhur (मधुर)",
    azureVoice: "hi-IN-MadhurNeural",
    gender: "male",
    accentTitle: "Hindi / Hinglish (Azure Deep Male)",
    flag: "🇮🇳",
    badge: "Deep Male",
    tags: ["Hindi", "Hinglish", "Azure Neural", "Deep Tone"],
    description: "Rich, deep and authoritative masculine neural voice, sounds 100% human.",
    samplePhrase: "नमस्ते! मैं मधुर हूँ। आज हम किस विषय पर चर्चा करना चाहते हैं?",
  },
  {
    id: "azure:hi-IN-SwaraNeural",
    name: "Swara (स्वरा)",
    azureVoice: "hi-IN-SwaraNeural",
    gender: "female",
    accentTitle: "Hindi / Hinglish (Azure Natural Female)",
    flag: "🇮🇳",
    badge: "Natural HD",
    tags: ["Hindi", "Hinglish", "Azure Neural", "Expressive"],
    description: "Warm, authentic Indian female neural voice with natural conversational emotion.",
    samplePhrase: "नमस्ते! मैं स्वरा हूँ, CheapChats में आपका स्वागत है। बताइए आज क्या करना है?",
  },
  {
    id: "azure:en-US-JennyNeural",
    name: "Jenny",
    azureVoice: "en-US-JennyNeural",
    gender: "female",
    accentTitle: "English US (Azure Natural Female)",
    flag: "🇺🇸",
    badge: "Famous US",
    tags: ["English US", "Azure Neural", "Natural", "Friendly"],
    description: "Engaging and clear modern American English neural female persona.",
    samplePhrase: "Hi there! I'm Jenny. I can help brainstorm ideas, code, or answer questions.",
  },
  {
    id: "azure:en-US-GuyNeural",
    name: "Guy",
    azureVoice: "en-US-GuyNeural",
    gender: "male",
    accentTitle: "English US (Azure Deep Male)",
    flag: "🇺🇸",
    badge: "Heavy Male",
    tags: ["English US", "Azure Neural", "Confident", "Deep Male"],
    description: "Deep and resonant American masculine neural voice.",
    samplePhrase: "Hey! I'm Guy. Let's make things happen with CheapChats today.",
  },
  {
    id: "azure:en-US-AriaNeural",
    name: "Aria",
    azureVoice: "en-US-AriaNeural",
    gender: "female",
    accentTitle: "English US (Azure Expressive Female)",
    flag: "🇺🇸",
    badge: "Expressive",
    tags: ["English US", "Azure Neural", "Versatile", "Expressive"],
    description: "Dynamic and expressive American female voice with natural mood changes.",
    samplePhrase: "Hello! I am Aria, ready to assist you with everything you need.",
  },
  {
    id: "azure:en-GB-SoniaNeural",
    name: "Sonia",
    azureVoice: "en-GB-SoniaNeural",
    gender: "female",
    accentTitle: "English UK (Azure British Polished)",
    flag: "🇬🇧",
    badge: "British HD",
    tags: ["English UK", "Azure Neural", "Polished", "Articulate"],
    description: "Sophisticated British Received Pronunciation neural voice.",
    samplePhrase: "Good day! I'm Sonia. It is a genuine pleasure to assist you with your tasks.",
  },
  {
    id: "azure:ar-AE-HamdanNeural",
    name: "Hamdan (حمدان)",
    azureVoice: "ar-AE-HamdanNeural",
    gender: "male",
    accentTitle: "Gulf Arabic (Azure Executive Male)",
    flag: "🇦🇪",
    badge: "Gulf Arabic",
    tags: ["Gulf Arabic", "Azure Neural", "Executive", "Deep"],
    description: "Executive Gulf Arabic masculine persona with natural human cadence.",
    samplePhrase: "أهلاً وسهلاً! أنا حمدان، جاهز لمساعدتك في أي استفسار أو مهمة.",
  },
  {
    id: "azure:ar-SA-ZariyahNeural",
    name: "Zariyah (زارية)",
    azureVoice: "ar-SA-ZariyahNeural",
    gender: "female",
    accentTitle: "Saudi Arabic (Azure Clear Female)",
    flag: "🇸🇦",
    badge: "Saudi Fusha",
    tags: ["Arabic", "Azure Neural", "Modern Standard", "Warm"],
    description: "Clear and polite Modern Standard Arabic female neural voice.",
    samplePhrase: "مرحباً بك! أنا زارية، كيف يمكنني مساعدتك في شات اليوم؟",
  },
];

/**
 * Returns default rate and pitch for a given voice URI or persona.
 */
export function getPersonaSettings(ttsVoiceUri?: string): { rate: number; pitch: number } {
  if (ttsVoiceUri && ttsVoiceUri.startsWith("persona:")) {
    const personaId = ttsVoiceUri.replace("persona:", "");
    const persona = VOICE_PERSONAS.find((p) => p.id === personaId);
    if (persona) {
      return { rate: persona.rate, pitch: persona.pitch };
    }
  }
  return { rate: 1.0, pitch: 1.0 };
}

/**
 * Reads user's customized rate and pitch from localStorage (or fallback to persona defaults).
 * This ensures that when the user adjusts sliders in Settings, the Chat Assistant always speaks with that exact speed!
 */
export function getEffectiveTtsSettings(ttsVoiceUri?: string): { rate: number; pitch: number } {
  let savedRate: number | null = null;
  let savedPitch: number | null = null;

  if (typeof window !== "undefined") {
    const r = localStorage.getItem("cheapchat_tts_rate");
    const p = localStorage.getItem("cheapchat_tts_pitch");
    if (r !== null && r !== "") savedRate = parseFloat(r);
    if (p !== null && p !== "") savedPitch = parseFloat(p);
  }

  const persona = ttsVoiceUri && ttsVoiceUri.startsWith("persona:")
    ? VOICE_PERSONAS.find((p) => p.id === ttsVoiceUri.replace("persona:", ""))
    : null;

  const defaultRate = persona?.rate ?? 1.0;
  const defaultPitch = persona?.pitch ?? 1.0;

  return {
    rate: savedRate !== null && !isNaN(savedRate) ? savedRate : defaultRate,
    pitch: savedPitch !== null && !isNaN(savedPitch) ? savedPitch : defaultPitch,
  };
}

// ─── ROMAN URDU TRANSLITERATION ENGINE ──────────────────────────────────────────

/**
 * Common multi-word Urdu phrases mapped to clean Roman Urdu.
 * Checked first before single-word dictionary matching.
 */
const URDU_PHRASES_DICT: [string, string][] = [
  ["السلام علیکم", "Assalam-o-Alaikum"],
  ["وعلیکم السلام", "Walaikum Assalam"],
  ["کیا حال ہے", "kya haal hai"],
  ["کیسے ہیں آپ", "kaise hain aap"],
  ["کیسی ہیں آپ", "kaisi hain aap"],
  ["آپ کیسے ہیں", "aap kaise hain"],
  ["آپ کیسی ہیں", "aap kaisi hain"],
  ["میں ٹھیک ہوں", "main theek hoon"],
  ["الحمد للہ", "Alhamdulillah"],
  ["الحمدللہ", "Alhamdulillah"],
  ["ماشاءاللہ", "MashaAllah"],
  ["انشاءاللہ", "InshaAllah"],
  ["سب ٹھیک ہے", "sab theek hai"],
  ["کوئی بات نہیں", "koi baat nahi"],
  ["بہت شکریہ", "bohot shukriya"],
  ["کیا بات ہے", "kya baat hai"],
  ["اس لیے", "isliye"],
  ["اس لئے", "isliye"],
  ["کے لیے", "ke liye"],
  ["کے لئے", "ke liye"],
  ["کی طرف", "ki taraf"],
  ["پتہ نہیں", "pata nahi"],
  ["خدا حافظ", "Khuda Hafiz"],
  ["اللہ حافظ", "Allah Hafiz"],
  ["جزاک اللہ", "JazakAllah"],
  ["آپ کا نام", "aap ka naam"],
  ["آپکی مدد", "aap ki madad"],
  ["آپ کی مدد", "aap ki madad"],
];

/**
 * Comprehensive dictionary mapping common Urdu script words to Roman Urdu.
 */
export const URDU_TO_ROMAN_DICT: Record<string, string> = {
  // Greetings & Courtesy
  "السلام": "Assalam",
  "علیکم": "Alaikum",
  "وعلیکم": "Walaikum",
  "شکریہ": "shukriya",
  "مہربانی": "meherbani",
  "خوش": "khush",
  "آمدید": "aamdeed",
  "خدا": "Khuda",
  "حافظ": "Hafiz",
  "اللہ": "Allah",
  "جزاک": "Jazak",
  "ماشاءاللہ": "MashaAllah",
  "انشاءاللہ": "InshaAllah",
  "الحمدللہ": "Alhamdulillah",

  // Pronouns & Demonstratives
  "میں": "main",
  "ہم": "hum",
  "آپ": "aap",
  "تم": "tum",
  "تو": "tu",
  "وہ": "woh",
  "یہ": "yeh",
  "میرا": "mera",
  "میری": "meri",
  "میرے": "mere",
  "ہمارا": "hamara",
  "ہماری": "hamari",
  "ہمارے": "hamare",
  "تیرا": "tera",
  "تیری": "teri",
  "تیرے": "tere",
  "اس": "iss",
  "اسکا": "iska",
  "اسکی": "iski",
  "اسکے": "iske",
  "ان": "inn",
  "انکا": "inka",
  "انکی": "inki",
  "انکے": "inke",
  "اپنا": "apna",
  "اپنی": "apni",
  "اپنے": "apne",
  "خود": "khud",
  "مجھے": "mujhe",
  "ہمیں": "humein",
  "تجھے": "tujhe",
  "اسے": "ise",
  "انہیں": "unhein",

  // Question words
  "کیا": "kya",
  "کیسے": "kaise",
  "کیسی": "kaisi",
  "کیسا": "kaisa",
  "کیوں": "kyun",
  "کب": "kab",
  "کہاں": "kahan",
  "کدھر": "kidhar",
  "کون": "kaun",
  "کس": "kis",
  "کسے": "kise",
  "کسکو": "kisko",
  "کتنا": "kitna",
  "کتنی": "kitni",
  "کتنے": "kitne",

  // Auxiliary & State Verbs
  "ہے": "hai",
  "ہیں": "hain",
  "ہوں": "hoon",
  "ہو": "ho",
  "تھا": "tha",
  "تھی": "thi",
  "تھے": "the",
  "تھیں": "theen",
  "ہونا": "hona",
  "ہوتا": "hota",
  "ہوتی": "hoti",
  "ہوتے": "hote",
  "ہوگا": "hoga",
  "ہوگی": "hogi",
  "ہونگے": "honge",
  "ہوںگے": "honge",

  // Common Action Verbs
  "کرنا": "karna",
  "کرتا": "karta",
  "کرتی": "karti",
  "کرتے": "karte",
  "کرو": "karo",
  "کریں": "karein",
  "کروں": "karoon",
  "کر": "kar",
  "کیے": "kiye",
  "کہا": "kaha",
  "کہہ": "keh",
  "کہو": "kaho",
  "کہیں": "kahein",
  "بول": "bol",
  "بولو": "bolo",
  "بولیں": "bolein",
  "بولنا": "bolna",
  "بتانا": "batana",
  "بتاؤ": "batao",
  "بتائیں": "batayein",
  "بتا": "bata",
  "دیکھو": "dekho",
  "دیکھیں": "dekhein",
  "دیکھ": "dekh",
  "دیکھنا": "dekhna",
  "سنو": "suno",
  "سنیں": "sunein",
  "سن": "sun",
  "سننا": "sunna",
  "سمجھ": "samajh",
  "سمجھا": "samjha",
  "سمجھے": "samjhe",
  "سمجھنا": "samajhna",
  "سمجھاؤ": "samjhao",
  "جانا": "jaana",
  "جا": "jaa",
  "جاؤ": "jaao",
  "جائیں": "jayein",
  "گیا": "gaya",
  "گئی": "gayi",
  "گئے": "gaye",
  "آنا": "aana",
  "آؤ": "aao",
  "آئیں": "aayein",
  "آیا": "aaya",
  "آئی": "aayi",
  "آئے": "aaye",
  "لینا": "lena",
  "لو": "lo",
  "لے": "le",
  "لیں": "lein",
  "لیا": "liya",
  "لی": "li",
  "لیے": "liye",
  "دینا": "dena",
  "دے": "de",
  "دیں": "dein",
  "دیا": "diya",
  "دی": "di",
  "رہا": "raha",
  "رہی": "rahi",
  "رہے": "rahe",
  "رہنا": "rehna",
  "رہو": "raho",
  "رہیں": "rahein",
  "سکتا": "sakta",
  "سکتی": "sakti",
  "سکتے": "sakte",
  "سکو": "sako",
  "چاہئے": "chahiye",
  "چاہیے": "chahiye",
  "چاہتا": "chahta",
  "چاہتی": "chahti",
  "چاہتے": "chahte",
  "پوچھنا": "poochna",
  "پوچھو": "poocho",
  "پوچھیں": "poochein",
  "پوچھا": "poocha",
  "پوچھ": "pooch",
  "لکھنا": "likhna",
  "لکھو": "likho",
  "لکھیں": "likhein",
  "لکھ": "likh",
  "پڑھنا": "parhna",
  "پڑھو": "parho",
  "پڑھ": "parh",
  "کھانا": "khana",
  "کھاؤ": "khao",
  "پیئو": "piyo",
  "پینا": "peena",
  "چلنا": "chalna",
  "چلو": "chalo",
  "چلیں": "chalein",
  "روک": "rok",
  "روکو": "roko",
  "رک": "ruk",
  "چپ": "chup",
  "بس": "bas",

  // Connectors & Prepositions
  "کا": "ka",
  "کی": "ki",
  "کے": "ke",
  "کو": "ko",
  "سے": "se",
  "پر": "par",
  "تک": "tak",
  "اور": "aur",
  "یا": "ya",
  "لیکن": "lekin",
  "مگر": "magar",
  "پھر": "phir",
  "بھی": "bhi",
  "نہ": "na",
  "نہیں": "nahi",
  "مت": "mat",
  "اگر": "agar",
  "کیونکہ": "kyunke",
  "اسلئے": "isliye",
  "اسلیے": "isliye",
  "ساتھ": "saath",
  "پاس": "paas",
  "سامنے": "saamne",
  "پیچھے": "peeche",
  "اوپر": "ooper",
  "نیچے": "neeche",
  "اندر": "andar",
  "باہر": "bahar",
  "درمیان": "darmiyan",
  "طرف": "taraf",
  "بغیر": "baghair",
  "سوا": "siwa",

  // Common Nouns, Adjectives, Expressions
  "حال": "haal",
  "خیریت": "khairyat",
  "بات": "baat",
  "باتیں": "baatein",
  "کام": "kaam",
  "وقت": "waqt",
  "ٹائم": "time",
  "دن": "din",
  "رات": "raat",
  "صبح": "subah",
  "شام": "shaam",
  "آج": "aaj",
  "کل": "kal",
  "پرسوں": "parson",
  "اب": "ab",
  "ابھی": "abhi",
  "پہلے": "pehle",
  "بعد": "baad",
  "ہمیشہ": "hamesha",
  "کبھی": "kabhi",
  "تھوڑا": "thoda",
  "تھوڑی": "thodi",
  "بہت": "bohot",
  "زیادہ": "zyada",
  "کم": "kam",
  "اچھا": "achha",
  "اچھی": "achhi",
  "اچھے": "achhe",
  "برا": "bura",
  "بری": "buri",
  "برے": "bure",
  "ٹھیک": "theek",
  "صحیح": "sahi",
  "غلط": "ghalat",
  "آسان": "aasan",
  "مشکل": "mushkil",
  "نیا": "naya",
  "نئی": "nayi",
  "نئے": "naye",
  "پرانا": "purana",
  "بڑا": "bada",
  "بڑی": "badi",
  "بڑے": "bade",
  "چھوٹا": "chota",
  "چھوٹی": "choti",
  "چھوٹے": "chote",
  "لوگ": "log",
  "دوست": "dost",
  "بھائی": "bhai",
  "بہن": "behen",
  "گھر": "ghar",
  "چیز": "cheez",
  "چیزیں": "cheezein",
  "سوال": "sawaal",
  "جواب": "jawab",
  "مدد": "madad",
  "پلیز": "please",
  "چیٹ": "chat",
  "میسج": "message",
  "ویڈیو": "video",
  "آڈیو": "audio",
  "تصویر": "tasweer",
  "کوڈ": "code",
  "وغیرہ": "waghaira",
  "سب": "sab",
  "کچھ": "kuch",
  "کوئی": "koi",
  "ہر": "har",
  "ایک": "ek",
  "دو": "do",
  "تین": "teen",
  "چار": "chaar",
  "پانچ": "paanch",
  "نام": "naam",
  "مطلب": "matlab",
  "وجہ": "wajah",
  "طریقہ": "tareeqa",
  "معلومات": "maloomat",
  "ضرورت": "zaroorat",
  "ضروری": "zaroori",
  "فائدہ": "faida",
  "نقصان": "nuqsan",
  "زبردست": "zabardast",
  "بہترین": "behtareen",
  "شک": "shak",
  "یقین": "yaqeen",
  "امید": "ummeed",
  "محبت": "mohabbat",
  "زندگی": "zindagi",
  "دنیا": "dunya",
  "مسئلہ": "masla",
  "حل": "hal",
  "دل": "dil",
  "سوچ": "soch",
  "سوچو": "socho",
  "سیکھو": "seekho",
  "سیکھنا": "seekhna",
};

/**
 * Phonetic character map for fallback transliteration of unlisted Urdu words.
 */
const URDU_CHAR_MAP: Record<string, string> = {
  "آ": "aa",
  "ا": "a",
  "ب": "b",
  "پ": "p",
  "ت": "t",
  "ٹ": "t",
  "ث": "s",
  "ج": "j",
  "چ": "ch",
  "ح": "h",
  "خ": "kh",
  "د": "d",
  "ڈ": "d",
  "ذ": "z",
  "ر": "r",
  "ڑ": "r",
  "ز": "z",
  "ژ": "zh",
  "س": "s",
  "ش": "sh",
  "ص": "s",
  "ض": "z",
  "ط": "t",
  "ظ": "z",
  "ع": "a",
  "غ": "gh",
  "ف": "f",
  "ق": "q",
  "ک": "k",
  "گ": "g",
  "ل": "l",
  "م": "m",
  "ن": "n",
  "ں": "n",
  "و": "o",
  "ہ": "h",
  "ھ": "h",
  "ء": "",
  "ی": "i",
  "ے": "e",
  "ئ": "i",
  "ؤ": "o",
  "ة": "h",
  "،": ",",
  "؛": ";",
  "؟": "?",
  "۔": ".",
};

/**
 * Fallback phonetic character-by-character transliteration for single words not in dictionary.
 */
function transliterateUrduWordPhonetic(urduWord: string): string {
  // Digraph mappings (aspirated consonants)
  const digraphs: [string, string][] = [
    ["بھ", "bh"],
    ["پھ", "ph"],
    ["تھ", "th"],
    ["ٹھ", "th"],
    ["جھ", "jh"],
    ["چھ", "chh"],
    ["دھ", "dh"],
    ["ڈھ", "dh"],
    ["کھ", "kh"],
    ["گھ", "gh"],
  ];

  let temp = urduWord;
  for (const [digraph, rep] of digraphs) {
    temp = temp.split(digraph).join(rep);
  }

  let out = "";
  for (let i = 0; i < temp.length; i++) {
    const ch = temp[i];
    if (URDU_CHAR_MAP[ch] !== undefined) {
      out += URDU_CHAR_MAP[ch];
    } else {
      out += ch;
    }
  }
  return out;
}

/**
 * Transliterates Urdu script into natural, readable Roman Urdu (English alphabet).
 * If the input already contains English/Latin characters, they are preserved untouched.
 */
export function transliterateToRomanUrdu(rawText: string): string {
  if (!rawText) return "";

  // If there are zero Arabic/Urdu characters, return as-is
  const hasUrdu = /[\u0600-\u06FF]/.test(rawText);
  if (!hasUrdu) return rawText;

  let text = rawText;

  // 1. Check multi-word phrase dictionary
  for (const [phrase, roman] of URDU_PHRASES_DICT) {
    if (text.includes(phrase)) {
      text = text.split(phrase).join(` ${roman} `);
    }
  }

  // 2. Tokenize by whitespace while preserving punctuation
  const tokens = text.split(/(\s+|[،؛؟۔.,!?:;])/);

  const transliteratedTokens = tokens.map((token) => {
    if (!token || /^\s+$/.test(token)) return token;

    // Check punctuation
    if (token === "؟") return "?";
    if (token === "،") return ",";
    if (token === "۔") return ".";
    if (token === "؛") return ";";

    // If token is already English / Latin script or numbers, preserve it!
    if (/^[a-zA-Z0-9_\-'"@#]+$/.test(token)) {
      return token;
    }

    // Strip out diacritics / zer / zabar / pesh
    const cleaned = token.replace(/[\u064B-\u065F\u0670]/g, "").trim();

    // Check direct word dictionary
    if (URDU_TO_ROMAN_DICT[cleaned]) {
      return URDU_TO_ROMAN_DICT[cleaned];
    }

    // Fallback phonetic character transliteration
    return transliterateUrduWordPhonetic(cleaned);
  });

  let result = transliteratedTokens.join("");

  // Clean double spaces and punctuation spacing
  result = result
    .replace(/\s+([?,.!;:])/g, "$1")
    .replace(/\s{2,}/g, " ")
    .trim();

  // Capitalize sentence start
  if (result.length > 0) {
    result = result.charAt(0).toUpperCase() + result.slice(1);
  }

  return result;
}

/**
 * Returns the effective BCP-47 language tag for Chrome SpeechRecognition.
 */
export function getEffectiveSttLang(sttLangId?: string): string {
  if (!sttLangId || sttLangId === "auto") {
    return "en-US";
  }
  const found = SPEECH_LANGUAGES.find((l) => l.id === sttLangId);
  if (found) {
    return found.sttLang;
  }
  return sttLangId || "en-US";
}

/**
 * Checks if the spoken transcript contains an interruption/stop keyword.
 */
export function containsStopKeyword(transcript: string): boolean {
  if (!transcript) return false;
  const lower = transcript.toLowerCase().trim();
  return STOP_WORDS.some((word) => {
    const regex = new RegExp(`\\b${word}\\b`, "i");
    return regex.test(lower) || lower.includes(word);
  });
}

/**
 * Cleans markdown, formatting tags, code snippets, URLs, emojis, and artifacts
 * so the browser TTS sounds natural, conversational, and human-like.
 */
export function cleanTextForSpeech(rawText: string): string {
  if (!rawText) return "";
  return rawText
    .replace(/<cheapchatAgent[^>]*\/?>(?:<\/cheapchatAgent>)?/gi, "")
    .replace(/<cheapchatArtifact[\s\S]*?<\/cheapchatArtifact>/gi, "")
    .replace(/```[\s\S]*?```/gi, " [code block omitted] ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/https?:\/\/[^\s)]+/gi, "")
    .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, "")
    .replace(/[#*_~>[\]()📱📧🐙🎵🔗👉🟢✅💡🗣️🔍✓\\]/g, "")
    .replace(/---+/g, "")
    .replace(/[\n\r]+/g, ". ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/**
 * Picks the best voice available in the browser.
 * Priority:
 * 1. Persona ID matching (e.g. "persona:zoya", "persona:bilal", etc.)
 * 2. User configured voiceURI from settings.
 * 3. Language role / accent selected by user (routes Roman Urdu to natural Desi voices).
 * 4. Script-based auto-detection.
 * 5. High quality natural English voice.
 */
export function getBestVoice(
  voices: SpeechSynthesisVoice[],
  ttsVoiceUri?: string,
  sampleText?: string,
  languageRole?: string
): SpeechSynthesisVoice | null {
  if (!voices || voices.length === 0) return null;

  // 1. Check if user configured a Persona (e.g. "persona:bilal")
  if (ttsVoiceUri && ttsVoiceUri.startsWith("persona:")) {
    const personaId = ttsVoiceUri.replace("persona:", "");
    const persona = VOICE_PERSONAS.find((p) => p.id === personaId);
    if (persona) {
      const isMale = persona.gender === "male";
      const isFemale = persona.gender === "female";

      const isKnownFemaleVoice = (v: SpeechSynthesisVoice) =>
        /female|woman|girl|zira|swara|kalpana|neerja|heera|susan|hazel|jenny|sonia|fatima|zoya|pari|ayesha|veena/i.test(v.name);

      const isKnownMaleVoice = (v: SpeechSynthesisVoice) =>
        /male|man|boy|guy|david|george|mark|ravi|prabhat|madhur|rohan|james|tariq|hamdan|asad|bilal|aryan|alex|gul|sameer|hamza/i.test(v.name);

      // Pass 1: Match preferred keywords with strict gender filter
      for (const kw of persona.preferredKeywords) {
        const match = voices.find((v) => {
          const nameMatches = v.name.toLowerCase().includes(kw) || v.voiceURI.toLowerCase().includes(kw);
          if (!nameMatches) return false;
          if (isMale && isKnownFemaleVoice(v)) return false;
          if (isFemale && isKnownMaleVoice(v)) return false;
          return true;
        });
        if (match) return match;
      }

      // Pass 2: If male, look for any male voice in matching languages
      if (isMale) {
        for (const lc of persona.langCodes) {
          const maleLangMatch = voices.find(
            (v) => v.lang.toLowerCase().startsWith(lc.toLowerCase()) && isKnownMaleVoice(v) && !isKnownFemaleVoice(v)
          );
          if (maleLangMatch) return maleLangMatch;
        }

        // If persona prefers Urdu / Desi languages, prioritize Urdu or Hindi voices before foreign English
        const isDesiPersona = persona.langCodes.some((lc) => lc.startsWith("ur") || lc.startsWith("hi"));
        if (isDesiPersona) {
          const desiUrduOrHindi = voices.find(
            (v) => (v.lang.toLowerCase().startsWith("ur") || v.lang.toLowerCase().startsWith("hi")) && !isKnownFemaleVoice(v)
          );
          if (desiUrduOrHindi) return desiUrduOrHindi;
        }

        // Check for any Desi/Indian English male voice
        const anyDesiMale = voices.find(
          (v) => (v.lang.toLowerCase().startsWith("en-in") || v.lang.toLowerCase().startsWith("hi")) && !isKnownFemaleVoice(v)
        );
        if (anyDesiMale) return anyDesiMale;

        // Check for any English or system male voice
        const anyMale = voices.find((v) => isKnownMaleVoice(v) && !isKnownFemaleVoice(v));
        if (anyMale) return anyMale;
      }

      // Pass 3: If female, look for female voice in matching languages
      if (isFemale) {
        for (const lc of persona.langCodes) {
          const femaleLangMatch = voices.find(
            (v) => v.lang.toLowerCase().startsWith(lc.toLowerCase()) && isKnownFemaleVoice(v) && !isKnownMaleVoice(v)
          );
          if (femaleLangMatch) return femaleLangMatch;
        }

        const isDesiPersona = persona.langCodes.some((lc) => lc.startsWith("ur") || lc.startsWith("hi"));
        if (isDesiPersona) {
          const desiUrduOrHindi = voices.find(
            (v) => (v.lang.toLowerCase().startsWith("ur") || v.lang.toLowerCase().startsWith("hi")) && !isKnownMaleVoice(v)
          );
          if (desiUrduOrHindi) return desiUrduOrHindi;
        }

        for (const lc of persona.langCodes) {
          const femaleLangMatch = voices.find(
            (v) => v.lang.toLowerCase().startsWith(lc.toLowerCase()) && !isKnownMaleVoice(v)
          );
          if (femaleLangMatch) return femaleLangMatch;
        }

        const anyFemale = voices.find((v) => isKnownFemaleVoice(v) && !isKnownMaleVoice(v));
        if (anyFemale) return anyFemale;
      }

      // Pass 4: Fallback to language code
      for (const lc of persona.langCodes) {
        const match = voices.find((v) => v.lang.toLowerCase().startsWith(lc.toLowerCase()));
        if (match) return match;
      }
    }
  }

  // 2. Explicit user selected specific voiceURI
  if (ttsVoiceUri && ttsVoiceUri !== "default" && !ttsVoiceUri.startsWith("persona:")) {
    const found = voices.find((v) => v.voiceURI === ttsVoiceUri);
    if (found) return found;
  }

  // 3. Language role / accent matching
  if (languageRole === "ur-roman") {
    // If text has native Perso-Arabic script, prefer Urdu/Arabic voice
    const hasUrduScript = sampleText ? /[\u0600-\u06FF]/.test(sampleText) : false;
    if (hasUrduScript) {
      const urVoice = voices.find((v) => v.lang.toLowerCase().startsWith("ur") || v.lang.toLowerCase().startsWith("ar"));
      if (urVoice) return urVoice;
    }

    // For Roman Urdu in Latin script, Indian/Hindustani neural voices pronounce it naturally!
    const desiVoice = voices.find(
      (v) =>
        v.name.toLowerCase().includes("swara") ||
        v.name.toLowerCase().includes("madhur") ||
        v.name.toLowerCase().includes("kalpana") ||
        v.name.toLowerCase().includes("neerja") ||
        v.name.toLowerCase().includes("google हिन्दी") ||
        v.lang.toLowerCase().startsWith("hi") ||
        v.lang.toLowerCase() === "en-in" ||
        v.lang.toLowerCase() === "en_in"
    );
    if (desiVoice) return desiVoice;

    const fallbackUr = voices.find((v) => v.lang.toLowerCase().startsWith("ur"));
    if (fallbackUr) return fallbackUr;
  } else if (languageRole === "ur-PK" || languageRole === "ur") {
    const urVoice = voices.find((v) => v.lang.toLowerCase().startsWith("ur"));
    if (urVoice) return urVoice;
    const arVoice = voices.find((v) => v.lang.toLowerCase().startsWith("ar"));
    if (arVoice) return arVoice;
    const hiVoice = voices.find((v) => v.lang.toLowerCase().startsWith("hi"));
    if (hiVoice) return hiVoice;
  } else if (languageRole === "hi-IN" || languageRole === "hi") {
    const hiVoice = voices.find((v) => v.lang.toLowerCase().startsWith("hi"));
    if (hiVoice) return hiVoice;
  } else if (languageRole === "ar-SA" || languageRole === "ar-AE" || languageRole === "ar") {
    const arVoice = voices.find((v) => v.lang.toLowerCase().startsWith("ar"));
    if (arVoice) return arVoice;
  } else if (languageRole === "es-ES" || languageRole === "es") {
    const esVoice = voices.find((v) => v.lang.toLowerCase().startsWith("es"));
    if (esVoice) return esVoice;
  } else if (languageRole === "fr-FR" || languageRole === "fr") {
    const frVoice = voices.find((v) => v.lang.toLowerCase().startsWith("fr"));
    if (frVoice) return frVoice;
  } else if (languageRole === "de-DE" || languageRole === "de") {
    const deVoice = voices.find((v) => v.lang.toLowerCase().startsWith("de"));
    if (deVoice) return deVoice;
  } else if (languageRole === "zh-CN" || languageRole === "zh") {
    const zhVoice = voices.find((v) => v.lang.toLowerCase().startsWith("zh"));
    if (zhVoice) return zhVoice;
  } else if (languageRole === "tr-TR" || languageRole === "tr") {
    const trVoice = voices.find((v) => v.lang.toLowerCase().startsWith("tr"));
    if (trVoice) return trVoice;
  } else if (languageRole === "ja-JP" || languageRole === "ja") {
    const jaVoice = voices.find((v) => v.lang.toLowerCase().startsWith("ja"));
    if (jaVoice) return jaVoice;
  } else if (languageRole === "en-GB") {
    const gbVoice = voices.find((v) => v.lang.toLowerCase() === "en-gb" || v.lang.toLowerCase() === "en_gb");
    if (gbVoice) return gbVoice;
  } else if (languageRole === "en-IN") {
    const inVoice = voices.find((v) => v.lang.toLowerCase() === "en-in" || v.lang.toLowerCase() === "en_in");
    if (inVoice) return inVoice;
  } else if (languageRole === "en-US") {
    const enVoice = voices.find(
      (v) =>
        (v.name.includes("Natural") || v.name.includes("Google") || v.name.includes("Premium") || v.name.includes("Online")) &&
        v.lang.toLowerCase().startsWith("en")
    );
    if (enVoice) return enVoice;
    const exactEn = voices.find((v) => v.lang.toLowerCase() === "en-us" || v.lang.toLowerCase() === "en_us");
    if (exactEn) return exactEn;
  }

  // 4. Script-based content auto-detection
  const isUrduScript = sampleText ? /[\u0600-\u06FF]/.test(sampleText) : false;
  if (isUrduScript) {
    const urVoice = voices.find(
      (v) => v.lang.toLowerCase().startsWith("ur") || v.lang.toLowerCase().startsWith("ar") || v.lang.toLowerCase().startsWith("hi")
    );
    if (urVoice) return urVoice;
  }

  const isHindiScript = sampleText ? /[\u0900-\u097F]/.test(sampleText) : false;
  if (isHindiScript) {
    const hiVoice = voices.find((v) => v.lang.toLowerCase().startsWith("hi"));
    if (hiVoice) return hiVoice;
  }

  // 5. Default: High quality natural English voice (Auto-Detect defaults to English)
  const naturalEn = voices.find(
    (v) =>
      (v.name.includes("Natural") || v.name.includes("Google") || v.name.includes("Premium") || v.name.includes("Neural")) &&
      v.lang.toLowerCase().startsWith("en")
  );
  if (naturalEn) return naturalEn;

  const browserLang = typeof navigator !== "undefined" ? navigator.language : "en-US";
  const exactLang = voices.find((v) => v.lang === browserLang);
  if (exactLang) return exactLang;

  const anyEn = voices.find((v) => v.lang.toLowerCase().startsWith("en"));
  if (anyEn) return anyEn;

  return voices[0] || null;
}
