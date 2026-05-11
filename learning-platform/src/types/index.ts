export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export type CategoryId =
  | 'prompt-engineering'
  | 'sampling-parameters'
  | 'tool-use-mcp'
  | 'agent-architecture'
  | 'rag-retrieval'
  | 'context-memory'
  | 'evaluation-reliability'
  | 'extraction-data'
  | 'claude-code-commands'
  | 'apis-runtime'
  | 'safety-governance'
  | 'browser-automation'
  | 'production-infrastructure';

export interface Concept {
  id: string;
  term: string;
  category: string;
  categoryId: CategoryId;
  description: string;
  purpose: string;
  usage: string;
  example: string;
  insight: string;
  difficulty: Difficulty;
  architectureRelevance: number; // 1-5
  certificationPriority: number; // 1-5
  relatedConcepts: string[]; // concept IDs
  tags: string[];
  estimatedTime: number; // minutes
}

export interface Category {
  id: CategoryId;
  name: string;
  description: string;
  icon: string;
  color: string;
  conceptCount: number;
}

export interface QuizQuestion {
  id: string;
  conceptId: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: Difficulty;
}

export interface Flashcard {
  id: string;
  conceptId: string;
  front: string;
  back: string;
}

export interface RoadmapNode {
  id: string;
  label: string;
  description: string;
  concepts: string[];
  week: number;
  position: { x: number; y: number };
}

export interface Roadmap {
  id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  estimatedWeeks: number;
  nodes: RoadmapNode[];
  color: string;
  icon: string;
}

export interface ComparisonItem {
  id: string;
  title: string;
  items: Array<{
    label: string;
    a: string;
    b: string;
  }>;
  conceptA: string;
  conceptB: string;
}

export interface UserProgress {
  completedConcepts: Set<string>;
  bookmarkedConcepts: Set<string>;
  quizScores: Record<string, number>;
  recentlyViewed: string[];
  totalQuizAttempts: number;
  correctQuizAnswers: number;
}
