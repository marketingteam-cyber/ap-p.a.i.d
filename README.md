# P.A.I.D — Paid Ads Intelligence Dashboard

AssetPlus internal dashboard for paid advertising intelligence across Google Ads, Meta Ads, and LinkedIn Ads.

## Quick Start

```bash
# 1. Copy and fill env vars
cp .env.example .env

# 2. Install backend deps
npm install

# 3. Install frontend deps
cd frontend && npm install && cd ..

# 4. Run dev (both backend + frontend)
npm run dev
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start backend (port 3001) + frontend (port 5173) |
| `npm start` | Production backend only |
| `npm run build` | Build frontend |
| `npm run refresh` | Trigger manual data refresh |

## Environment Variables

See `.env.example` for all required variables.

## Data Refresh

Auto-refreshes daily at **08:00 AM IST** (02:30 UTC). Trigger manually via the API or `npm run refresh`.

## Tech Stack

- **Frontend**: React 18 + Vite + Tailwind CSS + Recharts
- **Backend**: Node.js + Express + SQLite (better-sqlite3)
- **AI**: Anthropic Claude API (creative scoring + competitor intel)
- **Data**: Windsor.ai API + Meta Ad Library API
