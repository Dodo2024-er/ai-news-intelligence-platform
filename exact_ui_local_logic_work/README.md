
# AI News Local Lite

Reference-style UI with the same local-lite backend logic.

## Run

```powershell
npm install
copy .env.example .env
npm run dev
```

Open:

```text
http://localhost:5173
```

Backend test:

```text
http://localhost:5000/api/articles
```

## Notes

- No MongoDB needed.
- Articles are stored in `server/data/articles.json`.
- Refresh News uses NewsData.io if you add `NEWSDATA_API_KEY` in `.env`.
- Without an API key, it uses local/demo articles.
