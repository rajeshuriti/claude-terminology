import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, CheckCircle2, Clock, Star, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { concepts } from '@/data/concepts';
import { categoryMap, categories } from '@/data/categories';
import { useAppStore } from '@/store/appStore';

export function CategoryPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { darkMode, completedConcepts, addRecentlyViewed } = useAppStore();

  const cat = id ? categoryMap.get(id as Parameters<typeof categoryMap.get>[0]) : null;
  const catConcepts = concepts.filter((c) => c.categoryId === id);
  const completedInCat = catConcepts.filter((c) => completedConcepts.includes(c.id));
  const progress = catConcepts.length > 0 ? Math.round((completedInCat.length / catConcepts.length) * 100) : 0;

  if (!cat) {
    return (
      <div className={`min-h-full flex items-center justify-center ${darkMode ? 'bg-slate-950 text-slate-400' : 'bg-slate-50 text-slate-500'}`}>
        <div className="text-center">
          <p>Category not found</p>
          <button onClick={() => navigate('/explorer')} className="text-sky-500 hover:underline mt-2">Back to Explorer</button>
        </div>
      </div>
    );
  }

  const diffBreakdown = [
    { name: 'Beginner', count: catConcepts.filter((c) => c.difficulty === 'beginner').length, color: '#10b981' },
    { name: 'Intermediate', count: catConcepts.filter((c) => c.difficulty === 'intermediate').length, color: '#0ea5e9' },
    { name: 'Advanced', count: catConcepts.filter((c) => c.difficulty === 'advanced').length, color: '#8b5cf6' },
  ];

  const avgPriority = catConcepts.length > 0
    ? (catConcepts.reduce((acc, c) => acc + c.certificationPriority, 0) / catConcepts.length).toFixed(1)
    : '0';

  const textPrimary = darkMode ? 'text-white' : 'text-slate-900';
  const textMuted = darkMode ? 'text-slate-400' : 'text-slate-500';
  const cardBg = darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100';

  return (
    <div className={`min-h-full ${darkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        <button
          onClick={() => navigate(-1)}
          className={`flex items-center gap-2 text-sm mb-4 transition-colors ${darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
        >
          <ArrowLeft size={16} /> Back
        </button>

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl border p-6 mb-4 ${cardBg}`}
          style={{ borderLeftWidth: 4, borderLeftColor: cat.color }}
        >
          <div className="flex items-start gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0"
              style={{ backgroundColor: cat.color + '20' }}
            >
              {cat.icon}
            </div>
            <div className="flex-1">
              <h1 className={`text-xl font-bold ${textPrimary}`}>{cat.name}</h1>
              <p className={`mt-1 text-sm leading-relaxed ${textMuted}`}>{cat.description}</p>
              <div className="flex flex-wrap gap-4 mt-3">
                <div className="flex items-center gap-1.5">
                  <BookOpen size={14} className="text-sky-500" />
                  <span className={`text-sm ${textMuted}`}>{catConcepts.length} concepts</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-emerald-500" />
                  <span className={`text-sm ${textMuted}`}>{completedInCat.length} completed</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Star size={14} className="text-amber-400" />
                  <span className={`text-sm ${textMuted}`}>Avg priority: {avgPriority}/5</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock size={14} className="text-violet-500" />
                  <span className={`text-sm ${textMuted}`}>
                    {catConcepts.reduce((acc, c) => acc + c.estimatedTime, 0)} min total
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className={`text-xs ${textMuted}`}>Category Progress</span>
              <span className={`text-xs font-semibold ${textPrimary}`}>{progress}%</span>
            </div>
            <div className={`h-2 rounded-full ${darkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{ backgroundColor: cat.color }}
              />
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Difficulty Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`rounded-2xl border p-4 ${cardBg}`}
          >
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={14} className="text-sky-500" />
              <h2 className={`text-sm font-semibold ${textPrimary}`}>Difficulty Breakdown</h2>
            </div>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={diffBreakdown} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                  <XAxis dataKey="name" tick={{ fill: darkMode ? '#94a3b8' : '#64748b', fontSize: 10 }} />
                  <YAxis tick={{ fill: darkMode ? '#94a3b8' : '#64748b', fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ background: darkMode ? '#1e293b' : '#fff', border: 'none', borderRadius: 8, fontSize: 11 }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {diffBreakdown.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Quick stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className={`md:col-span-2 rounded-2xl border p-4 ${cardBg}`}
          >
            <h2 className={`text-sm font-semibold mb-3 ${textPrimary}`}>Other Categories</h2>
            <div className="flex flex-wrap gap-2">
              {categories.filter((c) => c.id !== id).map((otherCat) => (
                <button
                  key={otherCat.id}
                  onClick={() => navigate(`/category/${otherCat.id}`)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${darkMode ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}
                >
                  <span>{otherCat.icon}</span>
                  {otherCat.name.split(' ')[0]}
                </button>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Concepts list */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className={`text-base font-semibold mb-3 ${textPrimary}`}>All Concepts in {cat.name}</h2>
          <div className="space-y-2">
            {catConcepts.map((concept, i) => {
              const isCompleted = completedConcepts.includes(concept.id);
              return (
                <motion.button
                  key={concept.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i }}
                  onClick={() => { addRecentlyViewed(concept.id); navigate(`/concept/${concept.id}`); }}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all hover:shadow-sm ${
                    darkMode
                      ? 'bg-slate-800 border-slate-700 hover:bg-slate-750 hover:border-slate-600'
                      : 'bg-white border-slate-100 hover:border-slate-200'
                  } ${isCompleted ? (darkMode ? 'border-emerald-700/40' : 'border-emerald-200') : ''}`}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${isCompleted ? 'bg-emerald-500' : darkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
                    {isCompleted
                      ? <CheckCircle2 size={14} className="text-white" />
                      : <span className={`text-xs font-bold ${textMuted}`}>{i + 1}</span>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-semibold ${isCompleted ? textMuted : textPrimary}`}>{concept.term}</div>
                    <div className={`text-xs truncate mt-0.5 ${textMuted}`}>{concept.description.slice(0, 80)}…</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                      concept.difficulty === 'beginner'
                        ? darkMode ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
                        : concept.difficulty === 'intermediate'
                          ? darkMode ? 'bg-sky-900/30 text-sky-400' : 'bg-sky-100 text-sky-700'
                          : darkMode ? 'bg-violet-900/30 text-violet-400' : 'bg-violet-100 text-violet-700'
                    }`}>
                      {concept.difficulty}
                    </span>
                    <span className={`text-xs ${textMuted}`}>{concept.estimatedTime}m</span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
