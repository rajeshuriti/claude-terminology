import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, X, CheckCircle2, Bookmark, Clock, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';
import { useSearch } from '@/hooks/useSearch';
import { categories } from '@/data/categories';
import { useAppStore } from '@/store/appStore';
import type { Concept } from '@/types';

const DIFFICULTY_COLORS = {
  beginner: { bg: 'bg-emerald-100', text: 'text-emerald-700', dark: 'bg-emerald-900/30 text-emerald-300' },
  intermediate: { bg: 'bg-sky-100', text: 'text-sky-700', dark: 'bg-sky-900/30 text-sky-300' },
  advanced: { bg: 'bg-violet-100', text: 'text-violet-700', dark: 'bg-violet-900/30 text-violet-300' },
};

function ConceptCard({ concept }: { concept: Concept }) {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();
  const { darkMode, completedConcepts, bookmarkedConcepts, toggleCompleted, toggleBookmark, addRecentlyViewed } = useAppStore();

  const diff = DIFFICULTY_COLORS[concept.difficulty];
  const isCompleted = completedConcepts.includes(concept.id);
  const isBookmarked = bookmarkedConcepts.includes(concept.id);

  const catData = categories.find((c) => c.id === concept.categoryId);

  const handleNavigate = () => {
    addRecentlyViewed(concept.id);
    navigate(`/concept/${concept.id}`);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={handleNavigate}
      className={`rounded-2xl border transition-shadow hover:shadow-md cursor-pointer ${
        darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'
      } ${isCompleted ? (darkMode ? 'border-emerald-700/50' : 'border-emerald-200') : ''}`}
    >
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0"
            style={{ backgroundColor: catData?.color + '20', color: catData?.color }}
          >
            {catData?.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{concept.term}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${darkMode ? diff.dark : `${diff.bg} ${diff.text}`}`}>
                {concept.difficulty}
              </span>
              {isCompleted && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${darkMode ? 'bg-emerald-900/30 text-emerald-300' : 'bg-emerald-100 text-emerald-700'}`}>
                  ✓ Done
                </span>
              )}
            </div>
            <div className={`text-xs mt-0.5 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{concept.category}</div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={(e) => { e.stopPropagation(); toggleBookmark(concept.id); }}
              className={`p-1.5 rounded-lg transition-colors ${
                isBookmarked
                  ? 'text-amber-500'
                  : darkMode ? 'text-slate-500 hover:text-slate-300' : 'text-slate-300 hover:text-slate-600'
              }`}
            >
              <Bookmark size={14} fill={isBookmarked ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); toggleCompleted(concept.id); }}
              className={`p-1.5 rounded-lg transition-colors ${
                isCompleted
                  ? 'text-emerald-500'
                  : darkMode ? 'text-slate-500 hover:text-slate-300' : 'text-slate-300 hover:text-slate-600'
              }`}
            >
              <CheckCircle2 size={14} />
            </button>
          </div>
        </div>

        <p className={`text-sm mt-3 leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
          {concept.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {concept.tags.slice(0, 4).map((tag) => (
            <span key={tag} className={`text-xs px-2 py-0.5 rounded-md ${darkMode ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
              #{tag}
            </span>
          ))}
          <span className={`text-xs flex items-center gap-1 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
            <Clock size={10} /> {concept.estimatedTime}m
          </span>
        </div>
      </div>

      {/* Expandable section */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className={`px-4 pb-4 space-y-3 border-t ${darkMode ? 'border-slate-700' : 'border-slate-50'}`}>
              <div className="pt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className={`text-xs font-semibold uppercase tracking-wide mb-1 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Purpose</div>
                  <div className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{concept.purpose}</div>
                </div>
                <div>
                  <div className={`text-xs font-semibold uppercase tracking-wide mb-1 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Usage</div>
                  <div className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{concept.usage}</div>
                </div>
              </div>
              <div>
                <div className={`text-xs font-semibold uppercase tracking-wide mb-1 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Example</div>
                <div className={`text-sm rounded-lg px-3 py-2 font-mono ${darkMode ? 'bg-slate-900 text-sky-300' : 'bg-slate-50 text-sky-700'}`}>
                  {concept.example}
                </div>
              </div>
              <div className={`p-3 rounded-xl border-l-4 border-amber-400 ${darkMode ? 'bg-amber-900/10' : 'bg-amber-50'}`}>
                <div className={`text-xs font-semibold mb-1 ${darkMode ? 'text-amber-400' : 'text-amber-700'}`}>Key Insight</div>
                <div className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{concept.insight}</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <div className={`flex items-center justify-between px-4 py-2.5 border-t ${darkMode ? 'border-slate-700' : 'border-slate-50'}`}>
        <button
          onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
          className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-slate-700'}`}
        >
          {expanded ? <><ChevronUp size={14} /> Collapse</> : <><ChevronDown size={14} /> Show details</>}
        </button>
        <span className="flex items-center gap-1.5 text-xs font-medium text-sky-500">
          Full view <ArrowRight size={12} />
        </span>
      </div>
    </motion.div>
  );
}

export function ExplorerPage() {
  const { darkMode, searchQuery, setSearchQuery, selectedCategory, setSelectedCategory, difficultyFilter, setDifficultyFilter } = useAppStore();
  const [showFilters, setShowFilters] = useState(false);

  const results = useSearch(searchQuery, selectedCategory, difficultyFilter);

  const textPrimary = darkMode ? 'text-white' : 'text-slate-900';
  const textMuted = darkMode ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className={`min-h-full ${darkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
      {/* Sticky search bar */}
      <div className={`sticky top-0 z-20 border-b p-4 ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
        <div className="max-w-5xl mx-auto">
          <div className="flex gap-3">
            <div className={`flex items-center gap-2 flex-1 px-4 py-2.5 rounded-xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
              <Search size={16} className={textMuted} />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search 85+ concepts by term, purpose, usage..."
                className={`flex-1 bg-transparent text-sm outline-none placeholder-slate-400 ${textPrimary}`}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className={`${textMuted} hover:text-slate-400`}>
                  <X size={14} />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                showFilters || selectedCategory || difficultyFilter
                  ? 'bg-sky-500 text-white border-sky-500'
                  : darkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Filter size={15} />
              Filters
              {(selectedCategory || difficultyFilter) && <span className="w-1.5 h-1.5 bg-white rounded-full" />}
            </button>
          </div>

          {/* Filters panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-3 flex flex-wrap gap-2">
                  <div className={`text-xs font-semibold my-auto ${textMuted}`}>Difficulty:</div>
                  {['beginner', 'intermediate', 'advanced'].map((d) => (
                    <button
                      key={d}
                      onClick={() => setDifficultyFilter(difficultyFilter === d ? null : d)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-colors ${
                        difficultyFilter === d
                          ? d === 'beginner' ? 'bg-emerald-500 text-white' : d === 'intermediate' ? 'bg-sky-500 text-white' : 'bg-violet-500 text-white'
                          : darkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                  <div className={`text-xs font-semibold my-auto ml-2 ${textMuted}`}>Category:</div>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                        selectedCategory === cat.id
                          ? 'text-white'
                          : darkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                      }`}
                      style={selectedCategory === cat.id ? { backgroundColor: cat.color } : {}}
                    >
                      {cat.icon} {cat.name.split(' ')[0]}
                    </button>
                  ))}
                  {(selectedCategory || difficultyFilter) && (
                    <button
                      onClick={() => { setSelectedCategory(null); setDifficultyFilter(null); }}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors text-rose-500 hover:text-rose-400`}
                    >
                      Clear all
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className={`mt-2 text-xs ${textMuted}`}>
            {results.length} concept{results.length !== 1 ? 's' : ''} found
          </div>
        </div>
      </div>

      {/* Concept Grid */}
      <div className="max-w-5xl mx-auto p-4">
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3"
        >
          <AnimatePresence>
            {results.map((concept) => (
              <ConceptCard key={concept.id} concept={concept} />
            ))}
          </AnimatePresence>
        </motion.div>

        {results.length === 0 && (
          <div className={`text-center py-16 ${textMuted}`}>
            <Search size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-base font-medium">No concepts found</p>
            <p className="text-sm mt-1">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
