import type { Candle, StockQuote } from "./types";

export type StockMeta = { ticker: string; name: string; sector: string; marketCap: string };

const core = "NVDA MSFT AAPL AMZN GOOGL META TSLA AVGO AMD INTC QCOM MU ARM TSM ASML SMCI DELL HPE ORCL CRM ADBE NOW SNOW PLTR NET CRWD PANW DDOG MDB SHOP UBER ABNB NFLX DIS PYPL SQ V MA JPM BAC GS MS BLK BRK-B UNH LLY JNJ PFE MRNA ISRG XOM CVX COP SLB NEE ENPH FSLR CAT DE GE BA LMT NOC RTX RKLB LUNR ASTS SPCE WMT COST HD NKE SBUX MCD KO PEP PG T VZ TMUS COIN MSTR HOOD RIOT MARA BABA PDD NIO LI XPEV TM F GM RIVN LCID PTT.BK PTTEP.BK AOT.BK CPALL.BK ADVANC.BK BDMS.BK KBANK.BK SCB.BK BBL.BK DELTA.BK GULF.BK TRUE.BK";
const extra = "MRVL ON NXPI MPWR MCHP TER KLAC LRCX AMAT WDC STX GFS LSCC ALAB AEHR ACMR FORM ONTO VECO COHR APP TTD ROKU SPOT PINS SNAP RBLX U DUOL TOST AFRM SOFI UPST BILL HUBS ZS OKTA S TENB CYBR PATH AI SOUN BBAI IONQ QBTS RGTI QUBT SERV SYM RR BKSY PL SPIR JOBY ACHR EVTL EH ARBE OUST VRT ETN PWR EMR ROK HON PH XYL GNRC BE FCEL PLUG RUN SEDG NOVA ARRY SHLS ENVX QS SLDP CELH ELF CAVA WING SHAK BROS CMG LULU DECK ONON SKX TPR CPRI ULTA TJX ROST TGT LOW ORLY AZO HIMS TDOC DOCS TEM RXRX SDGR DNA CRSP EDIT NTLA BEAM VERV VKTX TMDX NUVL JANX HALO EXAS NTRA GH C WFC AXP COF SCHW ICE CME MCO SPGI KKR APO BX ARES OWL NU MELI SE GRAB CPNG GLBE RCL CCL NCLH DAL UAL AAL LUV BKNG EXPE MAR HLT WYNN LVS DKNG PENN CHWY ETSY EBAY FVRR W MDT ABT SYK BSX ZBH EW DXCM PODD RMD ALGN VRTX REGN GILD AMGN BIIB BMY MRK ABBV TMO LIN APD SHW ECL DD DOW FCX NEM AA CLF STLD NUE X TECK VALE RIO BHP SCCO ALB LAC OXY EOG PXD DVN FANG HAL BKR KMI LNG WMB ET EPD MPLX PSX VLO MPC DINO HES APA TALO SPY QQQ DIA IWM SMH SOXX ARKK XLE XLF XLK XLV XLY XLI XLU TLT GLD SLV BITO IBIT ETHA";

