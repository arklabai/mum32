import * as fs from 'fs';
import * as path from 'path';
import { MemoryEntry } from './types';
import { PromptSynthesizer } from './PromptSynthesizer';

export class SyncEngine {
  private workspaceRoot: string;

  constructor(workspaceRoot: string) {
    this.workspaceRoot = workspaceRoot;
  }

  public sync(
    entries: MemoryEntry[],
    targetFiles: string[] = ['AGENTS.md', '.cursorrules', 'CLAUDE.md']
  ): string[] {
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
