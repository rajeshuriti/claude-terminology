import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HelpCircle, CheckCircle2, XCircle, RotateCcw, ArrowRight,
  BookOpen, Zap, Trophy, ChevronLeft, ChevronRight, Eye, EyeOff
} from 'lucide-react';
import { quizQuestions, flashcards } from '@/data/quizData';
import { conceptMap } from '@/data/concepts';
import { useAppStore } from '@/store/appStore';

type Mode = 'select' | 'quiz' | 'flashcards' | 'results';
type FlashcardSide = 'front' | 'back';

// --- Quiz Component ---
function QuizMode({ onFinish, onBack }: { onFinish: () => void; onBack: () => void }) {
  const { darkMode, recordQuizAnswer } = useAppStore();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionTotal, setSessionTotal] = useState(0);

  const q = quizQuestions[currentIdx];
  const concept = conceptMap.get(q.conceptId);
  const isLast = currentIdx === quizQuestions.length - 1;

  const handleSelect = (idx: number) => {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
    const correct = idx === q.correctIndex;
    recordQuizAnswer(q.id, correct);
    setSessionTotal((t) => t + 1);
    if (correct) setSessionCorrect((c) => c + 1);
  };

  const handleNext = () => {
    if (isLast) {
      onFinish();
    } else {
      setCurrentIdx((i) => i + 1);
      setSelected(null);
      setAnswered(false);
    }
  };

  const progress = ((currentIdx + 1) / quizQuestions.length) * 100;
  const textPrimary = darkMode ? 'text-white' : 'text-slate-900';
  const textMuted = darkMode ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className={`flex items-center gap-1.5 text-sm ${textMuted} hover:text-sky-500 transition-colors`}>
          <ChevronLeft size={16} /> Back
        </button>
        <div className={`text-sm ${textMuted}`}>Question {currentIdx + 1} of {quizQuestions.length}</div>
        <div className={`text-sm font-semibold text-emerald-500`}>
          {sessionCorrect}/{sessionTotal} correct
        </div>
      </div>

      {/* Progress bar */}
      <div className={`h-1.5 rounded-full mb-6 ${darkMode ? 'bg-slate-800' : 'bg-slate-200'}`}>
        <motion.div
          className="h-full rounded-full bg-sky-500"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIdx}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {/* Concept tag */}
          {concept && (
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium mb-4 ${darkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
              <HelpCircle size={12} />
              {concept.term} · {q.difficulty}
            </div>
          )}

          {/* Question */}
          <h2 className={`text-lg font-semibold leading-relaxed mb-6 ${textPrimary}`}>{q.question}</h2>

          {/* Options */}
          <div className="space-y-3 mb-6">
            {q.options.map((opt, idx) => {
              const isSelected = selected === idx;
              const isCorrect = idx === q.correctIndex;
              let style = '';
              if (answered) {
                if (isCorrect) style = 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20';
                else if (isSelected && !isCorrect) style = 'border-rose-400 bg-rose-50 dark:bg-rose-900/20';
                else style = darkMode ? 'border-slate-700 bg-slate-800/50 opacity-60' : 'border-slate-200 bg-slate-50 opacity-60';
              } else {
                style = darkMode
                  ? 'border-slate-700 bg-slate-800 hover:border-sky-500 hover:bg-slate-700 cursor-pointer'
                  : 'border-slate-200 bg-white hover:border-sky-400 hover:bg-sky-50 cursor-pointer';
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(idx)}
                  disabled={answered}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${style}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                    answered && isCorrect ? 'bg-emerald-500 text-white' :
                    answered && isSelected && !isCorrect ? 'bg-rose-500 text-white' :
                    darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {answered && isCorrect ? <CheckCircle2 size={16} /> :
                     answered && isSelected && !isCorrect ? <XCircle size={16} /> :
                     String.fromCharCode(65 + idx)}
                  </div>
                  <span className={`text-sm font-medium ${textPrimary}`}>{opt}</span>
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          <AnimatePresence>
            {answered && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className={`rounded-xl p-4 mb-6 border-l-4 ${
                  selected === q.correctIndex
                    ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/15'
                    : 'border-rose-400 bg-rose-50 dark:bg-rose-900/15'
                }`}
              >
                <div className={`text-xs font-semibold mb-1 ${selected === q.correctIndex ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}>
                  {selected === q.correctIndex ? '✓ Correct!' : '✗ Incorrect'}
                </div>
                <p className={`text-sm leading-relaxed ${textMuted}`}>{q.explanation}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {answered && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={handleNext}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold transition-colors"
            >
              {isLast ? 'View Results' : 'Next Question'}
              <ArrowRight size={18} />
            </motion.button>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// --- Flashcard Component ---
function FlashcardMode({ onBack }: { onBack: () => void }) {
  const { darkMode } = useAppStore();
  const [idx, setIdx] = useState(0);
  const [side, setSide] = useState<FlashcardSide>('front');
  const [flipping, setFlipping] = useState(false);

  const card = flashcards[idx];
  const concept = conceptMap.get(card.conceptId);

  const handleFlip = () => {
    setFlipping(true);
    setTimeout(() => {
      setSide((s) => (s === 'front' ? 'back' : 'front'));
      setFlipping(false);
    }, 150);
  };

  const handleNext = () => {
    setSide('front');
    setIdx((i) => Math.min(i + 1, flashcards.length - 1));
  };

  const handlePrev = () => {
    setSide('front');
    setIdx((i) => Math.max(i - 1, 0));
  };

  const textPrimary = darkMode ? 'text-white' : 'text-slate-900';
  const textMuted = darkMode ? 'text-slate-400' : 'text-slate-500';
  const cardBg = darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200';

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className={`flex items-center gap-1.5 text-sm ${textMuted} hover:text-sky-500 transition-colors`}>
          <ChevronLeft size={16} /> Back
        </button>
        <span className={`text-sm ${textMuted}`}>Card {idx + 1} of {flashcards.length}</span>
        <span className={`text-xs px-2 py-1 rounded-full ${darkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
          {concept?.category}
        </span>
      </div>

      {/* Progress dots */}
      <div className="flex gap-1 justify-center mb-6">
        {flashcards.map((_, i) => (
          <button
            key={i}
            onClick={() => { setIdx(i); setSide('front'); }}
            className={`w-1.5 h-1.5 rounded-full transition-all ${i === idx ? 'bg-sky-500 w-4' : darkMode ? 'bg-slate-700' : 'bg-slate-200'}`}
          />
        ))}
      </div>

      {/* Flashcard */}
      <motion.div
        animate={{ rotateY: flipping ? 90 : 0, opacity: flipping ? 0 : 1 }}
        transition={{ duration: 0.15 }}
        onClick={handleFlip}
        className={`relative rounded-3xl border-2 p-8 min-h-48 flex flex-col items-center justify-center text-center cursor-pointer transition-shadow hover:shadow-xl select-none ${
          side === 'back'
            ? darkMode ? 'bg-sky-900/20 border-sky-700' : 'bg-sky-50 border-sky-200'
            : `${cardBg}`
        }`}
      >
        <div className={`absolute top-4 right-4 flex items-center gap-1 text-xs ${textMuted}`}>
          {side === 'front' ? <Eye size={12} /> : <EyeOff size={12} />}
          {side === 'front' ? 'Tap to reveal' : 'Answer'}
        </div>

        {side === 'front' ? (
          <>
            <div className={`text-3xl mb-4`}>{concept?.categoryId === 'prompt-engineering' ? '✍️' : concept?.categoryId === 'rag-retrieval' ? '🔍' : concept?.categoryId === 'tool-use-mcp' ? '🔧' : '📌'}</div>
            <h2 className={`text-2xl font-bold ${textPrimary}`}>{card.front}</h2>
            <p className={`text-sm mt-2 ${textMuted}`}>{concept?.category}</p>
          </>
        ) : (
          <>
            <p className={`text-base leading-relaxed font-medium ${textPrimary}`}>{card.back}</p>
          </>
        )}
      </motion.div>

      <div className="flex items-center justify-between mt-6">
        <button
          onClick={handlePrev}
          disabled={idx === 0}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            idx === 0
              ? 'opacity-30 cursor-not-allowed ' + (darkMode ? 'text-slate-500' : 'text-slate-400')
              : darkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
          }`}
        >
          <ChevronLeft size={16} /> Previous
        </button>
        <button
          onClick={handleFlip}
          className={`px-6 py-2 rounded-xl text-sm font-medium transition-colors ${darkMode ? 'bg-slate-800 hover:bg-slate-700 text-sky-400' : 'bg-sky-50 hover:bg-sky-100 text-sky-600'}`}
        >
          Flip Card
        </button>
        <button
          onClick={handleNext}
          disabled={idx === flashcards.length - 1}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            idx === flashcards.length - 1
              ? 'opacity-30 cursor-not-allowed ' + (darkMode ? 'text-slate-500' : 'text-slate-400')
              : darkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
          }`}
        >
          Next <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

// --- Results Component ---
function QuizResults({ onRestart, onBack }: { onRestart: () => void; onBack: () => void }) {
  const { darkMode, totalQuizAttempts, totalCorrect } = useAppStore();
  const accuracy = totalQuizAttempts > 0 ? Math.round((totalCorrect / totalQuizAttempts) * 100) : 0;
  const textPrimary = darkMode ? 'text-white' : 'text-slate-900';
  const textMuted = darkMode ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className="max-w-sm mx-auto text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="mb-6"
      >
        <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 ${
          accuracy >= 80 ? 'bg-gradient-to-br from-emerald-400 to-emerald-600' :
          accuracy >= 60 ? 'bg-gradient-to-br from-sky-400 to-sky-600' :
          'bg-gradient-to-br from-amber-400 to-orange-500'
        }`}>
          <Trophy size={40} className="text-white" />
        </div>
        <h2 className={`text-2xl font-bold ${textPrimary}`}>
          {accuracy >= 80 ? 'Excellent!' : accuracy >= 60 ? 'Good Progress!' : 'Keep Practicing!'}
        </h2>
        <p className={`mt-1 text-sm ${textMuted}`}>
          {totalCorrect} correct out of {totalQuizAttempts} total attempts
        </p>
      </motion.div>

      <div className={`rounded-2xl p-6 mb-6 ${darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-slate-50 border border-slate-200'}`}>
        <div className={`text-5xl font-black mb-2 ${
          accuracy >= 80 ? 'text-emerald-500' : accuracy >= 60 ? 'text-sky-500' : 'text-amber-500'
        }`}>
          {accuracy}%
        </div>
        <div className={`text-sm ${textMuted}`}>Overall Accuracy</div>
        <div className={`h-3 rounded-full mt-4 ${darkMode ? 'bg-slate-700' : 'bg-slate-200'}`}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${accuracy}%` }}
            transition={{ duration: 1, delay: 0.3 }}
            className={`h-full rounded-full ${
              accuracy >= 80 ? 'bg-emerald-500' : accuracy >= 60 ? 'bg-sky-500' : 'bg-amber-500'
            }`}
          />
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={onBack} className={`flex-1 py-2.5 rounded-xl text-sm font-medium border ${darkMode ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
          <span className="flex items-center justify-center gap-2"><ChevronLeft size={16} /> Back</span>
        </button>
        <button onClick={onRestart} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium transition-colors">
          <RotateCcw size={16} /> Retry
        </button>
      </div>
    </div>
  );
}

// --- Main Quiz Page ---
export function QuizPage() {
  const { darkMode } = useAppStore();
  const [mode, setMode] = useState<Mode>('select');

  const textPrimary = darkMode ? 'text-white' : 'text-slate-900';
  const textMuted = darkMode ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className={`min-h-full ${darkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <div className="max-w-3xl mx-auto p-4 md:p-8">
        {mode === 'select' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className={`text-2xl font-bold mb-1 ${textPrimary}`}>Quiz & Flashcards</h1>
            <p className={`text-sm mb-8 ${textMuted}`}>Test your knowledge and prepare for certification</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setMode('quiz')}
                className={`p-6 rounded-2xl border-2 text-left transition-shadow hover:shadow-lg ${darkMode ? 'bg-slate-800 border-slate-700 hover:border-sky-600' : 'bg-white border-slate-200 hover:border-sky-400'}`}
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center mb-4">
                  <HelpCircle size={24} className="text-white" />
                </div>
                <h2 className={`text-lg font-bold mb-1 ${textPrimary}`}>Multiple Choice Quiz</h2>
                <p className={`text-sm ${textMuted}`}>{quizQuestions.length} scenario-based questions covering all certification topics</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className={`text-xs px-2 py-1 rounded-lg ${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-sky-50 text-sky-700'}`}>Instant feedback</span>
                  <span className={`text-xs px-2 py-1 rounded-lg ${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-sky-50 text-sky-700'}`}>Explanations</span>
                  <span className={`text-xs px-2 py-1 rounded-lg ${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-sky-50 text-sky-700'}`}>Score tracking</span>
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setMode('flashcards')}
                className={`p-6 rounded-2xl border-2 text-left transition-shadow hover:shadow-lg ${darkMode ? 'bg-slate-800 border-slate-700 hover:border-violet-600' : 'bg-white border-slate-200 hover:border-violet-400'}`}
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center mb-4">
                  <BookOpen size={24} className="text-white" />
                </div>
                <h2 className={`text-lg font-bold mb-1 ${textPrimary}`}>Flashcard Review</h2>
                <p className={`text-sm ${textMuted}`}>{flashcards.length} concept flashcards for rapid memorization and review</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className={`text-xs px-2 py-1 rounded-lg ${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-violet-50 text-violet-700'}`}>Flip to reveal</span>
                  <span className={`text-xs px-2 py-1 rounded-lg ${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-violet-50 text-violet-700'}`}>Quick review</span>
                  <span className={`text-xs px-2 py-1 rounded-lg ${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-violet-50 text-violet-700'}`}>Key insights</span>
                </div>
              </motion.button>
            </div>

            {/* Tips */}
            <div className={`rounded-2xl p-5 ${darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-100'}`}>
              <div className="flex items-center gap-2 mb-3">
                <Zap size={16} className="text-amber-500" />
                <h3 className={`text-sm font-semibold ${textPrimary}`}>Certification Prep Tips</h3>
              </div>
              <div className="space-y-2">
                {[
                  'Focus on orchestration and reliability — not just prompting',
                  'Understand tradeoffs, not just definitions',
                  'Know when to use RAG vs fine-tuning vs context injection',
                  'Understand MCP architecture at a systems level',
                  'Study failure modes aggressively',
                ].map((tip, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="w-4 h-4 rounded-full bg-sky-500 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-white text-xs">{i + 1}</span>
                    </div>
                    <span className={`text-sm ${textMuted}`}>{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {mode === 'quiz' && (
          <QuizMode
            onFinish={() => setMode('results')}
            onBack={() => setMode('select')}
          />
        )}

        {mode === 'flashcards' && (
          <FlashcardMode onBack={() => setMode('select')} />
        )}

        {mode === 'results' && (
          <QuizResults
            onRestart={() => setMode('quiz')}
            onBack={() => setMode('select')}
          />
        )}
      </div>
    </div>
  );
}
