import { useState, useEffect } from 'react';
import { Menu, Sun, Moon, Search, Zap } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { GlobalSearchOverlay } from '@/components/GlobalSearchOverlay';

interface HeaderProps {
  onMenuClick: () => void;
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

  const dm = darkMode;
  const modes: Array<{ key: 'beginner' | 'intermediate' | 'advanced'; label: string; color: string }> = [
    { key: 'beginner',     label: 'Beginner', color: 'text-emerald-500' },
    { key: 'intermediate', label: 'Mid',       color: 'text-sky-500'    },
    { key: 'advanced',     label: 'Advanced',  color: 'text-violet-500' },
  ];

  return (
    <>
      <header className={`flex items-center gap-3 px-4 h-14 shrink-0 border-b ${dm ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
        <button
          onClick={onMenuClick}
          className={`p-2 rounded-lg transition-colors lg:hidden ${dm ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}
        >
          <Menu size={20} />
        </button>

        {/* Search trigger */}
        <button
          onClick={() => setSearchOpen(true)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors flex-1 max-w-sm ${dm ? 'bg-slate-800 hover:bg-slate-700 text-slate-400' : 'bg-slate-100 hover:bg-slate-200 text-slate-500'}`}
        >
          <Search size={14} />
          <span>Search all AI systems, labs, security…</span>
          <kbd className={`ml-auto text-xs px-1.5 py-0.5 rounded border hidden sm:block ${dm ? 'border-slate-600 text-slate-500 bg-slate-700' : 'border-slate-300 text-slate-400 bg-white'}`}>⌘K</kbd>
        </button>

        <div className="flex items-center gap-2 ml-auto">
          {/* Learning mode */}
          <div className={`hidden sm:flex items-center gap-1 p-1 rounded-lg ${dm ? 'bg-slate-800' : 'bg-slate-100'}`}>
            {modes.map(({ key, label, color }) => (
              <button
                key={key}
                onClick={() => setLearningMode(key)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  learningMode === key
                    ? dm ? 'bg-slate-700 text-white shadow' : 'bg-white text-slate-900 shadow'
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
            className={`p-2 rounded-lg transition-colors ${dm ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-600'}`}
          >
            {dm ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      <GlobalSearchOverlay
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        dm={dm}
      />
    </>
  );
}
