import type { Metadata, Viewport } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import Ticker from "@/components/Ticker";

export const metadata: Metadata = {
  title: "FinQuest — InvestIQ | Investing Quiz Game",
  description: "Mobile investing game: 10 questions (MCQ + real-life scenarios), score and AI verdict. SIP, mutual funds, stocks, risk — seekho, khelo, jeeto.",
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#07120d" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="app-bg">
          <div className="phone">
            <header className="flex items-center justify-between px-5 pt-5 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="floaty grid h-10 w-10 place-items-center rounded-2xl text-xl font-black" style={{ background: "linear-gradient(135deg,#10b981,#059669)", color: "#04100a" }}>₹</div>
                <div>
                  <div className="text-[17px] font-black leading-none tracking-tight">FinQuest</div>
                  <div className="text-[11px] font-bold" style={{ color: "#f59e0b" }}>INVEST IQ • SEEKHO • KHELO</div>
                </div>
              </div>
              <span className="chip">📈 Virtual ₹1L</span>
            </header>
            <Ticker />
            <main className="px-5 pt-4">{children}</main>
            <BottomNav />
          </div>
        </div>
      </body>
    </html>
  );
}
