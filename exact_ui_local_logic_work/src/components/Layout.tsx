// ============================================================
// NewsAI Platform — Layout (Sidebar + Header)
// Supports full light/dark theme switching
// ============================================================

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Newspaper, BarChart3, Settings, Menu, X,
  RefreshCw, Sun, Moon, Brain, Loader2, AlertCircle, CheckCircle
} from 'lucide-react';
import { useNews, useSettings } from '../stores';
import type { PageType } from '../types';

const NAV_ITEMS: { id: PageType; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { id: 'explorer', label: 'News Explorer', icon: <Newspaper size={20} /> },
  { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={20} /> },
  { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { currentPage, setCurrentPage, fetchProgress, fetchNews, articleCount } = useNews();
  const { darkMode, toggleDarkMode, sidebarOpen, setSidebarOpen } = useSettings();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  return (
    <div className={`flex h-screen overflow-hidden transition-colors duration-300 ${darkMode ? 'bg-slate-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Desktop Sidebar */}
      <aside className={`hidden lg:flex flex-col w-64 flex-shrink-0 border-r transition-colors duration-300 ${darkMode ? 'bg-slate-900/50 border-white/5' : 'bg-white border-gray-200'}`}>
        <SidebarContent currentPage={currentPage} setCurrentPage={setCurrentPage} articleCount={articleCount} darkMode={darkMode} />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25 }}
              className={`fixed left-0 top-0 bottom-0 w-72 z-50 lg:hidden flex flex-col border-r transition-colors duration-300 ${darkMode ? 'bg-slate-900 border-white/10' : 'bg-white border-gray-200'}`}
            >
              <div className="flex justify-end p-4">
                <button onClick={() => setSidebarOpen(false)} className={darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}>
                  <X size={24} />
                </button>
              </div>
              <SidebarContent currentPage={currentPage} setCurrentPage={(p) => { setCurrentPage(p); setSidebarOpen(false); }} articleCount={articleCount} darkMode={darkMode} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className={`flex items-center justify-between px-4 md:px-6 py-3 border-b flex-shrink-0 transition-colors duration-300 ${darkMode ? 'bg-slate-900/30 border-white/5' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className={`lg:hidden p-2 rounded-lg ${darkMode ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}>
              <Menu size={22} />
            </button>
            <div>
              <h1 className={`text-lg font-bold capitalize ${darkMode ? 'text-white' : 'text-gray-900'}`}>{currentPage === 'explorer' ? 'News Explorer' : currentPage}</h1>
              {fetchProgress.lastFetched && (
                <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Last updated: {new Date(fetchProgress.lastFetched).toLocaleString()}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {fetchProgress.isLoading && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-xs text-indigo-400">
                <Loader2 size={14} className="animate-spin" />
                <span className="max-w-48 truncate">{fetchProgress.stage}</span>
              </div>
            )}

            {!fetchProgress.isLoading && fetchProgress.stage && !fetchProgress.error && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-xs text-emerald-400">
                <CheckCircle size={14} />
                <span className="max-w-48 truncate">{fetchProgress.stage}</span>
              </div>
            )}

            {fetchProgress.error && !fetchProgress.isLoading && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs text-amber-400">
                <AlertCircle size={14} />
                <span className="max-w-48 truncate">{fetchProgress.error}</span>
              </div>
            )}

            <button onClick={fetchNews} disabled={fetchProgress.isLoading} className="flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors">
              <RefreshCw size={16} className={fetchProgress.isLoading ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">{fetchProgress.isLoading ? 'Fetching...' : 'Refresh News'}</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg transition-colors ${darkMode ? 'text-amber-400 hover:text-amber-300 hover:bg-white/5' : 'text-indigo-600 hover:text-indigo-700 hover:bg-gray-100'}`}
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}

// ==================== Sidebar Content ====================
function SidebarContent({ currentPage, setCurrentPage, articleCount, darkMode }: { currentPage: PageType; setCurrentPage: (p: PageType) => void; articleCount: number; darkMode: boolean }) {
  return (
    <>
      <div className={`px-6 py-5 border-b transition-colors duration-300 ${darkMode ? 'border-white/5' : 'border-gray-200'}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
            <Brain size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold gradient-text">NewsAI</h1>
            <p className={`text-[10px] uppercase tracking-widest ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Intelligence Platform</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentPage(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all border ${
              currentPage === item.id
                ? 'bg-indigo-600/20 text-indigo-400 border-indigo-500/20'
                : darkMode
                  ? 'text-gray-400 hover:text-white hover:bg-white/5 border-transparent'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100 border-transparent'
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      <div className={`px-4 py-4 border-t transition-colors duration-300 ${darkMode ? 'border-white/5' : 'border-gray-200'}`}>
        <div className={`rounded-xl p-4 ${darkMode ? 'bg-white/5' : 'bg-gray-100'}`}>
          <div className={`flex items-center gap-2 text-xs mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <Newspaper size={14} />
            Articles in Database
          </div>
          <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{articleCount}</p>
          <p className={`text-[10px] mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Persistent local storage</p>
        </div>
      </div>
    </>
  );
}
