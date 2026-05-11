// ============================================================
// NewsAI Platform — Analytics Page (Theme-aware)
// ============================================================

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, PieChart as PieIcon, TrendingUp, Layers } from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  Tooltip, CartesianGrid, AreaChart, Area, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';
import { useNews, useSettings } from '../stores';
import { EmptyState } from './Common';
import { capitalize, formatChartDate } from '../utils';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#06b6d4', '#ec4899', '#14b8a6'];
const SENTIMENT_COLORS = { positive: '#10b981', negative: '#f43f5e', neutral: '#f59e0b' };

export default function Analytics() {
  const { stats, loadStats } = useNews();
  const { darkMode } = useSettings();

  useEffect(() => { loadStats(); }, [loadStats]);

  if (!stats || stats.totalArticles === 0) {
    return <EmptyState icon={<BarChart3 size={48} className="text-gray-400" />} title="No Analytics Data" description="Fetch some news articles first to see analytics and insights." />;
  }

  const sentimentData = [
    { name: 'Positive', value: stats.sentimentDistribution.positive, color: SENTIMENT_COLORS.positive },
    { name: 'Negative', value: stats.sentimentDistribution.negative, color: SENTIMENT_COLORS.negative },
    { name: 'Neutral', value: stats.sentimentDistribution.neutral, color: SENTIMENT_COLORS.neutral },
  ].filter((d) => d.value > 0);

  const categoryData = stats.categories.slice(0, 8).map((c, i) => ({ name: capitalize(c.name), count: c.count, fill: COLORS[i % COLORS.length] }));
  const sourceData = stats.sources.slice(0, 8).map((s, i) => ({ name: s.name, count: s.count, fill: COLORS[i % COLORS.length] }));
  const radarData = stats.categories.slice(0, 6).map((c) => ({ subject: capitalize(c.name), count: c.count, fullMark: stats.categories[0]?.count || 1 }));

  const surface = darkMode ? 'bg-slate-900/60 border-white/5' : 'bg-white border-gray-200 shadow-sm';
  const textPrimary = darkMode ? 'text-white' : 'text-gray-900';
  const textMuted = darkMode ? 'text-gray-400' : 'text-gray-500';
  const gridStroke = darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)';
  const tooltipStyle = { backgroundColor: darkMode ? '#1e293b' : '#fff', border: darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px', color: darkMode ? '#fff' : '#1e293b' };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Articles', value: stats.totalArticles, color: 'text-indigo-400' },
          { label: 'This Week', value: stats.thisWeekArticles, color: 'text-emerald-400' },
          { label: 'AI Analyzed', value: stats.aiProcessed, color: 'text-purple-400' },
          { label: 'Unique Sources', value: stats.sources.length, color: 'text-amber-400' },
        ].map((item) => (
          <motion.div key={item.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`border rounded-xl p-4 text-center ${surface}`}>
            <p className={`text-xs mb-1 ${textMuted}`}>{item.label}</p>
            <p className={`text-3xl font-bold ${item.color}`}>{item.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`border rounded-xl p-5 ${surface}`}>
          <h3 className={`text-sm font-semibold mb-4 flex items-center gap-2 ${textPrimary}`}><PieIcon size={16} className="text-indigo-400" />Sentiment Distribution</h3>
          <div className="h-64 flex items-center justify-center">
            {sentimentData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={sentimentData} dataKey="value" cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} stroke="none" label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                    {sentimentData.map((entry, i) => (<Cell key={i} fill={entry.color} />))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className={`text-sm ${textMuted}`}>No sentiment data</p>}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={`border rounded-xl p-5 ${surface}`}>
          <h3 className={`text-sm font-semibold mb-4 flex items-center gap-2 ${textPrimary}`}><TrendingUp size={16} className="text-indigo-400" />Articles Over Time (14 Days)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.articlesByDate}>
                <defs><linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} /><stop offset="95%" stopColor="#6366f1" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="date" tickFormatter={formatChartDate} tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} labelFormatter={(v) => formatChartDate(String(v))} />
                <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className={`border rounded-xl p-5 ${surface}`}>
          <h3 className={`text-sm font-semibold mb-4 flex items-center gap-2 ${textPrimary}`}><Layers size={16} className="text-emerald-400" />Articles by Category</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={90} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>{categoryData.map((entry, i) => (<Cell key={i} fill={entry.fill} />))}</Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className={`border rounded-xl p-5 ${surface}`}>
          <h3 className={`text-sm font-semibold mb-4 flex items-center gap-2 ${textPrimary}`}><BarChart3 size={16} className="text-amber-400" />Top News Sources</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sourceData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={120} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>{sourceData.map((entry, i) => (<Cell key={i} fill={entry.fill} />))}</Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {radarData.length >= 3 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className={`border rounded-xl p-5 ${surface}`}>
            <h3 className={`text-sm font-semibold mb-4 flex items-center gap-2 ${textPrimary}`}><Layers size={16} className="text-purple-400" />Category Coverage</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                  <PolarGrid stroke={darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                  <PolarRadiusAxis tick={false} axisLine={false} />
                  <Radar name="Articles" dataKey="count" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className={`border rounded-xl p-5 ${surface}`}>
          <h3 className={`text-sm font-semibold mb-4 ${textPrimary}`}>🔥 Top Keywords</h3>
          <div className="space-y-2.5 max-h-64 overflow-y-auto pr-2">
            {stats.trendingKeywords.slice(0, 15).map((kw, i) => {
              const maxCount = stats.trendingKeywords[0]?.count || 1;
              const pct = (kw.count / maxCount) * 100;
              return (
                <div key={kw.keyword} className="flex items-center gap-3">
                  <span className={`text-xs w-5 text-right ${textMuted}`}>{i + 1}</span>
                  <span className={`text-sm w-28 truncate ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{kw.keyword}</span>
                  <div className={`flex-1 rounded-full h-2 ${darkMode ? 'bg-white/5' : 'bg-gray-200'}`}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ delay: 0.1 * i, duration: 0.5 }} className="bg-indigo-500 rounded-full h-2" />
                  </div>
                  <span className={`text-xs w-6 text-right ${textMuted}`}>{kw.count}</span>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
