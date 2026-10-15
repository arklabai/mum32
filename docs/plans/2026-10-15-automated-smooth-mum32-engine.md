# Automated, Safe & Smooth AI Context Engine Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform mum32 from a passive manual ledger into a fully automated, safe, and frictionless AI context engine that automatically syncs pinned constraints to `AGENTS.md`, `.cursorrules`, and `CLAUDE.md` upon any change, detects rule conflicts in code/prompts, redacts sensitive secrets, and provides instant keyboard-driven workflows.

**Architecture:** A reactive event-driven architecture where `LedgerManager` mutations immediately dispatch non-destructive atomic sync operations to target agent context files (`AGENTS.md`, `.cursorrules`, `CLAUDE.md`). A background `ConflictDetector` engine scans active prompts and editor snippets against pinned invariants. Global keybindings and an interactive status bar QuickPick menu provide frictionless developer velocity.

**Tech Stack:** TypeScript 5, VS Code Extension API (`^1.85.0`), React 18, Tailwind CSS, Vite, Node Test Runner.

---

## Current Pain Points & Root Causes

1. **Rule Synchronization is Not Automatic**:
   - Pinned rules only live in `.mum32/ledger.json`. `AGENTS.md` is only updated when the user manually clicks "Sync AGENTS.md" in the UI.
   - `autoSyncOnSave` defaults to `false`, and only triggers on editor file save—not when rules are added/pinned.
   - Non-Antigravity IDEs (Cursor, Windsurf, Claude Code) read `.cursorrules`, `.windsurfrules`, or `CLAUDE.md`, which are currently completely ignored.
2. **Context Injection Requires Repetitive Copy-Pasting**:
   - Developers must manually click "Copy Context" and paste into chat windows every session.
3. **No Safety Guardrails for Invariant Violations**:
   - If an agent generates code that violates a pinned invariant (e.g. introducing prohibited fonts or improper tokens), mum32 does not detect or warn about the contradiction.
4. **Credential Leak Risks**:
   - Developer prompts frequently contain temporary keys or tokens. Sanitization must comprehensively catch modern API keys (OpenAI, Anthropic, AWS, GitHub, JWTs).
5. **Slow Development Loop**:
   - Developing the extension requires running two separate terminal tabs (`watch:webview` and `watch:ext`) with no unified `npm run dev`.

---

## Implementation Tasks

### Task 1: Reactive Multi-File Auto-Sync Engine

**Files:**
- Modify: `package.json:70-90`
- Modify: `src/types.ts:1-25`
- Create: `src/SyncEngine.ts`
- Modify: `src/SidebarProvider.ts:50-148`
- Modify: `src/extension.ts:15-115`
- Create: `tests/SyncEngine.test.ts`

**Step 1: Write unit tests for multi-target file sync**

```typescript
// tests/SyncEngine.test.ts
import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { SyncEngine } from '../src/SyncEngine';
import { MemoryEntry } from '../src/types';

describe('SyncEngine', () => {
  it('should format and inject sync block into AGENTS.md and .cursorrules without modifying outer content', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mum32-sync-test-'));
    const agentsPath = path.join(tmpDir, 'AGENTS.md');
    fs.writeFileSync(agentsPath, '# Existing Project Guide\n\nSome guidelines here.\n');

    const sampleEntries: MemoryEntry[] = [
      {
        id: '1',
        mode: 'constraint',
        title: 'No Inline Styles',
        content: 'Always use Tailwind utility classes',
        constraintType: 'never',
        scope: 'workspace',
        tags: ['#constraint'],
        pinned: true,
        timestamp: Date.now()
      }
    ];

    const engine = new SyncEngine(tmpDir);
    const updated = engine.sync(sampleEntries, ['AGENTS.md', '.cursorrules']);

    assert.strictEqual(updated.length, 2);
    const content = fs.readFileSync(agentsPath, 'utf-8');
    assert.match(content, /# Existing Project Guide/);
    assert.match(content, /<!-- mum32: auto-generated context block/);
    assert.match(content, /No Inline Styles/);

    // Clean up
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });
});
```

**Step 2: Run test to verify failure**

Run: `npx ts-node tests/SyncEngine.test.ts` or `npm test`
Expected: FAIL (module `SyncEngine` does not exist)

**Step 3: Implement `SyncEngine`**

