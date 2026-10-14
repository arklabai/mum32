import React, { useState } from 'react';
import { MemoryEntry, MemoryMode } from '../types';
import { Pin, Trash2, Clock, Code2, Layers } from 'lucide-react';

const MODE_LABELS: Record<MemoryMode, string> = {
  design: 'Design',
  constraint: 'Rule',
  prompt: 'Prompt',
  note: 'Note',
};

const MODE_COLORS: Record<MemoryMode, string> = {
  design: 'mode-design',
  constraint: 'mode-constraint',
  prompt: 'mode-prompt',
  note: 'mode-note',
};

function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) { return 'just now'; }
  if (minutes < 60) { return `${minutes}m ago`; }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) { return `${hours}h ago`; }
  return `${Math.floor(hours / 24)}d ago`;
}

interface Props {
  entries: MemoryEntry[];
  onPin: (id: string) => void;
  onDelete: (id: string) => void;
  filterMode: MemoryMode | 'all' | 'pinned';
  searchQuery?: string;
}

export const MemoryStream: React.FC<Props> = ({
  entries,
  onPin,
  onDelete,
  filterMode,
  searchQuery = '',
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = entries.filter(e => {
    // Mode filter
    if (filterMode === 'pinned' && !e.pinned) { return false; }
    if (filterMode !== 'all' && filterMode !== 'pinned' && e.mode !== filterMode) { return false; }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const inTitle = e.title.toLowerCase().includes(q);
      const inContent = e.content.toLowerCase().includes(q);
      const inCategory = e.category?.toLowerCase().includes(q);
      const inTarget = e.targetElement?.toLowerCase().includes(q);
      const inTags = e.tags?.some(t => t.toLowerCase().includes(q));
      const inTokens = e.tokens?.some(tok => tok.toLowerCase().includes(q));
      return Boolean(inTitle || inContent || inCategory || inTarget || inTags || inTokens);
    }

    return true;
  });

  if (filtered.length === 0) {
    return (
      <div className="px-3 py-10 text-center">
        <div className="text-3xl mb-2 opacity-80">🧠</div>
        <p className="text-white/40 text-xs font-medium">
          {searchQuery
            ? `No memories matching "${searchQuery}"`
            : filterMode === 'all'
            ? 'No memories saved yet. Capture your first rule above!'
            : `No ${filterMode} entries recorded.`}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2 px-3 pb-4">
      {filtered.map(entry => (
        <div
          key={entry.id}
          className={`glass rounded-lg p-2.5 cursor-pointer transition-all hover:border-white/20 animate-fade-in ${
            entry.pinned ? 'border-indigo-500/40 bg-indigo-500/10' : ''
          }`}
          onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
        >
          {/* Header row */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap mb-1">
                {entry.pinned && <span className="text-[11px]" title="Pinned">📌</span>}
                <span className={`tag-pill ${MODE_COLORS[entry.mode]}`}>
                  {MODE_LABELS[entry.mode]}
                </span>
                {entry.category && (
                  <span className="tag-pill bg-white/5 text-white/50">{entry.category}</span>
                )}
                {entry.targetElement && (
                  <span className="tag-pill bg-purple-500/20 text-purple-300 flex items-center gap-1">
                    <Layers size={9} />
                    {entry.targetElement}
                  </span>
                )}
                {entry.constraintType && (
                  <span className="tag-pill bg-red-500/15 text-red-300">
                    {entry.constraintType}
                  </span>
                )}
                <span className="tag-pill bg-white/5 text-white/40">{entry.scope}</span>
              </div>
              <p className="text-[12px] font-medium text-white/90 truncate leading-snug">{entry.title}</p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 flex-shrink-0" onClick={e => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => onPin(entry.id)}
                title={entry.pinned ? 'Unpin' : 'Pin to context'}
                className={`p-1 rounded hover:bg-white/10 transition-colors ${
                  entry.pinned ? 'text-indigo-400' : 'text-white/30 hover:text-white/80'
                }`}
              >
                <Pin size={12} />
              </button>
              <button
                type="button"
                onClick={() => onDelete(entry.id)}
                title="Delete memory"
                className="p-1 rounded hover:bg-red-500/20 text-white/30 hover:text-red-400 transition-colors"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>

          {/* Collapsed Preview snippet if not expanded */}
          {expandedId !== entry.id && (
            <p className="text-[11px] text-white/50 truncate mt-1">
              {entry.content}
            </p>
          )}

          {/* Expanded full details */}
          {expandedId === entry.id && (
            <div className="mt-2.5 pt-2 border-t border-white/10 animate-fade-in space-y-2">
              <p className="text-[11px] text-white/75 leading-relaxed whitespace-pre-wrap">{entry.content}</p>

              {/* Tokens badge list */}
              {entry.tokens && entry.tokens.length > 0 && (
                <div className="mt-2">
                  <div className="flex items-center gap-1 text-[10px] text-indigo-300/80 mb-1">
                    <Code2 size={10} />
                    <span>Design Tokens:</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {entry.tokens.map((tok, idx) => (
                      <span key={idx} className="font-mono text-[10px] bg-indigo-500/15 text-indigo-200 px-1.5 py-0.5 rounded border border-indigo-500/20">
                        {tok}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {entry.tags && entry.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {entry.tags.map(tag => (
                    <span key={tag} className="tag-pill bg-white/5 text-white/40">{tag}</span>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-1 pt-1 text-[10px] text-white/30">
                <Clock size={10} />
                <span>Captured {relativeTime(entry.timestamp)}</span>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
