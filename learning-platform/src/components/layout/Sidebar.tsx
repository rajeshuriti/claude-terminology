import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Search, GitBranch, HelpCircle,
  Map, ArrowLeftRight, X, ChevronRight, ChevronDown, Trophy, Bookmark
} from 'lucide-react';
import { categories } from '@/data/categories';
import { useAppStore } from '@/store/appStore';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

// Active-state gradient per path — extracted from inline ternary chain
const ACTIVE_GRADIENTS: Record<string, string> = {
  '/internals':      'from-violet-600 to-sky-500',
  '/commands':       'from-sky-500 to-emerald-500',
  '/certification':  'from-amber-500 to-orange-500',
  '/study':          'from-emerald-500 to-sky-500',
  '/connectors':     'from-cyan-500 to-sky-600',
  '/architecture':   'from-violet-500 to-pink-500',
  '/mcp-mastery':    'from-pink-500 to-violet-600',
  '/mcp-ecosystem':  'from-emerald-500 to-sky-500',
  '/context-lab':    'from-sky-500 to-violet-600',
  '/failure-lab':    'from-red-600 to-orange-500',
  '/cheat-sheets':   'from-sky-600 to-cyan-500',
  '/command-center': 'from-violet-600 to-indigo-500',
  '/security-lab':   'from-red-600 to-orange-600',
};

function activeClass(path: string): string {
  const gradient = ACTIVE_GRADIENTS[path];
  return gradient
    ? `bg-gradient-to-r ${gradient} text-white shadow-sm`
    : 'bg-sky-500 text-white shadow-sm';
}

