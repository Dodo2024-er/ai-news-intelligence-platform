// ============================================================
// NewsAI Platform — News Explorer Page
// Theme-aware, search pre-filled from keyword clicks
// ============================================================

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, X, SlidersHorizontal, ArrowUpDown, RotateCcw } from 'lucide-react';
import { useNews, useSettings } from '../stores';
import { ArticleCard, Pagination, CardSkeleton, EmptyState, ArticleDetailModal } from './Common';
import { capitalize } from '../utils';

export default function NewsExplorer() {
  const {
    articles, filters, setFilters, resetFilters, loadArticles,
    availableSources, availableCategories, loadMeta,
    selectedArticle, setSelectedArticle,
  } = useNews();
  const { darkMode } = useSettings();

  const [showFilters, setShowFilters] = useState(false);
  const [searchInput, setSearchInput] = useState(filters.search);

  // Sync search input when filters.search changes externally (e.g. keyword click)
  useEffect(() => {
    setSearchInput(filters.search);
  }, [filters.search]);

  useEffect(() => {
    loadArticles();
    loadMeta();
  }, [loadArticles, loadMeta]);

  const debouncedSearch = useCallback(
    (() => {
      let timer: ReturnType<typeof setTimeout>;
      return (val: string) => {
        clearTimeout(timer);
        timer = setTimeout(() => setFilters({ search: val, page: 1 }), 300);
      };
    })(),
    [setFilters]
  );

  const handleSearchChange = (val: string) => {
    setSearchInput(val);
    debouncedSearch(val);
  };

  const activeFilterCount = [
    filters.category !== 'all',
    filters.source !== 'all',
    filters.sentiment !== 'all',
    filters.dateFrom !== '',
    filters.dateTo !== '',
  ].filter(Boolean).length;

  const surface = darkMode ? 'bg-slate-900/60 border-white/10' : 'bg-white border-gray-200 shadow-sm';
  const inputBg = darkMode ? 'bg-slate-900/60 border-white/10 text-white placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400';
  const selectBg = darkMode ? 'bg-slate-800 border-white/10 text-white' : 'bg-white border-gray-300 text-gray-900';
  const textPrimary = darkMode ? 'text-white' : 'text-gray-900';
  const textMuted = darkMode ? 'text-gray-400' : 'text-gray-500';

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
          <input
            type="text"
            placeholder="Search articles by title, keywords, source..."
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all ${inputBg}`}
          />
          {searchInput && (
            <button onClick={() => handleSearchChange('')} className={`absolute right-3 top-1/2 -translate-y-1/2 ${darkMode ? 'text-gray-500 hover:text-white' : 'text-gray-400 hover:text-gray-700'}`}>
              <X size={16} />
            </button>
          )}
        </div>

        <button
          onClick={() => setFilters({ sortBy: filters.sortBy === 'newest' ? 'oldest' : 'newest', page: 1 })}
          className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl text-sm transition-colors ${darkMode ? 'bg-slate-900/60 border-white/10 text-gray-300 hover:border-indigo-500/30' : 'bg-white border-gray-300 text-gray-700 hover:border-indigo-400'}`}
        >
          <ArrowUpDown size={16} />
          {filters.sortBy === 'newest' ? 'Newest First' : 'Oldest First'}
        </button>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors border ${
            showFilters || activeFilterCount > 0
              ? 'bg-indigo-600/20 border-indigo-500/30 text-indigo-400'
              : darkMode ? 'bg-slate-900/60 border-white/10 text-gray-300 hover:border-indigo-500/30' : 'bg-white border-gray-300 text-gray-700 hover:border-indigo-400'
          }`}
        >
          <SlidersHorizontal size={16} />
          Filters
          {activeFilterCount > 0 && (
            <span className="w-5 h-5 bg-indigo-600 rounded-full text-[10px] flex items-center justify-center text-white">{activeFilterCount}</span>
          )}
        </button>
      </div>

      {/* Filter Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
            <div className={`border rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 ${surface}`}>
              <div>
                <label className={`block text-xs mb-1 font-medium ${textMuted}`}>Region</label>
                <select value={filters.region} onChange={(e) => setFilters({ region: e.target.value, page: 1 })} className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-indigo-500/50 appearance-none cursor-pointer ${selectBg}`}>
                  <option value="all">🌍 All Regions</option>
                  <option value="india">🇮🇳 India</option>
                  <option value="asia">🌏 Asia</option>
                  <option value="europe">🇪 Europe</option>
                  <option value="us">🇺🇸 USA</option>
                  <option value="uk">🇬 UK</option>
                  <option value="middle_east">🕌 Middle East</option>
                  <option value="africa">🌍 Africa</option>
                  <option value="latin_america">🌎 Latin America</option>
                  <option value="oceania">🏝️ Oceania</option>
                  <option value="global"> Global Wire</option>
                </select>
              </div>
              <div>
                <label className={`block text-xs mb-1 font-medium ${textMuted}`}>Category</label>
                <select value={filters.category} onChange={(e) => setFilters({ category: e.target.value, page: 1 })} className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-indigo-500/50 appearance-none cursor-pointer ${selectBg}`}>
                  <option value="all">All Categories</option>
                  {availableCategories.map((c) => (<option key={c} value={c}>{capitalize(c)}</option>))}
                </select>
              </div>
              <div>
                <label className={`block text-xs mb-1 font-medium ${textMuted}`}>Source</label>
                <select value={filters.source} onChange={(e) => setFilters({ source: e.target.value, page: 1 })} className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-indigo-500/50 appearance-none cursor-pointer ${selectBg}`}>
                  <option value="all">All Sources</option>
                  {availableSources.map((s) => (<option key={s} value={s}>{s}</option>))}
                </select>
              </div>
              <div>
                <label className={`block text-xs mb-1 font-medium ${textMuted}`}>Sentiment</label>
                <select value={filters.sentiment} onChange={(e) => setFilters({ sentiment: e.target.value, page: 1 })} className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-indigo-500/50 appearance-none cursor-pointer ${selectBg}`}>
                  <option value="all">All Sentiments</option>
                  <option value="positive">😊 Positive</option>
                  <option value="negative">😟 Negative</option>
                  <option value="neutral">😐 Neutral</option>
                </select>
              </div>
              <div>
                <label className={`block text-xs mb-1 font-medium ${textMuted}`}>From Date</label>
                <input type="date" value={filters.dateFrom} onChange={(e) => setFilters({ dateFrom: e.target.value, page: 1 })} className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-indigo-500/50 ${selectBg}`} />
              </div>
              <div>
                <label className={`block text-xs mb-1 font-medium ${textMuted}`}>To Date</label>
                <input type="date" value={filters.dateTo} onChange={(e) => setFilters({ dateTo: e.target.value, page: 1 })} className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-indigo-500/50 ${selectBg}`} />
              </div>
              <div className="sm:col-span-2 lg:col-span-5 flex justify-end">
                <button onClick={() => { resetFilters(); setSearchInput(''); }} className={`flex items-center gap-2 px-3 py-1.5 text-xs transition-colors ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}>
                  <RotateCcw size={14} />Reset All Filters
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Info */}
      {articles && (
        <div className="flex items-center justify-between">
          <p className={`text-sm ${textMuted}`}>
            Showing <span className={`font-medium ${textPrimary}`}>{Math.min((filters.page - 1) * filters.pageSize + 1, articles.total)}–{Math.min(filters.page * filters.pageSize, articles.total)}</span> of <span className={`font-medium ${textPrimary}`}>{articles.total}</span> articles
          </p>
          <div className="flex items-center gap-2">
            <span className={`text-xs ${textMuted}`}>Per page:</span>
            {[12, 24, 48].map((size) => (
              <button key={size} onClick={() => setFilters({ pageSize: size, page: 1 })} className={`px-2 py-1 rounded text-xs transition-colors ${filters.pageSize === size ? 'bg-indigo-600 text-white' : darkMode ? 'bg-white/5 text-gray-400 hover:text-white' : 'bg-gray-100 text-gray-500 hover:text-gray-900'}`}>{size}</button>
            ))}
          </div>
        </div>
      )}

      {/* Articles Grid */}
      {!articles ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : articles.total === 0 ? (
        <EmptyState
          icon={<Filter size={48} className="text-gray-400" />}
          title="No Articles Found"
          description={searchInput ? `No results for "${searchInput}". Try different keywords or adjust your filters.` : 'No articles match your current filters. Try adjusting or resetting them.'}
          action={<button onClick={() => { resetFilters(); setSearchInput(''); }} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors">Reset Filters</button>}
        />
      ) : (
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence mode="popLayout">
            {articles.data.map((article) => (
              <ArticleCard key={article.id || article.articleId} article={article} onClick={() => setSelectedArticle(article)} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {articles && articles.totalPages > 1 && (
        <Pagination page={articles.page} totalPages={articles.totalPages} onPageChange={(p) => setFilters({ page: p })} />
      )}

      {selectedArticle && <ArticleDetailModal article={selectedArticle} onClose={() => setSelectedArticle(null)} />}
    </div>
  );
}
