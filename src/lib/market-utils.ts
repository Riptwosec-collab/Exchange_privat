import type { Candle, StockQuote } from "./types";

export type StockMeta = { ticker: string; name: string; sector: string; marketCap: string };

export const stockUniverse: StockMeta[] = [
  { ticker: "NVDA", name: "NVIDIA", sector: "Semiconductor", marketCap: "3.5T" },
  { ticker: "MSFT", name: "Microsoft", sector: "AI Software", marketCap: "3.1T" },
  { ticker: "AAPL", name: "Apple", sector: "Consumer Tech", marketCap: "2.9T" },
  { ticker: "AMZN", name: "Amazon", sector: "Cloud/Retail", marketCap: "1.9T" },
  { ticker: "GOOGL", name: "Alphabet", sector: "AI/Search", marketCap: "2.1T" },
  { ticker: "META", name: "Meta Platforms", sector: "AI/Social", marketCap: "1.2T" },
  { ticker: "TSLA", name: "Tesla", sector: "EV", marketCap: "790B" },
  { ticker: "AVGO", name: "Broadcom", sector: "Semiconductor", marketCap: "780B" },
  { ticker: "AMD", name: "Advanced Micro Devices", sector: "Semiconductor", marketCap: "272B" },
  { ticker: "INTC", name: "Intel", sector: "Semiconductor", marketCap: "190B" },
  { ticker: "QCOM", name: "Qualcomm", sector: "Semiconductor", marketCap: "210B" },
  { ticker: "MU", name: "Micron", sector: "Semiconductor", marketCap: "155B" },
  { ticker: "ARM", name: "Arm Holdings", sector: "Semiconductor", marketCap: "120B" },
  { ticker: "TSM", name: "Taiwan Semiconductor", sector: "Semiconductor", marketCap: "820B" },
  { ticker: "ASML", name: "ASML", sector: "Semiconductor", marketCap: "410B" },
  { ticker: "SMCI", name: "Super Micro Computer", sector: "AI Hardware", marketCap: "55B" },
  { ticker: "DELL", name: "Dell Technologies", sector: "AI Hardware", marketCap: "95B" },
  { ticker: "HPE", name: "HPE", sector: "AI Hardware", marketCap: "28B" },
  { ticker: "ORCL", name: "Oracle", sector: "Cloud", marketCap: "350B" },
  { ticker: "CRM", name: "Salesforce", sector: "Software", marketCap: "285B" },
  { ticker: "ADBE", name: "Adobe", sector: "Software", marketCap: "220B" },
  { ticker: "NOW", name: "ServiceNow", sector: "Software", marketCap: "155B" },
  { ticker: "SNOW", name: "Snowflake", sector: "Data Cloud", marketCap: "45B" },
  { ticker: "PLTR", name: "Palantir", sector: "AI Software", marketCap: "180B" },
  { ticker: "NET", name: "Cloudflare", sector: "Cloud/Security", marketCap: "35B" },
  { ticker: "CRWD", name: "CrowdStrike", sector: "Cybersecurity", marketCap: "86B" },
  { ticker: "PANW", name: "Palo Alto Networks", sector: "Cybersecurity", marketCap: "105B" },
  { ticker: "DDOG", name: "Datadog", sector: "Software", marketCap: "42B" },
  { ticker: "MDB", name: "MongoDB", sector: "Database", marketCap: "24B" },
  { ticker: "SHOP", name: "Shopify", sector: "Ecommerce", marketCap: "95B" },
  { ticker: "UBER", name: "Uber", sector: "Mobility", marketCap: "150B" },
  { ticker: "ABNB", name: "Airbnb", sector: "Travel", marketCap: "95B" },
  { ticker: "NFLX", name: "Netflix", sector: "Streaming", marketCap: "260B" },
  { ticker: "DIS", name: "Disney", sector: "Media", marketCap: "180B" },
  { ticker: "PYPL", name: "PayPal", sector: "Fintech", marketCap: "65B" },
  { ticker: "SQ", name: "Block", sector: "Fintech", marketCap: "45B" },
  { ticker: "V", name: "Visa", sector: "Payments", marketCap: "560B" },
  { ticker: "MA", name: "Mastercard", sector: "Payments", marketCap: "430B" },
  { ticker: "JPM", name: "JPMorgan Chase", sector: "Banking", marketCap: "560B" },
  { ticker: "BAC", name: "Bank of America", sector: "Banking", marketCap: "300B" },
  { ticker: "GS", name: "Goldman Sachs", sector: "Banking", marketCap: "140B" },
  { ticker: "MS", name: "Morgan Stanley", sector: "Banking", marketCap: "155B" },
  { ticker: "BLK", name: "BlackRock", sector: "Asset Management", marketCap: "125B" },
  { ticker: "BRK-B", name: "Berkshire Hathaway", sector: "Holding", marketCap: "880B" },
  { ticker: "UNH", name: "UnitedHealth", sector: "Healthcare", marketCap: "470B" },
  { ticker: "LLY", name: "Eli Lilly", sector: "Healthcare", marketCap: "720B" },
  { ticker: "JNJ", name: "Johnson & Johnson", sector: "Healthcare", marketCap: "380B" },
  { ticker: "PFE", name: "Pfizer", sector: "Healthcare", marketCap: "160B" },
  { ticker: "MRNA", name: "Moderna", sector: "Biotech", marketCap: "45B" },
  { ticker: "ISRG", name: "Intuitive Surgical", sector: "MedTech", marketCap: "145B" },
  { ticker: "XOM", name: "Exxon Mobil", sector: "Energy", marketCap: "510B" },
  { ticker: "CVX", name: "Chevron", sector: "Energy", marketCap: "285B" },
  { ticker: "COP", name: "ConocoPhillips", sector: "Energy", marketCap: "135B" },
  { ticker: "SLB", name: "SLB", sector: "Energy Services", marketCap: "65B" },
  { ticker: "NEE", name: "NextEra Energy", sector: "Utilities", marketCap: "150B" },
  { ticker: "ENPH", name: "Enphase Energy", sector: "Solar", marketCap: "16B" },
  { ticker: "FSLR", name: "First Solar", sector: "Solar", marketCap: "25B" },
  { ticker: "CAT", name: "Caterpillar", sector: "Industrial", marketCap: "170B" },
  { ticker: "DE", name: "Deere", sector: "Industrial", marketCap: "110B" },
  { ticker: "GE", name: "GE Aerospace", sector: "Aerospace", marketCap: "170B" },
  { ticker: "BA", name: "Boeing", sector: "Aerospace", marketCap: "120B" },
  { ticker: "LMT", name: "Lockheed Martin", sector: "Defense", marketCap: "115B" },
  { ticker: "NOC", name: "Northrop Grumman", sector: "Defense", marketCap: "70B" },
  { ticker: "RTX", name: "RTX", sector: "Defense", marketCap: "135B" },
  { ticker: "RKLB", name: "Rocket Lab", sector: "Space", marketCap: "12B" },
  { ticker: "LUNR", name: "Intuitive Machines", sector: "Space", marketCap: "1B" },
  { ticker: "ASTS", name: "AST SpaceMobile", sector: "Space", marketCap: "5B" },
  { ticker: "SPCE", name: "Virgin Galactic", sector: "Space", marketCap: "500M" },
  { ticker: "WMT", name: "Walmart", sector: "Retail", marketCap: "520B" },
  { ticker: "COST", name: "Costco", sector: "Retail", marketCap: "360B" },
  { ticker: "HD", name: "Home Depot", sector: "Retail", marketCap: "360B" },
  { ticker: "NKE", name: "Nike", sector: "Consumer", marketCap: "130B" },
  { ticker: "SBUX", name: "Starbucks", sector: "Consumer", marketCap: "95B" },
  { ticker: "MCD", name: "McDonald's", sector: "Consumer", marketCap: "210B" },
  { ticker: "KO", name: "Coca-Cola", sector: "Consumer Staples", marketCap: "270B" },
  { ticker: "PEP", name: "PepsiCo", sector: "Consumer Staples", marketCap: "230B" },
  { ticker: "PG", name: "Procter & Gamble", sector: "Consumer Staples", marketCap: "380B" },
  { ticker: "T", name: "AT&T", sector: "Telecom", marketCap: "130B" },
  { ticker: "VZ", name: "Verizon", sector: "Telecom", marketCap: "170B" },
  { ticker: "TMUS", name: "T-Mobile US", sector: "Telecom", marketCap: "210B" },
  { ticker: "COIN", name: "Coinbase", sector: "Crypto", marketCap: "62B" },
  { ticker: "MSTR", name: "MicroStrategy", sector: "Crypto", marketCap: "32B" },
  { ticker: "HOOD", name: "Robinhood", sector: "Fintech", marketCap: "18B" },
  { ticker: "RIOT", name: "Riot Platforms", sector: "Crypto Mining", marketCap: "3B" },
  { ticker: "MARA", name: "MARA Holdings", sector: "Crypto Mining", marketCap: "6B" },
  { ticker: "BABA", name: "Alibaba", sector: "China Tech", marketCap: "190B" },
  { ticker: "PDD", name: "PDD Holdings", sector: "China Tech", marketCap: "180B" },
  { ticker: "NIO", name: "NIO", sector: "China EV", marketCap: "10B" },
  { ticker: "LI", name: "Li Auto", sector: "China EV", marketCap: "25B" },
  { ticker: "XPEV", name: "XPeng", sector: "China EV", marketCap: "8B" },
  { ticker: "TM", name: "Toyota", sector: "Auto", marketCap: "300B" },
  { ticker: "F", name: "Ford", sector: "Auto", marketCap: "48B" },
  { ticker: "GM", name: "General Motors", sector: "Auto", marketCap: "55B" },
  { ticker: "RIVN", name: "Rivian", sector: "EV", marketCap: "12B" },
  { ticker: "LCID", name: "Lucid", sector: "EV", marketCap: "6B" },
  { ticker: "PTT.BK", name: "PTT", sector: "Thai Energy", marketCap: "1.0T THB" },
  { ticker: "PTTEP.BK", name: "PTT Exploration", sector: "Thai Energy", marketCap: "650B THB" },
  { ticker: "AOT.BK", name: "Airports of Thailand", sector: "Thai Transport", marketCap: "850B THB" },
  { ticker: "CPALL.BK", name: "CP All", sector: "Thai Retail", marketCap: "520B THB" },
  { ticker: "ADVANC.BK", name: "Advanced Info Service", sector: "Thai Telecom", marketCap: "650B THB" },
  { ticker: "BDMS.BK", name: "Bangkok Dusit Medical", sector: "Thai Healthcare", marketCap: "450B THB" },
  { ticker: "KBANK.BK", name: "Kasikornbank", sector: "Thai Banking", marketCap: "330B THB" },
  { ticker: "SCB.BK", name: "SCB X", sector: "Thai Banking", marketCap: "360B THB" },
  { ticker: "BBL.BK", name: "Bangkok Bank", sector: "Thai Banking", marketCap: "300B THB" },
  { ticker: "DELTA.BK", name: "Delta Electronics Thailand", sector: "Thai Electronics", marketCap: "950B THB" },
  { ticker: "GULF.BK", name: "Gulf Energy", sector: "Thai Utilities", marketCap: "540B THB" },
  { ticker: "TRUE.BK", name: "True Corp", sector: "Thai Telecom", marketCap: "320B THB" }
];