```typescript
// src/SyncEngine.ts
import * as fs from 'fs';
import * as path from 'path';
import { MemoryEntry } from './types';
import { PromptSynthesizer } from './PromptSynthesizer';

export class SyncEngine {
  constructor(private workspaceRoot: string) {}

  public sync(entries: MemoryEntry[], targetFiles: string[] = ['AGENTS.md', '.cursorrules', 'CLAUDE.md']): string[] {
    const block = PromptSynthesizer.forAgentsMd(entries);
    const synced: string[] = [];

    const marker = '<!-- mum32: auto-generated context block — do not edit manually -->';

    for (const file of targetFiles) {
      const filePath = path.join(this.workspaceRoot, file);
      let existing = '';

      if (fs.existsSync(filePath)) {
        existing = fs.readFileSync(filePath, 'utf-8');
      }

      let updated = '';
      if (!block) {
        // If no pinned entries exist, remove previously injected mum32 block if present
        if (existing.includes(marker)) {
          updated = existing.replace(/<!-- mum32:.*?<!-- \/mum32 -->\n?/s, '').trimEnd() + '\n';
          fs.writeFileSync(filePath, updated, 'utf-8');
          synced.push(file);
        }
        continue;
      }

      if (existing.includes(marker)) {
        updated = existing.replace(/<!-- mum32:.*?<!-- \/mum32 -->/s, block);
      } else {
        updated = existing.trimEnd() ? `${existing.trimEnd()}\n\n${block}\n` : `${block}\n`;
      }

      fs.writeFileSync(filePath, updated, 'utf-8');
      synced.push(file);
    }

    return synced;
  }
}
```

**Step 4: Connect reactive auto-sync in `SidebarProvider.ts` and `extension.ts`**
- In `SidebarProvider.ts`: Call `this.autoSync()` on every `saveEntry`, `deleteEntry`, `pinEntry`, and `editEntry`.
- In `package.json`: Add settings:
  ```json
  "mum32.autoSync": {
    "type": "boolean",
    "default": true,
    "description": "Automatically update AGENTS.md, .cursorrules, and CLAUDE.md when rules are modified or pinned."
  },
  "mum32.syncTargets": {
    "type": "array",
    "items": { "type": "string" },
    "default": ["AGENTS.md", ".cursorrules", "CLAUDE.md"],
    "description": "Agent rule files to keep automatically synchronized."
  }
  ```

**Step 5: Run tests and verify pass**
Run: `npx ts-node tests/SyncEngine.test.ts`
Expected: PASS

**Step 6: Commit**
```bash
git add src/SyncEngine.ts src/SidebarProvider.ts src/extension.ts package.json tests/SyncEngine.test.ts
git commit -m "feat: add reactive multi-file auto-sync engine for AGENTS.md, .cursorrules, and CLAUDE.md"
```

---

### Task 2: Advanced Secret Redaction & Token Safety Guard

**Files:**
- Modify: `src/PromptSynthesizer.ts:100-114`
- Create: `tests/Sanitizer.test.ts`

**Step 1: Write unit tests for comprehensive secret redaction**

```typescript
// tests/Sanitizer.test.ts
import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import { PromptSynthesizer } from '../src/PromptSynthesizer';

describe('PromptSynthesizer.sanitize', () => {
  it('should redact OpenAI, Anthropic, AWS, GitHub, and Private Keys', () => {
    const raw = `
      OpenAI: sk-proj-1234567890abcdef1234567890
      Anthropic: sk-ant-api03-abcdef1234567890-abcdef12
      AWS: AKIAIOSFODNN7EXAMPLE
      GitHub: ghp_123456789012345678901234567890123456
      Auth: Bearer secret_token_xyz_123
    `;

    const cleaned = PromptSynthesizer.sanitize(raw);
    assert.doesNotMatch(cleaned, /sk-proj-/);
    assert.doesNotMatch(cleaned, /sk-ant-/);
    assert.doesNotMatch(cleaned, /AKIAIOSFODNN7EXAMPLE/);
    assert.doesNotMatch(cleaned, /ghp_1234567890/);
    assert.match(cleaned, /\[REDACTED_API_KEY\]/);
  });
});
```

**Step 2: Run test to verify failure**
Run: `npx ts-node tests/Sanitizer.test.ts`
Expected: FAIL (Anthropic or AWS keys not matched by existing regex)

**Step 3: Implement enhanced sanitization in `PromptSynthesizer.ts`**

