# murf32 — AI Context Ledger & Prompt Memory Extension

Persistent prompt memory engine and context ledger for AI coding agents (**Google Antigravity**, **Cursor**, **Windsurf**, and **VS Code**).

murf32 captures, categorizes, and remembers:
- **Design Choices**: Typography, colors, spacing, mobile rules, component tokens.
- **Agent Invariants**: Prohibited patterns, architecture constraints, and "never do this again" rules.
- **Prompt Snapshots**: Track prompts across sessions to prevent context drift and agent regressions.
- **1-Click Synthesis**: Injects accumulated context directly into any agent prompt or auto-syncs into `AGENTS.md`.

---

## Features

### 1. Quick-Capture Form
Capture decisions right inside your IDE sidebar:
- **Design Mode**: Set category (`Typography`, `Colors`, `Animation`, `Layout`), target element/page, and CSS/Tailwind tokens.
- **Rule / Invariant Mode**: Define `Never Do`, `Style Rule`, or `Workflow Requirement` with workspace or global scope.
- **Prompt Snapshot Mode**: 1-click capture from clipboard with timestamps.
- **Freeform Notes**: Quick scratchpad for ongoing thoughts.

### 2. Active Memory Ledger & Search
- Local-first storage in `.murf32/ledger.json` (git-trackable so your team shares design choices).
- Instant search across titles, contents, tags, and design tokens.
- Category filters: `All`, `Design`, `Rules`, `Prompts`, and `📌 Pinned`.

### 3. Prompt Synthesizer & Auto-Sync
- **Copy Context Block**: Formats all pinned rules and design decisions into a clean, token-efficient `<murf32_context>` block ready to paste into any agent chat.
- **Sync to AGENTS.md**: Automatically updates or appends the active rules block into your project's `AGENTS.md` file.
- **Clear Stale**: One-click cleanup for unpinned memories older than 30 days.

---

## Extension Settings

| Setting | Default | Description |
| :--- | :--- | :--- |
| `murf32.autoSyncOnSave` | `false` | Automatically sync pinned constraints to `AGENTS.md` on every file save. |
| `murf32.cloudApiKey` | `""` | Optional cloud API key for multi-session vector sync. |
| `murf32.gitTrackLedger` | `true` | Include `.murf32/ledger.json` in git tracking. |

---

## Keyboard Shortcuts & Commands

- `murf32.openSidebar`: Open the murf32 Context Ledger sidebar
- `murf32.copyContextBlock`: Copy synthesized `<murf32_context>` to clipboard
- `murf32.syncToAgentsMd`: Sync active rules to `AGENTS.md`
- `murf32.capturePrompt`: Capture prompt snapshot from clipboard
- `murf32.clearStale`: Clean up stale unpinned memories

---

## License

MIT © [ArkLab AI, Inc.](https://arklab.ai)
