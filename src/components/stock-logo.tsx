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

export function StockLogo({ quote, size = "md" }: StockLogoProps) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const showImage = Boolean(quote.logoUrl) && !failed;

  useEffect(() => {
    setFailed(false);
    setLoaded(false);
    if (!quote.logoUrl) return;
    timeoutRef.current = window.setTimeout(() => setFailed(true), 8000);
    return () => {
      if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
    };
  }, [quote.logoUrl]);

  function handleLoad() {
    if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
    setLoaded(true);
    setFailed(false);
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
          src={quote.logoUrl}
          alt={`${quote.ticker} logo`}
          onError={() => setFailed(true)}
          onLoad={handleLoad}
          className="absolute inset-0 h-full w-full object-contain p-1 opacity-100 transition-opacity"
          referrerPolicy="no-referrer"
        />
      ) : null}
    </span>
  );
}
