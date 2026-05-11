import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Sun, Moon, Search, X, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/appStore';
import { useSearch } from '@/hooks/useSearch';

interface HeaderProps {
  onMenuClick: () => void;
}

function QuickSearch({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('');
  const { darkMode, addRecentlyViewed } = useAppStore();
  const results = useSearch(query);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSelect = (id: string) => {
    addRecentlyViewed(id);
    navigate(`/concept/${id}`);
    onClose();
  };

  return (
    <div className={`w-full max-w-2xl mx-auto rounded-2xl shadow-2xl overflow-hidden ${darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'}`}>
      <div className={`flex items-center gap-3 px-4 py-3 border-b ${darkMode ? 'border-slate-700' : 'border-slate-100'}`}>
        <Search size={18} className="text-slate-400 shrink-0" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search concepts, categories, purposes..."
          className={`flex-1 bg-transparent text-sm outline-none placeholder-slate-400 ${darkMode ? 'text-white' : 'text-slate-900'}`}
        />
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
          <X size={18} />
        </button>
      </div>
      {query.length >= 2 && (
        <div className="max-h-80 overflow-y-auto">
          {results.slice(0, 8).map((concept) => (
            <button
              key={concept.id}
              onClick={() => handleSelect(concept.id)}
              className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-50'}`}
            >
              <div className={`mt-0.5 text-xs font-semibold px-1.5 py-0.5 rounded ${
                concept.difficulty === 'beginner' ? 'bg-emerald-100 text-emerald-700' :
                concept.difficulty === 'intermediate' ? 'bg-sky-100 text-sky-700' :
                'bg-violet-100 text-violet-700'
              }`}>
                {concept.difficulty[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-slate-900'}`}>{concept.term}</div>
                <div className={`text-xs truncate ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{concept.category} · {concept.description.slice(0, 80)}…</div>
              </div>
            </button>
          ))}
          {results.length === 0 && (
            <div className={`px-4 py-8 text-center text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              No concepts found for "{query}"
            </div>
          )}
        </div>
      )}
      {query.length < 2 && (
        <div className={`px-4 py-3 text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
          Type at least 2 characters to search 85+ concepts
        </div>
      )}
    </div>
  );
}

export function Header({ onMenuClick }: HeaderProps) {
  const { darkMode, toggleDarkMode, learningMode, setLearningMode } = useAppStore();
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') setSearchOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const modes: Array<{ key: 'beginner' | 'intermediate' | 'advanced'; label: string; color: string }> = [
    { key: 'beginner', label: 'Beginner', color: 'text-emerald-500' },
    { key: 'intermediate', label: 'Mid', color: 'text-sky-500' },
    { key: 'advanced', label: 'Advanced', color: 'text-violet-500' },
  ];

  return (
    <>
      <header className={`flex items-center gap-3 px-4 h-14 shrink-0 border-b ${darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
        <button
          onClick={onMenuClick}
          className={`p-2 rounded-lg transition-colors lg:hidden ${darkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}
        >
          <Menu size={20} />
        </button>

        {/* Search trigger */}
        <button
          onClick={() => setSearchOpen(true)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors flex-1 max-w-xs ${darkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-400' : 'bg-slate-100 hover:bg-slate-200 text-slate-500'}`}
        >
          <Search size={14} />
          <span>Search concepts…</span>
          <kbd className={`ml-auto text-xs px-1.5 py-0.5 rounded border ${darkMode ? 'border-slate-600 text-slate-500 bg-slate-700' : 'border-slate-300 text-slate-400 bg-white'}`}>⌘K</kbd>
        </button>

        <div className="flex items-center gap-2 ml-auto">
          {/* Learning mode */}
          <div className={`hidden sm:flex items-center gap-1 p-1 rounded-lg ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
            {modes.map(({ key, label, color }) => (
              <button
                key={key}
                onClick={() => setLearningMode(key)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  learningMode === key
                    ? darkMode ? 'bg-slate-700 text-white shadow' : 'bg-white text-slate-900 shadow'
                    : `${color} opacity-60 hover:opacity-100`
                }`}
              >
                <Zap size={10} />
                {label}
              </button>
            ))}
          </div>

          {/* Dark mode toggle */}
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-600'}`}
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      {/* Search modal */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setSearchOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <QuickSearch onClose={() => setSearchOpen(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
