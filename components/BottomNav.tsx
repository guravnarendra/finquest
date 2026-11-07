"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Home, Play, History, Trophy } from "lucide-react";

const ITEMS = [
  { href: "/", label: "Home", Icon: Home },
  { href: "/test", label: "Test", Icon: Play },
  { href: "/learn", label: "Learn", Icon: BookOpen },
  { href: "/history", label: "History", Icon: History },
  { href: "/leaderboard", label: "Rank", Icon: Trophy },
];

export default function BottomNav() {
  const path = usePathname();
  return (
    <nav className="bottom-nav">
      {ITEMS.map(({ href, label, Icon }) => {
        const active = href === "/" ? path === "/" : path.startsWith(href);
        return (
          <Link key={href} href={href} className={`nav-item ${active ? "active" : ""}`}>
            <Icon size={21} strokeWidth={2.2} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
