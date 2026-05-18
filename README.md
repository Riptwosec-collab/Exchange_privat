# AstraQuant Stock Market Intelligence Platform

Professional AI trading dashboard starter built with Next.js, TypeScript, TailwindCSS, Framer Motion, Lightweight Charts, Recharts, Zustand, Express, WebSocket, JWT, PostgreSQL schema, and OpenAI-ready API routes.

## Features Included

- Futuristic dark trading dashboard inspired by TradingView, Bloomberg, Finviz, Yahoo Finance, and AI terminals
- Live mock ticker stream, watchlist, indices, market overview, gainers/losers, heatmap, screener, news sentiment, portfolio tracker, macro calendar, social/whale flow widgets
- TradingView Lightweight Charts candlestick panel with timeframe controls and indicator labels
- AI Copilot API with Thai explanation mode and safe fallback when `OPENAI_API_KEY` is not set
- Next.js API routes for market data, news filtering, portfolio analytics, auth login, copilot, and backtesting
- Express backend with `/health`, `/api/quotes`, `/api/alerts`, and `/ws/quotes` WebSocket stream
- PostgreSQL schema for users, watchlists, holdings, news, AI chat memory, and backtests

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Run the optional Express/WebSocket backend:

```bash
npm run api
```

Backend runs at `http://localhost:4000`, WebSocket stream at `ws://localhost:4000/ws/quotes`.

## Environment

Copy `.env.example` to `.env.local` and fill provider keys when you are ready to switch from mock data to live integrations.

```bash
OPENAI_API_KEY=sk-proj-your-key
DATABASE_URL=postgresql://user:password@localhost:5432/stock_ai
JWT_SECRET=replace-with-a-long-random-secret
```

## Suggested Production Integrations

- Market data: Polygon.io or TwelveData for real-time quotes, Alpha Vantage/Yahoo fallback for historical candles
- News: NewsAPI + Finnhub company news, translated and summarized through OpenAI
- Database: Supabase PostgreSQL using `database/schema.sql`
- Auth: Firebase Auth or JWT with refresh tokens and HTTP-only cookies
- Deployment: Vercel for Next.js, Railway for Express/WebSocket service, Supabase for database
- Security: API route rate limiting, encrypted provider credentials, server-side auth validation, audit log for portfolio changes