```typescript
// In src/PromptSynthesizer.ts:
static sanitize(text: string): string {
  return text
    // OpenAI keys (legacy & project-scoped)
    .replace(/sk-[a-zA-Z0-9_-]{20,}/g, '[REDACTED_API_KEY]')
    // Anthropic keys
    .replace(/sk-ant-[a-zA-Z0-9_-]{20,}/g, '[REDACTED_API_KEY]')
    // AWS Access Key ID
    .replace(/\b(AKIA|ABIA|ACCA|ASIA)[0-9A-Z]{16}\b/g, '[REDACTED_AWS_KEY]')
    // GitHub PATs
    .replace(/\b(ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9_]{36,}\b/g, '[REDACTED_GH_TOKEN]')
    // Generic JWTs
    .replace(/eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g, '[REDACTED_JWT]')
    // Password strings
    .replace(/password\s*[:=]\s*\S+/gi, 'password: [REDACTED]')
    // Bearer tokens
    .replace(/Bearer\s+[A-Za-z0-9\-._~+/]+=*/gi, 'Bearer [REDACTED]')
    // Private Key blocks
    .replace(/-----BEGIN [A-Z ]+PRIVATE KEY-----[\s\S]+?-----END [A-Z ]+PRIVATE KEY-----/g, '[REDACTED_PRIVATE_KEY]');
}
```

**Step 4: Run test to verify pass**
Run: `npx ts-node tests/Sanitizer.test.ts`
Expected: PASS

**Step 5: Commit**
```bash
git add src/PromptSynthesizer.ts tests/Sanitizer.test.ts
git commit -m "feat: add comprehensive API key and credential redaction"
```

---

### Task 3: Invariant & Rule Conflict Detector (Safety Guardrail)

**Files:**
- Create: `src/ConflictDetector.ts`
- Modify: `src/extension.ts:80-115`
- Create: `tests/ConflictDetector.test.ts`

**Step 1: Write unit tests for conflict detection**

```typescript
// tests/ConflictDetector.test.ts
import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import { ConflictDetector } from '../src/ConflictDetector';
import { MemoryEntry } from '../src/types';

describe('ConflictDetector', () => {
  it('should detect when text violates a negative constraint', () => {
    const rules: MemoryEntry[] = [
      {
        id: '1',
        mode: 'constraint',
        title: 'No Comfortaa Font',
        content: 'never use comfortaa font for body or headings',
        constraintType: 'never',
        scope: 'workspace',
        tags: ['#constraint'],
        pinned: true,
        timestamp: Date.now()
      }
    ];

    const conflicts = ConflictDetector.check("font-family: 'Comfortaa', cursive;", rules);
    assert.strictEqual(conflicts.length, 1);
    assert.strictEqual(conflicts[0].ruleTitle, 'No Comfortaa Font');
  });
});
```

**Step 2: Run test to verify failure**
Run: `npx ts-node tests/ConflictDetector.test.ts`
Expected: FAIL (module `ConflictDetector` does not exist)

**Step 3: Implement `ConflictDetector.ts`**

```typescript
// src/ConflictDetector.ts
import { MemoryEntry } from './types';

export interface ConflictAlert {
  ruleId: string;
  ruleTitle: string;
  matchedTerm: string;
  snippet: string;
}

export class ConflictDetector {
  /**
   * Checks a block of text against pinned negative constraints.
   */
  static check(text: string, entries: MemoryEntry[]): ConflictAlert[] {
    const constraints = entries.filter(e => e.pinned && e.mode === 'constraint');
    const alerts: ConflictAlert[] = [];
    const lowerText = text.toLowerCase();

    for (const rule of constraints) {
      // Extract banned terms from rule content (e.g. "never use comfortaa", "don't touch logo")
      const bannedTerms = this.extractBannedTerms(rule.title + ' ' + rule.content);
      for (const term of bannedTerms) {
        if (term.length > 3 && lowerText.includes(term)) {
          const idx = lowerText.indexOf(term);
          const start = Math.max(0, idx - 20);
          const end = Math.min(text.length, idx + term.length + 20);
          alerts.push({
            ruleId: rule.id,
            ruleTitle: rule.title,
            matchedTerm: term,
            snippet: text.slice(start, end).trim(),
          });
          break;
        }
      }
    }

    return alerts;
  }

  private static extractBannedTerms(description: string): string[] {
    const clean = description.toLowerCase();
    const matches = clean.match(/(?:never use|don't use|do not use|avoid|prohibit|no)\s+([a-zA-Z0-9_\-]+)/g);
    if (!matches) { return []; }
    return matches.map(m => m.replace(/^(?:never use|don't use|do not use|avoid|prohibit|no)\s+/, '').trim());
  }
}
```

