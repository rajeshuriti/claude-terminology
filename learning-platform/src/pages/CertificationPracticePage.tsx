import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy, CheckCircle2, XCircle, RotateCcw,
  BookOpen, Target, Zap, AlertTriangle, ArrowRight,
  Filter, Clock, Star, ChevronDown, ChevronUp,
} from 'lucide-react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
} from 'recharts';
import { useAppStore } from '@/store/appStore';
import {
  certQuestions, domainMeta, TOTAL_QUESTIONS,
  type ExamDomain, type CertQuestion,
} from '@/data/certificationQuizData';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function DomainBadge({ domain }: { domain: ExamDomain }) {
  const d = domainMeta[domain];
  return (
    <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-semibold"
      style={{ backgroundColor: d.color + '20', color: d.color }}>
      {d.icon} {d.label}
    </span>
  );
}

function ScoreRing({ pct, size = 120 }: { pct: number; size?: number }) {
  const r = (size - 16) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  const color = pct >= 80 ? '#10b981' : pct >= 60 ? '#f59e0b' : '#ef4444';
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={8} className="text-slate-200 dark:text-slate-700" />
      <motion.circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={8} strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ - dash }}
        transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
      />
    </svg>
  );
}

// ─── SCREEN 1: Intro ──────────────────────────────────────────────────────────

interface IntroScreenProps {
  darkMode: boolean;
  onStart: (filter: ExamDomain | 'all') => void;
}

