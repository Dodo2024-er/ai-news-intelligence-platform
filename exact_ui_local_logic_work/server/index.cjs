
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const DB_FILE = path.join(__dirname, 'data', 'articles.json');

function readArticles() {
  try {
    if (!fs.existsSync(DB_FILE)) return [];
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch { return []; }
}
function writeArticles(articles) {
  fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
  fs.writeFileSync(DB_FILE, JSON.stringify(articles, null, 2));
}
function analyze(text = '') {
  const lower = String(text).toLowerCase();
  const positiveWords = ['growth','win','success','improve','boost','positive','record','launch','innovation','benefit','gain','rise'];
  const negativeWords = ['risk','war','attack','loss','fall','crisis','warning','negative','threat','concern','shortage','poor'];
  const pos = positiveWords.filter(w => lower.includes(w)).length;
  const neg = negativeWords.filter(w => lower.includes(w)).length;
  const sentiment = pos > neg ? 'Positive' : neg > pos ? 'Negative' : 'Neutral';
  return { sentiment, summary: text && text.length > 220 ? text.slice(0,217)+'...' : text || 'Summary unavailable.', insights: [sentiment==='Positive'?'Positive trend detected':sentiment==='Negative'?'Risk indicator detected':'Neutral information update','Useful for quick decision making','Article processed through local analysis'] };
}
app.get('/', (req,res)=>res.json({ok:true,message:'AI News Local Lite API running'}));
app.get('/api/health', (req,res)=>res.json({ok:true,storage:'local-json',articles:readArticles().length}));
app.get('/api/articles', (req,res)=> {
  const { search='', sentiment='all', source='all', category='all', region='all', sortBy='newest' } = req.query;
  let articles = readArticles();
  if (search) { const q=String(search).toLowerCase(); articles=articles.filter(a => `${a.title||''} ${a.summary||''} ${a.source||''}`.toLowerCase().includes(q)); }
  if (sentiment !== 'all') articles=articles.filter(a => String(a.sentiment||'').toLowerCase()===String(sentiment).toLowerCase());
  if (source !== 'all') articles=articles.filter(a => String(a.source||'')===String(source));
  if (category !== 'all') articles=articles.filter(a => (a.category||[]).includes(category));
  if (region !== 'all') articles=articles.filter(a => (a.country||[]).includes(region) || a.region===region);
  articles.sort((a,b)=> sortBy==='oldest' ? new Date(a.date||a.publishedAt||0)-new Date(b.date||b.publishedAt||0) : new Date(b.date||b.publishedAt||0)-new Date(a.date||a.publishedAt||0));
  res.json(articles);
});
app.delete('/api/articles', (req,res)=> { writeArticles([]); res.json({ok:true,total:0}); });
app.post('/api/articles/refresh', async (req,res)=> {
  const apiKey = process.env.NEWSDATA_API_KEY;
  if (!apiKey || apiKey === 'your_newsdata_api_key_here') {
    const local=readArticles();
    return res.json({ok:true,message:'No NewsData.io API key found. Showing local demo articles.',total:local.length,articles:local});
  }
  try {
    const url = `https://newsdata.io/api/1/news?apikey=${apiKey}&language=en&category=technology`;
    const response = await fetch(url);
    const data = await response.json();
    if (!response.ok || data.status==='error') {
      const local=readArticles();
      return res.json({ok:true,message:data.message || 'NewsData.io failed. Showing local saved articles.',total:local.length,articles:local});
    }
    const incoming=(data.results||[]).map((item,index)=>{
      const text=item.description || item.content || item.title || '';
      const ai=analyze(text);
      return {id:item.article_id || `news-${Date.now()}-${index}`, title:item.title || 'Untitled article', summary:ai.summary, sentiment:ai.sentiment, insights:ai.insights, source:item.source_id || item.source_name || 'NewsData.io', date:item.pubDate || new Date().toISOString(), url:item.link || '', category:item.category || ['technology'], country:item.country || ['global'], imageUrl:item.image_url || null};
    });
    const existing=readArticles(); const map=new Map();
    [...incoming,...existing].forEach(a=>map.set(a.id||a.title,a));
    const merged=Array.from(map.values()).slice(0,500); writeArticles(merged);
    res.json({ok:true,message:'News refreshed successfully.',total:merged.length,articles:merged});
  } catch(e) { const local=readArticles(); res.json({ok:true,message:'Refresh failed. Showing local saved articles.',total:local.length,articles:local}); }
});
app.listen(PORT, ()=>{ console.log(`Backend API running at http://localhost:${PORT}`); console.log(`Articles API: http://localhost:${PORT}/api/articles`); });
