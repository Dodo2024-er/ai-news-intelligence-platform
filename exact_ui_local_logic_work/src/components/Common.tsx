// ============================================================
// NewsAI Platform — Shared UI Components
// All components are theme-aware (light/dark)
// ============================================================

import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Brain, TrendingUp, Tag, Calendar, User, Lightbulb } from 'lucide-react';
import type { Article } from '../types';
import { useSettings } from '../stores';
import { timeAgo, formatDate, truncate, getSentimentInfo, getCategoryColor, getCategoryGradient, getCategoryEmoji } from '../utils';
import { useState } from 'react';

// ==================== Skeleton Loader ====================
export function Skeleton({ className = '' }: { className?: string }) {
  const { darkMode } = useSettings();
  return <div className={`animate-pulse rounded-lg ${darkMode ? 'bg-white/5' : 'bg-gray-200'} ${className}`} />;
}

export function CardSkeleton() {
  const { darkMode } = useSettings();
  return (
    <div className={`border rounded-xl overflow-hidden ${darkMode ? 'bg-slate-900/60 border-white/5' : 'bg-white border-gray-200 shadow-sm'}`}>
      <Skeleton className="h-44 rounded-none" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      </div>
    </div>
  );
}

// ==================== Empty State ====================
export function EmptyState({ icon, title, description, action }: { icon: React.ReactNode; title: string; description: string; action?: React.ReactNode }) {
  const { darkMode } = useSettings();
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
      <p className={`max-w-md mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{description}</p>
      {action}
    </motion.div>
  );
}

// ==================== Sentiment Badge ====================
export function SentimentBadge({ sentiment, score }: { sentiment: string | null; score?: number | null }) {
  const info = getSentimentInfo(sentiment);
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${info.bg}`}>
      <span>{info.emoji}</span>
      <span>{info.label}</span>
      {score != null && <span className="opacity-70">({(score * 100).toFixed(0)}%)</span>}
    </span>
  );
}

