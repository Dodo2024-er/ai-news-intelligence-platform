
// Local-lite API adapter. Keeps the reference UI unchanged while using the Express JSON backend.
import type { Article, DashboardStats, NewsFilters, PaginationResult } from './types';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function toSentiment(value: any): 'positive' | 'negative' | 'neutral' {
  const v = String(value || 'neutral').toLowerCase();
  return v === 'positive' || v === 'negative' ? v : 'neutral';
}

function toArticle(raw: any, index = 0): Article {
  const sentiment = toSentiment(raw.sentiment);
  const date = raw.publishedAt || raw.date || raw.pubDate || raw.fetchedAt || new Date().toISOString();
  return {
    id: index + 1,
    articleId: String(raw.articleId || raw.id || raw._id || raw.title || `article-${index}`),
    title: raw.title || 'Untitled article',
    description: raw.description || raw.summary || '',
    content: raw.content || raw.summary || raw.description || '',
    url: raw.url || raw.link || '',
    imageUrl: raw.imageUrl || raw.image_url || null,
    source: raw.source || raw.source_id || raw.sourceName || 'NewsData.io',
    sourceIcon: raw.sourceIcon || raw.source_icon || null,
    author: raw.author || null,
    category: Array.isArray(raw.category) ? raw.category : [raw.category || 'technology'],
    country: Array.isArray(raw.country) ? raw.country : [raw.region || 'global'],
    language: raw.language || 'en',
    publishedAt: date,
    fetchedAt: raw.fetchedAt || new Date().toISOString(),
    summary: raw.summary || raw.description || null,
    sentiment,
    sentimentScore: raw.sentimentScore ?? (sentiment === 'positive' ? 0.7 : sentiment === 'negative' ? -0.7 : 0),
    insights: Array.isArray(raw.insights) ? raw.insights : ['Article processed through local analysis'],
    keywords: Array.isArray(raw.keywords) ? raw.keywords : extractKeywords(`${raw.title || ''} ${raw.summary || ''}`),
    aiProcessed: raw.aiProcessed ?? true,
  };
}

function extractKeywords(text: string): string[] {
  return [...new Set(text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length > 5).slice(0, 8))];
}

async function fetchArticles(filters?: Partial<NewsFilters>): Promise<Article[]> {
  const params = new URLSearchParams();
  if (filters?.search) params.set('search', filters.search);
  if (filters?.sentiment && filters.sentiment !== 'all') params.set('sentiment', filters.sentiment);
  if (filters?.source && filters.source !== 'all') params.set('source', filters.source);
  if (filters?.category && filters.category !== 'all') params.set('category', filters.category);
  if (filters?.region && filters.region !== 'all') params.set('region', filters.region);
  if (filters?.sortBy) params.set('sortBy', filters.sortBy);
  const res = await fetch(`${API}/articles?${params.toString()}`);
  const data = await res.json();
  const list = Array.isArray(data) ? data : data.articles || [];
  return list.map(toArticle);
}

function countBy<T extends string>(items: T[]): { name: string; count: number }[] {
  const map = new Map<string, number>();
  items.forEach((x) => map.set(x, (map.get(x) || 0) + 1));
  return [...map.entries()].map(([name, count]) => ({ name, count })).sort((a,b)=>b.count-a.count);
}

function buildStats(articles: Article[]): DashboardStats {
  const now = new Date();
  const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 7);
  const today = now.toISOString().slice(0,10);
  const byDate = new Map<string, number>();
  for (let i=13; i>=0; i--) { const d = new Date(now); d.setDate(now.getDate()-i); byDate.set(d.toISOString().slice(0,10), 0); }
  articles.forEach(a => { const d = (a.publishedAt || '').slice(0,10); if (byDate.has(d)) byDate.set(d, (byDate.get(d)||0)+1); });
  return {
    totalArticles: articles.length,
    todayArticles: articles.filter(a => (a.publishedAt || '').startsWith(today)).length,
    thisWeekArticles: articles.filter(a => new Date(a.publishedAt) >= weekAgo).length,
    aiProcessed: articles.filter(a => a.aiProcessed).length,
    categories: countBy(articles.flatMap(a => a.category || ['technology'])),
    sources: countBy(articles.map(a => a.source || 'Unknown')),
    sentimentDistribution: {
      positive: articles.filter(a => a.sentiment === 'positive').length,
      negative: articles.filter(a => a.sentiment === 'negative').length,
      neutral: articles.filter(a => a.sentiment === 'neutral').length,
    },
    recentArticles: articles.slice(0, 6),
    trendingKeywords: countBy(articles.flatMap(a => a.keywords || [])).map(({name,count})=>({keyword:name,count})).slice(0,20),
    articlesByDate: [...byDate.entries()].map(([date,count])=>({date,count})),
  };
}

export const db = {
  async getDashboardStats() { return buildStats(await fetchArticles({ sortBy: 'newest' })); },
  async getArticles(filters: NewsFilters): Promise<PaginationResult<Article>> {
    let data = await fetchArticles(filters);
    if (filters.dateFrom) data = data.filter(a => a.publishedAt.slice(0,10) >= filters.dateFrom);
    if (filters.dateTo) data = data.filter(a => a.publishedAt.slice(0,10) <= filters.dateTo);
    const total = data.length;
    const pageSize = filters.pageSize || 12;
    const page = filters.page || 1;
    data = data.slice((page-1)*pageSize, page*pageSize);
    return { data, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total/pageSize)) };
  },
  async getUniqueSources() { return [...new Set((await fetchArticles()).map(a => a.source))].sort(); },
  async getUniqueCategories() { return [...new Set((await fetchArticles()).flatMap(a => a.category))].sort(); },
  async getUniqueRegions() { return [...new Set((await fetchArticles()).flatMap(a => a.country))].sort(); },
  async clearAll() { await fetch(`${API}/articles`, { method: 'DELETE' }); },
  async getCount() { return (await fetchArticles()).length; },
};
