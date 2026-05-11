import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  // Theme
  darkMode: boolean;
  toggleDarkMode: () => void;

  // Learning mode
  learningMode: 'beginner' | 'intermediate' | 'advanced';
  setLearningMode: (mode: 'beginner' | 'intermediate' | 'advanced') => void;

  // Progress tracking
  completedConcepts: string[];
  toggleCompleted: (id: string) => void;

  bookmarkedConcepts: string[];
  toggleBookmark: (id: string) => void;

  recentlyViewed: string[];
  addRecentlyViewed: (id: string) => void;

  // Quiz tracking
  quizScores: Record<string, { correct: number; total: number }>;
  recordQuizAnswer: (questionId: string, correct: boolean) => void;
  totalQuizAttempts: number;
  totalCorrect: number;

  // Search
  searchQuery: string;
  setSearchQuery: (q: string) => void;

  // Selected category filter
  selectedCategory: string | null;
  setSelectedCategory: (id: string | null) => void;

  // Difficulty filter
  difficultyFilter: string | null;
  setDifficultyFilter: (d: string | null) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      darkMode: false,
      toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),

      learningMode: 'intermediate',
      setLearningMode: (mode) => set({ learningMode: mode }),

      completedConcepts: [],
      toggleCompleted: (id) =>
        set((s) => ({
          completedConcepts: s.completedConcepts.includes(id)
            ? s.completedConcepts.filter((c) => c !== id)
            : [...s.completedConcepts, id],
        })),

      bookmarkedConcepts: [],
      toggleBookmark: (id) =>
        set((s) => ({
          bookmarkedConcepts: s.bookmarkedConcepts.includes(id)
            ? s.bookmarkedConcepts.filter((c) => c !== id)
            : [...s.bookmarkedConcepts, id],
        })),

      recentlyViewed: [],
      addRecentlyViewed: (id) =>
        set((s) => {
          const filtered = s.recentlyViewed.filter((v) => v !== id);
          return { recentlyViewed: [id, ...filtered].slice(0, 10) };
        }),

      quizScores: {},
      totalQuizAttempts: 0,
      totalCorrect: 0,
      recordQuizAnswer: (questionId, correct) =>
        set((s) => {
          const prev = s.quizScores[questionId] ?? { correct: 0, total: 0 };
          return {
            quizScores: {
              ...s.quizScores,
              [questionId]: {
                correct: prev.correct + (correct ? 1 : 0),
                total: prev.total + 1,
              },
            },
            totalQuizAttempts: s.totalQuizAttempts + 1,
            totalCorrect: s.totalCorrect + (correct ? 1 : 0),
          };
        }),

      searchQuery: '',
      setSearchQuery: (q) => set({ searchQuery: q }),

      selectedCategory: null,
      setSelectedCategory: (id) => set({ selectedCategory: id }),

      difficultyFilter: null,
      setDifficultyFilter: (d) => set({ difficultyFilter: d }),
    }),
    {
      name: 'claude-learning-platform',
      partialize: (s) => ({
        darkMode: s.darkMode,
        learningMode: s.learningMode,
        completedConcepts: s.completedConcepts,
        bookmarkedConcepts: s.bookmarkedConcepts,
        recentlyViewed: s.recentlyViewed,
        quizScores: s.quizScores,
        totalQuizAttempts: s.totalQuizAttempts,
        totalCorrect: s.totalCorrect,
      }),
    }
  )
);
