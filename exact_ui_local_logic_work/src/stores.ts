// ============================================================
// PulseWire — Zustand State Management
// Works standalone with IndexedDB (no backend required)
// ============================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { NewsFilters, DashboardStats, PaginationResult, PageType, FetchProgress, Article } from './types';
import { DEFAULT_FILTERS } from './types';
import { db } from './db';
import { runNewsPipeline, loadSampleData } from './services';

// ==================== Settings Store (Persisted) ====================
interface SettingsState {
  darkMode: boolean;
  autoFetchEnabled: boolean;
  autoFetchInterval: number;
  sidebarOpen: boolean;
  toggleDarkMode: () => void;
  setAutoFetchEnabled: (v: boolean) => void;
  setAutoFetchInterval: (min: number) => void;
  setSidebarOpen: (v: boolean) => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      darkMode: true,
      autoFetchEnabled: false,
      autoFetchInterval: 30,
      sidebarOpen: false,
      toggleDarkMode: () =>
        set((s) => {
          const next = !s.darkMode;
          document.documentElement.classList.toggle('dark', next);
          return { darkMode: next };
        }),
      setAutoFetchEnabled: (autoFetchEnabled) => set({ autoFetchEnabled }),
      setAutoFetchInterval: (autoFetchInterval) => set({ autoFetchInterval }),
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
    }),
    { name: 'pulsewire-settings' }
  )
);

// ==================== News Store ====================
interface NewsState {
  currentPage: PageType;
  setCurrentPage: (p: PageType) => void;

  stats: DashboardStats | null;
  loadStats: () => Promise<void>;

  articles: PaginationResult<Article> | null;
  filters: NewsFilters;
  setFilters: (f: Partial<NewsFilters>) => void;
  resetFilters: () => void;
  loadArticles: () => Promise<void>;

  selectedArticle: Article | null;
  setSelectedArticle: (a: Article | null) => void;

  fetchProgress: FetchProgress;
  fetchNews: () => Promise<void>;

  availableSources: string[];
  availableCategories: string[];
  availableRegions: string[];
  loadMeta: () => Promise<void>;

  clearAllData: () => Promise<void>;
  loadDemoData: () => Promise<void>;
  articleCount: number;
  refreshCount: () => Promise<number>;
}

export const useNews = create<NewsState>()((set, get) => ({
  currentPage: 'dashboard',
  setCurrentPage: (currentPage) => set({ currentPage }),

  stats: null,
  loadStats: async () => {
    const stats = await db.getDashboardStats();
    set({ stats });
  },

  articles: null,
  filters: { ...DEFAULT_FILTERS },
  setFilters: (f) => {
    set((s) => ({ filters: { ...s.filters, ...f } }));
    setTimeout(() => get().loadArticles(), 0);
  },
  resetFilters: () => {
    set({ filters: { ...DEFAULT_FILTERS } });
    setTimeout(() => get().loadArticles(), 0);
  },
  loadArticles: async () => {
    const result = await db.getArticles(get().filters);
    set({ articles: result });
  },

  selectedArticle: null,
  setSelectedArticle: (selectedArticle) => set({ selectedArticle }),

  fetchProgress: { isLoading: false, stage: '', current: 0, total: 0, error: null, lastFetched: null },
  fetchNews: async () => {
    set({ fetchProgress: { isLoading: true, stage: 'Starting news pipeline...', current: 0, total: 0, error: null, lastFetched: null } });

    try {
      const result = await runNewsPipeline(null, (stage: string, current: number, total: number) => {
        set({ fetchProgress: { isLoading: true, stage, current, total, error: null, lastFetched: null } });
      });

      set({
        fetchProgress: {
          isLoading: false,
          stage: `Done! ${result.fetched} fetched, ${result.stored} new, ${result.processed} analyzed.`,
          current: 0,
          total: 0,
          error: result.errors.length > 0 ? result.errors.slice(0, 2).join('; ') : null,
          lastFetched: new Date().toISOString(),
        },
      });

      await get().loadStats();
      await get().loadArticles();
      await get().loadMeta();
      await get().refreshCount();
    } catch (e) {
      const count = await get().refreshCount();
      if (count === 0) {
        await loadSampleData();
        await get().loadStats();
        await get().loadArticles();
        await get().loadMeta();
        await get().refreshCount();
      }
      set({
        fetchProgress: {
          isLoading: false,
          stage: count === 0 ? 'Loaded sample data (live feeds unavailable).' : '',
          current: 0,
          total: 0,
          error: (e as Error).message,
          lastFetched: new Date().toISOString(),
        },
      });
    }
  },

  availableSources: [],
  availableCategories: [],
  availableRegions: [],
  loadMeta: async () => {
    const [sources, categories, regions] = await Promise.all([
      db.getUniqueSources(),
      db.getUniqueCategories(),
      db.getUniqueRegions()
    ]);
    set({ availableSources: sources, availableCategories: categories, availableRegions: regions });
  },

  clearAllData: async () => {
    await db.clearAll();
    set({ stats: null, articles: null, articleCount: 0, availableSources: [], availableCategories: [], availableRegions: [] });
  },

  loadDemoData: async () => {
    set({ fetchProgress: { isLoading: true, stage: 'Loading demo data...', current: 0, total: 0, error: null, lastFetched: null } });
    const count = await loadSampleData();
    set({
      fetchProgress: {
        isLoading: false,
        stage: `Loaded ${count} demo articles.`,
        current: 0,
        total: 0,
        error: null,
        lastFetched: new Date().toISOString(),
      },
    });
    await get().loadStats();
    await get().loadArticles();
    await get().loadMeta();
    await get().refreshCount();
  },

  articleCount: 0,
  refreshCount: async () => {
    const articleCount = await db.getCount();
    set({ articleCount });
    return articleCount;
  },
}));
