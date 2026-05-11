import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Search, GitBranch, HelpCircle,
  Map, ArrowLeftRight, X, ChevronRight, Trophy, Bookmark
} from 'lucide-react';
import { categories } from '@/data/categories';
import { useAppStore } from '@/store/appStore';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/explorer', icon: Search, label: 'Concept Explorer' },
  { path: '/graph', icon: GitBranch, label: 'Concept Graph' },
  { path: '/quiz', icon: HelpCircle, label: 'Quiz & Flashcards' },
  { path: '/roadmap', icon: Map, label: 'Study Roadmaps' },
  { path: '/compare', icon: ArrowLeftRight, label: 'Compare Concepts' },
  { path: '/bookmarks', icon: Bookmark, label: 'Bookmarks' },
  { path: '/internals', icon: null, label: 'Claude Internals', emoji: '⚙️', isNew: true },
];

function SidebarContent({ onClose }: { onClose: () => void }) {
  const { darkMode, selectedCategory, setSelectedCategory, completedConcepts, totalCorrect, totalQuizAttempts } = useAppStore();
  const navigate = useNavigate();

  const accuracy = totalQuizAttempts > 0 ? Math.round((totalCorrect / totalQuizAttempts) * 100) : 0;

  const handleCategoryClick = (catId: string) => {
    setSelectedCategory(catId);
    navigate('/explorer');
    onClose();
  };

  return (
    <div className={`flex flex-col h-full ${darkMode ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900'} overflow-hidden`}>
      {/* Header */}
      <div className={`flex items-center justify-between p-4 border-b ${darkMode ? 'border-slate-700' : 'border-slate-100'}`}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-violet-600 flex items-center justify-center text-white text-sm font-bold">C</div>
          <div>
            <div className="text-sm font-semibold">Claude Learning</div>
            <div className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>SA Foundation</div>
          </div>
        </div>
        <button onClick={onClose} className={`p-1.5 rounded-lg transition-colors ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'} lg:hidden`}>
          <X size={16} />
        </button>
      </div>

      {/* Quick Stats */}
      <div className={`mx-3 mt-3 p-3 rounded-xl ${darkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-base font-bold text-sky-500">{completedConcepts.length}</div>
            <div className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Done</div>
          </div>
          <div>
            <div className="text-base font-bold text-violet-500">{totalQuizAttempts}</div>
            <div className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Quizzed</div>
          </div>
          <div>
            <div className="text-base font-bold text-emerald-500">{accuracy}%</div>
            <div className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Accuracy</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        <div className={`text-xs font-semibold uppercase tracking-wider mb-2 px-2 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Navigation</div>
        {navItems.map(({ path, icon: Icon, label, emoji, isNew } : { path: string; icon: typeof LayoutDashboard | null; label: string; emoji?: string; isNew?: boolean }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? path === '/internals'
                    ? 'bg-gradient-to-r from-violet-600 to-sky-500 text-white shadow-sm'
                    : 'bg-sky-500 text-white shadow-sm'
                  : darkMode
                    ? 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`
            }
          >
            {emoji ? <span className="text-base leading-none">{emoji}</span> : Icon ? <Icon size={16} /> : null}
            {label}
            {isNew && <span className="ml-auto text-xs px-1.5 py-0.5 rounded-full bg-violet-500/30 text-violet-300 font-bold" style={{ fontSize: 9 }}>NEW</span>}
          </NavLink>
        ))}

        {/* Categories */}
        <div className={`text-xs font-semibold uppercase tracking-wider mt-4 mb-2 px-2 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Categories</div>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategoryClick(cat.id)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150 text-left ${
              selectedCategory === cat.id
                ? darkMode ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-900'
                : darkMode
                  ? 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
            }`}
          >
            <span className="text-base leading-none">{cat.icon}</span>
            <span className="flex-1 truncate">{cat.name}</span>
            <ChevronRight size={12} className="opacity-50 shrink-0" />
          </button>
        ))}
      </div>

      {/* Cert Badge */}
      <div className={`p-3 border-t ${darkMode ? 'border-slate-700' : 'border-slate-100'}`}>
        <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl ${darkMode ? 'bg-gradient-to-r from-sky-900/40 to-violet-900/40 border border-sky-700/30' : 'bg-gradient-to-r from-sky-50 to-violet-50 border border-sky-200/50'}`}>
          <Trophy size={18} className="text-sky-500 shrink-0" />
          <div>
            <div className={`text-xs font-semibold ${darkMode ? 'text-sky-300' : 'text-sky-700'}`}>SA Foundation Prep</div>
            <div className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>85+ concepts to master</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const { darkMode } = useAppStore();

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', stiffness: 400, damping: 40 }}
            className={`fixed left-0 top-0 bottom-0 w-72 z-50 shadow-2xl lg:hidden ${darkMode ? 'bg-slate-900' : 'bg-white'}`}
          >
            <SidebarContent onClose={onClose} />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <aside className={`hidden lg:flex flex-col w-64 shrink-0 border-r ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
        <SidebarContent onClose={onClose} />
      </aside>
    </>
  );
}