export const allStockSymbols = stockUniverse.map((stock) => stock.ticker);

export const quoteNameMap: Record<string, { name: string; sector: string; marketCap: string }> = Object.fromEntries(
  stockUniverse.map((stock) => [stock.ticker, { name: stock.name, sector: stock.sector, marketCap: stock.marketCap }])
);

export function generateCandles(symbol: string, points = 120): Candle[] {
  const seed = symbol.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return Array.from({ length: points }, (_, index) => {
    const base = 80 + (seed % 80) + Math.sin(index / 6 + seed) * 8 + index * 0.18;
    const open = base + Math.sin(index + seed) * 1.8;
    const close = base + Math.cos(index / 2 + seed) * 2.6;
    const date = new Date(Date.UTC(2026, 1, 1 + index)).toISOString().slice(0, 10);
    return {
      time: date,
      open: Number(open.toFixed(2)),
      high: Number((Math.max(open, close) + 2.9).toFixed(2)),
      low: Number((Math.min(open, close) - 2.5).toFixed(2)),
      close: Number(close.toFixed(2)),
      volume: Math.round(12_000_000 + Math.abs(Math.sin(index / 3 + seed)) * 62_000_000)
    };
  });
}

export function quoteFromCandle(symbol: string, candles: Candle[]): StockQuote {
  const meta = quoteNameMap[symbol] ?? { name: symbol, sector: "Watchlist", marketCap: "-" };
  const last = candles[candles.length - 1];
  const previous = candles[candles.length - 2] ?? last;
  const change = last.close - previous.close;
  return {
    ticker: symbol,
    name: meta.name,
    price: last.close,
    change: Number(change.toFixed(2)),
    changePercent: Number(((change / previous.close) * 100).toFixed(2)),
    volume: `${Math.round(last.volume / 1_000_000)}M`,
    marketCap: meta.marketCap,
    sector: meta.sector,
    rsi: Math.max(25, Math.min(82, Math.round(50 + change * 5 + Math.sin(last.close) * 10)))
  };
}
