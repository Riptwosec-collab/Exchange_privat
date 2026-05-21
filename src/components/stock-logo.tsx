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
  return (
    <span
      className={`${sizes[size]} inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 font-bold text-white shadow-sm`}
      style={{ backgroundColor: quote.brandColor }}
      title={`${quote.ticker} logo`}
    >
      {quote.logoUrl ? (
        <img
          src={quote.logoUrl}
          alt={`${quote.ticker} logo`}
          className="h-full w-full object-contain p-1"
          referrerPolicy="no-referrer"
        />
      ) : (
        <span className="px-1 text-center leading-none text-slate-950">{quote.logoFallback}</span>
      )}
    </span>
  );
}
