# Product Requirements Document (PRD)

## Project: murf32 — AI Context Ledger & Prompt Memory Extension
**Target Platforms**: VS Code & Antigravity IDE (also compatible with Cursor & Windsurf)  
**Product Team**: ArkLab AI, Inc.  
**Author**: ArkLab AI Product & Architecture Group  
**Status**: Ready for Implementation  
**Version**: 1.0.0  

---

## 1. Executive Summary

### 1.1 Problem Statement
When developers interact with autonomous AI coding agents (such as Google Antigravity, Claude Code, Cursor, GitHub Copilot, and Windsurf), conversational context frequently gets lost due to:
1. **Context Window Limits & Auto-Compaction**: Long conversations truncate past messages, wiping out critical design constraints, component choices, and formatting preferences.
2. **Repetitive Instruction Overhead**: Developers waste time re-prompting the same rules ("use Poppins font not Comfortaa", "scope hovers to `md:hover:`", "don't modify header/footer logo", "keep root clean").
3. **Unrecorded Design Choices**: Visual choices (color palettes, tailwind classes, typography scale, micro-interactions) live scattered across chat histories rather than in a structured, actionable memory layer.
4. **Agent Regressions**: A new agent turn or new session often re-introduces previously fixed bugs or overwrites intentional architecture decisions.

### 1.2 Proposed Solution: `murf32 IDE Extension`
**murf32** is a lightweight, local-first VS Code and Antigravity companion extension that acts as a continuous **Prompt Memory Engine & Context Ledger**. It captures, categorizes, and remembers:
- What you prompt each time and what specific changes were requested.
- Explicit design choices (fonts, colors, spacing, mobile rules, component tokens).
- Agent corrections and "never do this again" invariants.
- A quick-entry form and interactive sidebar that lets developers pin, search, synthesize, and inject accumulated context directly into any agent prompt with 1 click.

Powered by the **murf32 persistent memory layer** (`pip install murf32` / REST SDK), it bridges conversational AI sessions with persistent, deterministic developer intent.

---

## 2. Goals & Success Metrics

| Goal | Metric | Target |
| :--- | :--- | :--- |
| **Reduce Re-prompting** | Percentage of repeated styling/invariant instructions across sessions | **≥ 75% reduction** |
| **Rapid Context Injection** | Time required to inject relevant design rules into a new agent session | **< 3 seconds (1-click)** |
| **Zero Memory Leak** | Preservation of critical constraints across context compactions | **100% retention** |
| **Developer Adoption** | Daily Active Sessions using murf32 quick-capture form | **≥ 5 interactions/day** |

---

## 3. User Personas & Core Workflows

### Persona A: The Aesthetic Frontend Engineer
- **Scenario**: Wants consistent typography and styling across dozens of pages.
- **Workflow**: Captures a design rule once in the murf32 Form: `"Typography: Headings = font-space-grotesk font-bold, Body = font-poppins text-gray-700 dark:text-gray-200. Never use font-comfortaa for paragraphs."`
- **Benefit**: Whenever prompting the agent to build or update a new page, murf32 automatically includes the active design token bundle.

### Persona B: The Autonomous Agent Pair Programmer
- **Scenario**: Runs long coding sessions that trigger context compactions or multi-turn agent tasks.
- **Workflow**: Uses murf32 to automatically record each user prompt and the agent's outcome into a chronological ledger.
- **Benefit**: If an agent gets wiped or restarted, murf32 generates a "Resume Brief" containing only the exact ongoing goals and decisions.

### Persona C: The Lead Architect
- **Scenario**: Guarding critical invariants in an enterprise repo.
- **Workflow**: Pins repository constraints (`"No scripts in root"`, `"Keep header/footer arklab.ai unedited"`).
- **Benefit**: murf32 automatically syncs these into `.agents/rules/` and `AGENTS.md` so all agent sub-processes adhere to them.

---

## 4. Key Functional Features

```
+---------------------------------------------------------------------------------+
|                                murf32 Extension                                  |
|                                                                                 |
|  +--------------------+  +----------------------+  +--------------------------+ |
|  | Quick-Capture Form |  | Active Memory Ledger |  | Prompt Synthesizer       | |
|  | - Design Decision  |  | - Search & Filters   |  | - 1-Click Copy to Prompt | |
|  | - Agent Constraint |  | - Pinning & Tags     |  | - Auto-sync to AGENTS.md | |
|  | - Prompt Snapshot  |  | - Vector Recall      |  | - Conflict Detector      | |
|  +--------------------+  +----------------------+  +--------------------------+ |
|                                       │                                         |
|                   ┌───────────────────┴───────────────────┐                     |
|                   ▼                                       ▼                     |
|         Local Repo Storage                      murf32 Cloud Memory             |
|         (.murf32/ledger.json)                   (Semantic Vector Layer)         |
+---------------------------------------------------------------------------------+
```