**Step 4: Run test to verify pass**
Run: `npx ts-node tests/ConflictDetector.test.ts`
Expected: PASS

**Step 5: Commit**
```bash
git add src/ConflictDetector.ts tests/ConflictDetector.test.ts
git commit -m "feat: add invariant and conflict detection engine"
```

---

### Task 4: Keyboard Shortcuts & Interactive Status Bar QuickPick (Speed & Smoothness)

**Files:**
- Modify: `package.json:40-75`
- Modify: `src/StatusBarController.ts:1-53`
- Modify: `src/extension.ts:25-95`

**Step 1: Update `package.json` with global keybindings**
Configure standard, non-conflicting key combinations:
- `mum32.openSidebar`: `Ctrl+Alt+M` (mac: `Cmd+Alt+M`)
- `mum32.copyContextBlock`: `Ctrl+Alt+C` (mac: `Cmd+Alt+C`)
- `mum32.syncToAgentsMd`: `Ctrl+Alt+S` (mac: `Cmd+Alt+S`)
- `mum32.capturePrompt`: `Ctrl+Alt+P` (mac: `Cmd+Alt+P`)

**Step 2: Add interactive QuickPick to `StatusBarController.ts`**
Clicking the status bar opens a responsive menu:
1. `📋 Copy Synthesized Context Block` — Copies token-efficient `<mum32_context>` to clipboard.
2. `🔄 Auto-Sync All Agent Rules` — Forces instant sync to `AGENTS.md`, `.cursorrules`, `CLAUDE.md`.
3. `⚡ Quick Capture from Clipboard` — Captures copied prompt/rule instantly.
4. `📌 View Active Pinned Constraints` — Lists active invariants with toggle option.
5. `📖 Open mum32 Context Ledger` — Focuses the sidebar panel.

**Step 3: Verify build**
Run: `npm run build:ext`
Expected: PASS

**Step 4: Commit**
```bash
git add package.json src/StatusBarController.ts src/extension.ts
git commit -m "feat: add global keybindings and interactive status bar quick-pick menu"
```

---

### Task 5: Webview Inline Editing & Live Sync Feedback

**Files:**
- Modify: `webview-ui/src/components/MemoryStream.tsx`
- Modify: `webview-ui/src/App.tsx`
- Modify: `src/SidebarProvider.ts`
- Modify: `src/LedgerManager.ts`

**Step 1: Add update/edit capability to `LedgerManager.ts`**
```typescript
updateEntry(id: string, updates: Partial<MemoryEntry>): MemoryEntry | null {
  const entry = this.ledger.entries.find(e => e.id === id);
  if (!entry) return null;
  Object.assign(entry, updates, { timestamp: Date.now() });
  this.save();
  return entry;
}
```

**Step 2: Add Edit button & inline modal to `MemoryStream.tsx`**
Allow developers to edit rule title, content, target element, and tokens without deleting and re-creating.

**Step 3: Add Live Synced visual badge**
In `App.tsx`, whenever entries are saved/pinned, show a pulse badge:
`⚡ Auto-Synced to AGENTS.md & .cursorrules`.

**Step 4: Build webview and verify**
Run: `npm run build:webview`
Expected: PASS

**Step 5: Commit**
```bash
git add src/LedgerManager.ts src/SidebarProvider.ts webview-ui/src/components/MemoryStream.tsx webview-ui/src/App.tsx
git commit -m "feat: add inline editing for memories and live auto-sync indicators"
```

---

### Task 6: Unified One-Command Development Script & Test Runner

**Files:**
- Modify: `package.json`
- Install: `concurrently` (dev dependency)

**Step 1: Install `concurrently`**
Run: `npm install --save-dev concurrently`

**Step 2: Add root `dev` and `test` scripts in `package.json`**
```json
"scripts": {
  "dev": "concurrently -n \"webview,ext\" -c \"cyan,magenta\" \"npm run watch:webview\" \"npm run watch:ext\"",
  "test": "tsc -p ./tsconfig.json && node --test tests/*.test.ts"
}
```

**Step 3: Run `npm run build:all` and `vsce package`**
Verify the entire extension packages cleanly with zero errors.

**Step 4: Commit and Push**
```bash
git add package.json package-lock.json
git commit -m "chore: add unified dev script and test runner"
git push origin main
```
