"use client";

import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { 
  ArrowLeft, Edit, Users, Gavel, Calendar, MapPin, Settings, Mail, ShieldCheck, Play, Box
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { use, useState } from "react";
import { useAdmin, SaleStatus } from "@/context/AdminContext";

export default function SaleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { sales, updateSale, lots, participants, registrationFee } = useAdmin();
  const saleId = resolvedParams.id.slice(-36);
  const contextSale = sales.find(s => s.id === saleId);
  const saleLots = lots.filter(l => String(l.saleId) === saleId);
  const saleParticipants = participants.filter(p => String(p.saleId) === saleId);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editEndDate, setEditEndDate] = useState("");
  const [editRegDeadline, setEditRegDeadline] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editDescription, setEditDescription] = useState("");

  if (!contextSale) {
    return <div className="p-8 text-center text-muted-foreground">Vente introuvable.</div>;
  }
  
  // Fusionner les données du contexte avec des valeurs par défaut pour les champs non gérés
  const sale = {
    ...contextSale,
    subtitle: contextSale.subtitle || "Collection privée",
    description: contextSale.description || "Description de la vente...",
    dateStart: new Date(contextSale.isoDate),
    registrationDeadline: contextSale.registrationDeadline ? new Date(contextSale.registrationDeadline) : new Date(new Date(contextSale.isoDate).getTime() - 24 * 60 * 60 * 1000), // -24 hours
    lotsCount: saleLots.length,
    participantsCount: saleParticipants.length,
    location: contextSale.location || "En ligne",
    type: contextSale.type || "Hybride"
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

  const openEditModal = () => {
    setEditTitle(sale.title);
    setEditDate(sale.isoDate.slice(0, 16)); // Format YYYY-MM-DDTHH:mm
    if (sale.endDate) {
      setEditEndDate(sale.endDate.slice(0, 16));
    } else {
      setEditEndDate("");
    }
    setEditRegDeadline(sale.registrationDeadline.toISOString().slice(0, 16));
    setEditLocation(sale.location);
    setEditDescription(sale.description);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dateObj = new Date(editDate);
    const regObj = editRegDeadline ? new Date(editRegDeadline) : new Date(dateObj.getTime() - 24 * 60 * 60 * 1000);
    const endObj = editEndDate ? new Date(editEndDate) : new Date(dateObj.getTime() + 24 * 60 * 60 * 1000);
    
    updateSale(sale.id, { 
      title: editTitle,
      date: dateObj.toLocaleDateString('fr-FR'),
      isoDate: dateObj.toISOString(),
      endDate: endObj.toISOString(),
      registrationDeadline: regObj.toISOString(),
      location: editLocation,
      description: editDescription
    });
    setIsEditModalOpen(false);
  };

  const changeStatus = (newStatus: SaleStatus) => {
    updateSale(sale.id, { status: newStatus });
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* En-tête / Bannière */}
      <div className="relative rounded-2xl overflow-hidden h-64 bg-card border border-border/50 shadow-sm">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${sale.image}')` }}
        />
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
        
        <div className="absolute inset-0 flex flex-col justify-between p-6 sm:p-8">
          <div className="flex justify-between items-start">
            <Link href="/admin/ventes">
              <Button variant="outline" size="sm" className="gap-2 bg-background/50 backdrop-blur-md border-border/50">
                <ArrowLeft className="w-4 h-4" /> Retour
              </Button>
            </Link>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-2 bg-background/50 backdrop-blur-md border-border/50" onClick={openEditModal}>
                <Edit className="w-4 h-4" /> Modifier
              </Button>
            </div>
          </div>
          
          <div>
            <div className="flex items-center gap-3 mb-2">
              {getStatusBadge(sale.status)}
              <Badge variant="outline" className="bg-background/50 backdrop-blur-md">{sale.type}</Badge>
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight text-foreground">{sale.title}</h1>
            <p className="text-muted-foreground mt-1 text-lg">{sale.subtitle}</p>
          </div>
        </div>
      </div>

      {/* Actions Rapides */}
      <div className="flex flex-wrap items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="outline" className="gap-2 w-[220px] justify-between" />}>
              <div className="flex items-center gap-2">
                {sale.status === "open" && <span className="w-2 h-2 rounded-full bg-blue-500" />}
                {sale.status === "published" && <span className="w-2 h-2 rounded-full bg-emerald-500" />}
                {sale.status === "upcoming" && <span className="w-2 h-2 rounded-full bg-amber-500" />}
                {sale.status === "finished" && <span className="w-2 h-2 rounded-full bg-red-500" />}
                {sale.status === "draft" && <span className="w-2 h-2 rounded-full bg-zinc-500" />}
                {sale.status === "open" ? "Inscriptions ouvertes" :
                 sale.status === "published" ? "Publiée" :
                 sale.status === "upcoming" ? "À venir" :
                 sale.status === "finished" ? "Terminée" :
                 sale.status === "draft" ? "Brouillon" : sale.status}
              </div>
              <Settings className="w-4 h-4 opacity-50" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[220px]">
            <DropdownMenuItem onClick={() => changeStatus("draft")}>Brouillon</DropdownMenuItem>
            <DropdownMenuItem onClick={() => changeStatus("upcoming")}>À venir</DropdownMenuItem>
            <DropdownMenuItem onClick={() => changeStatus("published")}>Publiée</DropdownMenuItem>
            <DropdownMenuItem onClick={() => changeStatus("open")}>Inscriptions ouvertes</DropdownMenuItem>
            <DropdownMenuItem onClick={() => changeStatus("finished")}>Terminée</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Link href={`/admin/ventes/${resolvedParams.id}/lots`}>
          <Button variant="outline" className="gap-2">
            <Box className="w-4 h-4" /> Gérer les lots
          </Button>
        </Link>
        <Button variant="outline" className="gap-2">
          <Mail className="w-4 h-4" /> Envoyer un message aux inscrits
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Colonne Principale */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="bg-card border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="font-heading">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {sale.description}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border/50 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="font-heading">Lots de la vente</CardTitle>
              <Link href={`/admin/ventes/${resolvedParams.id}/lots`}>
                <Button variant="ghost" size="sm" className="gap-2">
                  Voir tout <ArrowLeft className="w-4 h-4 rotate-180" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {saleLots.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {saleLots.slice(0, 4).map((lot) => (
                    <div key={lot.id} className="group relative rounded-lg overflow-hidden border border-border/50 bg-muted aspect-square">
                      <div 
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
                        style={{ backgroundImage: `url('${lot.image}')` }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
                      <div className="absolute bottom-2 left-2 text-xs font-medium text-foreground">{lot.title}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground mb-4">Aucun lot pour le moment.</p>
                  <Link href={`/admin/ventes/${sale.id}/lots`}>
                    <Button variant="outline" size="sm">Ajouter des lots</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Colonne Latérale (Stats & Info) */}
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-card border-border/50 shadow-sm">
              <CardContent className="p-6 text-center">
                <Users className="w-6 h-6 text-primary mx-auto mb-2" />
                <div className="text-2xl font-heading font-bold">{sale.participantsCount}</div>
                <div className="text-xs text-muted-foreground">{sale.participantsCount > 1 ? "Inscrits" : "Inscrit"}</div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border/50 shadow-sm">
              <CardContent className="p-6 text-center">
                <Box className="w-6 h-6 text-primary mx-auto mb-2" />
                <div className="text-2xl font-heading font-bold">{sale.lotsCount}</div>
                <div className="text-xs text-muted-foreground">{sale.lotsCount > 1 ? "Lots" : "Lot"}</div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-card border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="font-heading">Informations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="w-4 h-4 text-primary mt-1 shrink-0" />
                <div>
                  <div className="text-sm font-medium">Début de la vente</div>
                  <div className="text-sm text-muted-foreground">{format(sale.dateStart, "dd/MM/yyyy HH:mm", { locale: fr })}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="w-4 h-4 text-primary mt-1 shrink-0 opacity-80" />
                <div>
                  <div className="text-sm font-medium">Fin de la vente</div>
                  <div className="text-sm text-muted-foreground">{sale.endDate ? format(new Date(sale.endDate), "dd/MM/yyyy HH:mm", { locale: fr }) : "Non définie"}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Settings className="w-4 h-4 text-primary mt-1 shrink-0" />
                <div>
                  <div className="text-sm font-medium">Fin des inscriptions</div>
                  <div className="text-sm text-muted-foreground">{format(sale.registrationDeadline, "dd/MM/yyyy HH:mm", { locale: fr })}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-primary mt-1 shrink-0" />
                <div>
                  <div className="text-sm font-medium">Lieu</div>
                  <div className="text-sm text-muted-foreground">{sale.location}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-4 h-4 text-primary mt-1 shrink-0" />
                <div>
                  <div className="text-sm font-medium">Frais d'inscription</div>
                  <div className="text-sm text-muted-foreground">{new Intl.NumberFormat('fr-FR').format(registrationFee)} €</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleEditSubmit}>
            <DialogHeader>
              <DialogTitle>Modifier la vente</DialogTitle>
              <DialogDescription>
                Mettez à jour les informations de la vente.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Titre de la vente</Label>
                <Input 
                  id="edit-title" 
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-date">Date et Heure (Début)</Label>
                <Input 
                  id="edit-date" 
                  type="datetime-local" 
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-endDate">Date et Heure (Fin)</Label>
                <Input 
                  id="edit-endDate" 
                  type="datetime-local" 
                  value={editEndDate}
                  onChange={(e) => setEditEndDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-regDeadline">Fin des inscriptions</Label>
                <Input 
                  id="edit-regDeadline" 
                  type="datetime-local" 
                  value={editRegDeadline}
                  onChange={(e) => setEditRegDeadline(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-location">Lieu</Label>
                <Input 
                  id="edit-location" 
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Input 
                  id="edit-description" 
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>Annuler</Button>
              <Button type="submit">Sauvegarder</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
