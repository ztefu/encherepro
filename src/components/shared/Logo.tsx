import Link from "next/link";
import { Gavel } from "lucide-react";

export function Logo({ className = "", variant = "dark" }: { className?: string, variant?: "light" | "dark" }) {
  const textColor = variant === "light" ? "text-white drop-shadow-md" : "text-foreground";
  const subtextColor = variant === "light" ? "text-white/80 drop-shadow-md" : "text-muted-foreground";

  return (
    <Link href="/" className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/20 border border-primary/30 backdrop-blur-sm">
        <Gavel className="w-5 h-5 text-primary" />
      </div>
      <div className="flex flex-col">
        <span className={`font-heading font-bold text-lg leading-tight tracking-wide ${textColor}`}>
          ENCHÈRE<span className="text-primary">PRO</span>
        </span>
        <span className={`text-[10px] uppercase tracking-[0.2em] leading-tight ${subtextColor}`}>
          Ventes Privées
        </span>
      </div>
    </Link>
  );
}
