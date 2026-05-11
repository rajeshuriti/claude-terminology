import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeftRight, ChevronDown } from 'lucide-react';
import { comparisons } from '@/data/comparisons';
import { useAppStore } from '@/store/appStore';

export function ComparePage() {
  const { darkMode } = useAppStore();
  const [selected, setSelected] = useState(comparisons[0].id);
  const [open, setOpen] = useState(false);

  const comparison = comparisons.find((c) => c.id === selected) ?? comparisons[0];

  const textPrimary = darkMode ? 'text-white' : 'text-slate-900';
  const textMuted = darkMode ? 'text-slate-400' : 'text-slate-500';
  const cardBg = darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100';

  return (
    <div className={`min-h-full ${darkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        <div className="flex items-center gap-2 mb-2">
          <ArrowLeftRight size={20} className="text-sky-500" />
          <h1 className={`text-xl font-bold ${textPrimary}`}>Concept Comparisons</h1>
        </div>
        <p className={`text-sm mb-6 ${textMuted}`}>Side-by-side comparison of closely related or commonly confused concepts</p>

        {/* Comparison selector */}
        <div className="relative mb-6">
          <button
            onClick={() => setOpen(!open)}
            className={`flex items-center justify-between w-full sm:w-80 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${darkMode ? 'bg-slate-800 border-slate-700 text-white hover:bg-slate-750' : 'bg-white border-slate-200 text-slate-900 hover:bg-slate-50'}`}
          >
            {comparison.title}
            <ChevronDown size={16} className={textMuted} />
          </button>
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className={`absolute top-full mt-1 left-0 w-full sm:w-80 rounded-xl border shadow-xl z-10 overflow-hidden ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}
              >
                {comparisons.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => { setSelected(c.id); setOpen(false); }}
                    className={`w-full px-4 py-2.5 text-sm text-left transition-colors ${
                      c.id === selected
                        ? 'bg-sky-500 text-white'
                        : darkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {c.title}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Comparison table */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selected}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`rounded-2xl border overflow-hidden ${cardBg}`}
          >
            {/* Header */}
            <div className={`grid grid-cols-3 border-b ${darkMode ? 'border-slate-700 bg-slate-900' : 'border-slate-100 bg-slate-50'}`}>
              <div className={`p-4 text-xs font-semibold uppercase tracking-wider ${textMuted}`}>Aspect</div>
              <div className="p-4 border-l border-r" style={{ borderColor: darkMode ? '#334155' : '#e2e8f0' }}>
                <div className="text-sm font-bold text-sky-500">
                  {comparison.title.split(' vs ')[0]?.trim() ?? 'Option A'}
                </div>
              </div>
              <div className="p-4">
                <div className="text-sm font-bold text-violet-500">
                  {comparison.title.split(' vs ')[1]?.trim() ?? 'Option B'}
                </div>
              </div>
            </div>

            {/* Rows */}
            {comparison.items.map((item, i) => (
              <div
                key={i}
                className={`grid grid-cols-3 border-b last:border-0 ${darkMode ? 'border-slate-700' : 'border-slate-50'}`}
              >
                <div className={`p-4 ${darkMode ? 'bg-slate-900/50' : 'bg-slate-50/50'}`}>
                  <span className={`text-xs font-semibold ${textMuted}`}>{item.label}</span>
                </div>
                <div className={`p-4 border-l border-r ${darkMode ? 'border-slate-700' : 'border-slate-100'}`}>
                  <span className={`text-sm leading-relaxed ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>{item.a}</span>
                </div>
                <div className="p-4">
                  <span className={`text-sm leading-relaxed ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>{item.b}</span>
                </div>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* All comparisons quick nav */}
        <div className="mt-8">
          <div className={`text-xs font-semibold uppercase tracking-wider mb-3 ${textMuted}`}>All Comparisons</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {comparisons.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelected(c.id)}
                className={`p-4 rounded-xl border text-left transition-all hover:shadow-sm ${
                  c.id === selected
                    ? darkMode ? 'border-sky-600 bg-sky-900/20' : 'border-sky-400 bg-sky-50'
                    : darkMode ? 'border-slate-700 bg-slate-800 hover:border-slate-600' : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className={`text-sm font-semibold ${c.id === selected ? 'text-sky-500' : textPrimary}`}>{c.title}</div>
                <div className={`text-xs mt-1 ${textMuted}`}>{c.items.length} comparison points</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
