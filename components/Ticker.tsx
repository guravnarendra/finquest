"use client";
const ITEMS = [
  ["NIFTY 50", "24,812", "+0.8%"], ["SENSEX", "81,240", "+0.6%"], ["GOLD", "₹98,400", "+1.2%"],
  ["SIP FLOWS", "₹26,800 Cr", "+4.1%"], ["BTC", "$97,200", "-1.4%"], ["USD/INR", "₹86.40", "+0.1%"],
  ["BANK NIFTY", "53,120", "+0.4%"], ["CRUDE", "$74.10", "-0.8%"],
];
export default function Ticker() {
  const row = (key: string) => (
    <span key={key} className="ticker-row text-[12px] font-bold">
      {ITEMS.map(([n, v, c]) => (
        <span key={n} className="flex items-center gap-2">
          <span className="muted">{n}</span><span>{v}</span>
          <span style={{ color: c.startsWith("+") ? "#34d399" : "#f87171" }}>{c}</span>
          <span className="muted">•</span>
        </span>
      ))}
    </span>
  );
  return (
    <div className="overflow-hidden border-y py-2" style={{ borderColor: "#1e3a2c", background: "#071a11" }}>
      <div className="ticker">{row("a")}{row("b")}</div>
    </div>
  );
}
