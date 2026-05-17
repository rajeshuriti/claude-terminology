import { useMemo } from 'react';
import Fuse from 'fuse.js';
import { globalSearchIndex } from '@/data/globalSearchIndex';
import type { SearchEntry, SearchCategory } from '@/data/globalSearchIndex';

const fuse = new Fuse(globalSearchIndex, {
  keys: [
    { name: 'title',         weight: 4   },
    { name: 'tags',          weight: 2.5 },
    { name: 'module',        weight: 1.5 },
    { name: 'description',   weight: 1.5 },
    { name: 'whyItMatters',  weight: 1   },
    { name: 'related',       weight: 0.8 },
  ],
  threshold: 0.42,
  includeScore: true,
  minMatchCharLength: 2,
});

export function useGlobalSearch(
  query: string,
  categoryFilter?: SearchCategory | null,
): SearchEntry[] {
  return useMemo(() => {
    let results: SearchEntry[];

    if (query.trim().length < 2) {
      results = [...globalSearchIndex];
    } else {
      results = fuse.search(query).map(r => r.item);
    }

    if (categoryFilter) {
      results = results.filter(e => e.category === categoryFilter);
    }

    return results;
  }, [query, categoryFilter]);
}
