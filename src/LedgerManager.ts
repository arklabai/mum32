import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { Ledger, MemoryEntry, MemoryMode } from './types';

const LEDGER_DIR = '.murf32';
const LEDGER_FILE = 'ledger.json';
const CONFIG_FILE = 'config.json';

/**
 * Handles all read/write operations to .murf32/ledger.json
 * Local-first: all data lives in the workspace directory.
 */
export class LedgerManager {
  private ledgerPath: string;
  private configPath: string;
  private ledger: Ledger;

  constructor(private workspaceRoot: string) {
    const dir = path.join(workspaceRoot, LEDGER_DIR);
    this.ledgerPath = path.join(dir, LEDGER_FILE);
    this.configPath = path.join(dir, CONFIG_FILE);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    this.ledger = this.load();
  }

  private load(): Ledger {
    if (!fs.existsSync(this.ledgerPath)) {
      const fresh: Ledger = {
        version: '1.0.0',
        workspaceId: path.basename(this.workspaceRoot),
        entries: [],
      };
      this.save(fresh);
      return fresh;
    }
    try {
      const raw = fs.readFileSync(this.ledgerPath, 'utf-8');
      return JSON.parse(raw) as Ledger;
    } catch {
      vscode.window.showErrorMessage('murf32: Failed to parse ledger.json. Starting fresh.');
      return { version: '1.0.0', workspaceId: path.basename(this.workspaceRoot), entries: [] };
    }
  }

  private save(ledger?: Ledger): void {
    const toWrite = ledger ?? this.ledger;
    fs.writeFileSync(this.ledgerPath, JSON.stringify(toWrite, null, 2), 'utf-8');
  }

  getEntries(): MemoryEntry[] {
    return this.ledger.entries;
  }

  addEntry(entry: Omit<MemoryEntry, 'id' | 'timestamp'>): MemoryEntry {
    const full: MemoryEntry = {
      ...entry,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: Date.now(),
    };
    this.ledger.entries.unshift(full); // newest first
    this.save();
    return full;
  }

  deleteEntry(id: string): void {
    this.ledger.entries = this.ledger.entries.filter(e => e.id !== id);
    this.save();
  }

  togglePin(id: string): void {
    const entry = this.ledger.entries.find(e => e.id === id);
    if (entry) {
      entry.pinned = !entry.pinned;
      this.save();
    }
  }

  clearStale(olderThanDays = 30): number {
    const cutoff = Date.now() - olderThanDays * 24 * 60 * 60 * 1000;
    const before = this.ledger.entries.length;
    this.ledger.entries = this.ledger.entries.filter(e => e.pinned || e.timestamp > cutoff);
    const removed = before - this.ledger.entries.length;
    this.save();
    return removed;
  }

  search(query: string): MemoryEntry[] {
    const q = query.toLowerCase();
    return this.ledger.entries.filter(
      e =>
        e.title.toLowerCase().includes(q) ||
        e.content.toLowerCase().includes(q) ||
        e.tags.some(t => t.toLowerCase().includes(q))
    );
  }

  getPinnedEntries(): MemoryEntry[] {
    return this.ledger.entries.filter(e => e.pinned);
  }

  getEntriesByMode(mode: MemoryMode): MemoryEntry[] {
    return this.ledger.entries.filter(e => e.mode === mode);
  }

  getLedgerPath(): string {
    return this.ledgerPath;
  }
}
