import React, { useState, useEffect, useCallback } from 'react';
import { MemoryEntry, MemoryMode } from './types';
import { getVSCodeAPI } from './vscode';
import { CaptureForm } from './components/CaptureForm';
import { MemoryStream } from './components/MemoryStream';
import {
  Search,
  Copy,
  RefreshCw,
  Trash2,
  CheckCircle2,
  Sparkles,
  X,
  FileCode2,
} from 'lucide-react';

type FilterType = MemoryMode | 'all' | 'pinned';

const FILTER_PILLS: { value: FilterType; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'design', label: 'Design' },
  { value: 'constraint', label: 'Rules' },
  { value: 'prompt', label: 'Prompts' },
  { value: 'pinned', label: '📌 Pinned' },
];

export const App: React.FC = () => {
  const [entries, setEntries] = useState<MemoryEntry[]>([]);
  const [filterMode, setFilterMode] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [clipboardText, setClipboardText] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const vscode = getVSCodeAPI();

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  }, []);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      if (!message || !message.type) { return; }

      switch (message.type) {
        case 'entriesUpdated': {
          const payload = message.payload as { entries?: MemoryEntry[] };
          if (Array.isArray(payload?.entries)) {
            setEntries(payload.entries);
          }
          break;
        }

        case 'copied': {
          showToast('Context copied to clipboard! Ready to paste into agent prompt.');
          break;
        }

        case 'synced': {
          showToast('Active rules synced to AGENTS.md ✓');
          break;
        }

        case 'clipboardContent': {
          const payload = message.payload as { text?: string };
          if (payload?.text) {
            setClipboardText(payload.text);
            showToast('Loaded clipboard content into prompt form');
          }
          break;
        }

        case 'error': {
          const payload = message.payload as { message?: string };
          showToast(payload?.message || 'An error occurred');
          break;
        }
      }
    };

    window.addEventListener('message', handleMessage);

    // Notify extension host that webview is ready to receive data
    vscode.postMessage({ type: 'ready' });

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [vscode, showToast]);

  const handleSaveEntry = (entry: Omit<MemoryEntry, 'id' | 'timestamp'>) => {
    vscode.postMessage({ type: 'saveEntry', payload: entry });
    setClipboardText('');
  };

  const handleDeleteEntry = (id: string) => {
    vscode.postMessage({ type: 'deleteEntry', payload: { id } });
  };

  const handleUpdateEntry = (id: string, updates: Partial<MemoryEntry>) => {
    vscode.postMessage({ type: 'updateEntry', payload: { id, updates } });
  };

  const handleTogglePin = (id: string) => {
    vscode.postMessage({ type: 'pinEntry', payload: { id } });
  };

  const handleCopyContext = () => {
    vscode.postMessage({ type: 'copyContext' });
  };

  const handleSyncAgentsMd = () => {
    vscode.postMessage({ type: 'syncAgentsMd' });
  };

  const handleClearStale = () => {
    vscode.postMessage({ type: 'clearStale' });
  };

  const handleCaptureClipboard = () => {
    vscode.postMessage({ type: 'captureClipboard' });
  };

  const pinnedCount = entries.filter(e => e.pinned).length;
  const constraintCount = entries.filter(e => e.mode === 'constraint').length;

  return (
    <div className="min-h-screen flex flex-col bg-[#1e1e2e] text-[#cdd6f4]">
      {/* App Header & Brand */}
      <header className="px-3 pt-3 pb-2 border-b border-white/5 flex items-center justify-between">
        <a
          href="https://www.arklabai.com/mum32"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 hover:opacity-85 transition-opacity text-inherit no-underline"
          title="Visit https://www.arklabai.com/mum32"
        >
          <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Sparkles size={13} className="text-white" />
          </div>
          <div>
            <h1 className="text-xs font-bold tracking-wide text-white flex items-center gap-1.5">
              mum32
              <span className="text-[9px] font-mono font-normal px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                v0.1.0
              </span>
            </h1>
            <p className="text-[10px] text-indigo-300/70 hover:text-indigo-200 transition-colors">
              Memory for your AI Harness & Agents
            </p>
          </div>
        </a>

        {/* Counter Badge */}
        <div className="text-[10px] font-mono text-white/50 bg-white/5 px-2 py-0.5 rounded border border-white/5 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>{entries.length} memories</span>
        </div>
      </header>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="mx-3 mt-2 p-2 rounded-md bg-indigo-600/90 text-white text-[11px] font-medium flex items-center justify-between gap-2 shadow-xl shadow-indigo-900/40 animate-fade-in border border-indigo-400/30">
          <div className="flex items-center gap-1.5 min-w-0">
            <CheckCircle2 size={13} className="flex-shrink-0 text-emerald-300" />
            <span className="truncate">{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-white/60 hover:text-white flex-shrink-0"
          >
            <X size={12} />
          </button>
        </div>
      )}

      {/* Top Bar: Search & Filter Pills */}
      <section className="px-3 pt-2.5 pb-2 border-b border-white/5 space-y-2">
        <div className="relative">
          <Search size={12} className="absolute left-2.5 top-2.5 text-white/40" />
          <input
            className="input-field pl-8 pr-7 py-1.5 text-[11px]"
            placeholder="Search decisions, rules, tokens, tags..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-2 text-white/40 hover:text-white/80"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar">
          {FILTER_PILLS.map(pill => {
            const isActive = filterMode === pill.value;
            let count = 0;
            if (pill.value === 'all') { count = entries.length; }
            else if (pill.value === 'pinned') { count = pinnedCount; }
            else { count = entries.filter(e => e.mode === pill.value).length; }

            return (
              <button
                key={pill.value}
                onClick={() => setFilterMode(pill.value)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                    : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80'
                }`}
              >
                <span>{pill.label}</span>
                <span className={`text-[9px] ${isActive ? 'text-white/80' : 'text-white/30'}`}>
                  ({count})
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        {/* Section A: Quick-Capture Form */}
        <CaptureForm
          onSave={handleSaveEntry}
          onCaptureClipboard={handleCaptureClipboard}
          clipboardText={clipboardText}
        />

        {/* Section B: Memory Stream */}
        <div className="pt-2">
          <div className="px-3 pb-1.5 flex items-center justify-between text-[10px] text-white/40 uppercase tracking-wider font-semibold">
            <span>Memory Ledger</span>
            <span>{filterMode === 'all' ? 'All Entries' : filterMode}</span>
          </div>
          <MemoryStream
            entries={entries}
            onPin={handleTogglePin}
            onDelete={handleDeleteEntry}
            onUpdate={handleUpdateEntry}
            filterMode={filterMode}
            searchQuery={searchQuery}
          />
        </div>
      </main>

      {/* Section C: Bottom Actions Toolbar */}
      <footer className="p-2.5 border-t border-white/10 bg-[#181825]/95 backdrop-blur-md space-y-1.5">
        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={handleCopyContext}
            disabled={entries.length === 0}
            className="btn-primary flex items-center justify-center gap-1.5 text-[11px] py-1.5 disabled:opacity-40"
            title="Format all pinned & active decisions into a prompt context block"
          >
            <Copy size={12} />
            <span>Copy Context</span>
          </button>

          <button
            onClick={handleSyncAgentsMd}
            disabled={entries.length === 0}
            className="btn-ghost flex items-center justify-center gap-1.5 text-[11px] py-1.5 hover:border-indigo-500/40"
            title="Auto-sync pinned rules to AGENTS.md in project root"
          >
            <RefreshCw size={11} className="text-indigo-400" />
            <span>Sync AGENTS.md</span>
          </button>
        </div>

        <div className="flex items-center justify-between px-1 text-[10px] text-white/30">
          <div className="flex items-center gap-2">
            <span>📌 {pinnedCount} pinned</span>
            <span>•</span>
            <span>🛡️ {constraintCount} rules</span>
          </div>

          <button
            onClick={handleClearStale}
            disabled={entries.length === 0}
            className="hover:text-red-400 transition-colors flex items-center gap-1"
            title="Clear unpinned memories older than 30 days"
          >
            <Trash2 size={10} />
            <span>Clear Stale</span>
          </button>
        </div>
      </footer>
    </div>
  );
};

export default App;
