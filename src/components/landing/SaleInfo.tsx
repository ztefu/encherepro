"use client";

import { CalendarDays, MapPin, Euro, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { SALE_CONFIG } from "@/config/sale";

import { useAdmin } from "@/context/AdminContext";

export function SaleInfo() {
  const { registrationFee, sales } = useAdmin();
  
  const upcomingSales = sales
    .filter(s => s.status === "En cours" || s.status === "open")
    .sort((a, b) => new Date(a.isoDate).getTime() - new Date(b.isoDate).getTime());
  
  const upcomingSale = upcomingSales[0] || sales[0];

  let dateDisplay = SALE_CONFIG.DATE_DISPLAY_INFO;
  let locationDisplay = SALE_CONFIG.LOCATION;
  let exhibitionDisplay = SALE_CONFIG.EXHIBITION;

  if (upcomingSale) {
    const saleDate = new Date(upcomingSale.isoDate);
    // Format "15 Septembre 2026 à 18h00 (CET)"
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    const dateStr = saleDate.toLocaleDateString('fr-FR', options);
    const timeStr = saleDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }).replace(':', 'h');
    dateDisplay = `${dateStr} à ${timeStr} (CET)`;

    locationDisplay = upcomingSale.location || "En ligne";

    // Calculate exhibition: 4 days before sale
    const exhibStart = new Date(saleDate.getTime() - 5 * 24 * 60 * 60 * 1000);
    const exhibEnd = new Date(saleDate.getTime() - 1 * 24 * 60 * 60 * 1000);
    const startStr = exhibStart.getDate();
    const endStr = exhibEnd.getDate();
    const monthStr = exhibEnd.toLocaleDateString('fr-FR', { month: 'short' }).replace('.', '');
    exhibitionDisplay = `Sur rendez-vous du ${startStr} au ${endStr} ${monthStr}.`;
  }

  const infos = [
    {
      icon: <CalendarDays className="w-6 h-6 text-primary" />,
      title: "Date et Heure",
      desc: dateDisplay,
    },
    {
      icon: <MapPin className="w-6 h-6 text-primary" />,
      title: "Lieu",
      desc: locationDisplay,
    },
    {
      icon: <Euro className="w-6 h-6 text-primary" />,
      title: "Frais d'inscription",
      desc: `${registrationFee} € (Déductibles si achat)`,
    },
    {
      icon: <Info className="w-6 h-6 text-primary" />,
      title: "Exposition",
      desc: exhibitionDisplay,
    },
  ];

  return (
    <section id="la-vente" className="relative py-24">
      <div className="absolute inset-0 z-0 bg-cover bg-center bg-fixed" style={{ backgroundImage: "url('/lots/luxury_office.png')" }} />
      <div className="absolute inset-0 z-0 bg-background/80 backdrop-blur-sm" />
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-background to-transparent z-0 pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent z-0 pointer-events-none" />
      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.1 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">Informations de la vente</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Retrouvez tous les détails concernant l'organisation de cette vente privée d'exception.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {infos.map((info, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.1 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
            >
              <Card className="bg-card/50 border-border/50 hover:border-primary/50 transition-colors duration-300 h-full">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    {info.icon}
                  </div>
                  <h3 className="font-heading font-semibold text-lg mb-2">{info.title}</h3>
                  <p className="text-muted-foreground text-sm">{info.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
