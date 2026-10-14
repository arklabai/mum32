import React, { useState } from 'react';
import { MemoryEntry, MemoryMode, ConstraintType } from '../types';
import { Plus, Zap, Palette, Shield, FileText, StickyNote } from 'lucide-react';

const MODES: { value: MemoryMode; label: string; icon: React.ReactNode; desc: string }[] = [
  { value: 'design', label: 'Design', icon: <Palette size={13} />, desc: 'Typography, colors, spacing, tokens' },
  { value: 'constraint', label: 'Rule', icon: <Shield size={13} />, desc: 'Never-do, invariants, constraints' },
  { value: 'prompt', label: 'Prompt', icon: <FileText size={13} />, desc: 'Capture a prompt snapshot' },
  { value: 'note', label: 'Note', icon: <StickyNote size={13} />, desc: 'Freeform scratchpad entry' },
];

const DESIGN_CATEGORIES = ['Typography', 'Colors', 'Animation', 'Layout', 'Spacing', 'Other'];
const CONSTRAINT_TYPES: { value: ConstraintType; label: string }[] = [
  { value: 'never', label: 'Never Do / Invariant' },
  { value: 'style', label: 'Style / Design Rule' },
  { value: 'workflow', label: 'Workflow Requirement' },
];
const SCOPES = ['workspace', 'global'];

interface Props {
  onSave: (entry: Omit<MemoryEntry, 'id' | 'timestamp'>) => void;
  onCaptureClipboard: () => void;
  clipboardText: string;
}

