# Contributing to mum32

Thank you for your interest in contributing to **mum32** — *Memory for your AI Harness & Coding Agents*!

mum32 is built to make AI-assisted software engineering **faster**, **safer**, and **smooth**. We welcome contributions from developers, agent framework authors, and prompt engineers of all experience levels.

---

## Code of Conduct

We are committed to providing a welcoming, inclusive, and harassment-free experience for everyone. Please be respectful, constructive, and open to feedback in all discussions, pull requests, and issue threads.

---

## Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9.0.0 or higher
- **VS Code** (or compatible fork like Cursor, Antigravity, or Windsurf)

### Repository Setup
1. Clone the repository:
   ```bash
   git clone git@github.com:arklabai/mum32.git
   cd mum32
   ```
2. Install root and webview dependencies:
   ```bash
   npm install
   cd webview-ui && npm install && cd ..
   ```

---

## Development Workflow

mum32 provides a unified development workflow:

### 1. Run Dev Mode (Concurrent Watchers)
To automatically compile both the webview and the extension upon saving changes:
```bash
npm run dev
```
This runs:
- `watch:webview`: Vite development watcher in `webview-ui/`
- `watch:ext`: TypeScript compiler watcher in `src/`

### 2. Launch the Extension in Debug Mode
1. Open the project folder in VS Code or Antigravity.
2. Press `F5` (or go to **Run and Debug** > **Run Extension**).
3. A new **Extension Development Host** window will open with mum32 active in the Activity Bar.

### 3. Run Tests
mum32 uses a fast, zero-dependency unit test runner powered by `tsx`:
```bash
npm test
```
All unit tests in `tests/*.test.ts` should pass before submitting code.

### 4. Build and Package
To verify production builds:
```bash
npm run compile
npx @vscode/vsce package
```

---

## Architecture Overview

mum32 follows a clean, modular architecture:

```
mum32/
├── src/
│   ├── extension.ts            # Extension activation, commands & keybindings
│   ├── SidebarProvider.ts      # Webview communication & message dispatch
│   ├── LedgerManager.ts        # Local-first persistence in .mum32/ledger.json
│   ├── SyncEngine.ts           # Non-destructive sync to AGENTS.md, .cursorrules, CLAUDE.md
│   ├── PromptSynthesizer.ts    # Prompt formatting & comprehensive credential redaction
│   ├── ConflictDetector.ts     # Invariant check & "never do" constraint detector
│   ├── StatusBarController.ts  # Interactive quick-pick menu & status indicators
│   └── types.ts                # Shared TypeScript contracts & interfaces
├── webview-ui/                 # React 18 + Tailwind CSS sidebar app
│   ├── src/App.tsx             # Root view with state, filters & toolbar
│   ├── src/components/         # CaptureForm, MemoryStream, SearchBar
│   └── vite.config.ts          # Vite build config
├── tests/                      # Unit test suites (SyncEngine, Sanitizer, ConflictDetector)
└── docs/                       # PRD and architecture plans
```

---

## Key Principles & Guardrails

1. **Non-Destructive Synchronization**:
   - mum32 manages blocks inside agent context files using comment boundaries:
     ```markdown
     <!-- BEGIN MUM32 CONTEXT -->
     ...
     <!-- END MUM32 CONTEXT -->
     ```
   - Never overwrite user configurations outside this boundary.
2. **Zero Secret Leakage**:
   - All captured text must pass through `PromptSynthesizer.sanitize()` before persistence or agent injection.
   - Redact OpenAI keys, Anthropic keys, AWS credentials, GitHub PATs, private keys, and bearer tokens.
3. **Local-First Reliability**:
   - Everything functions without network connectivity. Local `.mum32/ledger.json` is the source of truth.
4. **TypeScript Strip-Types Compatibility**:
   - Node 24 and strict toolchains disallow constructor parameter properties in uncompiled code. Use explicit member definitions:
     ```typescript
     // Preferred
     class Example {
       private readonly root: string;
       constructor(root: string) {
         this.root = root;
       }
     }
     ```

---

## Submitting Pull Requests

1. **Fork & Branch**: Create a focused branch from `main`:
   ```bash
   git checkout -b feat/your-feature-name
   ```
2. **Commit Messages**: Use Conventional Commits (`feat: ...`, `fix: ...`, `docs: ...`, `test: ...`).
3. **Test Your Changes**: Verify that `npm test` and `npm run compile` pass.
4. **Open a PR**: Fill out the [Pull Request Template](.github/PULL_REQUEST_TEMPLATE.md).

---

## Getting Help

- Open an issue using our [Bug Report](.github/ISSUE_TEMPLATE/bug_report.md) or [Feature Request](.github/ISSUE_TEMPLATE/feature_request.md) templates.
- Join the discussion at [GitHub Discussions](https://github.com/arklabai/mum32/discussions).
- Visit the official portal: [https://www.arklabai.com/mum32](https://www.arklabai.com/mum32).
