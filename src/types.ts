export type MemoryMode = 'design' | 'constraint' | 'prompt' | 'note';
export type DesignCategory = 'Typography' | 'Colors' | 'Animation' | 'Layout' | 'Spacing' | 'Other';
export type ConstraintType = 'never' | 'style' | 'workflow';
export type Scope = 'global' | 'workspace' | string;

export interface MemoryEntry {
  id: string;
  mode: MemoryMode;
  title: string;
  content: string;
  category?: DesignCategory | string;
  targetElement?: string; // e.g. "Navbar", "Hero Section", "Buttons"
  constraintType?: ConstraintType;
  scope: Scope;
  tags: string[];
  pinned: boolean;
  timestamp: number;
  tokens?: string[]; // css classes, font names extracted
}

export interface Ledger {
  version: string;
  workspaceId: string;
  entries: MemoryEntry[];
  lastSynced?: number;
}

export interface WebviewMessage {
  type:
    | 'saveEntry'
    | 'deleteEntry'
    | 'pinEntry'
    | 'updateEntry'
    | 'copyContext'
    | 'syncAgentsMd'
    | 'clearStale'
    | 'captureClipboard'
    | 'search'
    | 'ready';
  payload?: unknown;
}

export interface HostMessage {
  type: 'entriesUpdated' | 'copied' | 'synced' | 'error' | 'clipboardContent';
  payload?: unknown;
}
