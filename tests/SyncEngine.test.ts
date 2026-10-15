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

    const cursorrulesContent = fs.readFileSync(path.join(tmpDir, '.cursorrules'), 'utf-8');
    assert.match(cursorrulesContent, /<!-- mum32: auto-generated context block/);

    // Clean up
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('should clean up mum32 block if no pinned entries exist', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mum32-sync-test-'));
    const agentsPath = path.join(tmpDir, 'AGENTS.md');
    fs.writeFileSync(agentsPath, '# Existing Guide\n\n<!-- mum32: auto-generated context block — do not edit manually -->\n## mum32 Active Constraints\n- Rule\n<!-- /mum32 -->\n');

    const engine = new SyncEngine(tmpDir);
    engine.sync([], ['AGENTS.md']);

    const content = fs.readFileSync(agentsPath, 'utf-8');
    assert.match(content, /# Existing Guide/);
    assert.doesNotMatch(content, /<!-- mum32:/);

    fs.rmSync(tmpDir, { recursive: true, force: true });
  });
});
