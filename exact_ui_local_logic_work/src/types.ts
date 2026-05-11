// ============================================================
// NewsAI Platform — Type Definitions
// ============================================================

export interface Article {
  id?: number;
  articleId: string;
  title: string;
  description: string;
  content: string;
  url: string;
  imageUrl: string | null;
  source: string;
  sourceIcon: string | null;
  author: string | null;
  category: string[];
  country: string[];
  language: string;
  publishedAt: string;
  fetchedAt: string;
  // AI-generated fields
  summary: string | null;
  sentiment: 'positive' | 'negative' | 'neutral' | null;
  sentimentScore: number | null;
  insights: string[];
  keywords: string[];
  aiProcessed: boolean;
}

export interface NewsFilters {
  search: string;
  category: string;
  source: string;
  sentiment: string;
  region: string; // New: 'all' | 'india' | 'asia' | 'us' | 'uk' | 'global'
  dateFrom: string;
  dateTo: string;
  sortBy: 'newest' | 'oldest';
  page: number;
  pageSize: number;
}

export interface PaginationResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface DashboardStats {
  totalArticles: number;
  todayArticles: number;
  thisWeekArticles: number;
  aiProcessed: number;
  categories: { name: string; count: number }[];
  sources: { name: string; count: number }[];
  sentimentDistribution: { positive: number; negative: number; neutral: number };
  recentArticles: Article[];
  trendingKeywords: { keyword: string; count: number }[];
  articlesByDate: { date: string; count: number }[];
}

export interface AIAnalysis {
  summary: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  sentimentScore: number;
  insights: string[];
  keywords: string[];
}

export interface NewsDataResponse {
  status: string;
  totalResults: number;
  results: NewsDataArticle[];
  nextPage?: string;
}

export interface NewsDataArticle {
  article_id: string;
  title: string;
  link: string;
  keywords: string[] | null;
  creator: string[] | null;
  description: string | null;
  content: string | null;
  pubDate: string;
  image_url: string | null;
  source_id: string;
  source_icon: string | null;
  source_priority: number;
  country: string[] | null;
  category: string[] | null;
  language: string;
}

export type PageType = 'dashboard' | 'explorer' | 'analytics' | 'settings';

export interface FetchProgress {
  isLoading: boolean;
  stage: string;
  current: number;
  total: number;
  error: string | null;
  lastFetched: string | null;
}

export const DEFAULT_FILTERS: NewsFilters = {
  search: '',
  category: 'all',
  source: 'all',
  sentiment: 'all',
  region: 'all',
  dateFrom: '',
  dateTo: '',
  sortBy: 'newest',
  page: 1,
  pageSize: 12,
};
