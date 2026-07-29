"use client";

import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { 
  ArrowLeft, Edit, Mail, Download, ShieldCheck, CreditCard, 
  User, Phone, MapPin, History, CheckCircle, Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { use, useState, useEffect } from "react";
import { useAdmin } from "@/context/AdminContext";
import { useRouter, useSearchParams } from "next/navigation";

const generateSlug = (title: string) => title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export default function ParticipantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { participants, deleteParticipant, updateParticipantPayment, registrationFee, updateParticipantProfile } = useAdmin();
  const participantId = resolvedParams.id.slice(-36);
  const contextParticipant = participants.find(p => String(p.id) === participantId);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Auto-open edit modal if ?edit=true
  useEffect(() => {
    if (searchParams.get("edit") === "true") {
      setIsEditDialogOpen(true);
    }
  }, [searchParams]);

  // Edit form state
  const [editFirstName, setEditFirstName] = useState(contextParticipant?.firstName || "");
  const [editLastName, setEditLastName] = useState(contextParticipant?.lastName || "");
  const [editEmail, setEditEmail] = useState(contextParticipant?.email || "");
  const [editPhone, setEditPhone] = useState(contextParticipant?.phone || "");
  const [editCity, setEditCity] = useState(contextParticipant?.city || "");
  const [editAddress, setEditAddress] = useState(contextParticipant?.address || "");
  const [editPostalCode, setEditPostalCode] = useState(contextParticipant?.postalCode || "");
  const [isSaving, setIsSaving] = useState(false);

  if (!contextParticipant) {
    return <div className="p-8 text-center text-muted-foreground">Participant introuvable.</div>;
  }
  
  // Fusionner les données du contexte avec des valeurs par défaut pour les champs non gérés
  const participant = {
    ...contextParticipant,
    city: contextParticipant.city || "Non précisée",
    address: contextParticipant.address || "Non précisée",
    amountPaid: contextParticipant.paymentStatus === "paid" ? registrationFee : 0,
    paymentDate: contextParticipant.date,
    history: [
      { action: "Inscription soumise", date: contextParticipant.date },
    ]
  };

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case "paid": return <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20">Confirmé</Badge>;
      case "pending": return <Badge className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-amber-500/20">En attente</Badge>;
      case "failed": return <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20">Échoué</Badge>;
      default: return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  const handleDelete = async () => {
    await deleteParticipant(participant.id);
    setIsDeleteDialogOpen(false);
    router.push("/admin/inscriptions");
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const success = await updateParticipantProfile(participant.id, {
      firstName: editFirstName,
      lastName: editLastName,
      email: editEmail,
      phone: editPhone,
      city: editCity,
      address: editAddress,
      postalCode: editPostalCode,
    });
    setIsSaving(false);
    if (success) {
      setIsEditDialogOpen(false);
    }
  };

  const handleDownloadInvoice = () => {
    window.print();
  };

  return (
    <>
    <div className="space-y-8 max-w-6xl mx-auto print:hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link href="/admin/inscriptions">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
              Profil Participant
            </h1>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => setIsEditDialogOpen(true)}>
            <Edit className="w-4 h-4" /> Modifier
          </Button>
          <Button variant="outline" className="gap-2 text-red-500 hover:text-red-600 hover:bg-red-500/10 border-red-500/20" onClick={() => setIsDeleteDialogOpen(true)}>
            <Trash2 className="w-4 h-4" /> Supprimer
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Colonne Principale (Infos Perso & Historique) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Card Profil */}
          <Card className="bg-card border-border/50 shadow-sm overflow-hidden">
            <div className="h-24 bg-gradient-to-r from-primary/20 to-primary/5" />
            <div className="px-6 pb-6 relative">
              <div className="absolute -top-12 w-24 h-24 rounded-full border-4 border-card bg-muted flex items-center justify-center text-3xl font-heading font-bold text-primary">
                {participant.firstName[0]}{participant.lastName[0]}
              </div>
              <div className="mt-14">
                <h2 className="font-heading text-2xl font-bold text-foreground">
                  {participant.firstName} {participant.lastName}
                </h2>
                <div className="flex flex-wrap gap-4 mt-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="w-4 h-4" /> {participant.email}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="w-4 h-4" /> {participant.phone}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" /> {participant.city}, {participant.country}
                  </div>
                </div>
                <div className="mt-4 text-sm text-muted-foreground flex items-start gap-2">
                  <User className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>Adresse complète : {participant.address}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Vente Réservée */}
          <Card className="bg-card border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="font-heading">Vente ciblée</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border border-border/50 rounded-lg bg-muted/30">
                <div>
                  <h3 className="font-bold text-foreground">{participant.sale}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Inscrit le {format(participant.date, "dd MMMM yyyy à HH:mm", { locale: fr })}
                  </p>
                </div>
                <Link href={`/admin/ventes/${generateSlug(participant.sale)}-${participant.saleId}`}>
                  <Button variant="secondary" size="sm" className="gap-2">
                    Voir la vente <ArrowLeft className="w-4 h-4 rotate-180" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Historique */}
          <Card className="bg-card border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="font-heading flex items-center gap-2">
                <History className="w-5 h-5 text-primary" /> Historique d'activité
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {participant.history.map((item, idx) => (
                  <div key={idx} className="flex gap-4 relative">
                    {/* Ligne connectrice */}
                    {idx !== participant.history.length - 1 && (
                      <div className="absolute left-2.5 top-6 bottom-[-24px] w-px bg-border/50" />
                    )}
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5 z-10">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm">{item.action}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(item.date, "dd/MM/yyyy HH:mm", { locale: fr })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Colonne Latérale (Paiement & Actions) */}
        <div className="space-y-6">
          <Card className="bg-card border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="font-heading flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" /> Paiement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Statut</span>
                {getPaymentBadge(participant.paymentStatus)}
              </div>
              <Separator className="bg-border/50" />
              <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                <span className="text-sm font-medium">Montant payé</span>
                <span className="font-bold">{new Intl.NumberFormat('fr-FR').format(participant.amountPaid)} €</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Date de paiement</span>
                <span className="text-sm font-medium">{format(participant.paymentDate, "dd/MM/yyyy", { locale: fr })}</span>
              </div>
              
              <div className="pt-4 flex flex-col gap-3">
                <Button variant="outline" className="w-full gap-2 justify-start" onClick={handleDownloadInvoice}>
                  <Download className="w-4 h-4" /> Télécharger le reçu
                </Button>
                {participant.paymentStatus !== "paid" && (
                  <Button 
                    className="w-full gap-2 justify-start bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => updateParticipantPayment(participant.id, "paid")}
                  >
                    <CheckCircle className="w-4 h-4" /> Confirmer manuellement
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="font-heading flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" /> Accès Vente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Gérez les accès sécurisés à la plateforme de vente (ou le billet d'entrée).
              </p>
              <Button className="w-full gap-2 justify-start bg-blue-600 hover:bg-blue-700">
                <Mail className="w-4 h-4" /> Envoyer (ou renvoyer) les accès
              </Button>
            </CardContent>
          </Card>
        </div>

      </div>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-red-500 flex items-center gap-2">
              <Trash2 className="w-5 h-5" /> Confirmer la suppression
            </DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer définitivement le participant <strong>{participant.firstName} {participant.lastName}</strong> ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Oui, supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="font-heading">Modifier le profil</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom</Label>
                <Input id="firstName" value={editFirstName} onChange={e => setEditFirstName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nom</Label>
                <Input id="lastName" value={editLastName} onChange={e => setEditLastName(e.target.value)} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input id="phone" value={editPhone} onChange={e => setEditPhone(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Adresse</Label>
              <Input id="address" value={editAddress} onChange={e => setEditAddress(e.target.value)} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="postalCode">Code Postal</Label>
                <Input id="postalCode" value={editPostalCode} onChange={e => setEditPostalCode(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Ville</Label>
                <Input id="city" value={editCity} onChange={e => setEditCity(e.target.value)} required />
              </div>
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>

    {/* Vue d'impression (Reçu de Paiement) */}
    <div className="hidden print:block print-receipt">
      <div className="border-b-2 border-black pb-6 mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold font-heading uppercase tracking-tight">Reçu de Paiement</h1>
          <p className="text-gray-500 mt-2">EnchèrePro - Ventes Privées</p>
        </div>
        <div className="text-right">
          <p className="font-bold text-xl">N° {participant.id.toString().substring(0, 8).toUpperCase()}</p>
          <p className="text-gray-500">Date : {format(participant.paymentDate, "dd/MM/yyyy", { locale: fr })}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-12 mb-12">
        <div>
          <h3 className="font-bold text-gray-500 uppercase text-sm mb-2">Participant</h3>
          <p className="font-bold text-lg">{participant.firstName} {participant.lastName}</p>
          <p>{participant.address}</p>
          <p>{participant.postalCode} {participant.city}</p>
          <p>{participant.country}</p>
          <p className="mt-2">{participant.email}</p>
          <p>{participant.phone}</p>
        </div>
        <div>
          <h3 className="font-bold text-gray-500 uppercase text-sm mb-2">Détails de la transaction</h3>
          <p><strong>Vente concernée :</strong> {participant.sale}</p>
          <p><strong>Statut du paiement :</strong> {participant.paymentStatus === "paid" ? "Acquitté (Confirmé)" : "En attente / Non payé"}</p>
        </div>
      </div>

      <table className="w-full text-left border-collapse mb-12">
        <thead>
          <tr className="border-b-2 border-black">
            <th className="py-3 font-bold uppercase text-sm">Description</th>
            <th className="py-3 font-bold uppercase text-sm text-right">Montant</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-gray-200">
            <td className="py-4">Frais de dossier pour participation à la vente</td>
            <td className="py-4 text-right">{new Intl.NumberFormat('fr-FR').format(participant.amountPaid)} €</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td className="py-4 font-bold text-right text-lg">Total Payé</td>
            <td className="py-4 font-bold text-right text-lg">{new Intl.NumberFormat('fr-FR').format(participant.amountPaid)} €</td>
          </tr>
        </tfoot>
      </table>

      <div className="text-center text-gray-500 text-sm mt-16 pt-8 border-t border-gray-200">
        <p>Ceci est un reçu officiel généré électroniquement.</p>
        <p>Merci pour votre confiance - L'équipe EnchèrePro</p>
      </div>
    </div>
    </>
  );
}
