import React from 'react';

export default function TradingViewTopBar() {
  return (
    <div className="top-toolbar h-11 bg-[#1c2128] border-b border-[#363a45] flex items-center px-4 gap-3 text-sm z-50">
      {/* Logo */}
      <div className="flex items-center gap-2 font-semibold text-[#2962ff] text-lg">
        TradingView
      </div>

      {/* Symbol Search */}
      <div className="flex-1 max-w-[420px]">
        <div className="relative">
          <input
            type="text"
            placeholder="ค้นหาสัญลักษณ์... (NVDA, BTCUSD, SET50)"
            className="w-full bg-[#2a2e39] border border-[#363a45] rounded-md px-4 py-1.5 text-white placeholder-gray-400 focus:outline-none focus:border-[#2962ff]"
          />
        </div>
      </div>

      {/* Timeframes */}
      <div className="flex gap-0.5 bg-[#2a2e39] rounded-md p-0.5">
        {['1m','5m','15m','30m','1H','4H','1D','1W','1M'].map((tf) => (
          <button
            key={tf}
            className="px-3 py-1 hover:bg-[#363a45] rounded text-[#d1d4dc] text-xs font-medium transition-colors"
          >
            {tf}
          </button>
        ))}
      </div>

      <div className="flex-1"></div>

      {/* Tools */}
      <div className="flex items-center gap-2">
        <button className="tv-button px-4 py-1.5 rounded text-sm">Indicators</button>
        <button className="tv-button px-4 py-1.5 rounded text-sm">Compare</button>
        <button className="tv-button px-4 py-1.5 rounded text-sm flex items-center gap-1">
          <span>🛎️</span> Alert
        </button>
        <button className="px-3 py-1.5 text-[#d1d4dc] hover:bg-[#363a45] rounded">...</button>
      </div>
    </div>
  );
}