### Feature 1: The murf32 Quick-Capture Form (Webview Panel)
A dockable, sleek sidebar panel inside VS Code / Antigravity with dedicated capture modes:
1. **Design Decision Mode**:
   - Fields: Category (`Typography`, `Colors`, `Animation`, `Layout`), Selected Element/Page, Decision Note, CSS/Tailwind Tokens.
2. **Agent Rule & Invariant Mode**:
   - Fields: Rule Type (`Negative Constraint / Never Do`, `Style Rule`, `Workflow Requirement`), Target Scope (Global, Workspace, or File Path).
3. **Prompt Snapshot Mode**:
   - One-click button: *"Capture Current Agent Prompt"* — extracts the active prompt from the chat input or clipboard with timestamps and tags.
4. **Quick Scratchpad**:
   - Freeform markdown note that auto-categorizes using local heuristics or the murf32 embedding parser.

### Feature 2: Persistent Context Ledger & Semantic Search
- **Local-First JSON/SQLite Store**: Stored in `<workspace>/.murf32/memory.json` (git-trackable so team members share the same memory bank).
- **Tagging & Filtering**: Instant filters for `#design`, `#typography`, `#rules`, `#architecture`, `#corrections`.
- **Semantic Recall**: Type a query like *"what font did we agree on for careers?"* and murf32 returns the exact recorded decision.

### Feature 3: Smart Prompt Synthesizer & 1-Click Injection
- **"Synthesize For Agent" Button**:
  - Automatically selects all pinned and relevant memories and formats them into a compact, token-efficient system instruction block:
    ```markdown
    <murf32_context>
    - Typography: Headings font-space-grotesk font-bold, Body font-poppins (Never use comfortaa for body)
    - Contrast: Ensure min 4.5:1; text-gray-700 on light, text-gray-200 on dark
    - Mobile: All hover states must be desktop-scoped (md:hover:)
    - Invariant: Never create maintenance scripts in root directory
    </murf32_context>
    ```
- **Auto-Sync to Agent Files**:
  - Automatically synchronizes approved rules with `AGENTS.md`, `.cursorrules`, or `.agents/rules/murf32-rules.md`.

### Feature 4: Conflict & Regression Detector
- Detects when a developer or an agent proposes something that violates a previously recorded decision (e.g., proposing `font-comfortaa` after a rule explicitly forbade it).
- Shows an inline status notification:
  > ⚠️ *murf32 Note: You recorded on Oct 11 to avoid Comfortaa for body text in favor of Poppins.*

### Feature 5: Integration with murf32 SDK
- Optional cloud sync powered by `murf32`'s native agent memory API:
  - Multi-agent memory sharing between Claude Code CLI, Antigravity IDE, and team teammates.
  - Multi-tenant isolation and auditable memory access.

---

## 5. UI & UX Specifications

### 5.1 Activity Bar & Sidebar Layout
- **Icon**: Minimalist neon glyph representing neural synapse and wave.
- **Top Bar**: Search bar + category pills (`All`, `Design`, `Rules`, `Prompts`, `Pinned`).
- **Section A (Quick Capture Form)**: Collapsible card with clear inputs and a primary *"Save to Memory"* button.
- **Section B (Memory Stream)**: Cards displaying title, tag pills, scope, and relative time (e.g. `2 hours ago`).
- **Section C (Actions Toolbar)**:
  - `[📋 Copy Context Prompt]`
  - `[🔄 Sync to AGENTS.md]`
  - `[⚡ Clear Stale]`

### 5.2 Status Bar Indicator
- `$(sparkle) murf32: 8 active constraints | Synced`
- Clicking opens a quick-pick menu of recently used prompt snippets.

---

## 6. Technical Architecture

### 6.1 Tech Stack
- **Extension Core**: TypeScript 5, VS Code Extension API (`^1.85.0`)
- **Webview UI**: React 18 + Tailwind CSS (bundled via Vite for instant load times)
- **Local Storage**: JSON/SQLite in `.murf32/` with auto-gitignore options
- **Semantic Engine**: Transformers.js (in-browser/Node local embeddings) + murf32 Python/REST API client for cloud sync
- **Token Efficiency**: Automated token pruner that strips redundant phrasing before generating prompt context

