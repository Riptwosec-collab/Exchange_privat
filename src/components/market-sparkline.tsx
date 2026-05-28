export function MarketSparkline({
  id,
  change,
  className = "h-16 w-28"
}: {
  id: string;
  change: number;
  className?: string;
}) {
  const seed = id.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  let value = 42 + (seed % 12);
  const points = Array.from({ length: 28 }, (_, index) => {
    const drift = change >= 0 ? 0.42 : -0.34;
    const wave = Math.sin(index / 2.2 + seed) * 5.2 + Math.cos(index / 4 + seed) * 3.4;
    value = value * 0.74 + (42 + wave + index * drift) * 0.26;
    return value;
  });
  const min = Math.min(...points);
  const max = Math.max(...points);
  const line = points
    .map((point, index) => {
      const x = (index / (points.length - 1)) * 100;
      const y = 88 - ((point - min) / Math.max(1, max - min)) * 72;
      return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
  const area = `${line} L 100 96 L 0 96 Z`;
  const up = change >= 0;
  const stroke = up ? "#56c7a4" : "#f08aad";
  const fill = up ? "rgba(86,199,164,.18)" : "rgba(240,138,173,.20)";
  const gradientId = `spark-${id.replace(/[^a-zA-Z0-9_-]/g, "-")}-${up ? "up" : "down"}`;

  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className={`${className} overflow-visible rounded-xl bg-[#0b0b0e]`} aria-label={`${id} sparkline`}>
      <defs>
        <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={fill} />
          <stop offset="68%" stopColor={fill} />
          <stop offset="100%" stopColor="rgba(15,16,20,0)" />
        </linearGradient>
      </defs>
      {[18, 42, 66, 90].map((x) => <line key={`v-${x}`} x1={x} x2={x} y1="0" y2="100" stroke="rgba(255,255,255,.055)" strokeWidth="1" vectorEffect="non-scaling-stroke" />)}
      {[24, 48, 72].map((y) => <line key={`h-${y}`} x1="0" x2="100" y1={y} y2={y} stroke="rgba(255,255,255,.055)" strokeWidth="1" vectorEffect="non-scaling-stroke" />)}
      {points.map((point, index) => {
        const height = 5 + Math.abs(Math.sin(index + seed)) * 17;
        const x = (index / Math.max(1, points.length - 1)) * 100;
        return <rect key={index} x={x} y={96 - height} width="1.35" height={height} fill={up ? "rgba(86,199,164,.14)" : "rgba(240,138,173,.16)"} />;
      })}
      <path d={area} fill={`url(#${gradientId})`} />
      <path d={line} fill="none" stroke={stroke} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
