import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Gavel, 
  Users, 
  Settings, 
  LogOut,
  X
} from "lucide-react";
import { Logo } from "@/components/shared/Logo";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function Sidebar({ onClose }: { onClose: () => void }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  const navItems = [
    { name: "Tableau de bord", href: "/admin", icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: "Ventes", href: "/admin/ventes", icon: <Gavel className="w-5 h-5" /> },
    { name: "Inscriptions", href: "/admin/inscriptions", icon: <Users className="w-5 h-5" /> },
    { name: "Paramètres", href: "/admin/parametres", icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <aside className="h-full bg-card border-r border-border flex flex-col">
      <div className="h-20 flex items-center justify-between px-6 border-b border-border">
        <Logo className="scale-90 origin-left" />
        <button className="lg:hidden text-muted-foreground hover:text-foreground" onClick={onClose}>
          <X className="w-6 h-6" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
              onClick={() => {
                if (window.innerWidth < 1024) onClose();
              }}
            >
              {item.icon}
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
