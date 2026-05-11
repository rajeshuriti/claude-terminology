import { useParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, Bookmark, Clock, Star, Link, AlertTriangle, Code, Target, Lightbulb } from 'lucide-react';
import { conceptMap, concepts } from '@/data/concepts';
import { categoryMap } from '@/data/categories';
import { useAppStore } from '@/store/appStore';

export function ConceptDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { darkMode, completedConcepts, bookmarkedConcepts, toggleCompleted, toggleBookmark, addRecentlyViewed } = useAppStore();

  const concept = id ? conceptMap.get(id) : null;

  useEffect(() => {
    if (id) addRecentlyViewed(id);
  }, [id, addRecentlyViewed]);

  if (!concept) {
    return (
      <div className={`min-h-full flex items-center justify-center ${darkMode ? 'bg-slate-950 text-slate-400' : 'bg-slate-50 text-slate-500'}`}>
        <div className="text-center">
          <p className="text-lg font-medium">Concept not found</p>
          <button onClick={() => navigate('/explorer')} className="mt-2 text-sky-500 hover:underline">Back to Explorer</button>
        </div>
      </div>
    );
  }

  const cat = categoryMap.get(concept.categoryId);
  const isCompleted = completedConcepts.includes(concept.id);
  const isBookmarked = bookmarkedConcepts.includes(concept.id);
  const relatedConcepts = concept.relatedConcepts.map((rid) => conceptMap.get(rid)).filter(Boolean).slice(0, 6);

  const textPrimary = darkMode ? 'text-white' : 'text-slate-900';
  const textMuted = darkMode ? 'text-slate-400' : 'text-slate-500';
  const cardBg = darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100';

  const diffColor = concept.difficulty === 'beginner' ? 'text-emerald-500' : concept.difficulty === 'intermediate' ? 'text-sky-500' : 'text-violet-500';
  const diffBg = concept.difficulty === 'beginner' ? (darkMode ? 'bg-emerald-900/30' : 'bg-emerald-50') : concept.difficulty === 'intermediate' ? (darkMode ? 'bg-sky-900/30' : 'bg-sky-50') : (darkMode ? 'bg-violet-900/30' : 'bg-violet-50');

  return (
    <div className={`min-h-full ${darkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className={`flex items-center gap-2 text-sm mb-4 transition-colors ${darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
        >
          <ArrowLeft size={16} />
          Back
        </button>

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl border p-6 mb-4 ${cardBg}`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                style={{ backgroundColor: cat?.color + '20' }}
              >
                {cat?.icon}
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${textPrimary}`}>{concept.term}</h1>
                <div className={`text-sm mt-0.5 ${textMuted}`}>{concept.category}</div>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${diffBg} ${diffColor}`}>
                    {concept.difficulty}
                  </span>
                  <span className={`flex items-center gap-1 text-xs ${textMuted}`}>
                    <Clock size={11} /> {concept.estimatedTime} min
                  </span>
                  <span className={`flex items-center gap-1 text-xs ${textMuted}`}>
                    <Star size={11} className="text-amber-400" /> Priority: {concept.certificationPriority}/5
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => toggleBookmark(concept.id)}
                className={`p-2 rounded-xl transition-colors ${
                  isBookmarked
                    ? 'text-amber-500 bg-amber-50 dark:bg-amber-900/20'
                    : darkMode ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-400 hover:bg-slate-100'
                }`}
              >
                <Bookmark size={18} fill={isBookmarked ? 'currentColor' : 'none'} />
              </button>
              <button
                onClick={() => toggleCompleted(concept.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                  isCompleted
                    ? 'bg-emerald-500 text-white'
                    : darkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <CheckCircle2 size={15} />
                {isCompleted ? 'Completed' : 'Mark Done'}
              </button>
            </div>
          </div>

          <p className={`mt-4 text-base leading-relaxed ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>
            {concept.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-4">
            {concept.tags.map((tag) => (
              <span key={tag} className={`text-xs px-2.5 py-1 rounded-lg ${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                #{tag}
              </span>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Purpose */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`rounded-2xl border p-5 ${cardBg}`}
          >
            <div className="flex items-center gap-2 mb-3">
              <Target size={16} className="text-sky-500" />
              <h2 className={`text-sm font-semibold ${textPrimary}`}>Purpose</h2>
            </div>
            <p className={`text-sm leading-relaxed ${textMuted}`}>{concept.purpose}</p>
          </motion.div>

          {/* Usage */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className={`rounded-2xl border p-5 ${cardBg}`}
          >
            <div className="flex items-center gap-2 mb-3">
              <Code size={16} className="text-violet-500" />
              <h2 className={`text-sm font-semibold ${textPrimary}`}>When to Use</h2>
            </div>
            <p className={`text-sm leading-relaxed ${textMuted}`}>{concept.usage}</p>
          </motion.div>
        </div>

        {/* Example */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`rounded-2xl border p-5 mb-4 ${cardBg}`}
        >
          <div className="flex items-center gap-2 mb-3">
            <Code size={16} className="text-emerald-500" />
            <h2 className={`text-sm font-semibold ${textPrimary}`}>Practical Example</h2>
          </div>
          <div className={`rounded-xl px-4 py-3 text-sm leading-relaxed font-mono ${darkMode ? 'bg-slate-900 text-sky-300' : 'bg-slate-50 text-sky-800'}`}>
            {concept.example}
          </div>
        </motion.div>

        {/* Key Insight */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className={`rounded-2xl border-l-4 border-amber-400 p-5 mb-4 ${darkMode ? 'bg-amber-900/10 border border-amber-700/30' : 'bg-amber-50 border border-amber-200'}`}
        >
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb size={16} className="text-amber-500" />
            <h2 className={`text-sm font-semibold ${darkMode ? 'text-amber-300' : 'text-amber-800'}`}>Key Insight</h2>
            <span className={`text-xs px-2 py-0.5 rounded-full ${darkMode ? 'bg-amber-900/40 text-amber-400' : 'bg-amber-200 text-amber-700'}`}>
              Certification Priority: {concept.certificationPriority}/5
            </span>
          </div>
          <p className={`text-sm leading-relaxed ${darkMode ? 'text-amber-100' : 'text-amber-900'}`}>{concept.insight}</p>
        </motion.div>

        {/* Architecture Relevance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`rounded-2xl border p-5 mb-4 ${cardBg}`}
        >
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={16} className="text-rose-500" />
            <h2 className={`text-sm font-semibold ${textPrimary}`}>Architecture Relevance</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <div
                  key={n}
                  className={`h-2 w-8 rounded-full ${n <= concept.architectureRelevance ? 'bg-sky-500' : darkMode ? 'bg-slate-700' : 'bg-slate-200'}`}
                />
              ))}
            </div>
            <span className={`text-sm ${textMuted}`}>
              {concept.architectureRelevance}/5 — {
                concept.architectureRelevance >= 5 ? 'Critical for system design' :
                concept.architectureRelevance >= 4 ? 'Highly relevant' :
                concept.architectureRelevance >= 3 ? 'Moderately relevant' : 'Supporting concept'
              }
            </span>
          </div>
        </motion.div>

        {/* Related Concepts */}
        {relatedConcepts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className={`rounded-2xl border p-5 ${cardBg}`}
          >
            <div className="flex items-center gap-2 mb-3">
              <Link size={16} className="text-violet-500" />
              <h2 className={`text-sm font-semibold ${textPrimary}`}>Related Concepts</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {relatedConcepts.map((rel) => {
                if (!rel) return null;
                const relCat = categoryMap.get(rel.categoryId);
                return (
                  <button
                    key={rel.id}
                    onClick={() => navigate(`/concept/${rel.id}`)}
                    className={`flex items-center gap-2 p-3 rounded-xl text-left transition-colors ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-50'}`}
                  >
                    <span className="text-base">{relCat?.icon}</span>
                    <div className="min-w-0">
                      <div className={`text-xs font-medium truncate ${textPrimary}`}>{rel.term}</div>
                      <div className={`text-xs ${textMuted}`}>{rel.category}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* All concepts in same category */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-4"
        >
          <div className={`text-xs font-semibold uppercase tracking-wide mb-2 ${textMuted}`}>More in {concept.category}</div>
          <div className="flex flex-wrap gap-2">
            {concepts
              .filter((c) => c.categoryId === concept.categoryId && c.id !== concept.id)
              .map((c) => (
                <button
                  key={c.id}
                  onClick={() => navigate(`/concept/${c.id}`)}
                  className={`text-xs px-3 py-1.5 rounded-lg transition-colors font-medium ${darkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200'}`}
                >
                  {c.term}
                </button>
              ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
