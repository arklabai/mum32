import * as vscode from 'vscode';
import { LedgerManager } from './LedgerManager';
import { SidebarProvider } from './SidebarProvider';
import { StatusBarController } from './StatusBarController';
import { PromptSynthesizer } from './PromptSynthesizer';
import { ConflictDetector } from './ConflictDetector';

export function activate(context: vscode.ExtensionContext): void {
  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;

  if (!workspaceRoot) {
    vscode.window.showWarningMessage('mum32: Please open a workspace folder to use mum32.');
    return;
  }

  // Core services
  const ledger = new LedgerManager(workspaceRoot);
  const statusBar = new StatusBarController(ledger);
  const sidebarProvider = new SidebarProvider(
    context.extensionUri,
    ledger,
    statusBar,
    workspaceRoot
  );

  // Register webview sidebar
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(SidebarProvider.viewType, sidebarProvider, {
      webviewOptions: { retainContextWhenHidden: true },
    })
  );

  // --- Commands ---

  context.subscriptions.push(
    vscode.commands.registerCommand('mum32.statusBarMenu', () => {
      statusBar.showMenu();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('mum32.openSidebar', () => {
      vscode.commands.executeCommand('mum32.sidebarView.focus');
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('mum32.copyContextBlock', async () => {
      const entries = ledger.getEntries();
      if (entries.length === 0) {
        vscode.window.showWarningMessage('mum32: No memories saved yet. Add some in the sidebar!');
        return;
      }
      const block = PromptSynthesizer.synthesize(entries);
      await vscode.env.clipboard.writeText(block);
      vscode.window.showInformationMessage(
        `mum32: Context block copied to clipboard! (~${PromptSynthesizer.estimateTokens(block)} tokens)`
      );
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('mum32.syncToAgentsMd', () => {
      sidebarProvider.syncToAgentsMd();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('mum32.capturePrompt', async () => {
      const text = await vscode.env.clipboard.readText();
      if (!text.trim()) {
        vscode.window.showWarningMessage('mum32: Clipboard is empty. Copy a prompt first.');
        return;
      }
      const sanitized = PromptSynthesizer.sanitize(text);

      // Check for rule conflicts before saving
      const conflicts = ConflictDetector.check(sanitized, ledger.getEntries());
      if (conflicts.length > 0) {
        vscode.window.showWarningMessage(
          `mum32 Conflict: Captured prompt contradicts rule "${conflicts[0].ruleTitle}" (term: "${conflicts[0].matchedTerm}").`
        );
      }

      const title = await vscode.window.showInputBox({
        prompt: 'Give this prompt snapshot a name',
        placeHolder: 'e.g. "Initial layout setup for homepage"',
      });
      if (!title) { return; }

      ledger.addEntry({
        mode: 'prompt',
        title,
        content: sanitized,
        tags: ['#prompt'],
        pinned: false,
        scope: 'workspace',
      });
      statusBar.refresh();
      vscode.window.showInformationMessage('mum32: Prompt captured successfully.');
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('mum32.checkConflicts', () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showInformationMessage('mum32: No active editor file to scan for conflicts.');
        return;
      }
      const text = editor.document.getText();
      const conflicts = ConflictDetector.check(text, ledger.getEntries());
      if (conflicts.length === 0) {
        vscode.window.showInformationMessage('mum32: No rule conflicts detected in active file.');
      } else {
        const summary = conflicts.map(c => `• ${c.ruleTitle} (term: "${c.matchedTerm}")`).join('; ');
        vscode.window.showWarningMessage(`mum32: Found ${conflicts.length} invariant violation(s): ${summary}`);
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('mum32.clearStale', async () => {
      const answer = await vscode.window.showWarningMessage(
        'mum32: Remove all unpinned memories older than 30 days?',
        { modal: true },
        'Yes, Clear'
      );
      if (answer === 'Yes, Clear') {
        const removed = ledger.clearStale(30);
        statusBar.refresh();
        vscode.window.showInformationMessage(`mum32: Removed ${removed} stale memories.`);
      }
    })
  );

  // Auto-sync on save (if configured)
  context.subscriptions.push(
    vscode.workspace.onDidSaveTextDocument(() => {
      const config = vscode.workspace.getConfiguration('mum32');
      if (config.get<boolean>('autoSyncOnSave')) {
        sidebarProvider.autoSync();
      }
    })
  );

  context.subscriptions.push(statusBar);

  console.log('mum32: Extension activated.');
}

export function deactivate(): void {}