type NavItem = {
  path: string;
  icon?: typeof LayoutDashboard | null;
  label: string;
  emoji?: string;
  isNew?: boolean;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

const navGroups: NavGroup[] = [
  {
    label: 'Core',
    items: [
      { path: '/',          icon: LayoutDashboard, label: 'Dashboard' },
      { path: '/bookmarks', icon: Bookmark,        label: 'Bookmarks' },
    ],
  },
  {
    label: 'Learn',
    items: [
      { path: '/explorer',    icon: Search,        label: 'Concept Explorer' },
      { path: '/graph',       icon: GitBranch,     label: 'Concept Graph' },
      { path: '/compare',     icon: ArrowLeftRight, label: 'Compare Concepts' },
      { path: '/internals',   emoji: '⚙️',         label: 'Claude Internals' },
    ],
  },
  {
    label: 'Build',
    items: [
      { path: '/cheat-sheets',   emoji: '⌨️', label: 'Cheat Sheets' },
      { path: '/command-center', emoji: '⚡', label: 'Command Center', isNew: false },
      { path: '/commands',       emoji: '/',  label: 'Slash Commands' },
      { path: '/architecture',   emoji: '🏗️', label: 'Architecture Explorer' },
    ],
  },
  {
    label: 'Certify',
    items: [
      { path: '/quiz',          icon: HelpCircle, label: 'Quiz & Flashcards' },
      { path: '/roadmap',       icon: Map,        label: 'Study Roadmaps' },
      { path: '/study',         emoji: '📖',      label: 'Exam Study Guide' },
      { path: '/certification', emoji: '🏆',      label: 'Cert Practice Exam' },
    ],
  },
  {
    label: 'Systems',
    items: [
      { path: '/context-lab',   emoji: '🧪', label: 'Context & Token Lab' },
      { path: '/mcp-mastery',   emoji: '🔌', label: 'MCP Mastery' },
      { path: '/connectors',    emoji: '🔗', label: 'Connectors & Workflows' },
      { path: '/mcp-ecosystem', emoji: '🌐', label: 'MCP Ecosystem' },
    ],
  },
  {
    label: 'Labs',
    items: [
      { path: '/failure-lab',  emoji: '🔥', label: 'AI Failure Lab' },
      { path: '/security-lab', emoji: '🛡️', label: 'AI Security Lab' },
    ],
  },
];

const devItems: NavItem[] = [
  { path: '/studio', emoji: '✺', label: 'Claude Studio' },
];

function SidebarContent({ onClose }: { onClose: () => void }) {
  const { darkMode, selectedCategory, setSelectedCategory, completedConcepts, totalCorrect, totalQuizAttempts } = useAppStore();
  const navigate = useNavigate();

  // Core, Learn, Build open by default; others collapsed
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set(['Core', 'Learn', 'Build']));
  const [categoriesOpen, setCategoriesOpen] = useState(false);

  const toggleGroup = (label: string) =>
    setOpenGroups(prev => {
      const next = new Set(prev);
      next.has(label) ? next.delete(label) : next.add(label);
      return next;
    });

  const accuracy = totalQuizAttempts > 0 ? Math.round((totalCorrect / totalQuizAttempts) * 100) : 0;

  const handleCategoryClick = (catId: string) => {
    setSelectedCategory(catId);
    navigate('/explorer');
    onClose();
  };

  const dm = darkMode;
  const inactiveClass = dm
    ? 'text-slate-300 hover:bg-slate-800 hover:text-white'
    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900';
  const groupHeaderClass = `w-full flex items-center justify-between px-2 py-1 rounded-md text-xs font-semibold uppercase tracking-wider transition-colors ${
    dm ? 'text-slate-500 hover:text-slate-300 hover:bg-slate-800' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
  }`;

  return (
    <div className={`flex flex-col h-full ${dm ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900'} overflow-hidden`}>
      {/* Header */}
      <div className={`flex items-center justify-between p-4 border-b ${dm ? 'border-slate-700' : 'border-slate-100'}`}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-violet-600 flex items-center justify-center text-white text-sm font-bold">C</div>
          <div>
            <div className="text-sm font-semibold">Claude Learning</div>
            <div className={`text-xs ${dm ? 'text-slate-400' : 'text-slate-500'}`}>SA Foundation</div>
          </div>
        </div>
        <button onClick={onClose} className={`p-1.5 rounded-lg transition-colors ${dm ? 'hover:bg-slate-700' : 'hover:bg-slate-100'} lg:hidden`}>
          <X size={16} />
        </button>
      </div>

      {/* Quick Stats */}
      <div className={`mx-3 mt-3 p-3 rounded-xl ${dm ? 'bg-slate-800' : 'bg-slate-50'}`}>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-base font-bold text-sky-500">{completedConcepts.length}</div>
            <div className={`text-xs ${dm ? 'text-slate-400' : 'text-slate-500'}`}>Done</div>
          </div>
          <div>
            <div className="text-base font-bold text-violet-500">{totalQuizAttempts}</div>
            <div className={`text-xs ${dm ? 'text-slate-400' : 'text-slate-500'}`}>Quizzed</div>
          </div>
          <div>
            <div className="text-base font-bold text-emerald-500">{accuracy}%</div>
            <div className={`text-xs ${dm ? 'text-slate-400' : 'text-slate-500'}`}>Accuracy</div>
          </div>
        </div>
      </div>

      {/* Navigation — grouped */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {navGroups.map((group) => {
          const isOpen = openGroups.has(group.label);
          return (
            <div key={group.label}>
              <button
                onClick={() => toggleGroup(group.label)}
                className={groupHeaderClass}
              >
                <span>{group.label}</span>
                <motion.span
                  animate={{ rotate: isOpen ? 0 : -90 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center"
                >
                  <ChevronDown size={12} />
                </motion.span>
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.18, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-0.5 pt-0.5 pb-1">
                      {group.items.map(({ path, icon: Icon, label, emoji, isNew }) => (
                        <NavLink
                          key={path}
                          to={path}
                          end={path === '/'}
                          onClick={onClose}
                          className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                              isActive ? activeClass(path) : inactiveClass
                            }`
                          }
                        >
                          {emoji
                            ? <span className="text-base leading-none">{emoji}</span>
                            : Icon ? <Icon size={16} /> : null}
                          {label}
                          {isNew && (
                            <span className="ml-auto text-xs px-1.5 py-0.5 rounded-full bg-violet-500/30 text-violet-300 font-bold" style={{ fontSize: 9 }}>
                              NEW
                            </span>
                          )}
                        </NavLink>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}

        {/* Concept Categories — collapsible */}
        <div>
          <button
            onClick={() => setCategoriesOpen(o => !o)}
            className={groupHeaderClass}
          >
            <span>Categories</span>
            <motion.span
              animate={{ rotate: categoriesOpen ? 0 : -90 }}
              transition={{ duration: 0.15 }}
              className="flex items-center"
            >
              <ChevronDown size={12} />
            </motion.span>
          </button>
          <AnimatePresence initial={false}>
            {categoriesOpen && (
              <motion.div
                key="cats"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.18, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="space-y-0.5 pt-0.5 pb-1">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => handleCategoryClick(cat.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150 text-left ${
                        selectedCategory === cat.id
                          ? dm ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-900'
                          : dm
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Developer Tools */}
        <div>
          <div className={`text-xs font-semibold uppercase tracking-wider px-2 py-1 ${dm ? 'text-slate-600' : 'text-slate-300'}`}>
            Developer Tools
          </div>
          <div className="space-y-0.5">
            {devItems.map(({ path, label, emoji }) => (
              <NavLink
                key={path}
                to={path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-600 to-orange-500 text-white shadow-sm'
                      : dm
                        ? 'text-slate-500 hover:bg-slate-800 hover:text-slate-300'
                        : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                  }`
                }
              >
                <span className="text-base leading-none">{emoji}</span>
                {label}
              </NavLink>
            ))}
          </div>
        </div>
      </div>

      {/* Cert Badge */}
      <div className={`p-3 border-t ${dm ? 'border-slate-700' : 'border-slate-100'}`}>
        <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl ${dm ? 'bg-gradient-to-r from-sky-900/40 to-violet-900/40 border border-sky-700/30' : 'bg-gradient-to-r from-sky-50 to-violet-50 border border-sky-200/50'}`}>
          <Trophy size={18} className="text-sky-500 shrink-0" />
          <div>
            <div className={`text-xs font-semibold ${dm ? 'text-sky-300' : 'text-sky-700'}`}>SA Foundation Prep</div>
            <div className={`text-xs ${dm ? 'text-slate-400' : 'text-slate-500'}`}>85+ concepts to master</div>
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
