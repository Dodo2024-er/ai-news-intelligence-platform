// ============================================================
// NewsAI Platform — Dashboard Page
// Auto-loads real news — no user action needed
// ============================================================

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Newspaper, TrendingUp, Brain, Zap, BarChart3,
  Sparkles, ArrowRight, Loader2
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useNews, useSettings } from '../stores';
import { ArticleCard, StatCard, CardSkeleton, ArticleDetailModal } from './Common';
import { formatChartDate } from '../utils';

const SENTIMENT_COLORS = { positive: '#10b981', negative: '#f43f5e', neutral: '#f59e0b' };

export default function Dashboard() {
  const { stats, loadStats, selectedArticle, setSelectedArticle, setCurrentPage, setFilters, articleCount, fetchProgress } = useNews();
  const { darkMode } = useSettings();

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  /** Navigate to explorer with keyword search */
  const handleKeywordClick = (keyword: string) => {
    setFilters({ search: keyword, page: 1 });
    setCurrentPage('explorer');
  };

  // Loading state — news is being fetched automatically
  if (!stats || stats.totalArticles === 0) {
    return (
      <div>
        <LoadingHero isLoading={fetchProgress.isLoading} stage={fetchProgress.stage} current={fetchProgress.current} total={fetchProgress.total} darkMode={darkMode} />
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <CardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  const sentimentData = [
    { name: 'Positive', value: stats.sentimentDistribution.positive, color: SENTIMENT_COLORS.positive },
    { name: 'Negative', value: stats.sentimentDistribution.negative, color: SENTIMENT_COLORS.negative },
    { name: 'Neutral', value: stats.sentimentDistribution.neutral, color: SENTIMENT_COLORS.neutral },
  ].filter((d) => d.value > 0);

  const totalSentiment = sentimentData.reduce((s, d) => s + d.value, 0);

  const surface = darkMode ? 'bg-slate-900/60 border-white/5' : 'bg-white border-gray-200 shadow-sm';
  const textPrimary = darkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  const textMuted = darkMode ? 'text-gray-500' : 'text-gray-400';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Articles" value={articleCount} icon={<Newspaper size={20} className="text-indigo-400" />} trend={`${stats.thisWeekArticles} this week`} color="indigo" />
        <StatCard label="AI Analyzed" value={stats.aiProcessed} icon={<Brain size={20} className="text-purple-400" />} trend={`${((stats.aiProcessed / Math.max(1, stats.totalArticles)) * 100).toFixed(0)}% coverage`} color="purple" />
        <StatCard label="Positive" value={stats.sentimentDistribution.positive} icon={<TrendingUp size={20} className="text-emerald-400" />} trend={totalSentiment > 0 ? `${((stats.sentimentDistribution.positive / totalSentiment) * 100).toFixed(0)}% of total` : ''} color="emerald" />
        <StatCard label="Categories" value={stats.categories.length} icon={<Zap size={20} className="text-amber-400" />} trend={`${stats.sources.length} sources`} color="amber" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Sentiment Distribution */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={`border rounded-xl p-5 ${surface}`}>
          <h3 className={`text-sm font-semibold mb-4 flex items-center gap-2 ${textPrimary}`}>
            <BarChart3 size={16} className="text-indigo-400" />
            Sentiment Distribution
          </h3>
          {sentimentData.length > 0 ? (
            <div className="flex items-center gap-6">
              <div className="w-32 h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={sentimentData} dataKey="value" cx="50%" cy="50%" innerRadius={30} outerRadius={55} paddingAngle={3} stroke="none">
                      {sentimentData.map((entry, i) => (<Cell key={i} fill={entry.color} />))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3">
                {sentimentData.map((d) => (
                  <div key={d.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className={`text-xs ${textSecondary}`}>{d.name}</span>
                    <span className={`text-xs font-bold ml-auto ${textPrimary}`}>{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className={`text-sm ${textMuted}`}>No sentiment data yet</p>
          )}
        </motion.div>

        {/* Articles Over Time */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className={`border rounded-xl p-5 lg:col-span-2 ${surface}`}>
          <h3 className={`text-sm font-semibold mb-4 flex items-center gap-2 ${textPrimary}`}>
            <TrendingUp size={16} className="text-indigo-400" />
            Articles Over Time
          </h3>
          {stats.articlesByDate.length > 0 ? (
            <div className="h-36">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.articlesByDate}>
                  <defs>
                    <linearGradient id="colorArticles" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)'} />
                  <XAxis dataKey="date" tickFormatter={formatChartDate} tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ backgroundColor: darkMode ? '#1e293b' : '#fff', border: darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px', color: darkMode ? '#fff' : '#1e293b' }} labelFormatter={(v) => formatChartDate(String(v))} />
                  <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} fill="url(#colorArticles)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className={`text-sm ${textMuted}`}>No timeline data yet</p>
          )}
        </motion.div>
      </div>

      {/* Trending Keywords — CLICKABLE → filters explorer */}
      {stats.trendingKeywords.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className={`border rounded-xl p-5 ${surface}`}>
          <h3 className={`text-sm font-semibold mb-4 flex items-center gap-2 ${textPrimary}`}>
            <Sparkles size={16} className="text-amber-400" />
            Trending Keywords
            <span className={`text-xs font-normal ml-2 ${textMuted}`}>Click to search</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {stats.trendingKeywords.map((kw) => {
              const maxCount = stats.trendingKeywords[0]?.count || 1;
              const opacity = 0.4 + (kw.count / maxCount) * 0.6;
              return (
                <button
                  key={kw.keyword}
                  onClick={() => handleKeywordClick(kw.keyword)}
                  style={{ opacity }}
                  className="px-3 py-1.5 bg-indigo-500/20 border border-indigo-500/20 rounded-full text-xs text-indigo-400 font-medium hover:bg-indigo-500/40 hover:border-indigo-400/40 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  {kw.keyword}
                  <span className="ml-1.5 text-indigo-400/60">{kw.count}</span>
                </button>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Latest News */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-sm font-semibold flex items-center gap-2 ${textPrimary}`}>
            <Newspaper size={16} className="text-indigo-400" />
            Latest News
          </h3>
          <button onClick={() => setCurrentPage('explorer')} className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors">
            View All <ArrowRight size={14} />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.recentArticles.map((article) => (
            <ArticleCard key={article.id || article.articleId} article={article} onClick={() => setSelectedArticle(article)} />
          ))}
        </div>
      </div>

      {/* Top Sources & Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`border rounded-xl p-5 ${surface}`}>
          <h3 className={`text-sm font-semibold mb-4 ${textPrimary}`}>Top Sources</h3>
          <div className="space-y-3">
            {stats.sources.slice(0, 8).map((src, i) => (
              <div key={src.name} className="flex items-center gap-3">
                <span className={`text-xs w-4 ${textMuted}`}>{i + 1}</span>
                <span className={`text-sm flex-1 truncate ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{src.name}</span>
                <div className={`w-20 rounded-full h-1.5 ${darkMode ? 'bg-white/5' : 'bg-gray-200'}`}>
                  <div className="bg-indigo-500 rounded-full h-1.5 transition-all" style={{ width: `${(src.count / (stats.sources[0]?.count || 1)) * 100}%` }} />
                </div>
                <span className={`text-xs w-6 text-right ${textMuted}`}>{src.count}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`border rounded-xl p-5 ${surface}`}>
          <h3 className={`text-sm font-semibold mb-4 ${textPrimary}`}>Top Categories</h3>
          <div className="space-y-3">
            {stats.categories.slice(0, 8).map((cat, i) => (
              <div key={cat.name} className="flex items-center gap-3">
                <span className={`text-xs w-4 ${textMuted}`}>{i + 1}</span>
                <span className={`text-sm flex-1 capitalize truncate ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{cat.name}</span>
                <div className={`w-20 rounded-full h-1.5 ${darkMode ? 'bg-white/5' : 'bg-gray-200'}`}>
                  <div className="bg-emerald-500 rounded-full h-1.5 transition-all" style={{ width: `${(cat.count / (stats.categories[0]?.count || 1)) * 100}%` }} />
                </div>
                <span className={`text-xs w-6 text-right ${textMuted}`}>{cat.count}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {selectedArticle && <ArticleDetailModal article={selectedArticle} onClose={() => setSelectedArticle(null)} />}
    </div>
  );
}

// ==================== Loading Hero ====================
function LoadingHero({ isLoading, stage, current, total, darkMode }: { isLoading: boolean; stage: string; current: number; total: number; darkMode: boolean }) {
  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center py-12">
      <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-600/20 rounded-2xl mb-6">
        {isLoading ? <Loader2 size={40} className="text-indigo-400 animate-spin" /> : <Brain size={40} className="text-indigo-400 animate-float" />}
      </div>
      <h2 className={`text-3xl md:text-4xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        <span className="gradient-text">NewsAI</span> Intelligence Platform
      </h2>
      {isLoading ? (
        <div className="max-w-md mx-auto">
          <p className={`mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Fetching real-time news and running AI analysis...</p>
          <div className={`rounded-full h-2 mb-3 overflow-hidden ${darkMode ? 'bg-white/5' : 'bg-gray-200'}`}>
            <motion.div className="bg-indigo-500 h-2 rounded-full" initial={{ width: '5%' }} animate={{ width: total > 0 ? `${(current / total) * 100}%` : '60%' }} transition={{ duration: 0.5 }} />
          </div>
          <p className="text-sm text-indigo-400 flex items-center justify-center gap-2">
            <Loader2 size={14} className="animate-spin" />
            {stage || 'Initializing...'}
          </p>
        </div>
      ) : (
        <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Preparing your personalized news dashboard...</p>
      )}
    </motion.div>
  );
}
