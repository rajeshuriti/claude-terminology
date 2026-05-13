import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bookmark, ArrowRight } from 'lucide-react';
import { conceptMap } from '@/data/concepts';
import { categoryMap } from '@/data/categories';
import { useAppStore } from '@/store/appStore';

export function BookmarksPage() {
  const navigate = useNavigate();
  const { darkMode, bookmarkedConcepts, toggleBookmark, addRecentlyViewed } = useAppStore();

  const bookmarked = bookmarkedConcepts.map((id) => conceptMap.get(id)).filter(Boolean);

  const textPrimary = darkMode ? 'text-white' : 'text-slate-900';
  const textMuted = darkMode ? 'text-slate-400' : 'text-slate-500';
  const cardBg = darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100';

  return (
    <div className={`min-h-full ${darkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        <div className="flex items-center gap-2 mb-6">
          <Bookmark size={20} className="text-amber-500" />
          <h1 className={`text-xl font-bold ${textPrimary}`}>Bookmarks</h1>
          <span className={`text-sm ${textMuted}`}>({bookmarked.length})</span>
        </div>

        {bookmarked.length === 0 ? (
          <div className={`rounded-2xl border p-12 text-center ${cardBg}`}>
            <Bookmark size={40} className={`mx-auto mb-3 ${textMuted} opacity-30`} />
            <p className={`text-base font-medium ${textPrimary}`}>No bookmarks yet</p>
            <p className={`text-sm mt-1 ${textMuted}`}>Bookmark concepts while exploring to save them here</p>
            <button
              onClick={() => navigate('/explorer')}
              className="mt-4 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-sm font-medium transition-colors"
            >
              Start Exploring →
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {bookmarked.map((concept, i) => {
              if (!concept) return null;
              const cat = categoryMap.get(concept.categoryId);
              return (
                <motion.div
                  key={concept.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => { addRecentlyViewed(concept.id); navigate(`/concept/${concept.id}`); }}
                  className={`rounded-2xl border p-4 cursor-pointer hover:shadow-md transition-shadow ${cardBg}`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0"
                      style={{ backgroundColor: cat?.color + '20' }}
                    >
                      {cat?.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-semibold ${textPrimary}`}>{concept.term}</div>
                      <div className={`text-xs mt-0.5 ${textMuted}`}>{concept.category}</div>
                      <p className={`text-xs mt-1.5 leading-relaxed ${textMuted}`}>{concept.description.slice(0, 100)}…</p>
                    </div>
                    <div className="flex flex-col gap-1 shrink-0">
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleBookmark(concept.id); }}
                        className="p-1.5 text-amber-500 hover:text-amber-400 transition-colors"
                      >
                        <Bookmark size={14} fill="currentColor" />
                      </button>
                      <ArrowRight size={14} className={`mt-1.5 mx-1.5 ${textMuted}`} />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
