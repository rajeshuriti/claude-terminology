import { useMemo } from 'react';
import Fuse from 'fuse.js';
import { concepts } from '@/data/concepts';
import type { Concept } from '@/types';

const fuse = new Fuse(concepts, {
  keys: [
    { name: 'term', weight: 3 },
    { name: 'category', weight: 2 },
    { name: 'description', weight: 2 },
    { name: 'purpose', weight: 1.5 },
    { name: 'usage', weight: 1 },
    { name: 'insight', weight: 1 },
    { name: 'tags', weight: 1.5 },
  ],
  threshold: 0.35,
  includeScore: true,
  includeMatches: true,
  minMatchCharLength: 2,
});

export function useSearch(query: string, categoryFilter?: string | null, difficultyFilter?: string | null): Concept[] {
  return useMemo(() => {
    let results: Concept[];

    if (query.trim().length < 2) {
      results = [...concepts];
    } else {
      results = fuse.search(query).map((r) => r.item);
    }

    if (categoryFilter) {
      results = results.filter((c) => c.categoryId === categoryFilter);
    }

    if (difficultyFilter) {
      results = results.filter((c) => c.difficulty === difficultyFilter);
    }

    return results;
  }, [query, categoryFilter, difficultyFilter]);
}