const sectorRules: Array<[string, string[]]> = [
  ["Semiconductor", "NVDA AVGO AMD INTC QCOM MU ARM TSM ASML MRVL ON NXPI MPWR MCHP TER KLAC LRCX AMAT WDC STX GFS LSCC ALAB AEHR ACMR FORM ONTO VECO COHR".split(" ")],
  ["AI / Automation", "MSFT GOOGL META PLTR SMCI DELL HPE PATH AI SOUN BBAI IONQ QBTS RGTI QUBT SERV SYM RR BKSY PL SPIR".split(" ")],
  ["Space / Mobility", "RKLB LUNR ASTS SPCE JOBY ACHR EVTL EH ARBE OUST".split(" ")],
  ["Energy / Power", "XOM CVX COP SLB NEE ENPH FSLR VRT ETN PWR EMR ROK HON PH XYL GNRC BE FCEL PLUG RUN SEDG NOVA ARRY SHLS ENVX QS SLDP".split(" ")],
  ["Consumer Growth", "AMZN TSLA WMT COST HD NKE SBUX MCD KO PEP PG CELH ELF CAVA WING SHAK BROS CMG LULU DECK ONON SKX TPR CPRI ULTA TJX ROST TGT LOW ORLY AZO".split(" ")],
  ["Healthcare / Biotech", "UNH LLY JNJ PFE MRNA ISRG HIMS TDOC DOCS TEM RXRX SDGR DNA CRSP EDIT NTLA BEAM VERV VKTX TMDX NUVL JANX HALO EXAS NTRA GH MDT ABT SYK BSX ZBH EW DXCM PODD RMD ALGN VRTX REGN GILD AMGN BIIB BMY MRK ABBV TMO".split(" ")],
  ["Financials", "V MA JPM BAC GS MS BLK PYPL SQ HOOD C WFC AXP COF SCHW ICE CME MCO SPGI KKR APO BX ARES OWL NU".split(" ")],
  ["Global Tech", "AAPL ORCL CRM ADBE NOW SNOW NET CRWD PANW DDOG MDB SHOP UBER ABNB NFLX DIS APP TTD ROKU SPOT PINS SNAP RBLX U DUOL TOST AFRM SOFI UPST BILL HUBS ZS OKTA S TENB CYBR MELI SE GRAB CPNG GLBE".split(" ")],
  ["Travel / Leisure", "RCL CCL NCLH DAL UAL AAL LUV BKNG EXPE MAR HLT WYNN LVS DKNG PENN CHWY ETSY EBAY FVRR W".split(" ")],
  ["Materials", "LIN APD SHW ECL DD DOW FCX NEM AA CLF STLD NUE X TECK VALE RIO BHP SCCO ALB LAC".split(" ")],
  ["Oil / Gas", "OXY EOG PXD DVN FANG HAL BKR KMI LNG WMB ET EPD MPLX PSX VLO MPC DINO HES APA TALO".split(" ")],
  ["ETF / Macro", "SPY QQQ DIA IWM SMH SOXX ARKK XLE XLF XLK XLV XLY XLI XLU TLT GLD SLV BITO IBIT ETHA".split(" ")]
];

function sectorFor(ticker: string) {
  if (ticker.endsWith(".BK")) return ticker.includes("PTT") ? "Thai Energy" : ticker.includes("BANK") || ["KBANK.BK", "SCB.BK", "BBL.BK"].includes(ticker) ? "Thai Banking" : "Thai Stocks";
  return sectorRules.find(([, symbols]) => symbols.includes(ticker))?.[0] ?? "Momentum";
}

export const stockUniverse: StockMeta[] = Array.from(new Set(`${core} ${extra}`.split(" ").filter(Boolean))).slice(0, 300).map((ticker) => ({ ticker, name: ticker, sector: sectorFor(ticker), marketCap: ticker.includes(".") ? "THB" : ticker.length <= 3 ? "Large/ETF" : "Momentum" }));
export const allStockSymbols = stockUniverse.map((stock) => stock.ticker);
export const quoteNameMap: Record<string, { name: string; sector: string; marketCap: string }> = Object.fromEntries(stockUniverse.map((stock) => [stock.ticker, { name: stock.name, sector: stock.sector, marketCap: stock.marketCap }]));

export function generateCandles(symbol: string, points = 120): Candle[] {
  const seed = symbol.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return Array.from({ length: points }, (_, index) => {
    const base = 80 + (seed % 80) + Math.sin(index / 6 + seed) * 8 + index * 0.18;
    const open = base + Math.sin(index + seed) * 1.8;
    const close = base + Math.cos(index / 2 + seed) * 2.6;
    const date = new Date(Date.UTC(2026, 1, 1 + index)).toISOString().slice(0, 10);
    return { time: date, open: Number(open.toFixed(2)), high: Number((Math.max(open, close) + 2.9).toFixed(2)), low: Number((Math.min(open, close) - 2.5).toFixed(2)), close: Number(close.toFixed(2)), volume: Math.round(12_000_000 + Math.abs(Math.sin(index / 3 + seed)) * 62_000_000) };
  });
}

export function quoteFromCandle(symbol: string, candles: Candle[]): StockQuote {
  const meta = quoteNameMap[symbol] ?? { name: symbol, sector: "Watchlist", marketCap: "-" };
  const last = candles[candles.length - 1];
  const previous = candles[candles.length - 2] ?? last;
  const change = last.close - previous.close;
  return { ticker: symbol, name: meta.name, price: last.close, previousClose: previous.close, change: Number(change.toFixed(2)), changePercent: Number(((change / previous.close) * 100).toFixed(2)), volume: `${Math.round(last.volume / 1_000_000)}M`, marketCap: meta.marketCap, sector: meta.sector, rsi: Math.max(25, Math.min(82, Math.round(50 + change * 5 + Math.sin(last.close) * 10))) };
}
