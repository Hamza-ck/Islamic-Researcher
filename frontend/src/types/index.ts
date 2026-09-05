export type SourceType = 'quran' | 'hadith' | 'tafsir' | 'lecture_transcript';

export type GradeCategory = 'sahih' | 'hasan' | 'daif' | 'unclassified';

export type ResponseStyle = 'concise' | 'scholarly' | 'detailed';

export type DetailLevel = 'brief' | 'standard' | 'comprehensive';

export type AppView = 'chat' | 'library' | 'scholars' | 'collections';

export type ResearchMode = 'quick' | 'research' | 'deep';

export interface ScholarGrade {
  scholar?: string;
  name?: string;
  grade: string;
}

export interface RawSearchResult {
  id: string;
  type: string;
  text: string;
  citation: string;
  score: number;
  arabic?: string | null;
  origin?: 'internal' | 'external' | 'offline_demo';
  source_priority?: string;
  metadata: {
    surah?: number;
    ayah?: number;
    surah_name?: string;
    edition?: string;
    collection?: string;
    collection_name?: string;
    collection_title?: string;
    book?: number | string;
    book_number?: number | string;
    hadithnumber?: number | string;
    hadith_number?: number | string;
    chapter?: string;
    grades?: ScholarGrade[];
    grade_category?: GradeCategory | string;
    tafsir_name?: string;
    author?: string;
    scholar?: string;
    series?: string;
    timestamp_url?: string;
    duration?: string;
    [key: string]: any;
  };
}

export interface SearchResponse {
  results: RawSearchResult[];
}

export interface SynthesisMetadata {
  confidence: string;
  confidence_score?: number;
  model_used: string;
  tokens_used: number;
  latency_ms: number;
  response_style: string;
  temperature: number;
  verification?: Record<string, unknown>;
  research_plan?: Record<string, unknown> | null;
}

export interface ResearchClaim {
  id: string;
  text: string;
  sources: string[];
  support: 'supported' | 'weak' | 'unsupported';
}

export interface ResearchContradiction {
  summary: string;
  source_ids: string[];
}

export interface ResearchTimelineStep {
  stage: string;
  detail?: string;
  at?: string;
}

export interface ResearchPayload {
  research_id: string;
  query: string;
  status: string;
  mode: ResearchMode;
  answer: string;
  claims: ResearchClaim[];
  sources: RawSearchResult[];
  contradictions: ResearchContradiction[];
  confidence: { level: string; score: number; note?: string };
  sufficiency: { status: string; score: number; reason: string; missing_information?: string[] };
  external_research_used: boolean;
  timeline: ResearchTimelineStep[];
  metadata?: Record<string, unknown>;
}

export interface AskResponse {
  answer: string;
  sources: RawSearchResult[];
  metadata?: SynthesisMetadata | null;
  query_id?: string | null;
}

export interface SynthesisOptions {
  responseStyle: ResponseStyle;
  detailLevel: DetailLevel;
  temperature: number;
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

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  mode: SearchMode;
  researchMode?: ResearchMode;
  results?: RawSearchResult[];
  metadata?: SynthesisMetadata | null;
  queryId?: string | null;
  timestamp: number;
  isDemo?: boolean;
  research?: ResearchPayload | null;
}

export interface HistorySession {
  id: string;
  title: string;
  preview: string;
  timestamp: number;
  messages: ChatMessage[];
}

export interface LibraryBook {
  id: string;
  bookNumber: number | string;
  nameArabic?: string;
  nameEnglish: string;
  hadithCount?: number;
  description?: string;
  sampleHadithId?: string;
}

export interface LibraryCollection {
  id: string;
  title: string;
  arabicTitle: string;
  scholar: string;
  totalHadith: number;
  description: string;
  books: LibraryBook[];
}

export interface ScholarLecture {
  id: string;
  scholar: string;
  series: string;
  title: string;
  surah?: string | number;
  ruku?: number;
  duration?: string;
  audioUrl?: string;
  videoUrl?: string;
  timestampAnchor?: string;
  transcriptExcerpt: string;
  arabicText?: string;
  topics: string[];
}
