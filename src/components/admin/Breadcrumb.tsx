import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

export function AdminBreadcrumb() {
  const pathname = usePathname();
  const paths = pathname.split('/').filter(p => p !== '');

  // Si on est juste sur /admin, on ne montre pas le fil d'ariane
  if (paths.length <= 1) return null;

  const breadcrumbs = paths.map((path, index) => {
    const href = '/' + paths.slice(0, index + 1).join('/');
    const isLast = index === paths.length - 1;
    
    // Format human readable
    let name = path.charAt(0).toUpperCase() + path.slice(1);
    if (path === 'admin') name = 'Tableau de bord';
    if (path === 'ventes') name = 'Ventes';
    if (path === 'inscriptions') name = 'Inscriptions';
    if (path === 'parametres') name = 'Paramètres';
    if (path === 'create') name = 'Création';
    if (path === 'lots') name = 'Lots';
    
    // Si c'est un ID UUID (ou autre ID généré), on l'affiche de façon plus courte
    if (path.length > 20 || path.startsWith('sale-')) {
       name = "Détails";
    }

    return (
      <div key={href} className="flex items-center">
        <ChevronRight className="w-4 h-4 text-muted-foreground mx-1" />
        {isLast ? (
          <span className="text-sm font-medium text-foreground">{name}</span>
        ) : (
          <Link href={href} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            {name}
          </Link>
        )}
      </div>
    );
  });

  return (
    <div className="flex items-center mb-6 overflow-x-auto whitespace-nowrap pb-1 scrollbar-hide">
      <Link href="/admin" className="text-muted-foreground hover:text-foreground transition-colors">
        <Home className="w-4 h-4" />
      </Link>
      {breadcrumbs}
    </div>
  );
}
