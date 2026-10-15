import { MemoryEntry } from './types';

/**
 * Formats pinned/relevant memory entries into a compact, token-efficient
 * <mum32_context> block ready to be injected into any agent prompt.
 */
export class PromptSynthesizer {
  /**
   * Generates the full context block from a list of entries.
   * Pinned entries always appear first, ordered by mode.
   */
  static synthesize(entries: MemoryEntry[]): string {
    if (entries.length === 0) {
      return '<mum32_context>\n  (No active constraints recorded.)\n</mum32_context>';
    }

    const pinned = entries.filter(e => e.pinned);
    const unpinned = entries.filter(e => !e.pinned);
    const ordered = [...pinned, ...unpinned];

    const lines: string[] = [];

    // Group by mode
    const designs = ordered.filter(e => e.mode === 'design');
    const constraints = ordered.filter(e => e.mode === 'constraint');
    const prompts = ordered.filter(e => e.mode === 'prompt');
    const notes = ordered.filter(e => e.mode === 'note');

    if (designs.length > 0) {
      lines.push('## Design Decisions');
      for (const e of designs) {
        const pin = e.pinned ? '📌 ' : '';
        const cat = e.category ? `[${e.category}] ` : '';
        const target = e.targetElement ? ` (${e.targetElement})` : '';
        const tokens = e.tokens && e.tokens.length > 0 ? ` [Tokens: ${e.tokens.join(', ')}]` : '';
        lines.push(`- ${pin}${cat}${e.title}${target}: ${e.content}${tokens}`);
      }
    }

    if (constraints.length > 0) {
      lines.push('## Agent Rules & Invariants');
      for (const e of constraints) {
        const pin = e.pinned ? '📌 ' : '';
        const typePrefix = e.constraintType ? `[${e.constraintType.toUpperCase()}] ` : '';
        const scope = e.scope !== 'global' ? ` (scope: ${e.scope})` : '';
        lines.push(`- ${pin}${typePrefix}${e.title}: ${e.content}${scope}`);
      }
    }

    if (prompts.length > 0) {
      lines.push('## Prompt Snapshots');
      for (const e of prompts) {
        const date = new Date(e.timestamp).toLocaleDateString();
        lines.push(`- [${date}] ${e.title}: ${e.content}`);
      }
    }

    if (notes.length > 0) {
      lines.push('## Notes');
      for (const e of notes) {
        lines.push(`- ${e.title}: ${e.content}`);
      }
    }

    return `<mum32_context>\n${lines.join('\n')}\n</mum32_context>`;
  }

  /**
   * Generates a markdown-formatted AGENTS.md block
   * containing only pinned constraints and agent rules.
   */
  static forAgentsMd(entries: MemoryEntry[]): string {
    const relevant = entries.filter(e => e.pinned || e.mode === 'constraint');
    if (relevant.length === 0) {
      return '';
    }

    const lines = [
      '<!-- mum32: auto-generated context block — do not edit manually -->',
      '## mum32 Active Constraints',
      '',
    ];

    for (const e of relevant) {
      const typePrefix = e.constraintType ? `[${e.constraintType}] ` : '';
      const tokens = e.tokens && e.tokens.length > 0 ? ` (Tokens: ${e.tokens.join(', ')})` : '';
      lines.push(`- **${typePrefix}${e.title}**: ${e.content}${tokens}`);
    }

    lines.push('<!-- /mum32 -->');
    return lines.join('\n');
  }

  /**
   * Count approximate token usage (rough: 1 token ≈ 4 chars).
   */
  static estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  /**
   * Strip secrets from content before capturing.
   * Filters API keys, JWTs, passwords, PATs.
   */
  static sanitize(text: string): string {
    return text
      .replace(/sk-[A-Za-z0-9]{20,}/g, '[REDACTED_API_KEY]')
      .replace(/ghp_[A-Za-z0-9]{36}/g, '[REDACTED_GH_TOKEN]')
      .replace(/eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g, '[REDACTED_JWT]')
      .replace(/password\s*[:=]\s*\S+/gi, 'password: [REDACTED]')
      .replace(/Bearer\s+[A-Za-z0-9\-._~+/]+=*/g, 'Bearer [REDACTED]');
  }
}
