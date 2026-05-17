import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ArrowRight, ChevronRight, Zap } from 'lucide-react';
import { useGlobalSearch } from '@/hooks/useGlobalSearch';
import {
  CATEGORY_META, MODULE_EMOJI, LEARNING_JOURNEYS, MOST_CONNECTED,
} from '@/data/globalSearchIndex';
import type { SearchEntry, SearchCategory } from '@/data/globalSearchIndex';

interface Props {
  open: boolean;
  onClose: () => void;
  dm: boolean;
}

// ─── Difficulty badge ─────────────────────────────────────────────────────────

const DIFF_COLOR: Record<string, string> = {
  beginner:   'bg-emerald-500/15 text-emerald-400',
  developer:  'bg-sky-500/15 text-sky-400',
  engineer:   'bg-violet-500/15 text-violet-400',
  enterprise: 'bg-amber-500/15 text-amber-400',
};

function DiffBadge({ d }: { d: string }) {
  return (
    <span className={`text-xs px-1.5 py-0.5 rounded font-medium capitalize ${DIFF_COLOR[d] ?? 'bg-slate-500/15 text-slate-400'}`}>
      {d}
    </span>
  );
}

// ─── Category badge ───────────────────────────────────────────────────────────

function CatBadge({ cat }: { cat: SearchCategory }) {
  const m = CATEGORY_META[cat];
  return (
    <span className={`text-xs px-1.5 py-0.5 rounded-full border font-medium ${m.bg} ${m.text} ${m.border}`}>
      {m.label}
    </span>
  );
}

// ─── Result card ──────────────────────────────────────────────────────────────

function ResultCard({
  entry, active, dm, onHover, onClick,
}: {
  entry: SearchEntry;
  active: boolean;
  dm: boolean;
  onHover: () => void;
  onClick: () => void;
}) {
  const modEmoji = MODULE_EMOJI[entry.module] ?? '📄';
  return (
    <button
      onMouseEnter={onHover}
      onClick={onClick}
      className={`w-full text-left flex items-start gap-3 px-4 py-3 transition-colors ${
        active
          ? dm ? 'bg-slate-700' : 'bg-slate-100'
          : dm ? 'hover:bg-slate-800' : 'hover:bg-slate-50'
      }`}
    >
      <span className="text-xl shrink-0 mt-0.5">{modEmoji}</span>
      <div className="flex-1 min-w-0">
        <div className={`text-sm font-semibold truncate ${dm ? 'text-white' : 'text-slate-900'}`}>
          {entry.title}
        </div>
        <div className={`text-xs truncate ${dm ? 'text-slate-400' : 'text-slate-500'}`}>
          {entry.module}
        </div>
        <div className={`text-xs mt-1 line-clamp-1 ${dm ? 'text-slate-400' : 'text-slate-600'}`}>
          {entry.description}
        </div>
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0">
        <CatBadge cat={entry.category} />
        <DiffBadge d={entry.difficulty} />
      </div>
    </button>
  );
}

// ─── Category group ───────────────────────────────────────────────────────────

function CategoryGroup({
  cat, entries, activeIdx, globalOffset, dm, onHover, onSelect,
}: {
  cat: SearchCategory;
  entries: SearchEntry[];
  activeIdx: number;
  globalOffset: number;
  dm: boolean;
  onHover: (idx: number) => void;
  onSelect: (entry: SearchEntry) => void;
}) {
  const m = CATEGORY_META[cat];
  return (
    <div>
      <div className={`flex items-center gap-2 px-4 py-2 sticky top-0 z-10 ${dm ? 'bg-slate-900 border-b border-slate-800' : 'bg-white border-b border-slate-100'}`}>
        <span className="text-sm">{m.emoji}</span>
        <span className={`text-xs font-bold uppercase tracking-wider ${m.text}`}>{m.label}</span>
        <span className={`text-xs ml-auto ${dm ? 'text-slate-600' : 'text-slate-400'}`}>{entries.length}</span>
      </div>
      {entries.map((e, i) => (
        <ResultCard
          key={e.id}
          entry={e}
          active={activeIdx === globalOffset + i}
          dm={dm}
          onHover={() => onHover(globalOffset + i)}
          onClick={() => onSelect(e)}
        />
      ))}
    </div>
  );
}

