"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Eye, 
  Edit, 
  Copy, 
  Trash2,
  Plus
} from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const generateSlug = (title: string) => title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
import { useAdmin, Sale, SaleStatus } from "@/context/AdminContext";



export default function SalesListPage() {
  const { sales, addSale, deleteSale, deleteMultipleSales, duplicateSale, registrationFee, lots, participants } = useAdmin();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedSaleIds, setSelectedSaleIds] = useState<string[]>([]);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newSaleTitle, setNewSaleTitle] = useState("");
  const [newSaleDate, setNewSaleDate] = useState("");
  const [newSaleEndDate, setNewSaleEndDate] = useState("");
  const [newSaleRegDeadline, setNewSaleRegDeadline] = useState("");
  const [newSaleLocation, setNewSaleLocation] = useState("En ligne");

  // State for delete confirmation
  const [saleToDelete, setSaleToDelete] = useState<string | null>(null);

  // Open modal
  const openCreateModal = () => {
    setIsCreateModalOpen(true);
  };

  const handleCreateSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSaleTitle || !newSaleDate) return;
    
    const newSaleId = `sale-${Date.now()}`;
    const dateObj = new Date(newSaleDate);
    const regObj = newSaleRegDeadline ? new Date(newSaleRegDeadline) : new Date(dateObj.getTime() - 24 * 60 * 60 * 1000);
    const endObj = newSaleEndDate ? new Date(newSaleEndDate) : new Date(dateObj.getTime() + 24 * 60 * 60 * 1000);
    
    addSale({
      id: newSaleId,
      title: newSaleTitle,
      date: dateObj.toLocaleDateString('fr-FR'),
      isoDate: dateObj.toISOString(),
      endDate: endObj.toISOString(),
      registrationDeadline: regObj.toISOString(),
      location: newSaleLocation,
      status: "published",
      revenue: 0,
      participants: 0,
      lotsSold: 0,
      conversionRate: 0,
      lotsCount: 0,
    });
    
    setIsCreateModalOpen(false);
    setNewSaleTitle("");
    setNewSaleDate("");
    setNewSaleEndDate("");
    setNewSaleRegDeadline("");
    setNewSaleLocation("En ligne");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published": return <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20">Publiée</Badge>;
      case "upcoming": return <Badge className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-amber-500/20">À venir</Badge>;
      case "open": return <Badge className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/20">Inscriptions ouvertes</Badge>;
      case "draft": return <Badge className="bg-zinc-500/10 text-zinc-400 hover:bg-zinc-500/20 border-zinc-500/20">Brouillon</Badge>;
      case "finished": return <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20">Terminée</Badge>;
      default: return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  const filteredSales = sales.filter(sale => {
    const matchesSearch = sale.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || sale.status === statusFilter;
    return matchesSearch && matchesStatus;
  }).sort((a, b) => new Date(b.isoDate).getTime() - new Date(a.isoDate).getTime()); // Tri par date décroissante

  const handleToggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedSaleIds(filteredSales.map(s => s.id));
    } else {
      setSelectedSaleIds([]);
    }
  };

  const handleToggleSelect = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedSaleIds(prev => [...prev, id]);
    } else {
      setSelectedSaleIds(prev => prev.filter(saleId => saleId !== id));
    }
  };

  const handleBulkDelete = () => {
    deleteMultipleSales(selectedSaleIds);
    setSelectedSaleIds([]);
    setIsBulkDeleteModalOpen(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">Gestion des Ventes</h1>
          <p className="text-muted-foreground mt-2">Gérez l'ensemble de vos ventes privées et leurs lots.</p>
        </div>
        <Button className="gap-2" onClick={openCreateModal}>
          <Plus className="w-4 h-4" />
          Créer une vente
        </Button>
      </div>

      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleCreateSale}>
            <DialogHeader>
              <DialogTitle>Créer une nouvelle vente</DialogTitle>
              <DialogDescription>
                Renseignez les informations de base pour démarrer. Vous pourrez les modifier par la suite.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titre de la vente</Label>
                <Input 
                  id="title" 
                  placeholder="Ex: Montres de Collection" 
                  value={newSaleTitle}
                  onChange={(e) => setNewSaleTitle(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date et Heure (Début)</Label>
                <Input 
                  id="date" 
                  type="datetime-local" 
                  value={newSaleDate}
                  onChange={(e) => setNewSaleDate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">Date et Heure (Fin)</Label>
                <Input 
                  id="endDate" 
                  type="datetime-local" 
                  value={newSaleEndDate}
                  onChange={(e) => setNewSaleEndDate(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Laissez vide pour 24h après le début.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="regDeadline">Fin des inscriptions</Label>
                <Input 
                  id="regDeadline" 
                  type="datetime-local" 
                  value={newSaleRegDeadline}
                  onChange={(e) => setNewSaleRegDeadline(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Laissez vide pour 24h avant le début.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Lieu</Label>
                <Input 
                  id="location" 
                  placeholder="Ex: En ligne, ou adresse..." 
                  value={newSaleLocation}
                  onChange={(e) => setNewSaleLocation(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>Annuler</Button>
              <Button type="submit">Créer la vente</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Card className="bg-card border-border/50 shadow-sm">
        {selectedSaleIds.length > 0 && (
          <div className="bg-muted/50 p-4 flex items-center justify-between border-b border-border/50">
            <span className="text-sm font-medium">
              {selectedSaleIds.length} vente{selectedSaleIds.length > 1 ? "s" : ""} sélectionnée{selectedSaleIds.length > 1 ? "s" : ""}
            </span>
            <Button variant="destructive" size="sm" onClick={() => setIsBulkDeleteModalOpen(true)}>
              <Trash2 className="w-4 h-4 mr-2" /> Supprimer la sélection
            </Button>
          </div>
        )}
        <CardHeader className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4">
          <CardTitle className="font-heading text-lg">Toutes les ventes</CardTitle>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Rechercher une vente..." 
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {/* Simulation of a Filter Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="outline" className="gap-2 shrink-0" />}>
                <Filter className="w-4 h-4" />
                Filtrer
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => setStatusFilter("all")}>Toutes les ventes</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("published")}>Publiées</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("upcoming")}>À venir</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("open")}>Inscriptions ouvertes</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("draft")}>Brouillons</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("finished")}>Terminées</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                <tr>
                  <th className="px-6 py-4 rounded-tl-lg w-12">
                    <Checkbox 
                      checked={filteredSales.length > 0 && selectedSaleIds.length === filteredSales.length}
                      onCheckedChange={(checked) => handleToggleSelectAll(checked as boolean)}
                      aria-label="Sélectionner tout"
                    />
                  </th>
                  <th className="px-6 py-4 font-medium">Vente</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium text-center">Lots</th>
                  <th className="px-6 py-4 font-medium text-center">Inscrits</th>
                  <th className="px-6 py-4 font-medium text-right">CA (Frais)</th>
                  <th className="px-6 py-4 font-medium">Statut</th>
                  <th className="px-6 py-4 font-medium rounded-tr-lg text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filteredSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-muted/30 transition-colors" data-state={selectedSaleIds.includes(sale.id) ? "selected" : undefined}>
                    <td className="px-6 py-4">
                      <Checkbox 
                        checked={selectedSaleIds.includes(sale.id)}
                        onCheckedChange={(checked) => handleToggleSelect(sale.id, checked as boolean)}
                        aria-label={`Sélectionner ${sale.title}`}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-12 h-12 rounded-lg bg-cover bg-center shrink-0 border border-border/50"
                          style={{ backgroundImage: `url('${sale.image}')` }}
                        />
                        <span className="font-medium text-foreground line-clamp-2 max-w-[250px]">{sale.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                      {format(new Date(sale.isoDate), "dd MMMM yyyy", { locale: fr })}
                    </td>
                    <td className="px-6 py-4 text-center font-medium">
                      {lots.filter(l => String(l.saleId) === sale.id).length}
                    </td>
                    <td className="px-6 py-4 text-center font-medium">
                      {participants.filter(p => String(p.saleId) === sale.id).length}
                    </td>
                    <td className="px-6 py-4 text-right font-medium">
                      {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(participants.filter(p => String(p.saleId) === sale.id && p.paymentStatus === 'paid').length * registrationFee)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(sale.status)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" />}>
                          <MoreVertical className="w-4 h-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <Link href={`/admin/ventes/${generateSlug(sale.title)}-${sale.id}`}>
                            <DropdownMenuItem className="gap-2 cursor-pointer">
                              <Eye className="w-4 h-4" /> Voir le détail
                            </DropdownMenuItem>
                          </Link>
                          <Link href={`/admin/ventes/${generateSlug(sale.title)}-${sale.id}/lots`}>
                            <DropdownMenuItem className="gap-2 cursor-pointer">
                              <Edit className="w-4 h-4" /> Gérer les lots
                            </DropdownMenuItem>
                          </Link>
                          <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => duplicateSale(sale.id)}>
                            <Copy className="w-4 h-4" /> Dupliquer
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2 text-red-500 focus:text-red-500 cursor-pointer" onClick={() => setSaleToDelete(sale.id)}>
                            <Trash2 className="w-4 h-4" /> Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
                
                {filteredSales.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-muted-foreground">
                      Aucune vente trouvée avec ces filtres.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      <Dialog open={!!saleToDelete} onOpenChange={(open) => !open && setSaleToDelete(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer cette vente ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex gap-2">
            <Button variant="outline" onClick={() => setSaleToDelete(null)}>Annuler</Button>
            <Button variant="destructive" onClick={() => {
              if (saleToDelete) {
                deleteSale(saleToDelete);
                setSaleToDelete(null);
              }
            }}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Confirmation Modal */}
      <Dialog open={isBulkDeleteModalOpen} onOpenChange={setIsBulkDeleteModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmer la suppression multiple</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer {selectedSaleIds.length === 1 ? "la vente sélectionnée" : `les ${selectedSaleIds.length} ventes sélectionnées`} ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex gap-2">
            <Button variant="outline" onClick={() => setIsBulkDeleteModalOpen(false)}>Annuler</Button>
            <Button variant="destructive" onClick={handleBulkDelete}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
