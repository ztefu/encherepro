"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Search, Filter, MoreVertical, Eye, Edit, CheckCircle, Mail, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAdmin } from "@/context/AdminContext";

const generateSlug = (title: string) => title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export default function ParticipantsListPage() {
  const { sales, participants, updateParticipantPayment, updateParticipantAccess, deleteParticipant, deleteMultipleParticipants, isLoading } = useAdmin();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSaleId, setSelectedSaleId] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [participantToDelete, setParticipantToDelete] = useState<string | number | null>(null);
  
  const [selectedParticipantIds, setSelectedParticipantIds] = useState<(string | number)[]>([]);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const itemsPerPage = 12;

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case "paid": return <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20">Confirmé</Badge>;
      case "pending": return <Badge className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-amber-500/20">En attente</Badge>;
      case "failed": return <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20">Échoué</Badge>;
      default: return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  const getParticipationBadge = (status: string) => {
    switch (status) {
      case "access_sent": return <Badge className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/20">Accès envoyé</Badge>;
      case "confirmed": return <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20">Confirmé</Badge>;
      case "registered": return <Badge className="bg-zinc-500/10 text-zinc-400 hover:bg-zinc-500/20 border-zinc-500/20">Brouillon</Badge>;
      case "cancelled": return <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20">Annulé</Badge>;
      default: return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  const filteredParticipants = participants.filter(p => {
    const matchesSearch = p.firstName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSale = selectedSaleId === "all" || p.saleId === selectedSaleId;
    return matchesSearch && matchesSale;
  });

  const totalPages = Math.ceil(filteredParticipants.length / itemsPerPage);
  const paginatedParticipants = filteredParticipants.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleToggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedParticipantIds(filteredParticipants.map(p => p.id));
    } else {
      setSelectedParticipantIds([]);
    }
  };

  const handleToggleSelect = (id: string | number, checked: boolean) => {
    if (checked) {
      setSelectedParticipantIds(prev => [...prev, id]);
    } else {
      setSelectedParticipantIds(prev => prev.filter(pId => pId !== id));
    }
  };

  const handleBulkDelete = () => {
    deleteMultipleParticipants(selectedParticipantIds);
    setSelectedParticipantIds([]);
    setIsBulkDeleteModalOpen(false);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">Gestion des Inscriptions</h1>
        <p className="text-muted-foreground mt-2">Gérez les participants, leurs paiements et leurs accès.</p>
      </div>

      <Card className="bg-card border-border/50 shadow-sm">
        {selectedParticipantIds.length > 0 && (
          <div className="bg-muted/50 p-4 flex items-center justify-between border-b border-border/50">
            <span className="text-sm font-medium">
              {selectedParticipantIds.length} inscrit{selectedParticipantIds.length > 1 ? "s" : ""} sélectionné{selectedParticipantIds.length > 1 ? "s" : ""}
            </span>
            <Button variant="destructive" size="sm" onClick={() => setIsBulkDeleteModalOpen(true)}>
              <Trash2 className="w-4 h-4 mr-2" /> Supprimer la sélection
            </Button>
          </div>
        )}
        <CardHeader className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4">
          <CardTitle className="font-heading text-lg">Tous les participants</CardTitle>
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Rechercher (nom, email)..." 
                className="pl-8"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <div className="w-full sm:w-64">
              <Select value={selectedSaleId} onValueChange={(val) => {
                if (val) {
                  setSelectedSaleId(val);
                  setCurrentPage(1);
                }
              }}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chargement...">
                    {selectedSaleId === "all" 
                      ? "Toutes les ventes" 
                      : sales.find(s => s.id === selectedSaleId)?.title || "Chargement..."}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les ventes</SelectItem>
                  {!isLoading && sales.map((sale) => (
                    <SelectItem key={sale.id} value={sale.id} className="truncate">
                      {sale.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                <tr>
                  <th className="px-6 py-4 rounded-tl-lg w-12">
                    <Checkbox 
                      checked={filteredParticipants.length > 0 && selectedParticipantIds.length === filteredParticipants.length}
                      onCheckedChange={(checked) => handleToggleSelectAll(checked as boolean)}
                      aria-label="Sélectionner tout"
                    />
                  </th>
                  <th className="px-6 py-4 font-medium">Participant</th>
                  <th className="px-6 py-4 font-medium">Contact</th>
                  <th className="px-6 py-4 font-medium">Vente Concernée</th>
                  <th className="px-6 py-4 font-medium">Date d'inscription</th>
                  <th className="px-6 py-4 font-medium">Paiement</th>
                  <th className="px-6 py-4 font-medium">Statut Accès</th>
                  <th className="px-6 py-4 font-medium rounded-tr-lg text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-4" /></td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Skeleton className="w-8 h-8 rounded-full" />
                          <div>
                            <Skeleton className="h-4 w-32 mb-1" />
                            <Skeleton className="h-3 w-20" />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Skeleton className="h-4 w-40 mb-1" />
                        <Skeleton className="h-3 w-24" />
                      </td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-6 w-16 rounded-full" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-6 w-20 rounded-full" /></td>
                      <td className="px-6 py-4 text-right"><Skeleton className="h-8 w-8 ml-auto" /></td>
                    </tr>
                  ))
                ) : paginatedParticipants.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/30 transition-colors" data-state={selectedParticipantIds.includes(p.id) ? "selected" : undefined}>
                    <td className="px-6 py-4">
                      <Checkbox 
                        checked={selectedParticipantIds.includes(p.id)}
                        onCheckedChange={(checked) => handleToggleSelect(p.id, checked as boolean)}
                        aria-label={`Sélectionner ${p.firstName}`}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                          {p.firstName[0]}{p.lastName[0]}
                        </div>
                        <div>
                          <div className="font-medium text-foreground">{p.firstName} {p.lastName}</div>
                          <div className="text-xs text-muted-foreground">{p.country}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-foreground">{p.email}</span>
                        <span className="text-xs text-muted-foreground">{p.phone}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-foreground">{p.sale}</td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {format(p.date, "dd/MM/yyyy HH:mm", { locale: fr })}
                    </td>
                    <td className="px-6 py-4">{getPaymentBadge(p.paymentStatus)}</td>
                    <td className="px-6 py-4">{getParticipationBadge(p.participationStatus)}</td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" />}>
                          <MoreVertical className="w-4 h-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                          <Link href={`/admin/inscriptions/${generateSlug(p.firstName + ' ' + p.lastName)}-${p.id}`}>
                            <DropdownMenuItem className="gap-2 cursor-pointer">
                              <Eye className="w-4 h-4" /> Voir le profil
                            </DropdownMenuItem>
                          </Link>
                          <Link href={`/admin/inscriptions/${generateSlug(p.firstName + ' ' + p.lastName)}-${p.id}?edit=true`}>
                            <DropdownMenuItem className="gap-2 cursor-pointer">
                              <Edit className="w-4 h-4" /> Modifier
                            </DropdownMenuItem>
                          </Link>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="gap-2 cursor-pointer text-emerald-500 focus:text-emerald-500" onClick={() => updateParticipantPayment(p.id, "paid")}>
                            <CheckCircle className="w-4 h-4" /> Marquer payé
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2 cursor-pointer text-blue-500 focus:text-blue-500" onClick={() => updateParticipantAccess(p.id, "access_sent")}>
                            <Mail className="w-4 h-4" /> Envoyer les accès
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="gap-2 text-red-500 focus:text-red-500" onClick={() => setParticipantToDelete(p.id)}>
                            <Trash2 className="w-4 h-4" /> Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
                {!isLoading && paginatedParticipants.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <Users className="w-12 h-12 text-muted-foreground/50 mb-4" />
                        <h3 className="text-lg font-medium text-foreground">Aucun participant trouvé</h3>
                        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                          Nous n'avons trouvé aucun participant correspondant à vos critères de recherche.
                        </p>
                        <Button variant="outline" className="mt-4" onClick={() => {setSearchTerm(""); setSelectedSaleId("all");}}>
                          Réinitialiser les filtres
                        </Button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          <div className="flex items-center justify-between mt-6 px-2">
            <span className="text-sm text-muted-foreground">
              Affichage de {filteredParticipants.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} à {Math.min(currentPage * itemsPerPage, filteredParticipants.length)} sur {filteredParticipants.length} inscrit(s)
            </span>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              >
                Précédent
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                disabled={currentPage >= totalPages || totalPages === 0}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              >
                Suivant
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!participantToDelete} onOpenChange={(open: boolean) => !open && setParticipantToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Êtes-vous sûr de vouloir supprimer cette inscription ?</DialogTitle>
            <DialogDescription>
              Cette action est irréversible. Toutes les données associées à ce participant seront définitivement supprimées de la base de données.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex gap-2">
            <Button variant="outline" onClick={() => setParticipantToDelete(null)}>Annuler</Button>
            <Button 
              variant="destructive"
              onClick={() => {
                if (participantToDelete) {
                  deleteParticipant(participantToDelete);
                  setParticipantToDelete(null);
                }
              }}
            >
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
              Êtes-vous sûr de vouloir supprimer {selectedParticipantIds.length === 1 ? "l'inscrit sélectionné" : `les ${selectedParticipantIds.length} inscrits sélectionnés`} ? Cette action est irréversible.
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
