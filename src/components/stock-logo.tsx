"use client";

import { useEffect, useRef, useState } from "react";
import type { StockQuote } from "@/lib/types";

type StockLogoProps = {
  quote: Pick<StockQuote, "ticker" | "logoUrl" | "logoFallback" | "brandColor">;
  size?: "sm" | "md" | "lg";
};

const sizes = {
  sm: "h-8 w-8 text-[10px]",
  md: "h-10 w-10 text-xs",
  lg: "h-12 w-12 text-sm"
};

const officialDomains: Record<string, string> = {
  AAPL: "apple.com",
  BTCTHB: "bitcoin.org",
  NVDA: "nvidia.com",
  AMD: "amd.com",
  TSLA: "tesla.com",
  MSFT: "microsoft.com",
  META: "meta.com",
  AMZN: "amazon.com",
  GOOG: "google.com",
  GOOGL: "google.com",
  NFLX: "netflix.com",
  COIN: "coinbase.com",
  CRWD: "crowdstrike.com",
  CRWV: "coreweave.com",
  PANW: "paloaltonetworks.com",
  NU: "nubank.com.br",
  HOOD: "robinhood.com",
  INTU: "intuit.com",
  RKLB: "rocketlabusa.com",
  MU: "micron.com",
  OSK: "oshkosh.com",
  ASTS: "ast-science.com",
  LUNR: "intuitivemachines.com",
  SOFI: "sofi.com",
  NBIS: "nebius.com",
  NET: "cloudflare.com",
  V: "visa.com",
  INTC: "intel.com",
  SNDK: "sandisk.com",
  PLTR: "palantir.com",
  QCOM: "qualcomm.com",
  IBM: "ibm.com",
  AVGO: "broadcom.com",
  TSM: "tsmc.com",
  APLD: "applieddigital.com",
  BBAI: "bigbear.ai",
  IONQ: "ionq.com",
  RGTI: "rigetti.com",
  SMCI: "supermicro.com",
  VRT: "vertiv.com",
  SERV: "serverobotics.com",
  SYM: "symbotic.com",
  ANET: "arista.com",
  ETN: "eaton.com",
  STK: "columbiathreadneedleus.com"
};

const simpleIconSlugs: Record<string, string> = {
  AAPL: "apple",
  BTCTHB: "bitcoin",
  NVDA: "nvidia",
  AMD: "amd",
  TSLA: "tesla",
  MSFT: "microsoft",
  META: "meta",
  AMZN: "amazon",
  GOOG: "google",
  GOOGL: "google",
  NFLX: "netflix",
  COIN: "coinbase",
  CRWD: "crowdstrike",
  PANW: "paloaltonetworks",
  HOOD: "robinhood",
  INTU: "intuit",
  NET: "cloudflare",
  V: "visa",
  INTC: "intel",
  SNDK: "sandisk",
  PLTR: "palantir",
  QCOM: "qualcomm",
  IBM: "ibm",
  TSM: "tsmc"
};

const cryptoLogos: Record<string, string> = {
  BTC: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
  BTCTHB: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
  ETH: "https://assets.coingecko.com/coins/images/279/large/ethereum.png",
  ETHUSD: "https://assets.coingecko.com/coins/images/279/large/ethereum.png"
};

function favicon(domain: string) {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
}

function clearbitLogo(domain: string) {
  return `https://logo.clearbit.com/${domain}`;
}

function duckDuckGoIcon(domain: string) {
  return `https://icons.duckduckgo.com/ip3/${domain}.ico`;
}

function logoCandidates(quote: StockLogoProps["quote"]) {
  const ticker = quote.ticker.toUpperCase();
  const domain = officialDomains[ticker];
  const urls = [
    cryptoLogos[ticker],
    simpleIconSlugs[ticker] ? `https://cdn.simpleicons.org/${simpleIconSlugs[ticker]}/ffffff` : null,
    domain ? clearbitLogo(domain) : null,
    quote.logoUrl,
    domain ? duckDuckGoIcon(domain) : null,
    domain ? favicon(domain) : null
  ].filter((url): url is string => Boolean(url));
  return Array.from(new Set(urls));
}

export function StockLogo({ quote, size = "md" }: StockLogoProps) {
  const [sourceIndex, setSourceIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const candidates = logoCandidates(quote);
  const activeSource = candidates[sourceIndex];
  const showImage = Boolean(activeSource);

  useEffect(() => {
    setSourceIndex(0);
    setLoaded(false);
  }, [quote.logoUrl, quote.ticker]);

  useEffect(() => {
    setLoaded(false);
    if (!activeSource) return;
    timeoutRef.current = window.setTimeout(() => nextSource(), 8000);
    return () => {
      if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
    };
  }, [activeSource]);

  function nextSource() {
    if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
    setLoaded(false);
    setSourceIndex((current) => current + 1);
  }

  function handleLoad() {
    if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
    setLoaded(true);
  }

  return (
    <span
      className={`${sizes[size]} relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 font-bold text-white shadow-sm`}
      style={{
        background: showImage
          ? quote.brandColor
          : `radial-gradient(circle at 30% 25%, rgba(255,255,255,.28), transparent 28%), linear-gradient(135deg, ${quote.brandColor}, #020617)`
      }}
      title={`${quote.ticker} logo`}
    >
      <>
        <span className="absolute inset-x-1 top-1 h-px bg-white/35" />
        <span className="absolute -bottom-2 -right-2 h-6 w-6 rounded-full bg-white/10" />
        <span className={`relative px-1 text-center leading-none text-white drop-shadow ${showImage ? "opacity-0" : "opacity-100"}`}>{quote.logoFallback}</span>
      </>
      {showImage ? (
        <img
          src={activeSource}
          alt={`${quote.ticker} logo`}
          onError={nextSource}
          onLoad={handleLoad}
          className={`absolute inset-0 h-full w-full object-contain p-1 transition-opacity ${loaded ? "opacity-100" : "opacity-0"}`}
          referrerPolicy="no-referrer"
        />
      ) : null}
    </span>
  );
}
