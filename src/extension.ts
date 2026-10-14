import * as vscode from 'vscode';
import { LedgerManager } from './LedgerManager';
import { SidebarProvider } from './SidebarProvider';
import { StatusBarController } from './StatusBarController';
import { PromptSynthesizer } from './PromptSynthesizer';

export function activate(context: vscode.ExtensionContext): void {
  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;

  if (!workspaceRoot) {
    vscode.window.showWarningMessage('murf32: Please open a workspace folder to use murf32.');
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
    vscode.commands.registerCommand('murf32.openSidebar', () => {
      vscode.commands.executeCommand('murf32.sidebarView.focus');
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('murf32.copyContextBlock', async () => {
      const entries = ledger.getEntries();
      if (entries.length === 0) {
        vscode.window.showWarningMessage('murf32: No memories saved yet. Add some in the sidebar!');
        return;
      }
      const block = PromptSynthesizer.synthesize(entries);
      await vscode.env.clipboard.writeText(block);
      vscode.window.showInformationMessage(
        `murf32: Context block copied to clipboard! (~${PromptSynthesizer.estimateTokens(block)} tokens)`
      );
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('murf32.syncToAgentsMd', () => {
      sidebarProvider.syncToAgentsMd();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('murf32.capturePrompt', async () => {
      const text = await vscode.env.clipboard.readText();
      if (!text.trim()) {
        vscode.window.showWarningMessage('murf32: Clipboard is empty. Copy a prompt first.');
        return;
      }
      const sanitized = PromptSynthesizer.sanitize(text);
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
      vscode.window.showInformationMessage('murf32: Prompt captured ✓');
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('murf32.clearStale', async () => {
      const answer = await vscode.window.showWarningMessage(
        'murf32: Remove all unpinned memories older than 30 days?',
        { modal: true },
        'Yes, Clear'
      );
      if (answer === 'Yes, Clear') {
        const removed = ledger.clearStale(30);
        statusBar.refresh();
        vscode.window.showInformationMessage(`murf32: Removed ${removed} stale memories.`);
      }
    })
  );

  // Auto-sync on save (if configured)
  context.subscriptions.push(
    vscode.workspace.onDidSaveTextDocument(() => {
      const config = vscode.workspace.getConfiguration('murf32');
      if (config.get<boolean>('autoSyncOnSave')) {
        sidebarProvider.syncToAgentsMd();
      }
    })
  );

  context.subscriptions.push(statusBar);

  console.log('murf32: Extension activated ✓');
}

export function deactivate(): void {}
