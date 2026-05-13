import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftRight, ChevronDown, Search, ArrowRight, ChevronUp } from 'lucide-react';
import { comparisons } from '@/data/comparisons';
import { concepts, conceptMap } from '@/data/concepts';
import { categoryMap } from '@/data/categories';
import { useAppStore } from '@/store/appStore';
import { enrichedContent, generateFallbackContent } from '@/data/enrichedConceptContent';
import type { RichAnalogy, ModeEntry } from '@/data/enrichedConceptContent';

// ─── Mini Mode Table ─────────────────────────────────────────────────────────

function MiniModeTable({ modes, dm }: { modes: ModeEntry[]; dm: boolean }) {
  return (
    <div className={`rounded-xl border overflow-hidden text-xs ${dm ? 'border-slate-600' : 'border-slate-200'}`}>
      {modes.map((m, i) => (
        <div key={i} className={`flex gap-0 border-b last:border-0 ${dm ? 'border-slate-700' : 'border-slate-100'}`}>
          <div className={`px-3 py-2 font-mono font-semibold shrink-0 w-28 ${dm ? 'bg-slate-900 text-sky-300' : 'bg-slate-50 text-sky-700'}`}>{m.value}</div>
          <div className={`px-3 py-2 leading-relaxed ${dm ? 'text-slate-300' : 'text-slate-600'}`}>{m.meaning}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Mini Analogy Card ────────────────────────────────────────────────────────

function MiniAnalogyCard({ analogy, dm }: { analogy: RichAnalogy; dm: boolean }) {
  const [openIdx, setOpenIdx] = useState(0);

  return (
    <div className={`rounded-xl border overflow-hidden ${dm ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
      <div className={`px-4 py-3 border-b flex items-center gap-2 ${dm ? 'border-slate-700 bg-slate-900/60' : 'border-slate-100 bg-slate-50'}`}>
        <span className="text-xl">{analogy.emoji}</span>
        <span className={`text-xs font-bold ${dm ? 'text-white' : 'text-slate-900'}`}>{analogy.domain}</span>
      </div>
      <div className={`px-4 py-2.5 border-b text-xs leading-relaxed ${dm ? 'border-slate-700 text-slate-400' : 'border-slate-100 text-slate-500'}`}>
        {analogy.setting}
      </div>
      {/* Character mapping condensed */}
      <div className={`px-4 py-2 border-b ${dm ? 'border-slate-700' : 'border-slate-100'}`}>
        {analogy.characters.slice(0, 3).map((c, i) => (
          <div key={i} className="flex items-center gap-1.5 text-xs py-0.5">
            <span className={`font-semibold shrink-0 ${dm ? 'text-sky-400' : 'text-sky-600'}`}>{c.role}</span>
            <ArrowRight size={10} className={dm ? 'text-slate-600' : 'text-slate-300'} />
            <span className={dm ? 'text-slate-400' : 'text-slate-500'}>{c.represents}</span>
          </div>
        ))}
      </div>
      {/* Scenarios as tabs */}
      <div className="divide-y" style={{ borderColor: dm ? '#334155' : '#f1f5f9' }}>
        {analogy.scenarios.slice(0, 3).map((s, i) => (
          <div key={i}>
            <button onClick={() => setOpenIdx(i === openIdx ? -1 : i)}
              className={`w-full flex items-center gap-2 px-4 py-2.5 text-left text-xs ${dm ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50'}`}>
              <span className={`font-semibold shrink-0 w-4 text-center rounded ${dm ? 'text-sky-300' : 'text-sky-600'}`}>{i + 1}</span>
              <span className={`flex-1 font-medium truncate ${dm ? 'text-white' : 'text-slate-800'}`}>{s.mode}</span>
              {i === openIdx ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
            {i === openIdx && (
              <div className={`px-4 pb-3 space-y-2`}>
                <p className={`text-xs leading-relaxed ${dm ? 'text-slate-300' : 'text-slate-600'}`}>{s.behavior}</p>
                <p className={`text-xs rounded-lg p-2 ${dm ? 'bg-slate-700 text-slate-300' : 'bg-slate-50 text-slate-600'}`}>
                  <span className="font-semibold">→ </span>{s.consequence}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className={`px-4 py-2.5 border-t text-xs ${dm ? 'border-slate-700 text-amber-300 bg-slate-900/40' : 'border-slate-100 text-amber-700 bg-amber-50/50'}`}>
        <span className="font-semibold">Key: </span>{analogy.takeaway}
      </div>
    </div>
  );
}

// ─── Concept Picker ───────────────────────────────────────────────────────────

function ConceptPicker({
  selected, onSelect, exclude, label, dm,
}: {
  selected: string | null;
  onSelect: (id: string) => void;
  exclude: string | null;
  label: string;
  dm: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');

  const filtered = useMemo(() =>
    concepts.filter(c => c.id !== exclude && (
      q === '' || c.term.toLowerCase().includes(q.toLowerCase()) || c.category.toLowerCase().includes(q.toLowerCase())
    )).slice(0, 40),
    [q, exclude]
  );

  const sel = selected ? conceptMap.get(selected) : null;
  const selCat = sel ? categoryMap.get(sel.categoryId) : null;

  return (
    <div className="relative">
      <div className={`text-xs font-semibold uppercase tracking-wide mb-1.5 ${dm ? 'text-slate-400' : 'text-slate-500'}`}>{label}</div>
      <button onClick={() => setOpen(!open)}
        className={`flex items-center justify-between w-full px-3 py-2.5 rounded-xl border text-sm transition-colors ${
          dm ? 'bg-slate-800 border-slate-600 text-white hover:border-slate-500' : 'bg-white border-slate-200 text-slate-900 hover:border-slate-300'
        }`}>
        {sel ? (
          <span className="flex items-center gap-2">
            <span>{selCat?.icon}</span>
            <span className="font-medium">{sel.term}</span>
          </span>
        ) : (
          <span className={dm ? 'text-slate-400' : 'text-slate-400'}>Pick a concept…</span>
        )}
        <ChevronDown size={15} className={dm ? 'text-slate-400' : 'text-slate-400'} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            className={`absolute top-full mt-1 left-0 right-0 rounded-xl border shadow-2xl z-20 overflow-hidden ${dm ? 'bg-slate-800 border-slate-600' : 'bg-white border-slate-200'}`}>
            <div className={`flex items-center gap-2 px-3 py-2 border-b ${dm ? 'border-slate-700' : 'border-slate-100'}`}>
              <Search size={13} className={dm ? 'text-slate-400' : 'text-slate-400'} />
              <input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="Search concepts…"
                className={`flex-1 text-xs bg-transparent outline-none ${dm ? 'text-white placeholder-slate-500' : 'text-slate-900 placeholder-slate-400'}`} />
            </div>
            <div className="max-h-52 overflow-y-auto">
              {filtered.map(c => {
                const cat = categoryMap.get(c.categoryId);
                return (
                  <button key={c.id} onClick={() => { onSelect(c.id); setOpen(false); setQ(''); }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-left text-xs transition-colors ${
                      c.id === selected ? 'bg-sky-500 text-white' : dm ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-700 hover:bg-slate-50'
                    }`}>
                    <span className="text-base leading-none shrink-0">{cat?.icon}</span>
                    <div className="min-w-0">
                      <div className="font-medium truncate">{c.term}</div>
                      <div className={`truncate ${c.id === selected ? 'text-sky-200' : dm ? 'text-slate-500' : 'text-slate-400'}`}>{c.category}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Live Comparison Panel ────────────────────────────────────────────────────

function LiveCompare({ idA, idB, dm }: { idA: string; idB: string; dm: boolean }) {
  const navigate = useNavigate();
  const conA = conceptMap.get(idA);
  const conB = conceptMap.get(idB);
  if (!conA || !conB) return null;

  const catA = categoryMap.get(conA.categoryId);
  const catB = categoryMap.get(conB.categoryId);
  const cA = enrichedContent[idA] ?? generateFallbackContent(conA);
  const cB = enrichedContent[idB] ?? generateFallbackContent(conB);

  const rows = [
    { label: 'Category', a: conA.category, b: conB.category },
    { label: 'Difficulty', a: conA.difficulty, b: conB.difficulty },
    { label: 'Cert Priority', a: `${conA.certificationPriority}/5`, b: `${conB.certificationPriority}/5` },
    { label: 'Purpose', a: conA.purpose, b: conB.purpose },
    { label: 'When to use', a: conA.usage, b: conB.usage },
    { label: 'Key insight', a: conA.insight, b: conB.insight },
    { label: 'Advantages', a: cA.tradeoffs.advantages.slice(0, 2).join(' · '), b: cB.tradeoffs.advantages.slice(0, 2).join(' · ') },
    { label: 'Risks', a: cA.tradeoffs.disadvantages[0] ?? '—', b: cB.tradeoffs.disadvantages[0] ?? '—' },
  ];

  return (
    <div className="space-y-5">
      {/* Concept header */}
      <div className="grid grid-cols-2 gap-4">
        {[{ con: conA, cat: catA, id: idA }, { con: conB, cat: catB, id: idB }].map(({ con, cat, id }) => (
          <button key={id} onClick={() => navigate(`/concept/${id}`)}
            className={`rounded-2xl border p-4 text-left transition-all hover:shadow-md ${dm ? 'bg-slate-800 border-slate-700 hover:border-slate-500' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                style={{ backgroundColor: (cat?.color ?? '#0ea5e9') + '20' }}>
                {cat?.icon}
              </div>
              <div>
                <div className={`text-sm font-bold ${dm ? 'text-white' : 'text-slate-900'}`}>{con.term}</div>
                <div className={`text-xs ${dm ? 'text-slate-400' : 'text-slate-500'}`}>{con.category}</div>
              </div>
            </div>
            <p className={`text-xs leading-relaxed ${dm ? 'text-slate-300' : 'text-slate-600'}`}>{con.description}</p>
            <div className="flex gap-2 mt-2">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                con.difficulty === 'beginner' ? dm ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-50 text-emerald-700'
                : con.difficulty === 'intermediate' ? dm ? 'bg-sky-900/30 text-sky-400' : 'bg-sky-50 text-sky-700'
                : dm ? 'bg-violet-900/30 text-violet-400' : 'bg-violet-50 text-violet-700'
              }`}>{con.difficulty}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${dm ? 'bg-amber-900/30 text-amber-400' : 'bg-amber-50 text-amber-700'}`}>
                ★ {con.certificationPriority}/5
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Side-by-side table */}
      <div className={`rounded-2xl border overflow-hidden ${dm ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
        <div className={`grid grid-cols-3 border-b text-xs font-semibold uppercase tracking-wide ${dm ? 'border-slate-700 bg-slate-900' : 'border-slate-100 bg-slate-50'}`}>
          <div className={`p-3 ${dm ? 'text-slate-500' : 'text-slate-400'}`}>Aspect</div>
          <div className="p-3 border-l text-sky-500" style={{ borderColor: dm ? '#334155' : '#e2e8f0' }}>{conA.term}</div>
          <div className="p-3 border-l text-violet-500" style={{ borderColor: dm ? '#334155' : '#e2e8f0' }}>{conB.term}</div>
        </div>
        {rows.map((row, i) => (
          <div key={i} className={`grid grid-cols-3 border-b last:border-0 ${dm ? 'border-slate-700' : 'border-slate-50'}`}>
            <div className={`p-3 text-xs font-semibold ${dm ? 'text-slate-500 bg-slate-900/40' : 'text-slate-400 bg-slate-50/50'}`}>{row.label}</div>
            <div className={`p-3 border-l text-xs leading-relaxed ${dm ? 'border-slate-700 text-slate-200' : 'border-slate-100 text-slate-700'}`}>{row.a}</div>
            <div className={`p-3 border-l text-xs leading-relaxed ${dm ? 'border-slate-700 text-slate-200' : 'border-slate-100 text-slate-700'}`}>{row.b}</div>
          </div>
        ))}
      </div>

      {/* Analogy comparison */}
      {(cA.primaryAnalogy || cB.primaryAnalogy) && (
        <div>
          <div className={`text-xs font-semibold uppercase tracking-wide mb-3 ${dm ? 'text-slate-400' : 'text-slate-500'}`}>Everyday Analogy</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className={`text-xs font-semibold mb-2 text-sky-500`}>{conA.term}</div>
              {cA.primaryAnalogy
                ? <MiniAnalogyCard analogy={cA.primaryAnalogy} dm={dm} />
                : <div className={`rounded-xl border p-4 text-xs ${dm ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-white border-slate-200 text-slate-500'}`}>No analogy available yet.</div>
              }
            </div>
            <div>
              <div className={`text-xs font-semibold mb-2 text-violet-500`}>{conB.term}</div>
              {cB.primaryAnalogy
                ? <MiniAnalogyCard analogy={cB.primaryAnalogy} dm={dm} />
                : <div className={`rounded-xl border p-4 text-xs ${dm ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-white border-slate-200 text-slate-500'}`}>No analogy available yet.</div>
              }
            </div>
          </div>
        </div>
      )}

      {/* Enterprise analogy comparison */}
      {(cA.enterpriseAnalogy || cB.enterpriseAnalogy) && (
        <div>
          <div className={`text-xs font-semibold uppercase tracking-wide mb-3 ${dm ? 'text-slate-400' : 'text-slate-500'}`}>Enterprise Analogy</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className={`text-xs font-semibold mb-2 text-sky-500`}>{conA.term}</div>
              {cA.enterpriseAnalogy
                ? <MiniAnalogyCard analogy={cA.enterpriseAnalogy} dm={dm} />
                : <div className={`rounded-xl border p-4 text-xs ${dm ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-white border-slate-200 text-slate-500'}`}>No analogy available yet.</div>
              }
            </div>
            <div>
              <div className={`text-xs font-semibold mb-2 text-violet-500`}>{conB.term}</div>
              {cB.enterpriseAnalogy
                ? <MiniAnalogyCard analogy={cB.enterpriseAnalogy} dm={dm} />
                : <div className={`rounded-xl border p-4 text-xs ${dm ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-white border-slate-200 text-slate-500'}`}>No analogy available yet.</div>
              }
            </div>
          </div>
        </div>
      )}

      {/* Modes table comparison */}
      {(cA.modesTable || cB.modesTable) && (
        <div>
          <div className={`text-xs font-semibold uppercase tracking-wide mb-3 ${dm ? 'text-slate-400' : 'text-slate-500'}`}>Modes &amp; Values</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[{ con: conA, c: cA }, { con: conB, c: cB }].map(({ con, c }) => (
              <div key={con.id}>
                <div className={`text-xs font-semibold mb-2 ${con.id === idA ? 'text-sky-500' : 'text-violet-500'}`}>{con.term}</div>
                {c.modesTable
                  ? <MiniModeTable modes={c.modesTable} dm={dm} />
                  : <div className={`rounded-xl border p-4 text-xs ${dm ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-white border-slate-200 text-slate-500'}`}>No mode table for this concept.</div>
                }
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function ComparePage() {
  const { darkMode } = useAppStore();
  const dm = darkMode;
  const [tab, setTab] = useState<'curated' | 'live'>('live');

  // Curated state
  const [selected, setSelected] = useState(comparisons[0].id);
  const [dropOpen, setDropOpen] = useState(false);

  // Live state
  const [liveA, setLiveA] = useState<string | null>('temperature');
  const [liveB, setLiveB] = useState<string | null>('top-p');

  const comparison = comparisons.find(c => c.id === selected) ?? comparisons[0];

  const textPrimary = dm ? 'text-white' : 'text-slate-900';
  const textMuted = dm ? 'text-slate-400' : 'text-slate-500';
  const cardBg = dm ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100';

  return (
    <div className={`min-h-full ${dm ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <div className="max-w-5xl mx-auto p-4 md:p-6">
        <div className="flex items-center gap-2 mb-1">
          <ArrowLeftRight size={20} className="text-sky-500" />
          <h1 className={`text-xl font-bold ${textPrimary}`}>Compare Concepts</h1>
        </div>
        <p className={`text-sm mb-5 ${textMuted}`}>Side-by-side comparisons with analogies, modes, and production context</p>

        {/* Tab switcher */}
        <div className={`flex gap-1 mb-5 p-1 rounded-2xl w-fit ${dm ? 'bg-slate-800' : 'bg-slate-100'}`}>
          <button onClick={() => setTab('live')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${tab === 'live' ? 'bg-sky-500 text-white' : dm ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}>
            Live Compare
          </button>
          <button onClick={() => setTab('curated')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${tab === 'curated' ? 'bg-violet-500 text-white' : dm ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}>
            Curated Comparisons
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }}>

            {tab === 'live' && (
              <div className="space-y-5">
                {/* Concept pickers */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ConceptPicker selected={liveA} onSelect={setLiveA} exclude={liveB} label="Concept A" dm={dm} />
                  <ConceptPicker selected={liveB} onSelect={setLiveB} exclude={liveA} label="Concept B" dm={dm} />
                </div>

                {liveA && liveB ? (
                  <AnimatePresence mode="wait">
                    <motion.div key={`${liveA}-${liveB}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
                      <LiveCompare idA={liveA} idB={liveB} dm={dm} />
                    </motion.div>
                  </AnimatePresence>
                ) : (
                  <div className={`rounded-2xl border p-10 text-center ${dm ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-white border-slate-200 text-slate-500'}`}>
                    <ArrowLeftRight size={32} className="mx-auto mb-3 opacity-30" />
                    <div className="text-sm">Select two concepts above to compare them side by side</div>
                  </div>
                )}
              </div>
            )}

            {tab === 'curated' && (
              <div>
                {/* Dropdown */}
                <div className="relative mb-5">
                  <button onClick={() => setDropOpen(!dropOpen)}
                    className={`flex items-center justify-between w-full sm:w-80 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${dm ? 'bg-slate-800 border-slate-700 text-white hover:border-slate-600' : 'bg-white border-slate-200 text-slate-900 hover:border-slate-300'}`}>
                    {comparison.title}
                    <ChevronDown size={16} className={textMuted} />
                  </button>
                  <AnimatePresence>
                    {dropOpen && (
                      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                        className={`absolute top-full mt-1 left-0 w-full sm:w-80 rounded-xl border shadow-xl z-10 overflow-hidden ${dm ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                        {comparisons.map(c => (
                          <button key={c.id} onClick={() => { setSelected(c.id); setDropOpen(false); }}
                            className={`w-full px-4 py-2.5 text-sm text-left transition-colors ${c.id === selected ? 'bg-sky-500 text-white' : dm ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-700 hover:bg-slate-50'}`}>
                            {c.title}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Comparison table */}
                <AnimatePresence mode="wait">
                  <motion.div key={selected} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    className={`rounded-2xl border overflow-hidden ${cardBg}`}>
                    <div className={`grid grid-cols-3 border-b ${dm ? 'border-slate-700 bg-slate-900' : 'border-slate-100 bg-slate-50'}`}>
                      <div className={`p-4 text-xs font-semibold uppercase tracking-wider ${textMuted}`}>Aspect</div>
                      <div className="p-4 border-l border-r" style={{ borderColor: dm ? '#334155' : '#e2e8f0' }}>
                        <div className="text-sm font-bold text-sky-500">{comparison.title.split(' vs ')[0]?.trim()}</div>
                      </div>
                      <div className="p-4">
                        <div className="text-sm font-bold text-violet-500">{comparison.title.split(' vs ')[1]?.trim()}</div>
                      </div>
                    </div>
                    {comparison.items.map((item, i) => (
                      <div key={i} className={`grid grid-cols-3 border-b last:border-0 ${dm ? 'border-slate-700' : 'border-slate-50'}`}>
                        <div className={`p-4 ${dm ? 'bg-slate-900/50' : 'bg-slate-50/50'}`}>
                          <span className={`text-xs font-semibold ${textMuted}`}>{item.label}</span>
                        </div>
                        <div className={`p-4 border-l border-r ${dm ? 'border-slate-700' : 'border-slate-100'}`}>
                          <span className={`text-sm leading-relaxed ${dm ? 'text-slate-200' : 'text-slate-700'}`}>{item.a}</span>
                        </div>
                        <div className="p-4">
                          <span className={`text-sm leading-relaxed ${dm ? 'text-slate-200' : 'text-slate-700'}`}>{item.b}</span>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                </AnimatePresence>

                {/* Quick nav grid */}
                <div className="mt-6">
                  <div className={`text-xs font-semibold uppercase tracking-wider mb-3 ${textMuted}`}>All Comparisons</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {comparisons.map(c => (
                      <button key={c.id} onClick={() => setSelected(c.id)}
                        className={`p-4 rounded-xl border text-left transition-all hover:shadow-sm ${c.id === selected
                          ? dm ? 'border-sky-600 bg-sky-900/20' : 'border-sky-400 bg-sky-50'
                          : dm ? 'border-slate-700 bg-slate-800 hover:border-slate-600' : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}>
                        <div className={`text-sm font-semibold ${c.id === selected ? 'text-sky-500' : textPrimary}`}>{c.title}</div>
                        <div className={`text-xs mt-1 ${textMuted}`}>{c.items.length} comparison points</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