// ==================== Category Badge ====================
export function CategoryBadge({ category }: { category: string }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${getCategoryColor(category)}`}>
      <span>{getCategoryEmoji(category)}</span>
      <span className="capitalize">{category}</span>
    </span>
  );
}

// ==================== News Article Card ====================
export function ArticleCard({ article, onClick }: { article: Article; onClick: () => void }) {
  const [imgError, setImgError] = useState(false);
  const { darkMode } = useSettings();
  const gradient = getCategoryGradient(article.category[0] || 'general');

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      onClick={onClick}
      className={`border rounded-xl overflow-hidden cursor-pointer hover:border-indigo-500/30 transition-all duration-300 group flex flex-col ${darkMode ? 'bg-slate-900/60 border-white/5' : 'bg-white border-gray-200 shadow-sm hover:shadow-md'}`}
    >
      {/* Image */}
      <div className={`aspect-[16/9] bg-gradient-to-br ${gradient} relative overflow-hidden`}>
        {article.imageUrl && !imgError ? (
          <img src={article.imageUrl} alt={article.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={() => setImgError(true)} loading="lazy" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-5xl opacity-30">{getCategoryEmoji(article.category[0] || 'general')}</div>
        )}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {article.category.slice(0, 2).map((c) => (<CategoryBadge key={c} category={c} />))}
        </div>
        {article.sentiment && (
          <div className="absolute top-3 right-3"><SentimentBadge sentiment={article.sentiment} /></div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <div className={`flex items-center gap-2 text-xs mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          <span className="font-medium text-indigo-500">{article.source}</span>
          <span>•</span>
          <span>{timeAgo(article.publishedAt)}</span>
        </div>
        <h3 className={`text-sm font-semibold mb-2 line-clamp-2 group-hover:text-indigo-400 transition-colors ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          {article.title}
        </h3>
        <p className={`text-xs mb-3 line-clamp-2 flex-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          {article.summary || truncate(article.description, 120)}
        </p>
        {article.keywords.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-auto">
            {article.keywords.slice(0, 3).map((kw) => (
              <span key={kw} className={`px-1.5 py-0.5 rounded text-[10px] ${darkMode ? 'bg-white/5 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>{kw}</span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ==================== Article Detail Modal ====================
export function ArticleDetailModal({ article, onClose }: { article: Article; onClose: () => void }) {
  const { darkMode } = useSettings();
  const categories = Array.isArray(article.category) ? article.category : ['technology'];
  const insights = Array.isArray(article.insights) ? article.insights : [];
  const keywords = Array.isArray(article.keywords) ? article.keywords : [];
  const sentimentInfo = getSentimentInfo(article.sentiment);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border shadow-2xl ${
          darkMode ? 'bg-slate-950 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'
        }`}
      >
        <div className={`relative h-48 bg-gradient-to-br ${getCategoryGradient(categories[0] || 'technology')}`}>
          <div className="absolute inset-0 flex items-center justify-center text-7xl opacity-30">
            {getCategoryEmoji(categories[0] || 'technology')}
          </div>
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 md:p-8">
          <div className="mb-4 flex flex-wrap gap-2">
            {categories.map((c) => <CategoryBadge key={c} category={c} />)}
            <SentimentBadge sentiment={article.sentiment} score={article.sentimentScore} />
          </div>

          <h2 className="mb-3 text-2xl md:text-3xl font-bold leading-tight">{article.title}</h2>

          <div className={`mb-6 flex flex-wrap gap-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <span className="flex items-center gap-1.5"><User size={14} />{article.author || article.source || 'Unknown source'}</span>
            <span className="flex items-center gap-1.5"><Calendar size={14} />{formatDate(article.publishedAt)}</span>
          </div>

          <section className="mb-5 rounded-xl border border-indigo-500/20 bg-indigo-500/10 p-5">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-indigo-400">
              <Brain size={16} /> AI Summary
            </div>
            <p className={`text-sm leading-relaxed ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              {article.summary || article.description || 'No summary available.'}
            </p>
          </section>

          <section className={`mb-5 rounded-xl border p-5 ${sentimentInfo.bg}`}>
            <div className={`mb-2 flex items-center gap-2 text-sm font-semibold ${sentimentInfo.color}`}>
              <TrendingUp size={16} /> Sentiment Analysis
            </div>
            <p className="text-sm">{sentimentInfo.emoji} {sentimentInfo.label}</p>
          </section>

          {insights.length > 0 && (
            <section className={`mb-5 rounded-xl border p-5 ${darkMode ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50'}`}>
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-amber-400">
                <Lightbulb size={16} /> Key Insights
              </div>
              <ul className="space-y-2 text-sm">
                {insights.map((insight, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-xs font-bold text-indigo-400">{i + 1}</span>
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <p className={`mb-5 text-sm leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {article.description || article.content || ''}
          </p>

          {keywords.length > 0 && (
            <div className="mb-6 flex flex-wrap gap-2">
              {keywords.map((kw) => (
                <span key={kw} className={`rounded-full px-3 py-1 text-xs ${darkMode ? 'bg-white/5 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                  {kw}
                </span>
              ))}
            </div>
          )}

          <div className={`flex gap-3 border-t pt-4 ${darkMode ? 'border-white/10' : 'border-gray-200'}`}>
            {article.url && article.url !== '#' && (
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
              >
                <ExternalLink size={14} /> Read Original
              </a>
            )}
            <button
              onClick={onClose}
              className={`rounded-lg px-4 py-2 text-sm font-medium ${
                darkMode ? 'bg-white/10 text-gray-200 hover:bg-white/20' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== Pagination ====================
export function Pagination({ page, totalPages, onPageChange }: { page: number; totalPages: number; onPageChange: (p: number) => void }) {
  const { darkMode } = useSettings();
  if (totalPages <= 1) return null;

  const pages: (number | string)[] = [];
  const delta = 2;
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - delta && i <= page + delta)) pages.push(i);
    else if (pages[pages.length - 1] !== '...') pages.push('...');
  }

  const btnBase = darkMode ? 'bg-white/5 hover:bg-white/10 text-gray-400' : 'bg-gray-100 hover:bg-gray-200 text-gray-600';

  return (
    <div className="flex items-center justify-center gap-1.5 mt-8">
      <button onClick={() => onPageChange(page - 1)} disabled={page <= 1} className={`px-3 py-1.5 rounded-lg text-sm disabled:opacity-30 disabled:cursor-not-allowed transition-colors ${btnBase}`}>Previous</button>
      {pages.map((p, i) =>
        typeof p === 'number' ? (
          <button key={i} onClick={() => onPageChange(p)} className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${p === page ? 'bg-indigo-600 text-white' : btnBase}`}>{p}</button>
        ) : (
          <span key={i} className="text-gray-500 px-1">...</span>
        )
      )}
      <button onClick={() => onPageChange(page + 1)} disabled={page >= totalPages} className={`px-3 py-1.5 rounded-lg text-sm disabled:opacity-30 disabled:cursor-not-allowed transition-colors ${btnBase}`}>Next</button>
    </div>
  );
}

// ==================== Stats Card ====================
export function StatCard({ label, value, icon, trend, color = 'indigo' }: { label: string; value: string | number; icon: React.ReactNode; trend?: string; color?: string }) {
  const { darkMode } = useSettings();
  const colorMap: Record<string, string> = {
    indigo: 'from-indigo-500/20 to-indigo-600/5 border-indigo-500/20',
    emerald: 'from-emerald-500/20 to-emerald-600/5 border-emerald-500/20',
    rose: 'from-rose-500/20 to-rose-600/5 border-rose-500/20',
    amber: 'from-amber-500/20 to-amber-600/5 border-amber-500/20',
    cyan: 'from-cyan-500/20 to-cyan-600/5 border-cyan-500/20',
    purple: 'from-purple-500/20 to-purple-600/5 border-purple-500/20',
  };
  const c = colorMap[color] || colorMap.indigo;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`bg-gradient-to-br ${c} border rounded-xl p-5 relative overflow-hidden`}>
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-xs font-medium uppercase tracking-wider mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{label}</p>
          <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{value}</p>
          {trend && <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{trend}</p>}
        </div>
        <div className={`p-2 rounded-lg ${darkMode ? 'bg-white/5' : 'bg-white/60'}`}>{icon}</div>
      </div>
    </motion.div>
  );
}
