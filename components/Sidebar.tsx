"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, TrendingUp, User, Settings, FileText, BarChart3, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Markets", href: "/", icon: Home },
  { name: "Futures", href: "/futures", icon: Sparkles },
  { name: "Resume Odds", href: "/resume", icon: FileText },
  { name: "Sentiment", href: "/sentiment", icon: BarChart3 },
  { name: "Profile", href: "/profile", icon: User },
  { name: "Admin", href: "/admin", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 border-r border-border bg-card p-4">
      <div className="mb-8">
        <h2 className="text-2xl font-bold">TechOdds</h2>
        <p className="text-sm text-muted-foreground">Prediction Markets</p>
      </div>
      <nav className="space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="mt-8 pt-8 border-t border-border">
        <div className="text-xs text-muted-foreground mb-2">Categories</div>
        <div className="space-y-1">
          {["macro", "company", "applicant", "industry"].map((category) => (
            <Link
              key={category}
              href={`/?category=${category}`}
              className="block text-sm text-muted-foreground hover:text-foreground capitalize"
            >
              {category}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

