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
  targetElement?: string;
  constraintType?: ConstraintType;
  scope: Scope;
  tags: string[];
  pinned: boolean;
  timestamp: number;
  tokens?: string[];
}

export interface WebviewMessage {
  type: string;
  payload?: unknown;
}

export interface VSCodeAPI {
  postMessage(message: WebviewMessage): void;
  getState(): unknown;
  setState(state: unknown): void;
}
