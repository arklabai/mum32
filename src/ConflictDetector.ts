import { MemoryEntry } from './types';

export interface ConflictAlert {
  ruleId: string;
  ruleTitle: string;
  matchedTerm: string;
  snippet: string;
}

export class ConflictDetector {
  /**
   * Scans a string of text or code against pinned negative constraints.
   * Returns a list of violations detected.
   */
  static check(text: string, entries: MemoryEntry[]): ConflictAlert[] {
    const constraints = entries.filter(e => e.pinned && e.mode === 'constraint');
    const alerts: ConflictAlert[] = [];
    const lowerText = text.toLowerCase();

    for (const rule of constraints) {
      const bannedTerms = this.extractBannedTerms(`${rule.title} ${rule.content}`);
      for (const term of bannedTerms) {
        if (term.length >= 3 && lowerText.includes(term.toLowerCase())) {
          const idx = lowerText.indexOf(term.toLowerCase());
          const start = Math.max(0, idx - 25);
          const end = Math.min(text.length, idx + term.length + 25);
          alerts.push({
            ruleId: rule.id,
            ruleTitle: rule.title,
            matchedTerm: term,
            snippet: text.slice(start, end).trim(),
          });
          break; // One alert per rule is sufficient
        }
      }
    }

    return alerts;
  }

  /**
   * Extracts target entities or terms that should NOT be used or modified.
   * e.g. "Never use comfortaa font" -> ["comfortaa"]
   *      "Do not modify arklab logo" -> ["arklab logo"]
   */
  private static extractBannedTerms(description: string): string[] {
    const clean = description.toLowerCase();
    const terms: string[] = [];

    const patterns = [
      /(?:never use|don't use|do not use|avoid|prohibit|disallow)\s+([a-zA-Z0-9_\-]+(?:\s+[a-zA-Z0-9_\-]+)?)/gi,
      /(?:do not modify|don't modify|never modify|keep unedited)\s+([a-zA-Z0-9_\-]+(?:\s+[a-zA-Z0-9_\-]+)?)/gi,
      /\bno\s+([a-zA-Z0-9_\-]+)\s+(?:font|styles|scripts|inline)/gi,
    ];

    for (const pat of patterns) {
      let match: RegExpExecArray | null;
      while ((match = pat.exec(clean)) !== null) {
        let term = match[1].trim();
        // Remove trailing stop words like "font", "in", "for"
        term = term.replace(/\s+(?:font|for|in|on|to)$/, '');
        if (term.length >= 3 && !terms.includes(term)) {
          terms.push(term);
        }
      }
    }

    // Also check if title itself has "No <Term>"
    const titleMatch = description.match(/\b(?:no|avoid)\s+([a-zA-Z0-9_\-]+)/i);
    if (titleMatch) {
      const term = titleMatch[1].toLowerCase().trim();
      if (term.length >= 3 && !terms.includes(term) && !['font', 'style', 'code'].includes(term)) {
        terms.push(term);
      }
    }

    return terms;
  }
}
