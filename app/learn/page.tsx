"use client";
import Link from "next/link";
import { Play } from "lucide-react";

const LESSONS = [
  { icon: "💰", topic: "SIP", title: "SIP — Systematic Investment Plan", points: ["Har mahine fixed amount auto-invest hota hai.", "Market upar-neeche ho, units average price par milte hain (rupee-cost averaging).", "₹500 se bhi start kar sakte ho. Jaldi start = bada corpus.", "Crash me SIP band mat karo — saste me zyada units milte hain."], example: "₹5,000/month, 12% return, 20 saal ≈ ₹50 lakh (invested sirf ₹12 lakh)." },
  { icon: "📊", topic: "Mutual Funds", title: "Mutual Funds — Index vs Active", points: ["Equity fund tumhara paisa kai companies me baant deta hai.", "Index fund market ko copy karta hai, cost ~0.1-0.3%.", "Active fund me manager pick karta hai, cost ~1-2%.", "Har active fund index ko beat nahi karta — cost matter karta hai."], example: "Nifty 50 index fund = India ki top 50 companies, ek hi fund me." },
  { icon: "📈", topic: "Stocks", title: "Stocks 101", points: ["Share matlab company me chhota sa ownership.", "Blue-chip = badi stable companies; small-cap = zyada risk + zyada growth potential.", "P/E high matlab market ko growth ki ummeed hai — akele signal nahi.", "Ek stock me sab paisa = gambling, portfolio nahi."], example: "₹10,000 ek stock me vs 10 stocks me — dusra wala diversification hai." },
  { icon: "🛡️", topic: "Risk", title: "Risk ko samjho, daro mat", points: ["Zyada return ki possibility = zyada loss ki possibility bhi.", "Time horizon: 1 saal ka paisa FD me, 10 saal ka equity me.", "Panic sell sabse bada loss hota hai — plan par tiko.", "Risk capacity = age, income, goals par depend karta hai."], example: "25 saal ka investor 50 saal ke investor se zyada risk le sakta hai." },
  { icon: "✨", topic: "Compounding", title: "Compounding — 8th wonder", points: ["Return par return milta hai — paisa exponential badhta hai.", "Time > Amount: 25 par start karne wala 35 wale ko hara deta hai.", "Step-up SIP: har saal 10% badhao, corpus bahut bada hoga.", "Compounding ke liye sabse zaroori cheez: ruko mat, start karo."], example: "₹10,000, 12%, 10 saal ≈ ₹31,000. 20 saal ≈ ₹96,000." },
  { icon: "🔥", topic: "Inflation", title: "Inflation — chupa hua chor", points: ["Inflation 6% ho to FD 5.5% par real return -0.5% hai.", "Real return = Nominal return − Inflation.", "Inflation ko harane ke liye equity / diversified SIP chahiye.", "Aaj ₹100 ki cheez, 10 saal baad ~₹180 ki hogi (6% inflation)."], example: "Goal ke liye hamesha inflation-adjusted amount socho." },
  { icon: "🧺", topic: "Diversification", title: "Diversification — eggs, basket", points: ["Alag assets: equity, debt, gold — ek gire to sab na gire.", "Alag sectors bhi: IT + Bank + Pharma, sirf ek nahi.", "Gold 5-10% portfolio ko crisis me support deta hai.", "Rebalance: saal me ek baar ratio wapas set karo."], example: "60% equity + 30% debt + 10% gold — classic balanced mix." },
  { icon: "🆘", topic: "Emergency Fund", title: "Emergency Fund — pehla step", points: ["Invest karne se PEHLE 3-6 mahine ka kharcha alag rakho.", "Jagah: savings account ya liquid fund — shares me kabhi nahi.", "Job loss, medical emergency — ye fund hi bachata hai.", "Emergency fund bharne ke baad hi SIP shuru karo."], example: "Kharcha ₹30,000/month hai to emergency fund ₹90,000–₹1,80,000." },
  { icon: "🧾", topic: "Tax", title: "Taxes — STCG vs LTCG", points: ["1 saal se kam me share/equity fund becha: STCG flat 20% tax.", "1 saal se zyada rakha: LTCG 12.5% tax lagta hai.", "Equity LTCG par saal me ₹1.25 lakh tak ka profit tax-free hota hai.", "Frequent trading tax aur brokerage me paisa kha jati hai — hold karo."], example: "₹2 lakh LTCG profit par: ₹1.25L exempt, bache ₹75,000 par 12.5% = sirf ₹9,375 tax." },
];

export default function LearnPage() {
  return (
    <div className="space-y-4">
      <div><h1 className="text-[24px] font-black">Learn — 2-min lessons 📚</h1><p className="muted text-[14px]">Test me weak nikle topics yahin se seekho. Har lesson: 4 points + 1 example.</p></div>
      {LESSONS.map((l) => (
        <details key={l.topic} className="card pop p-4">
          <summary className="flex items-center gap-3"><span className="text-[26px]">{l.icon}</span><span className="flex-1"><span className="block font-black text-[15.5px]">{l.title}</span><span className="muted text-[12.5px]">{l.topic} • 2 min read</span></span><span className="chip"><span className="chip-toggle-open">Open</span><span className="chip-toggle-close">Close</span></span></summary>
          <ul className="mt-3 space-y-2 text-[14px] leading-relaxed">{l.points.map((p) => <li key={p} className="flex gap-2"><span style={{ color: "#34d399" }}>•</span>{p}</li>)}</ul>
          <div className="card2 mt-3 p-3 text-[13.5px]"><b style={{ color: "#f59e0b" }}>Example: </b>{l.example}</div>
        </details>
      ))}
      <Link href="/test" className="btn-primary flex items-center justify-center gap-2"><Play size={18} /> Ab Test Do — Seekha Hua Check Karo</Link>
    </div>
  );
}
