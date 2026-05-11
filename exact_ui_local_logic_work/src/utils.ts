// ============================================================
// NewsAI Platform — Utility Functions
// ============================================================

import { formatDistanceToNow, format, isToday, isYesterday, isThisWeek } from 'date-fns';

/** Format a date string as relative time (e.g., "2 hours ago") */
export function timeAgo(dateStr: string): string {
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
  } catch {
    return 'Unknown';
  }
}

/** Format a date for display */
export function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isToday(d)) return 'Today, ' + format(d, 'h:mm a');
    if (isYesterday(d)) return 'Yesterday, ' + format(d, 'h:mm a');
    if (isThisWeek(d)) return format(d, 'EEEE, h:mm a');
    return format(d, 'MMM d, yyyy');
  } catch {
    return 'Unknown';
  }
}

/** Format date for charts */
export function formatChartDate(dateStr: string): string {
  try {
    return format(new Date(dateStr), 'MMM d');
  } catch {
    return dateStr;
  }
}

/** Truncate text to max length */
export function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen).trimEnd() + '...';
}

/** Get category color classes */
export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    technology: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    business: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    science: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    health: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
    politics: 'bg-red-500/20 text-red-300 border-red-500/30',
    sports: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    entertainment: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
    world: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    top: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    general: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
  };
  return colors[category.toLowerCase()] || colors.general;
}

/** Get sentiment color & icon info */
export function getSentimentInfo(sentiment: string | null) {
  switch (sentiment) {
    case 'positive':
      return { color: 'text-emerald-400', bg: 'bg-emerald-500/20 border-emerald-500/30', label: 'Positive', emoji: '😊' };
    case 'negative':
      return { color: 'text-rose-400', bg: 'bg-rose-500/20 border-rose-500/30', label: 'Negative', emoji: '😟' };
    case 'neutral':
      return { color: 'text-amber-400', bg: 'bg-amber-500/20 border-amber-500/30', label: 'Neutral', emoji: '😐' };
    default:
      return { color: 'text-gray-400', bg: 'bg-gray-500/20 border-gray-500/30', label: 'Unanalyzed', emoji: '❓' };
  }
}

/** Get gradient for category image placeholder */
export function getCategoryGradient(category: string): string {
  const gradients: Record<string, string> = {
    technology: 'from-blue-600 to-indigo-800',
    business: 'from-emerald-600 to-teal-800',
    science: 'from-purple-600 to-violet-800',
    health: 'from-teal-500 to-cyan-800',
    politics: 'from-red-600 to-rose-800',
    sports: 'from-orange-500 to-amber-800',
    entertainment: 'from-pink-500 to-fuchsia-800',
    world: 'from-cyan-500 to-blue-800',
    top: 'from-yellow-500 to-orange-700',
    general: 'from-gray-600 to-slate-800',
  };
  return gradients[category.toLowerCase()] || gradients.general;
}

/** Get category icon emoji */
export function getCategoryEmoji(category: string): string {
  const emojis: Record<string, string> = {
    technology: '💻', business: '📊', science: '🔬', health: '🏥',
    politics: '🏛️', sports: '⚽', entertainment: '🎬', world: '🌍',
    top: '⭐', general: '📰',
  };
  return emojis[category.toLowerCase()] || '📰';
}

/** Debounce function */
export function debounce<T extends (...args: unknown[]) => unknown>(fn: T, ms: number) {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

/** Capitalize first letter */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/** Format large numbers */
export function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}
