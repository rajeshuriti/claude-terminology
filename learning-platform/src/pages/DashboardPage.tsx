import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Brain, BookOpen, CheckCircle2, Target, TrendingUp, Clock, ArrowRight,
  Zap, Star, AlertTriangle, Lightbulb, Trophy
} from 'lucide-react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';
import { concepts } from '@/data/concepts';
import { categories } from '@/data/categories';
import { useAppStore } from '@/store/appStore';
import { conceptMap } from '@/data/concepts';

const TOTAL_CONCEPTS = concepts.length;

const COMMON_MISTAKES = [
  { mistake: 'Obsessing over prompts only', reality: 'Production AI is mostly orchestration and reliability' },
  { mistake: 'Thinking bigger context solves memory', reality: 'Context degrades; pruning and compression are needed' },
  { mistake: 'Believing citations guarantee truth', reality: 'Retrieval can still be wrong; always validate' },
  { mistake: 'Assuming high coverage means quality', reality: 'Coverage metrics are often misleading' },
  { mistake: 'Thinking multi-agent systems are magic', reality: 'Most are orchestration wrappers around LLMs' },
  { mistake: 'Overusing randomness', reality: 'Enterprise systems prefer deterministic behavior' },
  { mistake: 'Ignoring evals', reality: 'Production systems fail without evaluation pipelines' },
];

const HIGHEST_PRIORITY = ['tool-use', 'mcp', 'orchestration', 'rag', 'context-window', 'structured-outputs', 'evals', 'guardrails'];

function StatCard({ icon: Icon, label, value, subtitle, color, onClick }: {
  icon: typeof Brain;
  label: string;
  value: string | number;
  subtitle?: string;
  color: string;
  onClick?: () => void;
}) {
  const { darkMode } = useAppStore();
  return (
    <motion.div
      whileHover={{ y: -2 }}
      onClick={onClick}
      className={`rounded-2xl p-5 cursor-pointer transition-shadow hover:shadow-lg ${darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-100'}`}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
      <div className={`text-3xl font-bold mb-0.5 ${darkMode ? 'text-white' : 'text-slate-900'}`}>{value}</div>
      <div className={`text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{label}</div>
      {subtitle && <div className={`text-xs mt-1 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{subtitle}</div>}
    </motion.div>
  );
}

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
};

