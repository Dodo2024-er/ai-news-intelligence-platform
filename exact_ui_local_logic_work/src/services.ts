
// Uses the existing local-lite backend logic. The UI remains the same as the reference project.
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export async function runNewsPipeline(_: unknown, onProgress?: (stage: string, current: number, total: number) => void) {
  onProgress?.('Calling local backend...', 1, 3);
  const res = await fetch(`${API}/articles/refresh`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
  onProgress?.('Reading local JSON storage...', 2, 3);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Refresh failed');
  const total = data.total || data.articles?.length || 0;
  onProgress?.('Dashboard updated.', 3, 3);
  return { fetched: total, stored: total, processed: total, errors: data.message ? [data.message] : [] };
}

export async function loadSampleData() {
  const res = await fetch(`${API}/articles`);
  const data = await res.json();
  return Array.isArray(data) ? data.length : data.articles?.length || 0;
}
