---
kind: external_dependency
name: SQLite database (file-based, WAL mode)
slug: sqlite-bun
category: external_dependency
category_hints:
    - vendor_identity
scope:
    - '**'
---

Backend persistence is SQLite in WAL mode via the native `bun:sqlite` module (no npm package). The file is `backend/cheapmodels.db` created automatically on first run. Schema has 6 tables: users, api_keys, providers, usage, conversations, messages. This is code-visible and already covered by the code-synth pass.