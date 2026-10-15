import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import { ConflictDetector } from '../src/ConflictDetector';
import { MemoryEntry } from '../src/types';

describe('ConflictDetector', () => {
  const mockRules: MemoryEntry[] = [
    {
      id: 'rule-1',
      mode: 'constraint',
      title: 'No Comfortaa Font',
      content: 'Never use comfortaa font in headings or body text',
      constraintType: 'never',
      scope: 'workspace',
      tags: ['#constraint'],
      pinned: true,
      timestamp: Date.now()
    },
    {
      id: 'rule-2',
      mode: 'constraint',
      title: 'Logo Preservation',
      content: 'Do not modify arklab logo SVG in header',
      constraintType: 'never',
      scope: 'workspace',
      tags: ['#constraint'],
      pinned: true,
      timestamp: Date.now()
    },
    {
      id: 'rule-3',
      mode: 'design',
      title: 'Heading Font',
      content: 'Use Space Grotesk for all titles',
      scope: 'workspace',
      tags: ['#design'],
      pinned: false,
      timestamp: Date.now()
    }
  ];

  it('should detect when code/text violates a pinned negative constraint', () => {
    const code = "const headingStyle = { fontFamily: 'Comfortaa', fontWeight: 'bold' };";
    const alerts = ConflictDetector.check(code, mockRules);

    assert.strictEqual(alerts.length, 1);
    assert.strictEqual(alerts[0].ruleId, 'rule-1');
    assert.strictEqual(alerts[0].ruleTitle, 'No Comfortaa Font');
    assert.strictEqual(alerts[0].matchedTerm, 'comfortaa');
    assert.match(alerts[0].snippet, /Comfortaa/);
  });

  it('should detect violation of "do not modify" invariants', () => {
    const prompt = 'Can you modify the arklab logo to make it brighter?';
    const alerts = ConflictDetector.check(prompt, mockRules);

    assert.strictEqual(alerts.length, 1);
    assert.strictEqual(alerts[0].ruleId, 'rule-2');
    assert.strictEqual(alerts[0].matchedTerm, 'arklab logo');
  });

  it('should return empty list when no constraints are violated', () => {
    const code = "import { Inter } from 'next/font/google';";
    const alerts = ConflictDetector.check(code, mockRules);

    assert.strictEqual(alerts.length, 0);
  });
});
