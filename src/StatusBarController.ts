import * as vscode from 'vscode';
import { LedgerManager } from './LedgerManager';

/**
 * Manages the status bar item that shows active constraint count.
 * Clicking opens a quick-pick menu for recent prompt snippets.
 */
export class StatusBarController implements vscode.Disposable {
  private statusBarItem: vscode.StatusBarItem;

  constructor(private ledger: LedgerManager) {
    this.statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      100
    );
    this.statusBarItem.command = 'mum32.statusBarMenu';
    this.statusBarItem.tooltip = 'mum32 — Click for quick context actions & rules';
    this.statusBarItem.show();
    this.refresh();
  }

  async showMenu(): Promise<void> {
    const all = this.ledger.getEntries();
    const pinned = all.filter(e => e.pinned).length;
    const constraints = all.filter(e => e.mode === 'constraint').length;

    const items: vscode.QuickPickItem[] = [
      {
        label: '$(clippy) Copy Context Block',
        description: `${all.length} memories (${pinned} pinned)`,
        detail: 'Synthesize pinned constraints into token-efficient <mum32_context> prompt block'
      },
      {
        label: '$(sync) Force Auto-Sync to Agent Files',
        description: 'AGENTS.md, .cursorrules, CLAUDE.md',
        detail: 'Inject or update the active constraints in all AI coding agent rule files'
      },
      {
        label: '$(add) Quick-Capture from Clipboard',
        detail: 'Save prompt or rule from clipboard directly into the memory ledger'
      },
      {
        label: '$(shield) Scan Active File for Rule Conflicts',
        detail: 'Check if current editor code contradicts any recorded invariants'
      },
      {
        label: '$(layout-sidebar-left) Open mum32 Sidebar',
        detail: 'Show the full webview capture form and memory stream'
      },
      {
        label: '$(trash) Clear Stale Memories',
        detail: 'Remove unpinned memories older than 30 days'
      }
    ];

    const selected = await vscode.window.showQuickPick(items, {
      placeHolder: `mum32: ${constraints} rules active (${pinned} pinned) — choose quick action`,
    });

    if (!selected) { return; }

    if (selected.label.includes('Copy Context')) {
      vscode.commands.executeCommand('mum32.copyContextBlock');
    } else if (selected.label.includes('Force Auto-Sync')) {
      vscode.commands.executeCommand('mum32.syncToAgentsMd');
    } else if (selected.label.includes('Quick-Capture')) {
      vscode.commands.executeCommand('mum32.capturePrompt');
    } else if (selected.label.includes('Scan Active File')) {
      vscode.commands.executeCommand('mum32.checkConflicts');
    } else if (selected.label.includes('Open mum32')) {
      vscode.commands.executeCommand('mum32.openSidebar');
    } else if (selected.label.includes('Clear Stale')) {
      vscode.commands.executeCommand('mum32.clearStale');
    }
  }

  refresh(): void {
    const all = this.ledger.getEntries();
    const pinned = all.filter(e => e.pinned).length;
    const constraints = all.filter(e => e.mode === 'constraint').length;
    const total = all.length;

    const icon = '$(sparkle)';
    if (total === 0) {
      this.statusBarItem.text = `${icon} mum32: No memories yet`;
      this.statusBarItem.backgroundColor = undefined;
    } else {
      this.statusBarItem.text = `${icon} mum32: ${constraints} rules | ${pinned} pinned | ${total} total`;
      this.statusBarItem.backgroundColor = undefined;
    }
  }

  showSynced(): void {
    this.statusBarItem.text = '$(check) mum32: Synced to AGENTS.md';
    setTimeout(() => this.refresh(), 3000);
  }

  showError(msg: string): void {
    this.statusBarItem.text = `$(error) mum32: ${msg}`;
    this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
    setTimeout(() => this.refresh(), 4000);
  }

  dispose(): void {
    this.statusBarItem.dispose();
  }
}
