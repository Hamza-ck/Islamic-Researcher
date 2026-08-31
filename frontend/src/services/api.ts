import { RawSearchResult, SearchMode, FolioFilterState, AskResponse, SearchResponse } from '../types';
import { MOCK_CORPUS, SYNTHESIS_PRESETS } from '../data/mockCorpus';

const STORAGE_KEY_BASE_URL = 'folio_backend_url';
const DEFAULT_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export function getStoredBackendUrl(): string {
  if (typeof window === 'undefined') return DEFAULT_URL;
  return localStorage.getItem(STORAGE_KEY_BASE_URL) || DEFAULT_URL;
}

export function setStoredBackendUrl(url: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_BASE_URL, url.trim().replace(/\/$/, ''));
}

export async function checkBackendHealth(url: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);
    const res = await fetch(`${url}/health`, {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' }
    });
    clearTimeout(timeoutId);
    return res.ok;
  } catch {
    return false;
  }
}

// Fallback search over mock corpus
function searchLocalMockCorpus(
  query: string,
  filterState?: Partial<FolioFilterState>,
  topK: number = 8
): RawSearchResult[] {
  const queryLower = query.toLowerCase().trim();
  const queryWords = queryLower.split(/\s+/).filter(w => w.length > 2);

  let pool = MOCK_CORPUS;

  // Filter by source type
  if (filterState?.types && filterState.types.length > 0) {
    pool = pool.filter(item => filterState.types!.includes(item.type as any));
  }

  // Filter by hadith collection
  if (filterState?.collections && filterState.collections.length > 0) {
    pool = pool.filter(item => {
      if (item.type !== 'hadith') return true;
      const coll = item.metadata.collection?.toLowerCase() || '';
      return filterState.collections!.some(c => coll.includes(c.toLowerCase()));
    });
  }

  // Filter by grade
  if (filterState?.minGrade) {
    const gradeRank: Record<string, number> = { sahih: 3, hasan: 2, unclassified: 1, daif: 0 };
    const minRank = gradeRank[filterState.minGrade] ?? 0;
    pool = pool.filter(item => {
      if (item.type !== 'hadith') return true;
      const itemGrade = item.metadata.grade_category || 'unclassified';
      return (gradeRank[itemGrade] ?? 1) >= minRank;
    });
  }

  if (!queryLower) {
    return pool.slice(0, topK);
  }

  // Score based on word hits in text, citation, arabic, or metadata
  const scored = pool.map(item => {
    let score = 0;
    const fullText = `${item.citation} ${item.text} ${item.metadata.chapter || ''} ${item.metadata.surah_name || ''} ${item.metadata.author || ''}`.toLowerCase();
    
    // Direct substring bonus
    if (fullText.includes(queryLower)) {
      score += 2.0;
    }

    // Word occurrences
    for (const w of queryWords) {
      if (fullText.includes(w)) {
        score += 0.5;
      }
    }

    return {
      ...item,
      score: Math.min(0.99, (item.score || 0.8) + (score * 0.05))
    };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK);
}

export interface QueryExecutionResult {
  isLive: boolean;
  results: RawSearchResult[];
  answer?: string;
  error?: string;
}

export async function executeFolioQuery(
  mode: SearchMode,
  query: string,
  filterState: FolioFilterState,
  topK: number = 8
): Promise<QueryExecutionResult> {
  const baseUrl = getStoredBackendUrl();
  const trimmed = query.trim();

  // Try live backend first
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    if (mode === 'search') {
      const payload: any = {
        query: trimmed,
        top_k: topK,
      };
      if (filterState.types.length > 0) payload.types = filterState.types;
      if (filterState.collections.length > 0) payload.collections = filterState.collections;
      if (filterState.minGrade) payload.min_grade = filterState.minGrade;

      const res = await fetch(`${baseUrl}/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data: SearchResponse = await res.json();
        return {
          isLive: true,
          results: data.results || [],
        };
      }
    } else {
      // mode === 'ask'
      const payload = {
        query: trimmed,
        top_k: Math.min(topK, 6),
      };

      const res = await fetch(`${baseUrl}/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data: AskResponse = await res.json();
        return {
          isLive: true,
          results: data.sources || [],
          answer: data.answer,
        };
      }
    }
  } catch (err) {
    // Backend offline or failed; continue to offline/mock mode seamlessly
    console.info('Backend unreachable, using embedded critical folio corpus fallback:', err);
  }

  // Offline / Demo Scholarly Corpus Fallback
  const fallbackResults = searchLocalMockCorpus(trimmed, filterState, topK);

  if (mode === 'ask') {
    // Check if preset synthesis exists for this query
    let synthesis = SYNTHESIS_PRESETS[trimmed.toLowerCase()];
    if (!synthesis && fallbackResults.length > 0) {
      const citations = fallbackResults.map(r => `(${r.citation})`).join(', ');
      synthesis = `Based on retrieved classical sources regarding "${query}":\n\nThe passages highlight key rulings and spiritual wisdom across Quranic revelation and prophetic traditions, specifically documented in ${citations}. Each claim is directly grounded in the marginal citations and preserved authentic grades below.`;
    }

    return {
      isLive: false,
      results: fallbackResults,
      answer: synthesis || 'No direct synthesis available in offline corpus for this query.',
    };
  }

  return {
    isLive: false,
    results: fallbackResults,
  };
}
