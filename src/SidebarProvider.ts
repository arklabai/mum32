import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { LedgerManager } from './LedgerManager';
import { PromptSynthesizer } from './PromptSynthesizer';
import { StatusBarController } from './StatusBarController';
import { MemoryEntry, WebviewMessage } from './types';

/**
 * Provides the mum32 sidebar webview panel.
 * Bridges messages between the React UI and the extension host.
 */
export class SidebarProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'mum32.sidebarView';
  private _view?: vscode.WebviewView;

  constructor(
    private readonly extensionUri: vscode.Uri,
    private readonly ledger: LedgerManager,
    private readonly statusBar: StatusBarController,
    private readonly workspaceRoot: string
  ) {}

  resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ): void {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [
        vscode.Uri.joinPath(this.extensionUri, 'webview-ui', 'dist'),
        vscode.Uri.joinPath(this.extensionUri, 'media'),
      ],
    };

    webviewView.webview.html = this.getHtml(webviewView.webview);

    webviewView.webview.onDidReceiveMessage((message: WebviewMessage) => {
      this.handleMessage(message);
    });
  }

  private handleMessage(message: WebviewMessage): void {
    switch (message.type) {
      case 'ready':
        this.sendEntries();
        break;

      case 'saveEntry': {
        const raw = message.payload as Omit<MemoryEntry, 'id' | 'timestamp'>;
        const sanitized = { ...raw, content: PromptSynthesizer.sanitize(raw.content) };
        this.ledger.addEntry(sanitized);
        this.sendEntries();
        this.statusBar.refresh();
        break;
      }

      case 'deleteEntry': {
        const { id } = message.payload as { id: string };
        this.ledger.deleteEntry(id);
        this.sendEntries();
        this.statusBar.refresh();
        break;
      }

      case 'pinEntry': {
        const { id } = message.payload as { id: string };
        this.ledger.togglePin(id);
        this.sendEntries();
        this.statusBar.refresh();
        break;
      }

      case 'copyContext': {
        const entries = this.ledger.getEntries();
        const block = PromptSynthesizer.synthesize(entries);
        vscode.env.clipboard.writeText(block).then(() => {
          vscode.window.showInformationMessage(
            `mum32: Context block copied! (~${PromptSynthesizer.estimateTokens(block)} tokens)`
          );
          this._view?.webview.postMessage({ type: 'copied', payload: { block } });
        });
        break;
      }

      case 'syncAgentsMd': {
        this.syncToAgentsMd();
        break;
      }

      case 'clearStale': {
        const removed = this.ledger.clearStale();
        vscode.window.showInformationMessage(`mum32: Cleared ${removed} stale memories.`);
        this.sendEntries();
        this.statusBar.refresh();
        break;
      }

      case 'captureClipboard': {
        vscode.env.clipboard.readText().then(text => {
          const sanitized = PromptSynthesizer.sanitize(text);
          this._view?.webview.postMessage({ type: 'clipboardContent', payload: { text: sanitized } });
        });
        break;
      }

      case 'search': {
        const { query } = message.payload as { query: string };
        const results = query ? this.ledger.search(query) : this.ledger.getEntries();
        this._view?.webview.postMessage({ type: 'entriesUpdated', payload: { entries: results } });
        break;
      }
    }
  }

  private sendEntries(): void {
    const entries = this.ledger.getEntries();
    this._view?.webview.postMessage({ type: 'entriesUpdated', payload: { entries } });
  }

  syncToAgentsMd(): void {
    const entries = this.ledger.getEntries();
    const block = PromptSynthesizer.forAgentsMd(entries);
    if (!block) {
      vscode.window.showInformationMessage('mum32: No pinned rules to sync. Pin some entries first.');
      return;
    }

    const agentsMdPath = path.join(this.workspaceRoot, 'AGENTS.md');
    const marker = '<!-- mum32: auto-generated context block — do not edit manually -->';

    let existing = fs.existsSync(agentsMdPath) ? fs.readFileSync(agentsMdPath, 'utf-8') : '';

    // Replace existing mum32 block or append
    if (existing.includes(marker)) {
      existing = existing.replace(/<!-- mum32:.*?<!-- \/mum32 -->/s, block);
    } else {
      existing = existing.trimEnd() + '\n\n' + block + '\n';
    }

    fs.writeFileSync(agentsMdPath, existing, 'utf-8');
    this.statusBar.showSynced();
    vscode.window.showInformationMessage('mum32: Synced active rules to AGENTS.md ✓');
  }

  private getHtml(webview: vscode.Webview): string {
    const distPath = vscode.Uri.joinPath(this.extensionUri, 'webview-ui', 'dist');
    const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(distPath, 'assets', 'index.js'));
    const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(distPath, 'assets', 'index.css'));
    const nonce = getNonce();

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}'; font-src ${webview.cspSource} data:; img-src ${webview.cspSource} data:;" />
  <link rel="stylesheet" href="${styleUri}" />
  <title>mum32</title>
</head>
<body>
  <div id="root"></div>
  <script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
  }
}

function getNonce(): string {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
