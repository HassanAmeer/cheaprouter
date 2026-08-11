export const ALL_PROVIDERS_INFO = [
  {
    "name": "Google Gemini",
    "tag": "FREE TIER",
    "tagColor": "#10B981",
    "hasFree": true,
    "website": "[https://aistudio.google.com/](https://aistudio.google.com/)",
    "status": "Free tier: model-specific RPM/RPD/TPM, 1M Ctx on Flash family; exact active quotas shown in AI Studio",
    "models": [
      {
        "name": "Gemini 3.6 Flash",
        "id": "gemini-3.6-flash",
        "badges": [
          "Text / Vision / Audio / Video",
          "1M Ctx"
        ],
        "limit": "Free / dashboard quota"
      },
      {
        "name": "Gemini 3.5 Flash",
        "id": "gemini-3.5-flash",
        "badges": [
          "Text / Vision / Audio / Video",
          "1M Ctx"
        ],
        "limit": "Free / dashboard quota"
      },
      {
        "name": "Gemini 3.5 Flash-Lite",
        "id": "gemini-3.5-flash-lite",
        "badges": [
          "Text / Vision / Audio / Video",
          "1M Ctx"
        ],
        "limit": "Free / dashboard quota"
      },
      {
        "name": "Gemini 3.1 Flash-Lite",
        "id": "gemini-3.1-flash-lite",
        "badges": [
          "Text / Vision / Audio / Video",
          "1M Ctx"
        ],
        "limit": "Free / dashboard quota"
      },
      {
        "name": "Gemini 2.5 Flash",
        "id": "gemini-2.5-flash",
        "badges": [
          "Text / Vision / Audio / Video",
          "1M Ctx"
        ],
        "limit": "10 RPM / 250 RPD / 250K TPM"
      },
      {
        "name": "Gemini 2.5 Flash-Lite",
        "id": "gemini-2.5-flash-lite",
        "badges": [
          "Text / Vision / Audio / Video",
          "1M Ctx"
        ],
        "limit": "15 RPM / 1K RPD"
      }
    ]
  },
  {
    "name": "Groq",
    "tag": "BETA TIER",
    "tagColor": "#3B82F6",
    "hasFree": true,
    "website": "[https://console.groq.com/](https://console.groq.com/)",
    "status": "Free plan: 30 RPM / model-specific RPD / 6K-12K TPM / 100K-500K TPD; 128K-131K Ctx",
    "models": [
      {
        "name": "GPT OSS 120B",
        "id": "openai/gpt-oss-120b",
        "badges": [
          "Text / Reasoning",
          "131K Ctx"
        ],
        "limit": "30 RPM / 1K RPD / 8K TPM / 200K TPD"
      },
      {
        "name": "GPT OSS 20B",
        "id": "openai/gpt-oss-20b",
        "badges": [
          "Text / Reasoning",
          "131K Ctx"
        ],
        "limit": "30 RPM / 1K RPD / 8K TPM / 200K TPD"
      },
      {
        "name": "Llama 3.3 70B",
        "id": "llama-3.3-70b-versatile",
        "badges": [
          "Text",
          "131K Ctx"
        ],
        "limit": "30 RPM / 1K RPD / 12K TPM / 100K TPD"
      },
      {
        "name": "GPT OSS Safeguard 20B",
        "id": "openai/gpt-oss-safeguard-20b",
        "badges": [
          "Text / Safety",
          "131K Ctx"
        ],
        "limit": "30 RPM / 1K RPD / 8K TPM / 200K TPD"
      },
      {
        "name": "Qwen 3.6 27B",
        "id": "qwen/qwen3.6-27b",
        "badges": [
          "Text / Reasoning",
          "131K Ctx"
        ],
        "limit": "30 RPM / 1K RPD / 8K TPM / 200K TPD"
      },
      {
        "name": "Llama 3.1 8B Instant",
        "id": "llama-3.1-8b-instant",
        "badges": [
          "Text",
          "128K Ctx"
        ],
        "limit": "30 RPM / 14.4K RPD / 6K TPM / 500K TPD"
      }
    ]
  },
  {
    "name": "OpenRouter",
    "tag": "FREE VARIANTS",
    "tagColor": "#8B5CF6",
    "hasFree": true,
    "website": "[https://openrouter.ai/](https://openrouter.ai/)",
    "status": "Free plan: 50 RPD platform cap; free-model RPM varies by model/provider; free models only; Ctx varies",
    "models": [
      {
        "name": "DeepSeek V4 Flash Free",
        "id": "deepseek/deepseek-v4-flash:free",
        "badges": [
          "Text / Reasoning / Coding",
          "1M Ctx"
        ],
        "limit": "50 RPD / provider limits"
      },
      {
        "name": "NVIDIA Nemotron 3 Ultra Free",
        "id": "nvidia/nemotron-3-ultra-550b-a55b:free",
        "badges": [
          "Text / Reasoning",
          "1M Ctx"
        ],
        "limit": "50 RPD / provider limits"
      },
      {
        "name": "NVIDIA Nemotron 3 Super Free",
        "id": "nvidia/nemotron-3-super-120b-a12b:free",
        "badges": [
          "Text / Reasoning",
          "262K Ctx"
        ],
        "limit": "50 RPD / provider limits"
      },
      {
        "name": "NVIDIA Nemotron 3.5 Content Safety Free",
        "id": "nvidia/nemotron-3.5-content-safety:free",
        "badges": [
          "Text / Vision / Safety",
          "128K Ctx"
        ],
        "limit": "50 RPD / provider limits"
      },
      {
        "name": "Poolside Laguna S 2.1 Free",
        "id": "poolside/laguna-s-2.1:free",
        "badges": [
          "Text / Coding",
          "262K Ctx"
        ],
        "limit": "50 RPD / provider limits"
      },
      {
        "name": "Ling 3.0 Tiny Free",
        "id": "inclusionai/ling-3.0-tiny:free",
        "badges": [
          "Text / Reasoning",
          "262K Ctx"
        ],
        "limit": "50 RPD / provider limits"
      },
      {
        "name": "Free Models Router",
        "id": "openrouter/free",
        "badges": [
          "Text / Multimodal"
        ],
        "limit": "50 RPD / dynamic routing"
      }
    ]
  },
  {
    "name": "Mistral AI",
    "tag": "FREE EXPERIMENT",
    "tagColor": "#F97316",
    "hasFree": true,
    "website": "[https://console.mistral.ai/](https://console.mistral.ai/)",
    "status": "Free Experiment tier: ~1 req/s / monthly token allowance; exact limits account-specific; Ctx model-specific",
    "models": [
      {
        "name": "Mistral Small 3.2",
        "id": "mistral-small-2506",
        "badges": [
          "Text / Vision",
          "128K Ctx"
        ],
        "limit": "Experiment / account quota"
      },
      {
        "name": "Codestral",
        "id": "codestral-2501",
        "badges": [
          "Text / Code",
          "256K Ctx"
        ],
        "limit": "Experiment / account quota"
      },
      {
        "name": "Devstral Small",
        "id": "devstral-small-2505",
        "badges": [
          "Text / Code",
          "128K Ctx"
        ],
        "limit": "Experiment / account quota"
      }
    ]
  },
  {
    "name": "Nvidia NIM",
    "tag": "FREE DEV TIER",
    "tagColor": "#76B900",
    "hasFree": true,
    "website": "[https://build.nvidia.com/](https://build.nvidia.com/)",
    "status": "Free NVIDIA-hosted endpoints: commonly ~40 RPM/account; no published RPD/TPM guarantee; Ctx model-specific",
    "models": [
      {
        "name": "Nemotron 3 Ultra",
        "id": "nvidia/nemotron-3-ultra-550b-a55b",
        "badges": [
          "Text / Reasoning",
          "1M Ctx"
        ],
        "limit": "~40 RPM / account"
      },
      {
        "name": "Nemotron 3 Super",
        "id": "nvidia/nemotron-3-super-120b-a12b",
        "badges": [
          "Text / Reasoning",
          "1M Ctx"
        ],
        "limit": "~40 RPM / account"
      },
      {
        "name": "Nemotron 3 Nano 30B A3B",
        "id": "nvidia/nemotron-3-nano-30b-a3b",
        "badges": [
          "Text / Reasoning",
          "256K Ctx"
        ],
        "limit": "~40 RPM / account"
      },
      {
        "name": "Nemotron Nano 9B V2",
        "id": "nvidia/nemotron-nano-9b-v2",
        "badges": [
          "Text / Reasoning",
          "128K Ctx"
        ],
        "limit": "~40 RPM / account"
      },
      {
        "name": "GPT OSS 120B",
        "id": "openai/gpt-oss-120b",
        "badges": [
          "Text / Reasoning",
          "131K Ctx"
        ],
        "limit": "~40 RPM / account"
      },
      {
        "name": "GPT OSS 20B",
        "id": "openai/gpt-oss-20b",
        "badges": [
          "Text / Reasoning",
          "131K Ctx"
        ],
        "limit": "~40 RPM / account"
      }
    ]
  },
  {
    "name": "SiliconFlow",
    "tag": "FREE TIER",
    "tagColor": "#06B6D4",
    "hasFree": true,
    "website": "[https://siliconflow.cn/](https://siliconflow.cn/)",
    "status": "Free models: $0 inference; RPM/RPD/TPM not publicly fixed; model/account quotas apply; Ctx model-specific",
    "models": [
      {
        "name": "Qwen3.5 4B",
        "id": "Qwen/Qwen3.5-4B",
        "badges": [
          "Text / Vision / Reasoning"
        ],
        "limit": "$0 / account quota"
      },
      {
        "name": "PaddleOCR-VL 1.5",
        "id": "PaddlePaddle/PaddleOCR-VL-1.5",
        "badges": [
          "Vision / OCR"
        ],
        "limit": "$0 / account quota"
      },
      {
        "name": "DeepSeek R1 Distill Qwen 7B",
        "id": "deepseek-ai/DeepSeek-R1-Distill-Qwen-7B",
        "badges": [
          "Text / Reasoning"
        ],
        "limit": "$0 / account quota"
      },
      {
        "name": "GLM-4.1V-9B-Thinking",
        "id": "THUDM/GLM-4.1V-9B-Thinking",
        "badges": [
          "Text / Vision / Reasoning"
        ],
        "limit": "$0 / account quota"
      },
      {
        "name": "DeepSeek OCR",
        "id": "deepseek-ai/DeepSeek-OCR",
        "badges": [
          "Vision / OCR"
        ],
        "limit": "$0 / account quota"
      },
      {
        "name": "Qwen3 8B",
        "id": "Qwen/Qwen3-8B",
        "badges": [
          "Text / Reasoning"
        ],
        "limit": "$0 / account quota"
      },
      {
        "name": "Hunyuan-MT 7B",
        "id": "tencent/Hunyuan-MT-7B",
        "badges": [
          "Text / Translation"
        ],
        "limit": "$0 / account quota"
      }
    ]
  },
  {
    "name": "ModelScope",
    "tag": "FREE API",
    "tagColor": "#8B5CF6",
    "hasFree": true,
    "website": "[https://modelscope.cn/](https://modelscope.cn/)",
    "status": "Free API-Inference available; RPM/RPD/TPM not publicly fixed; account/model quota; Ctx model-specific",
    "models": [
      {
        "name": "Qwen3 32B",
        "id": "Qwen/Qwen3-32B",
        "badges": [
          "Text / Reasoning"
        ],
        "limit": "Free API / account quota"
      },
      {
        "name": "Qwen3 235B A22B Instruct 2507",
        "id": "Qwen/Qwen3-235B-A22B-Instruct-2507",
        "badges": [
          "Text / Reasoning"
        ],
        "limit": "Free API / account quota"
      },
      {
        "name": "Qwen3 Coder 480B A35B",
        "id": "Qwen/Qwen3-Coder-480B-A35B-Instruct",
        "badges": [
          "Text / Coding"
        ],
        "limit": "Free API / account quota"
      }
    ]
  },
  {
    "name": "HuggingFace",
    "tag": "SERVERLESS",
    "tagColor": "#F59E0B",
    "hasFree": true,
    "website": "[https://huggingface.co/](https://huggingface.co/)",
    "status": "Free users: $0.10/month Inference Providers credit; no fixed RPM/RPD/TPM; Ctx model/provider-specific",
    "models": [
      {
        "name": "DeepSeek V3 0324",
        "id": "deepseek-ai/DeepSeek-V3-0324",
        "badges": [
          "Text / Reasoning"
        ],
        "limit": "$0.10/mo credit / provider limits"
      },
      {
        "name": "Qwen3 Coder 480B A35B",
        "id": "Qwen/Qwen3-Coder-480B-A35B-Instruct",
        "badges": [
          "Text / Code"
        ],
        "limit": "$0.10/mo credit / provider limits"
      }
    ]
  },
  {
    "name": "GitHub Models",
    "tag": "FREE BETA",
    "tagColor": "#EC4899",
    "hasFree": true,
    "website": "[https://github.com/marketplace/models](https://github.com/marketplace/models)",
    "status": "Free tier: 15 RPM low-tier models; RPD/model quota varies; tokens/request + concurrency limits; Ctx model-specific",
    "models": [
      {
        "name": "GPT-4.1",
        "id": "openai/gpt-4.1",
        "badges": [
          "Text / Vision",
          "1M Ctx"
        ],
        "limit": "15 RPM / model quota"
      },
      {
        "name": "GPT-4o",
        "id": "openai/gpt-4o",
        "badges": [
          "Text / Vision",
          "128K Ctx"
        ],
        "limit": "15 RPM / model quota"
      },
      {
        "name": "Phi-4",
        "id": "microsoft/phi-4",
        "badges": [
          "Text",
          "16K Ctx"
        ],
        "limit": "15 RPM / model quota"
      },
      {
        "name": "Llama 3.3 70B Instruct",
        "id": "meta/llama-3.3-70b-instruct",
        "badges": [
          "Text",
          "128K Ctx"
        ],
        "limit": "15 RPM / model quota"
      }
    ]
  },
  {
    "name": "OpenCode",
    "tag": "FREE TIER",
    "tagColor": "#14B8A6",
    "hasFree": true,
    "website": "[https://opencode.ai/](https://opencode.ai/)",
    "status": "Free models: temporary/free promotions; RPM/RPD/TPM not publicly fixed; limits can change; Ctx model-specific",
    "models": [
      {
        "name": "DeepSeek V4 Flash Free",
        "id": "deepseek-v4-flash-free",
        "badges": [
          "Text / Reasoning / Code"
        ],
        "limit": "Free / dynamic quota"
      },
      {
        "name": "MiMo-V2.5 Free",
        "id": "mimo-v2.5-free",
        "badges": [
          "Text / Reasoning / Code"
        ],
        "limit": "Free / dynamic quota"
      },
      {
        "name": "Laguna S 2.1 Free",
        "id": "laguna-s-2.1-free",
        "badges": [
          "Text / Code"
        ],
        "limit": "Free / dynamic quota"
      },
      {
        "name": "Ling-3.0-flash Free",
        "id": "ling-3.0-flash-free",
        "badges": [
          "Text / Code"
        ],
        "limit": "Free / dynamic quota"
      },
      {
        "name": "North Mini Code Free",
        "id": "north-mini-code-free",
        "badges": [
          "Text / Code"
        ],
        "limit": "Free / dynamic quota"
      },
      {
        "name": "Nemotron 3 Ultra Free",
        "id": "nemotron-3-ultra-free",
        "badges": [
          "Text / Reasoning / Code",
          "1M Ctx"
        ],
        "limit": "Free / dynamic quota"
      },
      {
        "name": "Big Pickle",
        "id": "big-pickle",
        "badges": [
          "Text / Code"
        ],
        "limit": "Free / dynamic quota"
      }
    ]
  },
  {
    "name": "Cohere",
    "tag": "TRIAL KEY",
    "tagColor": "#39594D",
    "hasFree": true,
    "website": "[https://dashboard.cohere.com/](https://dashboard.cohere.com/)",
    "status": "Trial key: 20 RPM / 1K calls/mo; TPM/RPD not separately published; Ctx 128K-256K",
    "models": [
      {
        "name": "Command A",
        "id": "command-a-03-2025",
        "badges": [
          "Text",
          "256K Ctx"
        ],
        "limit": "20 RPM / 1K calls/mo"
      },
      {
        "name": "Command A Reasoning",
        "id": "command-a-reasoning-08-2025",
        "badges": [
          "Text / Reasoning",
          "4K Ctx"
        ],
        "limit": "20 RPM / 1K calls/mo"
      },
      {
        "name": "Command R7B",
        "id": "command-r7b-12-2024",
        "badges": [
          "Text",
          "128K Ctx"
        ],
        "limit": "20 RPM / 1K calls/mo"
      }
    ]
  },
  {
    "name": "Cerebras",
    "tag": "FREE BETA",
    "tagColor": "#FF4F00",
    "hasFree": true,
    "website": "[https://inference.cerebras.ai/](https://inference.cerebras.ai/)",
    "status": "Free plan: 5 RPM / 30K TPM / 1M TPD for listed models; RPD not separately published; Ctx ~131K",
    "models": [
      {
        "name": "GPT OSS 120B",
        "id": "gpt-oss-120b",
        "badges": [
          "Text / Reasoning",
          "131K Ctx"
        ],
        "limit": "5 RPM / 30K TPM / 1M TPD"
      },
      {
        "name": "ZAI GLM 4.7",
        "id": "zai-glm-4.7",
        "badges": [
          "Text / Reasoning",
          "128K Ctx"
        ],
        "limit": "5 RPM / 30K TPM / 1M TPD"
      },
      {
        "name": "Gemma 4 31B",
        "id": "gemma-4-31b",
        "badges": [
          "Text / Vision",
          "131K Ctx"
        ],
        "limit": "5 RPM / 30K TPM / 1M TPD"
      }
    ]
  },
  {
    "name": "SambaNova",
    "tag": "FREE CLOUD",
    "tagColor": "#9333EA",
    "hasFree": true,
    "website": "[https://cloud.sambanova.ai/](https://cloud.sambanova.ai/)",
    "status": "Free API: 20 RPM / 20 RPD / 200K TPD on listed free models; TPM not separately published; Ctx model-specific",
    "models": [
      {
        "name": "DeepSeek V3.1",
        "id": "DeepSeek-V3.1",
        "badges": [
          "Text / Reasoning",
          "128K Ctx"
        ],
        "limit": "20 RPM / 20 RPD / 200K TPD"
      },
      {
        "name": "Llama 3.3 70B Instruct",
        "id": "Meta-Llama-3.3-70B-Instruct",
        "badges": [
          "Text",
          "128K Ctx"
        ],
        "limit": "20 RPM / 20 RPD / 200K TPD"
      },
      {
        "name": "GPT OSS 120B",
        "id": "gpt-oss-120b",
        "badges": [
          "Text / Reasoning",
          "131K Ctx"
        ],
        "limit": "20 RPM / 20 RPD / 200K TPD"
      }
    ]
  },
  {
    "name": "AI Horde",
    "tag": "CROWDSOURCED",
    "tagColor": "#64748B",
    "hasFree": true,
    "website": "[https://aihorde.net/](https://aihorde.net/)",
    "status": "Free crowdsourced inference: no fixed RPM/RPD/TPM; dynamic worker queue/priority; Ctx varies by model",
    "models": [
      {
        "name": "Llama 3.1 8B Instruct",
        "id": "meta-llama/Llama-3.1-8B-Instruct",
        "badges": [
          "Text"
        ],
        "limit": "Free / dynamic queue"
      }
    ]
  },
  {
    "name": "Pollinations",
    "tag": "OPEN API",
    "tagColor": "#F43F5E",
    "hasFree": true,
    "website": "[https://pollinations.ai/](https://pollinations.ai/)",
    "status": "Free/community access varies by key/account/model; no fixed public RPM/RPD/TPM; model Ctx varies",
    "models": [
      {
        "name": "Gemini 3 Flash",
        "id": "gemini-3-flash",
        "badges": [
          "Text / Vision"
        ],
        "limit": "Free access / dynamic"
      },
      {
        "name": "Gemini Flash Lite 3.1",
        "id": "gemini-flash-lite-3.1",
        "badges": [
          "Text / Vision"
        ],
        "limit": "Free access / dynamic"
      },
      {
        "name": "Mistral Small 3.2",
        "id": "mistral-small-3.2",
        "badges": [
          "Text / Vision"
        ],
        "limit": "Free access / dynamic"
      },
      {
        "name": "Qwen Coder",
        "id": "qwen-coder",
        "badges": [
          "Text / Code"
        ],
        "limit": "Free access / dynamic"
      },
      {
        "name": "DeepSeek",
        "id": "deepseek",
        "badges": [
          "Text / Reasoning"
        ],
        "limit": "Free access / dynamic"
      }
    ]
  },
  {
    "name": "Bytez",
    "tag": "FREE TIER",
    "tagColor": "#6366F1",
    "hasFree": true,
    "website": "[https://bytez.com/](https://bytez.com/)",
    "status": "Free plan: 7B open models / 1 concurrent open request / 10 req/s closed models; credits refresh every 4 weeks",
    "models": [
      {
        "name": "Qwen 2.5 7B Instruct",
        "id": "Qwen/Qwen2.5-7B-Instruct",
        "badges": [
          "Text",
          "7B"
        ],
        "limit": "1 concurrent / 4-week credits"
      },
      {
        "name": "Llama 3.1 8B Instruct",
        "id": "meta-llama/Llama-3.1-8B-Instruct",
        "badges": [
          "Text",
          "8B"
        ],
        "limit": "Paid / >7B limit"
      }
    ]
  },
  {
    "name": "TokenRouter",
    "tag": "FREE PROMOS",
    "tagColor": "#8B5CF6",
    "hasFree": false,
    "website": "[https://tokenrouter.ai/](https://tokenrouter.ai/)",
    "status": "No verified permanent free inference tier; paid routing platform / free-plan features only",
    "models": []
  },
  {
    "name": "Zai",
    "tag": "FREE TIER",
    "tagColor": "#EF4444",
    "hasFree": true,
    "website": "[https://bigmodel.cn/](https://bigmodel.cn/)",
    "status": "Free Flash models: RPM/RPD/TPM not publicly fixed; account/model quota; Ctx model-specific",
    "models": [
      {
        "name": "GLM-4.7-Flash",
        "id": "glm-4.7-flash",
        "badges": [
          "Text / Reasoning"
        ],
        "limit": "Free / account quota"
      },
      {
        "name": "GLM-4.6V-Flash",
        "id": "glm-4.6v-flash",
        "badges": [
          "Text / Vision / Reasoning"
        ],
        "limit": "Free / account quota"
      }
    ]
  },
  {
    "name": "KiloCode",
    "tag": "FREE EXTENSION",
    "tagColor": "#000000",
    "hasFree": true,
    "website": "[https://kilo.ai/](https://kilo.ai/)",
    "status": "Free models: 200 requests/hour/IP; no fixed RPD/TPM; Ctx varies by routed model",
    "models": [
      {
        "name": "Step 3.7 Flash Free",
        "id": "stepfun/step-3.7-flash:free",
        "badges": [
          "Text / Vision / Reasoning"
        ],
        "limit": "200 requests/hour/IP"
      },
      {
        "name": "Laguna M.1 Free",
        "id": "poolside/laguna-m.1:free",
        "badges": [
          "Text / Code"
        ],
        "limit": "200 requests/hour/IP"
      },
      {
        "name": "Nemotron 3 Ultra Free",
        "id": "nvidia/nemotron-3-ultra-550b-a55b:free",
        "badges": [
          "Text / Reasoning",
          "1M Ctx"
        ],
        "limit": "200 requests/hour/IP"
      },
      {
        "name": "Gemma 4 26B A4B Free",
        "id": "google/gemma-4-26b-a4b-it:free",
        "badges": [
          "Text / Vision / Reasoning"
        ],
        "limit": "200 requests/hour/IP"
      },
      {
        "name": "Auto Free",
        "id": "kilo-auto/free",
        "badges": [
          "Text / Code"
        ],
        "limit": "200 requests/hour/IP"
      }
    ]
  },
  {
    "name": "UnoRouter",
    "tag": "FREE PROXY",
    "tagColor": "#4ADE80",
    "hasFree": true,
    "website": "[https://unorouter.com/](https://unorouter.com/)",
    "status": "Free proxy aggregation: upstream RPM/RPD/TPM/TPD vary by provider; no single fixed platform quota",
    "models": [
      {
        "name": "Free Model Pool",
        "id": "free",
        "badges": [
          "Text / Multimodal"
        ],
        "limit": "Upstream-dependent"
      }
    ]
  },
  {
    "name": "LLM7",
    "tag": "FREE ENDPOINT",
    "tagColor": "#3B82F6",
    "hasFree": true,
    "website": "[https://llm7.com/](https://llm7.com/)",
    "status": "Free token: 2 req/s / 20 RPM / 250 RPH / 1M tokens/day; no fixed RPD beyond token cap; Ctx model-specific",
    "models": [
      {
        "name": "Free Model Pool",
        "id": "free",
        "badges": [
          "Text"
        ],
        "limit": "2 RPS / 20 RPM / 250 RPH / 1M TPD"
      }
    ]
  },
  {
    "name": "Poixe",
    "tag": "FREE PROXY",
    "tagColor": "#3B82F6",
    "hasFree": true,
    "website": "[https://poixe.com/](https://poixe.com/)",
    "status": "Free API: large models 2 RPM/5 RPD; small models 20 RPM/50 RPD; CLI2API 10-20 RPM with 2M-10M TPD",
    "models": [
      {
        "name": "Claude 3.5 Haiku Free",
        "id": "claude-3-5-haiku-20241022:free",
        "badges": [
          "Text / Code",
          "200K Ctx"
        ],
        "limit": "20 RPM / 50 RPD / 4K+4K"
      },
      {
        "name": "Claude Sonnet 4.6 Free",
        "id": "cli2api/claude-sonnet-4-6:free",
        "badges": [
          "Text / Code",
          "200K Ctx"
        ],
        "limit": "10 RPM / 200 RPD / 100K TPM / 2M TPD"
      },
      {
        "name": "GPT 5.3 Codex Free",
        "id": "cli2api/gpt-5.3-codex:free",
        "badges": [
          "Text / Code"
        ],
        "limit": "20 RPM / 1K RPD / 200K TPM / 10M TPD"
      }
    ]
  },
  {
    "name": "Zenmux",
    "tag": "FREE TIER",
    "tagColor": "#8B5CF6",
    "hasFree": true,
    "website": "[https://zenmux.ai/](https://zenmux.ai/)",
    "status": "Free-model access exists; RPM/RPD/TPM/TPD vary by model/plan; Ctx model-specific; exact quota dashboard/API",
    "models": [
      {
        "name": "GLM 4.7 Flash Free",
        "id": "z-ai/glm-4.7-flash-free",
        "badges": [
          "Text / Reasoning / Code"
        ],
        "limit": "Free / plan quota"
      },
      {
        "name": "GLM 4.6V Flash Free",
        "id": "z-ai/glm-4.6v-flash-free",
        "badges": [
          "Text / Vision / Reasoning"
        ],
        "limit": "Free / plan quota"
      },
      {
        "name": "Step 3.5 Flash Free",
        "id": "stepfun/step-3.5-flash-free",
        "badges": [
          "Text / Reasoning"
        ],
        "limit": "Free / plan quota"
      },
      {
        "name": "MiMo V2 Flash Free",
        "id": "xiaomi/mimo-v2-flash-free",
        "badges": [
          "Text / Reasoning"
        ],
        "limit": "Free / plan quota"
      },
      {
        "name": "KAT Coder Pro V1 Free",
        "id": "kuaishou/kat-coder-pro-v1-free",
        "badges": [
          "Text / Code"
        ],
        "limit": "Free / plan quota"
      }
    ]
  },
  {
    "name": "Routeway",
    "tag": "FREE STARTER",
    "tagColor": "#10B981",
    "hasFree": true,
    "website": "[https://routeway.ai/](https://routeway.ai/)",
    "status": "Free models: 5 RPM / 200 RPD; TPM/TPD not published; Ctx model-specific",
    "models": [
      {
        "name": "Step 3.7 Flash",
        "id": "step-3-7-flash:free",
        "badges": [
          "Text / Vision"
        ],
        "limit": "5 RPM / 200 RPD"
      },
      {
        "name": "Gemma 4 31B",
        "id": "gemma-4-31b:free",
        "badges": [
          "Text / Vision / Reasoning",
          "256K Ctx"
        ],
        "limit": "5 RPM / 200 RPD"
      },
      {
        "name": "GPT OSS 120B",
        "id": "gpt-oss-120b:free",
        "badges": [
          "Text / Reasoning",
          "131K Ctx"
        ],
        "limit": "5 RPM / 200 RPD"
      },
      {
        "name": "Ling 3.0 Flash",
        "id": "ling-3.0-flash:free",
        "badges": [
          "Text / Coding",
          "262K Ctx"
        ],
        "limit": "5 RPM / 200 RPD"
      },
      {
        "name": "Nemotron Nano 9B V2",
        "id": "nemotron-nano-9b-v2:free",
        "badges": [
          "Text / Reasoning",
          "128K Ctx"
        ],
        "limit": "5 RPM / 200 RPD"
      },
      {
        "name": "Nemotron 3 Nano 30B A3B",
        "id": "nemotron-3-nano-30b-a3b:free",
        "badges": [
          "Text / Reasoning",
          "256K Ctx"
        ],
        "limit": "5 RPM / 200 RPD"
      },
      {
        "name": "Llama 3.3 70B Instruct",
        "id": "llama-3.3-70b-instruct:free",
        "badges": [
          "Text",
          "128K Ctx"
        ],
        "limit": "5 RPM / 200 RPD"
      }
    ]
  },
  {
    "name": "AgnesAI",
    "tag": "FREE MULTIMODAL",
    "tagColor": "#EC4899",
    "hasFree": false,
    "website": "[https://platform.agnes-ai.com/](https://platform.agnes-ai.com/)",
    "status": "No independently verified permanent free API tier/models found; catalog/access requires verification",
    "models": []
  },
  {
    "name": "TokenHarbor",
    "tag": "FREE PROXY",
    "tagColor": "#34D399",
    "hasFree": true,
    "website": "[https://tokenharbor.ai/](https://tokenharbor.ai/)",
    "status": "Free access confirmed for selected models; RPM/RPD/TPM/TPD and Ctx not publicly documented",
    "models": [
      {
        "name": "DeepSeek V4 Flash",
        "id": "deepseek-v4-flash",
        "badges": [
          "Text / Reasoning / Coding",
          "1M Ctx"
        ],
        "limit": "Free / undocumented quota"
      },
      {
        "name": "MiMo V2.5",
        "id": "mimo-v2.5",
        "badges": [
          "Text / Reasoning"
        ],
        "limit": "Free / undocumented quota"
      },
      {
        "name": "Kimi K3",
        "id": "kimi-k3",
        "badges": [
          "Text / Reasoning"
        ],
        "limit": "Free promo / undocumented quota"
      }
    ]
  },
  {
    "name": "OpenAI",
    "tag": "PAID ONLY",
    "tagColor": "#6B7280",
    "hasFree": false,
    "website": "[https://platform.openai.com/](https://platform.openai.com/)",
    "status": "Paid API only; no permanent free API tier / no free RPM-RPD-TPM-TPD quota",
    "models": []
  },
  {
    "name": "Anthropic",
    "tag": "PAID ONLY",
    "tagColor": "#6B7280",
    "hasFree": false,
    "website": "[https://console.anthropic.com/](https://console.anthropic.com/)",
    "status": "Paid API only; no permanent free API tier / no free RPM-RPD-TPM-TPD quota",
    "models": []
  },
  {
    "name": "DeepSeek",
    "tag": "PAID ONLY",
    "tagColor": "#6B7280",
    "hasFree": false,
    "website": "[https://platform.deepseek.com/](https://platform.deepseek.com/)",
    "status": "Paid API only; no permanent free API tier / no free RPM-RPD-TPM-TPD quota",
    "models": []
  },
  {
    "name": "Perplexity",
    "tag": "PAID ONLY",
    "tagColor": "#6B7280",
    "hasFree": false,
    "website": "[https://docs.perplexity.ai/](https://docs.perplexity.ai/)",
    "status": "Paid API only; no permanent free API tier / no free RPM-RPD-TPM-TPD quota",
    "models": []
  },
  {
    "name": "Together",
    "tag": "PAID ONLY",
    "tagColor": "#6B7280",
    "hasFree": false,
    "website": "[https://api.together.ai/](https://api.together.ai/)",
    "status": "Paid API; promotional/new-account credits are not a permanent free tier",
    "models": []
  },
  {
    "name": "Fireworks",
    "tag": "PAID ONLY",
    "tagColor": "#6B7280",
    "hasFree": false,
    "website": "[https://fireworks.ai/](https://fireworks.ai/)",
    "status": "Paid API; promotional credits are not a permanent free tier",
    "models": []
  },
  {
    "name": "XAI",
    "tag": "PAID ONLY",
    "tagColor": "#6B7280",
    "hasFree": false,
    "website": "[https://console.x.ai/](https://console.x.ai/)",
    "status": "Paid API only; no permanent free API RPM/RPD/TPM/TPD tier",
    "models": []
  },
  {
    "name": "Novita",
    "tag": "PAID ONLY",
    "tagColor": "#6B7280",
    "hasFree": false,
    "website": "[https://novita.ai/](https://novita.ai/)",
    "status": "Paid API; promotional credits/trials are not a permanent free tier",
    "models": []
  },
  {
    "name": "AIMLAPI",
    "tag": "PAID ONLY",
    "tagColor": "#6B7280",
    "hasFree": false,
    "website": "[https://aimlapi.com/](https://aimlapi.com/)",
    "status": "Paid API; no verified permanent free model quota",
    "models": []
  },
  {
    "name": "AmazonBedrock",
    "tag": "FREE CREDITS",
    "tagColor": "#6B7280",
    "hasFree": false,
    "website": "[https://aws.amazon.com/bedrock/](https://aws.amazon.com/bedrock/)",
    "status": "No permanent free Bedrock inference tier; AWS signup/promotional credits may cover usage; quotas are model/account/region-specific",
    "models": []
  },
  {
    "name": "Hyperbolic",
    "tag": "PAID ONLY",
    "tagColor": "#6B7280",
    "hasFree": false,
    "website": "[https://hyperbolic.xyz/](https://hyperbolic.xyz/)",
    "status": "Paid API; no verified permanent free inference tier",
    "models": []
  },
  {
    "name": "Moonshot",
    "tag": "PAID ONLY",
    "tagColor": "#6B7280",
    "hasFree": false,
    "website": "[https://platform.moonshot.cn/](https://platform.moonshot.cn/)",
    "status": "Paid API; no verified permanent free API tier",
    "models": []
  },
  {
    "name": "ai&",
    "tag": "PAID ONLY",
    "tagColor": "#6B7280",
    "hasFree": false,
    "website": "[https://api.aiand.com/](https://api.aiand.com/)",
    "status": "Paid API; no verified permanent free inference tier",
    "models": []
  },
  {
    "name": "ClineCode",
    "tag": "PAID ONLY",
    "tagColor": "#6B7280",
    "hasFree": false,
    "website": "[https://github.com/cline/cline](https://github.com/cline/cline)",
    "status": "Cline is software/client infrastructure, not a provider with its own permanent free hosted model API",
    "models": []
  },
  {
    "name": "StepFun",
    "tag": "PAID ONLY",
    "tagColor": "#6B7280",
    "hasFree": false,
    "website": "[https://platform.stepfun.ai/](https://platform.stepfun.ai/)",
    "status": "Paid API; free access may occur through third-party routers, not a verified permanent direct API tier",
    "models": []
  },
  {
    "name": "AnyRouter",
    "tag": "PAID ONLY",
    "tagColor": "#6B7280",
    "hasFree": false,
    "website": "[https://anyrouter.com/](https://anyrouter.com/)",
    "status": "No verified permanent free direct API tier; third-party/free promotions excluded",
    "models": []
  },
  {
    "name": "Meta",
    "tag": "PAID ONLY.",
    "tagColor": "#6B7280",
    "hasFree": false,
    "website": "[https://llama.meta.com/](https://llama.meta.com/)",
    "status": "Meta does not provide a permanent free hosted inference API; open weights are free to obtain/run, hosted API is provider-dependent",
    "models": []
  }
];
