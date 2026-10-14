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
    this.statusBarItem.command = 'murf32.openSidebar';
    this.statusBarItem.tooltip = 'murf32 — Click to open Context Ledger';
    this.statusBarItem.show();
    this.refresh();
  }

  refresh(): void {
    const all = this.ledger.getEntries();
    const pinned = all.filter(e => e.pinned).length;
    const constraints = all.filter(e => e.mode === 'constraint').length;
    const total = all.length;

    const icon = '$(sparkle)';
    if (total === 0) {
      this.statusBarItem.text = `${icon} murf32: No memories yet`;
      this.statusBarItem.backgroundColor = undefined;
    } else {
      this.statusBarItem.text = `${icon} murf32: ${constraints} rules | ${pinned} pinned | ${total} total`;
      this.statusBarItem.backgroundColor = undefined;
    }
  }

  showSynced(): void {
    this.statusBarItem.text = '$(check) murf32: Synced to AGENTS.md';
    setTimeout(() => this.refresh(), 3000);
  }

  showError(msg: string): void {
    this.statusBarItem.text = `$(error) murf32: ${msg}`;
    this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
    setTimeout(() => this.refresh(), 4000);
  }

  dispose(): void {
    this.statusBarItem.dispose();
  }
}