export const CaptureForm: React.FC<Props> = ({ onSave, onCaptureClipboard, clipboardText }) => {
  const [mode, setMode] = useState<MemoryMode>('design');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Typography');
  const [targetElement, setTargetElement] = useState('');
  const [tokensInput, setTokensInput] = useState('');
  const [constraintType, setConstraintType] = useState<ConstraintType>('never');
  const [scope, setScope] = useState('workspace');
  const [pinned, setPinned] = useState(false);
  const [expanded, setExpanded] = useState(true);

  // When clipboard content arrives, prefill the form
  React.useEffect(() => {
    if (clipboardText) {
      setContent(clipboardText);
      setMode('prompt');
      if (!title) {
        setTitle('Captured Prompt');
      }
    }
  }, [clipboardText]);

  const handleSave = () => {
    if (!title.trim() || !content.trim()) { return; }
    const tags: string[] = [`#${mode}`];
    if (mode === 'design') {
      tags.push(`#${category.toLowerCase()}`);
    }
    if (mode === 'constraint') {
      tags.push(`#${constraintType}`);
    }

    const tokens = tokensInput
      .split(/[,\s]+/)
      .map(t => t.trim())
      .filter(Boolean);

    onSave({
      mode,
      title: title.trim(),
      content: content.trim(),
      category: mode === 'design' ? category : undefined,
      targetElement: mode === 'design' && targetElement.trim() ? targetElement.trim() : undefined,
      tokens: tokens.length > 0 ? tokens : undefined,
      constraintType: mode === 'constraint' ? constraintType : undefined,
      scope,
      tags,
      pinned,
    });

    setTitle('');
    setContent('');
    setTargetElement('');
    setTokensInput('');
    setPinned(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSave();
    }
  };

  return (
    <div className="border-b border-white/5 pb-3">
      {/* Header */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center justify-between px-3 py-2 hover:bg-white/5 transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-indigo-500/20 flex items-center justify-center">
            <Plus size={11} className="text-indigo-400" />
          </div>
          <span className="text-xs font-semibold text-white/80 uppercase tracking-wider">Quick Capture</span>
        </div>
        <span className="text-white/30 text-xs">{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded && (
        <div className="px-3 space-y-2.5 animate-fade-in">
          {/* Mode tabs */}
          <div className="flex gap-1">
            {MODES.map(m => (
              <button
                key={m.value}
                onClick={() => setMode(m.value)}
                title={m.desc}
                className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md text-[11px] font-medium transition-all ${
                  mode === m.value
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                    : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80'
                }`}
              >
                {m.icon}
                {m.label}
              </button>
            ))}
          </div>

          {/* Design Mode Details */}
          {mode === 'design' && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-white/40 block mb-1">Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="input-field text-[11px] py-1"
                >
                  {DESIGN_CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-white/40 block mb-1">Target Element / Page</label>
                <input
                  value={targetElement}
                  onChange={e => setTargetElement(e.target.value)}
                  placeholder="e.g. Navbar, Hero, Global"
                  className="input-field text-[11px] py-1"
                  onKeyDown={handleKeyDown}
                />
              </div>
            </div>
          )}

          {/* Rule Mode Details */}
          {mode === 'constraint' && (
            <div>
              <label className="text-[10px] text-white/40 block mb-1">Constraint Rule Type</label>
              <select
                value={constraintType}
                onChange={e => setConstraintType(e.target.value as ConstraintType)}
                className="input-field text-[11px] py-1"
              >
                {CONSTRAINT_TYPES.map(ct => (
                  <option key={ct.value} value={ct.value}>{ct.label}</option>
                ))}
              </select>
            </div>
          )}

          {/* Title */}
          <div>
            <input
              className="input-field"
              placeholder={
                mode === 'design' ? 'Title: e.g. "Heading font choice"' :
                mode === 'constraint' ? 'Title: e.g. "No scripts in root"' :
                mode === 'prompt' ? 'Title: e.g. "Homepage layout session"' :
                'Note title...'
              }
              value={title}
              onChange={e => setTitle(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          {/* Content */}
          {mode === 'prompt' ? (
            <div className="space-y-1.5">
              <textarea
                className="input-field resize-none"
                rows={4}
                placeholder="Paste or capture the full prompt text..."
                value={content}
                onChange={e => setContent(e.target.value)}
              />
              <button
                type="button"
                onClick={onCaptureClipboard}
                className="btn-ghost w-full flex items-center justify-center gap-1.5 text-[11px]"
              >
                <Zap size={11} className="text-yellow-400" />
                Capture from Clipboard
              </button>
            </div>
          ) : (
            <textarea
              className="input-field resize-none"
              rows={3}
              placeholder={
                mode === 'design' ? 'Decision: e.g. "Headings font-space-grotesk font-bold. Body font-poppins text-gray-700."' :
                mode === 'constraint' ? 'Constraint: e.g. "Never create scripts or temporary test files in project root directory."' :
                'Add your note...'
              }
              value={content}
              onChange={e => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          )}

          {/* Design Mode CSS/Tailwind Tokens */}
          {mode === 'design' && (
            <div>
              <input
                className="input-field text-[11px]"
                placeholder="CSS / Tailwind Tokens (e.g. font-space-grotesk text-indigo-400 md:hover:scale-105)"
                value={tokensInput}
                onChange={e => setTokensInput(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
          )}

          {/* Footer row */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2.5">
              <select
                value={scope}
                onChange={e => setScope(e.target.value)}
                className="input-field w-auto text-[10px] py-1 px-2"
                title="Memory Scope"
              >
                {SCOPES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-white/60 hover:text-white/90 transition-colors select-none">
                <input
                  type="checkbox"
                  checked={pinned}
                  onChange={e => setPinned(e.target.checked)}
                  className="w-3.5 h-3.5 accent-indigo-500 rounded cursor-pointer"
                />
                📌 Pin
              </label>
            </div>
            <button
              onClick={handleSave}
              disabled={!title.trim() || !content.trim()}
              className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none text-[11px] py-1.5 px-3"
            >
              Save to Memory
            </button>
          </div>
          <p className="text-[10px] text-white/30 text-right">⌘+Enter to save</p>
        </div>
      )}
    </div>
  );
};
