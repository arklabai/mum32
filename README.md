# mum32 — Memory for your AI Harness & Coding Agents

[![Version](https://img.shields.io/badge/version-0.1.0-6366f1.svg)](package.json)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![Tests: Passing](https://img.shields.io/badge/tests-10%20passing-brightgreen.svg)](tests/)
[![Compatibility](https://img.shields.io/badge/compatible%20with-Antigravity%20%7C%20Cursor%20%7C%20Claude%20%7C%20VS%20Code-blueviolet.svg)](#)

> **Persistent prompt memory engine, invariant guard, and context ledger for AI coding harnesses and autonomous agents.**
> Designed for **Google Antigravity**, **Cursor**, **Claude Code**, **Windsurf**, and **VS Code**.

**Official Website & Portal**: [https://www.arklabai.com/mum32](https://www.arklabai.com/mum32)

---

## Why mum32?

As coding agents (Claude, GPT, Cursor, Copilot) generate code across dozens of turns and sessions, two major problems occur:
1. **Context Drift & Repeated Mistakes**: Agents forget architectural decisions, design tokens, and past corrections, constantly reintroducing regressions.
2. **Manual Overhead & Risk**: Developers waste time repeatedly copy-pasting system rules, while risking accidental leakage of production secrets and API keys into agent prompts.

**mum32 acts as your AI harness's persistent brain.** It tracks decisions, auto-syncs context to agent files, flags rule violations, and redacts sensitive credentials before they ever reach an LLM.

---

## Key Features

### ⚡ 1. Reactive Multi-Target Auto-Sync
- Automatically writes pinned design tokens, architectural rules, and negative constraints into your workspace context files:
  - `AGENTS.md`
  - `.cursorrules`
  - `CLAUDE.md`
- **Non-Destructive**: All synced rules are isolated inside guarded boundaries (`<!-- BEGIN MUM32 CONTEXT --> ... <!-- END MUM32 CONTEXT -->`), never overwriting your existing settings.

### 🛡️ 2. Invariant & Conflict Detector
- Real-time scanner detects when proposed code or prompts violate recorded negative constraints (*"Never use X"*, *"Avoid Y"*, *"Always enforce Z"*).
- Triggers instant VS Code notifications and status bar warnings before regressions hit production.

### 🔒 3. Comprehensive Secret & Credential Redaction
- Built-in zero-leak regex engine automatically sanitizes captured text and prompts:
  - Anthropic API keys (`sk-ant-...`)
  - OpenAI API keys (`sk-...`, `sk-proj-...`)
  - GitHub PATs (`ghp_...`, `github_pat_...`)
  - AWS Access Keys (`AKIA...`)
  - Private Keys (`BEGIN RSA/EC PRIVATE KEY`)
  - Bearer tokens and JWTs

### ⌨️ 4. Global Shortcuts & Interactive QuickPick
Supercharge your workflow without ever leaving your editor:
| Shortcut (macOS) | Shortcut (Windows/Linux) | Action |
| :--- | :--- | :--- |
| `Cmd+Alt+M` | `Ctrl+Alt+M` | Open mum32 Context Sidebar |
| `Cmd+Alt+C` | `Ctrl+Alt+C` | Quick-Capture Prompt / Selection from Clipboard |
| `Cmd+Alt+S` | `Ctrl+Alt+S` | Synthesize Compact Context for Agent Prompt |
| `Cmd+Alt+P` | `Ctrl+Alt+P` | Auto-Sync Pinned Rules to Context Files |
| `Cmd+Alt+K` | `Ctrl+Alt+K` | Check Workspace Invariant Conflicts |

Clicking the **Status Bar item** (`$(sparkle) mum32: X memories`) opens a rich interactive QuickPick menu.

### ✏️ 5. Sleek Webview with Inline Memory Editing
- Built with React 18, Tailwind CSS, and Lucide icons.
- Instant search across memory titles, tags, and design tokens.
- Category filters: `All`, `Design`, `Rules`, `Prompts`, and `📌 Pinned`.
- Direct inline editing with real-time persistence and automatic sync.

---

## Architecture & Storage

mum32 is **local-first and git-friendly**:
```
workspace-root/
├── .mum32/
│   └── ledger.json         # Git-trackable local memory bank
├── AGENTS.md               # Auto-updated with <!-- BEGIN MUM32 CONTEXT -->
├── .cursorrules            # Auto-updated with <!-- BEGIN MUM32 CONTEXT -->
└── CLAUDE.md               # Auto-updated with <!-- BEGIN MUM32 CONTEXT -->
```

---

## Extension Settings

| Setting | Default | Description |
| :--- | :--- | :--- |
| `mum32.autoSyncOnSave` | `true` | Automatically sync pinned constraints to context files on memory save/update. |
| `mum32.syncTargets` | `["AGENTS.md", ".cursorrules", "CLAUDE.md"]` | Target agent context files to synchronize. |
| `mum32.cloudApiKey` | `""` | Optional cloud API key for team memory sync. |
| `mum32.gitTrackLedger` | `true` | Include `.mum32/ledger.json` in git tracking. |

---

## Development & Testing

```bash
# Clone the repository
git clone git@github.com:arklabai/mum32.git
cd mum32

# Install dependencies
npm install
cd webview-ui && npm install && cd ..

# Run concurrent dev mode (Vite watcher + Extension compiler)
npm run dev

# Run unit tests
npm test

# Build production bundle
npm run compile
```

---

## Contributing

We welcome community contributions! Check out our contributing guidelines and templates:
- 📖 [Contributing Guide (.github/CONTRIBUTING.md)](.github/CONTRIBUTING.md)
- 🐛 [Report a Bug](.github/ISSUE_TEMPLATE/bug_report.md)
- 💡 [Request a Feature](.github/ISSUE_TEMPLATE/feature_request.md)

---

## License

MIT © [ArkLab AI, Inc.](https://www.arklabai.com/mum32)