// ─── Detail panel ─────────────────────────────────────────────────────────────

function DetailPanel({ entry, dm, onNavigate }: { entry: SearchEntry | null; dm: boolean; onNavigate: (path: string) => void }) {
  if (!entry) {
    return (
      <div className={`flex flex-col h-full ${dm ? 'bg-slate-900' : 'bg-slate-50'}`}>
        <div className="p-5">
          <div className={`text-xs font-bold uppercase tracking-wider mb-3 ${dm ? 'text-slate-500' : 'text-slate-400'}`}>
            Most Connected Concepts
          </div>
          <div className="flex flex-wrap gap-2">
            {MOST_CONNECTED.map(t => (
              <span key={t} className={`text-xs px-2.5 py-1 rounded-full border cursor-default ${dm ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-white border-slate-200 text-slate-700'}`}>
                {t}
              </span>
            ))}
          </div>
        </div>
        <div className={`mx-5 border-t ${dm ? 'border-slate-800' : 'border-slate-200'}`} />
        <div className="p-5">
          <div className={`text-xs font-bold uppercase tracking-wider mb-3 ${dm ? 'text-slate-500' : 'text-slate-400'}`}>
            Platform Modules
          </div>
          <div className="space-y-1">
            {Object.entries(MODULE_EMOJI).map(([mod, emoji]) => (
              <div key={mod} className={`flex items-center gap-2 text-xs ${dm ? 'text-slate-400' : 'text-slate-600'}`}>
                <span>{emoji}</span><span>{mod}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const modEmoji = MODULE_EMOJI[entry.module] ?? '📄';

  // Detect if any journey matches this entry
  const journeyKey = Object.keys(LEARNING_JOURNEYS).find(k =>
    entry.tags.some(t => t.toLowerCase().includes(k)) ||
    entry.title.toLowerCase().includes(k)
  );
  const journey = journeyKey ? LEARNING_JOURNEYS[journeyKey] : null;

  return (
    <div className={`flex flex-col h-full overflow-y-auto ${dm ? 'bg-slate-900' : 'bg-white'}`}>
      {/* Header */}
      <div className={`p-5 border-b ${dm ? 'border-slate-800' : 'border-slate-100'}`}>
        <div className="flex items-start gap-3 mb-3">
          <span className="text-2xl shrink-0">{modEmoji}</span>
          <div>
            <div className={`text-base font-bold ${dm ? 'text-white' : 'text-slate-900'}`}>{entry.title}</div>
            <div className={`text-xs ${dm ? 'text-slate-400' : 'text-slate-500'}`}>{entry.module}</div>
          </div>
        </div>
        <div className="flex items-center gap-2 mb-3">
          <CatBadge cat={entry.category} />
          <DiffBadge d={entry.difficulty} />
        </div>
        <button
          onClick={() => onNavigate(entry.modulePath)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-sm font-medium transition-colors"
        >
          Open <ArrowRight size={14} />
        </button>
      </div>

      {/* Description */}
      <div className="p-4">
        <p className={`text-sm leading-relaxed mb-4 ${dm ? 'text-slate-300' : 'text-slate-700'}`}>
          {entry.description}
        </p>

        {/* Why it matters */}
        <div className={`p-3 rounded-xl border mb-4 ${dm ? 'bg-sky-950/30 border-sky-800/40' : 'bg-sky-50 border-sky-200'}`}>
          <div className="text-xs font-bold text-sky-400 mb-1 uppercase tracking-wider flex items-center gap-1">
            <Zap size={11} /> Why it matters
          </div>
          <p className={`text-xs leading-relaxed ${dm ? 'text-slate-300' : 'text-slate-700'}`}>
            {entry.whyItMatters}
          </p>
        </div>

        {/* Tags */}
        {entry.tags.length > 0 && (
          <div className="mb-4">
            <div className={`text-xs font-bold uppercase tracking-wider mb-2 ${dm ? 'text-slate-500' : 'text-slate-400'}`}>Tags</div>
            <div className="flex flex-wrap gap-1">
              {entry.tags.slice(0, 8).map(t => (
                <span key={t} className={`text-xs px-2 py-0.5 rounded border ${dm ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Related topics */}
        {entry.related.length > 0 && (
          <div className="mb-4">
            <div className={`text-xs font-bold uppercase tracking-wider mb-2 ${dm ? 'text-slate-500' : 'text-slate-400'}`}>Related Topics</div>
            <div className="space-y-1">
              {entry.related.map(r => (
                <div key={r} className={`flex items-center gap-2 text-xs py-1 ${dm ? 'text-slate-300' : 'text-slate-700'}`}>
                  <ChevronRight size={11} className="text-sky-400 shrink-0" />{r}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Learning journey */}
        {journey && (
          <div className={`p-3 rounded-xl border ${dm ? 'bg-violet-950/30 border-violet-800/40' : 'bg-violet-50 border-violet-200'}`}>
            <div className="text-xs font-bold text-violet-400 mb-2 uppercase tracking-wider">
              📚 {journey.title}
            </div>
            <div className="space-y-1">
              {journey.steps.map((s, i) => (
                <div key={i} className={`flex items-center gap-2 text-xs ${dm ? 'text-slate-300' : 'text-slate-700'}`}>
                  <span className="text-violet-400 font-mono">{i + 1}.</span>{s}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ dm }: { dm: boolean }) {
  return (
    <div className={`flex flex-col items-center justify-center h-48 ${dm ? 'text-slate-500' : 'text-slate-400'}`}>
      <Search size={28} className="mb-3 opacity-30" />
      <p className="text-sm">No results found</p>
      <p className="text-xs mt-1">Try a different keyword or browse the platform modules</p>
    </div>
  );
}

// ─── Main overlay ─────────────────────────────────────────────────────────────

const CATEGORY_ORDER: SearchCategory[] = ['concept', 'lab', 'security', 'architecture', 'tool', 'mcp', 'certification'];

export function GlobalSearchOverlay({ open, onClose, dm }: Props) {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<SearchCategory | null>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [hoveredEntry, setHoveredEntry] = useState<SearchEntry | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const results = useGlobalSearch(query, activeCategory);

  // Group results by category, respecting order
  const grouped = CATEGORY_ORDER
    .map(cat => ({ cat, entries: results.filter(e => e.category === cat) }))
    .filter(g => g.entries.length > 0);

  // Flat list for keyboard navigation
  const flat = grouped.flatMap(g => g.entries);

  // Offsets per group for globalOffset prop
  const offsets: number[] = [];
  let off = 0;
  for (const g of grouped) { offsets.push(off); off += g.entries.length; }

  const activeEntry = hoveredEntry ?? (flat[activeIdx] ?? null);

  const handleSelect = useCallback((entry: SearchEntry) => {
    navigate(entry.modulePath);
    onClose();
    setQuery('');
  }, [navigate, onClose]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIdx(i => Math.min(i + 1, flat.length - 1));
        setHoveredEntry(null);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIdx(i => Math.max(i - 1, 0));
        setHoveredEntry(null);
      } else if (e.key === 'Enter' && flat[activeIdx]) {
        handleSelect(flat[activeIdx]);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, flat, activeIdx, handleSelect]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setActiveIdx(0);
      setHoveredEntry(null);
      setActiveCategory(null);
    }
  }, [open]);

  // Reset active index when results change
  useEffect(() => { setActiveIdx(0); }, [query, activeCategory]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className={`w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col ${dm ? 'bg-slate-900 border border-slate-700' : 'bg-white border border-slate-200'}`}
            style={{ maxHeight: 'calc(100vh - 8rem)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Search input */}
            <div className={`flex items-center gap-3 px-4 py-3.5 border-b shrink-0 ${dm ? 'border-slate-700' : 'border-slate-200'}`}>
              <Search size={18} className={dm ? 'text-slate-400 shrink-0' : 'text-slate-400 shrink-0'} />
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search across all AI systems, labs, security, architecture, tools…"
                className={`flex-1 bg-transparent text-sm outline-none placeholder-slate-400 ${dm ? 'text-white' : 'text-slate-900'}`}
              />
              {query && (
                <button onClick={() => setQuery('')} className="text-slate-400 hover:text-slate-600 shrink-0">
                  <X size={16} />
                </button>
              )}
              <kbd className={`shrink-0 text-xs px-1.5 py-0.5 rounded border hidden sm:block ${dm ? 'border-slate-600 bg-slate-800 text-slate-500' : 'border-slate-300 bg-slate-50 text-slate-400'}`}>
                esc
              </kbd>
            </div>

            {/* Category filter pills */}
            <div className={`flex items-center gap-1.5 px-4 py-2 border-b overflow-x-auto shrink-0 ${dm ? 'border-slate-800' : 'border-slate-100'}`}>
              <button
                onClick={() => setActiveCategory(null)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  !activeCategory
                    ? dm ? 'bg-slate-700 text-white' : 'bg-slate-900 text-white'
                    : dm ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                All
              </button>
              {CATEGORY_ORDER.map(cat => {
                const m = CATEGORY_META[cat];
                const active = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(active ? null : cat)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                      active
                        ? `${m.bg} ${m.text} border ${m.border}`
                        : dm ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    {m.emoji} {m.label}
                  </button>
                );
              })}
            </div>

            {/* Body */}
            <div className="flex flex-1 min-h-0">

              {/* Results list */}
              <div className={`flex-1 overflow-y-auto ${dm ? 'border-r border-slate-800' : 'border-r border-slate-100'}`}>
                {query.length < 2 && !activeCategory ? (
                  <div className="p-4">
                    <div className={`text-xs font-bold uppercase tracking-wider mb-3 ${dm ? 'text-slate-500' : 'text-slate-400'}`}>
                      Most Connected Concepts
                    </div>
                    <div className="flex flex-wrap gap-2 mb-5">
                      {MOST_CONNECTED.map(t => (
                        <button
                          key={t}
                          onClick={() => setQuery(t)}
                          className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${dm ? 'bg-slate-800 border-slate-700 text-slate-300 hover:border-sky-600 hover:text-sky-300' : 'bg-white border-slate-200 text-slate-700 hover:border-sky-400 hover:text-sky-600'}`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                    <div className={`text-xs font-bold uppercase tracking-wider mb-3 ${dm ? 'text-slate-500' : 'text-slate-400'}`}>
                      Jump to Learning Path
                    </div>
                    <div className="space-y-1">
                      {Object.entries(LEARNING_JOURNEYS).map(([key, j]) => (
                        <button key={key} onClick={() => setQuery(key)}
                          className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${dm ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-50 text-slate-700'}`}>
                          <ArrowRight size={12} className="text-violet-400 shrink-0" />
                          {j.title}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : grouped.length === 0 ? (
                  <EmptyState dm={dm} />
                ) : (
                  grouped.map((g, gi) => (
                    <CategoryGroup
                      key={g.cat}
                      cat={g.cat}
                      entries={g.entries}
                      activeIdx={activeIdx}
                      globalOffset={offsets[gi]}
                      dm={dm}
                      onHover={idx => { setActiveIdx(idx); setHoveredEntry(flat[idx]); }}
                      onSelect={handleSelect}
                    />
                  ))
                )}
              </div>

              {/* Detail panel — hidden on small screens */}
              <div className="hidden md:flex flex-col w-72 shrink-0 overflow-hidden">
                <DetailPanel entry={activeEntry} dm={dm} onNavigate={path => { navigate(path); onClose(); setQuery(''); }} />
              </div>
            </div>

            {/* Footer */}
            <div className={`flex items-center gap-4 px-4 py-2 border-t shrink-0 ${dm ? 'border-slate-800 bg-slate-900' : 'border-slate-100 bg-slate-50'}`}>
              <span className={`text-xs ${dm ? 'text-slate-600' : 'text-slate-400'}`}>
                {flat.length} result{flat.length !== 1 ? 's' : ''}
                {query.length >= 2 ? ` for "${query}"` : ''}
              </span>
              <div className={`flex items-center gap-3 ml-auto text-xs ${dm ? 'text-slate-600' : 'text-slate-400'}`}>
                <span><kbd className="font-mono">↑↓</kbd> navigate</span>
                <span><kbd className="font-mono">↵</kbd> open</span>
                <span><kbd className="font-mono">esc</kbd> close</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
