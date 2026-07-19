---
kind: business_term
name: Business Glossary
category: business_term
scope:
    - '**'
---

### BYOK
- Definition：Bring Your Own Key — the feature that lets users register their own third-party provider API keys (OpenAI, Anthropic, Google, Meta, DeepSeek) in the dashboard so all traffic is routed through their personal accounts rather than CheapModels' own credits.
- Aliases：bring your own key

### CheapModels
- Definition：Internal product name for this unified AI API gateway. It exposes a single OpenAI-compatible endpoint (`/v1/chat/completions`) backed by multiple downstream providers, letting developers swap models by changing only the `model` field.

### Canned reply
- Definition：The placeholder chat behavior where the backend returns pre-written text snippets from a fixed list instead of calling a real provider. Used while the real provider proxy is still pending; the README explicitly notes responses are canned/mocked server-side.
- Aliases：fakeModelReply、mocked response
