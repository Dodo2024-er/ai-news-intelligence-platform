// ============================================================
// PulseWire — Settings Page
// Works standalone (no backend required)
// ============================================================

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Database, Trash2, RefreshCw, CheckCircle, AlertCircle, Info, Sparkles, Clock } from 'lucide-react';
import { useSettings, useNews } from '../stores';

export default function SettingsPage() {
  const { darkMode, autoFetchEnabled, setAutoFetchEnabled, autoFetchInterval, setAutoFetchInterval } = useSettings();
  const { articleCount, clearAllData, fetchNews, fetchProgress, refreshCount } = useNews();

  const [clearConfirm, setClearConfirm] = useState(false);

  const surface = darkMode ? 'bg-slate-900/60 border-white/5' : 'bg-white border-gray-200 shadow-sm';
  const textPrimary = darkMode ? 'text-white' : 'text-gray-900';
  const textMuted = darkMode ? 'text-gray-500' : 'text-gray-400';

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className={`text-2xl font-bold mb-1 ${textPrimary}`}>Settings</h2>
        <p className={`text-sm ${textMuted}`}>Configure app preferences and data management.</p>
      </motion.div>

      {/* How It Works */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <Info size={18} className="text-indigo-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-indigo-400 mb-1">Fully Automatic — No Setup Required</p>
            <p className={`text-xs ${textMuted}`}>This platform automatically fetches real-time news from BBC, Reuters, and other sources. All data is stored locally in your browser. No API keys or backend server needed!</p>
          </div>
        </div>
      </motion.div>

      {/* Auto-Fetch */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className={`border rounded-xl p-6 ${surface}`}>
        <h3 className={`text-sm font-semibold mb-4 flex items-center gap-2 ${textPrimary}`}><Clock size={16} className="text-amber-400" />Auto-Refresh</h3>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Periodic Auto-Fetch</p>
            <p className={`text-xs ${textMuted}`}>Automatically refresh news at set intervals</p>
          </div>
          <button onClick={() => setAutoFetchEnabled(!autoFetchEnabled)} className={`w-12 h-6 rounded-full transition-colors relative ${autoFetchEnabled ? 'bg-indigo-600' : darkMode ? 'bg-white/10' : 'bg-gray-300'}`}>
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${autoFetchEnabled ? 'left-7' : 'left-1'}`} />
          </button>
        </div>
        {autoFetchEnabled && (
          <div>
            <label className={`text-sm block mb-2 ${textMuted}`}>Interval</label>
            <div className="flex items-center gap-3">
              {[15, 30, 60].map((m) => (
                <button key={m} onClick={() => setAutoFetchInterval(m)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${autoFetchInterval === m ? 'bg-indigo-600 text-white' : darkMode ? 'bg-white/5 text-gray-400 hover:text-white' : 'bg-gray-100 text-gray-600 hover:text-gray-900'}`}>{m} min</button>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Data Management */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className={`border rounded-xl p-6 ${surface}`}>
        <h3 className={`text-sm font-semibold mb-4 flex items-center gap-2 ${textPrimary}`}><Database size={16} className="text-cyan-400" />Data Management</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
          {[
            { val: String(articleCount), label: 'Articles Stored' },
            { val: 'IndexedDB', label: 'Storage Engine' },
            { val: 'Persistent', label: 'Survives Refresh' },
          ].map((item) => (
            <div key={item.label} className={`rounded-lg p-4 text-center ${darkMode ? 'bg-white/5' : 'bg-gray-100'}`}>
              <p className={`text-2xl font-bold ${textPrimary}`}>{item.val}</p>
              <p className={`text-xs ${textMuted}`}>{item.label}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => fetchNews()} disabled={fetchProgress.isLoading} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white rounded-lg text-sm font-medium transition-colors">
            <Sparkles size={16} />{fetchProgress.isLoading ? 'Fetching...' : 'Fetch Latest News'}
          </button>
          <button onClick={() => refreshCount()} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${darkMode ? 'bg-white/10 hover:bg-white/20 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}>
            <RefreshCw size={16} />Refresh Count
          </button>
          {!clearConfirm ? (
            <button onClick={() => setClearConfirm(true)} className="flex items-center gap-2 px-4 py-2 bg-rose-600/20 hover:bg-rose-600/30 border border-rose-600/30 text-rose-400 rounded-lg text-sm font-medium transition-colors">
              <Trash2 size={16} />Clear All Data
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-rose-400 flex items-center gap-1"><AlertCircle size={14} /> Sure?</span>
              <button onClick={async () => { await clearAllData(); setClearConfirm(false); await refreshCount(); }} className="px-3 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-medium">Yes, Delete</button>
              <button onClick={() => setClearConfirm(false)} className={`px-3 py-2 rounded-lg text-xs font-medium ${darkMode ? 'bg-white/10 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>Cancel</button>
            </div>
          )}
        </div>
        {fetchProgress.stage && !fetchProgress.isLoading && (
          <div className="mt-4 flex items-center gap-2 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-xs text-emerald-400"><CheckCircle size={14} />{fetchProgress.stage}</div>
        )}
        {fetchProgress.error && !fetchProgress.isLoading && (
          <div className="mt-3 flex items-start gap-2 px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs text-amber-400"><AlertCircle size={14} className="flex-shrink-0 mt-0.5" /><span>{fetchProgress.error}</span></div>
        )}
      </motion.div>

      {/* About */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className={`border rounded-xl p-6 ${surface}`}>
        <h3 className={`text-sm font-semibold mb-4 ${textPrimary}`}>About PulseWire</h3>
        <div className={`text-sm space-y-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          <p><strong className={textPrimary}>PulseWire</strong> is an AI-powered news intelligence platform that fetches real-time news, analyzes sentiment, generates summaries, and provides actionable insights.</p>
          <p><strong className={darkMode ? 'text-gray-300' : 'text-gray-700'}>News Sources:</strong> BBC News, Reuters, Associated Press, and more (via free RSS feeds)</p>
          <p><strong className={darkMode ? 'text-gray-300' : 'text-gray-700'}>AI Engine:</strong> Built-in NLP for sentiment analysis, summarization, and keyword extraction</p>
          <p><strong className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Tech Stack:</strong> React, TypeScript, Tailwind CSS, Zustand, Dexie (IndexedDB), Recharts, Framer Motion</p>
          <p><strong className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Storage:</strong> All articles stored locally in your browser using IndexedDB</p>
        </div>
      </motion.div>
    </div>
  );
}
