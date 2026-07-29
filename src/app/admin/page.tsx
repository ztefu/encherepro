"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Euro, Gavel, CalendarCheck } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useAdmin } from "@/context/AdminContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function DashboardPage() {
  const { sales, participants, selectedSaleId, setSelectedSaleId, dashboardStats, isLoading } = useAdmin();

  const stats = [
    {
      title: "Chiffre d'Affaires",
      value: `${dashboardStats.revenue.toLocaleString("fr-FR")} €`,
      icon: <Euro className="w-5 h-5 text-primary" />,
      change: "Généré par cette sélection",
    },
    {
      title: "Total Inscrits",
      value: dashboardStats.participants.toLocaleString("fr-FR"),
      icon: <Users className="w-5 h-5 text-primary" />,
      change: "Participants validés",
    },
    {
      title: "Ventes Publiées",
      value: selectedSaleId === "all" ? sales.length.toString() : "1",
      icon: <Gavel className="w-5 h-5 text-primary" />,
      change: "Sur la plateforme",
    },
    {
      title: "Lots Vendus",
      value: dashboardStats.lotsSold.toString(),
      icon: <CalendarCheck className="w-5 h-5 text-primary" />,
      change: `${dashboardStats.conversionRate}% de taux de conversion`,
    },
  ];

  // Filter registrations by selected sale
  const filteredRegistrations = selectedSaleId === "all" 
    ? participants 
    : participants.filter(r => r.saleId === selectedSaleId);

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

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight">Tableau de bord</h1>
          <p className="text-muted-foreground mt-1">Bienvenue sur votre espace d'administration.</p>
        </div>
        
        {/* Sale Filter */}
        <div className="w-full sm:w-[350px]">
          <Select value={selectedSaleId} onValueChange={(val) => val && setSelectedSaleId(val)}>
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

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, idx) => (
          <Card key={idx} className="bg-card border-border/50 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className="p-2 bg-primary/10 rounded-lg">
                {stat.icon}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-heading">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Registrations Table */}
      <Card className="bg-card border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="font-heading">Dernières inscriptions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                <tr>
                  <th className="px-6 py-4 font-medium rounded-tl-lg">Participant</th>
                  <th className="px-6 py-4 font-medium">Contact</th>
                  <th className="px-6 py-4 font-medium">Vente</th>
                  <th className="px-6 py-4 font-medium">Date d'inscription</th>
                  <th className="px-6 py-4 font-medium">Paiement</th>
                  <th className="px-6 py-4 font-medium rounded-tr-lg">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filteredRegistrations.slice(0, 5).map((reg) => (
                  <tr key={reg.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground">
                      {reg.firstName} {reg.lastName}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-muted-foreground">{reg.email}</span>
                        <span className="text-xs text-muted-foreground/70">{reg.phone}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-foreground">{reg.sale}</td>
                    <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                      {format(new Date(reg.date), "dd/MM/yyyy", { locale: fr })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getPaymentBadge(reg.paymentStatus)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getParticipationBadge(reg.participationStatus)}
                    </td>
                  </tr>
                ))}
                {filteredRegistrations.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                      Aucune inscription récente.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
