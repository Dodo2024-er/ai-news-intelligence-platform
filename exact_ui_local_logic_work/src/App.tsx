// ============================================================
// NewsAI — AI-Powered News Intelligence Platform
// Main Application Entry Point
// Auto-fetches real-time news on load — no API key required
// ============================================================

import { useEffect, useRef } from 'react';
import { useNews, useSettings } from './stores';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import NewsExplorer from './components/NewsExplorer';
import Analytics from './components/Analytics';
import SettingsPage from './components/Settings';

export default function App() {
  const { currentPage, loadStats, loadArticles, loadMeta, refreshCount, fetchNews, fetchProgress } = useNews();
  const { darkMode, autoFetchEnabled, autoFetchInterval } = useSettings();
  const autoFetchTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasInitialized = useRef(false);

  // Initialize dark mode
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  // On mount: load existing data, then auto-fetch real news
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const init = async () => {
      // 1) Load whatever's already in IndexedDB
      await refreshCount();
      await loadStats();
      await loadArticles();
      await loadMeta();

      // Auto-fetch once only when local storage is empty
      const count = await refreshCount();
      if (count === 0) {
        fetchNews();
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Periodic auto-fetch (re-fetches every N minutes)
  useEffect(() => {
    if (autoFetchTimer.current) {
      clearInterval(autoFetchTimer.current);
      autoFetchTimer.current = null;
    }

    if (autoFetchEnabled && !fetchProgress.isLoading) {
      autoFetchTimer.current = setInterval(() => {
        if (!document.hidden) {
          fetchNews();
        }
      }, autoFetchInterval * 60 * 1000);
    }

    return () => {
      if (autoFetchTimer.current) clearInterval(autoFetchTimer.current);
    };
  }, [autoFetchEnabled, autoFetchInterval, fetchProgress.isLoading, fetchNews]);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'explorer':
        return <NewsExplorer />;
      case 'analytics':
        return <Analytics />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <Dashboard />;
    }
  };

  return <Layout>{renderPage()}</Layout>;
}