function IntroScreen({ darkMode, onStart }: IntroScreenProps) {
  const [selectedDomain, setSelectedDomain] = useState<ExamDomain | 'all'>('all');
  const textPrimary = darkMode ? 'text-white' : 'text-slate-900';
  const textMuted = darkMode ? 'text-slate-400' : 'text-slate-500';
  const cardBg = darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100';

  const domainEntries = Object.entries(domainMeta) as [ExamDomain, typeof domainMeta[ExamDomain]][];
  const questionCount = selectedDomain === 'all'
    ? TOTAL_QUESTIONS
    : certQuestions.filter(q => q.domain === selectedDomain).length;

  return (
    <div className={`min-h-full ${darkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-4 bg-sky-500/15 text-sky-500">
            <Trophy size={14} /> Claude Certified Architect – Foundations
          </div>
          <h1 className={`text-3xl font-black mb-3 ${textPrimary}`}>Practice Exam</h1>
          <p className={`text-base max-w-xl mx-auto leading-relaxed ${textMuted}`}>
            30 scenario-based questions from the official exam prep guide. Each question includes full explanations,
            why wrong answers fail, and exam takeaways. Ideal for certification preparation.
          </p>
        </motion.div>

        {/* Stats row */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { icon: <BookOpen size={18} />, label: 'Questions', value: TOTAL_QUESTIONS, color: '#0ea5e9' },
            { icon: <Target size={18} />, label: 'Domains', value: 8, color: '#8b5cf6' },
            { icon: <Clock size={18} />, label: 'Est. Time', value: '45–60 min', color: '#10b981' },
            { icon: <Star size={18} />, label: 'Difficulty', value: 'Advanced', color: '#f59e0b' },
          ].map(({ icon, label, value, color }) => (
            <div key={label} className={`flex flex-col items-center p-4 rounded-2xl border ${cardBg}`}>
              <div className="mb-1.5" style={{ color }}>{icon}</div>
              <div className={`text-xl font-black ${textPrimary}`}>{value}</div>
              <div className={`text-xs ${textMuted}`}>{label}</div>
            </div>
          ))}
        </motion.div>

        {/* Domain filter */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className={`rounded-2xl border p-5 mb-6 ${cardBg}`}>
          <div className="flex items-center gap-2 mb-4">
            <Filter size={16} className="text-sky-500" />
            <h2 className={`text-sm font-bold ${textPrimary}`}>Choose Domain</h2>
            <span className={`text-xs ${textMuted}`}>— or practice all 8 domains at once</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              onClick={() => setSelectedDomain('all')}
              className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                selectedDomain === 'all'
                  ? 'border-sky-500 bg-sky-500/10 shadow-sm'
                  : darkMode ? 'border-slate-700 hover:border-slate-500' : 'border-slate-100 hover:border-slate-200'
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-violet-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                All
              </div>
              <div>
                <div className={`text-sm font-semibold ${textPrimary}`}>All Domains</div>
                <div className={`text-xs ${textMuted}`}>Full exam experience · {TOTAL_QUESTIONS} questions</div>
              </div>
            </button>

            {domainEntries.map(([id, d]) => {
              const count = certQuestions.filter(q => q.domain === id).length;
              const isSelected = selectedDomain === id;
              return (
                <button key={id} onClick={() => setSelectedDomain(id)}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                    isSelected ? 'shadow-sm' : darkMode ? 'border-slate-700 hover:border-slate-500' : 'border-slate-100 hover:border-slate-200'
                  }`}
                  style={isSelected ? { borderColor: d.color, backgroundColor: d.color + '10' } : {}}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg shrink-0" style={{ backgroundColor: d.color + '20' }}>{d.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-semibold leading-snug ${textPrimary}`}>{d.label}</div>
                    <div className={`text-xs ${textMuted}`}>{count} question{count !== 1 ? 's' : ''}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Exam coverage */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className={`rounded-2xl border p-5 mb-8 ${cardBg}`}>
          <h2 className={`text-sm font-bold mb-3 ${textPrimary}`}>What This Exam Tests</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { domain: 'Domain 1', label: 'Agentic Architecture', desc: 'Subagent patterns, orchestration, parallelism, state handoffs', color: '#10b981' },
              { domain: 'Domain 4', label: 'API & Orchestration', desc: 'Batch API, tool design, MCP, error handling, schemas', color: '#0ea5e9' },
              { domain: 'Domain 5', label: 'Context Management', desc: 'Lost-in-the-middle, provenance, citation tracking, summarization', color: '#8b5cf6' },
            ].map(({ domain, label, desc, color }) => (
              <div key={domain} className={`p-3 rounded-xl ${darkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
                <div className="text-xs font-bold mb-0.5" style={{ color }}>{domain}: {label}</div>
                <p className={`text-xs leading-relaxed ${textMuted}`}>{desc}</p>
              </div>
            ))}
          </div>
          <div className={`mt-3 p-3 rounded-xl border-l-4 border-amber-400 ${darkMode ? 'bg-amber-900/10' : 'bg-amber-50'}`}>
            <p className={`text-xs leading-relaxed ${darkMode ? 'text-amber-300' : 'text-amber-800'}`}>
              <strong>Exam philosophy:</strong> Prioritizes structural, deterministic solutions (schema design, tool boundaries, backend enforcement)
              over probabilistic approaches (prompt instructions, few-shot examples). When in doubt, the answer that uses code/schema over prompts wins.
            </p>
          </div>
        </motion.div>

        {/* Start button */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="text-center">
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onStart(selectedDomain)}
            className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-sky-500 to-violet-600 text-white text-base font-bold shadow-lg shadow-sky-500/30 hover:shadow-xl transition-shadow"
          >
            <Zap size={20} />
            Start Practice Exam
            <span className="text-sky-200 text-sm">({questionCount} question{questionCount !== 1 ? 's' : ''})</span>
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}

// ─── SCREEN 2: Quiz ───────────────────────────────────────────────────────────

type AnswerState = { selected: number; correct: boolean } | null;

interface QuizScreenProps {
  questions: CertQuestion[];
  darkMode: boolean;
  onFinish: (scores: Record<string, boolean>) => void;
}

function QuizScreen({ questions, darkMode, onFinish }: QuizScreenProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answerState, setAnswerState] = useState<AnswerState>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [scores, setScores] = useState<Record<string, boolean>>({});

  const q = questions[currentIdx];
  const isAnswered = answerState !== null;
  const isLast = currentIdx === questions.length - 1;
  const progressPct = ((currentIdx) / questions.length) * 100;
  const correctCount = Object.values(scores).filter(Boolean).length;

  const textPrimary = darkMode ? 'text-white' : 'text-slate-900';
  const textMuted = darkMode ? 'text-slate-400' : 'text-slate-500';
  const cardBg = darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100';

  const handleSelect = (idx: number) => {
    if (isAnswered) return;
    const correct = idx === q.correctIndex;
    setAnswerState({ selected: idx, correct });
    setScores(prev => ({ ...prev, [q.id]: correct }));
  };

  const handleNext = () => {
    if (isLast) {
      onFinish({ ...scores, [q.id]: answerState?.correct ?? false });
    } else {
      setCurrentIdx(i => i + 1);
      setAnswerState(null);
      setShowExplanation(false);
    }
  };

  const optionStyle = (idx: number) => {
    if (!isAnswered) {
      return darkMode
        ? 'border-slate-600 bg-slate-800 hover:border-sky-500 hover:bg-slate-700 cursor-pointer'
        : 'border-slate-200 bg-white hover:border-sky-400 hover:bg-sky-50 cursor-pointer';
    }
    if (idx === q.correctIndex) return 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 cursor-default';
    if (idx === answerState?.selected && !answerState.correct) return 'border-rose-400 bg-rose-50 dark:bg-rose-900/20 cursor-default';
    return darkMode ? 'border-slate-700 bg-slate-800/50 opacity-40 cursor-default' : 'border-slate-100 bg-slate-50/50 opacity-40 cursor-default';
  };

  return (
    <div className={`min-h-full ${darkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <div className="max-w-3xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className={`flex items-center gap-3 text-sm ${textMuted}`}>
            <span>Question <span className={`font-bold ${textPrimary}`}>{currentIdx + 1}</span> of {questions.length}</span>
            <span>·</span>
            <span className="text-emerald-500 font-semibold">{correctCount} correct</span>
          </div>
          <DomainBadge domain={q.domain} />
        </div>

        {/* Progress */}
        <div className={`h-1.5 rounded-full mb-6 ${darkMode ? 'bg-slate-800' : 'bg-slate-200'} overflow-hidden`}>
          <motion.div className="h-full rounded-full bg-gradient-to-r from-sky-500 to-violet-500"
            animate={{ width: `${progressPct}%` }} transition={{ duration: 0.4 }} />
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={currentIdx} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>

            {/* Question card */}
            <div className={`rounded-2xl border p-6 mb-4 ${cardBg}`}>
              <div className={`text-xs font-semibold uppercase tracking-wider mb-3 ${textMuted}`}>
                Scenario: {q.scenario}
              </div>
              <h2 className={`text-base leading-relaxed font-semibold mb-5 ${textPrimary}`}>{q.question}</h2>

              {/* Options */}
              <div className="space-y-2.5">
                {q.options.map((opt, idx) => {
                  const isCorrect = idx === q.correctIndex;
                  const isSelected = answerState?.selected === idx;
                  return (
                    <button key={opt.letter} onClick={() => handleSelect(idx)} disabled={isAnswered}
                      className={`w-full flex items-start gap-3.5 p-4 rounded-xl border-2 text-left transition-all ${optionStyle(idx)}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                        isAnswered && isCorrect ? 'bg-emerald-500 text-white' :
                        isAnswered && isSelected && !isCorrect ? 'bg-rose-500 text-white' :
                        !isAnswered ? (darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600') :
                        darkMode ? 'bg-slate-700 text-slate-500' : 'bg-slate-100 text-slate-400'
                      }`}>
                        {isAnswered && isCorrect ? <CheckCircle2 size={16} /> :
                         isAnswered && isSelected && !isCorrect ? <XCircle size={16} /> :
                         opt.letter}
                      </div>
                      <span className={`text-sm leading-relaxed ${
                        isAnswered && isCorrect ? 'font-semibold text-emerald-800 dark:text-emerald-300' :
                        isAnswered && isSelected && !isCorrect ? 'font-semibold text-rose-800 dark:text-rose-300' :
                        textPrimary
                      }`}>
                        {opt.text}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Explanation (after answering) */}
            <AnimatePresence>
              {isAnswered && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                  className="overflow-hidden mb-4">

                  {/* Verdict banner */}
                  <div className={`flex items-center gap-3 p-4 rounded-2xl mb-3 ${
                    answerState?.correct
                      ? darkMode ? 'bg-emerald-900/20 border border-emerald-700/30' : 'bg-emerald-50 border border-emerald-200'
                      : darkMode ? 'bg-rose-900/20 border border-rose-700/30' : 'bg-rose-50 border border-rose-200'
                  }`}>
                    {answerState?.correct
                      ? <CheckCircle2 size={22} className="text-emerald-500 shrink-0" />
                      : <XCircle size={22} className="text-rose-500 shrink-0" />
                    }
                    <div>
                      <div className={`text-sm font-bold ${answerState?.correct ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}>
                        {answerState?.correct ? 'Correct!' : `Incorrect — Correct answer: ${q.correctLetter}`}
                      </div>
                      <div className={`text-xs ${textMuted}`}>
                        {answerState?.correct ? 'Well done. Read the explanation to reinforce understanding.' : 'Review the explanation carefully to understand the reasoning.'}
                      </div>
                    </div>
                  </div>

                  {/* Explanation accordion */}
                  <div className={`rounded-2xl border overflow-hidden ${cardBg}`}>
                    <button onClick={() => setShowExplanation(s => !s)}
                      className={`w-full flex items-center justify-between px-5 py-3.5 text-left transition-colors ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-50'}`}>
                      <span className={`text-sm font-semibold ${textPrimary}`}>Full Explanation</span>
                      {showExplanation ? <ChevronUp size={16} className={textMuted} /> : <ChevronDown size={16} className={textMuted} />}
                    </button>

                    <AnimatePresence>
                      {showExplanation && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                          <div className={`px-5 pb-5 border-t ${darkMode ? 'border-slate-700' : 'border-slate-100'}`}>
                            <div className="pt-4 space-y-4">
                              {/* Why correct */}
                              <div>
                                <div className={`text-xs font-bold uppercase tracking-wider mb-2 text-emerald-500`}>
                                  ✓ Why {q.correctLetter} is Correct
                                </div>
                                <p className={`text-sm leading-relaxed whitespace-pre-line ${textMuted}`}>{q.explanation}</p>
                              </div>

                              {/* Why others wrong */}
                              {q.whyOthersWrong.length > 0 && (
                                <div>
                                  <div className={`text-xs font-bold uppercase tracking-wider mb-2 text-rose-500`}>
                                    ✗ Why Others Are Weaker
                                  </div>
                                  <div className="space-y-2.5">
                                    {q.whyOthersWrong.map(({ letter, reason }) => (
                                      <div key={letter} className={`flex gap-2.5 p-3 rounded-xl ${darkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
                                        <div className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-500 flex items-center justify-center text-xs font-bold shrink-0">{letter}</div>
                                        <p className={`text-xs leading-relaxed ${textMuted}`}>{reason}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Exam takeaway */}
                              <div className={`p-4 rounded-xl border-l-4 border-sky-400 ${darkMode ? 'bg-sky-900/15' : 'bg-sky-50'}`}>
                                <div className={`text-xs font-bold uppercase tracking-wider mb-1.5 ${darkMode ? 'text-sky-400' : 'text-sky-700'}`}>
                                  💡 Exam Takeaway
                                </div>
                                <p className={`text-sm leading-relaxed font-medium ${darkMode ? 'text-sky-200' : 'text-sky-900'}`}>
                                  {q.examTakeaway}
                                </p>
                              </div>

                              {/* Reference */}
                              <div className={`text-xs ${textMuted}`}>
                                <span className="font-semibold">Reference:</span> {q.reference}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation */}
            {isAnswered && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between">
                {!showExplanation && (
                  <button onClick={() => setShowExplanation(true)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                      darkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200'
                    }`}>
                    <BookOpen size={15} /> View Explanation
                  </button>
                )}
                {showExplanation && <div />}
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-sky-500 to-violet-600 text-white shadow-sm hover:shadow-md transition-shadow">
                  {isLast ? 'View Results' : 'Next Question'}
                  {isLast ? <Trophy size={16} /> : <ArrowRight size={16} />}
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── SCREEN 3: Results ────────────────────────────────────────────────────────

interface ResultsScreenProps {
  questions: CertQuestion[];
  scores: Record<string, boolean>;
  darkMode: boolean;
  onRetry: () => void;
  onHome: () => void;
}

function ResultsScreen({ questions, scores, darkMode, onRetry, onHome }: ResultsScreenProps) {
  const [reviewFilter, setReviewFilter] = useState<'all' | 'wrong' | 'correct'>('wrong');
  const [expandedQ, setExpandedQ] = useState<number | null>(null);

  const total = questions.length;
  const correct = questions.filter(q => scores[q.id]).length;
  const pct = Math.round((correct / total) * 100);
  const passed = pct >= 72;

  const textPrimary = darkMode ? 'text-white' : 'text-slate-900';
  const textMuted = darkMode ? 'text-slate-400' : 'text-slate-500';
  const cardBg = darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100';

  // Domain breakdown
  const domainBreakdown = Object.keys(domainMeta).map(domainId => {
    const domain = domainId as ExamDomain;
    const dqs = questions.filter(q => q.domain === domain);
    if (dqs.length === 0) return null;
    const dCorrect = dqs.filter(q => scores[q.id]).length;
    const d = domainMeta[domain];
    return { name: d.icon + ' ' + d.label.split(' ')[0], correct: dCorrect, total: dqs.length, pct: Math.round((dCorrect / dqs.length) * 100), color: d.color };
  }).filter(Boolean) as { name: string; correct: number; total: number; pct: number; color: string }[];

  const radarData = domainBreakdown.map(d => ({ name: d.name.split(' ')[1] ?? d.name, value: d.pct }));

  const reviewList = questions.filter(q => {
    if (reviewFilter === 'wrong') return !scores[q.id];
    if (reviewFilter === 'correct') return scores[q.id];
    return true;
  });

  return (
    <div className={`min-h-full ${darkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Score card */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className={`rounded-3xl border p-8 mb-6 text-center ${cardBg}`}>
          <div className="flex justify-center mb-4 relative">
            <ScoreRing pct={pct} size={140} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className={`text-4xl font-black ${pct >= 80 ? 'text-emerald-500' : pct >= 60 ? 'text-amber-500' : 'text-rose-500'}`}>{pct}%</div>
              <div className={`text-xs ${textMuted}`}>{correct}/{total}</div>
            </div>
          </div>

          <h2 className={`text-2xl font-black mb-1 ${textPrimary}`}>
            {pct >= 80 ? '🎉 Excellent!' : pct >= 70 ? '✅ Passing!' : pct >= 55 ? '📚 Almost There' : '💪 Keep Studying'}
          </h2>
          <p className={`text-sm mb-4 ${textMuted}`}>
            {pct >= 80 ? 'Outstanding performance. You demonstrate strong command of Claude architecture.' :
             pct >= 70 ? 'You\'re at certification readiness. Sharpen weak domains before exam day.' :
             pct >= 55 ? 'Good foundation. Focus your study on the domains you missed below.' :
             'Review the architectural patterns and exam philosophy. Structural > probabilistic solutions.'}
          </p>

          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${
            passed ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
            'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
          }`}>
            {passed ? <CheckCircle2 size={15} /> : <AlertTriangle size={15} />}
            {passed ? 'Passing Score (≥72%)' : `Need ${72 - pct}% more to pass`}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {/* Domain radar */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className={`rounded-2xl border p-5 ${cardBg}`}>
            <h3 className={`text-sm font-bold mb-4 ${textPrimary}`}>Domain Performance</h3>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} margin={{ top: 5, right: 20, bottom: 5, left: 20 }}>
                  <PolarGrid stroke={darkMode ? '#334155' : '#e2e8f0'} />
                  <PolarAngleAxis dataKey="name" tick={{ fill: darkMode ? '#94a3b8' : '#64748b', fontSize: 9 }} />
                  <Radar name="Score %" dataKey="value" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.3} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Domain bar chart */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className={`rounded-2xl border p-5 ${cardBg}`}>
            <h3 className={`text-sm font-bold mb-4 ${textPrimary}`}>Score by Domain</h3>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={domainBreakdown} layout="vertical" margin={{ left: 0, right: 20, top: 5, bottom: 5 }}>
                  <XAxis type="number" domain={[0, 100]} tick={{ fill: darkMode ? '#94a3b8' : '#64748b', fontSize: 10 }}
                    tickFormatter={v => `${v}%`} />
                  <YAxis type="category" dataKey="name" width={60} tick={{ fill: darkMode ? '#94a3b8' : '#64748b', fontSize: 9 }} />
                  <Tooltip formatter={(v) => [`${v}%`, 'Score']}
                    contentStyle={{ background: darkMode ? '#1e293b' : '#fff', border: 'none', borderRadius: 8, fontSize: 11 }} />
                  <Bar dataKey="pct" radius={[0, 4, 4, 0]}>
                    {domainBreakdown.map((d, i) => <Cell key={i} fill={d.pct >= 70 ? d.color : '#ef4444'} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Action buttons */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="flex flex-wrap gap-3 mb-6 justify-center">
          <button onClick={onRetry}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-violet-600 text-white font-bold shadow-sm hover:shadow-md transition-shadow">
            <RotateCcw size={16} /> Retry All Questions
          </button>
          <button onClick={onHome}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold border transition-colors ${
              darkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}>
            <Target size={16} /> Change Domain
          </button>
        </motion.div>

        {/* Question review */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className={`rounded-2xl border ${cardBg}`}>
          <div className={`flex items-center justify-between p-4 border-b ${darkMode ? 'border-slate-700' : 'border-slate-100'}`}>
            <h3 className={`text-sm font-bold ${textPrimary}`}>Question Review</h3>
            <div className="flex gap-2">
              {([['wrong', `Missed (${questions.filter(q => !scores[q.id]).length})`], ['correct', `Correct (${correct})`], ['all', 'All']] as const).map(([f, label]) => (
                <button key={f} onClick={() => setReviewFilter(f)}
                  className={`text-xs px-3 py-1 rounded-lg font-semibold transition-all ${
                    reviewFilter === f
                      ? f === 'wrong' ? 'bg-rose-500 text-white' : f === 'correct' ? 'bg-emerald-500 text-white' : 'bg-sky-500 text-white'
                      : darkMode ? 'bg-slate-700 text-slate-400 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y" style={{ borderColor: darkMode ? '#334155' : '#f1f5f9' }}>
            {reviewList.map((q) => {
              const wasCorrect = scores[q.id];
              const isExpanded = expandedQ === q.id;
              const d = domainMeta[q.domain];
              return (
                <div key={q.id}>
                  <button onClick={() => setExpandedQ(isExpanded ? null : q.id)}
                    className={`w-full flex items-start gap-3 p-4 text-left transition-colors ${darkMode ? 'hover:bg-slate-750' : 'hover:bg-slate-50'}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${wasCorrect ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                      {wasCorrect ? <CheckCircle2 size={13} className="text-white" /> : <XCircle size={13} className="text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <span className={`text-xs font-bold ${textMuted}`}>Q{q.id}</span>
                        <span className="text-xs px-1.5 py-0.5 rounded font-semibold" style={{ backgroundColor: d.color + '20', color: d.color }}>{d.icon} {d.label.split(' ')[0]}</span>
                      </div>
                      <p className={`text-sm leading-snug ${textPrimary}`}>{q.question.slice(0, 100)}{q.question.length > 100 ? '…' : ''}</p>
                    </div>
                    {isExpanded ? <ChevronUp size={14} className={textMuted} /> : <ChevronDown size={14} className={textMuted} />}
                  </button>
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className={`px-5 pb-5 border-t ${darkMode ? 'border-slate-700 bg-slate-900/40' : 'border-slate-50 bg-slate-50/50'}`}>
                          <div className="pt-4 space-y-3">
                            <div>
                              <p className={`text-sm leading-relaxed ${textPrimary}`}>{q.question}</p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {q.options.map((opt, idx) => (
                                <div key={opt.letter} className={`flex items-start gap-2 p-2.5 rounded-lg ${
                                  idx === q.correctIndex ? (darkMode ? 'bg-emerald-900/20 border border-emerald-700/30' : 'bg-emerald-50 border border-emerald-200') : ''
                                }`}>
                                  <span className={`text-xs font-bold shrink-0 w-5 ${idx === q.correctIndex ? 'text-emerald-500' : textMuted}`}>{opt.letter}</span>
                                  <span className={`text-xs leading-relaxed ${idx === q.correctIndex ? (darkMode ? 'text-emerald-300' : 'text-emerald-800') : textMuted}`}>{opt.text}</span>
                                </div>
                              ))}
                            </div>
                            <div className={`p-3 rounded-xl border-l-4 border-sky-400 ${darkMode ? 'bg-sky-900/15' : 'bg-sky-50'}`}>
                              <div className={`text-xs font-bold mb-1 ${darkMode ? 'text-sky-400' : 'text-sky-700'}`}>💡 Takeaway</div>
                              <p className={`text-xs leading-relaxed ${darkMode ? 'text-sky-200' : 'text-sky-800'}`}>{q.examTakeaway}</p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
            {reviewList.length === 0 && (
              <div className={`p-8 text-center ${textMuted}`}>
                <CheckCircle2 size={32} className="mx-auto mb-2 text-emerald-500" />
                <p>No questions in this filter</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type Screen = 'intro' | 'quiz' | 'results';

export function CertificationPracticePage() {
  const { darkMode } = useAppStore();
  const [screen, setScreen] = useState<Screen>('intro');
  const [domainFilter, setDomainFilter] = useState<ExamDomain | 'all'>('all');
  const [scores, setScores] = useState<Record<string, boolean>>({});

  const activeQuestions = useMemo(() =>
    domainFilter === 'all'
      ? certQuestions
      : certQuestions.filter(q => q.domain === domainFilter),
    [domainFilter]
  );

  const handleStart = (filter: ExamDomain | 'all') => {
    setDomainFilter(filter);
    setScores({});
    setScreen('quiz');
  };

  const handleFinish = (finalScores: Record<string, boolean>) => {
    setScores(finalScores);
    setScreen('results');
  };

  return (
    <AnimatePresence mode="wait">
      {screen === 'intro' && (
        <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full overflow-y-auto">
          <IntroScreen darkMode={darkMode} onStart={handleStart} />
        </motion.div>
      )}
      {screen === 'quiz' && (
        <motion.div key="quiz" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full overflow-y-auto">
          <QuizScreen questions={activeQuestions} darkMode={darkMode} onFinish={handleFinish} />
        </motion.div>
      )}
      {screen === 'results' && (
        <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full overflow-y-auto">
          <ResultsScreen
            questions={activeQuestions}
            scores={scores}
            darkMode={darkMode}
            onRetry={() => { setScores({}); setScreen('quiz'); }}
            onHome={() => setScreen('intro')}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