### 6.2 File Structure inside a Project
```
project-root/
├── .murf32/
│   ├── config.json          # User preferences & sync options
│   ├── ledger.json          # Recorded prompts, decisions, and constraints
│   └── cache/               # Semantic index vectors
├── AGENTS.md                # Auto-updated by murf32 sync engine
```

---

## 7. Security & Privacy
1. **Zero Secret Leakage**: murf32 automatically filters out API keys (`sk-...`, `ghp_...`, passwords, JWTs) from captured prompts.
2. **Local-First by Default**: All memories reside strictly on the user's local disk until cloud sync is explicitly enabled with an API key.
3. **Repository Isolated**: Project-specific decisions stay strictly inside the project's repository.

---

## 8. Implementation Phases & Roadmap

### Phase 1: MVP (Days 1–7)
- [ ] Scaffold VS Code extension (`murf32-ide`).
- [ ] Implement Webview form: Capture Design Decision, Agent Constraint, Prompt Note.
- [ ] Save to `.murf32/ledger.json`.
- [ ] Implement `[Copy Context Block]` and `[Append to AGENTS.md]` commands.

### Phase 2: Intelligence & Auto-Capture (Days 8–14)
- [ ] Add clipboard listener / status bar quick prompt capture.
- [ ] Basic entity extraction (heuristics for fonts, CSS classes, prohibited actions).
- [ ] Category search and filter in the sidebar.

### Phase 3: Semantic Recall & murf32 Cloud Integration (Days 15–21)
- [ ] Integrate native `murf32` SDK for vector search across past chat sessions.
- [ ] Conflict detection for contradicting instructions.
- [ ] Release to VS Code Marketplace and Open VSX.

---

## 9. Marketplace Publishing & Distribution Strategy

### 9.1 Platform Registries & Cost Breakdown
| Registry | Supported Environments | Publishing Fee | Renewal | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Visual Studio Marketplace** | Official Microsoft VS Code | **FREE ($0)** | None | Primary Channel |
| **Open VSX Registry** | Cursor, Antigravity, Windsurf, VSCodium | **FREE ($0)** | None | Core AI-IDE Channel |
| **Direct VSIX Sideloading** | Any Chromium/Electron IDE fork | **FREE ($0)** | None | Instant Alpha/Beta |

### 9.2 Visual Studio Code Marketplace Workflow (Official)
1. **Publisher Account Setup**:
   - Register publisher handle (e.g. `arklab-ai`) at [marketplace.visualstudio.com/manage](https://marketplace.visualstudio.com/manage).
   - Generate a Personal Access Token (PAT) via Azure DevOps ([dev.azure.com](https://dev.azure.com)) with `Marketplace (Manage)` scope.
2. **CLI Packaging & Publication**:
   ```bash
   npm install -g @vscode/vsce
   cd murf32-extension

   # Authenticate publisher
   vsce login arklab-ai

   # Create standalone .vsix installation package
   vsce package

   # Deploy release live to Visual Studio Marketplace
   vsce publish
   ```

### 9.3 Open VSX Registry Workflow (Cursor & Antigravity)
Cursor and other independent AI coding IDEs resolve extensions via the Eclipse Open VSX registry rather than Microsoft's proprietary marketplace.
1. Create a publisher account at [open-vsx.org](https://open-vsx.org).
2. Generate an API Access Token in User Settings.
3. Publish using `ovsx`:
   ```bash
   npx ovsx publish murf32-*.vsix -p <OPEN_VSX_TOKEN>
   ```

### 9.4 Automated CI/CD Publishing Pipeline (GitHub Actions)
Add `.github/workflows/publish-extension.yml` on release tags:
```yaml
name: Publish murf32 Extension
on:
  release:
    types: [created]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
      - run: npm ci && npm run build
      - name: Publish to VS Code Marketplace
        run: npx @vscode/vsce publish -p ${{ secrets.VSCE_PAT }}
      - name: Publish to Open VSX (Cursor / Antigravity)
        run: npx ovsx publish -p ${{ secrets.OVSX_TOKEN }}
      - name: Upload VSIX to GitHub Release Assets
        uses: softprops/action-gh-release@v1
        with:
          files: "*.vsix"
```
