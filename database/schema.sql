create table users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password_hash text,
  role text not null default 'user',
  created_at timestamptz not null default now()
);

create table watchlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  ticker text not null,
  entry_target numeric,
  exit_target numeric,
  breakout_alert boolean not null default false,
  rsi_alert numeric,
  volume_spike_alert boolean not null default false,
  earnings_alert boolean not null default false,
  created_at timestamptz not null default now()
);

create table portfolio_holdings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  ticker text not null,
  quantity numeric not null,
  buy_price numeric not null,
  buy_date date,
  currency text not null default 'USD',
  fee numeric not null default 0,
  notes text,
  target_price numeric,
  stop_loss numeric,
  created_at timestamptz not null default now()
);

create table news_articles (
  id uuid primary key default gen_random_uuid(),
  ticker text,
  title text not null,
  source text not null,
  url text,
  category text,
  language text not null default 'en',
  translated_title_th text,
  ai_summary_th text,
  sentiment text check (sentiment in ('Bullish', 'Neutral', 'Bearish')),
  impact_score int check (impact_score between 0 and 100),
  published_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table ai_chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table backtests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  ticker text not null,
  strategy_name text not null,
  parameters jsonb not null default '{}',
  result jsonb not null default '{}',
  created_at timestamptz not null default now()
);