export function DashboardPage() {
  const navigate = useNavigate();
  const { darkMode, completedConcepts, recentlyViewed, totalQuizAttempts, totalCorrect, addRecentlyViewed } = useAppStore();

  const accuracy = totalQuizAttempts > 0 ? Math.round((totalCorrect / totalQuizAttempts) * 100) : 0;
  const progressPct = Math.round((completedConcepts.length / TOTAL_CONCEPTS) * 100);

  // Category progress for radar chart
  const radarData = categories.slice(0, 8).map((cat) => {
    const catConcepts = concepts.filter((c) => c.categoryId === cat.id);
    const done = catConcepts.filter((c) => completedConcepts.includes(c.id)).length;
    return {
      category: cat.name.split(' ')[0],
      completed: catConcepts.length > 0 ? Math.round((done / catConcepts.length) * 100) : 0,
    };
  });

  // Difficulty distribution for bar chart
  const diffData = [
    { name: 'Beginner', count: concepts.filter((c) => c.difficulty === 'beginner').length, fill: '#10b981' },
    { name: 'Intermediate', count: concepts.filter((c) => c.difficulty === 'intermediate').length, fill: '#0ea5e9' },
    { name: 'Advanced', count: concepts.filter((c) => c.difficulty === 'advanced').length, fill: '#8b5cf6' },
  ];

  const recentConcepts = recentlyViewed.slice(0, 5).map((id) => conceptMap.get(id)).filter(Boolean);
  const highPriorityConcepts = HIGHEST_PRIORITY.map((id) => conceptMap.get(id)).filter(Boolean);

  const cardBg = darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100';
  const textMuted = darkMode ? 'text-slate-400' : 'text-slate-500';
  const textPrimary = darkMode ? 'text-white' : 'text-slate-900';

  return (
    <div className={`min-h-full p-4 md:p-6 ${darkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
      {/* Hero */}
      <motion.div {...fadeUp} className="mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className={`text-2xl md:text-3xl font-bold ${textPrimary}`}>
              Claude SA Foundation
            </h1>
            <p className={`mt-1 text-sm ${textMuted}`}>Interactive learning platform for LLM systems engineering</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/quiz')}
            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-sm font-medium shadow-sm shadow-sky-500/30 transition-colors"
          >
            <Zap size={16} />
            Start Quiz
          </motion.button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6"
      >
        <StatCard icon={Brain} label="Total Concepts" value={TOTAL_CONCEPTS} color="bg-sky-500" onClick={() => navigate('/explorer')} />
        <StatCard icon={BookOpen} label="Categories" value={categories.length} color="bg-violet-500" onClick={() => navigate('/explorer')} />
        <StatCard icon={CheckCircle2} label="Completed" value={completedConcepts.length} subtitle={`${progressPct}% progress`} color="bg-emerald-500" />
        <StatCard icon={Target} label="Quiz Accuracy" value={`${accuracy}%`} subtitle={`${totalQuizAttempts} attempts`} color="bg-amber-500" onClick={() => navigate('/quiz')} />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        {/* Progress Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className={`lg:col-span-2 rounded-2xl border p-5 ${cardBg}`}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-base font-semibold ${textPrimary}`}>Progress by Category</h2>
            <span className={`text-xs ${textMuted}`}>Radar view</span>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} margin={{ top: 5, right: 20, bottom: 5, left: 20 }}>
                <PolarGrid stroke={darkMode ? '#334155' : '#e2e8f0'} />
                <PolarAngleAxis dataKey="category" tick={{ fill: darkMode ? '#94a3b8' : '#64748b', fontSize: 11 }} />
                <Radar name="Completed" dataKey="completed" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.3} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Difficulty Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className={`rounded-2xl border p-5 ${cardBg}`}
        >
          <h2 className={`text-base font-semibold mb-4 ${textPrimary}`}>Concept Levels</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={diffData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#334155' : '#f1f5f9'} />
                <XAxis dataKey="name" tick={{ fill: darkMode ? '#94a3b8' : '#64748b', fontSize: 11 }} />
                <YAxis tick={{ fill: darkMode ? '#94a3b8' : '#64748b', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: darkMode ? '#1e293b' : '#fff', border: 'none', borderRadius: 8, fontSize: 12 }}
                  cursor={{ fill: darkMode ? '#334155' : '#f1f5f9' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {diffData.map((d, i) => (
                    <rect key={i} fill={d.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        {/* High Priority Topics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className={`rounded-2xl border p-5 ${cardBg}`}
        >
          <div className="flex items-center gap-2 mb-4">
            <Star size={16} className="text-amber-500" />
            <h2 className={`text-base font-semibold ${textPrimary}`}>Must-Know Concepts</h2>
          </div>
          <div className="space-y-2">
            {highPriorityConcepts.map((concept) => {
              if (!concept) return null;
              const done = completedConcepts.includes(concept.id);
              return (
                <button
                  key={concept.id}
                  onClick={() => { addRecentlyViewed(concept.id); navigate(`/concept/${concept.id}`); }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-50'}`}
                >
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${done ? 'bg-emerald-500' : darkMode ? 'bg-slate-700 border border-slate-600' : 'bg-slate-100 border border-slate-200'}`}>
                    {done && <CheckCircle2 size={12} className="text-white" />}
                  </div>
                  <span className={`text-sm ${done ? textMuted + ' line-through' : textPrimary}`}>{concept.term}</span>
                  <ArrowRight size={12} className={`ml-auto ${textMuted}`} />
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Recently Viewed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
          className={`rounded-2xl border p-5 ${cardBg}`}
        >
          <div className="flex items-center gap-2 mb-4">
            <Clock size={16} className="text-sky-500" />
            <h2 className={`text-base font-semibold ${textPrimary}`}>Recently Viewed</h2>
          </div>
          {recentConcepts.length === 0 ? (
            <div className={`text-sm ${textMuted} py-4 text-center`}>
              No concepts viewed yet.<br />
              <button onClick={() => navigate('/explorer')} className="text-sky-500 hover:underline mt-1">Start exploring →</button>
            </div>
          ) : (
            <div className="space-y-2">
              {recentConcepts.map((concept) => {
                if (!concept) return null;
                return (
                  <button
                    key={concept.id}
                    onClick={() => { addRecentlyViewed(concept.id); navigate(`/concept/${concept.id}`); }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-50'}`}
                  >
                    <span className="text-base leading-none">{concept.categoryId === 'prompt-engineering' ? '✍️' : concept.categoryId === 'sampling-parameters' ? '🎛️' : concept.categoryId === 'tool-use-mcp' ? '🔧' : concept.categoryId === 'agent-architecture' ? '🤖' : concept.categoryId === 'rag-retrieval' ? '🔍' : '📊'}</span>
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-medium truncate ${textPrimary}`}>{concept.term}</div>
                      <div className={`text-xs ${textMuted}`}>{concept.category}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Common Mistakes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className={`rounded-2xl border p-5 ${cardBg}`}
        >
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={16} className="text-rose-500" />
            <h2 className={`text-base font-semibold ${textPrimary}`}>Common Mistakes</h2>
          </div>
          <div className="space-y-3">
            {COMMON_MISTAKES.slice(0, 4).map((item, i) => (
              <div key={i} className={`p-3 rounded-xl ${darkMode ? 'bg-slate-700/50' : 'bg-rose-50'}`}>
                <div className={`text-xs font-semibold ${darkMode ? 'text-rose-400' : 'text-rose-700'}`}>{item.mistake}</div>
                <div className={`text-xs mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>{item.reality}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Learning Tip */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.45 }}
        className={`rounded-2xl border p-5 ${cardBg}`}
      >
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0">
            <Lightbulb size={20} className="text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className={`text-base font-semibold ${textPrimary}`}>Certification Strategy</h2>
              <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full font-medium">Key Insight</span>
            </div>
            <p className={`text-sm leading-relaxed ${textMuted}`}>
              Most people remain at the "prompt engineering" level. The Claude SA Foundation certification is moving toward
              <strong className={darkMode ? ' text-white' : ' text-slate-800'}> production AI systems engineering</strong> —
              focus on reliability, orchestration, and tradeoffs. Learn systems thinking, not memorization.
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              {['Build a RAG app', 'Build an extraction pipeline', 'Build a tool-using agent', 'Study failure modes'].map((tip) => (
                <span key={tip} className={`text-xs px-2.5 py-1 rounded-lg font-medium ${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                  {tip}
                </span>
              ))}
            </div>
          </div>
          <button
            onClick={() => navigate('/roadmap')}
            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-medium transition-colors shrink-0"
          >
            <Trophy size={16} />
            View Roadmaps
          </button>
        </div>
      </motion.div>

      {/* Quick actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4"
      >
        {[
          { label: 'Explore All Concepts', icon: BookOpen, path: '/explorer', color: 'from-sky-500 to-sky-600' },
          { label: 'Concept Graph', icon: TrendingUp, path: '/graph', color: 'from-violet-500 to-violet-600' },
          { label: 'Take a Quiz', icon: Target, path: '/quiz', color: 'from-emerald-500 to-emerald-600' },
          { label: 'Compare Concepts', icon: ArrowRight, path: '/compare', color: 'from-amber-500 to-orange-500' },
        ].map(({ label, icon: Icon, path, color }) => (
          <motion.button
            key={path}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(path)}
            className={`flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-br ${color} text-white text-left shadow-sm hover:shadow-md transition-shadow`}
          >
            <Icon size={20} className="shrink-0" />
            <span className="text-sm font-semibold leading-tight">{label}</span>
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}
