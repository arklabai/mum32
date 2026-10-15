# mum32 — Beautiful AI Context Ledger & Prompt Memory Extension

Persistent prompt memory engine and context ledger for AI coding agents (**Google Antigravity**, **Cursor**, **Windsurf**, and **VS Code**).

**Official Documentation & Product Page**: [https://www.arklabai.com/mum32](https://www.arklabai.com/mum32)

mum32 captures, categorizes, and remembers:
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
- Local-first storage in `.mum32/ledger.json` (git-trackable so your team shares design choices).
- Instant search across titles, contents, tags, and design tokens.
- Category filters: `All`, `Design`, `Rules`, `Prompts`, and `📌 Pinned`.

### 3. Prompt Synthesizer & Auto-Sync
- **Copy Context Block**: Formats all pinned rules and design decisions into a clean, token-efficient `<mum32_context>` block ready to paste into any agent chat.
- **Sync to AGENTS.md**: Automatically updates or appends the active rules block into your project's `AGENTS.md` file.
- **Clear Stale**: One-click cleanup for unpinned memories older than 30 days.

---

## Extension Settings

| Setting | Default | Description |
| :--- | :--- | :--- |
| `mum32.autoSyncOnSave` | `false` | Automatically sync pinned constraints to `AGENTS.md` on every file save. |
| `mum32.cloudApiKey` | `""` | Optional cloud API key for multi-session vector sync. |
| `mum32.gitTrackLedger` | `true` | Include `.mum32/ledger.json` in git tracking. |

---

## Keyboard Shortcuts & Commands

- `mum32.openSidebar`: Open the mum32 Context Ledger sidebar
- `mum32.copyContextBlock`: Copy synthesized `<mum32_context>` to clipboard
- `mum32.syncToAgentsMd`: Sync active rules to `AGENTS.md`
- `mum32.capturePrompt`: Capture prompt snapshot from clipboard
- `mum32.clearStale`: Clean up stale unpinned memories

---

## Publishing & Marketplace Distribution

mum32 can be published to both the **Visual Studio Marketplace** (for VS Code) and the **Open VSX Registry** (for Antigravity IDE, Cursor, and Windsurf).

For detailed credentials setup, token generation, and CI/CD walkthroughs, see:
📖 **[Marketplace Publishing Guide (docs/PUBLISHING.md)](docs/PUBLISHING.md)**

### Quick Commands:
```bash
# 1. Build and package standalone VSIX
npm run build:all
npx @vscode/vsce package --no-git-tag-version

# 2. Publish to VS Code Marketplace
npx @vscode/vsce publish -p <YOUR_AZURE_PAT>

# 3. Publish to Open VSX (Antigravity & Cursor)
npx ovsx publish mum32-*.vsix -p <YOUR_OVSX_TOKEN>
```

---

## License

MIT © [ArkLab AI, Inc.](https://www.arklabai.com/mum32)
