export type SourceType = 'quran' | 'hadith' | 'tafsir';

export type GradeCategory = 'sahih' | 'hasan' | 'daif' | 'unclassified';

export interface ScholarGrade {
  scholar: string;
  grade: string;
}

export interface RawSearchResult {
  id: string;
  type: string;
  text: string;
  citation: string;
  score: number;
  arabic?: string | null;
  metadata: {
    surah?: number;
    ayah?: number;
    surah_name?: string;
    edition?: string;
    collection?: string;
    collection_name?: string;
    book_number?: number | string;
    hadith_number?: number | string;
    chapter?: string;
    grades?: ScholarGrade[];
    grade_category?: GradeCategory | string;
    tafsir_name?: string;
    author?: string;
    [key: string]: any;
  };
}

export interface SearchResponse {
  results: RawSearchResult[];
}

export interface AskResponse {
  answer: string;
  sources: RawSearchResult[];
}

export interface FolioFilterState {
  types: SourceType[];
  collections: string[];
  minGrade: string | null;
}

export type SearchMode = 'search' | 'ask';

export interface BackendConfig {
  baseUrl: string;
  useMockOnFailure: boolean;
  isCustomUrl: boolean;
}
