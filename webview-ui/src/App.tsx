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
  Layers,
  Palette,
  Shield,
  FileText,
  Pin,
  ExternalLink,
  LucideIcon,
} from 'lucide-react';

type FilterType = MemoryMode | 'all' | 'pinned';

interface FilterPill {
  value: FilterType;
  label: string;
  icon: LucideIcon;
}

const FILTER_PILLS: FilterPill[] = [
  { value: 'all', label: 'All', icon: Layers },
  { value: 'design', label: 'Design', icon: Palette },
  { value: 'constraint', label: 'Rules', icon: Shield },
  { value: 'prompt', label: 'Prompts', icon: FileText },
  { value: 'pinned', label: 'Pinned', icon: Pin },
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
          showToast('Context block copied to clipboard. Ready to paste into agent prompt.');
          break;
        }

        case 'synced': {
          showToast('Active rules synced to AGENTS.md');
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
      <header className="px-3 pt-3 pb-2.5 border-b border-white/5 flex items-center justify-between">
        <a
          href="https://www.arklabai.com/mum32"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 hover:opacity-90 transition-opacity text-inherit no-underline group"
          title="Visit https://www.arklabai.com/mum32"
        >
          <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center shadow-md shadow-indigo-500/25 border border-white/10">
            <Sparkles size={13} className="text-white" />
          </div>
          <div>
            <h1 className="text-xs font-semibold tracking-wide text-white flex items-center gap-1.5 leading-none">
              mum32
              <span className="text-[9px] font-mono font-medium px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                v0.1.1
              </span>
            </h1>
            <p className="text-[10px] text-indigo-200/60 group-hover:text-indigo-200/90 transition-colors mt-0.5 flex items-center gap-1">
              Memory Engine for AI Agents
              <ExternalLink size={9} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </p>
          </div>
        </a>

        {/* Counter Badge */}
        <div className="text-[10px] font-mono text-white/60 bg-white/5 px-2 py-0.5 rounded-full border border-white/5 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>{entries.length} memories</span>
        </div>
      </header>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="mx-3 mt-2 p-2 rounded-md bg-indigo-600/95 text-white text-[11px] font-medium flex items-center justify-between gap-2 shadow-lg shadow-indigo-900/40 animate-fade-in border border-indigo-400/30">
          <div className="flex items-center gap-2 min-w-0">
            <CheckCircle2 size={13} className="flex-shrink-0 text-emerald-300" />
            <span className="truncate">{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-white/60 hover:text-white flex-shrink-0 p-0.5 rounded hover:bg-white/10 transition-colors"
          >
            <X size={12} />
          </button>
        </div>
      )}

      {/* Top Bar: Search & Filter Pills */}
      <section className="px-3 pt-2.5 pb-2 border-b border-white/5 space-y-2">
        <div className="relative">
          <Search size={12} className="absolute left-2.5 top-2.5 text-white/40 pointer-events-none" />
          <input
            className="input-field pl-8 pr-7 py-1.5 text-[11px]"
            placeholder="Search decisions, rules, tokens, tags..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-2 p-0.5 rounded hover:bg-white/10 text-white/40 hover:text-white/80 transition-colors"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Category Pills with Lucide Icons */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar">
          {FILTER_PILLS.map(pill => {
            const Icon = pill.icon;
            const isActive = filterMode === pill.value;
            let count = 0;
            if (pill.value === 'all') { count = entries.length; }
            else if (pill.value === 'pinned') { count = pinnedCount; }
            else { count = entries.filter(e => e.mode === pill.value).length; }

            return (
              <button
                key={pill.value}
                onClick={() => setFilterMode(pill.value)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                    : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80'
                }`}
              >
                <Icon size={11} className={isActive ? 'text-white' : 'text-white/40'} />
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
            <span className="capitalize">{filterMode === 'all' ? 'All Entries' : filterMode}</span>
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
      <footer className="p-2.5 border-t border-white/10 bg-[#181825]/95 backdrop-blur-md space-y-2">
        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={handleCopyContext}
            disabled={entries.length === 0}
            className="btn-primary flex items-center justify-center gap-1.5 text-[11px] py-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
            title="Format all pinned & active decisions into a prompt context block"
          >
            <Copy size={12} />
            <span>Copy Context</span>
          </button>

          <button
            onClick={handleSyncAgentsMd}
            disabled={entries.length === 0}
            className="btn-ghost flex items-center justify-center gap-1.5 text-[11px] py-1.5 hover:border-indigo-500/40 disabled:opacity-40 disabled:cursor-not-allowed"
            title="Auto-sync pinned rules to AGENTS.md in project root"
          >
            <RefreshCw size={11} className="text-indigo-400" />
            <span>Sync AGENTS.md</span>
          </button>
        </div>

        {/* Footer Stats Row with Proper React Icons */}
        <div className="flex items-center justify-between px-1 text-[10px] text-white/40">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center gap-1 font-medium text-white/60">
              <Pin size={10} className="text-amber-400 fill-amber-400/20" />
              <span>{pinnedCount} pinned</span>
            </span>
            <span className="text-white/20">•</span>
            <span className="flex items-center gap-1 font-medium text-white/60">
              <Shield size={10} className="text-indigo-400" />
              <span>{constraintCount} rules</span>
            </span>
          </div>

          <button
            onClick={handleClearStale}
            disabled={entries.length === 0}
            className="hover:text-red-400 transition-colors flex items-center gap-1 py-0.5 px-1 rounded hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed"
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
