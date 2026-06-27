# GraphoMind Web App

Handwriting personality analysis powered by Claude AI.
API key is stored securely on the server — never exposed to users.

## Project structure

```
graphomind-web/
├── index.html        # Frontend — no API key here
├── api/
│   └── analyse.js    # Backend function — API key lives here
├── vercel.json       # Vercel routing config
└── README.md
```

## Deploy to Vercel (free, 5 minutes)

### Step 1 — Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2 — Login
```bash
vercel login
```
(opens browser, sign in with GitHub/Google/email)

### Step 3 — Deploy
```bash
cd graphomind-web
vercel
```
Answer the prompts:
- Set up and deploy? → Y
- Which scope? → your account
- Link to existing project? → N
- Project name? → graphomind (or anything)
- In which directory is your code? → ./ (just press Enter)
- Want to override settings? → N

### Step 4 — Add your API key as environment variable
```bash
vercel env add ANTHROPIC_API_KEY
```
Paste your Anthropic API key when prompted.
Select: Production, Preview, Development → press Enter for all three.

### Step 5 — Redeploy with the env variable
```bash
vercel --prod
```

You'll get a URL like: https://graphomind-abc123.vercel.app

### That's it! Share the link with anyone.

---

## Alternative: Deploy via Vercel website (no CLI)

1. Push this folder to a GitHub repo
2. Go to vercel.com → New Project → Import your repo
3. Go to Project Settings → Environment Variables
4. Add: ANTHROPIC_API_KEY = your key
5. Redeploy

---

## Local development

```bash
npm install -g vercel
vercel dev
```
Create a `.env` file in the project root:
```
ANTHROPIC_API_KEY=sk-ant-your-key-here
```
Open http://localhost:3000

---

## Costs

- Vercel hosting: Free (hobby tier)
- Anthropic API: ~$0.015 per analysis (Claude Opus)
- $5 = ~330 analyses

## Add rate limiting (optional, for public launch)

In `api/analyse.js` you can add simple IP-based rate limiting:
```js
// Add at top of handler:
const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
// Track requests per IP using Vercel KV or Upstash Redis
```
